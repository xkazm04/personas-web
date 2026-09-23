/**
 * The review SLA rule — the ONE place that decides how close a pending manual
 * review is to its escalation deadline. The split pane's due order, the chips on
 * rows / detail / focus card, the page's overdue count, the focus walk and
 * `checkEscalations` all read it; nothing else multiplies `slaMinutes` (a source
 * scan in `review-sla.test.ts` enforces that).
 *
 * Pure: no React, timers or `Date.now()`. Every function takes `now` (epoch ms).
 *
 * Two clocks per severity:
 *
 * | Severity | Urgency threshold | Escalation SLA (default) |
 * |----------|-------------------|--------------------------|
 * | critical | 5 min             | 30 min                   |
 * | warning  | 30 min            | 240 min (4 h)            |
 * | info     | 120 min (2 h)     | 480 min (8 h)            |
 *
 * `ok` -> past the urgency threshold: `due-soon` -> past the SLA: `overdue`
 * (where escalation, if enabled, acts). The invariant `SLA >= urgency threshold`
 * is enforced by `validateEscalationPolicy` on every policy that enters the
 * store (localStorage load and `setEscalationPolicy`), not just the default, so
 * a row can never be auto-resolved while still rendering as calm.
 */
import type {
  EscalationAction,
  EscalationPolicy,
  EscalationRule,
  ManualReviewItem,
  ReviewSeverity,
} from "./types";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

export const URGENCY_THRESHOLD_MINUTES: Readonly<Record<ReviewSeverity, number>> = {
  critical: 5,
  warning: 30,
  info: 120,
};

export const DEFAULT_ESCALATION_POLICY: EscalationPolicy = {
  critical: { slaMinutes: 30, action: "escalate" },
  warning: { slaMinutes: 240, action: "escalate" },
  info: { slaMinutes: 480, action: "auto_approve" },
};

const SEVERITIES = Object.keys(URGENCY_THRESHOLD_MINUTES) as ReviewSeverity[];
const SEVERITY_RANK: Record<ReviewSeverity, number> = { critical: 0, warning: 1, info: 2 };

// ---------------------------------------------------------------------------
// The clock
// ---------------------------------------------------------------------------

export type SlaPhase = "ok" | "due-soon" | "overdue";

export interface SlaState {
  phase: SlaPhase;
  /** SLA deadline minus now. Negative once overdue (never clamped). */
  remainingMs: number;
  /** Epoch ms of the SLA deadline. Ordering key: it does not move with `now`. */
  dueAt: number;
  /** Cosmetic urgency 0..1: 0 below the threshold, 1 at 3x the threshold. */
  urgency: number;
}

type SlaInput = Pick<ManualReviewItem, "severity" | "createdAt">;

export function slaState(review: SlaInput, policy: EscalationPolicy, now: number): SlaState {
  const slaMs = policy[review.severity].slaMinutes * MINUTE_MS;
  const thresholdMs = URGENCY_THRESHOLD_MINUTES[review.severity] * MINUTE_MS;
  const parsed = Date.parse(review.createdAt);
  // Fail loud: a row whose timestamp cannot be read is treated as due now.
  const createdAt = Number.isFinite(parsed) ? parsed : now - slaMs;
  const ageMs = now - createdAt;
  const remainingMs = slaMs - ageMs;
  const phase: SlaPhase = remainingMs <= 0 ? "overdue" : ageMs >= thresholdMs ? "due-soon" : "ok";
  const urgency = ageMs < thresholdMs ? 0 : Math.min((ageMs - thresholdMs) / (thresholdMs * 2), 1);
  return { phase, remainingMs, dueAt: createdAt + slaMs, urgency };
}

// ---------------------------------------------------------------------------
// Queue order
// ---------------------------------------------------------------------------

/**
 * Pending rows first, soonest deadline first (most overdue at the top); then
 * every other row newest-first, as before. A row whose verdict sits in the
 * ledger's undo window is already non-pending in `overlay()`, so it sorts with
 * the decided rows and returns to its due slot on undo.
 */
export function orderByDue<T extends ManualReviewItem>(rows: readonly T[], policy: EscalationPolicy, now: number): T[] {
  const due = new Map<string, number>();
  for (const r of rows) if (r.status === "pending") due.set(r.id, slaState(r, policy, now).dueAt);
  return [...rows].sort((a, b) => {
    const ap = a.status === "pending";
    const bp = b.status === "pending";
    if (ap !== bp) return ap ? -1 : 1;
    if (ap) {
      return (
        due.get(a.id)! - due.get(b.id)! ||
        SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
        a.createdAt.localeCompare(b.createdAt) ||
        a.id.localeCompare(b.id)
      );
    }
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

export function countOverdue(rows: readonly ManualReviewItem[], policy: EscalationPolicy, now: number): number {
  return rows.filter((r) => r.status === "pending" && slaState(r, policy, now).phase === "overdue").length;
}

/** Pending ids in the order focus flow walks them. */
export function focusQueue(rows: readonly ManualReviewItem[], policy: EscalationPolicy, now: number): string[] {
  return orderByDue(
    rows.filter((r) => r.status === "pending"),
    policy,
    now,
  ).map((r) => r.id);
}

/**
 * Keep the walk order for ids still pending (a skip stays where the operator
 * put it); ids this session decided that came back (undo, failed write) go to
 * the front; new arrivals go to the back in the order given — pass
 * `focusQueue(...)` so they arrive due-first.
 */
export function reconcileFocusQueue(
  queue: readonly string[],
  pendingIds: readonly string[],
  decided: ReadonlySet<string>,
): string[] {
  const pending = new Set(pendingIds);
  const kept = queue.filter((id) => pending.has(id));
  const known = new Set(kept);
  const added = pendingIds.filter((id) => !known.has(id));
  return [...added.filter((id) => decided.has(id)), ...kept, ...added.filter((id) => !decided.has(id))];
}

// ---------------------------------------------------------------------------
// Escalation
// ---------------------------------------------------------------------------

/** Whether `checkEscalations` should act on this row now. */
export function escalationDue(review: ManualReviewItem, policy: EscalationPolicy, now: number): boolean {
  if (review.status !== "pending" || review.escalatedAt) return false;
  if (policy[review.severity].action === "none") return false;
  return slaState(review, policy, now).phase === "overdue";
}

// ---------------------------------------------------------------------------
// Policy validation
// ---------------------------------------------------------------------------

const VALID_ESCALATION_ACTIONS: ReadonlySet<string> = new Set<EscalationAction>(["auto_approve", "escalate", "none"]);

function isEscalationAction(v: unknown): v is EscalationAction {
  return typeof v === "string" && VALID_ESCALATION_ACTIONS.has(v);
}

function isFinitePositive(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

// Missing fields silently fall back to the default; explicitly invalid values
// fall back AND are named in `rejections`, so the caller can emit one aggregated
// warning. A partial/corrupt rule like `{"critical":{}}` must never leave
// `action` undefined or `slaMinutes` NaN (that silently disabled escalation).
function validateRule(raw: unknown, severity: ReviewSeverity, rejections: string[]): EscalationRule {
  const defaults = DEFAULT_ESCALATION_POLICY[severity];
  if (raw === undefined || raw === null) return defaults;
  if (typeof raw !== "object") {
    rejections.push(`${severity}: stored as ${typeof raw}, expected object`);
    return defaults;
  }
  const rec = raw as Record<string, unknown>;
  let action: EscalationAction = defaults.action;
  let slaMinutes: number = defaults.slaMinutes;
  if (rec.action !== undefined) {
    if (isEscalationAction(rec.action)) action = rec.action;
    else rejections.push(`${severity}.action: invalid value`);
  }
  if (rec.slaMinutes !== undefined) {
    if (!isFinitePositive(rec.slaMinutes)) {
      rejections.push(`${severity}.slaMinutes: not finite positive`);
    } else if (rec.slaMinutes < URGENCY_THRESHOLD_MINUTES[severity]) {
      rejections.push(`${severity}.slaMinutes: below urgency threshold`);
    } else {
      slaMinutes = rec.slaMinutes;
    }
  }
  return { action, slaMinutes };
}

/** Field-by-field validation of any policy-shaped value. */
export function validateEscalationPolicy(raw: unknown): { policy: EscalationPolicy; rejections: string[] } {
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const rejections: string[] = [];
  const policy = Object.fromEntries(SEVERITIES.map((sev) => [sev, validateRule(rec[sev], sev, rejections)])) as EscalationPolicy;
  return { policy, rejections };
}

// The default is the fallback for every rejected field, so it must pass itself.
// Fires at module load so a misconfiguration surfaces immediately.
for (const sev of SEVERITIES) {
  if (DEFAULT_ESCALATION_POLICY[sev].slaMinutes < URGENCY_THRESHOLD_MINUTES[sev]) {
    throw new Error(
      `[review-sla] Escalation SLA for "${sev}" is shorter than its urgency threshold; ` +
        `automated actions would fire before the UI signals urgency.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

/**
 * A remaining time as a localized relative phrase ("in 16 minutes",
 * "16 hours ago", "před 16 hodinami") via Intl.RelativeTimeFormat, so no
 * per-unit strings live in the locale files. Minutes under an hour, hours under
 * two days, days beyond; never "0 minutes".
 */
export function formatDue(remainingMs: number, locale: string, style: Intl.RelativeTimeFormatStyle = "long"): string {
  const fmt = new Intl.RelativeTimeFormat(locale, { numeric: "always", style });
  const sign = remainingMs < 0 ? -1 : 1;
  const abs = Math.abs(remainingMs);
  if (abs < HOUR_MS) return fmt.format(sign * Math.max(1, Math.round(abs / MINUTE_MS)), "minute");
  if (abs < 48 * HOUR_MS) return fmt.format(sign * Math.round(abs / HOUR_MS), "hour");
  return fmt.format(sign * Math.round(abs / (24 * HOUR_MS)), "day");
}
