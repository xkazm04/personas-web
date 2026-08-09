/**
 * Geometry for the day-band SVG — pure coordinate math, no React.
 *
 * The band renders in two orientations from the same `t` data:
 *   "h" — desktop: morning at the left, night at the right (viewBox 1000×240)
 *   "v" — mobile: morning at the top, night at the bottom (viewBox 240×1000)
 *
 * Cross-axis layout (the `c` coordinate, 0–240):
 *   typical-assistant lane baseline at 72 (ticks strike toward 72-h),
 *   the horizon line at 120, the Athena lane at 168.
 */

export type Orientation = "h" | "v";

export const BAND = {
  long: 1000,
  cross: 240,
  laneTypical: 72,
  horizon: 120,
  laneAthena: 168,
} as const;

export function viewBox(o: Orientation): string {
  return o === "h" ? `0 0 ${BAND.long} ${BAND.cross}` : `0 0 ${BAND.cross} ${BAND.long}`;
}

/** Map a day position `t` (0–1) + cross-axis coord to SVG x/y. */
export function pt(o: Orientation, t: number, c: number): { x: number; y: number } {
  const along = t * BAND.long;
  return o === "h" ? { x: along, y: c } : { x: c, y: along };
}

/** SVG line endpoints for an interruption tick of height `h` on the typical lane. */
export function tickLine(o: Orientation, t: number, h: number) {
  const a = pt(o, t, BAND.laneTypical);
  const b = pt(o, t, BAND.laneTypical - h);
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
}

/** Rect (x/y/width/height) for a `t`-range band spanning the full cross axis. */
export function rangeRect(o: Orientation, start: number, end: number) {
  const len = (end - start) * BAND.long;
  return o === "h"
    ? { x: start * BAND.long, y: 0, width: len, height: BAND.cross }
    : { x: 0, y: start * BAND.long, width: BAND.cross, height: len };
}

/** Percentage CSS position for HTML overlays anchored to a band point. */
export function overlayPos(o: Orientation, t: number, c: number) {
  const along = `${(t * 100).toFixed(2)}%`;
  const cross = `${((c / BAND.cross) * 100).toFixed(2)}%`;
  return o === "h" ? { left: along, top: cross } : { left: cross, top: along };
}
