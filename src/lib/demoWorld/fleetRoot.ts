import { crewDayFigures } from "./crew";
import raw from "./fleet.json";

/* ── The synthetic demo fleet (the demo world's root; the Board reads it
 * through components/dashboard/fleet-monitor/fleet-data.ts) ───────────────────────────────────────
 *
 * Copied from the dashboard-fleet contest (`.contest/arena/dashboard-fleet/
 * data/fleet.json`): 99 agents in nine teams, generated and deterministic.
 * It is a labelled DEMO fleet — every surface that shows it says so — and the
 * only source of numbers on the playground prototypes. "Now" is `FLEET.nowMs`,
 * never `Date.now()`, so every relative time is stable across renders.
 */

export type AgentState =
  | "running"
  | "failed"
  | "input_required"
  | "draft_ready"
  | "queued"
  | "attention"
  | "idle";

export type Severity = "critical" | "warning" | "info";
export type Health = "healthy" | "degraded" | "critical";
export type EventKind =
  | "run_completed"
  | "run_failed"
  | "review_requested"
  | "message"
  | "handoff"
  | "self_heal";

export interface FleetTeam {
  id: string;
  name: string;
  /** Suggested hue on the colour wheel (degrees). */
  hue: number;
}

export interface FleetReview {
  id: string;
  severity: Severity;
  title: string;
  ageMin: number;
}

export interface FleetMessage {
  id: string;
  text: string;
  ageMin: number;
}

export interface FleetAgent {
  id: string;
  /** Short handle, e.g. `IR01`. */
  callsign: string;
  /** Role, e.g. "Invoice Reconciler". */
  name: string;
  team: string;
  hue: number;
  enabled: boolean;
  state: AgentState;
  runningSinceMs: number | null;
  task: string | null;
  progress: number | null;
  runsToday: number;
  successRate: number;
  health: Health;
  /** Newest first. */
  recentStatuses: ("completed" | "failed")[];
  costTodayUsd: number;
  liveToolCalls: number;
  /** Runs per hour, oldest first. */
  spark24h: number[];
  reviews: FleetReview[];
  unreadMessages: FleetMessage[];
}

export interface FleetEvent {
  tsMs: number;
  agentId: string;
  toAgentId: string | null;
  kind: EventKind;
  text: string;
}

export interface FleetEdge {
  a: string;
  b: string;
  messages: number;
}

export interface FleetProcess {
  label: string;
  status: "running" | "queued" | "completed";
  startedAgoMs: number;
}

export interface UsageWindow {
  label: string;
  utilizationPct: number;
  windowMs: number;
  resetsInMs: number;
}

export interface Fleet {
  nowMs: number;
  scales: number[];
  teams: FleetTeam[];
  agents: FleetAgent[];
  /** Newest first. */
  timeline: FleetEvent[];
  channelEdges: FleetEdge[];
  systemProcesses: FleetProcess[];
  usage: { plan: string; windows: UsageWindow[] };
}

/**
 * The fleet as the stage shows it. The five crew agents' day (runs today,
 * spend, success rate, the newest run dots) is projected from the demo
 * world's log (`src/lib/demoWorld/crew.ts`), where the synced personas' runs
 * live, so a crew tile and the Executions, Observability and SLA pages read
 * the same runs. The other 94 agents are `fleet.json` as written, and the
 * world's log is projected from them.
 */
export const FLEET: Fleet = withCrewDays(raw as unknown as Fleet);

function withCrewDays(fleet: Fleet): Fleet {
  const days = crewDayFigures();
  return { ...fleet, agents: fleet.agents.map((a) => ({ ...a, ...days.get(a.id) })) };
}
