/**
 * Scene geometry for "The Return" — section 6, variant C.
 *
 * One coordinate system, deliberately: percent of the field, for everything.
 * There is no camera in this section and nothing here travels — the closing
 * section of the page is the one that is allowed to be still, and a scene
 * that never moves can afford to place its type in the same space as its art.
 *
 * The shape is a hearth. Conversations sit around the edge, she sits at the
 * centre, and the one you are standing in opens beneath her — so every
 * gathered thread runs INWARD and every answer comes back out of one place.
 *
 * Nothing here is rolled. A ring of six that reads as organic still has to be
 * deterministic, so the asymmetry is authored: card sizes differ, the flanks
 * hang lower than the crown, and each thread leans by its own amount so six
 * strands arriving at one point stay six strands.
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
 * Where the three lines of her answer sit inside the open conversation, as a
 * fraction of its height.
 *
 * This is the one number the art and the type have to agree on, so it is
 * stated once and both read it: the rows are placed at these heights, and the
 * hairline that joins each row to the conversation it came from LEAVES at
 * these heights. Deriving one from the other means they cannot drift, at any
 * viewport, whatever flexbox does inside the panel that frame.
 */
export const ROW_FRAC = [0.43, 0.6, 0.77] as const;

/** One line of her answer, and the conversation it came from. */
export interface Source {
  /** Index into CONVERSATIONS. */
  card: number;
  /** Which edge of the open conversation the hairline leaves by — always the
   *  one facing its card, so a source never has to cross the answer. */
  side: "left" | "right";
  /** Where it meets the conversation it came from. */
  to: Point;
  bow: number;
}

export interface FieldLayout {
  /** The conversations around her. */
  cards: readonly Rect[];
  /** Where each one's thread leaves it, on the edge that faces her. */
  exits: readonly Point[];
  /** Lean per gather thread — without it six arcs into one point read as a
   *  compass rose rather than as six separate strands coming home. */
  bows: readonly number[];
  her: Point;
  /** How far below her centre the trunk starts, clear of the avatar. */
  herDrop: number;
  /** The conversation you are standing in. */
  panel: Rect;
  sources: readonly Source[];
}

const r = (n: number) => Math.round(n * 100) / 100;

/**
 * One thread, as a quadratic bowed off its own midpoint. The offset is
 * perpendicular in viewBox space (the SVG carrying these does not lock its
 * aspect ratio, which is what lets "50" here and "50%" in a card's inline
 * style be the same place) — so on a wide field the lean reads flatter than
 * authored, which is exactly right: the crown is further away than the flanks.
 */
export function arc(from: Point, to: Point, bow: number): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (from.x + to.x) / 2 + (-dy / len) * bow;
  const cy = (from.y + to.y) / 2 + (dx / len) * bow;
  return `M ${r(from.x)} ${r(from.y)} Q ${r(cx)} ${r(cy)}, ${r(to.x)} ${r(to.y)}`;
}

/** Her → the top of the open conversation. The one thread that runs outward. */
export function trunk(L: FieldLayout): string {
  return `M ${r(L.her.x)} ${r(L.her.y + L.herDrop)} L ${r(L.panel.x + L.panel.w / 2)} ${r(L.panel.y)}`;
}

/** Where the hairline for answer line `row` leaves the open conversation. */
export function sourceStart(L: FieldLayout, row: number): Point {
  const s = L.sources[row];
  return {
    x: s.side === "left" ? L.panel.x : L.panel.x + L.panel.w,
    y: L.panel.y + L.panel.h * ROW_FRAC[row],
  };
}

/** The hairline joining answer line `row` to the conversation behind it. */
export const sourcePath = (L: FieldLayout, row: number): string =>
  arc(sourceStart(L, row), L.sources[row].to, L.sources[row].bow);

/**
 * md+ — a crown of four across the top and a flank on either side, with the
 * three she answers from spread to the far corners so their sources never
 * bundle into one gutter.
 *
 * Percentages are budgeted against the field's FLOOR height (36rem, set by
 * the section shell): a percent box shrinks with the viewport while the type
 * inside it does not.
 */
export const WIDE: FieldLayout = {
  cards: [
    { x: 2, y: 2, w: 21, h: 14 },
    { x: 77, y: 2, w: 21, h: 14 },
    { x: 2, y: 22, w: 21, h: 14 },
    { x: 27, y: 5, w: 21, h: 13 },
    { x: 52, y: 5, w: 21, h: 13 },
    { x: 77, y: 22, w: 21, h: 14 },
  ],
  exits: [
    { x: 12.5, y: 16 },
    { x: 87.5, y: 16 },
    { x: 23, y: 29 },
    { x: 37.5, y: 18 },
    { x: 62.5, y: 18 },
    { x: 77, y: 29 },
  ],
  bows: [-6, 6, -5, -3, 3, 5],
  her: { x: 50, y: 28 },
  herDrop: 9,
  panel: { x: 17, y: 46, w: 66, h: 42 },
  sources: [
    { card: 0, side: "left", to: { x: 12.5, y: 16.5 }, bow: -7 },
    { card: 1, side: "right", to: { x: 87.5, y: 16.5 }, bow: 7 },
    { card: 2, side: "left", to: { x: 12.5, y: 36.5 }, bow: -3 },
  ],
};

/**
 * <md — two rows of two above her, and the open conversation taking the whole
 * bottom half. Fewer conversations, never smaller type.
 *
 * The sources run up the gutters here rather than across the field: three
 * hairlines crossing a 390px scene would read as a tangle, and the claim they
 * join would be the thing that got lost.
 */
export const COMPACT: FieldLayout = {
  cards: [
    { x: 2, y: 2, w: 46, h: 13 },
    { x: 52, y: 2, w: 46, h: 13 },
    { x: 2, y: 18, w: 46, h: 13 },
    { x: 52, y: 18, w: 46, h: 13 },
  ],
  exits: [
    { x: 25, y: 15 },
    { x: 75, y: 15 },
    { x: 25, y: 31 },
    { x: 75, y: 31 },
  ],
  bows: [-5, 5, -3, 3],
  her: { x: 50, y: 40 },
  herDrop: 7,
  panel: { x: 2, y: 52, w: 96, h: 44 },
  sources: [
    { card: 0, side: "left", to: { x: 6, y: 15.5 }, bow: -3 },
    { card: 1, side: "right", to: { x: 94, y: 15.5 }, bow: 3 },
    { card: 2, side: "left", to: { x: 6, y: 31.5 }, bow: -2 },
  ],
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);
