// Pure projections of the event log onto the event-bus visualization.
//
// The topology, the particles and the throughput counters are all derived from
// the same `PersonaEvent[]` the Events list reads, so every mark on the bus is
// backed by an event. Nothing here reads the clock or a random source: callers
// pass `now`, which keeps these functions testable and safe in render paths.

import type { PersonaEvent } from "./types";

/** Default look-back for the bus ring. */
export const BUS_WINDOW_MS = 48 * 3_600_000;
/** Width of the sliding window the events-per-minute counter measures. */
export const THROUGHPUT_WINDOW_MS = 60_000;

/** The bus's failure colour: a dead letter bursts in this on its source node. */
export const BUS_DEAD_LETTER_COLOR = "#ef4444";

export interface BusSource {
  /** The distinct `sourceType` this node stands for. */
  id: string;
  label: string;
  color: string;
  /** Events from this source inside the window. */
  count: number;
  /** Dead letters among them. */
  deadLetters: number;
  /** Share of the busiest source, 0-1 (the busiest is 1). */
  volume: number;
}

const SOURCE_LABELS: Record<string, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  pagerduty: "PagerDuty",
  jira: "Jira",
  stripe: "Stripe",
  slack: "Slack",
  email: "Email",
  dependabot: "Dependabot",
  scheduler: "Scheduler",
  execution: "Execution",
  webhook: "Webhooks",
};

const SOURCE_COLORS: Record<string, string> = {
  github: "#8b949e",
  gitlab: "#fc6d26",
  pagerduty: "#34d399",
  jira: "#60a5fa",
  stripe: "#a855f7",
  slack: "#e01e5a",
  email: "#fbbf24",
  dependabot: "#06b6d4",
  scheduler: "#a855f7",
  execution: "#06b6d4",
};

const FALLBACK_PALETTE = ["#06b6d4", "#a855f7", "#fbbf24", "#34d399", "#60a5fa", "#f472b6"];

/** Stable, non-cryptographic string hash (FNV-1a). */
export function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function sourceLabel(sourceType: string): string {
  return SOURCE_LABELS[sourceType] ?? (sourceType ? sourceType.charAt(0).toUpperCase() + sourceType.slice(1) : sourceType);
}

export function sourceColor(sourceType: string): string {
  return SOURCE_COLORS[sourceType] ?? FALLBACK_PALETTE[hashString(sourceType) % FALLBACK_PALETTE.length];
}

function inWindow(event: PersonaEvent, now: number, windowMs: number): boolean {
  const at = Date.parse(event.createdAt);
  // An unparseable timestamp cannot be placed in a window, so it is not drawn.
  return Number.isFinite(at) && at <= now && at >= now - windowMs;
}

/**
 * The bus ring: one node per distinct `sourceType` seen in the window, busiest
 * first (ties by name) so the layout is stable between polls. An empty window
 * is an empty ring - the caller draws the idle state, not invented sources.
 */
export function busTopology(events: readonly PersonaEvent[], now: number, windowMs: number = BUS_WINDOW_MS): BusSource[] {
  const tally = new Map<string, { count: number; deadLetters: number }>();
  for (const event of events) {
    if (!event.sourceType || !inWindow(event, now, windowMs)) continue;
    const entry = tally.get(event.sourceType) ?? { count: 0, deadLetters: 0 };
    entry.count += 1;
    if (event.status === "dead_letter") entry.deadLetters += 1;
    tally.set(event.sourceType, entry);
  }
  const max = Math.max(1, ...[...tally.values()].map((entry) => entry.count));
  return [...tally.entries()]
    .map(([id, { count, deadLetters }]) => ({
      id,
      label: sourceLabel(id),
      color: sourceColor(id),
      count,
      deadLetters,
      volume: count / max,
    }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}

export interface BusThroughput {
  /** Events that arrived in the last minute. */
  perMinute: number;
  /** Events in the buffer. */
  total: number;
  /** Distinct sources seen in the topology window. */
  sources: number;
}

/** Measured counters for the stats strip, from the same log as the ring. */
export function throughput(events: readonly PersonaEvent[], now: number, windowMs: number = BUS_WINDOW_MS): BusThroughput {
  let perMinute = 0;
  for (const event of events) {
    if (inWindow(event, now, THROUGHPUT_WINDOW_MS)) perMinute += 1;
  }
  return { perMinute, total: events.length, sources: busTopology(events, now, windowMs).length };
}

/**
 * The events a particle layer has not drawn yet: those whose id is not in
 * `seen`. Pure; the caller owns (and updates) the set. One event, one particle.
 */
export function unseenEvents(events: readonly PersonaEvent[], seen: ReadonlySet<string>): PersonaEvent[] {
  return events.filter((event) => !seen.has(event.id));
}
