import { describe, expect, it } from "vitest";
import { canEventTransition, isEventDiscardable, isEventRetryable } from "./eventStatusFsm";
import { fromWireEventStatus } from "./eventWireStatus";

/**
 * Literal copy of the desktop's `PersonaEventStatus::can_transition_to`,
 * ../personas/src-tauri/core/src/models/event.rs:108-128
 * (last commit touching that file: 9114813ea72ce3ea5bd95cbf3da04ada78cb674d).
 * Re-copy it when the desktop matrix changes; do not derive it from web code.
 */
const DESKTOP_STATUSES = [
  "pending",
  "processing",
  "delivered",
  "completed",
  "skipped",
  "failed",
  "dead_letter",
  "discarded",
] as const;

const DESKTOP_TRANSITIONS: ReadonlyArray<readonly [string, string]> = [
  // Normal processing flow
  ["pending", "processing"],
  // Terminal outcomes from processing
  ["processing", "delivered"],
  ["processing", "completed"],
  ["processing", "skipped"],
  ["processing", "failed"],
  // Direct terminal shortcuts (mock/seed events, instant processing)
  ["pending", "delivered"],
  ["pending", "completed"],
  ["pending", "failed"],
  ["pending", "skipped"],
  // Retry / DLQ flow
  ["failed", "dead_letter"],
  ["failed", "pending"], // auto-retry re-queue
  ["dead_letter", "pending"], // manual retry
  ["dead_letter", "discarded"], // manual discard
];

function desktopAllows(from: string, to: string): boolean {
  return DESKTOP_TRANSITIONS.some(([f, t]) => f === from && t === to);
}

describe("event FSM - desktop parity (acceptance case 2)", () => {
  it("agrees with the desktop on every pair that projects to distinct web statuses", () => {
    for (const from of DESKTOP_STATUSES) {
      for (const to of DESKTOP_STATUSES) {
        const pf = fromWireEventStatus(from);
        const pt = fromWireEventStatus(to);
        expect(pf, from).not.toBeNull();
        expect(pt, to).not.toBeNull();
        if (pf === pt) continue;
        expect(canEventTransition(pf!, pt!), `${from} -> ${to}`).toBe(desktopAllows(from, to));
      }
    }
  });

  it("names the edges the hand-written table got wrong", () => {
    expect(canEventTransition("dead_letter", "pending")).toBe(true);
    expect(canEventTransition("failed", "discarded")).toBe(false);
    expect(canEventTransition("processing", "pending")).toBe(false);
  });
});

describe("operator verbs - dead_letter only (acceptance case 3)", () => {
  it("offers neither retry nor discard on failed: the auto-retry engine owns it", () => {
    expect(isEventRetryable("failed")).toBe(false);
    expect(isEventDiscardable("failed")).toBe(false);
  });

  it("offers both on dead_letter, where the desktop accepts them", () => {
    expect(isEventRetryable("dead_letter")).toBe(true);
    expect(isEventDiscardable("dead_letter")).toBe(true);
  });
});
