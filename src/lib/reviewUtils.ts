import type { ManualReviewItem, ReviewSeverity } from "@/lib/types";
import { DEFAULT_ESCALATION_POLICY } from "@/stores/reviewStore";

/**
 * Visual urgency thresholds (minutes) per severity level.
 *
 * These drive the **UI-only** urgency glow in the review queue via
 * {@link getUrgencyLevel}. They are intentionally shorter than the escalation
 * SLA timers defined in `DEFAULT_ESCALATION_POLICY` (reviewStore.ts):
 *
 * | Severity | Urgency threshold | Escalation SLA |
 * |----------|-------------------|----------------|
 * | critical | 5 min             | 30 min         |
 * | warning  | 30 min            | 240 min (4 h)  |
 * | info     | 120 min (2 h)     | 480 min (8 h)  |
 *
 * **Urgency** is a cosmetic indicator — it makes the row glow to attract
 * attention but triggers no automated action.
 *
 * **Escalation SLA** (in reviewStore) drives real automated behaviour: once
 * the SLA expires the system either auto-approves or escalates depending on
 * the configured {@link EscalationPolicy}.
 *
 * The invariant `escalation SLA >= urgency threshold` must always hold; if it
 * doesn't, a review could be auto-approved while the UI still shows a calm
 * (non-urgent) state.  A runtime assertion below enforces this.
 */
export const severityThresholdMinutes: Record<ReviewSeverity, number> = {
  critical: 5,
  warning: 30,
  info: 120,
};

// Runtime assertion: escalation SLA must always be >= urgency threshold.
// Fires at module-load time so misconfigurations surface immediately.
for (const sev of Object.keys(severityThresholdMinutes) as ReviewSeverity[]) {
  const urgency = severityThresholdMinutes[sev];
  const sla = DEFAULT_ESCALATION_POLICY[sev].slaMinutes;
  if (sla < urgency) {
    throw new Error(
      `[reviewUtils] Escalation SLA for "${sev}" (${sla}m) is shorter than its urgency threshold (${urgency}m). ` +
        `This would allow automated actions before the UI signals urgency.`,
    );
  }
}

/**
 * Urgency level: 0 when below threshold, ramps 0→1 over the next 2x threshold
 * (so full urgency at 3x the threshold).
 */
export function getUrgencyLevel(createdAt: string, severity: ReviewSeverity, now = Date.now()): number {
  const ageMs = now - new Date(createdAt).getTime();
  const thresholdMs = severityThresholdMinutes[severity] * 60_000;
  if (ageMs < thresholdMs) return 0;
  return Math.min((ageMs - thresholdMs) / (thresholdMs * 2), 1);
}

/**
 * SLA countdown: returns remaining time, a human-readable label, and whether SLA expired.
 */
export function getSlaCountdown(
  createdAt: string,
  slaMinutes: number,
  now = Date.now(),
): { remainingMs: number; label: string; expired: boolean } {
  const slaMs = slaMinutes * 60_000;
  const elapsed = now - new Date(createdAt).getTime();
  const remainingMs = slaMs - elapsed;

  if (remainingMs <= 0) return { remainingMs: 0, label: "Expired", expired: true };

  const totalSec = Math.ceil(remainingMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (h > 0) return { remainingMs, label: `${h}h ${m}m`, expired: false };
  if (m > 0) return { remainingMs, label: `${m}m ${s}s`, expired: false };
  return { remainingMs, label: `${s}s`, expired: false };
}

export interface AuditAnalytics {
  totalResolved: number;
  approved: number;
  rejected: number;
  avgTimeBySeverity: Record<ReviewSeverity, number | null>;
  ratioByAgent: { name: string; color: string; approved: number; rejected: number; total: number }[];
  recentEntries: ManualReviewItem[];
  volumeByDay: { date: string; approved: number; rejected: number }[];
}

export function computeAuditAnalytics(reviews: ManualReviewItem[]): AuditAnalytics {
  const resolved: ManualReviewItem[] = [];
  let approved = 0;
  let rejected = 0;

  const severityTotals: Record<ReviewSeverity, { totalMs: number; count: number }> = {
    critical: { totalMs: 0, count: 0 },
    warning: { totalMs: 0, count: 0 },
    info: { totalMs: 0, count: 0 },
  };

  const agentMap = new Map<string, { name: string; color: string; approved: number; rejected: number }>();
  const dayMap = new Map<string, { approved: number; rejected: number }>();

  for (const r of reviews) {
    if (r.status === "pending" || !r.resolvedAt) continue;
    resolved.push(r);

    if (r.status === "approved") approved++;
    else rejected++;

    const sevTotals = severityTotals[r.severity];
    sevTotals.totalMs +=
      new Date(r.resolvedAt).getTime() - new Date(r.createdAt).getTime();
    sevTotals.count++;

    const key = r.personaName ?? "Unknown";
    if (!agentMap.has(key)) {
      agentMap.set(key, { name: key, color: r.personaColor ?? "#06b6d4", approved: 0, rejected: 0 });
    }
    const entry = agentMap.get(key)!;
    if (r.status === "approved") entry.approved++;
    else entry.rejected++;

    const day = (r.resolvedAt ?? r.createdAt).slice(0, 10);
    if (!dayMap.has(day)) dayMap.set(day, { approved: 0, rejected: 0 });
    const dayEntry = dayMap.get(day)!;
    if (r.status === "approved") dayEntry.approved++;
    else dayEntry.rejected++;
  }

  const avgTimeBySeverity: Record<ReviewSeverity, number | null> = {
    critical: severityTotals.critical.count
      ? severityTotals.critical.totalMs / severityTotals.critical.count
      : null,
    warning: severityTotals.warning.count
      ? severityTotals.warning.totalMs / severityTotals.warning.count
      : null,
    info: severityTotals.info.count
      ? severityTotals.info.totalMs / severityTotals.info.count
      : null,
  };

  const ratioByAgent = Array.from(agentMap.values())
    .map((a) => ({ ...a, total: a.approved + a.rejected }))
    .sort((a, b) => b.total - a.total);

  const volumeByDay = Array.from(dayMap.entries())
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);

  // Recent entries (last 20)
  const recentEntries = [...resolved]
    .sort((a, b) => (b.resolvedAt ?? b.createdAt).localeCompare(a.resolvedAt ?? a.createdAt))
    .slice(0, 20);

  return { totalResolved: resolved.length, approved, rejected, avgTimeBySeverity, ratioByAgent, recentEntries, volumeByDay };
}
