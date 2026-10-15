/**
 * The demo's crew: the five synced personas (`MOCK_PERSONAS`, the people on
 * the phone, in Executions, Reviews, the leaderboard and Director) ARE five
 * agents on the Personas stage's 99-agent demo fleet (`fleet.json`). The
 * other 94 agents are stage-only.
 *
 * Identity direction: the persona is the source. Each crew agent in
 * `fleet.json` carries its persona's name, its colour's hue, its enabled flag
 * and its pending reviews (by event id); the persona fixtures keep their
 * stories and numbers unchanged. Picked by role, not by position: the
 * positional prefix (Invoice Reconciler, Ticket Triager, ...) fits none of
 * the five stories. `mockFleetConsistency.test.ts` holds every pair together.
 *
 * Pure and import-free, so both the fixtures side and the stage side (and a
 * later projection of the analytic views from the fleet) can read it.
 */

export interface CrewPair {
  /** `MOCK_PERSONAS` id, what `api.listPersonas()` serves in demo. */
  personaId: string;
  /** `fleet.json` agent id. */
  agentId: string;
}

export const DEMO_CREW: readonly CrewPair[] = [
  // Engineering Desk, was "PR Reviewer" (PR04).
  { personaId: "p-0001-mock", agentId: "p004" },
  // Infra Watch, was "Alert Deduper" (AD63): triages alerts.
  { personaId: "p-0002-mock", agentId: "p063" },
  // Engineering Desk, was "Changelog Writer" (CW85): summarizes the team's activity.
  { personaId: "p-0003-mock", agentId: "p085" },
  // Engineering Desk, already "Security Scanner" (SS94).
  { personaId: "p-0004-mock", agentId: "p094" },
  // Customer Support, was "Sentiment Scanner" (SS47): reads tickets and surveys.
  { personaId: "p-0005-mock", agentId: "p047" },
];

const BY_AGENT = new Map(DEMO_CREW.map((c) => [c.agentId, c.personaId]));
const BY_PERSONA = new Map(DEMO_CREW.map((c) => [c.personaId, c.agentId]));

/** The persona a fleet agent is, or null for a stage-only agent. */
export function crewPersonaId(agentId: string): string | null {
  return BY_AGENT.get(agentId) ?? null;
}

/** The fleet agent a persona is on the stage, or null. */
export function crewAgentId(personaId: string): string | null {
  return BY_PERSONA.get(personaId) ?? null;
}

/** The hue (degrees, rounded) of a `#rrggbb` colour: how a persona's colour reads on the stage. */
export function hueOf(hex: string): number {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return 0;
  const [r, g, b] = [m[1], m[2], m[3]].map((x) => parseInt(x, 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d === 0) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round((h * 60 + 360) % 360);
}
