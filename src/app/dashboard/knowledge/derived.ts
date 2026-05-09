// Per-row derived fields cached at module load so neither the table nor the
// graph has to recompute success rate, parsed lastSeen, or pre-formatted cost
// /duration strings on every render or every sort comparison. Cuts allocations
// in the sort comparator from O(n log n) Date parses to zero.

import {
  MOCK_KNOWLEDGE_PATTERNS,
  type KnowledgePattern,
} from "@/lib/mock-dashboard-data";

export interface DerivedKnowledgePattern extends KnowledgePattern {
  /** new Date(lastSeen).getTime(), or 0 if the ISO string is unparseable. */
  __lastSeenMs: number;
  /** successCount / (successCount + failureCount), 0 when both are 0. */
  __successRate: number;
  /** "$0.023" — pre-formatted to skip toFixed in row render. */
  __costFormatted: string;
  /** "4.2s" — pre-formatted; same purpose as __costFormatted. */
  __durationFormatted: string;
}

function formatDuration(ms: number): string {
  if (ms < 1_000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1_000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

function formatCost(usd: number): string {
  return `$${usd.toFixed(3)}`;
}

export const DERIVED_KNOWLEDGE_PATTERNS: DerivedKnowledgePattern[] =
  MOCK_KNOWLEDGE_PATTERNS.map((p) => {
    const total = p.successCount + p.failureCount;
    const lastSeenMs = new Date(p.lastSeen).getTime();
    return {
      ...p,
      __lastSeenMs: Number.isFinite(lastSeenMs) ? lastSeenMs : 0,
      __successRate: total > 0 ? p.successCount / total : 0,
      __costFormatted: formatCost(p.avgCostUsd),
      __durationFormatted: formatDuration(p.avgDurationMs),
    };
  });

/**
 * Format a relative-time label using a frozen `nowMs` so every row in a single
 * render uses the same reference point — calling Date.now() per row produces
 * subtly inconsistent labels and burns allocations in tight render loops.
 * Clamps future / NaN timestamps to a stable "—" or "now" rather than emitting
 * "-1m ago" or "NaNm ago".
 */
export function relativeFromNow(nowMs: number, lastSeenMs: number): string {
  if (!Number.isFinite(lastSeenMs) || lastSeenMs <= 0) return "—";
  const diff = Math.max(0, nowMs - lastSeenMs);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
