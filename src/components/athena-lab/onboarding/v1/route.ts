/**
 * WHERE the setup route goes: the four stops in order, each with the control
 * it targets and the spot the orb hovers while narrating it. WHEN each beat
 * fires lives in `./data`, which stamps the tick grid onto these. WHAT she
 * says at each one is `athenaPage.onboarding.captions` in `src/i18n`, keyed by
 * the same `StopId` — this file is pure geometry and carries no words.
 *
 * Rects are percent boxes over the app canvas and mirror `./layout`, so the
 * corner brackets — reading the same numbers — always frame the real control.
 * Both breakpoint sets stay in lockstep: `rect`/`orb` at md+, `rectCompact`/
 * `orbCompact` below it. Change one, change its twin.
 */

import type { Point, Rect } from "./layout";

export type StopId = "template" | "connect" | "trigger" | "action";

export interface RouteStop {
  id: StopId;
  /** The control the brackets lock onto (md+ / <md). */
  rect: Rect;
  rectCompact: Rect;
  /** Where the orb hovers while narrating this stop (md+ / <md). */
  orb: Point;
  orbCompact: Point;
  /** Which side of her the caption opens on (md+), so it never covers the
   *  control she is framing — it lands over a module that is still a ghost. */
  side: "left" | "right" | "up";
}

/** Pick a starting point → connect a tool → choose when it runs → create the
 *  agent for real. Four choices, in the order a person would make them. */
export const ROUTE: RouteStop[] = [
  {
    id: "template",
    rect: { x: 2.5, y: 22, w: 28, h: 38 },
    rectCompact: { x: 4, y: 15.5, w: 92, h: 22 },
    orb: { x: 31.75, y: 33 },
    orbCompact: { x: 64, y: 31 },
    side: "right",
  },
  {
    id: "connect",
    rect: { x: 34.5, y: 22.5, w: 31, h: 10.5 },
    rectCompact: { x: 6, y: 47.5, w: 88, h: 6 },
    orb: { x: 68.25, y: 27.75 },
    orbCompact: { x: 64, y: 56 },
    side: "right",
  },
  {
    id: "trigger",
    rect: { x: 33, y: 71.5, w: 34, h: 25.5 },
    rectCompact: { x: 4, y: 70, w: 92, h: 15 },
    orb: { x: 68.25, y: 64 },
    orbCompact: { x: 64, y: 82.5 },
    side: "right",
  },
  {
    id: "action",
    rect: { x: 69.5, y: 82, w: 28, h: 15 },
    rectCompact: { x: 4, y: 88.5, w: 92, h: 8 },
    orb: { x: 83.5, y: 80 },
    orbCompact: { x: 50, y: 78.4 },
    side: "up",
  },
];

/** Where the orb rests before and after the setup — the toolbar's reserved
 *  right end, so she never parks on a control. */
export const DOCK: Point = { x: 94, y: 6.5 };
