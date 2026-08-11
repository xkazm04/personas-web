/**
 * Scene geometry for "The Workshop" — the her-workshop section, variant B.
 *
 * The shape is a SHOP FLOOR seen from above, and its composition is the
 * argument. Down the left are the two benches you drive: work waiting on your
 * word, and work she already has hands on. Down the right are the two that
 * drive themselves: a dial of standing orders, and a bench that starts work
 * because something happened. Between them sits one desk, and every bench is
 * cabled to it. At the far edge, deliberately off to one side, stands a second
 * bench — paired, lit and idle.
 *
 * Everything is placed from percent rects over one field, and the cables are
 * percent-placed boxes too, not an SVG. That is a decision, not an accident: a
 * scene whose claim is "one control surface" should draw its wiring as crisp
 * orthogonal runs at a constant weight, and a `viewBox` with no aspect lock
 * would scale a vertical run's stroke differently from a horizontal one. So
 * every cable here is a chain of straight LEGS, each an absolutely positioned
 * hairline that grows on the compositor, with the signal riding it as a
 * transform. Nothing in this file needs keeping in sync with anything else.
 *
 * Percentages are budgeted against the field's FLOOR height (36rem, set by the
 * section shell): a percent box shrinks with the viewport while the type inside
 * it does not. Every bench holds its content at that floor; taller viewports
 * only make them roomier.
 */

export type BenchId = "hands" | "queue" | "standing" | "watch" | "next";

/** Reveal order is the clock's business (`./data`); this is only the roster. */
export const BENCH_IDS: readonly BenchId[] = ["hands", "queue", "standing", "watch", "next"];

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * One straight run of a cable. Direction is load-bearing: `(x1,y1)` is the
 * BENCH end and `(x2,y2)` the DESK end, so the line can grow outward from the
 * desk when a bench is wired in, and the signal can travel inward along it
 * afterwards. Legs are always axis-aligned — either the ys match or the xs do.
 */
export interface Leg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** A cable is its legs, bench end first. */
export type Cable = readonly Leg[];

export interface FieldLayout {
  /** The one place all of it answers to. She sits on it. */
  desk: Rect;
  panels: Record<BenchId, Rect>;
  cables: Record<BenchId, Cable>;
  /** Compact only: the shared run from the loom's spine into the desk. */
  hub: Leg | null;
  /** How much texture each bench has room for. Fewer rows on a narrow field,
   *  never smaller type. */
  lanes: number;
  cards: number;
  wires: number;
  /** Marks around the dial's rim. Crowded on purpose and never counted. */
  rim: number;
  /** The far bench stands as a tall column on a wide field and lies down as a
   *  bar on a narrow one, so its label wraps in one case and not the other. */
  upright: boolean;
}

/**
 * md+ — four benches at the corners of one desk, and the second machine at the
 * right-hand edge of the field with the longest, quietest cable in the scene.
 */
export const WIDE: FieldLayout = {
  desk: { x: 33.5, y: 36.5, w: 17, h: 22 },
  panels: {
    queue: { x: 1, y: 6, w: 31, h: 27 },
    standing: { x: 52, y: 6, w: 32, h: 27 },
    hands: { x: 1, y: 62, w: 31, h: 30 },
    watch: { x: 52, y: 62, w: 32, h: 30 },
    next: { x: 87, y: 28, w: 12, h: 40 },
  },
  cables: {
    queue: [
      { x1: 32, y1: 19.5, x2: 38, y2: 19.5 },
      { x1: 38, y1: 19.5, x2: 38, y2: 36.5 },
    ],
    standing: [
      { x1: 52, y1: 19.5, x2: 46, y2: 19.5 },
      { x1: 46, y1: 19.5, x2: 46, y2: 36.5 },
    ],
    hands: [
      { x1: 32, y1: 77, x2: 38, y2: 77 },
      { x1: 38, y1: 77, x2: 38, y2: 58.5 },
    ],
    watch: [
      { x1: 52, y1: 77, x2: 46, y2: 77 },
      { x1: 46, y1: 77, x2: 46, y2: 58.5 },
    ],
    // One long straight run in from the edge, crossing the empty middle of the
    // right-hand column — it passes nothing and nothing passes it.
    next: [{ x1: 87, y1: 47.5, x2: 50.5, y2: 47.5 }],
  },
  hub: null,
  lanes: 4,
  cards: 3,
  wires: 3,
  rim: 24,
  upright: true,
};

/**
 * <md — the same shop floor stood on its end. There is no room for a ring of
 * benches, so they stack, and the loom becomes a spine down the left gutter
 * that every bench taps into and the desk sits on. Same five cables, same
 * inbound signals, fewer rows per bench.
 */
export const COMPACT: FieldLayout = {
  desk: { x: 22, y: 32.4, w: 56, h: 12.8 },
  panels: {
    queue: { x: 8, y: 0, w: 91, h: 13.5 },
    standing: { x: 8, y: 15.2, w: 91, h: 15.5 },
    hands: { x: 8, y: 46.9, w: 91, h: 24 },
    watch: { x: 8, y: 72.6, w: 91, h: 14.5 },
    next: { x: 8, y: 88.8, w: 91, h: 10.5 },
  },
  cables: {
    queue: [
      { x1: 8, y1: 6.8, x2: 3, y2: 6.8 },
      { x1: 3, y1: 6.8, x2: 3, y2: 38.8 },
    ],
    standing: [
      { x1: 8, y1: 22.9, x2: 3, y2: 22.9 },
      { x1: 3, y1: 22.9, x2: 3, y2: 38.8 },
    ],
    hands: [
      { x1: 8, y1: 58.9, x2: 3, y2: 58.9 },
      { x1: 3, y1: 58.9, x2: 3, y2: 38.8 },
    ],
    watch: [
      { x1: 8, y1: 79.9, x2: 3, y2: 79.9 },
      { x1: 3, y1: 79.9, x2: 3, y2: 38.8 },
    ],
    next: [
      { x1: 8, y1: 94, x2: 3, y2: 94 },
      { x1: 3, y1: 94, x2: 3, y2: 38.8 },
    ],
  },
  hub: { x1: 3, y1: 38.8, x2: 22, y2: 38.8 },
  lanes: 4,
  cards: 2,
  wires: 2,
  rim: 18,
  upright: false,
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);

/** True for a leg that runs across rather than up or down. */
export const isFlat = (l: Leg): boolean => l.y1 === l.y2;
