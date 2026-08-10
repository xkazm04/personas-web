/**
 * Scene geometry for "The Archive" — lasting memory, variant B.
 *
 * One coordinate system for everything: percent of the field. The thread
 * layer draws in the SAME space (an SVG with `viewBox="0 0 100 100"` and no
 * aspect lock), so a citation can never miss the conversation it points at.
 *
 * The field is stratified, and the strata are the argument:
 *
 *   the lens     the top of the frame, lit. What she is working from.
 *   the seam     one luminous rule. She stands on it.
 *   below it     the same cards, dim, at rest, still readable.
 *   the record   a framed strip at the floor holding every conversation
 *                you have ever had. It only ever gets longer.
 *
 * Depth is time: the nearer the seam, the more recently something was in
 * use. So a thing that stops being recalled does not leave — it settles one
 * layer down, and the eye reads "further from the light", never "gone".
 *
 * Nothing here is rolled. Card widths, the sag of the resting row and the
 * lean on every citation are authored, because a scene that has to look like
 * an archive rather than a table still has to be deterministic.
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

/** One durable thing she knows, placed. */
export interface KnownGeom {
  /** Index into KNOWN (./copy). */
  i: number;
  /** Where the card sits while it is in use — and the box the DOM keeps for
   *  the whole loop, so nothing here ever reflows. */
  rect: Rect;
  /** How far down the field it settles when it stops being recalled, in
   *  percent of the field. Zero for everything that never moves. */
  drop: number;
  /** Fraction across its bottom edge that its citation leaves by. */
  out: number;
  /** Which conversation in the record it cites. */
  src: number;
  /** Lean on the citation. The one card that MOVES carries no lean, so the
   *  fraction of its thread still showing after it settles is exact rather
   *  than nearly right (see `restFrac`). */
  bow: number;
}

export interface FieldLayout {
  /** The lit region — a wash, not a box. */
  lens: Rect;
  /** The line between in use and still here. */
  seam: number;
  /** The framed strip at the floor. */
  record: Rect;
  /** Where its label sits inside it. */
  recordLabel: Point;
  /** One block per conversation. The last is the one that arrives. */
  blocks: readonly Rect[];
  known: readonly KnownGeom[];
  /** Right-hand annotations: the lit zone, then the resting one. */
  useLabel: Point;
  keptLabel: Point;
  compact: boolean;
}

const r = (n: number) => Math.round(n * 100) / 100;

/** A row of equal blocks starting at `x`, laid on `count` pitches. */
function strip(x: number, pitch: number, w: number, y: number, h: number, count: number): Rect[] {
  return Array.from({ length: count }, (_, j) => ({ x: r(x + j * pitch), y, w, h }));
}

/**
 * A citation, as a quadratic bowed off its own midpoint. The offset is
 * perpendicular in viewBox space (the SVG carrying these does not lock its
 * aspect ratio, which is what lets "50" here and "50%" in a card's inline
 * style be the same place).
 */
export function arc(from: Point, to: Point, bow: number): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (from.x + to.x) / 2 + (-dy / len) * bow;
  const cy = (from.y + to.y) / 2 + (dx / len) * bow;
  return `M ${r(from.x)} ${r(from.y)} Q ${r(cx)} ${r(cy)}, ${r(to.x)} ${r(to.y)}`;
}

/** Where a card's citation leaves it while it is in use. */
export function citeFrom(g: KnownGeom): Point {
  return { x: g.rect.x + g.rect.w * g.out, y: g.rect.y + g.rect.h };
}

/** Where it lands, on the top edge of the conversation it came from. */
export function citeTo(L: FieldLayout, g: KnownGeom): Point {
  const b = L.blocks[g.src];
  return { x: b.x + b.w / 2, y: b.y };
}

/** The whole citation, drawn from the in-use position. */
export const citePath = (L: FieldLayout, g: KnownGeom): string =>
  arc(citeFrom(g), citeTo(L, g), g.bow);

/**
 * How much of that citation is still showing once the card has settled.
 *
 * The card slides DOWN its own thread, so the thread retracts from the top
 * while the end joined to the conversation never moves — which is the one
 * image this section cannot afford to get wrong. Derived from the geometry
 * rather than authored, so it stays exact at every viewport.
 */
export function restFrac(L: FieldLayout, g: KnownGeom): number {
  if (!g.drop) return 1;
  const from = citeFrom(g);
  const to = citeTo(L, g);
  const span = to.y - from.y;
  return span > 0 ? Math.max(0, Math.min(1, (span - g.drop) / span)) : 1;
}

/**
 * md+ — four things in use across the lit band, the resting row sagging
 * below it, and nine conversations along the floor.
 *
 * The card that gets superseded (index 1) sits directly LEFT of the one that
 * supersedes it (index 3), so the old answer and the new one are read as a
 * pair before either of them moves.
 *
 * Percentages are budgeted against the field's FLOOR height (36rem, set by
 * the section shell): a percent box shrinks with the viewport while the type
 * inside it does not.
 */
export const WIDE: FieldLayout = {
  lens: { x: 0, y: 0, w: 100, h: 27 },
  seam: 27,
  record: { x: 2, y: 70, w: 96, h: 27 },
  recordLabel: { x: 4.5, y: 73.5 },
  blocks: strip(4, 10.55, 9.4, 79, 15, 9),
  known: [
    { i: 0, rect: { x: 2, y: 7, w: 23, h: 14 }, drop: 0, out: 0.46, src: 1, bow: -2.5 },
    { i: 2, rect: { x: 26, y: 7, w: 23, h: 14 }, drop: 0, out: 0.54, src: 3, bow: 2 },
    { i: 1, rect: { x: 50, y: 7, w: 23, h: 14 }, drop: 27, out: 0.5, src: 5, bow: 0 },
    { i: 3, rect: { x: 74, y: 7, w: 24, h: 14 }, drop: 0, out: 0.52, src: 8, bow: 2.5 },
    { i: 4, rect: { x: 2, y: 51, w: 27, h: 13 }, drop: 0, out: 0.42, src: 0, bow: -1.5 },
    { i: 5, rect: { x: 33, y: 53.5, w: 29, h: 13 }, drop: 0, out: 0.5, src: 4, bow: 1.5 },
    { i: 6, rect: { x: 68, y: 50, w: 28, h: 13 }, drop: 0, out: 0.55, src: 7, bow: -1.5 },
  ],
  useLabel: { x: 98, y: 2.5 },
  keptLabel: { x: 98, y: 31 },
  compact: false,
};

/**
 * <md — the same strata, stacked. Three things in use and two at rest rather
 * than four and three: fewer cards, never smaller type, and the pair that
 * carries the argument (the old answer and the new one) is still there.
 *
 * The new card sits directly ABOVE the one it supersedes, so the card that
 * moves has nothing beneath it to travel through.
 */
export const COMPACT: FieldLayout = {
  lens: { x: 0, y: 0, w: 100, h: 45 },
  seam: 45,
  record: { x: 2, y: 85, w: 96, h: 14 },
  recordLabel: { x: 4.5, y: 87.5 },
  blocks: strip(4, 15.3, 14.6, 91, 6.5, 6),
  known: [
    { i: 0, rect: { x: 2, y: 7, w: 96, h: 9 }, drop: 0, out: 0.12, src: 0, bow: -2 },
    { i: 3, rect: { x: 2, y: 19, w: 96, h: 9 }, drop: 0, out: 0.85, src: 5, bow: 2 },
    { i: 1, rect: { x: 2, y: 31, w: 96, h: 9 }, drop: 20, out: 0.45, src: 2, bow: 0 },
    { i: 4, rect: { x: 2, y: 63, w: 92, h: 9 }, drop: 0, out: 0.25, src: 1, bow: -1.5 },
    { i: 5, rect: { x: 6, y: 74, w: 92, h: 9 }, drop: 0, out: 0.62, src: 4, bow: 1.5 },
  ],
  useLabel: { x: 98, y: 2.5 },
  keptLabel: { x: 98, y: 48.5 },
  compact: true,
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);
