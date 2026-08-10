/**
 * WHERE the setup route goes: the four stops in order, each with the control
 * it targets and the spot the orb hovers while narrating it. WHEN each beat
 * fires lives in `./data`, which stamps the tick grid onto these.
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
  /** ≤5-word caption narrated beside the orb while locked. */
  caption: string;
  /** The control the brackets lock onto (md+ / <md). */
  rect: Rect;
  rectCompact: Rect;
  /** Where the orb hovers while narrating this stop (md+ / <md). */
  orb: Point;
  orbCompact: Point;
}

/** Pick a starting point → connect a tool → choose when it runs → create the
 *  agent for real. Four choices, in the order a person would make them. */
export const ROUTE: RouteStop[] = [
  {
    id: "template",
    caption: "pick a starting point",
    rect: { x: 3.5, y: 16.5, w: 27, h: 26 },
    rectCompact: { x: 4, y: 15.5, w: 92, h: 22 },
    orb: { x: 61, y: 29 },
    orbCompact: { x: 64, y: 31 },
  },
  {
    id: "connect",
    caption: "connect your Slack",
    rect: { x: 5.5, y: 51.5, w: 51.5, h: 6 },
    rectCompact: { x: 6, y: 47.5, w: 88, h: 6 },
    orb: { x: 61, y: 48 },
    orbCompact: { x: 64, y: 56 },
  },
  {
    id: "trigger",
    caption: "choose when it runs",
    rect: { x: 3.5, y: 80, w: 55.5, h: 16 },
    rectCompact: { x: 4, y: 70, w: 92, h: 15 },
    orb: { x: 61, y: 76 },
    orbCompact: { x: 64, y: 82.5 },
  },
  {
    id: "action",
    caption: "one click — it's live",
    rect: { x: 63.5, y: 80, w: 33, h: 13 },
    rectCompact: { x: 4, y: 88.5, w: 92, h: 8 },
    orb: { x: 61, y: 86.5 },
    orbCompact: { x: 50, y: 78.4 },
  },
];

/** Where the orb rests before and after the setup — upper right, off the UI. */
export const DOCK: Point = { x: 88, y: 5.5 };
