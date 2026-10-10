import type { EventStatus } from "./types";

/**
 * The event status vocabulary on the wire, i.e. the desktop's
 * `PersonaEventStatus` (../personas src-tauri/core/src/models/event.rs:16-30,
 * `as_str` :58-69). The cloud sync mirror ships that string verbatim into
 * `synced_events.status` (src-tauri/src/cloud/sync/rows.rs:413), so this —
 * not the web's own union — is what the Supabase plane reads.
 */
export type WireEventStatus =
  | "pending"
  | "processing"
  | "delivered"
  | "completed"
  | "skipped"
  | "failed"
  | "dead_letter"
  | "discarded";

/**
 * Wire status -> web status. The desktop has two success terminals
 * (`delivered` is what production writes, `completed` what mocks and tests
 * write); the web shows both as `processed`. `processed` itself is accepted
 * too: older desktop tables still hold it.
 */
const WIRE_TO_WEB: Readonly<Record<WireEventStatus | "processed", EventStatus>> = {
  pending: "pending",
  processing: "processing",
  delivered: "processed",
  completed: "processed",
  processed: "processed",
  skipped: "skipped",
  failed: "failed",
  dead_letter: "dead_letter",
  discarded: "discarded",
};

/** The web status for a wire string, or null for one no desktop variant emits. */
export function fromWireEventStatus(status: string): EventStatus | null {
  return Object.prototype.hasOwnProperty.call(WIRE_TO_WEB, status) ? WIRE_TO_WEB[status as WireEventStatus] : null;
}

/**
 * The desktop's legal moves, `PersonaEventStatus::can_transition_to`
 * (event.rs:108-128). The web FSM is this matrix projected through
 * `fromWireEventStatus`; `eventStatusFsm.desktopParity.test.ts` holds an
 * independent copy of the desktop pairs and fails if the two drift.
 */
export const DESKTOP_EVENT_TRANSITIONS: ReadonlyArray<readonly [WireEventStatus, WireEventStatus]> = [
  ["pending", "processing"],
  ["processing", "delivered"],
  ["processing", "completed"],
  ["processing", "skipped"],
  ["processing", "failed"],
  ["pending", "delivered"],
  ["pending", "completed"],
  ["pending", "failed"],
  ["pending", "skipped"],
  ["failed", "dead_letter"],
  ["failed", "pending"], // auto-retry re-queue
  ["dead_letter", "pending"], // manual retry
  ["dead_letter", "discarded"], // manual discard
];

/** Desktop `MAX_MANUAL_RETRIES` (db/src/repos/communication/events.rs:1086). */
export const MAX_MANUAL_RETRIES = 5;

/** Desktop `DEFAULT_MAX_RETRIES`, the auto-retry budget (events.rs:837). */
export const AUTO_RETRY_LIMIT = 3;
