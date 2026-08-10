/**
 * WHERE Athena goes in section 4, and how long each stop is allowed to take.
 * WHEN each beat fires lives in `./data`, which stamps a tick grid onto these;
 * the rects themselves live in `./layout`, and a stop names its target rather
 * than restating it, so the brackets can never frame the wrong box.
 *
 * The arc is one continuous sentence: you ask, she drafts, YOU correct her,
 * you start it, and the work happens. The third stop is the one the section
 * exists for.
 */

import type { Point, SceneLayout } from "./layout";

export type StopId = "ask" | "plan" | "edit" | "start" | "work";

/** Which rect in the layout a stop's brackets lock onto. */
export type TargetId = "composer" | "plan" | "editRow" | "confirm" | "board";

export interface RouteStop {
  id: StopId;
  /** The step, narrated in <= 5 words beside her. */
  caption: string;
  /** Which way the caption leans at sm+ so it never covers the live module. */
  captionSide: "left" | "right";
  target: TargetId;
  /** Where she hovers while narrating this stop (md+ / <md). */
  orb: Point;
  orbCompact: Point;
  /** How many ticks this stop owns, start to finish. */
  ticks: number;
  /** Ticks after arrival-1 (i.e. after `revealAt`) at which the choice commits. */
  commitAt: number;
}

export const ROUTE: RouteStop[] = [
  {
    id: "ask",
    caption: "just say what you want",
    captionSide: "left",
    target: "composer",
    orb: { x: 82, y: 21 },
    orbCompact: { x: 76, y: 17.5 },
    ticks: 6,
    commitAt: 4,
  },
  {
    id: "plan",
    caption: "a plan, before anything runs",
    captionSide: "right",
    target: "plan",
    orb: { x: 55.5, y: 31 },
    orbCompact: { x: 84, y: 21 },
    ticks: 5,
    commitAt: 3,
  },
  {
    id: "edit",
    caption: "change anything you like",
    captionSide: "right",
    target: "editRow",
    orb: { x: 55.5, y: 52 },
    orbCompact: { x: 84, y: 40.5 },
    ticks: 4,
    commitAt: 3,
  },
  {
    id: "start",
    caption: "nothing starts until you do",
    captionSide: "right",
    target: "confirm",
    orb: { x: 55.5, y: 79 },
    orbCompact: { x: 84, y: 50 },
    ticks: 4,
    commitAt: 3,
  },
  {
    id: "work",
    caption: "all of it, at once",
    captionSide: "left",
    target: "board",
    // She steps back below the board rather than into the gutter: at this
    // point the plan card is finished and her caption must not land on the
    // step she corrected — that mark is the whole section.
    orb: { x: 77.5, y: 94 },
    orbCompact: { x: 84, y: 71 },
    ticks: 7,
    commitAt: 4,
  },
];

/** Resolve a stop's target to the rect the brackets frame. */
export function targetRect(target: TargetId, L: SceneLayout, editRow: number) {
  if (target === "editRow") return L.planRows[Math.min(editRow, L.planRows.length - 1)];
  if (target === "plan") return L.plan;
  if (target === "confirm") return L.confirm;
  if (target === "board") return L.board;
  return L.composer;
}
