import { needsYou, topSeverity, type AgentState, type FleetAgent } from "./fleet-data";

/* ── One state language for every prototype ─────────────────────────
 *
 * At 100 agents the eye has to sort the field into four piles before it reads
 * a single label. Every view draws these four the same way, in its own medium:
 *
 *   working  - doing something now: lit, moving (brand cyan)
 *   needs    - waiting on a human: the loudest thing on screen
 *              (amber; red when failed or a critical review)
 *   resting  - queued or idle: present but quiet (neutral, dim)
 *   off      - switched off: hatched / shuttered, quieter still
 *
 * `needs` wins over `working`: an agent that is running AND holds a pending
 * review is drawn as needing you, with its activity as a secondary cue.
 */
export type Attention = "needs" | "working" | "resting" | "off";
export type AttentionTone = "critical" | "warning";

export function attentionOf(agent: Pick<FleetAgent, "state" | "enabled" | "reviews">): Attention {
  if (needsYou(agent as FleetAgent)) return "needs";
  if (!agent.enabled) return "off";
  if (agent.state === "running") return "working";
  return "resting";
}

/** Red for a failure or a critical review, amber for everything else that needs you. */
export function needsTone(agent: Pick<FleetAgent, "state" | "reviews">): AttentionTone {
  return agent.state === "failed" || topSeverity(agent as FleetAgent) === "critical" ? "critical" : "warning";
}

/** CSS colour per attention pile, from site tokens only. */
export const ATTENTION_COLOR: Record<Attention | AttentionTone, string> = {
  working: "var(--brand-cyan)",
  needs: "var(--status-warning)",
  warning: "var(--status-warning)",
  critical: "var(--status-error)",
  resting: "color-mix(in oklab, var(--foreground) 32%, transparent)",
  off: "color-mix(in oklab, var(--foreground) 14%, transparent)",
};

export interface AttentionCounts {
  needs: number;
  critical: number;
  working: number;
  resting: number;
  off: number;
  total: number;
}

export function countAttention(agents: readonly FleetAgent[]): AttentionCounts {
  const c: AttentionCounts = { needs: 0, critical: 0, working: 0, resting: 0, off: 0, total: agents.length };
  for (const a of agents) {
    const k = attentionOf(a);
    c[k] += 1;
    if (k === "needs" && needsTone(a) === "critical") c.critical += 1;
  }
  return c;
}

/** States that read as "needs you" by themselves (not via a review). */
export const NEEDS_STATES: readonly AgentState[] = ["failed", "input_required", "draft_ready"];
