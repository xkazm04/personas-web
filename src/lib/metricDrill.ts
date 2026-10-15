import type { DateRangePreset } from "@/stores/dashboardFilterStore";
import type { DailyMetric } from "./types";

/**
 * A metric drill-down (P23): from a run count or a spend figure to the runs
 * behind it. A figure the demo shows is a sum over whole UTC days of the
 * daily series, for one persona or for all; the drill names exactly those
 * days and that persona, as a custom range in the dashboard scope (S1's
 * store). The executions table cuts its rows with the same scope, so the
 * count and summed cost it shows are the figure's.
 *
 * Pure, so the figure, the link and the test share one definition.
 */
export interface MetricDrill {
  /** The persona the figure covers, or null for every agent. */
  personaId: string | null;
  /** First and last `YYYY-MM-DD` (UTC) of the days the figure sums. */
  firstDay: string;
  lastDay: string;
}

/** The drill for a figure summed over `days` (null when it sums no day). */
export function drillOver(personaId: string | null, days: readonly Pick<DailyMetric, "date">[]): MetricDrill | null {
  if (days.length === 0) return null;
  const dates = days.map((d) => d.date.slice(0, 10)).sort();
  return { personaId, firstDay: dates[0], lastDay: dates[dates.length - 1] };
}

/** The scope choice that holds the drill's runs: its persona, its days as a custom range. */
export function drillScopeChoice(drill: MetricDrill): {
  personaId: string | null;
  dateRange: DateRangePreset;
  customStart: string;
  customEnd: string;
} {
  return { personaId: drill.personaId, dateRange: "custom", customStart: drill.firstDay, customEnd: drill.lastDay };
}

/**
 * A list's run count and spend, as the executions table states them. Spend is
 * summed in 1e-4 USD before rounding, so it prints the same cents as the
 * figure it was drilled from.
 */
export function runTotals(rows: readonly { costUsd: number }[]): { runs: number; costUsd: number } {
  let units = 0;
  for (const row of rows) units += Math.round(row.costUsd * 10_000);
  return { runs: rows.length, costUsd: units / 10_000 };
}
