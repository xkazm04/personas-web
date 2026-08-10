/**
 * Scene geometry for "The Marker" — the lasting-memory section, variant C.
 *
 * One coordinate system, deliberately: percent of the field, for everything.
 * There is no camera here and nothing travels except Athena herself, along a
 * single axis — so type can sit in the art at its authored size, at every
 * viewport, with nothing projected and nothing to keep in sync.
 *
 * The shape is a SEAM: one horizontal band holding everything you have said
 * to her, oldest at the left, newest at the right, laid end to end. She reads
 * along it and stops when she is full; a marker plants where she stopped; the
 * brackets underneath measure the two sittings; and each account sits under
 * the sitting it describes, its right edge landing exactly on that sitting's
 * marker.
 *
 * That last alignment is the section's argument made structural. Bracket two
 * BEGINS where bracket one ENDS, and the two are congruent because the twelve
 * messages under each sum to the same number of units (see ./copy). No gap and
 * no overlap is therefore not a claim the copy makes — it is a thing the eye
 * can measure.
 *
 * There is no SVG thread layer in this section, on purpose. Every line here is
 * a box: a percent-placed div that scales into view. A diagram about exactness
 * should not be drawn in a space that stretches its own strokes.
 */

import { PER_SITTING, WEIGHTS } from "./copy";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Total width of everything you have said, in seam units. */
export const UNITS = WEIGHTS.reduce((a, b) => a + b, 0);

/** Cumulative edge of every message — `CUM[i]` is where message `i` starts and
 *  `CUM[i + 1]` where it ends. Length is WEIGHTS.length + 1. */
export const CUM: readonly number[] = WEIGHTS.reduce<number[]>(
  (acc, w) => {
    acc.push(acc[acc.length - 1] + w);
    return acc;
  },
  [0],
);

/** How many units one sitting takes in — the bounded appetite, as a length. */
export const APPETITE = CUM[PER_SITTING];

/** Where each sitting ran out, as a message index and as units. */
export const STOP_AT_MESSAGE = [PER_SITTING, PER_SITTING * 2] as const;

/** Where message `i` sits along the seam, as fractions of the seam's width. */
export function segSpan(i: number): { left: number; width: number } {
  return { left: CUM[i] / UNITS, width: WEIGHTS[i] / UNITS };
}

/** How many messages have been read once `units` of the seam are behind her. */
export function readAtUnits(units: number): number {
  let n = 0;
  while (n < WEIGHTS.length && CUM[n + 1] <= units) n += 1;
  return n;
}

export interface FieldLayout {
  /** Everything you have said to her, laid end to end. */
  seam: Rect;
  /** Top of the `oldest` / `newest` label line. */
  endsY: number;
  /** Her centre, riding above the seam. */
  readerY: number;
  /** Top of a marker — its little flag sits here. */
  markTop: number;
  /** The bracket line. A marker's stem runs all the way down to it, so a
   *  bracket's end cap and the marker are the same line. */
  braceY: number;
  /** How far a bracket's end caps rise back toward the seam. They carry the
   *  congruence: two spans sharing one post read as two only if the posts are
   *  tall enough to be posts. */
  braceCap: number;
  braceLabelY: number;
  /** Where the unread stretch is named. It shares the bracket label's line on
   *  a wide field and takes its own below it on a narrow one, where two
   *  "one sitting" labels already fill the row edge to edge. */
  waitY: number;
  /** One account per sitting, each ending on its own marker. */
  notes: readonly Rect[];
  /** Whether a marker's dashed run continues down to the accounts. Three
   *  vertical runs across a 390px scene read as a grid, so the compact layout
   *  lets the accounts' own stacking order carry the join instead. */
  joins: boolean;
}

/** Where a marker stands, in percent of the field. */
export function markX(L: FieldLayout, pass: number): number {
  return L.seam.x + (L.seam.w * CUM[STOP_AT_MESSAGE[pass]]) / UNITS;
}

/** The span a bracket measures, in percent of the field. */
export function braceSpan(L: FieldLayout, pass: number): { from: number; to: number } {
  return {
    from: pass === 0 ? L.seam.x : markX(L, pass - 1),
    to: markX(L, pass),
  };
}

/**
 * md+ — the seam runs the full width with room above it for her to travel,
 * and the two accounts sit side by side underneath, each one ending on its own
 * marker so the composition below the seam repeats the division above it.
 *
 * Percentages are budgeted against the field's FLOOR height (36rem, set by the
 * section shell): a percent box shrinks with the viewport while the type
 * inside it does not.
 */
export const WIDE: FieldLayout = {
  seam: { x: 3, y: 27, w: 94, h: 10 },
  endsY: 21.5,
  readerY: 13,
  markTop: 24,
  braceY: 46.5,
  braceCap: 3.6,
  braceLabelY: 48.8,
  waitY: 48.8,
  notes: [
    { x: 4.2, y: 58, w: 35.4, h: 39 },
    { x: 41.6, y: 58, w: 36.6, h: 39 },
  ],
  joins: true,
};

/** <md — the same seam, the same two brackets, the accounts stacked instead of
 *  side by side. Fewer lines of scenery, never smaller type. */
export const COMPACT: FieldLayout = {
  seam: { x: 2, y: 24, w: 96, h: 8 },
  endsY: 19,
  readerY: 12,
  markTop: 21.5,
  braceY: 38,
  braceCap: 3,
  braceLabelY: 40.5,
  waitY: 44.3,
  notes: [
    { x: 2, y: 48, w: 96, h: 24 },
    { x: 2, y: 74, w: 96, h: 23 },
  ],
  joins: false,
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);
