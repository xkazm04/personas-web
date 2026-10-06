/**
 * Scene geometry for "The Return", evolved (lab v1).
 *
 * One coordinate system: percent of the art slot, for everything. The slot is
 * now exactly what is left of one stage under the title, so the live
 * section's tall hearth (a crown of cards over the open conversation, budgeted
 * against a 36rem floor) is re-cut for a WIDE field: the conversations stand
 * in two flanks, she sits at the top of the centre, and the conversation you
 * are standing in opens beneath her between the flanks.
 *
 * Two kinds of line, and they never share a lane:
 *
 *   gathers   leave each conversation's inner edge high and run INWARD to
 *             her. The lower ones pass BEHIND the open conversation's glass,
 *             which is the depth of the scene: what she gathers is behind
 *             what she says.
 *   sources   leave the open conversation at the exact height of a line of
 *             her answer (ROW_FRAC - one number both the type and the art
 *             read) and cross the gutter to the low half of the conversation
 *             it came from. Short, horizontal, adjacent: claim -> where she
 *             heard it, at a glance.
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

/** Where the three lines of her answer sit, as a fraction of the panel's height. */
export const ROW_FRAC = [0.46, 0.62, 0.78] as const;

export interface Source {
  card: number;
  side: "left" | "right";
  to: Point;
}

export interface FieldLayout {
  cards: readonly Rect[];
  /** Which side of her each conversation stands on - its key light faces in. */
  sides: readonly ("left" | "right")[];
  exits: readonly Point[];
  bows: readonly number[];
  her: Point;
  panel: Rect;
  sources: readonly Source[];
}

const r = (n: number) => Math.round(n * 100) / 100;

/** A gather thread: a quadratic bowed off its own midpoint. */
export function arc(from: Point, to: Point, bow: number): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (from.x + to.x) / 2 + (-dy / len) * bow;
  const cy = (from.y + to.y) / 2 + (dx / len) * bow;
  return `M ${r(from.x)} ${r(from.y)} Q ${r(cx)} ${r(cy)}, ${r(to.x)} ${r(to.y)}`;
}

/** Her -> the top of the open conversation. The one thread that runs outward. */
export function trunk(L: FieldLayout): string {
  return `M ${r(L.her.x)} ${r(L.her.y)} L ${r(L.panel.x + L.panel.w / 2)} ${r(L.panel.y)}`;
}

/** Where the hairline for answer line `row` leaves the open conversation. */
export function sourceStart(L: FieldLayout, row: number): Point {
  const s = L.sources[row];
  return {
    x: s.side === "left" ? L.panel.x : L.panel.x + L.panel.w,
    y: L.panel.y + L.panel.h * ROW_FRAC[row],
  };
}

/** The hairline joining answer line `row` to its conversation: an S across the gutter. */
export function sourcePath(L: FieldLayout, row: number): string {
  const a = sourceStart(L, row);
  const b = L.sources[row].to;
  const k = b.x - a.x;
  return `M ${r(a.x)} ${r(a.y)} C ${r(a.x + k * 0.6)} ${r(a.y)}, ${r(a.x + k * 0.4)} ${r(b.y)}, ${r(b.x)} ${r(b.y)}`;
}

/**
 * Stage and tablet - two flanks of three. Card order is the conversations'
 * order in i18n: 0-2 are the three she answers FROM, so they hold the low
 * halves of the flanks, beside the rows that quote them.
 */
export const WIDE: FieldLayout = {
  cards: [
    { x: 0, y: 35.5, w: 21, h: 29 }, // the rewrite      - left, middle
    { x: 79, y: 35.5, w: 21, h: 29 }, // Monday review   - right, middle
    { x: 2, y: 69, w: 21, h: 29 }, // getting set up     - left, low
    { x: 2, y: 2, w: 21, h: 29 }, // the outage          - left, high
    { x: 77, y: 2, w: 21, h: 29 }, // the pricing page   - right, high
    { x: 77, y: 69, w: 21, h: 29 }, // invoices          - right, low
  ],
  sides: ["left", "right", "left", "left", "right", "right"],
  exits: [
    { x: 21, y: 42 },
    { x: 79, y: 42 },
    { x: 23, y: 74 },
    { x: 23, y: 14 },
    { x: 77, y: 14 },
    { x: 77, y: 74 },
  ],
  bows: [-4, 4, -5, -3, 3, 5],
  her: { x: 50, y: 16.5 },
  panel: { x: 27, y: 36, w: 46, h: 62 },
  sources: [
    { card: 0, side: "left", to: { x: 21, y: 58 } },
    { card: 1, side: "right", to: { x: 79, y: 59 } },
    { card: 2, side: "left", to: { x: 23, y: 87 } },
  ],
};

/** Phones - two rows of two above her, the open conversation across the bottom. */
export const COMPACT: FieldLayout = {
  cards: [
    { x: 0, y: 0, w: 48, h: 15 },
    { x: 52, y: 0, w: 48, h: 15 },
    { x: 0, y: 17.5, w: 48, h: 15 },
    { x: 52, y: 17.5, w: 48, h: 15 },
  ],
  sides: ["left", "right", "left", "right"],
  exits: [
    { x: 24, y: 15 },
    { x: 76, y: 15 },
    { x: 24, y: 32.5 },
    { x: 76, y: 32.5 },
  ],
  bows: [-5, 5, -3, 3],
  her: { x: 50, y: 40.5 },
  panel: { x: 0, y: 49, w: 100, h: 51 },
  sources: [
    { card: 0, side: "left", to: { x: 1.5, y: 15 } },
    { card: 1, side: "right", to: { x: 98.5, y: 15 } },
    { card: 2, side: "left", to: { x: 1.5, y: 32.5 } },
  ],
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);
