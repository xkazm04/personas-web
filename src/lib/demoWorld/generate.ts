/**
 * The demo world's generator: one agent's run log, projected from its root
 * record. Pure and seeded; the caller passes the clock, so a load replays the
 * same world and tests are deterministic.
 *
 * What it projects FROM (the root, never re-declared here):
 * - the agent's day so far (the Board's tile: runs created today in any state,
 *   today's spend, the newest finished statuses and the success rate over
 *   them), which the log reproduces exactly;
 * - runs the root authored by hand (`fixed`): they hold their slots in their
 *   day and are served by the fixtures, not generated again;
 * - declared faults (an outage window): every generated run inside it fails or
 *   runs slow, and the fault places its own runs there so the window is never
 *   empty.
 *
 * What it projects TO: the generated runs of the last `LOG_DAYS` days (the
 * executions log), and one aggregate per day for `HISTORY_DAYS` (the log days
 * folded from those runs, older days drawn as aggregates only, as a desktop
 * keeps its daily snapshots after the runs themselves are pruned).
 *
 * Money is counted in integer units of 1e-4 USD (`COST_UNIT`), so a day's runs
 * sum to its figure exactly.
 */

export const DAY_MS = 86_400_000;
/** Days of runs the log holds (today included): the Observability window. */
export const LOG_DAYS = 14;
/**
 * Days of daily aggregates: the leaderboard's five weekly windows plus its
 * 28-day baseline (standings.ts: 7 * 5 + 28), which also covers the prior
 * 14-day window and the SLA's 30 days.
 */
export const HISTORY_DAYS = 63;
/** 1e-4 USD. */
export const COST_UNIT = 10_000;

export type RunStatus = "completed" | "failed" | "running" | "queued" | "cancelled";
export type FinishedStatus = "completed" | "failed";

/** One agent of the world's roster, as the root states it. */
export interface WorldAgent {
  /** The Board's agent id (`fleet.json`). */
  agentId: string;
  /** The id its runs carry: the synced persona for the crew, a minted `fleet-<id>-mock` otherwise. */
  personaId: string;
  name: string;
  color: string;
  team: string;
  enabled: boolean;
  /** Runs created today, in any state (the Board's "runs today"). */
  runsToday: number;
  /**
   * Share of the newest finished runs that completed (the Board's rate over
   * its 12 dots): the odds any other run completes.
   */
  successRate: number;
  costTodayUsd: number;
  /** The newest finished runs' statuses, newest first (the Board's dots); the crew derives its own. */
  recentStatuses?: readonly FinishedStatus[];
  /** The run in flight now, if any (counted in `runsToday`). */
  live: { status: "running" | "queued"; sinceMs: number } | null;
  /** A typical finished run's duration. */
  durationMs: number;
  /** No ordinary run takes longer (an objective the agent meets on a normal day). */
  durationCapMs?: number;
  /** A typical day's run count, for the days before today. */
  typicalRuns: number;
  costPerRunUsd: number;
}

/** A run the root authored by hand: it fills a slot in its day; the fixtures serve it. */
export interface FixedRun {
  at: number;
  status: RunStatus;
  costUnits: number;
  durationMs: number | null;
}

/** A declared fault: inside [from, to] every generated run of the agent fails or runs slow. */
export interface WorldFault {
  id: string;
  agentId: string;
  kind: "fail" | "slow";
  /** Duration multiplier of a slow fault. */
  factor: number;
  from: number;
  to: number;
  /** Runs the fault places in its own window (the first at `from`). */
  runs: number;
}

export interface WorldRun {
  id: string;
  /** Creation time (epoch ms): the day a run counts in. */
  at: number;
  status: RunStatus;
  costUnits: number;
  durationMs: number | null;
}

/** One day of one agent. `durationSum` is over finished runs that have a duration. */
export interface DayAgg {
  runs: number;
  completed: number;
  failed: number;
  costUnits: number;
  durationSum: number;
  /** Finished runs counted in `durationSum`. */
  timed: number;
}

/** The world's clock and the shape every agent shares. */
export interface WorldShape {
  seed: number;
  nowMs: number;
  /** UTC midnight of today: `DailyMetric` dates and the scope cut days here. */
  todayStartMs: number;
  /** Where today's generated runs begin: the Board's day so far, inside today. */
  spanStartMs: number;
  /** Fleet-wide volume factor per day ago (index 0 unused: today is exact). */
  dayFactor: readonly number[];
  /** Volume shrinks by this share per day back: the fleet has been growing. */
  growthPerDay: number;
  /** One declared cost spike (the Performance tab's anomaly): a team's runs cost `factor` x that day. */
  costSpike: { dayAgo: number; team: string; factor: number } | null;
}

export interface AgentLog {
  agent: WorldAgent;
  /** Generated runs of the log days, newest first. */
  runs: WorldRun[];
  /** Index = days ago, `HISTORY_DAYS` long; generated runs only (fixed runs are folded by the reader). */
  days: DayAgg[];
}

/** UTC midnight at or before `ms`. */
export function utcDayStart(ms: number): number {
  return ms - (((ms % DAY_MS) + DAY_MS) % DAY_MS);
}

/** `YYYY-MM-DD` (UTC) of `ms`. */
export function utcDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

const pad = (n: number, width: number) => String(n).padStart(width, "0");
const dayPrefixes = new Map<number, string>();

/** `new Date(ms).toISOString()` for an integer ms, a few times faster (the log formats ~75k stamps). */
export function isoOf(ms: number): string {
  const day = utcDayStart(ms);
  let prefix = dayPrefixes.get(day);
  if (prefix === undefined) {
    prefix = new Date(day).toISOString().slice(0, 11);
    dayPrefixes.set(day, prefix);
  }
  let rest = ms - day;
  const h = Math.floor(rest / 3_600_000);
  rest -= h * 3_600_000;
  const m = Math.floor(rest / 60_000);
  rest -= m * 60_000;
  const s = Math.floor(rest / 1000);
  return `${prefix}${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(rest - s * 1000, 3)}Z`;
}

/** FNV-1a over the parts: a stable seed per name. */
export function hashSeed(...parts: (string | number)[]): number {
  let h = 2166136261;
  for (const part of parts) {
    const s = String(part);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= 0x2f;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32: small, fast, good enough for fixtures. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const emptyDay = (): DayAgg => ({ runs: 0, completed: 0, failed: 0, costUnits: 0, durationSum: 0, timed: 0 });

/** Adds one run to a day. */
export function foldRun(day: DayAgg, status: RunStatus, costUnits: number, durationMs: number | null): void {
  day.runs += 1;
  day.costUnits += costUnits;
  if (status === "completed") day.completed += 1;
  else if (status === "failed") day.failed += 1;
  if ((status === "completed" || status === "failed") && durationMs !== null) {
    day.durationSum += durationMs;
    day.timed += 1;
  }
}

/** UTC days back from today that `at` falls on (0 = today; negative = after today). */
export function daysAgoOf(at: number, todayStartMs: number): number {
  return Math.floor((todayStartMs + DAY_MS - 1 - at) / DAY_MS);
}


interface Slot {
  at: number;
  day: number;
  live: boolean;
  status: RunStatus;
  costUnits: number;
  durationMs: number | null;
}

/** Split `total` units over `weights`, exactly (largest share first takes the remainder). */
function splitUnits(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (total <= 0 || sum <= 0) return weights.map(() => 0);
  const out = weights.map((w) => Math.floor((total * w) / sum));
  let rest = total - out.reduce((a, b) => a + b, 0);
  for (let i = 0; rest > 0; i = (i + 1) % out.length) {
    if (weights[i] > 0) {
      out[i] += 1;
      rest -= 1;
    }
  }
  return out;
}

/**
 * One agent's log. `fixed` are its authored runs; `faults` its declared faults.
 * Today's runs reproduce the agent's day exactly: `runsToday` runs (fixed ones
 * included), today's spend and, when the root gives them, the newest finished
 * statuses (whose completed share is the tile's success rate).
 */
export function generateAgentLog(
  agent: WorldAgent,
  shape: WorldShape,
  fixed: readonly FixedRun[] = [],
  faults: readonly WorldFault[] = [],
): AgentLog {
  const rng = mulberry32(hashSeed(shape.seed, agent.agentId));
  const costDrift = (rng() - 0.5) * 0.5;
  const durationDrift = agent.durationCapMs ? 0 : (rng() - 0.5) * 0.5;
  const failP = Math.max(0, Math.min(1, 1 - agent.successRate));
  const cap = agent.durationCapMs ?? Infinity;
  const dayStart = (d: number) => shape.todayStartMs - d * DAY_MS;
  const dayOf = (at: number) => daysAgoOf(at, shape.todayStartMs);
  const spike = (d: number) =>
    shape.costSpike && shape.costSpike.dayAgo === d && shape.costSpike.team === agent.team ? shape.costSpike.factor : 1;
  const costPerRun = (d: number) => agent.costPerRunUsd * (1 + (costDrift * d) / HISTORY_DAYS) * spike(d);
  const duration = (d: number) => Math.min(cap, agent.durationMs * (1 + (durationDrift * d) / HISTORY_DAYS));
  const target = (d: number) =>
    d === 0
      ? agent.runsToday
      : Math.max(0, Math.round(agent.typicalRuns * (shape.dayFactor[d] ?? 1) * (1 - shape.growthPerDay * d) * (0.85 + 0.3 * rng())));

  const fixedPerDay = new Array<number>(LOG_DAYS).fill(0);
  const fixedCostToday = fixed.reduce((sum, f) => {
    const d = dayOf(f.at);
    if (d >= 0 && d < LOG_DAYS) fixedPerDay[d] += 1;
    return d === 0 ? sum + f.costUnits : sum;
  }, 0);

  // ── Place every generated run of the log days ──
  const slots: Slot[] = [];
  const logEdge = dayStart(LOG_DAYS - 1);
  for (const fault of faults) {
    for (let i = 0; i < fault.runs; i++) {
      const at = fault.from + Math.floor((i * (fault.to - fault.from)) / fault.runs);
      if (at < logEdge || at > shape.nowMs) continue;
      slots.push({ at, day: dayOf(at), live: false, status: "completed", costUnits: 0, durationMs: null });
    }
  }
  if (agent.live) {
    const at = shape.nowMs - agent.live.sinceMs;
    slots.push({ at, day: dayOf(at), live: true, status: agent.live.status, costUnits: 0, durationMs: null });
  }
  const targets = Array.from({ length: HISTORY_DAYS }, (_, d) => target(d));
  for (let d = 0; d < LOG_DAYS; d++) {
    const placed = slots.reduce((n, s) => n + (s.day === d ? 1 : 0), 0);
    const fill = Math.max(0, targets[d] - fixedPerDay[d] - placed);
    const lo = d === 0 ? shape.spanStartMs : dayStart(d);
    const hi = d === 0 ? shape.nowMs : dayStart(d) + DAY_MS;
    for (let i = 0; i < fill; i++) {
      slots.push({ at: lo + Math.floor(rng() * Math.max(1, hi - lo)), day: d, live: false, status: "completed", costUnits: 0, durationMs: null });
    }
  }
  slots.sort((a, b) => b.at - a.at);

  // ── Statuses: the root's newest dots exactly, the odds for the rest; faults last ──
  const pinned = new Set<Slot>();
  if (agent.recentStatuses) {
    let i = 0;
    for (const slot of slots) {
      if (i >= agent.recentStatuses.length) break;
      if (slot.live) continue;
      slot.status = agent.recentStatuses[i++];
      pinned.add(slot);
    }
  }
  for (const slot of slots) if (!slot.live && !pinned.has(slot) && rng() < failP) slot.status = "failed";
  for (const slot of slots) {
    if (!slot.live && faults.some((f) => f.kind === "fail" && slot.at >= f.from && slot.at <= f.to)) slot.status = "failed";
  }

  // ── Durations and cost ──
  for (const slot of slots) {
    if (slot.live) continue;
    const base = duration(slot.day) * (0.8 + 0.4 * rng());
    let ms = Math.min(cap, slot.status === "failed" ? base * 0.5 : base);
    for (const fault of faults) {
      if (fault.kind === "slow" && slot.at >= fault.from && slot.at <= fault.to) ms *= fault.factor;
    }
    slot.durationMs = Math.round(ms);
  }
  const todayBudget = Math.max(0, Math.round(agent.costTodayUsd * COST_UNIT) - fixedCostToday);
  // Today's spend lands on today's finished runs; with none, the run in flight has spent it so far.
  const finishedSlots = slots.filter((s) => s.day === 0 && !s.live);
  const todaySlots = finishedSlots.length > 0 ? finishedSlots : slots.filter((s) => s.day === 0);
  const todayCosts = splitUnits(
    todayBudget,
    todaySlots.map((s) => (s.status === "failed" ? 0.3 : 1) * (0.7 + 0.6 * rng())),
  );
  todaySlots.forEach((s, i) => (s.costUnits = todayCosts[i]));
  for (const slot of slots) {
    if (slot.live || slot.day === 0) continue;
    const units = costPerRun(slot.day) * COST_UNIT * (0.7 + 0.6 * rng()) * (slot.status === "failed" ? 0.3 : 1);
    slot.costUnits = Math.max(1, Math.round(units));
  }

  // ── Ids (oldest first within a day), the log and its days ──
  const days = Array.from({ length: HISTORY_DAYS }, emptyDay);
  const seq = new Array<number>(LOG_DAYS).fill(0);
  const runs: WorldRun[] = new Array(slots.length);
  for (let i = slots.length - 1; i >= 0; i--) {
    const s = slots[i];
    const id = s.live
      ? `run-${agent.agentId}-live-mock`
      : `run-${agent.agentId}-d${s.day}-${String(seq[s.day]++).padStart(4, "0")}-mock`;
    runs[i] = { id, at: s.at, status: s.status, costUnits: s.costUnits, durationMs: s.durationMs };
    foldRun(days[s.day], s.status, s.costUnits, s.durationMs);
  }

  // ── Days beyond the log: aggregates only ──
  for (let d = LOG_DAYS; d < HISTORY_DAYS; d++) {
    const n = targets[d];
    if (n === 0) continue;
    const failed = Math.min(n, Math.round(n * failP * (0.6 + 0.8 * rng())));
    const completed = n - failed;
    const per = costPerRun(d) * COST_UNIT * (0.9 + 0.2 * rng());
    const base = duration(d) * (0.95 + 0.1 * rng());
    days[d] = {
      runs: n,
      completed,
      failed,
      costUnits: Math.round(per * (completed + 0.3 * failed)),
      durationSum: Math.round(base * completed + base * 0.5 * failed),
      timed: n,
    };
  }

  return { agent, runs, days };
}
