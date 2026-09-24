import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PersonaEvent } from "@/lib/types";

const listEvents = vi.fn();
const updateEvent = vi.fn();
vi.mock("@/lib/api", () => ({ api: { listEvents, updateEvent } }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));
vi.mock("@/stores/personaStore", () => ({ usePersonaStore: { getState: () => ({ personas: [] }) } }));

const { useReviewStore } = await import("./reviewStore");
type Store = ReturnType<typeof useReviewStore.getState> & Record<string, unknown>;
const store = () => useReviewStore.getState() as Store;

function ev(id: string, severity: string, minutesOld: number, status: PersonaEvent["status"] = "pending"): PersonaEvent {
  return {
    id,
    projectId: "p",
    eventType: "manual_review",
    sourceType: "execution",
    sourceId: null,
    targetPersonaId: null,
    payload: JSON.stringify({ title: id, severity }),
    status,
    errorMessage: null,
    processedAt: null,
    useCaseId: null,
    createdAt: new Date(Date.now() - minutesOld * 60_000).toISOString(),
  };
}

async function load(events: PersonaEvent[]) {
  listEvents.mockResolvedValueOnce(events);
  await store().fetchReviews();
}

beforeEach(() => {
  listEvents.mockReset();
  updateEvent.mockReset();
  updateEvent.mockResolvedValue({});
  useReviewStore.getState().reset();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("reviewStore guards (unchanged behaviour)", () => {
  it("resolveReview maps approved->processed and rejected->failed", async () => {
    await load([ev("r1", "critical", 1), ev("r2", "critical", 1)]);
    await store().resolveReview("r1", "approved");
    await store().resolveReview("r2", "rejected", "nope");
    expect(updateEvent).toHaveBeenNthCalledWith(1, "r1", {
      status: "processed",
      metadata: JSON.stringify({ resolvedBy: "System" }),
    });
    expect(updateEvent).toHaveBeenNthCalledWith(2, "r2", {
      status: "failed",
      metadata: JSON.stringify({ reviewerNotes: "nope", resolvedBy: "System" }),
    });
    expect(store().pendingReviewCount).toBe(0);
  });

  it("escalation auto-approve writes immediately (machine actor, not windowed)", async () => {
    await load([ev("old", "info", 24 * 60)]);
    useReviewStore.setState({ escalationEnabled: true });
    await store().checkEscalations();
    expect(updateEvent).toHaveBeenCalledWith("old", {
      status: "processed",
      metadata: JSON.stringify({ reviewerNotes: "Auto-approved: SLA expired", resolvedBy: "System" }),
    });
    expect(store().reviews[0].status).toBe("approved");
  });

  it("fetchReviews drops an out-of-order response", async () => {
    let releaseFirst: (v: PersonaEvent[]) => void = () => {};
    listEvents.mockReturnValueOnce(new Promise((r) => (releaseFirst = r)));
    const first = store().fetchReviews();
    listEvents.mockResolvedValueOnce([ev("new", "critical", 1)]);
    await store().fetchReviews();
    releaseFirst([ev("old", "critical", 1)]);
    await first;
    expect(store().reviews.map((r) => r.id)).toEqual(["new"]);
  });
});

describe("reviewStore decision ledger", () => {
  it("decide defers the write 5s and carries the draft notes", async () => {
    vi.useFakeTimers();
    await load([ev("r1", "critical", 1)]);
    (store().setDraft as (id: string, t: string) => void)("r1", "unsafe");
    (store().decide as (ids: string[], v: string) => void)(["r1"], "rejected");
    expect(updateEvent).not.toHaveBeenCalled();
    expect(store().reviews[0].status).toBe("rejected");
    expect(store().pendingReviewCount).toBe(0);
    await vi.advanceTimersByTimeAsync(5000);
    expect(updateEvent).toHaveBeenCalledWith("r1", {
      status: "failed",
      metadata: JSON.stringify({ reviewerNotes: "unsafe", resolvedBy: "You" }),
    });
  });

  it("undo cancels the window: no write, row pending again", async () => {
    vi.useFakeTimers();
    await load([ev("r1", "critical", 1)]);
    (store().decide as (ids: string[], v: string) => void)(["r1"], "approved");
    (store().undoDecision as () => void)();
    await vi.advanceTimersByTimeAsync(6000);
    expect(updateEvent).not.toHaveBeenCalled();
    expect(store().reviews[0].status).toBe("pending");
    expect(store().pendingReviewCount).toBe(1);
  });

  it("teardown flush commits the open window immediately", async () => {
    await load([ev("r1", "critical", 1)]);
    (store().decide as (ids: string[], v: string) => void)(["r1"], "approved");
    (store().flushDecisions as () => void)();
    await vi.waitFor(() => expect(updateEvent).toHaveBeenCalledWith("r1", { status: "processed", metadata: JSON.stringify({ resolvedBy: "You" }) }));
  });

  it("a poll landing mid-window cannot repaint the verdict", async () => {
    vi.useFakeTimers();
    await load([ev("r1", "critical", 1), ev("r2", "critical", 1)]);
    (store().decide as (ids: string[], v: string) => void)(["r1"], "approved");
    await load([ev("r1", "critical", 1), ev("r2", "critical", 1)]);
    expect(store().reviews.find((r) => r.id === "r1")?.status).toBe("approved");
    expect(store().pendingReviewCount).toBe(1);
  });

  it("a failed write returns the row to pending and reports it", async () => {
    vi.useFakeTimers();
    await load([ev("r1", "critical", 1), ev("r2", "critical", 1)]);
    updateEvent.mockImplementation(async (id: string) => {
      if (id === "r2") throw new Error("500");
      return {};
    });
    (store().decide as (ids: string[], v: string) => void)(["r1", "r2"], "approved");
    await vi.advanceTimersByTimeAsync(5000);
    await vi.waitFor(() => expect(store().lastResult).not.toBeNull());
    expect(store().reviews.map((r) => r.status)).toEqual(["approved", "pending"]);
    expect((store().lastResult as { failedIds: string[] }).failedIds).toEqual(["r2"]);
    expect(store().pendingReviewCount).toBe(1);
  });
});
