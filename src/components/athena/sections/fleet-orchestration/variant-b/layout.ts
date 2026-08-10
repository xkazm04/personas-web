/**
 * Scene geometry for "The Decomposition" — section 4, variant B.
 *
 * This variant is a DIAGRAM, not an app screen, so every element is placed
 * from percent rects over one field and the thread layer draws in the SAME
 * percent space (an SVG with `viewBox="0 0 100 100"` and no aspect lock).
 * One coordinate system means a thread can never miss the card it feeds.
 *
 * Two sets, switched on the md breakpoint (`useIsMobile`):
 *   WIDE     — the request across the top, Athena centred beneath it, four
 *              task cards FANNED across the field at four different heights,
 *              answers converging into one node above the result.
 *   COMPACT  — the same argument turned on its side: she sits in a left
 *              gutter and the tasks stack down the page, threads peeling out
 *              of that gutter and answers returning down the right one.
 *              Fewer details per card, never smaller type.
 *
 * Nothing here is random — an organic layout still has to be deterministic,
 * so the asymmetry (card heights, tilts, curve sway) is authored, not rolled.
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

/**
 * Curve shaping for one thread: how hard it bows vertically and how far it
 * leans sideways on the way out. Authored per thread on purpose — a fan of
 * identical arcs reads as a machine stamping parts, not as work being handed
 * to four different pairs of hands.
 */
export interface Flow {
  bow: number;
  sway: number;
  /** Nudges a branch thread's departure point off the shared source. Four
   *  threads leaving one pixel read as a bundle of wire; four leaving four
   *  points around her read as work being handed to four different hands. */
  origin?: Point;
}

export interface FieldLayout {
  /** The sentence you typed — the one input everything derives from. */
  request: Rect;
  /** The plan's control row: change anything, then start it. */
  plan: Rect;
  /** Athena's presence — the point the sentence comes apart at. */
  branch: Point;
  /** Where the threads actually leave her (clear of the avatar). */
  source: Point;
  cards: readonly Rect[];
  /** Slight authored rotation per card, degrees. */
  tilt: readonly number[];
  /** Fraction across a card's top edge where its thread lands (wide only). */
  inAt: readonly number[];
  /** Fraction across a card's bottom edge where its answer leaves (wide only). */
  outAt: readonly number[];
  /** COMPACT routes threads through the side gutters instead of top/bottom. */
  side: boolean;
  branchFlow: readonly Flow[];
  mergeFlow: readonly Flow[];
  /** The single point every answer comes back to. */
  merge: Point;
  result: Rect;
}

/**
 * md+ — the fan. Card heights are equal; their TOPS are not, which is what
 * keeps the row from reading as a toolbar.
 *
 * The percentages are budgeted against the field's FLOOR height (36rem, set by
 * the section shell), because a percent box shrinks with the viewport while the
 * type inside it does not. Every box here holds its content at that floor;
 * taller viewports only make them roomier.
 */
export const WIDE: FieldLayout = {
  request: { x: 5, y: 0.5, w: 90, h: 18 },
  plan: { x: 27, y: 19.4, w: 46, h: 4.4 },
  branch: { x: 50, y: 30.2 },
  source: { x: 50, y: 33.2 },
  cards: [
    { x: 2.5, y: 39.5, w: 22, h: 22 },
    { x: 27, y: 43, w: 21, h: 22 },
    { x: 50.5, y: 38, w: 22.5, h: 22 },
    { x: 76, y: 41.5, w: 21, h: 22 },
  ],
  tilt: [-1.4, 1.1, -0.7, 1.5],
  inAt: [0.62, 0.4, 0.55, 0.34],
  outAt: [0.46, 0.6, 0.4, 0.62],
  side: false,
  branchFlow: [
    { bow: 0.62, sway: -9, origin: { x: -2.4, y: 0.3 } },
    { bow: 0.78, sway: -4, origin: { x: -0.9, y: 1.3 } },
    { bow: 0.5, sway: 5, origin: { x: 0.9, y: 1.2 } },
    { bow: 0.72, sway: 10, origin: { x: 2.4, y: 0.2 } },
  ],
  mergeFlow: [
    { bow: 0.7, sway: -7 },
    { bow: 0.5, sway: -2.5 },
    { bow: 0.8, sway: 4 },
    { bow: 0.58, sway: 8 },
  ],
  merge: { x: 50, y: 71 },
  result: { x: 25, y: 72, w: 50, h: 26.5 },
};

/** <md — the same branch, rotated: she holds the left gutter, the work stacks
 *  down the page, and every answer comes home down the right gutter. */
export const COMPACT: FieldLayout = {
  request: { x: 1, y: 0, w: 98, h: 29 },
  plan: { x: 1, y: 30, w: 98, h: 4.4 },
  branch: { x: 8, y: 38.5 },
  source: { x: 8, y: 41 },
  // Narrower than the field on BOTH sides: the left gutter carries the work
  // out, the right gutter carries the answers home. Without them the threads
  // would have to cross the cards and the diagram would knot.
  cards: [
    { x: 15, y: 44, w: 76, h: 9 },
    { x: 15, y: 53.5, w: 76, h: 9 },
    { x: 15, y: 63, w: 76, h: 9 },
    { x: 15, y: 72.5, w: 76, h: 9 },
  ],
  tilt: [0, 0, 0, 0],
  inAt: [0, 0, 0, 0],
  outAt: [0, 0, 0, 0],
  side: true,
  branchFlow: [
    { bow: 0.7, sway: -0.5, origin: { x: -0.8, y: 0 } },
    { bow: 0.55, sway: -2, origin: { x: 0.6, y: 0.5 } },
    { bow: 0.5, sway: -3.5, origin: { x: -0.6, y: 0.8 } },
    { bow: 0.46, sway: -5, origin: { x: 0.8, y: 0.3 } },
  ],
  mergeFlow: [
    { bow: 0.55, sway: 7 },
    { bow: 0.52, sway: 6 },
    { bow: 0.5, sway: 4.5 },
    { bow: 0.6, sway: 2.5 },
  ],
  merge: { x: 50, y: 83.5 },
  result: { x: 1, y: 84, w: 98, h: 15 },
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);

/** Where task `i`'s thread lands on its card. */
export function cardIn(L: FieldLayout, i: number): Point {
  const r = L.cards[i];
  return L.side
    ? { x: r.x, y: r.y + r.h / 2 }
    : { x: r.x + r.w * L.inAt[i], y: r.y };
}

/** Where task `i`'s answer leaves its card on the way to the result. */
export function cardOut(L: FieldLayout, i: number): Point {
  const r = L.cards[i];
  return L.side
    ? { x: r.x + r.w, y: r.y + r.h / 2 }
    : { x: r.x + r.w * L.outAt[i], y: r.y + r.h };
}
