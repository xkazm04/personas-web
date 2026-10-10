import type { EventStatus } from "./types";
import { DESKTOP_EVENT_TRANSITIONS, fromWireEventStatus } from "./eventWireStatus";

const ALL_EVENT_STATUSES: readonly EventStatus[] = [
  "pending",
  "processing",
  "processed",
  "skipped",
  "failed",
  "dead_letter",
  "discarded",
];

function projectDesktopMatrix(): Record<EventStatus, readonly EventStatus[]> {
  const table = Object.fromEntries(ALL_EVENT_STATUSES.map((s) => [s, [] as EventStatus[]])) as Record<
    EventStatus,
    EventStatus[]
  >;
  for (const [from, to] of DESKTOP_EVENT_TRANSITIONS) {
    const f = fromWireEventStatus(from);
    const t = fromWireEventStatus(to);
    if (!f || !t || f === t || table[f].includes(t)) continue;
    table[f].push(t);
  }
  return table;
}

/**
 * The event delivery state machine: the desktop's
 * `PersonaEventStatus::can_transition_to` projected onto the web vocabulary
 * (`eventWireStatus.ts`). It was hand-written before and had drifted — it
 * offered `failed -> discarded`, `processing -> pending` and an operator retry
 * from `failed`, none of which the desktop accepts. Deriving it means the web
 * cannot offer a move the backend would refuse; the parity test pins the
 * desktop pairs from an independent copy.
 *
 *   pending      queued                           -> processing, processed, skipped, failed
 *   processing   claimed by the bus               -> processed, skipped, failed
 *   processed    delivered (terminal)
 *   skipped      no matching subscriber (terminal)
 *   failed       owned by the auto-retry engine   -> pending (auto re-queue)
 *                                                 -> dead_letter (auto budget spent)
 *   dead_letter  waits for the operator           -> pending (manual retry, same row)
 *                                                 -> discarded (manual discard)
 *   discarded    operator verdict (terminal)
 */
export const EVENT_STATUS_TRANSITIONS: Readonly<Record<EventStatus, readonly EventStatus[]>> =
  projectDesktopMatrix();

/** Statuses no transition can leave. */
export const TERMINAL_EVENT_STATUSES: ReadonlySet<EventStatus> = new Set<EventStatus>(
  ALL_EVENT_STATUSES.filter((s) => EVENT_STATUS_TRANSITIONS[s].length === 0),
);

/**
 * Statuses that offer the operator's retry / discard verbs. Only
 * `dead_letter`: the desktop's DLQ commands run `WHERE status = 'dead_letter'`
 * (events.rs RETRY_DLQ_SQL / DISCARD_DLQ_SQL) and answer `wrong_status` for
 * anything else. A `failed` row belongs to the auto-retry engine, which
 * re-queues it or escalates it to the dead letter.
 */
export const RESOLVABLE_EVENT_STATUSES: ReadonlySet<EventStatus> = new Set<EventStatus>([
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
 * Where a failed delivery attempt lands: back in `failed` while the auto-retry
 * budget still has room, otherwise in the dead letter — the desktop's
 * `increment_retry_or_dead_letter` CASE. `attempts` is the count *including*
 * the attempt that just failed.
 */
export function statusAfterFailedAttempt(
  attempts: number,
  maxRetries: number,
): Extract<EventStatus, "failed" | "dead_letter"> {
  return attempts >= maxRetries ? "dead_letter" : "failed";
}
