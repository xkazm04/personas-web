import { FLEET, type AgentState, type Fleet, type FleetAgent, type Severity } from "@/lib/demoWorld/fleetRoot";

// The fleet's data and types live with the demo world (src/lib/demoWorld/fleetRoot.ts),
// which projects its run log from them; the Board reads them from here.
export { FLEET };
export type { AgentState, Severity, Health, EventKind, FleetTeam, FleetReview, FleetMessage, FleetAgent, FleetEvent, FleetEdge, FleetProcess, UsageWindow, Fleet } from "@/lib/demoWorld/fleetRoot";

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
