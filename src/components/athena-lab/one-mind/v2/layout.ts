/**
 * Scene geometry for "One Day" (lab v2) - percent of the art slot.
 *
 * Wide: the day reads left to right. Three moments stand side by side under
 * the arc the day's light travels, and one line runs under all three: her.
 * Each moment has a stop on that line, and at every stop sits the same face.
 *
 * Compact (phones): the day reads top to bottom, the line runs down the left
 * edge, and the sky is dropped - the times in the moments' headers carry it.
 */

import type { Point, Rect } from "../shared/types";
import type { TokenPlace } from "./data";

export interface DayLayout {
  moments: readonly Rect[];
  stops: readonly Point[];
  /** The line is horizontal (wide) or vertical (compact). */
  axis: "x" | "y";
  /** Where the day's light stands over each stop; null = no sky. */
  sky: readonly Point[] | null;
  skyPath: string | null;
}

/** Inside a moment: where your words and hers sit, as fractions of it. */
const SAID = { x: 0.72, y: 0.34 };
const HERS = { x: 0.36, y: 0.58 };

/** The sky: one quadratic over the whole width, highest at noon. */
const SKY = { from: { x: 1, y: 13 }, ctrl: { x: 50, y: -9 }, to: { x: 99, y: 13 } };

function onSky(x: number): Point {
  const t = (x - SKY.from.x) / (SKY.to.x - SKY.from.x);
  const u = 1 - t;
  return { x, y: u * u * SKY.from.y + 2 * t * u * SKY.ctrl.y + t * t * SKY.to.y };
}

const WIDE_MOMENTS: Rect[] = [
  { x: 0, y: 17, w: 31.5, h: 66 },
  { x: 34.25, y: 17, w: 31.5, h: 66 },
  { x: 68.5, y: 17, w: 31.5, h: 66 },
];

export const WIDE: DayLayout = {
  moments: WIDE_MOMENTS,
  stops: WIDE_MOMENTS.map((m) => ({ x: m.x + m.w / 2, y: 92 })),
  axis: "x",
  sky: WIDE_MOMENTS.map((m) => onSky(m.x + m.w / 2)),
  skyPath: `M ${SKY.from.x} ${SKY.from.y} Q ${SKY.ctrl.x} ${SKY.ctrl.y}, ${SKY.to.x} ${SKY.to.y}`,
};

const COMPACT_MOMENTS: Rect[] = [
  { x: 13, y: 0, w: 87, h: 31.5 },
  { x: 13, y: 34.25, w: 87, h: 31.5 },
  { x: 13, y: 68.5, w: 87, h: 31.5 },
];

export const COMPACT: DayLayout = {
  moments: COMPACT_MOMENTS,
  stops: COMPACT_MOMENTS.map((m) => ({ x: 5, y: m.y + m.h / 2 })),
  axis: "y",
  sky: null,
  skyPath: null,
};

export const layoutFor = (compact: boolean): DayLayout => (compact ? COMPACT : WIDE);

const inside = (m: Rect, f: { x: number; y: number }): Point => ({
  x: m.x + m.w * f.x,
  y: m.y + m.h * f.y,
});

/** Where a token is drawn for a place on its journey. */
export function tokenPoint(L: DayLayout, place: TokenPlace): Point | null {
  if (place.at === "none") return null;
  if (place.at === "said") return inside(L.moments[place.stop], SAID);
  if (place.at === "line") {
    // Beside the face at that stop, never on it.
    const s = L.stops[place.stop];
    return L.axis === "x" ? { x: s.x + 9, y: s.y } : { x: s.x + 20, y: s.y + 11 };
  }
  return inside(L.moments[place.stop], HERS);
}
