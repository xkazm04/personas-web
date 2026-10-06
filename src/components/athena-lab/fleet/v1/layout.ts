/**
 * Scene geometry for "The Decomposition", evolved for one stage.
 *
 * The live section read top to bottom, which needed a 36rem field and made the
 * section ~1.3 screens tall. One stage on a laptop leaves a slot about 2.8x
 * wider than tall, so the same argument now reads LEFT TO RIGHT, the way a
 * sentence does: what you said -> her -> the work -> the answer.
 *
 * Every number is a CSS px in the scene's own design space (`DESIGN`), which
 * `FitBox` zooms as one piece. Cards and the thread SVG share that space, so a
 * thread can never miss what it feeds, and stroke widths no longer stretch
 * with the field the way the live 100x100 percent space made them.
 *
 * Nothing here is random - an organic layout still has to be deterministic, so
 * the asymmetry (card offsets, tilts, curve sway) is authored, not rolled.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** How hard a thread bows along its run, and how far it leans across it. */
export interface Flow {
  bow: number;
  sway: number;
}

export interface FieldLayout {
  w: number;
  h: number;
  request: Rect;
  plan: Rect;
  /** Athena - the point the sentence comes apart at. */
  branch: Point;
  cards: readonly Rect[];
  tilt: readonly number[];
  /** The single point every answer comes back to. */
  merge: Point;
  result: Rect;
  /** Threads run along x (wide) or down the gutters along y (compact). */
  axis: "x" | "y";
  branchFlow: readonly Flow[];
  mergeFlow: readonly Flow[];
  /** Where the key light rests in each act: typing, the work, the answer. */
  light: readonly [Point, Point, Point];
}

const CARD_W = 312;
const CARD_H = 88;

/** lg+ - sentence | her | four hands | the answer. */
export const WIDE: FieldLayout = {
  w: 1000,
  h: 400,
  request: { x: 0, y: 44, w: 292, h: 252 },
  plan: { x: 0, y: 308, w: 292, h: 46 },
  branch: { x: 328, y: 200 },
  cards: [
    { x: 362, y: 12, w: CARD_W, h: CARD_H },
    { x: 376, y: 108, w: CARD_W, h: CARD_H },
    { x: 366, y: 204, w: CARD_W, h: CARD_H },
    { x: 380, y: 300, w: CARD_W, h: CARD_H },
  ],
  tilt: [-1.1, 0.8, -0.5, 1],
  merge: { x: 722, y: 200 },
  result: { x: 744, y: 82, w: 256, h: 236 },
  axis: "x",
  branchFlow: [
    { bow: 0.55, sway: -10 },
    { bow: 0.62, sway: -4 },
    { bow: 0.6, sway: 4 },
    { bow: 0.5, sway: 10 },
  ],
  mergeFlow: [
    { bow: 0.6, sway: 8 },
    { bow: 0.52, sway: 3 },
    { bow: 0.55, sway: -3 },
    { bow: 0.62, sway: -8 },
  ],
  light: [
    { x: 150, y: 170 },
    { x: 530, y: 200 },
    { x: 873, y: 200 },
  ],
};

/** <lg - the same branch turned on its side: she holds the left gutter, the
 *  work stacks down the page, the answers come home down the right one. */
export const COMPACT: FieldLayout = {
  w: 360,
  h: 1010,
  request: { x: 0, y: 0, w: 360, h: 236 },
  plan: { x: 0, y: 248, w: 360, h: 46 },
  branch: { x: 30, y: 334 },
  cards: [
    // Taller than wide cards: at this width a title may take two lines,
    // and it wraps rather than ellipsizing.
    { x: 54, y: 380, w: 280, h: 100 },
    { x: 54, y: 488, w: 280, h: 100 },
    { x: 54, y: 596, w: 280, h: 100 },
    { x: 54, y: 704, w: 280, h: 100 },
  ],
  tilt: [0, 0, 0, 0],
  merge: { x: 348, y: 826 },
  result: { x: 0, y: 840, w: 360, h: 170 },
  axis: "y",
  branchFlow: [
    { bow: 0.5, sway: 0 },
    { bow: 0.5, sway: 0 },
    { bow: 0.5, sway: 0 },
    { bow: 0.5, sway: 0 },
  ],
  mergeFlow: [
    { bow: 0.5, sway: 0 },
    { bow: 0.5, sway: 0 },
    { bow: 0.5, sway: 0 },
    { bow: 0.5, sway: 0 },
  ],
  light: [
    { x: 180, y: 120 },
    { x: 180, y: 520 },
    { x: 180, y: 920 },
  ],
};

export const layoutFor = (narrow: boolean): FieldLayout => (narrow ? COMPACT : WIDE);

/** Where task `i`'s thread lands on its card (its left edge, mid-height). */
export function cardIn(L: FieldLayout, i: number): Point {
  const r = L.cards[i];
  return { x: r.x, y: r.y + r.h / 2 };
}

/** Where task `i`'s answer leaves its card (its right edge, mid-height). */
export function cardOut(L: FieldLayout, i: number): Point {
  const r = L.cards[i];
  return { x: r.x + r.w, y: r.y + r.h / 2 };
}
