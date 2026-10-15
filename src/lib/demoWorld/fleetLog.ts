import { FLEET, type FleetAgent } from "@/components/dashboard/fleet-monitor/fleet-data";
import { crewPersonaId } from "../demoCrew";
import { CREW_DAYS, crewWorld, type CrewWorld } from "./crew";
import { generateAgentLog, hashSeed, mulberry32, type AgentLog, type FixedRun, type WorldAgent, type WorldShape } from "./generate";

/* ── The whole demo world's log (loaded on demand) ──────────────────
 *
 * The root is the Board's fleet: `fleet.json`'s 99 agents. The five crew
 * agents' logs come from `crew.ts` (the synced personas, their authored runs
 * and faults); the other 94 are projected here from their Board tiles: today
 * reproduces each tile exactly (runs today, spend today, success rate, the
 * newest run dots, the run in flight), and the 13 days before it plus the
 * aggregate history are seeded from the same record.
 *
 * This module imports `fleet.json` (~140 KB), so nothing on the dashboard's
 * first load may import it: `mockApi` reaches it by dynamic import, and the
 * Board (which already holds `fleet.json`) never needs it. Built once per
 * load (`demoFleetLog`), then read by `fleetReads.ts`.
 */

export interface FleetWorldLog {
  shape: WorldShape;
  /** Every agent's log, in Board order (the crew's from `crew.ts`). */
  logs: AgentLog[];
  /** The crew's authored runs (served by `MOCK_EXECUTIONS`, folded in by the reader). */
  crewFixed: ReadonlyMap<string, FixedRun[]>;
  /** A persona's 14-day budget, where the root declares one (the crew). */
  budgets: ReadonlyMap<string, number>;
}

/** The id a stage-only agent's runs carry: minted once, marked as demo data. */
export function stagePersonaId(agentId: string): string {
  return `fleet-${agentId}-mock`;
}

/** `hsl(hue, 68%, 58%)` as `#rrggbb`: a stage agent's colour on the synced pages. */
export function hueHex(hue: number): string {
  const s = 0.68;
  const l = 0.58;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `#${[f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("")}`;
}

const MIN = 60_000;

/** A stage-only agent's tile as a root record for the generator. */
export function stageAgent(a: FleetAgent): WorldAgent {
  const rng = mulberry32(hashSeed("stage", a.id));
  const running = a.state === "running" || a.state === "input_required";
  let live: WorldAgent["live"] = running
    ? { status: "running", sinceMs: a.runningSinceMs ?? Math.round((5 + rng() * 35) * MIN) }
    : a.state === "queued"
      ? { status: "queued", sinceMs: Math.round(30_000 + rng() * 90_000) }
      : null;
  // A run in flight is one of today's runs; an agent that ran nothing today has none.
  if (a.runsToday === 0) live = null;
  const finished = a.runsToday - (live ? 1 : 0);
  return {
    agentId: a.id,
    personaId: stagePersonaId(a.id),
    name: a.name,
    color: hueHex(a.hue),
    team: a.team,
    enabled: a.enabled,
    runsToday: a.runsToday,
    successRate: a.successRate,
    costTodayUsd: a.costTodayUsd,
    recentStatuses: a.recentStatuses,
    live,
    durationMs: Math.round(6_000 + rng() * 84_000),
    typicalRuns: a.runsToday > 0 ? a.runsToday : 4 + Math.floor(rng() * 12),
    costPerRunUsd: finished > 0 && a.costTodayUsd > 0 ? a.costTodayUsd / finished : 0.02 + rng() * 0.1,
  };
}

/** The world's log from the crew's world and the Board's agents (pure). */
export function buildFleetWorld(crew: CrewWorld, agents: readonly FleetAgent[]): FleetWorldLog {
  const crewLogs = new Map(crew.logs.map((log) => [log.agent.agentId, log]));
  const logs = agents.flatMap((a): AgentLog[] => {
    if (crewPersonaId(a.id)) {
      const log = crewLogs.get(a.id);
      return log ? [log] : [];
    }
    return [generateAgentLog(stageAgent(a), crew.shape)];
  });
  const budgets = new Map(Object.entries(CREW_DAYS).map(([personaId, day]) => [personaId, day.budgetUsd]));
  return { shape: crew.shape, logs, crewFixed: crew.fixed, budgets };
}

let memo: FleetWorldLog | null = null;

/** The demo's world log, built on first read. */
export function demoFleetLog(): FleetWorldLog {
  memo ??= buildFleetWorld(crewWorld(), FLEET.agents);
  return memo;
}
