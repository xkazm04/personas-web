/**
 * Scene geometry for "The Flight" — section 5, variant A.
 *
 * Two coordinate systems, and the whole variant lives on the difference
 * between them:
 *
 *   WORLD   percent of the field, before the camera. Every project plot is
 *           placed here once and never moves again. The camera is a single
 *           transform over the group that holds them.
 *   SCREEN  percent of the field, after the camera. Everything that carries
 *           TYPE lives here — labels, the opened detail, Athena — so type
 *           renders at its authored size at every altitude. A camera that
 *           magnified its own labels would be a zoomed screenshot, not a
 *           descent; a map re-labels instead, and so does this.
 *
 * `project` / `projectRect` are the bridge, and they are pure, so the label
 * layer can never drift from the plot it names.
 *
 * Nothing here is random. An archipelago still has to be deterministic, so
 * the asymmetry — plot sizes, band offsets, tilts — is authored.
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

/** The camera: a uniform zoom plus a world offset, in field percent. */
export interface Camera {
  s: number;
  tx: number;
  ty: number;
}

export interface FieldLayout {
  /** Project plots, in world percent. Organic bands, never a grid. */
  islands: readonly Rect[];
  /** Authored rotation per plot, degrees — parcels, not tiles. */
  tilt: readonly number[];
  /** How far the camera descends onto the one that needs you. */
  nearZoom: number;
  /** Where that plot's centre lands on screen at the bottom of the descent. */
  nearFocus: Point;
  /** Athena's screen station while the whole field is in view. */
  rest: Point;
  /** …and where she stands once the camera is down. */
  nearStation: Point;
  /** The opened detail, in screen percent. */
  panel: { w: number; h: number; gap: number };
  /** Screen gap between a plot's bottom edge and its label. */
  labelGap: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/** The whole field, seen from altitude. World and screen coincide here. */
export const ALTITUDE: Camera = { s: 1, tx: 0, ty: 0 };

/**
 * A camera that puts `target` at `at` on screen, zoomed to `s` — clamped so
 * the field always covers the frame. Flying past the edge of your own
 * portfolio would be the one moment the illusion breaks.
 */
export function cameraOn(target: Point, s: number, at: Point): Camera {
  const overhang = 100 * s - 100;
  return {
    s,
    tx: clamp(at.x - s * target.x, -overhang, 0),
    ty: clamp(at.y - s * target.y, -overhang, 0),
  };
}

export const project = (p: Point, c: Camera): Point => ({
  x: c.tx + c.s * p.x,
  y: c.ty + c.s * p.y,
});

export const projectRect = (r: Rect, c: Camera): Rect => ({
  x: c.tx + c.s * r.x,
  y: c.ty + c.s * r.y,
  w: c.s * r.w,
  h: c.s * r.h,
});

export const centerOf = (r: Rect): Point => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

/** Where a plot's label sits on screen: under it, centred, at any altitude. */
export function labelPoint(r: Rect, c: Camera, L: FieldLayout): Point {
  const p = projectRect(r, c);
  return { x: p.x + p.w / 2, y: p.y + p.h + L.labelGap };
}

/**
 * The opened detail's screen rect — under the plot it belongs to, flipped
 * above it if there is no room, and always inside the frame.
 */
export function panelRect(r: Rect, c: Camera, L: FieldLayout): Rect {
  const p = projectRect(r, c);
  const { w, h, gap } = L.panel;
  const below = p.y + p.h + gap;
  return {
    x: clamp(p.x + p.w / 2 - w / 2, 2, Math.max(2, 98 - w)),
    y: below + h <= 98 ? below : Math.max(2, p.y - gap - h),
    w,
    h,
  };
}

/**
 * md+ — three uneven bands across a wide field. Band membership is 5/4/3 and
 * the plots inside a band sit at different heights, which is what keeps a
 * portfolio from reading as a dashboard grid.
 *
 * Percentages are budgeted against the field's FLOOR height (34rem, set by
 * the section shell): a percent box shrinks with the viewport while the type
 * beside it does not.
 */
export const WIDE: FieldLayout = {
  islands: [
    { x: 3, y: 16, w: 15, h: 11 },
    { x: 23, y: 12, w: 13, h: 10 },
    { x: 41, y: 17, w: 17, h: 12 },
    { x: 64, y: 13, w: 13, h: 10 },
    { x: 82, y: 18, w: 15, h: 11 },
    { x: 7, y: 42, w: 15, h: 11 },
    { x: 28, y: 38, w: 16, h: 12 },
    { x: 52, y: 44, w: 15, h: 11 },
    { x: 74, y: 39, w: 16, h: 12 },
    { x: 14, y: 68, w: 16, h: 11 },
    { x: 40, y: 72, w: 17, h: 11 },
    { x: 68, y: 67, w: 15, h: 11 },
  ],
  tilt: [-1.2, 0.8, -0.5, 1.4, -0.9, 1.1, -1.5, 0.6, -0.8, 1.3, -1.1, 0.9],
  nearZoom: 2,
  nearFocus: { x: 50, y: 30 },
  rest: { x: 50, y: 5 },
  nearStation: { x: 13, y: 26 },
  panel: { w: 46, h: 34, gap: 4.5 },
  labelGap: 1.6,
};

/**
 * <md — four pairs down the page. Fewer plots, never smaller type.
 *
 * The order of this array is not cosmetic: the project the camera descends
 * to is a fixed index (`WORST`), and here that index holds a middle-band
 * plot on purpose. A target parked against the field's bottom edge would
 * pin the camera on its clamp and leave the opened detail no room under it.
 */
export const COMPACT: FieldLayout = {
  islands: [
    { x: 4, y: 9, w: 42, h: 9 },
    { x: 54, y: 12, w: 42, h: 9 },
    { x: 7, y: 30, w: 40, h: 9 },
    { x: 52, y: 75, w: 44, h: 9 },
    { x: 3, y: 51, w: 44, h: 9 },
    { x: 53, y: 54, w: 43, h: 9 },
    { x: 8, y: 72, w: 40, h: 9 },
    { x: 53, y: 33, w: 43, h: 10 },
  ],
  tilt: [-0.8, 0.6, -0.5, 0.9, -0.7, 0.5, -0.9, 0.7],
  nearZoom: 1.7,
  nearFocus: { x: 50, y: 26 },
  rest: { x: 50, y: 3 },
  // Centred: her caption is centre-anchored below her at this breakpoint,
  // and a station near the left gutter clips it against the frame.
  nearStation: { x: 50, y: 79 },
  panel: { w: 92, h: 31, gap: 4 },
  labelGap: 1.4,
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);
