import type { ManualReviewItem, ReviewSeverity } from "@/lib/types";
import { DEFAULT_ESCALATION_POLICY, URGENCY_THRESHOLD_MINUTES, slaState } from "@/lib/review-sla";

/**
 * Visual urgency thresholds (minutes) per severity. The SLA rule, its table and
 * the `SLA >= urgency threshold` invariant live in `review-sla.ts`; this
 * module re-exports the thresholds for existing readers.
 */
export const severityThresholdMinutes: Readonly<Record<ReviewSeverity, number>> = URGENCY_THRESHOLD_MINUTES;

/**
 * Urgency level: 0 when below threshold, ramps 0->1 over the next 2x threshold
 * (so full urgency at 3x the threshold). Delegates to `slaState`.
 */
export function getUrgencyLevel(createdAt: string, severity: ReviewSeverity, now = Date.now()): number {
  return slaState({ createdAt, severity }, DEFAULT_ESCALATION_POLICY, now).urgency;
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
