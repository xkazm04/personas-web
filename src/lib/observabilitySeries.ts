// ── Observability series: every Performance-tab overlay, from one daily root ──
//
// The Performance tab shows headline tiles, their sparklines and "vs last
// period" trends, the cost / execution charts with a Compare overlay, a cost-
// anomaly banner and chart annotations — all on one screen. Each of those is a
// PROJECTION of a `DailyMetric[]` series through the pure functions below, so
// no two numbers on that screen can disagree, and the demo and Supabase data
// planes share one implementation of each rule.
//
// Trend window contract:
// - Demo: the 14-day window vs the 14-day prior window
//   (`MOCK_DAILY_METRICS` vs `MOCK_DAILY_PRIOR_METRICS`), the same pair the
//   Compare overlay plots.
// - Supabase: no prior window is synced, so `halvesTrend` compares the recent
//   half of the synced daily series with the earlier half. Same `periodTrend`
//   rule, a different window — real mode also hides the Compare toggle, so it
//   never shows a prior period it does not have.

import type { DailyMetric } from "./types";

type DailyTotals = Pick<DailyMetric, "cost" | "executions" | "successes">;

export interface PeriodTrend {
  /** % change in total cost. */
  cost: number;
  /** % change in total executions. */
  executions: number;
  /** % change in success RATE (successes / executions), not in success count. */
  success: number;
}

export interface ComparePoint {
  /** Chart x key: `YYYY-MM-DD`.slice(5), exactly as the charts key their data. */
  date: string;
  current: number;
  previous: number;
}

export interface CostAnomaly {
  /** ISO `YYYY-MM-DD` of the day, as it appears in the daily series. */
  date: string;
  cost: number;
  /** z-score of that day's cost within the series (population sd). */
  deviation: number;
}

export interface ChartAnnotation {
  date: string;
  label: string;
  type: "deployment" | "incident" | "milestone";
}

export interface AnnotationSpec {
  /** Days before the newest day in the series (0 = the newest day). */
  dayOffset: number;
  label: string;
  type: ChartAnnotation["type"];
}

/** The key the cost / execution charts use for a day on their x axis. */
export function chartKey(isoDate: string): string {
  return isoDate.slice(5);
}

/** Percentage change of `recent` vs `prior`; 0 when there is no prior baseline. */
function pctChange(recent: number, prior: number): number {
  if (prior === 0) return 0;
  return ((recent - prior) / prior) * 100;
}

function sumOf(days: readonly DailyTotals[], pick: (d: DailyTotals) => number): number {
  return days.reduce((a, d) => a + pick(d), 0);
}

/** % change of `current` against `previous` for cost, volume and success rate. */
export function periodTrend(
  current: readonly DailyTotals[],
  previous: readonly DailyTotals[],
): PeriodTrend {
  const currentExec = sumOf(current, (d) => d.executions);
  const previousExec = sumOf(previous, (d) => d.executions);
  const currentRate = currentExec > 0 ? sumOf(current, (d) => d.successes) / currentExec : 0;
  const previousRate = previousExec > 0 ? sumOf(previous, (d) => d.successes) / previousExec : 0;
  return {
    cost: pctChange(sumOf(current, (d) => d.cost), sumOf(previous, (d) => d.cost)),
    executions: pctChange(currentExec, previousExec),
    success: pctChange(currentRate, previousRate),
  };
}

/** `periodTrend` of the recent half of `daily` against its earlier half. */
export function halvesTrend(daily: readonly DailyTotals[]): PeriodTrend {
  const mid = Math.floor(daily.length / 2);
  return periodTrend(daily.slice(mid), daily.slice(0, mid));
}

/** Tile sparklines: one point per day — cost, executions, success rate (%). */
export function sparklinesFromDaily(daily: readonly DailyTotals[]): {
  cost: number[];
  executions: number[];
  success: number[];
} {
  return {
    cost: daily.map((d) => d.cost),
    executions: daily.map((d) => d.executions),
    success: daily.map((d) => (d.executions > 0 ? (d.successes / d.executions) * 100 : 0)),
  };
}

/**
 * The Compare overlay: day `i` of the prior window drawn under day `i` of the
 * current one, keyed by the CURRENT day's chart key so recharts can merge it.
 */
export function previousSeries(
  daily: readonly DailyMetric[],
  prior: readonly DailyMetric[],
  field: "cost" | "executions",
): ComparePoint[] {
  return daily.map((d, i) => ({
    date: chartKey(d.date),
    current: d[field],
    previous: prior[i]?.[field] ?? 0,
  }));
}

/** Days whose cost sits at least `zThreshold` standard deviations ABOVE the mean. */
export function detectCostAnomalies(
  daily: readonly DailyMetric[],
  zThreshold: number,
): CostAnomaly[] {
  if (daily.length === 0) return [];
  const mean = sumOf(daily, (d) => d.cost) / daily.length;
  const sd = Math.sqrt(sumOf(daily, (d) => (d.cost - mean) ** 2) / daily.length);
  if (sd === 0) return [];
  return daily
    .map((d) => ({ date: d.date, cost: d.cost, deviation: (d.cost - mean) / sd }))
    .filter((a) => a.deviation >= zThreshold);
}

/** Pin annotations to real days of the series; offsets outside it are dropped. */
export function anchorAnnotations(
  daily: readonly DailyMetric[],
  specs: readonly AnnotationSpec[],
): ChartAnnotation[] {
  return specs.flatMap(({ dayOffset, label, type }) => {
    const d = daily[daily.length - 1 - dayOffset];
    return d && dayOffset >= 0 ? [{ date: chartKey(d.date), label, type }] : [];
  });
}
