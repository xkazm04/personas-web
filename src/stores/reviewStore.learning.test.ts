import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EventStatus, PersonaEvent } from "@/lib/types";
import type { InflightCommand } from "@/lib/commands/commandReducer";

/**
 * A verdict teaches only once it commits (tiger D4): the review queue holds it
 * in a 5 s undo window, and only the committed verdict is sent to the desktop,
 * whose `flip_status` writes the learned memory. Here the demo's real scripted
 * desktop (mockCommandPlane) answers the store's `review_decide`, so an undo
 * inside the window must leave MOCK_LEARNED_MEMORIES empty.
 */

const events: PersonaEvent[] = [];
const outcomes = new Map<string, Promise<InflightCommand>>();

const reviewsPort = {
  list: async () => events,
  update: async (id: string, body: { status: EventStatus }) => {
    const i = events.findIndex((e) => e.id === id);
    events[i] = { ...events[i], status: body.status };
    return events[i];
  },
};

const { runMockCommand } = await import("@/lib/commands/mockCommandPlane");

const decideReview = vi.fn(async (input: { reviewId: string; personaId: string; decision: string; notes: string | null }) => {
  const commandId = `cmd-${input.reviewId}-${decideReview.mock.calls.length}`;
  outcomes.set(
    commandId,
    new Promise((resolve) => {
      runMockCommand(
        { id: commandId, verb: "review_decide", personaId: input.personaId, params: { reviewId: input.reviewId, decision: input.decision, notes: input.notes } },
        (row) => {
          if (row.status === "executing") return;
          resolve({ id: commandId, verb: "review_decide", personaId: input.personaId, status: row.status, result: null, error: row.error_message ?? null, requestedAt: 0, expiresAt: 0 } as InflightCommand);
        },
        { isHidden: () => false, reviews: reviewsPort },
      );
    }),
  );
  return { commandId };
});

vi.mock("@/lib/api", () => ({ api: { listEvents: async () => events, updateEvent: vi.fn(), decideReview } }));
vi.mock("@/stores/commandStore", () => ({ settleCommand: (id: string) => outcomes.get(id) ?? Promise.resolve(null) }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));
vi.mock("@/stores/personaStore", () => ({ usePersonaStore: { getState: () => ({ personas: [] }) } }));

const { useReviewStore } = await import("./reviewStore");
const { MOCK_LEARNED_MEMORIES } = await import("@/lib/mock-dashboard-data");
const store = () => useReviewStore.getState();

function seed(): PersonaEvent {
  return {
    id: "ev-0004-mock",
    projectId: "p",
    eventType: "manual_review",
    sourceType: "execution",
    sourceId: "e-0002-mock",
    targetPersonaId: "p-0002-mock",
    payload: JSON.stringify({ title: "Proposed Incident Mitigation", description: "Restart the Redis pods", severity: "critical" }),
    status: "pending",
    errorMessage: null,
    processedAt: null,
    useCaseId: null,
    createdAt: new Date(Date.now() - 60_000).toISOString(),
    retryCount: 0,
  };
}

beforeEach(async () => {
  vi.useFakeTimers();
  events.splice(0, events.length, seed());
  outcomes.clear();
  decideReview.mockClear();
  MOCK_LEARNED_MEMORIES.length = 0;
  store().reset();
  await store().fetchReviews();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("a review verdict becomes learned memory only at commit", () => {
  it("an undo inside the 5 s window adds none", async () => {
    store().setDraft("ev-0004-mock", "canary first");
    store().decide(["ev-0004-mock"], "approved");
    await vi.advanceTimersByTimeAsync(4_000);
    store().undoDecision();
    await vi.advanceTimersByTimeAsync(20_000);
    expect(decideReview).not.toHaveBeenCalled();
    expect(MOCK_LEARNED_MEMORIES).toHaveLength(0);
  });

  it("left alone, the verdict commits after the window and writes exactly one memory", async () => {
    store().setDraft("ev-0004-mock", "canary first");
    store().decide(["ev-0004-mock"], "approved");
    await vi.advanceTimersByTimeAsync(4_999);
    expect(MOCK_LEARNED_MEMORIES).toHaveLength(0);
    // 5 s window, then the desktop's claim (1.2 s) and answer (2 s).
    await vi.advanceTimersByTimeAsync(1 + 2_500);
    expect(decideReview).toHaveBeenCalledTimes(1);
    expect(MOCK_LEARNED_MEMORIES).toHaveLength(1);
    expect(MOCK_LEARNED_MEMORIES[0]).toMatchObject({
      title: "Human approved: Proposed Incident Mitigation",
      sourceExecutionId: "e-0002-mock",
    });
    expect(MOCK_LEARNED_MEMORIES[0].content).toContain("Reviewer notes: canary first.");
  });
});
