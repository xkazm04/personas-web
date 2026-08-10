/**
 * Scene geometry for "The Thing You Stopped Looking At" — section 5, variant C.
 *
 * Deliberately NOT a grid, a map or a lattice: the two sibling variants own the
 * present-tense survey, so this one is a night field with a loose, authored
 * constellation of lights in it. Nothing is on a rail, no two lights share a
 * row or a column, and the sizes are uneven — which is what stops six boxes
 * from reading as a dashboard.
 *
 * Everything is placed in percent of the field, and the one SVG layer (the
 * thread she draws when she notices) uses the same 0–100 space with no aspect
 * lock, so a line can never miss the light it points at.
 *
 * Lights are sized in PIXELS off `base`, not in percent: a percent circle
 * collapses on a short viewport while the name under it stays text-base, and
 * this section's floor is that nothing ever shrinks below text-base.
 *
 * Two sets, switched on the md breakpoint (`useIsMobile`): WIDE spreads the
 * constellation across the whole field with the report opening to the right of
 * the light she carries forward; COMPACT keeps four lights in the upper band
 * and stacks the report beneath them. Fewer lights, never smaller type.
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

export interface Cell {
  at: Point;
  /** Relative diameter — how much of your work this one is. */
  size: number;
  /** How far back it sits: blur and bloom only, never its name. */
  depth: number;
}

export interface FieldLayout {
  cells: readonly Cell[];
  /** The project this section is about — the one you stopped looking at. */
  subject: number;
  /** The milder drift she is deliberately NOT surfacing first (worst first). */
  runnerUp: number;
  /** Where she carries the subject when she brings it to you. */
  focus: Point;
  /** The report she opens beside it. */
  panel: Rect;
  /** Her place in the field. She does not move — that is the whole point. */
  watcher: Point;
  /** Where YOUR attention rests, in order. It does move. */
  gaze: readonly Point[];
  /** How wide your attention falls, in percent of the field. */
  gazeSpread: number;
  /** Base light diameter, px. */
  base: number;
  compact: boolean;
}

/**
 * md+ — the constellation. Six projects at six sizes and six depths, none of
 * them aligned to another, the subject sitting big and central-left where the
 * eye lands first (it is the one you were proud of).
 */
export const WIDE: FieldLayout = {
  cells: [
    { at: { x: 11, y: 29 }, size: 0.64, depth: 0.62 },
    { at: { x: 26, y: 65 }, size: 0.84, depth: 0.2 },
    { at: { x: 45, y: 30 }, size: 1, depth: 0 },
    { at: { x: 62, y: 67 }, size: 0.76, depth: 0.36 },
    { at: { x: 79, y: 27 }, size: 0.88, depth: 0.12 },
    { at: { x: 90, y: 58 }, size: 0.56, depth: 0.74 },
  ],
  subject: 2,
  runnerUp: 4,
  focus: { x: 24, y: 43 },
  // Clear of the subject's HOME rect, not just of where she carries it: the
  // report outlives the carry by a beat, and the two must not collide on the
  // frame that has to say everything at once.
  panel: { x: 53, y: 21, w: 43, h: 50 },
  watcher: { x: 50, y: 91 },
  gaze: [
    { x: 45, y: 30 },
    { x: 79, y: 27 },
    { x: 26, y: 65 },
    { x: 62, y: 67 },
    { x: 24, y: 43 },
  ],
  gazeSpread: 38,
  base: 104,
  compact: false,
};

/**
 * <md — five lights down the whole field rather than a band at the top, so the
 * scene is never bottom-empty during the long stretch before the report opens.
 * The report then takes the lower half, and the constellation makes room by
 * compressing UPWARD (see `recede`) instead of by being pushed off screen.
 * Fewer lights than WIDE, never smaller type.
 */
export const COMPACT: FieldLayout = {
  cells: [
    { at: { x: 18, y: 10 }, size: 0.56, depth: 0.5 },
    { at: { x: 66, y: 8 }, size: 0.68, depth: 0.3 },
    { at: { x: 33, y: 27 }, size: 1, depth: 0 },
    { at: { x: 80, y: 50 }, size: 0.54, depth: 0.6 },
    { at: { x: 22, y: 64 }, size: 0.6, depth: 0.34 },
  ],
  subject: 2,
  runnerUp: 4,
  focus: { x: 50, y: 27 },
  panel: { x: 3, y: 44, w: 94, h: 44 },
  watcher: { x: 50, y: 94 },
  gaze: [
    { x: 33, y: 27 },
    { x: 66, y: 8 },
    { x: 18, y: 10 },
    { x: 80, y: 50 },
    { x: 50, y: 27 },
  ],
  gazeSpread: 62,
  base: 74,
  compact: true,
};

/**
 * How the rest of the field steps back while she holds one thing out to you.
 * WIDE eases back a hair about its own centre — there is room, it only needs
 * depth. COMPACT has no room, so it compresses toward the top instead, which
 * frees the lower half for the report without anything leaving the field.
 */
export function recede(L: FieldLayout): { scale: number; origin: string } {
  return L.compact ? { scale: 0.74, origin: "50% 0%" } : { scale: 0.95, origin: "50% 50%" };
}

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);

/** The subject's home, and how far she carries it when she surfaces it. */
export function carry(L: FieldLayout, surfaced: boolean): Point {
  if (!surfaced) return { x: 0, y: 0 };
  const home = L.cells[L.subject].at;
  return { x: L.focus.x - home.x, y: L.focus.y - home.y };
}

/** The one line she draws when she notices — her, to the thing nobody saw.
 *  Bowed away from vertical so it reads as a glance, not a wire. */
export function noticePath(L: FieldLayout): string {
  const from = L.watcher;
  const to = L.cells[L.subject].at;
  const run = from.y - to.y;
  const sway = L.compact ? 16 : 22;
  return `M ${from.x} ${from.y} C ${from.x - sway} ${from.y - run * 0.42}, ${
    to.x + sway * 0.7
  } ${to.y + run * 0.46}, ${to.x} ${to.y}`;
}
