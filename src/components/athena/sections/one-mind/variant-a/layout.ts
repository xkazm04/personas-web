/**
 * Scene geometry for "One mind" — section 6, variant A.
 *
 * One coordinate system: percent of the field. The conversations, the shared
 * memory under them, the beads strung along it and the thread layer that joins
 * them all read the same numbers (the SVG declares `viewBox="0 0 100 100"`
 * with no aspect lock), so a thread can never miss the memory it feeds and the
 * fact in flight can never miss the place it lands.
 *
 * The two things that carry TYPE and MOVE — the fact in flight and Athena
 * herself — ride a screen layer on transforms, never `left`/`top`, and never
 * scale: type is authored once and renders at that size wherever it travels.
 *
 * Two sets, switched on the md breakpoint (`useIsMobile`):
 *   WIDE     — four conversations across the top, each visibly its own place,
 *              with the shared memory as one wide body beneath all of them and
 *              a thread from each conversation down into it.
 *   COMPACT  — three conversations stacked down the page, their threads
 *              peeling out of the right gutter and CONVERGING on a single
 *              point where the memory begins. Fewer conversations and fewer
 *              remembered facts, never smaller type.
 *
 * Nothing here is random — the asymmetry (panel heights, tilts, curve sway) is
 * authored, so the field is identical on every render.
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

/** Curve shaping for one thread: how hard it bows and how far it leans out. */
export interface Flow {
  bow: number;
  sway: number;
}

export interface FieldLayout {
  /** One conversation each — its own place, its own subject, its own state. */
  panels: readonly Rect[];
  /** Authored rotation per panel, degrees — places, not tiles. */
  tilt: readonly number[];
  /** Where a conversation's thread leaves it. */
  out: readonly Point[];
  /** Where that thread meets the one shared body of memory. */
  inlet: readonly Point[];
  flow: readonly Flow[];
  /** The shared memory — one body, under all of them. */
  band: Rect;
  /** The single line every remembered thing is strung on. Thin on one axis;
   *  which axis is which is read off `w > h`. */
  spine: Rect;
  /** The remembered things. The LAST one is the slot the new fact lands in,
   *  and it is mounted (dashed, empty) from tick 0 so nothing ever reflows. */
  facts: readonly Rect[];
  /** Offset from a panel's top-left corner to the centre of the slot its
   *  header reserves for her. The slot exists whether she is there or not, so
   *  she can never cover a word. */
  voiceAt: Point;
  /** Where she waits when she is not in any conversation. */
  home: Point;
  /** Where the fact lifts off — the newest line of the conversation you told. */
  lift: Point;
  /** How many lines of a conversation are on screen at once. */
  window: number;
  /** Compact holds every line to a single line of type. */
  terse: boolean;
}

/**
 * md+ — four conversations across the top at four different heights (a row of
 * equal boxes reads as a dashboard, not as places you keep), one wide body of
 * memory beneath them, four threads down into it.
 *
 * Percentages are budgeted against the field's FLOOR height (36rem, set by the
 * section shell): a percent box shrinks with the viewport while the type inside
 * it does not, so every box holds its content at that floor.
 */
export const WIDE: FieldLayout = {
  panels: [
    { x: 1, y: 3, w: 23.5, h: 33 },
    { x: 26, y: 7, w: 22.5, h: 32 },
    { x: 50, y: 1, w: 24.5, h: 37 },
    { x: 76, y: 6.5, w: 23, h: 32 },
  ],
  tilt: [-0.6, 0.5, -0.4, 0.7],
  out: [
    { x: 12, y: 36 },
    { x: 37, y: 39 },
    { x: 62, y: 38 },
    { x: 88, y: 38.5 },
  ],
  inlet: [
    { x: 15, y: 61 },
    { x: 38, y: 61 },
    { x: 61, y: 61 },
    { x: 84, y: 61 },
  ],
  flow: [
    { bow: 0.62, sway: 3 },
    { bow: 0.7, sway: 1.5 },
    { bow: 0.58, sway: -2 },
    { bow: 0.66, sway: -4 },
  ],
  band: { x: 2, y: 61, w: 96, h: 37 },
  spine: { x: 6, y: 72.5, w: 88, h: 0.4 },
  facts: [
    { x: 5, y: 77, w: 21, h: 11 },
    { x: 28, y: 77, w: 21, h: 11 },
    { x: 51, y: 77, w: 21, h: 11 },
    { x: 74, y: 77, w: 21, h: 11 },
  ],
  voiceAt: { x: 1.9, y: 4.9 },
  // In none of them, she rests ON the memory — in the one gap its own wiring
  // leaves clear.
  home: { x: 50, y: 72.5 },
  lift: { x: 18, y: 31 },
  window: 3,
  terse: false,
};

/**
 * <md — the same claim turned on its side: the conversations stack down the
 * page, every thread peels into the right gutter, and all of them come home to
 * ONE point where the memory begins. Convergence does the work the wide field
 * does with a shared edge.
 */
export const COMPACT: FieldLayout = {
  // The third is taller than the other two on purpose: it is the one that ends
  // up carrying a two-line answer AND the note saying where the answer came
  // from, and that answer is the one thing on the field that must never be
  // truncated. Density is authored per place, not averaged across them.
  panels: [
    { x: 0.5, y: 0, w: 84, h: 19.5 },
    { x: 0.5, y: 20.6, w: 84, h: 21 },
    { x: 0.5, y: 42.7, w: 84, h: 27.5 },
  ],
  tilt: [0, 0, 0],
  out: [
    { x: 84.5, y: 9.7 },
    { x: 84.5, y: 31 },
    { x: 84.5, y: 56 },
  ],
  // All three land on the same point: the head of the line the memory is
  // strung on. The threads never cross a conversation on the way, because
  // everything happens in the gutter they already leave from.
  inlet: [
    { x: 92, y: 71.5 },
    { x: 92, y: 71.5 },
    { x: 92, y: 71.5 },
  ],
  flow: [
    { bow: 0.42, sway: 12 },
    { bow: 0.46, sway: 10 },
    { bow: 0.5, sway: 8 },
  ],
  band: { x: 0.5, y: 71.5, w: 99, h: 27.5 },
  spine: { x: 92, y: 71.5, w: 0.5, h: 26 },
  facts: [
    { x: 4, y: 84.5, w: 84, h: 5.6 },
    { x: 4, y: 91.5, w: 84, h: 5.6 },
  ],
  voiceAt: { x: 6.6, y: 3.4 },
  home: { x: 92, y: 90 },
  lift: { x: 55, y: 14 },
  window: 2,
  terse: true,
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);

export const centerOf = (r: Rect): Point => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

/** The slot a conversation's header reserves for her, in field percent. */
export function voicePoint(L: FieldLayout, i: number): Point {
  const p = L.panels[i];
  return { x: p.x + L.voiceAt.x, y: p.y + L.voiceAt.y };
}

/** Where the new fact comes to rest: the last bead on the spine. */
export const restPoint = (L: FieldLayout): Point => centerOf(L.facts[L.facts.length - 1]);
