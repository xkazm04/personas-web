import { describe, it, expect } from "vitest";
import type { EventStatus } from "./types";
import {
  assertEventTransition,
  canEventTransition,
  EVENT_STATUS_TRANSITIONS,
  IllegalEventTransitionError,
  isEventDiscardable,
  isEventRetryable,
  isTerminalEventStatus,
  statusAfterFailedAttempt,
  TERMINAL_EVENT_STATUSES,
} from "./eventStatusFsm";

const ALL: EventStatus[] = [
  "pending",
  "processing",
  "processed",
  "skipped",
  "failed",
  "dead_letter",
  "discarded",
];

describe("event status FSM — the transition table", () => {
  it("covers every status exactly once", () => {
    expect(Object.keys(EVENT_STATUS_TRANSITIONS).sort()).toEqual([...ALL].sort());
  });

  it("never names a status that is not in the machine", () => {
    for (const targets of Object.values(EVENT_STATUS_TRANSITIONS)) {
      for (const target of targets) expect(ALL).toContain(target);
    }
  });

  it("allows exactly the desktop's transitions, projected onto the web vocabulary", () => {
    const legal: Array<[EventStatus, EventStatus]> = [
      ["pending", "processing"],
      ["pending", "processed"],
      ["pending", "skipped"],
      ["pending", "failed"],
      ["processing", "processed"],
      ["processing", "skipped"],
      ["processing", "failed"],
      ["failed", "pending"],
      ["failed", "dead_letter"],
      ["dead_letter", "pending"],
      ["dead_letter", "discarded"],
    ];
    for (const [from, to] of legal) {
      expect(canEventTransition(from, to)).toBe(true);
    }
    // Everything else is illegal — enumerated rather than spot-checked, so a
    // future edge added to the table has to be added here too.
    const legalKeys = new Set(legal.map(([f, t]) => `${f}->${t}`));
    for (const from of ALL) {
      for (const to of ALL) {
        if (legalKeys.has(`${from}->${to}`)) continue;
        expect(canEventTransition(from, to)).toBe(false);
      }
    }
  });

  it("makes terminal statuses genuinely terminal", () => {
    for (const status of TERMINAL_EVENT_STATUSES) {
      expect(EVENT_STATUS_TRANSITIONS[status]).toHaveLength(0);
      expect(isTerminalEventStatus(status)).toBe(true);
    }
    expect(isTerminalEventStatus("dead_letter")).toBe(false);
  });
});

describe("assertEventTransition", () => {
  it("passes a legal move through silently", () => {
    expect(() => assertEventTransition("dead_letter", "pending")).not.toThrow();
  });

  it("rejects resurrecting a discarded event", () => {
    expect(() => assertEventTransition("discarded", "processing")).toThrow(
      IllegalEventTransitionError,
    );
  });

  it("rejects re-failing an event that already succeeded", () => {
    expect(() => assertEventTransition("processed", "failed")).toThrow(
      IllegalEventTransitionError,
    );
  });

  it("rejects retrying a pending event that was never claimed as failed", () => {
    expect(() => assertEventTransition("pending", "dead_letter")).toThrow(
      IllegalEventTransitionError,
    );
  });

  it("carries the offending pair on the error", () => {
    try {
      assertEventTransition("discarded", "processed");
      throw new Error("expected a throw");
    } catch (err) {
      expect(err).toBeInstanceOf(IllegalEventTransitionError);
      const e = err as IllegalEventTransitionError;
      expect(e.from).toBe("discarded");
      expect(e.to).toBe("processed");
      expect(e.name).toBe("IllegalEventTransitionError");
    }
  });
});

describe("operator verbs", () => {
  it("offers retry and discard exactly on the dead letter", () => {
    expect(isEventRetryable("dead_letter")).toBe(true);
    expect(isEventDiscardable("dead_letter")).toBe(true);
    for (const status of ["pending", "processing", "processed", "skipped", "failed", "discarded"] as EventStatus[]) {
      expect(isEventRetryable(status)).toBe(false);
      expect(isEventDiscardable(status)).toBe(false);
    }
  });
});

describe("statusAfterFailedAttempt — the retry budget has a destination", () => {
  it("keeps a retryable failure in `failed` while budget remains", () => {
    expect(statusAfterFailedAttempt(1, 3)).toBe("failed");
    expect(statusAfterFailedAttempt(2, 3)).toBe("failed");
  });

  it("dead-letters the attempt that exhausts the budget", () => {
    expect(statusAfterFailedAttempt(3, 3)).toBe("dead_letter");
    expect(statusAfterFailedAttempt(4, 3)).toBe("dead_letter");
  });

  it("dead-letters immediately when there is no budget at all", () => {
    expect(statusAfterFailedAttempt(1, 0)).toBe("dead_letter");
  });

  it("always stays in `failed` or lands where the FSM can reach from it", () => {
    for (const attempts of [1, 2, 3, 4, 99]) {
      const landing = statusAfterFailedAttempt(attempts, 3);
      expect(landing === "failed" || canEventTransition("failed", landing)).toBe(true);
    }
  });
});
