// SLO engine — pure functions over per-persona daily SLIs. No I/O, no
// Date.now(): callers pass the series, so the real plane (synced snapshots)
// and the demo plane (MOCK_DAILY_METRICS) run one code path and tests are
// deterministic. Same shape of module as standings.ts / observabilitySeries.ts.
//
// Granularity caveat: the input is one point per day, so an episode is
// day-granular — a breach that opens and closes inside one day is a one-day
// episode, and its duration is a whole number of days.

export type SloDirection = "higher" | "lower";

/** One day of one persona's service indicator. */
export interface SliPoint {
  /** YYYY-MM-DD */
  date: string;
  /** Total events (runs) that day — the denominator of ratio SLIs. */
  total: number;
  /** Good events (successful runs) that day. */
  good: number;
  /** Mean duration (ms) for the day, when the metric is latency. */
  durationMs?: number;
}

export interface SloObjective {
  /** Ratio objective as a percent (95 = 95%) for success; ms ceiling for latency. */
  target: number;
  direction: SloDirection;
}

export interface ErrorBudget {
  /** Events in the window. */
  total: number;
  bad: number;
  /** Failures the objective permits over `total` events (total * (1 - target)). */
  allowed: number;
  /** allowed - bad; negative once the budget is overspent. */
  remaining: number;
  /** bad / allowed; 1 = budget exactly spent, 2.13 = 213%. 0 when nothing allowed and nothing bad. */
  burned: number;
  /** Observed good / total, 0-1; 1 when there were no events. */
  compliance: number;
}

export interface BreachEpisode {
  /** First breaching day. */
  start: string;
  /** Last breaching day; the episode is closed only if `ongoing` is false. */
  end: string;
  /** Whole days spanned, inclusive of both ends. */
  days: number;
  durationMinutes: number;
  /** True when the series ends still in breach. */
  ongoing: boolean;
  /** Worst daily value inside the episode (min for higher, max for lower). */
  worst: number;
}

const DAY_MINUTES = 24 * 60;

function ratio(p: SliPoint): number | null {
  return p.total > 0 ? Math.min(1, Math.max(0, p.good / p.total)) : null;
}

function dayDiff(a: string, b: string): number {
  const t = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((t(b) - t(a)) / 86_400_000);
}

/** Daily SLI values (percent for success, ms for latency); days with no data are skipped. */
export function sli(
  points: readonly SliPoint[],
  metric: "successRate" | "latency",
): { date: string; value: number }[] {
  const out: { date: string; value: number }[] = [];
  for (const p of [...points].sort((a, b) => a.date.localeCompare(b.date))) {
    if (metric === "successRate") {
      const r = ratio(p);
      if (r !== null) out.push({ date: p.date, value: r * 100 });
    } else if (p.total > 0 && typeof p.durationMs === "number") {
      out.push({ date: p.date, value: p.durationMs });
    }
  }
  return out;
}

/** Error budget of a ratio objective (target percent) over the points given. */
export function errorBudget(points: readonly SliPoint[], targetPercent: number): ErrorBudget {
  let total = 0;
  let good = 0;
  for (const p of points) {
    total += Math.max(0, p.total);
    good += Math.min(Math.max(0, p.good), Math.max(0, p.total));
  }
  const bad = total - good;
  const allowed = total * (1 - targetPercent / 100);
  return {
    total,
    bad,
    allowed,
    remaining: allowed - bad,
    burned: allowed > 0 ? bad / allowed : bad > 0 ? Infinity : 0,
    compliance: total > 0 ? good / total : 1,
  };
}

/**
 * Burn rate: how fast the budget is being spent relative to the pace that
 * would spend it exactly over the window. 1 = on pace, >1 = exhausts early.
 * Computed as (observed bad fraction) / (allowed bad fraction) over `points`.
 */
export function burnRate(points: readonly SliPoint[], targetPercent: number): number {
  const b = errorBudget(points, targetPercent);
  if (b.total === 0) return 0;
  const allowedFraction = 1 - targetPercent / 100;
  const badFraction = b.bad / b.total;
  if (allowedFraction <= 0) return badFraction > 0 ? Infinity : 0;
  return badFraction / allowedFraction;
}

/** The last `days` calendar days ending at the series' latest date. */
export function trailing(points: readonly SliPoint[], days: number): SliPoint[] {
  if (points.length === 0) return [];
  const end = points.reduce((m, p) => (p.date > m ? p.date : m), points[0].date);
  return points.filter((p) => dayDiff(p.date, end) < days && p.date <= end);
}

function breaching(value: number, o: SloObjective): boolean {
  return o.direction === "higher" ? value < o.target : value > o.target;
}

/**
 * Contiguous runs of breaching days. A day without data neither opens nor
 * closes an episode on its own: a gap of missing days inside a breach keeps it
 * open; the episode closes at the next day that is in range.
 */
export function breachEpisodes(
  series: readonly { date: string; value: number }[],
  objective: SloObjective,
): BreachEpisode[] {
  const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date));
  const episodes: BreachEpisode[] = [];
  let open: { start: string; end: string; worst: number } | null = null;
  const close = (ongoing: boolean) => {
    if (!open) return;
    const days = dayDiff(open.start, open.end) + 1;
    episodes.push({
      start: open.start,
      end: open.end,
      days,
      durationMinutes: days * DAY_MINUTES,
      ongoing,
      worst: open.worst,
    });
    open = null;
  };
  for (const p of sorted) {
    if (breaching(p.value, objective)) {
      if (!open) open = { start: p.date, end: p.date, worst: p.value };
      else {
        open.end = p.date;
        open.worst =
          objective.direction === "higher" ? Math.min(open.worst, p.value) : Math.max(open.worst, p.value);
      }
    } else {
      close(false);
    }
  }
  close(true);
  return episodes;
}

/**
 * Days until the remaining budget is spent at the recent daily failure pace:
 * 0 when already overspent, null when nothing failed recently (not burning).
 */
export function exhaustionForecast(
  windowPoints: readonly SliPoint[],
  recentPoints: readonly SliPoint[],
  targetPercent: number,
): number | null {
  const budget = errorBudget(windowPoints, targetPercent);
  if (budget.remaining <= 0 && budget.bad > 0) return 0;
  const recentDays = new Set(recentPoints.map((p) => p.date)).size;
  const recentBad = recentPoints.reduce((s, p) => s + Math.max(0, p.total - p.good), 0);
  if (recentDays === 0 || recentBad === 0) return null;
  return budget.remaining / (recentBad / recentDays);
}
