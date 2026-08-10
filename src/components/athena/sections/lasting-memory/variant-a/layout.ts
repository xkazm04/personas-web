/**
 * Scene geometry for "The Tide" — lasting memory, variant A.
 *
 * One coordinate system: percent of the field, top-left origin. The thread
 * layer draws in the SAME space (`viewBox="0 0 100 100"`, no aspect lock), so a
 * thread can never miss the thing it belongs to.
 *
 * The field is read top to bottom as one physical object: the BASIN where talk
 * collects, filling UPWARD from the settled BAND — so the oldest talk is always
 * the lowest, and a pass that takes the oldest part takes the part already
 * nearest the floor. The band is dense, quiet and permanent: the one element
 * never removed from the field. Below the basin's floor sits the shelf of the
 * few things one pass left behind, each threaded back into the exact place in
 * the band it came out of.
 *
 * A row is placed by its SLOT (its height in the stack), never by its index,
 * and everything that moves moves by transform — `slotTop` gives the resting
 * place and `rowShift` gives the distance, expressed in the row's own height so
 * it can be handed straight to framer's `y` as a percentage.
 *
 * Nothing here is random. A tide still has to be the same tide every loop, so
 * the asymmetry (pill widths, thread sway, anchor spread) is authored.
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

export interface FieldLayout {
  /** The whole basin, from its rim down to the sill. */
  basin: Rect;
  /** The settled talk at the bottom of it. Fixed — it only ever gets denser. */
  band: Rect;
  /** One pill's height, and the spacing between two stacked pills. */
  rowH: number;
  pitch: number;
  /** Side padding inside the basin, in field percent. */
  inset: number;
  /** The few things a pass left behind. */
  cards: readonly Rect[];
  /** Where each thread lands in the band — spread, because the few did not all
   *  come out of the same part of the mass. */
  anchors: readonly number[];
  /** How hard each thread leans on the way down (wide only). */
  sway: readonly number[];
  /** Stacked layouts route every thread down its own lane in a left gutter and
   *  into the card's LEFT edge — a thread to the TOP of a card would spend its
   *  whole run hidden behind the cards above it. `null` lifts each thread
   *  straight off the top of its card instead. */
  lanes: readonly number[] | null;
  /** Her station's x, and how far above the waterline she floats. */
  presenceX: number;
  presenceLift: number;
  presenceMinY: number;
  /** The line's label is wide-only: at this width the caption beside her and
   *  the label for what is set aside already share the top of the basin, and
   *  a third annotation up there is density the section does not need. */
  thresholdLabel: boolean;
  /** Centre of the short account a pass ends by writing. */
  note: Point;
}

/** md+ — a wide basin with a gutter on the left for her to rise up. */
export const WIDE: FieldLayout = {
  basin: { x: 12, y: 4, w: 86, h: 56 },
  band: { x: 12, y: 54.5, w: 86, h: 5.5 },
  rowH: 2.35,
  pitch: 2.8,
  inset: 1.5,
  cards: [
    { x: 3, y: 68, w: 21, h: 21 },
    { x: 27.6, y: 68, w: 21, h: 21 },
    { x: 52.2, y: 68, w: 21, h: 21 },
    { x: 76.8, y: 68, w: 21, h: 21 },
  ],
  anchors: [21, 41, 63, 86],
  sway: [-4, -2, 2, 4],
  lanes: null,
  presenceX: 5.5,
  presenceLift: 0.5,
  presenceMinY: 6,
  thresholdLabel: true,
  note: { x: 50, y: 94 },
};

/**
 * <md — the same basin, shallower, with the few stacked down the page and a
 * left gutter carrying every thread home. She keeps her gutter here too:
 * floating her at the centre of the waterline is truer to the idea and is what
 * an earlier pass did, but at this width she lands on the talk she is floating
 * on and on the label for the part set aside, so the basin gives up its first
 * 15% instead.
 */
export const COMPACT: FieldLayout = {
  basin: { x: 15, y: 2.5, w: 83, h: 42.5 },
  band: { x: 15, y: 40.5, w: 83, h: 4.5 },
  rowH: 1.65,
  pitch: 2.05,
  inset: 1.5,
  // Budgeted against the field's FLOOR (34rem = 544px), not against a roomy
  // phone: two lines of text-base plus their padding need ~54px, and 10.5% of
  // that floor is 57. The stack ends at 92 so the account line — whose rule
  // hangs 4px below its own box — still clears the bottom of the field.
  cards: [
    { x: 18, y: 47, w: 80, h: 10.5 },
    { x: 18, y: 58.5, w: 80, h: 10.5 },
    { x: 18, y: 70, w: 80, h: 10.5 },
    { x: 18, y: 81.5, w: 80, h: 10.5 },
  ],
  anchors: [20, 34, 50, 68],
  sway: [-6, -7, -8, -9],
  // Ordered with the anchors, so four threads converging on one gutter never
  // cross each other on the way in.
  lanes: [5, 8, 11, 14],
  presenceX: 7,
  presenceLift: 0.5,
  presenceMinY: 5,
  thresholdLabel: false,
  note: { x: 50, y: 96 },
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);

/** The top edge of the nth slot up from the band. */
export const slotTop = (L: FieldLayout, slot: number): number =>
  L.band.y - (slot + 1) * L.pitch;

/** The surface of the talk when `slots` of it are stacked. */
export const waterY = (L: FieldLayout, slots: number): number => L.band.y - slots * L.pitch;

/** The line the level has to reach before a pass is worth running, and how far
 *  down one pass gets — everything below THAT is the oldest part. */
export const thresholdY = (L: FieldLayout, full: number): number => waterY(L, full) - 1.6;
export const reachY = (L: FieldLayout, reach: number): number =>
  L.band.y - reach * L.pitch - (L.pitch - L.rowH) / 2;

/** Where a pill rests, before any shift. */
export function rowRect(L: FieldLayout, slot: number, side: 0 | 1, w: number): Rect {
  const width = (w / 100) * (L.basin.w - L.inset * 2);
  const left = L.basin.x + L.inset;
  return {
    x: side === 0 ? left : L.basin.x + L.basin.w - L.inset - width,
    y: slotTop(L, slot),
    w: width,
    h: L.rowH,
  };
}

/**
 * A vertical distance, restated as a percentage of one row's own height —
 * which is what framer's `y` resolves against, so a pill can travel the field
 * on the compositor without a single layout write.
 */
export const rowShift = (L: FieldLayout, distance: number): number => (distance / L.rowH) * 100;

/** Where in the band slot `i` comes to rest — four sub-layers, so it compacts
 *  as sediment rather than as one flat line. */
export const sinkY = (L: FieldLayout, i: number): number =>
  L.band.y + L.band.h * 0.25 + (i % 4) * (L.band.h * 0.16);

/** Where a thread leaves the band, and where it lands on its card. */
export function threadEnds(L: FieldLayout, i: number): [Point, Point] {
  const card = L.cards[i];
  const from = { x: L.anchors[i], y: L.band.y + L.band.h * 0.5 };
  const to = L.lanes
    ? { x: card.x, y: card.y + card.h / 2 }
    : { x: card.x + card.w / 2, y: card.y };
  return [from, to];
}

/**
 * One thread, band to card. Both control points pull the SAME way, so a thread
 * leaves the mass and stays clear of the cards for its whole run rather than
 * ducking behind one at the last moment. Authored per thread, because four
 * copies of one curve read as plumbing.
 */
export function threadPath(L: FieldLayout, i: number): string {
  const [from, to] = threadEnds(L, i);
  const run = to.y - from.y;
  const r = (n: number) => Math.round(n * 100) / 100;
  const lane = L.lanes?.[i];
  const [c1x, c1y, c2x, c2y] =
    lane === undefined
      ? [from.x + L.sway[i], from.y + run * 0.45, to.x + L.sway[i] * 0.4, to.y - run * 0.35]
      : [lane, from.y + run * 0.3, lane, to.y - run * 0.2];
  return [
    `M ${r(from.x)} ${r(from.y)}`,
    `C ${r(c1x)} ${r(c1y)}, ${r(c2x)} ${r(c2y)},`,
    `${r(to.x)} ${r(to.y)}`,
  ].join(" ");
}
