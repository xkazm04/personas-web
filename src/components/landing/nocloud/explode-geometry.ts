/** Isometric geometry for the exploded-view illustration (viewBox 760 x 640). */
export type Pt = [number, number];

export const W = 330;
export const D = 160;
const C = 0.866;
const S = 0.5;
export const X0 = 300;

/** Layer origins, top plate to base. */
export const Y1 = 70;
export const Y2 = 265;
export const Y3 = 440;

export const p2 = (y0: number, u: number, v: number, z = 0): Pt => [X0 + (u - v) * C, y0 + (u + v) * S - z];

export const pts = (a: Pt[]): string => a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

const down = (p: Pt, t: number): Pt => [p[0], p[1] + t];

/** The three faces of a slab of thickness `t` whose top corner sits at origin `y0`. */
export function slab(y0: number, t: number) {
  const a = p2(y0, 0, 0);
  const b = p2(y0, W, 0);
  const c = p2(y0, W, D);
  const d = p2(y0, 0, D);
  return {
    left: pts([d, c, down(c, t), down(d, t)]),
    right: pts([b, c, down(c, t), down(b, t)]),
    top: pts([a, b, c, d]),
  };
}

/** A rectangle lying on the slab's top face, in slab (u, v) coordinates. */
export const quad = (y0: number, u0: number, v0: number, u1: number, v1: number): string =>
  pts([p2(y0, u0, v0), p2(y0, u1, v0), p2(y0, u1, v1), p2(y0, u0, v1)]);

/** Transform that lays upright text flat on the slab's top face. */
export function isoText(y0: number, u: number, v: number): string {
  const p = p2(y0, u, v);
  return `matrix(${C} ${S} ${-C} ${S} ${p[0].toFixed(1)} ${p[1].toFixed(1)})`;
}

/** A vertical rectangle on the slab's right face (u = W plane). */
export function port(y0: number, v: number, z: number, w: number, h: number): string {
  const a = p2(y0, W, v);
  const b = p2(y0, W, v + w);
  return pts([[a[0], a[1] + z], [b[0], b[1] + z], [b[0], b[1] + z + h], [a[0], a[1] + z + h]]);
}

/** Guide rails joining the three layers at the slab corners. */
export const GUIDES: { x1: number; y1: number; x2: number; y2: number }[] = [
  [0, D],
  [W, D],
  [W, 0],
  [0, 0],
].map(([u, v]) => {
  const a = p2(Y1, u, v);
  const b = p2(Y3, u, v);
  return { x1: a[0], y1: a[1], x2: b[0], y2: b[1] + 40 };
});

/** Callout marker for a layer: leader line and disc placed right of the slab. */
export function marker(y0: number) {
  const p = p2(y0, W, 0);
  return { x1: p[0] + 8, x2: p[0] + 70, cx: p[0] + 88, y: p[1] };
}
