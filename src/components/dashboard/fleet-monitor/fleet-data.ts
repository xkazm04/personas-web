import raw from "./fleet.json";

/* ── The synthetic demo fleet ───────────────────────────────────────
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

export const FLEET = raw as unknown as Fleet;

export type FleetScale = 10 | 30 | 99;
export const FLEET_SCALES: readonly FleetScale[] = [10, 30, 99];
export const DEFAULT_FLEET_SCALE: FleetScale = 99;

/** States that need a human, in triage order. */
export const NEEDS_YOU_STATES: readonly AgentState[] = ["failed", "input_required", "draft_ready"];

const SEVERITY_RANK: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

/** An agent needs you when it failed, waits for input, has a draft to approve,
 *  or holds a pending review. */
export function needsYou(agent: FleetAgent): boolean {
  return NEEDS_YOU_STATES.includes(agent.state) || agent.reviews.length > 0;
}

/** The most severe pending review, or null. */
export function topSeverity(agent: FleetAgent): Severity | null {
  let top: Severity | null = null;
  for (const r of agent.reviews) {
    if (top === null || SEVERITY_RANK[r.severity] < SEVERITY_RANK[top]) top = r.severity;
  }
  return top;
}

/** Lower is more urgent. Failed beats waiting beats drafts; a critical review
 *  lifts an otherwise calm agent above a draft. */
export function urgency(agent: FleetAgent): number {
  const stateRank = NEEDS_YOU_STATES.indexOf(agent.state);
  const sev = topSeverity(agent);
  const reviewRank = sev === null ? 9 : SEVERITY_RANK[sev] + 1.5;
  return Math.min(stateRank === -1 ? 9 : stateRank, reviewRank);
}

/** The first `scale` agents (prefixes span several teams on purpose), with
 *  only the teams, edges and events that touch them. */
export function sliceFleet(scale: FleetScale): Fleet {
  const agents = FLEET.agents.slice(0, scale);
  const ids = new Set(agents.map((a) => a.id));
  const teamIds = new Set(agents.map((a) => a.team));
  return {
    ...FLEET,
    agents,
    teams: FLEET.teams.filter((t) => teamIds.has(t.id)),
    timeline: FLEET.timeline.filter((e) => ids.has(e.agentId) && (e.toAgentId === null || ids.has(e.toAgentId))),
    channelEdges: FLEET.channelEdges.filter((e) => ids.has(e.a) && ids.has(e.b)),
  };
}

/** `ageMs` -> "4m", "2h 05m", "3d". */
export function formatAge(ageMs: number): string {
  const min = Math.max(0, Math.round(ageMs / 60_000));
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 48) return `${h}h ${String(min % 60).padStart(2, "0")}m`;
  return `${Math.floor(h / 24)}d`;
}

/** `tsMs` -> "14:20:05" in UTC (the demo clock is UTC). */
export function formatClock(tsMs: number): string {
  return new Date(tsMs).toISOString().slice(11, 19);
}
