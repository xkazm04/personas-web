/**
 * Scene geometry for "Pick it up where you left it" — section 6, variant B.
 *
 * Everything is placed from percent rects over one field, and the carry lane
 * draws in the SAME percent space (an SVG with `viewBox="0 0 100 100"` and no
 * aspect lock), so a line can never miss the conversation it feeds.
 *
 * ELAPSED TIME IS THE GEOMETRY. There is no clock anywhere in this section —
 * the days are the DISTANCE between conversations, and the second gap is
 * deliberately much wider than the first. Nothing else here changes across
 * the loop: the conversations never move, so the space between them is the
 * only thing saying how long it has been.
 *
 * Two sets, switched on the md breakpoint (`useIsMobile`):
 *   WIDE     — three conversations across the field at three different
 *              heights, the lane running underneath them.
 *   COMPACT  — the same argument turned on its side: the conversations stack
 *              down the page and the lane runs down the left gutter. Fewer
 *              lines per conversation, never smaller type.
 *
 * Nothing here is random — asymmetry (the heights, the port offsets) is
 * authored so the scene is identical on every render.
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

export interface SceneLayout {
  /** One conversation each, in the order they happened. */
  moments: readonly Rect[];
  /** Where a conversation's line meets its panel edge. */
  ports: readonly Point[];
  /** Where she stands on the lane while she is in that conversation. */
  stations: readonly Point[];
  /** Deep in the second gap — she waits out the days there, still carrying
   *  it. Without this she would arrive early and stand in the dark. */
  drift: Point;
  /** The closing mark's centre. */
  chip: Point;
  /** The lane runs down the page instead of across it. */
  vertical: boolean;
  /** How far a conversation's pool of light bleeds past its own panel. */
  pool: number;
  /** Corner radius where a line turns into or out of the lane. */
  bend: number;
}

/** md+ — three conversations across, the lane underneath. The gaps are 7 and
 *  12: the same distance would say the same amount of time passed twice. */
export const WIDE: SceneLayout = {
  moments: [
    { x: 1, y: 8, w: 26, h: 54 },
    { x: 34, y: 14, w: 26, h: 53 },
    { x: 72, y: 6, w: 27, h: 54 },
  ],
  ports: [
    { x: 14, y: 62 },
    { x: 44.9, y: 67 },
    { x: 85.5, y: 60 },
  ],
  stations: [
    { x: 14, y: 80 },
    { x: 44.9, y: 80 },
    { x: 85.5, y: 80 },
  ],
  drift: { x: 65.2, y: 80 },
  chip: { x: 50, y: 91 },
  vertical: false,
  pool: 9,
  bend: 3,
};

/** <md — the conversations stack and the lane holds the left gutter. The
 *  opening pleasantry and the closing "Perfect." step aside here (see
 *  `wideOnly` in ./copy); the three panels are budgeted for what is left. */
export const COMPACT: SceneLayout = {
  moments: [
    { x: 14, y: 0.5, w: 85, h: 25 },
    { x: 14, y: 31.5, w: 85, h: 28 },
    { x: 14, y: 68.5, w: 85, h: 25 },
  ],
  ports: [
    { x: 14, y: 14.25 },
    { x: 14, y: 45.5 },
    { x: 14, y: 81 },
  ],
  stations: [
    { x: 6, y: 14.25 },
    { x: 6, y: 45.5 },
    { x: 6, y: 81 },
  ],
  drift: { x: 6, y: 63.25 },
  chip: { x: 50, y: 97 },
  vertical: true,
  pool: 6,
  bend: 2.5,
};

export const layoutFor = (compact: boolean): SceneLayout => (compact ? COMPACT : WIDE);

/** The axis she travels along, and the one she is offset on. Writing the
 *  paths once in these terms is what lets the compact layout be the same
 *  drawing rotated a quarter turn rather than a second drawing. */
const along = (L: SceneLayout, p: Point) => (L.vertical ? p.y : p.x);
const across = (L: SceneLayout, p: Point) => (L.vertical ? p.x : p.y);
const at = (L: SceneLayout, a: number, c: number) => (L.vertical ? `${c} ${a}` : `${a} ${c}`);

/** The first conversation handing what you said down into the lane. */
export function dropPath(L: SceneLayout): string {
  const a = along(L, L.ports[0]);
  const c0 = across(L, L.ports[0]);
  const c1 = across(L, L.stations[0]);
  const mid = c0 + (c1 - c0) * 0.55;
  return `M ${at(L, a, c0)} C ${at(L, a, mid)} ${at(L, a, c1)} ${at(L, a + L.bend, c1)}`;
}

/** The days between two conversations. Straight, because at the end of the
 *  loop every piece of this lights at once and has to read as ONE line. */
export function legPath(L: SceneLayout, i: number): string {
  const s0 = L.stations[i];
  const s1 = L.stations[i + 1];
  return `M ${at(L, along(L, s0), across(L, s0))} L ${at(L, along(L, s1), across(L, s1))}`;
}

/** …and it surfacing again, in a conversation that never asked for it. */
export function risePath(L: SceneLayout, i: number): string {
  const s = L.stations[i + 1];
  const p = L.ports[i + 1];
  const a = along(L, p);
  const c0 = across(L, s);
  const c1 = across(L, p);
  const mid = c0 + (c1 - c0) * 0.55;
  return `M ${at(L, a - L.bend, c0)} C ${at(L, a, c0)} ${at(L, a, mid)} ${at(L, a, c1)}`;
}

/** A conversation's pool of light — grown around its panel, never clipped to
 *  it, so the light falls off into the dark the next one is waiting in. */
export function poolRect(r: Rect, d: number): Rect {
  return { x: r.x - d, y: r.y - d, w: r.w + d * 2, h: r.h + d * 2 };
}
