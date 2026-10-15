import type { LeaderboardPersona } from "../mock-dashboard-data";
import { anchorAnnotations, periodTrend, type ChartAnnotation } from "../observabilitySeries";
import { standings, type SnapshotRow } from "../standings";
import type {
  DailyMetric,
  ExecFilterOpts,
  ExecutionDetail,
  GlobalExecution,
  ObservabilityMetrics,
  Persona,
  PersonaSpend,
} from "../types";
import { fixedRunOf } from "./crew";
import { demoFleetLog, type FleetWorldLog } from "./fleetLog";
import {
  COST_UNIT,
  DAY_MS,
  HISTORY_DAYS,
  LOG_DAYS,
  daysAgoOf,
  foldRun,
  hashSeed,
  isoOf,
  utcDate,
  type AgentLog,
  type DayAgg,
  type WorldRun,
} from "./generate";
import { DEMO_COST_SPIKE } from "./shape";

/* ── Reads over the demo world (loaded with it, by dynamic import) ──
 *
 * Every analytic read the demo serves is a fold of ONE log: the world's
 * generated runs (`fleetLog.ts`) plus the session's rows (`MOCK_EXECUTIONS`:
 * the crew's authored runs and whatever the scripted desktop has written this
 * session), each run counted once, on its creation day. So the executions
 * list, the daily series, the totals and trends, the per-agent spend and the
 * leaderboard's snapshots cannot disagree: they are the same rows, summed.
 *
 * Population: the whole demo fleet (the Board's 99 agents). A crew persona
 * deleted this session leaves every read, as the desktop's cascade would.
 */

/** What the reads take from the session: its rows and its roster, as they are now. */
export interface Session {
  rows: readonly GlobalExecution[];
  personas: readonly Persona[];
}

const MODEL = "claude-sonnet-4-5-20250929";
const FAILURES = [
  "Run failed: tool timeout",
  "Run failed: upstream returned 503",
  "Run failed: rate limited by the provider",
];

const crewIds = (world: FleetWorldLog) => world.crewFixed;

/** A crew persona the session deleted: its runs leave every read. */
function goneFrom(world: FleetWorldLog, session: Session): (personaId: string) => boolean {
  const live = new Set(session.personas.map((p) => p.id));
  return (personaId) => crewIds(world).has(personaId) && !live.has(personaId);
}

const iso = isoOf;

/** One generated run as the row the desktop would sync. */
function toExecution(log: AgentLog, run: WorldRun): GlobalExecution {
  const { agent } = log;
  const cost = run.costUnits / COST_UNIT;
  const done = run.status === "completed" || run.status === "failed";
  const started = run.status === "queued" ? null : run.at + 1_200;
  return {
    id: run.id,
    personaId: agent.personaId,
    triggerId: null,
    useCaseId: null,
    status: run.status,
    inputData: null,
    outputData: run.status === "completed" ? "Run completed." : null,
    claudeSessionId: null,
    modelUsed: MODEL,
    inputTokens: Math.round(cost * 180_000),
    outputTokens: Math.round(cost * 45_000),
    costUsd: cost,
    errorMessage: run.status === "failed" ? FAILURES[hashSeed(run.id) % FAILURES.length] : null,
    durationMs: done ? run.durationMs : null,
    retryOfExecutionId: null,
    retryCount: 0,
    startedAt: started === null ? null : iso(started),
    completedAt: done && started !== null ? iso(started + (run.durationMs ?? 0)) : null,
    createdAt: iso(run.at),
    personaName: agent.name,
    personaIcon: undefined,
    personaColor: agent.color,
  };
}

const rowsMemo = new WeakMap<FleetWorldLog, { rows: GlobalExecution[]; ats: number[]; byId: Map<string, GlobalExecution> }>();

/** The world's generated runs as rows, newest first (built once per world). */
export function worldRows(world: FleetWorldLog = demoFleetLog()) {
  let held = rowsMemo.get(world);
  if (!held) {
    const pairs = world.logs.flatMap((log) => log.runs.map((run) => ({ at: run.at, row: toExecution(log, run) })));
    pairs.sort((a, b) => b.at - a.at);
    const rows = pairs.map((p) => p.row);
    held = { rows, ats: pairs.map((p) => p.at), byId: new Map(rows.map((r) => [r.id, r])) };
    rowsMemo.set(world, held);
  }
  return held;
}

/** `api.listExecutions` for the demo: the world's runs and the session's, newest first. */
export function listWorldExecutions(session: Session, opts: ExecFilterOpts = {}, world = demoFleetLog()): GlobalExecution[] {
  const gone = goneFrom(world, session);
  const own = session.rows
    .map((row) => ({ row, at: Date.parse(row.createdAt) }))
    .sort((a, b) => b.at - a.at);
  const { rows: generated, ats } = worldRows(world);
  const keep = (r: GlobalExecution) =>
    !gone(r.personaId) && (!opts.personaId || r.personaId === opts.personaId) && (!opts.status || r.status === opts.status);
  const out: GlobalExecution[] = [];
  let i = 0;
  let j = 0;
  while (i < own.length || j < generated.length) {
    const takeOwn = j >= generated.length || (i < own.length && own[i].at >= ats[j]);
    const row = takeOwn ? own[i++].row : generated[j++];
    if (keep(row)) out.push(row);
  }
  const offset = Math.max(0, opts.offset ?? 0);
  return opts.limit === undefined ? out.slice(offset) : out.slice(offset, offset + Math.max(0, opts.limit));
}

/** A generated run's detail, or null when the world holds no such run. */
export function worldExecutionDetail(id: string, world = demoFleetLog()): ExecutionDetail | null {
  const row = worldRows(world).byId.get(id);
  if (!row) return null;
  return {
    executionId: id,
    status: row.status,
    outputLines: 0,
    output: row.outputData ? row.outputData.split("\n") : row.errorMessage ? [row.errorMessage] : [],
    durationMs: row.durationMs ?? undefined,
    totalCostUsd: row.costUsd,
  };
}

/**
 * Every agent's days with the session's rows folded in (index = days ago):
 * the one fold every aggregate below sums. Crew days are copied (the session
 * changes them); the 94 stage agents' days are read as built.
 */
export function agentDays(session: Session, world = demoFleetLog()): Map<string, { log: AgentLog; days: DayAgg[] }> {
  const gone = goneFrom(world, session);
  const out = new Map<string, { log: AgentLog; days: DayAgg[] }>();
  for (const log of world.logs) {
    const id = log.agent.personaId;
    if (gone(id)) continue;
    out.set(id, { log, days: world.crewFixed.has(id) ? log.days.map((d) => ({ ...d })) : log.days });
  }
  for (const row of session.rows) {
    const held = out.get(row.personaId);
    if (!held) continue;
    const run = fixedRunOf(row);
    const d = daysAgoOf(run.at, world.shape.todayStartMs);
    if (d >= 0 && d < HISTORY_DAYS) foldRun(held.days[d], run.status, run.costUnits, run.durationMs);
  }
  return out;
}

type Days = ReturnType<typeof agentDays>;

function dailyOver(days: Days, world: FleetWorldLog, from: number, to: number): DailyMetric[] {
  const out: DailyMetric[] = [];
  for (let d = to; d >= from; d--) {
    let executions = 0;
    let successes = 0;
    let failures = 0;
    let units = 0;
    for (const { days: agent } of days.values()) {
      const day = agent[d];
      executions += day.runs;
      successes += day.completed;
      failures += day.failed;
      units += day.costUnits;
    }
    out.push({ date: utcDate(world.shape.todayStartMs - d * DAY_MS), cost: units / COST_UNIT, executions, successes, failures });
  }
  return out;
}

/** The 14-day window, oldest first: one row per UTC day, today last. */
export function worldDaily(days: Days, world = demoFleetLog()): DailyMetric[] {
  return dailyOver(days, world, 0, LOG_DAYS - 1);
}

/** The 14 days before the window, oldest first (the Compare overlay and the trends). */
export function worldPrior(days: Days, world = demoFleetLog()): DailyMetric[] {
  return dailyOver(days, world, LOG_DAYS, 2 * LOG_DAYS - 1);
}

/** Agents with at least one run, per day of the window, oldest first (the active-agents sparkline). */
export function activeAgentsPerDay(days: Days): number[] {
  return Array.from({ length: LOG_DAYS }, (_, i) => {
    const d = LOG_DAYS - 1 - i;
    let n = 0;
    for (const { days: agent } of days.values()) if (agent[d].runs > 0) n++;
    return n;
  });
}

/** Enabled agents now: the crew from the session's roster, the stage from the Board. */
function enabledAgents(days: Days, session: Session): number {
  const enabled = new Map(session.personas.map((p) => [p.id, p.enabled]));
  let n = 0;
  for (const { log } of days.values()) if (enabled.get(log.agent.personaId) ?? log.agent.enabled) n++;
  return n;
}

export function worldMetrics(daily: DailyMetric[], prior: DailyMetric[], activePersonas: number): ObservabilityMetrics {
  const sum = (pick: (d: DailyMetric) => number) => daily.reduce((a, d) => a + pick(d), 0);
  const executions = sum((d) => d.executions);
  const trend = periodTrend(daily, prior);
  return {
    totalCost: +sum((d) => d.cost).toFixed(2),
    totalExecutions: executions,
    successRate: executions > 0 ? +((sum((d) => d.successes) / executions) * 100).toFixed(1) : 0,
    activePersonas,
    costTrend: +trend.cost.toFixed(1),
    execTrend: +trend.executions.toFixed(1),
    successTrend: +trend.success.toFixed(1),
  };
}

/** Spend per agent over the window, the costliest first (agents that ran nothing are left out). */
export function worldSpend(days: Days, world = demoFleetLog()): PersonaSpend[] {
  const out: PersonaSpend[] = [];
  for (const { log, days: agent } of days.values()) {
    let units = 0;
    let runs = 0;
    for (let d = 0; d < LOG_DAYS; d++) {
      units += agent[d].costUnits;
      runs += agent[d].runs;
    }
    if (runs === 0) continue;
    out.push({
      personaId: log.agent.personaId,
      personaName: log.agent.name,
      personaColor: log.agent.color,
      totalCost: units / COST_UNIT,
      executionCount: runs,
      budgetUsd: world.budgets.get(log.agent.personaId) ?? null,
    });
  }
  return out.sort((a, b) => b.totalCost - a.totalCost || a.personaId.localeCompare(b.personaId));
}

/** `api.getObservability` for the demo. */
export function observabilityOf(session: Session, world = demoFleetLog()) {
  const days = agentDays(session, world);
  const dailyMetrics = worldDaily(days, world);
  const prior = worldPrior(days, world);
  return {
    metrics: worldMetrics(dailyMetrics, prior, enabledAgents(days, session)),
    dailyMetrics,
    personaSpend: worldSpend(days, world),
    prior,
    activeAgents: activeAgentsPerDay(days),
    /** The agents these figures cover: the demo fleet. */
    agents: days.size,
  };
}

/** One snapshot row per agent per day it ran: the leaderboard engine's input. */
export function worldSnapshots(days: Days, world = demoFleetLog()): SnapshotRow[] {
  const out: SnapshotRow[] = [];
  for (const { log, days: agent } of days.values()) {
    agent.forEach((day, d) => {
      const finished = day.completed + day.failed;
      if (finished === 0) return;
      out.push({
        persona_id: log.agent.personaId,
        snapshot_date: utcDate(world.shape.todayStartMs - d * DAY_MS),
        total_executions: finished,
        successful_executions: day.completed,
        total_cost_usd: day.costUnits / COST_UNIT,
        avg_duration_ms: day.timed > 0 ? day.durationSum / day.timed : 0,
      });
    });
  }
  return out;
}

/**
 * The demo leaderboard: `standings()` (the engine the Supabase plane ranks
 * synced snapshots with) over the world's snapshots, as of today.
 */
export function worldLeaderboard(session: Session, world = demoFleetLog()): LeaderboardPersona[] {
  const days = agentDays(session, world);
  const meta = new Map([...days.values()].map(({ log }) => [log.agent.personaId, log.agent]));
  return standings(worldSnapshots(days, world), utcDate(world.shape.todayStartMs)).flatMap((s) => {
    const agent = meta.get(s.id);
    if (!agent) return [];
    return [{
      id: s.id,
      name: agent.name,
      color: agent.color,
      metrics: s.metrics,
      composite: s.composite,
      trend: s.trend,
      delta: s.delta,
      rankHistory: s.rankHistory,
    }];
  });
}

/** Run-count milestones the annotation marks: the window passed the last one it reached. */
const MILESTONE_STEP = 10_000;

/**
 * The Performance charts' annotations, anchored to days of the window: the
 * day the fleet's runs in the window passed a round number, the declared cost
 * spike's rollout, and today's Slack outage.
 */
export function worldAnnotations(daily: DailyMetric[]): ChartAnnotation[] {
  const total = daily.reduce((a, d) => a + d.executions, 0);
  const mark = Math.floor(total / MILESTONE_STEP) * MILESTONE_STEP;
  let running = 0;
  const hit = mark > 0 ? daily.findIndex((d) => (running += d.executions) >= mark) : -1;
  return anchorAnnotations(daily, [
    ...(hit >= 0 ? [{ dayOffset: daily.length - 1 - hit, label: `${mark / 1000}k runs`, type: "milestone" as const }] : []),
    { dayOffset: DEMO_COST_SPIKE.dayAgo, label: "v2.1 deployed", type: "deployment" },
    { dayOffset: 0, label: "Slack outage", type: "incident" },
  ]);
}
