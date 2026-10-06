import type { Translations } from "@/i18n/en";
import { topSeverity, type FleetAgent } from "../fleet-data";
import { SEVERITY_COLOR, STATE_COLOR } from "./palette";
import { rankOf } from "./useNightSim";

export type CityCopy = Translations["personasMonitor"]["city"];

/** `fill("{n} runs", { n: 3 })` -> "3 runs". */
export function fill(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export function stateWord(c: CityCopy, a: FleetAgent): string {
  if (!a.enabled) return c.states.off;
  return fill(c.states[a.state], { pct: Math.round((a.progress ?? 0) * 100) });
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The short reason a lantern tag gives, with its colour. */
export function reasonShort(c: CityCopy, a: FleetAgent): { text: string; color: string; key: string } {
  const n = a.reviews.length;
  const many = (one: string, tpl: string) => (n > 1 ? fill(tpl, { n }) : one);
  switch (rankOf(a)) {
    case 0: return { text: c.reasons.failed, color: STATE_COLOR.failed, key: "failed" };
    case 1: return { text: c.reasons.input, color: STATE_COLOR.input_required, key: "input" };
    case 2: return { text: many(c.reasons.critical, c.reasons.criticalMany), color: SEVERITY_COLOR.critical, key: "critical" };
    case 3: return { text: c.reasons.draft, color: STATE_COLOR.draft_ready, key: "draft" };
    case 4: return { text: many(c.reasons.review, c.reasons.reviewMany), color: SEVERITY_COLOR.warning, key: "warning" };
    case 5: return { text: many(c.reasons.info, c.reasons.infoMany), color: SEVERITY_COLOR.info, key: "info" };
    default: return { text: "", color: STATE_COLOR.idle, key: "idle" };
  }
}

/** "4m", "2h 5m", "1d 3h" — a duration. */
export function fmtDur(ms: number): string {
  const m = Math.floor(Math.max(0, ms) / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d >= 1) return `${d}d ${h % 24}h`;
  if (h >= 1) return `${h}h ${m % 60}m`;
  if (m >= 1) return `${m}m`;
  return `${Math.floor(Math.max(0, ms) / 1000)}s`;
}

/** Relative age from minutes. */
export function fmtAgo(c: CityCopy, min: number): string {
  const v = Math.max(0, min);
  if (v < 1) return c.ago.now;
  if (v < 60) return fill(c.ago.min, { n: Math.floor(v) });
  if (v < 1440) return fill(c.ago.hour, { n: Math.floor(v / 60) });
  return fill(c.ago.day, { n: Math.floor(v / 1440) });
}

export const oldestReviewMin = (a: FleetAgent) => a.reviews.reduce((m, r) => Math.max(m, r.ageMin), 0);

export function reviewsLine(c: CityCopy, a: FleetAgent, simMs: number): string {
  const age = fmtAgo(c, oldestReviewMin(a) + simMs / 60000);
  return a.reviews.length === 1 ? fill(c.reviewsOne, { age }) : fill(c.reviewsMany, { n: a.reviews.length, age });
}

export function unreadLine(c: CityCopy, a: FleetAgent): string {
  return a.unreadMessages.length === 1 ? c.unreadOne : fill(c.unreadMany, { n: a.unreadMessages.length });
}

export function windowAria(c: CityCopy, a: FleetAgent, team: string): string {
  let s = fill(c.windowAria, { callsign: a.callsign, name: a.name, team, state: stateWord(c, a) });
  if (a.reviews.length) s += `, ${reviewsLine(c, a, 0)}`;
  if (a.unreadMessages.length) s += `, ${unreadLine(c, a)}`;
  return s;
}

export const sevOf = (a: FleetAgent) => topSeverity(a);
