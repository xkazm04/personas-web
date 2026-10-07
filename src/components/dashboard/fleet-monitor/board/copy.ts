import { FLEET, formatAge, topSeverity } from "../fleet-data";
import { needsTone } from "../attention";
import type { RailItem } from "../NeedsYouRail";
import { TEAM_BY_ID, fill, needAgeMs, needs, pct, plural, queueOf, reasonOf, topReview, type BoardEvent, type SimAgent } from "./model";
import type { PersonasMonitorCopy } from "@/i18n/pending/personasMonitor";

/** The board's copy (`personasMonitorCopy.board`). */
export type BoardCopy = PersonasMonitorCopy["board"];

export function stateText(a: SimAgent, c: BoardCopy): string {
  if (!a.enabled) return c.states.off;
  return c.states[a.state] + (a.state === "running" && a.progress != null ? ` ${pct(a.progress)}` : "");
}

export function shortState(a: SimAgent, c: BoardCopy): string {
  if (!a.enabled) return c.shortStates.off;
  return c.shortStates[a.state] + (a.state === "running" && a.progress != null ? ` ${pct(a.progress)}` : "");
}

/** The agent's task line: data text, a simulation note, or its top review. */
export function taskText(a: SimAgent, c: BoardCopy, fallback?: string): string {
  if (a.task) return a.task;
  if (a.taskKey) return c.tasks[a.taskKey];
  if (a.reviews.length) return topReview(a).title;
  return fallback ?? c.states.idle;
}

export function ago(ms: number, c: BoardCopy): string {
  if (ms < 45_000) return c.time.justNow;
  const m = Math.round(ms / 60_000);
  if (m < 60) return fill(c.time.minutesAgo, { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return fill(c.time.hoursAgo, { n: h });
  return fill(c.time.daysAgo, { n: Math.floor(h / 24) });
}

export function agentAria(a: SimAgent, c: BoardCopy): string {
  const parts = [`${a.callsign} ${a.name}`, TEAM_BY_ID[a.team].name, stateText(a, c).toLowerCase()];
  const sev = topSeverity(a);
  if (sev) parts.push(fill(plural(a.reviews.length, c.tile.reviewsOne, c.tile.reviews), { n: a.reviews.length, severity: c.severity[sev].toLowerCase() }));
  if (a.unreadMessages.length) parts.push(fill(c.tile.unread, { n: a.unreadMessages.length }));
  if (needs(a)) parts.push(c.tile.needsYou);
  return parts.join(", ");
}

/** An event's line: data text when it has one, otherwise rendered from copy. */
export function eventText(e: BoardEvent, c: BoardCopy): string {
  if (e.text) return e.text;
  const d = e.decision;
  if (d) {
    if (d.act === "approve" || d.act === "sendback") return fill(c.decisions[d.act], { title: d.title });
    if (d.act === "read") return fill(plural(d.n, c.decisions.readOne, c.decisions.read), { n: d.n });
    return c.decisions[d.act];
  }
  if (e.kind === "run_completed" || e.kind === "run_failed" || e.kind === "self_heal") return c.simEvents[e.kind];
  return c.kinds[e.kind];
}

/** Epoch ms -> "14:20" (UTC; the demo clock is UTC). */
export function hm(tsMs: number): string {
  return new Date(tsMs).toISOString().slice(11, 16);
}

/** Sim time -> epoch ms on the demo clock. */
export const simNow = (simMs: number) => FLEET.nowMs + simMs;

/** The ranked needs-you queue as rail rows: why (from copy), what about, how long. */
export function railItems(scope: SimAgent[], simMs: number, events: BoardEvent[], c: BoardCopy): RailItem[] {
  return queueOf(scope).map((a) => {
    const r = reasonOf(a);
    const title = r.title ?? (r.cls === "draft_ready" ? c.tasks.draftFallback : null);
    const age = needAgeMs(a, simMs, events);
    return {
      id: a.id,
      callsign: a.callsign,
      name: a.name,
      reason: title ? `${c.reasons[r.cls]} · ${title}` : c.reasons[r.cls],
      tone: needsTone(a),
      age: age != null ? formatAge(age) : undefined,
    };
  });
}
