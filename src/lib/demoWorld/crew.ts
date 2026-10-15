import { crewAgentId } from "../demoCrew";
import type { HeatmapRow, SLABreach, SLAMetricType, SLASeverity, SLATarget } from "../mock-dashboard-data";
import { MOCK_EXECUTIONS, MOCK_PERSONAS } from "../mockData";
import { breachEpisodes, sli, type SliPoint } from "../sloEngine";
import type { GlobalExecution } from "../types";
import {
  COST_UNIT,
  DAY_MS,
  HISTORY_DAYS,
  daysAgoOf,
  foldRun,
  generateAgentLog,
  utcDate,
  type AgentLog,
  type DayAgg,
  type FinishedStatus,
  type FixedRun,
  type RunStatus,
  type WorldAgent,
  type WorldFault,
  type WorldShape,
} from "./generate";
import { worldShape } from "./shape";

/* ── The crew's part of the demo world (synchronous) ────────────────
 *
 * The world's roster is the Board's fleet (`fleet.json`, 99 agents). Five of
 * them are the synced personas (`src/lib/demoCrew.ts`), and for those five the
 * persona side is the source (the D2 rule): their day, their authored runs
 * (`MOCK_EXECUTIONS`), the faults their incident threads tell, and the
 * objectives SLA holds them to are declared here. The Board's crew tiles are
 * projected FROM this log (`crewDayFigures`, read by `fleet-data.ts`), never
 * the other way round, so a tile and the pages cannot disagree.
 *
 * Small and import-light on purpose: SLA, the incident threads (D3) and the
 * home heatmap read it synchronously on the dashboard's first load, while the
 * other 94 agents (and `fleet.json`) load only when a fleet read asks
 * (`fleetLog.ts`, by dynamic import).
 */

const MIN = 60_000;
const HOUR = 3_600_000;

const PR = "p-0001-mock";
const INCIDENT = "p-0002-mock";
const STANDUP = "p-0003-mock";
const SECURITY = "p-0004-mock";
const FEEDBACK = "p-0005-mock";

interface CrewDay {
  /** Runs created today, in any state: the crew tile's "runs today". */
  runsToday: number;
  costTodayUsd: number;
  /** Odds a run completes on an ordinary day (faults aside); the tile's rate is then read off its newest runs. */
  successRate: number;
  durationMs: number;
  /** No ordinary run exceeds this: the agent meets its latency objective on a normal day. */
  durationCapMs?: number;
  /** What the persona may spend over the 14-day window (the spend card's bar). */
  budgetUsd: number;
}

/**
 * Each crew persona's day so far. `runsToday` and `costTodayUsd` are the
 * Board's own figures for the agent (`fleet.json`; pinned equal by
 * `world.test.ts`); success rate and the newest statuses follow from the runs.
 */
export const CREW_DAYS: Readonly<Record<string, CrewDay>> = {
  [PR]: { runsToday: 40, costTodayUsd: 3.95, successRate: 1, durationMs: 18_000, durationCapMs: 27_000, budgetUsd: 80 },
  [INCIDENT]: { runsToday: 37, costTodayUsd: 1.71, successRate: 0.83, durationMs: 25_000, durationCapMs: 40_000, budgetUsd: 40 },
  [STANDUP]: { runsToday: 5, costTodayUsd: 0.09, successRate: 1, durationMs: 15_000, budgetUsd: 2 },
  [SECURITY]: { runsToday: 51, costTodayUsd: 2.5, successRate: 0.75, durationMs: 24_000, durationCapMs: 27_000, budgetUsd: 60 },
  [FEEDBACK]: { runsToday: 28, costTodayUsd: 0.87, successRate: 1, durationMs: 40_000, budgetUsd: 20 },
};

export interface CrewObjective {
  id: string;
  personaId: string;
  metric: SLAMetricType;
  /** Percent for availability / success rate; a mean-duration ceiling (ms) for latency. */
  target: number;
}

/**
 * The objectives the demo sets, one per crew persona (the other 94 agents have
 * none). Availability is measured as the share of runs that delivered, the
 * same ratio SLI the engine computes for success rate.
 */
export const CREW_OBJECTIVES: readonly CrewObjective[] = [
  { id: "sla_1", personaId: INCIDENT, metric: "latency", target: 45_000 },
  { id: "sla_2", personaId: PR, metric: "latency", target: 30_000 },
  { id: "sla_3", personaId: FEEDBACK, metric: "successRate", target: 98 },
  { id: "sla_4", personaId: SECURITY, metric: "latency", target: 30_000 },
  { id: "sla_5", personaId: STANDUP, metric: "availability", target: 99.5 },
];

/** A declared fault and the breach SLA reads it as (when the engine finds one). */
export interface CrewFault extends Omit<WorldFault, "agentId"> {
  personaId: string;
  metric: SLAMetricType;
  severity: SLASeverity;
  summary: (worst: number) => string;
  /** The incident thread the breach belongs to (lib/incidentThreads.ts). */
  causeKey?: string;
}

/**
 * What went wrong in the crew's last two days. The engine decides whether each
 * one breached; the breach takes the fault's id, so the incident threads, the
 * correlated incidents and every `?focus=` link keep their identity. Today's
 * faults run up to now (still open); yesterday's are anchored to the UTC day.
 */
export function crewFaults(shape: WorldShape): CrewFault[] {
  const now = shape.nowMs;
  const yesterday = shape.todayStartMs - DAY_MS;
  return [
    {
      id: "br_1",
      personaId: STANDUP,
      metric: "availability",
      kind: "fail",
      factor: 1,
      from: now - 45 * MIN,
      to: now,
      runs: 3,
      severity: "critical",
      causeKey: "slack-circuit-break",
      summary: () => "Slack webhook circuit-broken; 3 retries exhausted.",
    },
    {
      id: "br_2",
      personaId: SECURITY,
      metric: "latency",
      kind: "slow",
      factor: 3,
      from: now - 3 * HOUR,
      to: now,
      runs: 12,
      severity: "major",
      causeKey: "security-latency",
      summary: () => "P95 latency sustained above 30s target.",
    },
    {
      id: "br_3",
      personaId: FEEDBACK,
      metric: "successRate",
      kind: "fail",
      factor: 1,
      from: yesterday + 10 * HOUR,
      to: yesterday + 12 * HOUR,
      runs: 2,
      severity: "major",
      summary: (worst) => `Success rate fell to ${Math.round(worst)}% during CSV parser regression.`,
    },
    {
      id: "br_4",
      personaId: INCIDENT,
      metric: "latency",
      kind: "slow",
      factor: 5,
      from: yesterday + 9 * HOUR,
      to: yesterday + 13 * HOUR,
      runs: 8,
      severity: "minor",
      summary: () => "Upstream search-API latency spike, recovered autonomously.",
    },
  ];
}

/** An authored run as a slot in its day. */
export function fixedRunOf(e: Pick<GlobalExecution, "createdAt" | "status" | "costUsd" | "durationMs">): FixedRun {
  return { at: Date.parse(e.createdAt), status: e.status, costUnits: Math.round(e.costUsd * COST_UNIT), durationMs: e.durationMs };
}

export interface CrewWorld {
  shape: WorldShape;
  agents: WorldAgent[];
  logs: AgentLog[];
  /** The authored runs each persona's log was built around (as seeded). */
  fixed: ReadonlyMap<string, FixedRun[]>;
  faults: CrewFault[];
}

/** The crew's world for a clock and the authored runs (pure; `crewWorld()` is the demo's). */
export function buildCrewWorld(shape: WorldShape, authored: readonly GlobalExecution[] = MOCK_EXECUTIONS): CrewWorld {
  const faults = crewFaults(shape);
  const fixed = new Map<string, FixedRun[]>();
  const agents: WorldAgent[] = [];
  const logs: AgentLog[] = [];
  for (const persona of MOCK_PERSONAS) {
    const day = CREW_DAYS[persona.id];
    const agentId = crewAgentId(persona.id);
    if (!day || !agentId) continue;
    const own = authored.filter((e) => e.personaId === persona.id).map(fixedRunOf);
    fixed.set(persona.id, own);
    const agent: WorldAgent = {
      agentId,
      personaId: persona.id,
      name: persona.name,
      color: persona.color ?? "#64748b",
      // No crew agent sits in the team the declared cost spike hit.
      team: "crew",
      enabled: persona.enabled,
      runsToday: day.runsToday,
      successRate: day.successRate,
      costTodayUsd: day.costTodayUsd,
      live: null,
      durationMs: day.durationMs,
      durationCapMs: day.durationCapMs,
      typicalRuns: day.runsToday,
      costPerRunUsd: day.costTodayUsd / Math.max(1, day.runsToday),
    };
    const ownFaults = faults.filter((f) => f.personaId === persona.id).map((f) => ({ ...f, agentId }));
    agents.push(agent);
    logs.push(generateAgentLog(agent, shape, own, ownFaults));
  }
  return { shape, agents, logs, fixed, faults };
}

let memo: CrewWorld | null = null;

/** The demo's crew world: built once, from the authored runs as the session began. */
export function crewWorld(): CrewWorld {
  memo ??= buildCrewWorld(worldShape());
  return memo;
}

/** A log's days with its authored runs folded in (index = days ago). */
export function daysWithFixed(log: AgentLog, fixed: readonly FixedRun[], todayStartMs: number): DayAgg[] {
  const days = log.days.map((d) => ({ ...d }));
  for (const f of fixed) {
    const d = daysAgoOf(f.at, todayStartMs);
    if (d >= 0 && d < HISTORY_DAYS) foldRun(days[d], f.status, f.costUnits, f.durationMs);
  }
  return days;
}

interface TimedRun {
  at: number;
  status: RunStatus;
  durationMs: number | null;
}

/** Every run of a persona (generated and authored), oldest first. */
function timeline(log: AgentLog, fixed: readonly FixedRun[]): TimedRun[] {
  return [...log.runs, ...fixed].sort((a, b) => a.at - b.at);
}

const finished = (s: RunStatus): s is FinishedStatus => s === "completed" || s === "failed";

export interface CrewDayFigures {
  runsToday: number;
  costTodayUsd: number;
  successRate: number;
  recentStatuses: FinishedStatus[];
}

/** The crew tiles' day, as the log has it (Board agent id -> figures). */
export function crewDayFigures(world: CrewWorld = crewWorld()): Map<string, CrewDayFigures> {
  const out = new Map<string, CrewDayFigures>();
  for (const log of world.logs) {
    const fixed = world.fixed.get(log.agent.personaId) ?? [];
    const today = daysWithFixed(log, fixed, world.shape.todayStartMs)[0];
    const recentStatuses = timeline(log, fixed)
      .filter((r) => finished(r.status))
      .slice(-12)
      .reverse()
      .map((r) => r.status as FinishedStatus);
    const completed = recentStatuses.filter((s) => s === "completed").length;
    out.set(log.agent.agentId, {
      runsToday: today.runs,
      costTodayUsd: Math.round(today.costUnits / 100) / 100,
      // The Board's rate is over its dots (fleet.json holds that for every tile).
      successRate: recentStatuses.length > 0 ? Math.round((completed / recentStatuses.length) * 100) / 100 : 1,
      recentStatuses,
    });
  }
  return out;
}

/** Days the SLO engine reads (the demo's objective window). */
export const SLO_WINDOW_DAYS = 30;

const sliMetric = (metric: SLAMetricType) => (metric === "latency" ? "latency" : "successRate");

/**
 * SLA for the crew, through the engine the Supabase plane uses: each
 * objective's daily SLI over the window (`sli`), its breach episodes
 * (`breachEpisodes`). The engine is day-granular; the log then dates each
 * episode inside its days: it began at the first bad run (a failure, or a run
 * over the latency ceiling) and, once closed, recovered at the first good run
 * after the last bad one.
 */
export function crewSla(world: CrewWorld = crewWorld()): { targets: SLATarget[]; breaches: SLABreach[] } {
  const { shape } = world;
  const targets: SLATarget[] = [];
  const breaches: SLABreach[] = [];
  for (const objective of CREW_OBJECTIVES) {
    const persona = MOCK_PERSONAS.find((p) => p.id === objective.personaId);
    const log = world.logs.find((l) => l.agent.personaId === objective.personaId);
    if (!persona || !log) continue;
    const fixed = world.fixed.get(persona.id) ?? [];
    const days = daysWithFixed(log, fixed, shape.todayStartMs);
    const points: SliPoint[] = [];
    for (let d = SLO_WINDOW_DAYS - 1; d >= 0; d--) {
      const day = days[d];
      const timed = day.timed > 0 ? day.durationSum / day.timed : undefined;
      points.push({ date: utcDate(shape.todayStartMs - d * DAY_MS), total: day.completed + day.failed, good: day.completed, durationMs: timed });
    }
    const latency = objective.metric === "latency";
    const direction = latency ? "lower" : "higher";
    const series = sli(points, sliMetric(objective.metric));
    const breaching = (v: number) => (latency ? v > objective.target : v < objective.target);
    const episodes = breachEpisodes(series, { target: objective.target, direction });
    const latest = series.at(-1)?.value ?? (latency ? 0 : 100);
    const name = persona.name;
    const color = persona.color ?? "#64748b";
    targets.push({
      id: objective.id,
      persona: name,
      personaColor: color,
      metric: objective.metric,
      target: objective.target,
      current: latency ? Math.round(latest) : Math.round(latest * 10) / 10,
      unit: latency ? "ms" : "%",
      timeInSLA: series.length > 0 ? Math.round((series.filter((p) => !breaching(p.value)).length / series.length) * 1000) / 1000 : 1,
      direction,
      activeBreach: episodes.some((e) => e.ongoing),
    });

    const runs = timeline(log, fixed);
    const bad = (r: TimedRun) =>
      finished(r.status) && (latency ? (r.durationMs ?? 0) > objective.target : r.status === "failed");
    for (const episode of episodes) {
      const lo = Date.parse(`${episode.start}T00:00:00Z`);
      const hi = Date.parse(`${episode.end}T00:00:00Z`) + DAY_MS;
      const inside = runs.filter((r) => r.at >= lo && r.at < hi && bad(r));
      const startedAt = inside[0]?.at ?? lo;
      let resolvedAt: number | null = null;
      if (!episode.ongoing) {
        const lastBad = inside.at(-1)?.at ?? hi;
        resolvedAt = runs.find((r) => r.at > lastBad && finished(r.status) && !bad(r))?.at ?? hi;
      }
      const fault = world.faults.find(
        (f) => f.personaId === objective.personaId && f.metric === objective.metric && f.from < hi && f.to >= lo,
      );
      breaches.push({
        id: fault?.id ?? `br_${objective.metric}_${objective.personaId}_${episode.start}`,
        persona: name,
        metric: objective.metric,
        startedAt: new Date(startedAt).toISOString(),
        resolvedAt: resolvedAt === null ? null : new Date(resolvedAt).toISOString(),
        durationMinutes: Math.round(((resolvedAt ?? shape.nowMs) - startedAt) / MIN),
        severity: fault?.severity ?? (latency ? (episode.worst > objective.target * 1.5 ? "major" : "minor") : episode.worst < 80 ? "critical" : "major"),
        summary: fault
          ? fault.summary(episode.worst)
          : latency
            ? `Mean run latency reached ${Math.round(episode.worst / 1000)}s against the ${Math.round(objective.target / 1000)}s objective.`
            : `Success rate fell to ${episode.worst.toFixed(1)}% against the ${objective.target}% objective.`,
        ...(fault?.causeKey ? { causeKey: fault.causeKey } : {}),
      });
    }
  }
  breaches.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  return { targets, breaches };
}

/** The crew's runs per UTC day, the last `days` days oldest first (the home heatmap). */
export function crewHeatmap(days: number, world: CrewWorld = crewWorld()): HeatmapRow[] {
  return world.logs.map((log) => {
    const all = daysWithFixed(log, world.fixed.get(log.agent.personaId) ?? [], world.shape.todayStartMs);
    return {
      persona: log.agent.name,
      color: log.agent.color,
      days: Array.from({ length: days }, (_, i) => all[days - 1 - i].runs),
    };
  });
}
