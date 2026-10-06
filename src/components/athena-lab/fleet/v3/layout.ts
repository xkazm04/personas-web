/**
 * The little world of V3, in the scene's design px (FitBox zooms it whole).
 *
 * Her pad at the centre, the bubble that holds your words above her, and the
 * four tools the work needs set around her as stations. Every route is one
 * quadratic curve from her pad to a station's rim, sampled into points so a
 * teammate can FOLLOW it (keyframes through the samples) instead of cutting
 * straight across - and the same points draw the route line, so the traveller
 * and the road can never disagree.
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

export interface Station {
  /** Island centre. */
  at: Point;
  /** Bend of the route out to it. */
  bend: Point;
}

export interface WorldLayout {
  w: number;
  h: number;
  bubble: Rect;
  /** Her centre. */
  hub: Point;
  /** Where each teammate stands on her pad. */
  slots: readonly Point[];
  start: Point;
  stations: readonly Station[];
  /** Station island radius. */
  isle: number;
  labelW: number;
  light: readonly [Point, Point, Point];
}

export const WIDE: WorldLayout = {
  w: 1000,
  h: 400,
  bubble: { x: 290, y: 0, w: 420, h: 172 },
  hub: { x: 500, y: 266 },
  slots: [
    { x: 434, y: 318 },
    { x: 470, y: 334 },
    { x: 530, y: 334 },
    { x: 566, y: 318 },
  ],
  start: { x: 500, y: 382 },
  stations: [
    { at: { x: 118, y: 92 }, bend: { x: 300, y: 230 } },
    { at: { x: 250, y: 282 }, bend: { x: 360, y: 380 } },
    { at: { x: 750, y: 282 }, bend: { x: 640, y: 380 } },
    { at: { x: 882, y: 92 }, bend: { x: 700, y: 230 } },
  ],
  isle: 42,
  labelW: 260,
  light: [
    { x: 500, y: 80 },
    { x: 500, y: 230 },
    { x: 500, y: 110 },
  ],
};

export const COMPACT: WorldLayout = {
  w: 360,
  h: 860,
  bubble: { x: 0, y: 0, w: 360, h: 226 },
  hub: { x: 180, y: 520 },
  slots: [
    { x: 126, y: 568 },
    { x: 160, y: 582 },
    { x: 200, y: 582 },
    { x: 234, y: 568 },
  ],
  start: { x: 180, y: 630 },
  stations: [
    { at: { x: 82, y: 318 }, bend: { x: 120, y: 430 } },
    { at: { x: 278, y: 318 }, bend: { x: 240, y: 430 } },
    { at: { x: 82, y: 730 }, bend: { x: 110, y: 640 } },
    { at: { x: 278, y: 730 }, bend: { x: 250, y: 640 } },
  ],
  isle: 36,
  labelW: 168,
  light: [
    { x: 180, y: 110 },
    { x: 180, y: 520 },
    { x: 180, y: 120 },
  ],
};

export const layoutFor = (narrow: boolean): WorldLayout => (narrow ? COMPACT : WIDE);

export const box = (r: Rect) => ({ left: r.x, top: r.y, width: r.w, height: r.h });

const SAMPLES = 16;

/** Route i from its pad slot to its station's rim, as points along the curve. */
export function routePoints(L: WorldLayout, i: number): Point[] {
  const from = L.slots[i];
  const { at, bend } = L.stations[i];
  // Stop at the island's rim, on the side the route arrives from.
  const dx = bend.x - at.x;
  const dy = bend.y - at.y;
  const d = Math.hypot(dx, dy) || 1;
  const to = { x: at.x + (dx / d) * (L.isle + 14), y: at.y + (dy / d) * (L.isle + 14) };
  return Array.from({ length: SAMPLES + 1 }, (_, k) => {
    const t = k / SAMPLES;
    const u = 1 - t;
    return {
      x: Math.round((u * u * from.x + 2 * u * t * bend.x + t * t * to.x) * 10) / 10,
      y: Math.round((u * u * from.y + 2 * u * t * bend.y + t * t * to.y) * 10) / 10,
    };
  });
}

export const pathOf = (pts: Point[]) => `M ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
