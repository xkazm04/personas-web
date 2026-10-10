import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { PersonaEvent, PersonaEventSubscription } from "@/lib/types";

const publishEvent = vi.fn();
const updateEvent = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    listEvents: vi.fn(async () => []),
    publishEvent: (...args: unknown[]) => publishEvent(...args),
    updateEvent: (...args: unknown[]) => updateEvent(...args),
    listAllSubscriptions: vi.fn(async () => []),
  },
}));

vi.mock("swr", () => ({ mutate: vi.fn() }));

const { useEventStore, MAX_MANUAL_RETRIES, ReplayLockedError, selectVisibleEvents } = await import("./eventStore");
const { COMMIT_WINDOW_MS, transition } = await import("@/lib/review-ledger");
type EventVerdict = import("./eventStore").EventVerdict;
const { IllegalEventTransitionError } = await import("@/lib/eventStatusFsm");

let seq = 0;

function event(overrides: Partial<PersonaEvent> = {}): PersonaEvent {
  seq += 1;
  return {
    id: `ev-${seq}`,
    projectId: "p",
    eventType: "webhook_received",
    sourceType: "github",
    sourceId: "acme/frontend",
    targetPersonaId: null,
    payload: null,
    status: "dead_letter",
    errorMessage: "Handler timed out",
    processedAt: null,
    useCaseId: null,
    createdAt: new Date(0).toISOString(),
    retryCount: 0,
    ...overrides,
  };
}

function seed(events: PersonaEvent[]) {
  useEventStore.setState({ events, eventIds: new Set(events.map((e) => e.id)) });
}

function statusOf(id: string) {
  return useEventStore.getState().events.find((e) => e.id === id)?.status;
}

beforeEach(() => {
  useEventStore.getState().reset();
  publishEvent.mockReset();
  updateEvent.mockReset();
  publishEvent.mockImplementation(async () => event({ id: `ev-published-${Date.now()}-${Math.random()}`, status: "pending" }));
  updateEvent.mockImplementation(async (id: string, body: { status: string }) => ({ id, ...body }));
});

describe("transitionEvent", () => {
  it("writes the new status onto the event in the buffer", () => {
    const e = event({ status: "pending" });
    seed([e]);
    useEventStore.getState().transitionEvent(e.id, "processing");
    expect(statusOf(e.id)).toBe("processing");
  });

  it("refuses an illegal move and leaves the store untouched", () => {
    const e = event({ status: "processed" });
    seed([e]);
    expect(() => useEventStore.getState().transitionEvent(e.id, "failed")).toThrow(
      IllegalEventTransitionError,
    );
    expect(statusOf(e.id)).toBe("processed");
  });

  it("is a no-op for an id the buffer does not hold", () => {
    seed([]);
    expect(useEventStore.getState().transitionEvent("nope", "processing")).toBeNull();
  });

  it("clears the error message when an event finally succeeds", async () => {
    const e = event({ status: "pending" });
    seed([e]);
    useEventStore.getState().transitionEvent(e.id, "processing");
    useEventStore.getState().transitionEvent(e.id, "processed");
    expect(useEventStore.getState().events[0].errorMessage).toBeNull();
  });
});

describe("replayEvent — the dead letter drains", () => {
  it("re-queues the ORIGINAL row to pending and counts the retry on it", async () => {
    const e = event({ status: "dead_letter" });
    seed([e]);
    await useEventStore.getState().replayEvent(e);
    expect(statusOf(e.id)).toBe("pending");
    expect(updateEvent).toHaveBeenCalledWith(e.id, { status: "pending", retryCount: 1 });
    expect(publishEvent).not.toHaveBeenCalled();
  });

  it("rolls the row back when the write fails, leaving the count unspent", async () => {
    updateEvent.mockRejectedValue(new Error("bus down"));
    const e = event({ status: "dead_letter", retryCount: 2 });
    seed([e]);
    await expect(useEventStore.getState().replayEvent(e)).rejects.toThrow("Replay failed");
    expect(useEventStore.getState().events[0]).toEqual(e);
  });

  it("refuses a failed row: the auto-retry engine owns it", async () => {
    const e = event({ status: "failed" });
    seed([e]);
    await expect(useEventStore.getState().replayEvent(e)).rejects.toThrow(IllegalEventTransitionError);
    expect(updateEvent).not.toHaveBeenCalled();
  });

  it("locks a row that spent the desktop's manual budget", async () => {
    const e = event({ status: "dead_letter", retryCount: MAX_MANUAL_RETRIES });
    seed([e]);
    await expect(useEventStore.getState().replayEvent(e)).rejects.toThrow(ReplayLockedError);
    expect(statusOf(e.id)).toBe("dead_letter");
  });

  it("leaves an unknown count (null) to the backend's own cap", async () => {
    const e = event({ status: "dead_letter", retryCount: null });
    seed([e]);
    await useEventStore.getState().replayEvent(e);
    expect(updateEvent).toHaveBeenCalledWith(e.id, { status: "pending", retryCount: 1 });
  });

  it("rejects retrying an event that is not in a retryable state", async () => {
    const e = event({ status: "processed" });
    seed([e]);
    await expect(useEventStore.getState().replayEvent(e)).rejects.toThrow(
      IllegalEventTransitionError,
    );
    expect(updateEvent).not.toHaveBeenCalled();
  });

  it("clears the replaying flag on both outcomes", async () => {
    const ok = event({ status: "dead_letter" });
    seed([ok]);
    await useEventStore.getState().replayEvent(ok);
    expect(useEventStore.getState().replayingIds.size).toBe(0);

    updateEvent.mockRejectedValue(new Error("bus down"));
    const bad = event({ status: "dead_letter" });
    seed([bad]);
    await expect(useEventStore.getState().replayEvent(bad)).rejects.toThrow();
    expect(useEventStore.getState().replayingIds.size).toBe(0);
  });
});

describe("replayEvents — bulk goes through the same path, and names every row", () => {
  it("re-queues every selected dead-letter row and returns their ids", async () => {
    const events = [event(), event(), event()];
    seed(events);
    const result = await useEventStore.getState().replayEvents(events.map((e) => e.id));
    expect(result).toEqual({ succeeded: events.map((e) => e.id), failed: [], aborted: false });
    for (const e of events) expect(statusOf(e.id)).toBe("pending");
  });

  it("reports a locked row as retry_exhausted and leaves it in the dead letter", async () => {
    const locked = event({ retryCount: MAX_MANUAL_RETRIES });
    const fresh = event();
    seed([locked, fresh]);
    const result = await useEventStore.getState().replayEvents([locked.id, fresh.id]);
    expect(result.failed).toEqual([{ id: locked.id, reason: "retry_exhausted" }]);
    expect(result.succeeded).toEqual([fresh.id]);
    expect(statusOf(locked.id)).toBe("dead_letter");
    expect(statusOf(fresh.id)).toBe("pending");
  });

  it("reports rows the FSM will not retry as wrong_status and unknown ids as not_found", async () => {
    const done = event({ status: "processed" });
    const failing = event({ status: "failed" });
    seed([done, failing]);
    const result = await useEventStore.getState().replayEvents([done.id, failing.id, "gone"]);
    expect(result).toEqual({
      succeeded: [],
      failed: [
        { id: done.id, reason: "wrong_status" },
        { id: failing.id, reason: "wrong_status" },
        { id: "gone", reason: "not_found" },
      ],
      aborted: false,
    });
    expect(updateEvent).not.toHaveBeenCalled();
  });

  it("a write that fails is write_failed; the breaker names the rows it never attempted", async () => {
    updateEvent.mockRejectedValue(new Error("bus down"));
    const events = Array.from({ length: 12 }, () => event());
    seed(events);
    const result = await useEventStore.getState().replayEvents(events.map((e) => e.id));
    expect(result.aborted).toBe(true);
    expect(result.succeeded).toEqual([]);
    expect(result.failed.filter((f) => f.reason === "write_failed").length).toBeGreaterThanOrEqual(5);
    expect(result.failed.map((f) => f.id).sort()).toEqual(events.map((e) => e.id).sort());
    expect(result.failed.some((f) => f.reason === "aborted")).toBe(true);
  });
});

describe("discard — the operator's verdict", () => {
  it("moves a dead-lettered event to discarded", async () => {
    const e = event();
    seed([e]);
    await useEventStore.getState().discardEvent(e);
    expect(statusOf(e.id)).toBe("discarded");
    expect(updateEvent).toHaveBeenCalledWith(e.id, { status: "discarded" });
  });

  it("refuses to discard an event that already succeeded", async () => {
    const e = event({ status: "processed" });
    seed([e]);
    await expect(useEventStore.getState().discardEvent(e)).rejects.toThrow(
      IllegalEventTransitionError,
    );
    expect(updateEvent).not.toHaveBeenCalled();
  });

  it("discards in bulk and names each row it could not discard", async () => {
    const a = event();
    const b = event({ status: "failed" });
    const done = event({ status: "processed" });
    seed([a, b, done]);
    const result = await useEventStore.getState().discardEvents([a.id, b.id, done.id]);
    expect(result).toEqual({
      succeeded: [a.id],
      failed: [
        { id: b.id, reason: "wrong_status" },
        { id: done.id, reason: "wrong_status" },
      ],
      aborted: false,
    });
    expect(statusOf(a.id)).toBe("discarded");
    expect(statusOf(b.id)).toBe("failed");
    expect(statusOf(done.id)).toBe("processed");
  });

  it("clears the discarding flag when the api rejects", async () => {
    updateEvent.mockRejectedValue(new Error("nope"));
    const e = event();
    seed([e]);
    await expect(useEventStore.getState().discardEvent(e)).rejects.toThrow();
    expect(useEventStore.getState().discardingIds.size).toBe(0);
    expect(statusOf(e.id)).toBe("dead_letter");
  });
});

describe("behaviours the FSM must not regress", () => {
  it("still dedupes appended events by id", () => {
    const e = event();
    seed([]);
    useEventStore.getState().appendEvent(e);
    useEventStore.getState().appendEvent(e);
    expect(useEventStore.getState().events).toHaveLength(1);
  });

  it("reset() still clears the replay slice", () => {
    seed([event()]);
    useEventStore.setState({ replayingIds: new Set(["y"]), discardingIds: new Set(["x"]) });
    useEventStore.getState().reset();
    const s = useEventStore.getState();
    expect(s.events).toHaveLength(0);
    expect(s.replayingIds.size).toBe(0);
    expect(s.discardingIds.size).toBe(0);
  });

  it("a 501 from the list read sets listNotServed and keeps the rows; a success clears it; another error leaves it", async () => {
    const { api } = await import("@/lib/api");
    const { ApiError } = await import("@/lib/api-error");
    const list = api.listEvents as unknown as ReturnType<typeof vi.fn>;
    const kept = event({ status: "pending" });
    seed([kept]);
    list.mockRejectedValueOnce(new ApiError(501, "{}"));
    await useEventStore.getState().fetchEvents();
    expect(useEventStore.getState().listNotServed).toBe(true);
    expect(useEventStore.getState().events.map((e) => e.id)).toEqual([kept.id]);
    list.mockRejectedValueOnce(new ApiError(500, "boom"));
    await useEventStore.getState().fetchEvents();
    expect(useEventStore.getState().listNotServed).toBe(true);
    list.mockResolvedValueOnce([]);
    await useEventStore.getState().fetchEvents();
    expect(useEventStore.getState().listNotServed).toBe(false);
    list.mockRejectedValueOnce(new Error("network"));
    await useEventStore.getState().fetchEvents();
    expect(useEventStore.getState().listNotServed).toBe(false);
  });

  it("a 501 from the subscription read sets subscriptionsNotServed and keeps the rows; a success clears it; another error leaves it; reset clears it", async () => {
    const { api } = await import("@/lib/api");
    const { ApiError } = await import("@/lib/api-error");
    const list = api.listAllSubscriptions as unknown as ReturnType<typeof vi.fn>;
    const kept = { id: "s1", personaId: "p1", eventType: "x", enabled: true } as unknown as PersonaEventSubscription;
    useEventStore.setState({ subscriptions: [kept], subscriptionsNotServed: false });
    list.mockRejectedValueOnce(new ApiError(501, "{}"));
    await useEventStore.getState().fetchSubscriptions();
    expect(useEventStore.getState().subscriptionsNotServed).toBe(true);
    expect(useEventStore.getState().subscriptions.map((s) => s.id)).toEqual(["s1"]);
    list.mockRejectedValueOnce(new ApiError(500, "boom"));
    await useEventStore.getState().fetchSubscriptions();
    expect(useEventStore.getState().subscriptionsNotServed).toBe(true);
    list.mockResolvedValueOnce([]);
    await useEventStore.getState().fetchSubscriptions();
    expect(useEventStore.getState().subscriptionsNotServed).toBe(false);
    list.mockRejectedValueOnce(new Error("network"));
    await useEventStore.getState().fetchSubscriptions();
    expect(useEventStore.getState().subscriptionsNotServed).toBe(false);
    list.mockRejectedValueOnce(new ApiError(501, "{}"));
    await useEventStore.getState().fetchSubscriptions();
    expect(useEventStore.getState().subscriptionsNotServed).toBe(true);
    useEventStore.getState().reset();
    expect(useEventStore.getState().subscriptionsNotServed).toBe(false);
  });

  it("subscriptionsRead is false until a fetch succeeds, survives a 501 or 500, and reset clears it", async () => {
    const { api } = await import("@/lib/api");
    const { ApiError } = await import("@/lib/api-error");
    const list = api.listAllSubscriptions as unknown as ReturnType<typeof vi.fn>;
    expect(useEventStore.getState().subscriptionsRead).toBe(false);
    list.mockRejectedValueOnce(new ApiError(501, "{}"));
    await useEventStore.getState().fetchSubscriptions();
    expect(useEventStore.getState().subscriptionsRead).toBe(false);
    list.mockResolvedValueOnce([]);
    await useEventStore.getState().fetchSubscriptions();
    expect(useEventStore.getState().subscriptionsRead).toBe(true);
    list.mockRejectedValueOnce(new ApiError(501, "{}"));
    await useEventStore.getState().fetchSubscriptions();
    expect(useEventStore.getState().subscriptionsRead).toBe(true);
    list.mockRejectedValueOnce(new ApiError(500, "boom"));
    await useEventStore.getState().fetchSubscriptions();
    expect(useEventStore.getState().subscriptionsRead).toBe(true);
    useEventStore.getState().reset();
    expect(useEventStore.getState().subscriptionsRead).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Challenge event-B: the operator's verdict is undoable. A retry or discard is
// ARMED through the shared commit-window ledger (review-ledger.ts, generic over
// its verdict) and written only when the 5 s window closes. The old contract,
// where a click wrote at once, is forbidden below.
// ---------------------------------------------------------------------------

describe("dead-letter verdicts go through the commit window", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    useEventStore.getState().flushDecisions();
    vi.useRealTimers();
  });

  it("arm discard [a,b] opens a 5 s window with no write; undo drops it without one", async () => {
    const t = transition<EventVerdict>({ window: null, inFlight: [], nextBatchId: 1 }, {
      type: "arm",
      ids: ["a", "b"],
      verdict: "discard",
      now: 0,
    });
    expect(t.state.window?.deadline).toBe(COMMIT_WINDOW_MS);
    expect(COMMIT_WINDOW_MS).toBe(5000);
    expect(t.effects.some((e) => e.type === "schedule")).toBe(true);
    expect(t.effects.some((e) => e.type === "commit")).toBe(false);
    const undone = transition(t.state, { type: "undo", batchId: t.state.window!.batchId });
    expect(undone.state.window).toBeNull();
    expect(undone.effects.some((e) => e.type === "commit")).toBe(false);

    const a = event();
    const b = event();
    seed([a, b]);
    expect(useEventStore.getState().decide([a.id, b.id], "discard")).toBe(true);
    expect(useEventStore.getState().ledger.window?.deadline).toBe(5000);
    useEventStore.getState().undoDecision();
    expect(useEventStore.getState().ledger.window).toBeNull();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(updateEvent).toHaveBeenCalledTimes(0);
    expect(statusOf(a.id)).toBe("dead_letter");
  });

  it("a disjoint arm commits the open window; an overlapping arm is refused", async () => {
    const one = transition<EventVerdict>({ window: null, inFlight: [], nextBatchId: 1 }, {
      type: "arm",
      ids: ["a"],
      verdict: "discard",
      now: 0,
    });
    const two = transition(one.state, { type: "arm", ids: ["c"], verdict: "retry", now: 1 });
    expect(two.effects).toContainEqual({ type: "commit", batch: one.state.window });
    expect(two.state.window).toMatchObject({ ids: ["c"], verdict: "retry" });
    expect(transition(two.state, { type: "arm", ids: ["a"], verdict: "retry", now: 2 }).refused).toEqual({
      reason: "overlap",
    });

    const a = event();
    const c = event();
    seed([a, c]);
    const store = useEventStore.getState();
    expect(store.decide([a.id], "discard")).toBe(true);
    expect(store.decide([c.id], "retry")).toBe(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(updateEvent).toHaveBeenCalledWith(a.id, { status: "discarded" });
    expect(updateEvent).toHaveBeenCalledTimes(1);
    expect(useEventStore.getState().ledger.window).toMatchObject({ ids: [c.id], verdict: "retry" });
    expect(useEventStore.getState().decide([c.id], "discard")).toBe(false);
    expect(useEventStore.getState().refusal).toMatchObject({ reason: "overlap" });
  });

  it("a poll that still shows a row dead_letter cannot repaint a pending discard", async () => {
    const { api } = await import("@/lib/api");
    const list = api.listEvents as unknown as ReturnType<typeof vi.fn>;
    const a = event();
    seed([a]);
    useEventStore.getState().decide([a.id], "discard");
    list.mockResolvedValueOnce([{ ...a }]);
    await useEventStore.getState().fetchEvents();
    const visible = selectVisibleEvents(useEventStore.getState());
    expect(visible.find((e) => e.id === a.id)?.status).toBe("discarded");
    expect(updateEvent).not.toHaveBeenCalled();
  });

  it("the window is committed, not dropped, on flush (unmount / pagehide)", async () => {
    const a = event();
    seed([a]);
    useEventStore.getState().decide([a.id], "retry");
    useEventStore.getState().flushDecisions();
    await vi.advanceTimersByTimeAsync(0);
    expect(updateEvent).toHaveBeenCalledTimes(1);
    expect(updateEvent).toHaveBeenCalledWith(a.id, { status: "pending", retryCount: 1 });
    expect(statusOf(a.id)).toBe("pending");
  });

  it("forbids the old contract: no write before the deadline, exactly one at it", async () => {
    const a = event();
    seed([a]);
    useEventStore.getState().decide([a.id], "discard");
    await vi.advanceTimersByTimeAsync(COMMIT_WINDOW_MS - 1);
    expect(updateEvent).not.toHaveBeenCalled();
    expect(statusOf(a.id)).toBe("dead_letter");
    await vi.advanceTimersByTimeAsync(1);
    expect(updateEvent).toHaveBeenCalledTimes(1);
    expect(statusOf(a.id)).toBe("discarded");
  });

  it("a commit with failures is reported per row, with the ids to reselect", async () => {
    const locked = event({ retryCount: MAX_MANUAL_RETRIES });
    const fresh = event();
    seed([locked, fresh]);
    useEventStore.getState().decide([locked.id, fresh.id], "retry");
    await vi.advanceTimersByTimeAsync(COMMIT_WINDOW_MS);
    expect(useEventStore.getState().lastOutcome).toMatchObject({
      verb: "retry",
      ok: 1,
      failedByReason: { retry_exhausted: [locked.id] },
      reselect: [locked.id],
    });
    expect(useEventStore.getState().ledger.inFlight).toEqual([]);
  });
});

describe("one door: no surface calls a retry/discard verb directly", () => {
  const SRC = path.resolve(__dirname, "..");
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const p = path.join(dir, name);
      return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(name) && !/\.test\.ts$/.test(name) ? [p] : [];
    });
  it("only the event store calls replayEvent(s) / discardEvent(s)", () => {
    const roots = ["components", "app", "hooks"].map((d) => path.join(SRC, d));
    const offenders = roots
      .flatMap(walk)
      .filter((f) => /\b(replayEvents?|discardEvents?)\(/.test(readFileSync(f, "utf8")));
    expect(offenders.map((f) => path.relative(SRC, f))).toEqual([]);
  });
});
