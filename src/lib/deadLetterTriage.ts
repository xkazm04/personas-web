/**
 * Dead-letter triage, pure. The operator clears a dead letter by cause, not
 * row by row (registry delivery-guarantees: dead-letter-design, "cluster by
 * failure story"), and a bulk verb must say which rows it could not resolve
 * and why ("report partial failure"). Nothing here touches React or the store.
 */
import type { PersonaEvent } from "./types";

/**
 * Why a row was not resolved. The first three are the desktop's per-id DLQ
 * reasons (events.rs bulk retry/discard, `BulkDeadLetterOutcome`); the store
 * adds `write_failed` (the write itself did not land) and `aborted` (the
 * circuit breaker stopped the run before the row was tried).
 */
export type DeadLetterFailureReason = "not_found" | "retry_exhausted" | "wrong_status" | "write_failed" | "aborted";

export interface DeadLetterFailure {
  id: string;
  reason: DeadLetterFailureReason;
}

/** The signature of a row with no recorded reason. No message can produce it. */
export const NO_REASON_SIGNATURE = "\u0000no-reason";

/**
 * A failure story with its volatile parts stripped: quoted names, uuids,
 * hosts and file names, ids that mix letters and digits, and every number
 * except an HTTP status code. Two deliveries that failed for the same reason
 * share a signature even when their timings, ids or hosts differ.
 */
export function failureSignature(message: string | null): string {
  if (!message || !message.trim()) return NO_REASON_SIGNATURE;
  return message
    .toLowerCase()
    // A quote opens only after a space or bracket, so "persona's" is not one.
    .replace(/(^|[\s([])(["'`])[^"'`]*\2/g, "$1<q>")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g, "<id>")
    .replace(/\b(?:[a-z0-9_-]+\.)+[a-z][a-z0-9_-]*\b/g, "<host>")
    .replace(/\b\d+(?:\.\d+)?(?=[a-z]{1,3}\b)/g, "<n>")
    .replace(/\b(?=[a-z_-]*\d)(?=[\d_-]*[a-z])[a-z0-9_-]{3,}\b/g, "<id>")
    .replace(/\b\d+(?:\.\d+)?\b/g, (n) => (/^[1-5]\d\d$/.test(n) ? n : "<n>"))
    // Punctuation and dashes (ASCII or typographic) carry no cause.
    .replace(/[^a-z0-9<>]+/g, " ")
    .trim();
}

export interface FailureCluster {
  signature: string;
  /** The first row's message, shown as the cause; null for "no reason recorded". */
  sample: string | null;
  ids: string[];
}

/** Dead letters grouped by failure story, largest cohort first (ties keep lane order). */
export function clusterByFailure(
  events: readonly Pick<PersonaEvent, "id" | "errorMessage">[],
): FailureCluster[] {
  const bySignature = new Map<string, FailureCluster>();
  for (const e of events) {
    const signature = failureSignature(e.errorMessage);
    const cluster = bySignature.get(signature);
    if (cluster) cluster.ids.push(e.id);
    else bySignature.set(signature, { signature, sample: e.errorMessage?.trim() || null, ids: [e.id] });
  }
  return [...bySignature.values()].sort((a, b) => b.ids.length - a.ids.length);
}

export interface OutcomeSummary {
  ok: number;
  failedByReason: Partial<Record<DeadLetterFailureReason, string[]>>;
  /** Every row that did not resolve, in run order: one click selects them again. */
  reselect: string[];
}

export function summarizeOutcome(outcome: {
  succeeded: readonly string[];
  failed: readonly DeadLetterFailure[];
}): OutcomeSummary {
  const failedByReason: Partial<Record<DeadLetterFailureReason, string[]>> = {};
  for (const f of outcome.failed) (failedByReason[f.reason] ??= []).push(f.id);
  return { ok: outcome.succeeded.length, failedByReason, reselect: outcome.failed.map((f) => f.id) };
}
