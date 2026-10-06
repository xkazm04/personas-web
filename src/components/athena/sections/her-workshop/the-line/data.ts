/**
 * WHEN and WHERE everything happens in "The Line You Set" (workshop lab v3).
 *
 * A field of work, sorted by how much is at stake - routine at the bottom,
 * the things you would want to hear about at the top - cut by one line. The
 * argument, beat by beat:
 *
 *   draw     you draw one line across the field.
 *   under    the first pieces of work land under it, and she simply does them.
 *   over     three land over it; each one comes to you instead.
 *   more     ten times as much arrives at once - she does all of it.
 *   flood    then a hundred more. The line never moves, and one bright pass
 *            runs along it to say so. What reaches you grows only by what is
 *            over the line.
 *   yours    the handle on the line wakes up: drag it - the visitor decides.
 *
 * Every position is authored or derived from a fixed hash (never
 * `Math.random`), so the field is identical every loop and every render.
 * Classification is a pure function of the line's height, which is the only
 * state the visitor can change.
 */

import type { Translations } from "@/i18n/en";

export const TICK_MS = 900;
/** 26 x 900ms = 23.4s per loop. */
export const CYCLE = 26;
export const LINE_AT = 1;
const SWEEP_AT = 17;
const DRAG_AT = 20;
export const STILL_TICK = 21;
const BEATS = [0, 3, 6, 10, 14, DRAG_AT];

/** Where the line starts: a little over halfway up the stakes. */
export const DEFAULT_LINE = 0.6;
export const LINE_MIN = 0.1;
export const LINE_MAX = 0.94;

export interface Item {
  /** 0..1 across the field. */
  x: number;
  /** 0..1 how much is at stake (0 = routine). */
  s: number;
  /** Tick it lands; fractional part becomes a CSS delay. */
  at: number;
  /** Index into v3.items, for the eight that carry a name. */
  label?: number;
}

/** The eight named pieces of work, authored so no two names collide. */
const NAMED: Item[] = [
  { x: 0.16, s: 0.1, at: 3, label: 0 },
  { x: 0.44, s: 0.15, at: 3.4, label: 1 },
  { x: 0.74, s: 0.3, at: 4, label: 2 },
  { x: 0.2, s: 0.37, at: 4.4, label: 3 },
  { x: 0.56, s: 0.48, at: 5, label: 4 },
  { x: 0.3, s: 0.7, at: 6, label: 5 },
  { x: 0.7, s: 0.8, at: 7, label: 6 },
  { x: 0.36, s: 0.9, at: 8, label: 7 },
];

const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** The volume: 40 more at "ten times", 150 more at "a hundred". Routine work
 *  is far commoner than work with something at stake - the ratio is the point. */
function batch(n: number, start: number, span: number, seed: number): Item[] {
  return Array.from({ length: n }, (_, i) => ({
    x: 0.04 + hash(seed + i * 2) * 0.92,
    // About one in ten has something at stake; the rest is routine.
    s: hash(seed + i * 3 + 2) < 0.1 ? 0.62 + hash(seed + i * 2 + 1) * 0.34 : 0.03 + hash(seed + i * 2 + 1) * 0.52,
    at: start + (i / n) * span,
  }));
}

export const ITEMS: readonly Item[] = [...NAMED, ...batch(40, 10, 1.6, 7), ...batch(150, 14, 2.4, 911)];

export type ItemState = "pending" | "new" | "done" | "yours";

export function itemState(it: Item, phase: number, line: number): ItemState {
  if (phase < Math.floor(it.at)) return "pending";
  if (it.s >= line) return "yours";
  return phase >= Math.floor(it.at) + 1 ? "done" : "new";
}

export interface Scene {
  drawn: boolean;
  sweep: boolean;
  invite: boolean;
  beat: number;
  calm: boolean;
  busy: boolean;
}

export function sceneAt(phase: number): Scene {
  return {
    drawn: phase >= LINE_AT,
    sweep: phase >= SWEEP_AT && phase < SWEEP_AT + 2,
    invite: phase >= DRAG_AT,
    beat: BEATS.filter((b) => phase >= b).length - 1,
    calm: phase >= DRAG_AT,
    busy: phase >= 3 && phase < DRAG_AT,
  };
}

export function tally(phase: number, line: number) {
  let done = 0;
  let yours = 0;
  const named: number[] = [];
  ITEMS.forEach((it) => {
    const st = itemState(it, phase, line);
    if (st === "done") done += 1;
    if (st === "yours") {
      yours += 1;
      if (it.label !== undefined) named.push(it.label);
    }
  });
  return { done, yours, named: named.reverse() };
}

type Copy = Translations["athenaSections"]["workshop"]["v3"];

export function statusAt(beat: number, c: Copy): [string, string] {
  return [c.status.full[beat], c.status.short[beat]];
}
