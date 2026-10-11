// Standings engine — pure functions over the per-persona daily snapshots the
// desktop syncs (`synced_metrics_snapshots`). No I/O, no Date.now(): callers
// pass `asOf`, so any plane (real Supabase, demo fixture) runs one code path
// and tests are deterministic. Same shape of module as observabilitySeries.ts.
//
// Fairness rule: cost and speed are NOT scored against the cohort max (that
// pins the persona with the longest job near 0 whatever it does). They are
// scored against the persona's OWN trailing baseline, so a slow job that gets
// faster climbs. Reliability is an absolute rate; volume is relative to the
// busiest persona in the same window (the one honestly comparative axis).

export interface SnapshotRow {
  persona_id: string;
  /** YYYY-MM-DD (the desktop column is TEXT). */
  snapshot_date: string;
  // PostgREST returns `numeric` columns as strings, so both are accepted.
  total_executions: number | string;
  successful_executions: number | string;
  total_cost_usd: number | string;
  avg_duration_ms: number | string;
}

export interface WindowedAxes {
  runs: number;
  /** 0-1 success rate. */
  successRate: number;
  costPerRun: number;
  /** Run-weighted mean duration, ms. */
  durationMs: number;
}

export interface StandingAxes {
  reliability: number;
  cost: number;
  speed: number;
  quality: number;
  volume: number;
}

export interface Standing {
  id: string;
  metrics: StandingAxes;
  composite: number;
  /** composite(now) - composite(prior window); 0 when suppressed. */
  delta: number;
  trend: "up" | "down" | "flat";
  /** True when too few runs in either window to trust the delta. */
  deltaSuppressed: boolean;
  runs: number;
  /** 1-based rank per window, oldest first, current window last; null = no runs. */
  rankHistory: (number | null)[];
}

export const WINDOW_DAYS = 7;
/** Below this many runs in a window the delta is withheld, not guessed. */
export const MIN_RUNS = 3;
/** How many trailing days form a persona's own baseline. */
export const BASELINE_DAYS = 28;
export const HISTORY_WINDOWS = 5;
/** Absolute floors: smaller changes than these count as "no change". */
export const COST_FLOOR_USD = 0.0005;
export const DURATION_FLOOR_MS = 250;
const NEUTRAL = 50;
/** A 20% improvement saturates the axis (50 + 0.2 * 250 = 100). */
const SENSITIVITY = 250;
const TREND_EPSILON = 1;

const num = (v: number | string): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const clamp100 = (n: number): number =>
  Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0;

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Inclusive date range [start, end]; string compare is safe for YYYY-MM-DD. */
export interface DateWindow {
  start: string;
  end: string;
}

export function windowEndingAt(end: string, days = WINDOW_DAYS): DateWindow {
  return { start: addDays(end, -(days - 1)), end };
}

/** Per-persona axes over one window. Personas with no runs are absent. */
export function windowedAxes(
  snapshots: readonly SnapshotRow[],
  window: DateWindow,
): Map<string, WindowedAxes> {
  const acc = new Map<
    string,
    { runs: number; ok: number; cost: number; durationSum: number }
  >();
  for (const s of snapshots) {
    const d = s.snapshot_date.slice(0, 10);
    if (d < window.start || d > window.end) continue;
    const runs = num(s.total_executions);
    if (runs <= 0) continue;
    const a = acc.get(s.persona_id) ?? { runs: 0, ok: 0, cost: 0, durationSum: 0 };
    a.runs += runs;
    a.ok += num(s.successful_executions);
    a.cost += num(s.total_cost_usd);
    a.durationSum += num(s.avg_duration_ms) * runs;
    acc.set(s.persona_id, a);
  }
  const out = new Map<string, WindowedAxes>();
  for (const [id, a] of acc) {
    out.set(id, {
      runs: a.runs,
      successRate: Math.min(1, a.ok / a.runs),
      costPerRun: a.cost / a.runs,
      durationMs: a.durationSum / a.runs,
    });
  }
  return out;
}

/**
 * Score `current` against the persona's own `baseline` (lower is better).
 * 50 = unchanged; improvement above, regression below. Changes smaller than
 * `floor` in absolute terms are noise and score neutral. No baseline = neutral.
 */
export function selfRelative(
  current: number,
  baseline: number | undefined,
  floor: number,
): number {
  if (baseline === undefined || !(baseline > 0)) return NEUTRAL;
  if (Math.abs(baseline - current) < floor) return NEUTRAL;
  return clamp100(NEUTRAL + ((baseline - current) / baseline) * SENSITIVITY);
}

interface WindowScore {
  axes: StandingAxes;
  composite: number;
  runs: number;
}

function scoreWindow(
  snapshots: readonly SnapshotRow[],
  end: string,
): Map<string, WindowScore> {
  const cur = windowedAxes(snapshots, windowEndingAt(end));
  // Trailing baseline: the days immediately BEFORE this window.
  const baseline = windowedAxes(snapshots, {
    start: addDays(end, -(WINDOW_DAYS - 1) - BASELINE_DAYS),
    end: addDays(end, -WINDOW_DAYS),
  });
  const maxRuns = Math.max(1, ...[...cur.values()].map((a) => a.runs));
  const out = new Map<string, WindowScore>();
  for (const [id, a] of cur) {
    const b = baseline.get(id);
    const reliability = clamp100(a.successRate * 100);
    const axes: StandingAxes = {
      reliability,
      cost: selfRelative(a.costPerRun, b?.costPerRun, COST_FLOOR_USD),
      speed: selfRelative(a.durationMs, b?.durationMs, DURATION_FLOOR_MS),
      // PROXY: no measured quality is synced; mirrors reliability until one is.
      quality: reliability,
      volume: clamp100((a.runs / maxRuns) * 100),
    };
    const composite = clamp100(
      (axes.reliability + axes.cost + axes.speed + axes.quality + axes.volume) / 5,
    );
    out.set(id, { axes, composite, runs: a.runs });
  }
  return out;
}

function ranks(scores: Map<string, WindowScore>): Map<string, number> {
  const ordered = [...scores.entries()].sort(
    (x, y) => y[1].composite - x[1].composite || x[0].localeCompare(y[0]),
  );
  return new Map(ordered.map(([id], i) => [id, i + 1]));
}

const EMPTY_AXES: StandingAxes = {
  reliability: 0, cost: 0, speed: 0, quality: 0, volume: 0,
};

/**
 * Ranked standings as of `asOf` (YYYY-MM-DD). Every persona that appears in
 * the snapshots is returned; ones with no runs in the current window sit at
 * composite 0 with no delta. Sorted best first.
 */
export function standings(
  snapshots: readonly SnapshotRow[],
  asOf: string,
  windows = HISTORY_WINDOWS,
): Standing[] {
  const ends = Array.from({ length: windows }, (_, i) =>
    addDays(asOf, -WINDOW_DAYS * (windows - 1 - i)),
  );
  const perWindow = ends.map((e) => scoreWindow(snapshots, e));
  const perRanks = perWindow.map(ranks);
  const now = perWindow[windows - 1];
  const prior = windows > 1 ? perWindow[windows - 2] : new Map<string, WindowScore>();

  const ids = new Set<string>();
  for (const s of snapshots) ids.add(s.persona_id);

  const result: Standing[] = [];
  for (const id of ids) {
    const cur = now.get(id);
    const prev = prior.get(id);
    const deltaSuppressed = !cur || !prev || cur.runs < MIN_RUNS || prev.runs < MIN_RUNS;
    const delta = deltaSuppressed ? 0 : cur.composite - prev.composite;
    result.push({
      id,
      metrics: cur?.axes ?? EMPTY_AXES,
      composite: cur?.composite ?? 0,
      delta,
      trend: delta > TREND_EPSILON ? "up" : delta < -TREND_EPSILON ? "down" : "flat",
      deltaSuppressed,
      runs: cur?.runs ?? 0,
      rankHistory: perRanks.map((r) => r.get(id) ?? null),
    });
  }
  return result.sort((a, b) => b.composite - a.composite || a.id.localeCompare(b.id));
}
