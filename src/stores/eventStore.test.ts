import { describe, it, expect, beforeEach, vi } from "vitest";
import type { PersonaEvent } from "@/lib/types";

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

const { useEventStore, MAX_REPLAY_RETRIES, ReplayLockedError } = await import("./eventStore");
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
    const e = event({ status: "failed" });
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
    const e = event({ status: "failed" });
    seed([e]);
    useEventStore.getState().transitionEvent(e.id, "processing");
    useEventStore.getState().transitionEvent(e.id, "processed");
    expect(useEventStore.getState().events[0].errorMessage).toBeNull();
  });
});

describe("replayEvent — the dead letter drains", () => {
  it("moves the ORIGINAL event to processed on a successful retry", async () => {
    const e = event({ status: "dead_letter" });
    seed([e]);
    await useEventStore.getState().replayEvent(e);
    expect(statusOf(e.id)).toBe("processed");
    expect(updateEvent).toHaveBeenCalledWith(e.id, { status: "processed" });
  });

  it("publishes the replayed event onto the bus and appends it", async () => {
    const e = event({ status: "failed" });
    seed([e]);
    await useEventStore.getState().replayEvent(e);
    expect(publishEvent).toHaveBeenCalledTimes(1);
    expect(useEventStore.getState().events).toHaveLength(2);
  });

  it("lands a failed attempt back in `failed` while retry budget remains", async () => {
    publishEvent.mockRejectedValue(new Error("bus down"));
    const e = event({ status: "failed" });
    seed([e]);
    await expect(useEventStore.getState().replayEvent(e)).rejects.toThrow("Replay failed");
    expect(statusOf(e.id)).toBe("failed");
    expect(useEventStore.getState().retryCounts[e.id]).toBe(1);
  });

  it("dead-letters the attempt that exhausts the retry budget", async () => {
    publishEvent.mockRejectedValue(new Error("bus down"));
    const e = event({ status: "failed" });
    seed([e]);
    for (let i = 0; i < MAX_REPLAY_RETRIES; i++) {
      await expect(useEventStore.getState().replayEvent(e)).rejects.toThrow();
    }
    expect(statusOf(e.id)).toBe("dead_letter");
    expect(useEventStore.getState().retryCounts[e.id]).toBe(MAX_REPLAY_RETRIES);
  });

  it("parks a replay-locked event in the dead letter instead of only throwing", async () => {
    const e = event({ status: "failed" });
    seed([e]);
    useEventStore.setState({ retryCounts: { [e.id]: MAX_REPLAY_RETRIES } });
    await expect(useEventStore.getState().replayEvent(e)).rejects.toThrow(ReplayLockedError);
    expect(statusOf(e.id)).toBe("dead_letter");
  });

  it("rejects retrying an event that is not in a retryable state", async () => {
    const e = event({ status: "processed" });
    seed([e]);
    await expect(useEventStore.getState().replayEvent(e)).rejects.toThrow(
      IllegalEventTransitionError,
    );
    expect(publishEvent).not.toHaveBeenCalled();
  });

  it("clears the replaying flag on both outcomes", async () => {
    const ok = event({ status: "dead_letter" });
    seed([ok]);
    await useEventStore.getState().replayEvent(ok);
    expect(useEventStore.getState().replayingIds.size).toBe(0);

    publishEvent.mockRejectedValue(new Error("bus down"));
    const bad = event({ status: "failed" });
    seed([bad]);
    await expect(useEventStore.getState().replayEvent(bad)).rejects.toThrow();
    expect(useEventStore.getState().replayingIds.size).toBe(0);
  });
});

describe("replayEvents — bulk goes through the same path", () => {
  it("drains every selected dead-letter row", async () => {
    const events = [event(), event(), event()];
    seed(events);
    const result = await useEventStore.getState().replayEvents(events);
    expect(result).toMatchObject({ succeeded: 3, failed: 0, skipped: 0, aborted: false });
    for (const e of events) expect(statusOf(e.id)).toBe("processed");
  });

  it("skips locked rows and parks them in the dead letter", async () => {
    const locked = event({ status: "failed" });
    const fresh = event({ status: "failed" });
    seed([locked, fresh]);
    useEventStore.setState({ retryCounts: { [locked.id]: MAX_REPLAY_RETRIES } });
    const result = await useEventStore.getState().replayEvents([locked, fresh]);
    expect(result.skipped).toBe(1);
    expect(result.succeeded).toBe(1);
    expect(statusOf(locked.id)).toBe("dead_letter");
    expect(statusOf(fresh.id)).toBe("processed");
  });

  it("skips rows that are not in a retryable state at all", async () => {
    const done = event({ status: "processed" });
    seed([done]);
    const result = await useEventStore.getState().replayEvents([done]);
    expect(result).toMatchObject({ succeeded: 0, failed: 0, skipped: 1 });
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

  it("discards in bulk and reports what it skipped", async () => {
    const a = event();
    const b = event({ status: "failed" });
    const done = event({ status: "processed" });
    seed([a, b, done]);
    const result = await useEventStore.getState().discardEvents([a, b, done]);
    expect(result).toMatchObject({ succeeded: 2, failed: 0, skipped: 1 });
    expect(statusOf(a.id)).toBe("discarded");
    expect(statusOf(b.id)).toBe("discarded");
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
    useEventStore.setState({ retryCounts: { x: 2 }, discardingIds: new Set(["x"]) });
    useEventStore.getState().reset();
    const s = useEventStore.getState();
    expect(s.events).toHaveLength(0);
    expect(s.retryCounts).toEqual({});
    expect(s.replayingIds.size).toBe(0);
    expect(s.discardingIds.size).toBe(0);
  });
});
