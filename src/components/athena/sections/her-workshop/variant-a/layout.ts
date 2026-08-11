/**
 * Scene geometry for "The Wall" — the her-workshop section, variant A.
 *
 * One coordinate system: percent of the field for the big blocks, percent of
 * the WALL for the tiles inside it. A tile therefore never needs to know how
 * wide the page is, and the sweep that crosses the wall travels in the same
 * space the tiles are placed in, so it can never miss one.
 *
 * The composition is a room with a wall in it:
 *
 *   ── the wall ──────────  a grid of small screens, edge to edge, filling
 *                           roughly two thirds of the field. It is the subject;
 *                           everything else is furniture around it.
 *   ── the bench ─────────  a strip along the bottom. Athena stands at one end
 *                           of it, and the single announcement lands beside her
 *                           when a whole job is out. One box, one message —
 *                           the strip is reserved from the start so the wall
 *                           can never be pushed around by what lands there.
 *
 * Wide fields show twenty screens in five columns; narrow fields show twelve
 * in three, with one less line of output per screen. Fewer things, never
 * smaller type.
 *
 * Percentages are budgeted against the field's FLOOR height (36rem, set by the
 * section shell): a percent box shrinks with the viewport while the type inside
 * it does not. Every tile holds its name, its output and its verdict at that
 * floor; taller viewports only make them roomier.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FieldLayout {
  cols: number;
  rows: number;
  /** How many screens this field shows — always the FIRST n of the wall. */
  count: number;
  wall: Rect;
  /** Gutters between screens, in wall-local percent. */
  gapX: number;
  gapY: number;
  /** Finished lines of output a screen shows under its name. */
  lines: number;
  /** Wide screens have room for the live dot beside the verdict word. */
  chipDot: boolean;
  /** Where she stands. */
  presence: { x: number; y: number };
  report: Rect;
}

/** md+ — five across, four down. A screen is wide enough for a full name, three
 *  finished lines, the line still being written, and a verdict. */
export const WIDE: FieldLayout = {
  cols: 5,
  rows: 4,
  count: 20,
  wall: { x: 0.5, y: 0, w: 99, h: 68 },
  gapX: 1,
  gapY: 2.6,
  lines: 3,
  chipDot: true,
  presence: { x: 4.5, y: 86 },
  report: { x: 11, y: 72.5, w: 88, h: 27 },
};

/** <md — the same wall, three across and twelve deep enough to still read as a
 *  lot at once. One fewer line of output per screen; the type is untouched. */
export const COMPACT: FieldLayout = {
  cols: 3,
  rows: 4,
  count: 12,
  wall: { x: 0.5, y: 0, w: 99, h: 65 },
  gapX: 1.8,
  gapY: 2.8,
  lines: 2,
  chipDot: false,
  presence: { x: 8, y: 85 },
  report: { x: 18, y: 69, w: 81, h: 30.5 },
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);

/** Where one screen sits, in WALL-local percent. */
export function tileRect(L: FieldLayout, i: number): Rect {
  const cw = 100 / L.cols;
  const ch = 100 / L.rows;
  return {
    x: (i % L.cols) * cw + L.gapX / 2,
    y: Math.floor(i / L.cols) * ch + L.gapY / 2,
    w: cw - L.gapX,
    h: ch - L.gapY,
  };
}

/** How far across the wall a screen sits, 0…1. The pass reaches the columns in
 *  order, so this is the only thing a tile needs to know about the gesture
 *  crossing it — and the whole gesture is over inside one beat. */
export const colFrac = (L: FieldLayout, i: number): number => ((i % L.cols) + 0.5) / L.cols;
