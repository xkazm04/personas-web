/**
 * Scene geometry for "The Fence" — her workshop, variant C.
 *
 * One coordinate system for everything: percent of the field. Panels read it
 * as CSS percentages and the one curve in the scene reads it as a
 * `viewBox="0 0 100 100"` with no aspect lock, so "50" in a path and "50%" in
 * a panel's inline style are the same place at any viewport. The boundary is
 * the deliberate exception — it is a rectangle, and a rectangle in that
 * viewBox comes out with mismatched stroke weights and stretched glows, so it
 * is built from positioned edges instead (see ./Fence).
 *
 * The shape is a yard. The places you opened lie inside it, she stands inside
 * it, and the two things that are yours rather than hers are the only things
 * OUTSIDE it: the dial that says how much she does on her own, and the one
 * piece of work she never touches. That is the whole argument in the placement
 * before a single thing moves — she is in the yard, the controls are not.
 *
 * Nothing here is rolled. The asymmetry (her off-centre, the stop point up and
 * to her right, bed heights) is authored so the scene is identical every loop.
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
  /** The boundary. Everything she may do happens inside this rectangle — and
   *  its corners are sharp, because every panel on this page is a rounded card
   *  and this is not a card. It is a line on the ground. */
  fence: Rect;
  /** Where the plate naming the yard sits astride the top edge. */
  plate: Point;
  her: Point;
  /** The places you opened to her, inside the line. */
  beds: readonly Rect[];
  /** Yours, not hers — so it stands outside the line. */
  dial: Rect;
  /** The dial stands beside the yard (md+) or lies below it (narrow). */
  vertical: boolean;
  /** The one piece of work that is not in the yard. Also outside. */
  outside: Rect;
  /** Where her reach meets the line — and stops. */
  stop: Point;
  /**
   * Her → the line. Authored per layout rather than derived, because this is
   * the one line in the scene that matters and it has exactly one job: to
   * arrive at the boundary square-on, so that stopping reads as being stopped
   * rather than as petering out.
   */
  reach: string;
}

/**
 * md+ — the yard takes the left three-quarters of the field, the dial stands
 * off its right shoulder, and the work she may not start floats above the top
 * edge with nothing but empty space between it and the line.
 *
 * Percentages are budgeted against the field's FLOOR height (36rem, set by the
 * section shell): a percent box shrinks with the viewport while the type inside
 * it does not.
 */
export const WIDE: FieldLayout = {
  fence: { x: 3, y: 20, w: 69, h: 76 },
  plate: { x: 8, y: 20 },
  her: { x: 30, y: 30 },
  beds: [
    { x: 7, y: 40, w: 60, h: 15 },
    { x: 7, y: 58, w: 60, h: 15 },
    { x: 7, y: 76, w: 60, h: 15 },
  ],
  dial: { x: 76, y: 30, w: 22, h: 50 },
  vertical: true,
  outside: { x: 40, y: 1, w: 30, h: 13 },
  stop: { x: 55, y: 20 },
  reach: "M 33.5 26.5 C 43 22, 55 26, 55 20",
};

/**
 * <md — the same yard, turned upright: the work she may not start sits above
 * the top edge, and the dial lies across the bottom, still outside the line.
 *
 * TWO places rather than three, each of them taller. The argument is the same
 * one either way — the yard fills to exactly the room it had and no further —
 * and it survives the narrower field intact, whereas three places at this
 * width would have had to carry the work with its name cut in half. Fewer
 * things, never smaller type. `Field` renders as many places as this list has,
 * so nothing else has to know which layout is on screen.
 */
export const COMPACT: FieldLayout = {
  fence: { x: 1, y: 16, w: 98, h: 70 },
  plate: { x: 5, y: 16 },
  her: { x: 30, y: 26 },
  beds: [
    { x: 5, y: 37, w: 90, h: 20 },
    { x: 5, y: 61, w: 90, h: 20 },
  ],
  dial: { x: 1, y: 89, w: 98, h: 11 },
  vertical: false,
  outside: { x: 18, y: 0, w: 64, h: 12 },
  // Far enough along the top edge to clear the plate: the mark she leaves on
  // the line must not land on the label naming what the line contains.
  stop: { x: 80, y: 16 },
  reach: "M 40 23 C 55 20, 80 24, 80 16",
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);
