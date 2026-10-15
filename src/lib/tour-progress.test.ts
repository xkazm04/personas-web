import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PersonaEvent } from "@/lib/types";

/**
 * The dashboard tour's progression (S2): each step ends on the visitor's own
 * action, signalled from where it already happens. The review step is driven
 * here by the real review store (its 5 s undo window and commit), and the
 * Board step by the real stage world, so the timings below are the product's.
 */

const listEvents = vi.fn();
const updateEvent = vi.fn();
vi.mock("@/lib/api", async () => {
  const { verdictEventBody } = await import("@/lib/commands/reviewDecide");
  type Input = { reviewId: string; decision: "approved" | "rejected"; resolvedBy: string; notes: string | null };
  const decideReview = (i: Input) => updateEvent(i.reviewId, verdictEventBody(i.decision, i.resolvedBy, i.notes));
  return { api: { listEvents, updateEvent, decideReview } };
});
vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));
vi.mock("@/stores/personaStore", () => ({ usePersonaStore: { getState: () => ({ personas: [] }) } }));

const { useReviewStore } = await import("@/stores/reviewStore");
const { DASHBOARD_TOUR_STEPS } = await import("./tour-script");
const { emitTourSignal, onTourSignal } = await import("./tourSignals");
const { createFleetWorld } = await import("@/components/dashboard/fleet-monitor/world/fleetWorld");
const { SEND_MS, ACK_MS } = await import("@/components/dashboard/fleet-monitor/board/useCommands");
const progress = await import("./tour-progress");
const { SIGNAL_BEAT_MS, NO_TALLY, armStepDwell, armStepSignal, clipAdvances, outcomeOf, tallySignal } = progress;
type StepOutcome = import("./tour-progress").StepOutcome;

const step = (id: string) => {
  const s = DASHBOARD_TOUR_STEPS.find((x) => x.id === id);
  if (!s) throw new Error(`no step ${id}`);
  return s;
};
const isLast = (id: string) => DASHBOARD_TOUR_STEPS[DASHBOARD_TOUR_STEPS.length - 1].id === id;

/** Arm a step the way TourContext does (its signal, its dwell); record how it ended. */
function runStep(id: string) {
  const s = step(id);
  const outcomes: (StepOutcome | { type: "dwell" })[] = [];
  const disarmSignal = armStepSignal(s, (signal) => outcomes.push(outcomeOf(s, isLast(id), signal)));
  const disarmDwell = armStepDwell(s, () => outcomes.push({ type: "dwell" }));
  return {
    outcomes,
    /** "Keep looking" / exit: the context drops the step's arms. */
    leave: () => {
      disarmSignal();
      disarmDwell();
    },
  };
}

function ev(id: string, sourceId: string | null): PersonaEvent {
  return {
    id,
    projectId: "p",
    eventType: "manual_review",
    sourceType: "execution",
    sourceId,
    targetPersonaId: null,
    payload: JSON.stringify({ title: id, severity: "critical" }),
    status: "pending",
    errorMessage: null,
    processedAt: null,
    useCaseId: null,
    createdAt: new Date(Date.now() - 60_000).toISOString(),
    retryCount: 0,
  };
}

async function loadReviews(events: PersonaEvent[]) {
  listEvents.mockResolvedValueOnce(events);
  await useReviewStore.getState().fetchReviews();
}

beforeEach(() => {
  vi.useFakeTimers();
  listEvents.mockReset();
  updateEvent.mockReset();
  updateEvent.mockResolvedValue({});
  useReviewStore.getState().reset();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("the review step ends on the visitor's committed verdict", () => {
  it("does not advance on dwell or the clip while no verdict has committed", async () => {
    const run = runStep("reviews");
    expect(step("reviews").waitForSignal).toBe(true);
    expect(clipAdvances(step("reviews"))).toBe(false);
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(run.outcomes).toEqual([]);
    run.leave();
  });

  it("advances within 1 s of the verdict committing, and opens that review's run", async () => {
    await loadReviews([ev("r1", "exec-r1"), ev("r2", "exec-r2")]);
    const run = runStep("reviews");
    useReviewStore.getState().decide(["r1"], "approved");
    // Pending inside the undo window: the verdict is not the operator's yet.
    await vi.advanceTimersByTimeAsync(4_999);
    expect(run.outcomes).toEqual([]);
    // The window closes at 5 s and commits; the step must be done within 1 s of it.
    await vi.advanceTimersByTimeAsync(1 + 1_000);
    expect(run.outcomes).toEqual([{ type: "finish", href: "/dashboard/executions?focus=exec-r1" }]);
    expect(updateEvent).toHaveBeenCalledWith("r1", expect.anything());
    run.leave();
  });

  it("an undo inside the 5 s window leaves the tour on the step", async () => {
    await loadReviews([ev("r1", "exec-r1")]);
    const run = runStep("reviews");
    useReviewStore.getState().decide(["r1"], "rejected");
    await vi.advanceTimersByTimeAsync(2_000);
    useReviewStore.getState().undoDecision();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(run.outcomes).toEqual([]);
    expect(updateEvent).not.toHaveBeenCalled();
    expect(useReviewStore.getState().reviews[0].status).toBe("pending");
    run.leave();
  });

  it("Keep looking ends the tour with no verdict: nothing decided, nothing advanced", async () => {
    await loadReviews([ev("r1", "exec-r1")]);
    const run = runStep("reviews");
    run.leave();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(run.outcomes).toEqual([]);
    expect(useReviewStore.getState().ledger.window).toBeNull();
    expect(updateEvent).not.toHaveBeenCalled();
    // A verdict made after the tour ended is not the tour's: the arms are gone.
    useReviewStore.getState().decide(["r1"], "approved");
    await vi.advanceTimersByTimeAsync(6_000);
    expect(run.outcomes).toEqual([]);
  });

  it("a review with no run finishes the tour without a link", () => {
    expect(outcomeOf(step("reviews"), true, { kind: "verdict", reviewId: "r9", verdict: "approved", executionId: null })).toEqual({
      type: "finish",
      href: null,
    });
  });
});

describe("the Board step ends on a command the machine applied", () => {
  it("advances a beat after a landed agent command, not on a fleet-wide one", async () => {
    const run = runStep("board");
    emitTourSignal({ kind: "command", verb: "pauseAll", agentId: null });
    await vi.advanceTimersByTimeAsync(SIGNAL_BEAT_MS * 2);
    expect(run.outcomes).toEqual([]);

    const world = createFleetWorld(99);
    world.commands.send({ verb: "resume", agentId: "p094" });
    await vi.advanceTimersByTimeAsync(SEND_MS + ACK_MS);
    expect(run.outcomes).toEqual([]); // the beat: the visitor sees the board change first
    await vi.advanceTimersByTimeAsync(SIGNAL_BEAT_MS);
    expect(run.outcomes).toEqual([{ type: "next" }]);
    world.dispose();
    run.leave();
  });

  it("falls back to its dwell for a visitor who only watches", async () => {
    const run = runStep("board");
    await vi.advanceTimersByTimeAsync(step("board").dwellMs - 1);
    expect(run.outcomes).toEqual([]);
    await vi.advanceTimersByTimeAsync(1);
    expect(run.outcomes).toEqual([{ type: "dwell" }]);
    run.leave();
  });
});

describe("signal matchers", () => {
  it("Mission Control completes when a lamp opens, not on arriving at the wall", () => {
    const on = step("mission").advanceOn!;
    expect(on({ kind: "view", view: "home", focus: null })).toBe(false);
    expect(on({ kind: "view", view: "home", focus: "queue" })).toBe(true);
    expect(on({ kind: "view", view: "sla", focus: "br_1" })).toBe(false);
  });

  it("Health completes when the Slack outage's cause is fixed", () => {
    const on = step("health").advanceOn!;
    expect(on({ kind: "causeFixed", causeKey: "slack-circuit-break" })).toBe(true);
    expect(on({ kind: "causeFixed", causeKey: "other" })).toBe(false);
    expect(on({ kind: "verdict", reviewId: "r1", verdict: "approved", executionId: null })).toBe(false);
  });

  it("a step without advanceOn arms no signal", () => {
    const onMatch = vi.fn();
    const disarm = armStepSignal({ dwellMs: 1000 }, onMatch);
    emitTourSignal({ kind: "causeFixed", causeKey: "slack-circuit-break" });
    expect(onMatch).not.toHaveBeenCalled();
    disarm();
  });
});

describe("the recap counts what the visitor did", () => {
  it("commands landed match the Board's command log; refused or undone ones do not count", async () => {
    let tally = NO_TALLY;
    const stop = onTourSignal((s) => {
      tally = tallySignal(tally, s);
    });
    const world = createFleetWorld(99);
    world.commands.send({ verb: "resume", agentId: "p094" });
    world.commands.send({ verb: "pause", agentId: "p063" });
    const held = world.commands.send({ verb: "approve", agentId: "p004", rid: "nope" }, true);
    world.commands.undo(held);
    await vi.advanceTimersByTimeAsync(10_000);
    const done = world.store.getState().cmds.filter((c) => c.status === "done").length;
    expect(done).toBeGreaterThan(0);
    expect(tally.commands).toBe(done);
    expect(tally.verdicts).toBe(0);
    world.dispose();
    stop();
  });
});
