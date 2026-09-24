/**
 * Display helpers for the Manual Review Queue: values the store writes as
 * stable sentinels (who resolved a review, the escalation's auto-approve note)
 * are mapped to the viewer's language at render, and ages are formatted with
 * `Intl` (no per-unit strings in the locales). Pure: no React, no `Date.now()`.
 */
import { formatDue } from "./review-sla";

/** `resolvedBy` for a verdict given by the person using this UI. */
export const RESOLVED_BY_REVIEWER = "You";
/** `resolvedBy` for a verdict the event feed reports as already decided, or an escalation. */
export const RESOLVED_BY_SYSTEM = "System";
/** Reviewer note `checkEscalations` persists on an auto-approved review. */
export const AUTO_APPROVE_NOTE = "Auto-approved: SLA expired";

/** Structural subset of `t.reviewsPage`. */
export interface ReviewDisplayCopy {
  resolver: { you: string; system: string };
  autoApprovedNote: string;
}

/** Who resolved a review, in the viewer's language; a real name passes through. */
export function resolverLabel(resolvedBy: string, copy: ReviewDisplayCopy): string {
  if (resolvedBy === RESOLVED_BY_REVIEWER) return copy.resolver.you;
  if (resolvedBy === RESOLVED_BY_SYSTEM) return copy.resolver.system;
  return resolvedBy;
}

/** Reviewer notes as shown: the machine note is translated, a human note is verbatim. */
export function reviewerNotesText(notes: string, copy: ReviewDisplayCopy): string {
  return notes === AUTO_APPROVE_NOTE ? copy.autoApprovedNote : notes;
}

const MINUTE_MS = 60_000;

/**
 * How long ago `iso` was, relative to `now`, via `Intl.RelativeTimeFormat`
 * ("16 minutes ago" / "vor 16 Minuten"). A future timestamp (clock skew) reads
 * as one minute ago; an unparseable one returns null.
 */
export function formatAge(
  iso: string,
  now: number,
  locale: string,
  style: Intl.RelativeTimeFormatStyle = "long",
): string | null {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return null;
  return formatDue(-Math.max(MINUTE_MS, now - at), locale, style);
}
