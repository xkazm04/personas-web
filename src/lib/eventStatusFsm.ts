import type { EventStatus } from "./types";

/**
 * The event delivery state machine.
 *
 * Before this existed, event status was an *implicit* convention: the store
 * incremented a retry counter and published a brand-new event, and nothing —
 * anywhere — ever wrote a status back onto the event that failed. The dead
 * letter lane was a display, not a destination: the operator watched the retry
 * badge climb next to a permanent `failed` badge until the button locked
 * itself, with no verb that resolved the row.
 *
 * The transitions below are the whole contract. `assertEventTransition` makes
 * an illegal move throw rather than silently corrupt the lane, so a future
 * caller cannot resurrect a discarded event or "retry" one that already
 * succeeded.
 *
 *   pending      queued, unclaimed                 -> processing
 *   processing   claimed by an identified holder   -> processed (done)
 *                                                  -> pending (requeued)
 *                                                  -> failed (retry budget left)
 *                                                  -> dead_letter (budget spent)
 *   processed    terminal success                  (terminal)
 *   failed       retryable failure                 -> processing (operator retry)
 *                                                  -> dead_letter (budget spent)
 *                                                  -> discarded (operator verdict)
 *   dead_letter  retries exhausted / permanent     -> processing (operator retry)
 *                                                  -> discarded (operator verdict)
 *   discarded    operator verdict                  (terminal)
 */
export const EVENT_STATUS_TRANSITIONS: Readonly<
  Record<EventStatus, readonly EventStatus[]>
> = {
  pending: ["processing"],
  processing: ["processed", "pending", "failed", "dead_letter"],
  processed: [],
  failed: ["processing", "dead_letter", "discarded"],
  dead_letter: ["processing", "discarded"],
  discarded: [],
};

/** Statuses no transition can leave. */
export const TERMINAL_EVENT_STATUSES: ReadonlySet<EventStatus> = new Set<EventStatus>([
  "processed",
  "discarded",
]);

/**
 * Statuses that sit in the operational dead-letter surface — the rows an
 * operator is expected to resolve by hand, and the only rows that offer the
 * retry / discard verbs.
 */
export const RESOLVABLE_EVENT_STATUSES: ReadonlySet<EventStatus> = new Set<EventStatus>([
  "failed",
  "dead_letter",
]);

export class IllegalEventTransitionError extends Error {
  readonly from: EventStatus;
  readonly to: EventStatus;
  constructor(from: EventStatus, to: EventStatus) {
    super(`Illegal event status transition: ${from} -> ${to}`);
    this.name = "IllegalEventTransitionError";
    this.from = from;
    this.to = to;
  }
}

export function canEventTransition(from: EventStatus, to: EventStatus): boolean {
  return EVENT_STATUS_TRANSITIONS[from].includes(to);
}

export function assertEventTransition(from: EventStatus, to: EventStatus): void {
  if (!canEventTransition(from, to)) throw new IllegalEventTransitionError(from, to);
}

export function isTerminalEventStatus(status: EventStatus): boolean {
  return TERMINAL_EVENT_STATUSES.has(status);
}

/** Can the operator retry this row? */
export function isEventRetryable(status: EventStatus): boolean {
  return RESOLVABLE_EVENT_STATUSES.has(status);
}

/** Can the operator discard this row? */
export function isEventDiscardable(status: EventStatus): boolean {
  return RESOLVABLE_EVENT_STATUSES.has(status);
}

/**
 * Where a failed delivery attempt lands: back in `failed` while the retry
 * budget still has room, otherwise in the dead letter. `attempts` is the count
 * *including* the attempt that just failed.
 */
export function statusAfterFailedAttempt(
  attempts: number,
  maxRetries: number,
): Extract<EventStatus, "failed" | "dead_letter"> {
  return attempts >= maxRetries ? "dead_letter" : "failed";
}
