/**
 * Scene geometry for section 4, variant A — every module, every walkthrough
 * target and every one of Athena's resting points is placed from percent rects
 * over the app canvas, so the corner brackets (which read the same numbers)
 * always frame the real control and nothing can drift apart.
 *
 * Two sets, switched on the md breakpoint (`useIsMobile`):
 *   WIDE     — request bar across the top, the plan card down the left, the
 *              work board and the result down the right. Athena works the
 *              gutter between the two columns.
 *   COMPACT  — one column, top to bottom, with FEWER items (two plan steps,
 *              three work tiles) rather than smaller type. The text-base floor
 *              is absolute: density gives way, never the type.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface SceneLayout {
  /** The request bar the sentence is typed into. */
  composer: Rect;
  /** Backing card of the plan (its header sits inside it). */
  plan: Rect;
  /** One rect per plan step, absolutely placed over the plan card so the
   *  brackets can frame the single step she edits. */
  planRows: Rect[];
  /** The control that starts the work — lives inside the plan card. */
  confirm: Rect;
  /** Backing panel of the work board (its header sits inside it). */
  board: Rect;
  /** One rect per work tile, absolutely placed over the board. */
  tiles: Rect[];
  /** The compact result that lands once the work finishes. */
  result: Rect;
  /** Where Athena rests before and after the whole arc. */
  dock: Point;
}

/** Which plan step she lands on and corrects. Compact keeps two steps, so
 *  index 1 is visible at every breakpoint — the edit is never dropped. */
export const EDIT_ROW = 1;

/** md+ — two columns with a gutter wide enough for Athena to work in. */
export const WIDE: SceneLayout = {
  composer: { x: 3, y: 4.5, w: 94, h: 15 },
  plan: { x: 3, y: 22.5, w: 50, h: 66.5 },
  planRows: [
    { x: 5.5, y: 31, w: 45, h: 13 },
    { x: 5.5, y: 45.5, w: 45, h: 13 },
    { x: 5.5, y: 60, w: 45, h: 13 },
  ],
  confirm: { x: 5.5, y: 75.5, w: 45, h: 6.5 },
  board: { x: 58, y: 22.5, w: 39, h: 46 },
  tiles: [
    { x: 60.5, y: 30, w: 34, h: 6.8 },
    { x: 60.5, y: 37.8, w: 34, h: 6.8 },
    { x: 60.5, y: 45.6, w: 34, h: 6.8 },
    { x: 60.5, y: 53.4, w: 34, h: 6.8 },
    { x: 60.5, y: 61.2, w: 34, h: 6.8 },
  ],
  result: { x: 58, y: 71, w: 39, h: 18 },
  dock: { x: 94, y: 2.5 },
};

/** <md — one column, two plan steps, three work tiles. */
export const COMPACT: SceneLayout = {
  composer: { x: 3, y: 4, w: 94, h: 12 },
  plan: { x: 3, y: 19, w: 94, h: 37 },
  planRows: [
    { x: 5.5, y: 26, w: 89, h: 9 },
    { x: 5.5, y: 36, w: 89, h: 9 },
  ],
  confirm: { x: 5.5, y: 47, w: 89, h: 6 },
  board: { x: 3, y: 59, w: 94, h: 24 },
  tiles: [
    { x: 5.5, y: 65.5, w: 89, h: 5.4 },
    { x: 5.5, y: 71.5, w: 89, h: 5.4 },
    { x: 5.5, y: 77.5, w: 89, h: 5.4 },
  ],
  result: { x: 3, y: 85.5, w: 94, h: 13 },
  dock: { x: 92, y: 1.5 },
};

export const layoutFor = (compact: boolean): SceneLayout => (compact ? COMPACT : WIDE);
