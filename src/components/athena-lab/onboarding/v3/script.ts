/**
 * v3 "Two Cursors" — the board's geometry and its script. Everything is a
 * percent of the art box, so the two cursors can aim at the exact place a
 * control is drawn. One deterministic cycle, pure phase functions; the words
 * live in i18n.
 *
 * Two rounds, the second faster than the first, because by then you know the
 * moves:
 *   round 1   you pick the job · she drags Slack, then Gmail, into the card and
 *             connects them · you pick when · she presses Start · the card
 *             flies into Running.
 *   round 2   the same, quicker: Inbox triage, Gmail, on new mail, Start.
 *   hold      two agents running; the board rests.
 */

import type { ToolId } from "../shared/ToolGlyph";

export const CYCLE = 25;
export const TICK_MS = 1000;
/** Reduced motion: round 2's card half built over a lane that already holds
 *  round 1's agent — both hands visibly at work, nothing missing. */
export const STILL_TICK = 17;
export const ART_AR = 2.2;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Pt {
  x: number;
  y: number;
}

/* ── Geometry ─────────────────────────────────────────────────────────── */

export const TRAY: Box = { x: 2.5, y: 13, w: 19, h: 83 };
export const TOOLS: ToolId[] = ["slack", "gmail", "github", "notion"];
export const tile = (i: number): Box => ({ x: 3.5, y: 23 + i * 18, w: 17, h: 14 });

export const CARD: Box = { x: 26, y: 13, w: 40, h: 83 };
export const option = (i: number): Box => ({ x: 28 + i * 12.4, y: 33, w: 11.6, h: 9 });
export const socket = (i: number): Box => ({ x: 28 + i * 18.4, y: 52, w: 17.6, h: 11 });
export const when = (i: number): Box => ({ x: 28 + i * 18.4, y: 72, w: 17.6, h: 9 });
export const START: Box = { x: 28, y: 85, w: 36, h: 8.5 };

export const LANE: Box = { x: 70, y: 13, w: 27.5, h: 83 };
export const laneRow = (i: number): Box => ({ x: 71.5, y: 22 + i * 24.5, w: 24.5, h: 21 });
/** Slots in the Running lane — one more than the scene fills, so it reads
 *  as a place that has room for what you set up next. */
export const LANE_SLOTS = 3;

const mid = (b: Box): Pt => ({ x: b.x + b.w * 0.55, y: b.y + b.h * 0.6 });

/* ── Rounds ───────────────────────────────────────────────────────────── */

export interface Round {
  /** Which job you pick (option index) and which "when" chip. */
  job: number;
  when: number;
  /** The tools she brings in, in order (tray indices). */
  tools: number[];
  start: number;
  pick: number;
  /** Per tool: the tick she grabs it and the tick she drops it in. */
  grab: number[];
  drop: number[];
  pickWhen: number;
  press: number;
  launch: number;
}

export const ROUNDS: Round[] = [
  { job: 0, when: 0, tools: [0, 1], start: 0, pick: 2, grab: [3, 5], drop: [4, 6], pickWhen: 9, press: 11, launch: 12 },
  { job: 1, when: 1, tools: [1], start: 13, pick: 14, grab: [15], drop: [16], pickWhen: 18, press: 19, launch: 20 },
];

export const roundAt = (phase: number): number => (phase >= ROUNDS[1].start ? 1 : 0);

/* ── Cursors ──────────────────────────────────────────────────────────── */

export type Act = "click" | null;
export interface CursorState {
  at: Pt;
  act: Act;
  /** The tool tile riding under her cursor while she drags it. */
  carry: ToolId | null;
}

const YOU_REST: Pt = { x: 23.5, y: 90 };
const HER_REST: Pt = { x: 76, y: 6 };
const HER_WAIT: Pt = { x: 67.5, y: 60 };

export function youAt(phase: number): CursorState {
  const r = ROUNDS[roundAt(phase)];
  if (phase === r.pick - 1 || phase === r.pick) return { at: mid(option(r.job)), act: phase === r.pick ? "click" : null, carry: null };
  if (phase === r.pickWhen - 1 || phase === r.pickWhen) return { at: mid(when(r.when)), act: phase === r.pickWhen ? "click" : null, carry: null };
  return { at: YOU_REST, act: null, carry: null };
}

export function herAt(phase: number): CursorState {
  const r = ROUNDS[roundAt(phase)];
  for (let k = 0; k < r.tools.length; k++) {
    const t = TOOLS[r.tools[k]];
    if (phase === r.grab[k]) return { at: mid(tile(r.tools[k])), act: "click", carry: null };
    if (phase === r.drop[k]) return { at: mid(socket(k)), act: "click", carry: t };
  }
  if (phase === r.press - 1 || phase === r.press) return { at: mid(START), act: phase === r.press ? "click" : null, carry: null };
  if (phase === r.launch) return { at: mid(laneRow(roundAt(phase))), act: null, carry: null };
  if (phase < ROUNDS[0].grab[0] || phase > ROUNDS[1].launch) return { at: HER_REST, act: null, carry: null };
  return { at: HER_WAIT, act: null, carry: null };
}

/** What her name tag says right now (a key into the copy), or nothing. */
export type HerLine = "yourCall" | "connecting" | "starting" | null;
export function herLineAt(phase: number): HerLine {
  const r = ROUNDS[roundAt(phase)];
  if (phase >= r.grab[0] && phase <= r.drop[r.drop.length - 1]) return "connecting";
  if (phase === r.press || phase === r.press - 1) return "starting";
  if (phase === r.pick || phase === r.pickWhen) return "yourCall";
  return null;
}

/* ── The card and the lane ────────────────────────────────────────────── */

export type SocketState = "empty" | "connecting" | "connected";

export interface CardState {
  /** 0 and 1 are the two agents; 2 is the empty card waiting for the next. */
  round: number;
  picked: boolean;
  sockets: SocketState[];
  whenPicked: boolean;
  pressed: boolean;
  launched: boolean;
}

export function cardAt(phase: number): CardState {
  if (phase > ROUNDS[1].launch) {
    return { round: 2, picked: false, sockets: [], whenPicked: false, pressed: false, launched: false };
  }
  const round = roundAt(phase);
  const r = ROUNDS[round];
  return {
    round,
    picked: phase >= r.pick,
    sockets: r.tools.map((_, k) => (phase < r.drop[k] ? "empty" : phase === r.drop[k] ? "connecting" : "connected")),
    whenPicked: phase >= r.pickWhen,
    pressed: phase >= r.press,
    launched: phase >= r.launch,
  };
}

/** Activity bars per running agent: deterministic heights that shift one
 *  step per tick, so the lane reads as work happening, never random. */
const ACTIVITY = [40, 72, 55, 90, 35, 64, 80, 48, 96, 58, 70, 44];
export const activityAt = (phase: number, row: number): number[] =>
  Array.from({ length: 10 }, (_, i) => ACTIVITY[(i + phase + row * 5) % ACTIVITY.length]);

/** How many agents are in the Running lane. */
export const runningAt = (phase: number): number => ROUNDS.filter((r) => phase >= r.launch).length;
