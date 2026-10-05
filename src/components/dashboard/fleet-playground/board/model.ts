import {
  FLEET,
  needsYou,
  topSeverity,
  type FleetAgent,
  type FleetEvent,
  type Severity,
} from "../fleet-data";
import { attentionOf, type Attention } from "../attention";

/* ── Board model: the live copy of the fleet and the rules that rank it ── */

/** Text the simulation writes into an agent's task line; rendered from copy. */
export type TaskKey = "toolTimeout" | "revising" | "resuming" | "retrying" | "nextBatch";

export interface SimAgent extends FleetAgent {
  idx: number;
  /** Sim time the current run started at (negative: it started before the page opened). */
  startSim: number | null;
  taskKey: TaskKey | null;
}

export type Decision =
  | { act: "approve" | "sendback"; title: string }
  | { act: "retry" | "answer" }
  | { act: "read"; n: number };

export type BoardEventKind = FleetEvent["kind"] | "decision";

export interface BoardEvent {
  tsMs: number;
  agentId: string;
  toAgentId: string | null;
  kind: BoardEventKind;
  /** Data text (seeded events, replayed messages); null when copy renders it. */
  text: string | null;
  decision?: Decision;
}

export type ReasonClass = "failed" | "input_required" | "critical" | "draft_ready" | "warning" | "info";

export const TEAM_BY_ID = Object.fromEntries(FLEET.teams.map((t, i) => [t.id, { ...t, idx: i }]));

/** Running tasks per team: the pool a restarted agent draws its next task from. */
export const TEAM_TASKS: Record<string, string[]> = {};
for (const a of FLEET.agents) {
  if (a.state === "running" && a.task) (TEAM_TASKS[a.team] ??= []).push(a.task);
}

export const MESSAGE_TEXTS = Array.from(
  new Set(FLEET.timeline.filter((e) => e.kind === "message" || e.kind === "handoff").map((e) => e.text)),
);

const SEV_ORDER: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

export const needs = needsYou;

export function topReview(a: FleetAgent) {
  return [...a.reviews].sort((x, y) => SEV_ORDER[x.severity] - SEV_ORDER[y.severity] || y.ageMin - x.ageMin)[0];
}

const oldestAge = (a: FleetAgent) => a.reviews.reduce((m, r) => Math.max(m, r.ageMin), 0);

/** Triage rank, lower first: failed, waiting, critical review, draft, warning, info. */
export function rank(a: FleetAgent): number {
  if (a.state === "failed") return 0;
  if (a.state === "input_required") return 1;
  const s = topSeverity(a);
  if (s === "critical") return 2;
  if (a.state === "draft_ready") return 3;
  if (s === "warning") return 4;
  return 5;
}

export function queueOf(list: SimAgent[]): SimAgent[] {
  return list.filter(needs).sort((x, y) => rank(x) - rank(y) || oldestAge(y) - oldestAge(x) || x.idx - y.idx);
}

/** Why this agent needs you, and the data line that says what about. */
export function reasonOf(a: FleetAgent): { cls: ReasonClass; title: string | null } {
  const s = topSeverity(a);
  const tr = a.reviews.length ? topReview(a) : null;
  if (a.state === "failed") return { cls: "failed", title: a.task ? a.task.replace(/^Last run failed: /, "") : null };
  if (a.state === "input_required") return { cls: "input_required", title: tr?.title ?? null };
  if (s === "critical") return { cls: "critical", title: tr!.title };
  if (a.state === "draft_ready") return { cls: "draft_ready", title: tr?.title ?? null };
  if (s === "warning") return { cls: "warning", title: tr!.title };
  return { cls: "info", title: tr?.title ?? null };
}

/** How long it has needed you: its oldest review, or the age of its failure. */
export function needAgeMs(a: SimAgent, simMs: number, events: BoardEvent[]): number | null {
  if (a.reviews.length) return (oldestAge(a) + simMs / 60_000) * 60_000;
  const ev = events.find((e) => e.agentId === a.id && e.kind === "run_failed");
  return ev ? FLEET.nowMs + simMs - ev.tsMs : null;
}

/** The densest grid of `n` cells that fits `w`×`h`, with sane tile proportions
 *  and, optionally, a floor on tile width. */
export function gridFit(n: number, w: number, h: number, g: number, maxW = 1e9, maxH = 1e9, minW = 0) {
  let best = { cols: 1, rows: 1, tw: w, th: h, score: -1 };
  for (let cols = 1; cols <= Math.max(1, n); cols++) {
    const rows = Math.ceil(n / cols);
    let tw = (w - (cols - 1) * g) / cols;
    // A column count that would starve a tile below `minW` is never chosen
    // (one column always is, so there is always an answer).
    if (cols > 1 && tw < minW) break;
    let th = (h - (rows - 1) * g) / rows;
    tw = Math.min(tw, th * 2.6, maxW);
    th = Math.min(th, tw * 1.45, maxH);
    const score = tw * th * (1 - 0.04 * (rows * cols - n));
    if (score > best.score) best = { cols, rows, tw, th, score };
  }
  return best;
}

/* ── Deterministic randomness ── */

export function hash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** One mulberry32 step as a pure function: `[value in 0..1, next seed]`. */
export function rand(seed: number): [number, number] {
  const a = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, a];
}

/** A stateful mulberry32 for render-time art (deterministic per seed). */
export function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    const [v, next] = rand(s);
    s = next;
    return v;
  };
}

/** Fill `{name}` placeholders in a copy template. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}

const pad = (n: number) => String(n).padStart(2, "0");

/** A run's age: "4m 05s", "1h 12m". */
export function formatRunFor(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${pad(m)}m` : `${m}m ${pad(s % 60)}s`;
}

export const pct = (x: number) => `${Math.round(x * 100)}%`;

/** The singular or plural template for a count (English copy; one/other). */
export const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

const ATTENTION_RANK: Record<Attention, number> = { needs: 0, working: 1, resting: 2, off: 3 };

/** A bay's reading order: needs first (most urgent first), then working,
 *  resting, off; fleet order within each pile. It depends only on state, so
 *  tiles move only when an agent changes pile, not on every tick. */
export function orderInBay(list: SimAgent[]): SimAgent[] {
  return [...list].sort((x, y) => {
    const ax = attentionOf(x), ay = attentionOf(y);
    return ATTENTION_RANK[ax] - ATTENTION_RANK[ay] || (ax === "needs" ? rank(x) - rank(y) : 0) || x.idx - y.idx;
  });
}
