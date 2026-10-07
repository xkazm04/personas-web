import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PersonaEvent } from "@/lib/types";
import type { InflightCommand } from "@/lib/commands/commandReducer";

/**
 * The live (supabase) plane's review verdicts (PLAN M20, PHASE2-SPEC.md 1.6):
 * the commit step sends one `review_decide` per id through the command plane
 * and waits for its outcome. The plane is faked here: `api.decideReview`
 * answers with a command id, and `settleCommand` with the command as it ended.
 */

const listEvents = vi.fn();
const updateEvent = vi.fn();
const decideReview = vi.fn();
const settleCommand = vi.fn();
vi.mock("@/lib/api", () => ({ api: { listEvents, updateEvent, decideReview } }));
vi.mock("@/stores/commandStore", () => ({ settleCommand }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));
vi.mock("@/stores/personaStore", () => ({ usePersonaStore: { getState: () => ({ personas: [] }) } }));

const { useReviewStore } = await import("./reviewStore");
const store = () => useReviewStore.getState();

function ev(id: string, over: { severity?: string; minutesOld?: number; deviceId?: string; status?: PersonaEvent["status"] } = {}): PersonaEvent {
  return {
    id,
    projectId: "p",
    eventType: "manual_review",
    sourceType: "manual_review",
    sourceId: "exec-1",
    targetPersonaId: "persona-1",
    payload: JSON.stringify({ title: id, severity: over.severity ?? "critical", ...(over.deviceId ? { deviceId: over.deviceId } : {}) }),
    status: over.status ?? "pending",
    errorMessage: null,
    processedAt: null,
    useCaseId: null,
    createdAt: new Date(Date.now() - (over.minutesOld ?? 1) * 60_000).toISOString(),
  };
}

function settled(id: string, status: InflightCommand["status"], error: string | null = null): InflightCommand {
  return { id, verb: "review_decide", personaId: "persona-1", status, result: null, error, requestedAt: 0, expiresAt: 0 };
}

async function load(events: PersonaEvent[]) {
  listEvents.mockResolvedValueOnce(events);
  await store().fetchReviews();
}

const row = (id: string) => store().reviews.find((r) => r.id === id)!;

async function idle() {
  await vi.waitFor(() => {
    expect(store().ledger.window).toBeNull();
    expect(store().ledger.inFlight).toHaveLength(0);
  });
}

beforeEach(() => {
  listEvents.mockReset();
  updateEvent.mockReset();
  decideReview.mockReset();
  settleCommand.mockReset();
  let n = 0;
  decideReview.mockImplementation(async () => ({ commandId: `cmd-${++n}` }));
  settleCommand.mockImplementation(async (id: string) => settled(id, "completed"));
  store().reset();
  useReviewStore.setState({ escalationFailure: null });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("reviewStore on a command plane (M20)", () => {
  it("the undo window stays in front of the send; then one review_decide per id, targeted at the review's desktop", async () => {
    vi.useFakeTimers();
    await load([ev("r1", { deviceId: "desk-A" }), ev("r2")]);
    store().setDraft("r1", "looks right");
    store().decide(["r1", "r2"], "approved");
    await vi.advanceTimersByTimeAsync(4_999);
    expect(decideReview).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    vi.useRealTimers();
    await idle();
    expect(decideReview).toHaveBeenCalledTimes(2);
    expect(decideReview).toHaveBeenCalledWith({
      reviewId: "r1",
      personaId: "persona-1",
      deviceId: "desk-A",
      decision: "approved",
      notes: "looks right",
      resolvedBy: "You",
    });
    expect(decideReview).toHaveBeenCalledWith(expect.objectContaining({ reviewId: "r2", deviceId: null, notes: null }));
    expect(updateEvent).not.toHaveBeenCalled();
    expect(row("r1").status).toBe("approved");
    expect(store().reviewCommands.r1).toMatch(/^cmd-/);
    expect(store().lastResult).toBeNull();
  });

  it("undo inside the window sends nothing", async () => {
    vi.useFakeTimers();
    await load([ev("r1")]);
    store().decide(["r1"], "rejected");
    store().undoDecision();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(decideReview).not.toHaveBeenCalled();
    expect(row("r1").status).toBe("pending");
  });

  it("a failed, refused or expired command is a failed id: the row is pending again and reported", async () => {
    await load([ev("r1"), ev("r2"), ev("r3"), ev("r4")]);
    const outcomes: Record<string, [InflightCommand["status"], string | null]> = {
      r1: ["failed", "not_found"],
      r2: ["rejected", "controller_revoked"],
      r3: ["expired", "expired: desktop did not pick it up"],
      r4: ["completed", null],
    };
    decideReview.mockImplementation(async (input: { reviewId: string }) => ({ commandId: `cmd-${input.reviewId}` }));
    settleCommand.mockImplementation(async (id: string) => {
      const [status, error] = outcomes[id.replace("cmd-", "")];
      return settled(id, status, error);
    });
    store().decide(["r1", "r2", "r3", "r4"], "approved");
    store().flushDecisions();
    await idle();
    expect(store().lastResult).toMatchObject({ total: 4, successCount: 1, status: "approved" });
    expect([...store().lastResult!.failedIds].sort()).toEqual(["r1", "r2", "r3"]);
    expect(["r1", "r2", "r3"].map((id) => row(id).status)).toEqual(["pending", "pending", "pending"]);
    expect(row("r4").status).toBe("approved");
  });

  it("a command the plane lost (reset before it settled) is a failure, not a verdict", async () => {
    await load([ev("r1")]);
    settleCommand.mockResolvedValueOnce(null);
    store().decide(["r1"], "approved");
    store().flushDecisions();
    await idle();
    expect(store().lastResult?.failedIds).toEqual(["r1"]);
    expect(row("r1").status).toBe("pending");
  });

  it("success stays decided while the synced row lags behind the command, then the mirror is the truth", async () => {
    await load([ev("r1")]);
    store().decide(["r1"], "rejected");
    store().flushDecisions();
    await idle();
    // The desktop applied it; its sync pass has not pushed the row yet.
    await load([ev("r1")]);
    expect(row("r1")).toMatchObject({ status: "rejected", resolvedBy: "You" });
    // Synced: the mirror says rejected, and who decided is still you.
    await load([ev("r1", { status: "failed" })]);
    expect(row("r1")).toMatchObject({ status: "rejected", resolvedBy: "You" });
    expect(store().pendingReviewCount).toBe(0);
  });

  it("a direct plane (the orchestrator) answers with the event: no command to follow", async () => {
    decideReview.mockResolvedValue({ ...ev("r1"), status: "processed" });
    await load([ev("r1")]);
    store().decide(["r1"], "approved");
    store().flushDecisions();
    await idle();
    expect(settleCommand).not.toHaveBeenCalled();
    expect(row("r1").status).toBe("approved");
    expect(store().reviewCommands.r1).toBeUndefined();
  });
});

describe("machine verdicts (escalation) on a command plane", () => {
  it("auto-approve is a review_decide as the system", async () => {
    await load([ev("old", { severity: "info", minutesOld: 24 * 60 })]);
    useReviewStore.setState({ escalationEnabled: true });
    await store().checkEscalations();
    expect(decideReview).toHaveBeenCalledWith(
      expect.objectContaining({ reviewId: "old", decision: "approved", resolvedBy: "System", notes: "Auto-approved: SLA expired" }),
    );
    expect(row("old")).toMatchObject({ status: "approved", resolvedBy: "System" });
    expect(store().escalationFailure).toBeNull();
  });

  it("with no paired controller it fails visibly, leaves the row pending, and does not resend on the next pass", async () => {
    settleCommand.mockImplementation(async (id: string) => settled(id, "failed", "controller_not_paired"));
    await load([ev("old", { severity: "info", minutesOld: 24 * 60 })]);
    useReviewStore.setState({ escalationEnabled: true });
    await expect(store().checkEscalations()).resolves.toBeUndefined();
    expect(store().escalationFailure).toEqual({ reviewId: "old", reason: "controller_not_paired" });
    expect(row("old").status).toBe("pending");
    await store().checkEscalations();
    expect(decideReview).toHaveBeenCalledTimes(1);
  });

  it("resolveReview itself rejects with the reason", async () => {
    settleCommand.mockImplementation(async (id: string) => settled(id, "rejected", "controller_revoked"));
    await load([ev("r1")]);
    await expect(store().resolveReview("r1", "approved")).rejects.toThrow("controller_revoked");
    expect(row("r1").status).toBe("pending");
  });
});
