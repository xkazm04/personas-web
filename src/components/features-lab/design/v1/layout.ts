import type { DimKey } from "../shared/dims";
import { makeTimeline } from "../shared/timeline";

/** Art box aspect (width / height); everything inside is sized in cqw. */
export const AR = 2.25;
/** Header strip height and the grid's top, in cqw. */
export const HEAD_H = 4.2;
export const GRID_TOP = 5.2;
/** Inner padding of the art box, in cqw. */
export const PAD = 1.4;
/** Grid area: GRID_W x GRID_H cqw, PAD in from the sides and the bottom. */
export const GRID_W = 100 - 2 * PAD;
export const GRID_H = 100 / AR - GRID_TOP - PAD;
export const GAP = 1.1;
const SIDE_COL = (GRID_W - 2 * GAP) * 0.3;
const COLS = [SIDE_COL, GRID_W - 2 * GAP - 2 * SIDE_COL, SIDE_COL];
const ROW_SIDE = (GRID_H - 2 * GAP) * 0.3;
const ROWS = [ROW_SIDE, GRID_H - 2 * GAP - 2 * ROW_SIDE, ROW_SIDE];

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function cell(col: number, row: number): Rect {
  const x = COLS.slice(0, col).reduce((a, b) => a + b + GAP, 0);
  const y = ROWS.slice(0, row).reduce((a, b) => a + b + GAP, 0);
  return { x, y, w: COLS[col], h: ROWS[row] };
}

/** The live matrix's 3x3 placement: the sentence at the centre. */
export const PLACE: Record<DimKey | "core", Rect> = {
  tasks: cell(0, 0),
  apps: cell(1, 0),
  triggers: cell(2, 0),
  messages: cell(0, 1),
  core: cell(1, 1),
  review: cell(2, 1),
  memory: cell(0, 2),
  errors: cell(1, 2),
  events: cell(2, 2),
};

export const TYPE_MS = 2600;

/** Build order = the product's dimension order. */
export const STEPS = makeTimeline(
  ["tasks", "apps", "triggers", "review", "messages", "memory", "errors", "events"],
  { type: TYPE_MS, read: 1700, engage: 950, ask: 5600, resolve: 800, finale: 4200 },
);

/** Inline style that places a rect inside the grid area. */
export function placeStyle(r: Rect) {
  return { left: `${r.x}cqw`, top: `${r.y}cqw`, width: `${r.w}cqw`, height: `${r.h}cqw` };
}
