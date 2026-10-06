/**
 * Geometry for v2 "Moving In": one isometric workspace floor on a 1440x640
 * art box. Everything is placed in GRID units (gx to the right-down, gy to the
 * left-down, gz up) and projected here, so the SVG floor and the HTML label
 * layer above it (which positions in percent of the same box) agree exactly.
 * Pure functions and constants only; nothing here touches the DOM.
 */

export const VB = { w: 1440, h: 640 } as const;
export const ART_AR = VB.w / VB.h;

const S = 56; // px per grid unit
const C = 0.866; // cos 30deg
const O = { x: 598.8, y: 70 }; // the platform's top (back) corner

export const FLOOR = { gx: 12, gy: 7, t: 0.4 } as const;

export interface G {
  x: number;
  y: number;
  z?: number;
}

/** Grid point to art pixels. */
export function iso({ x, y, z = 0 }: G): { x: number; y: number } {
  return { x: O.x + (x - y) * C * S, y: O.y + (x + y) * 0.5 * S - z * S };
}

/** Grid point to percent of the art box (numbers) — for transforms. */
export function isoPct(g: G): { x: number; y: number } {
  const p = iso(g);
  return { x: (p.x / VB.w) * 100, y: (p.y / VB.h) * 100 };
}

/** Grid point as `left`/`top` percent styles — for the HTML label layer. */
export function pct(g: G): { left: string; top: string } {
  const p = isoPct(g);
  return { left: `${p.x.toFixed(2)}%`, top: `${p.y.toFixed(2)}%` };
}

const pt = (g: G) => {
  const p = iso(g);
  return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
};

/** A polygon's `points` from grid corners. */
export const poly = (gs: G[]) => gs.map(pt).join(" ");

/** The three visible faces of a box standing on (x, y) with size (w, d, h). */
export function boxFaces(x: number, y: number, w: number, d: number, h: number, z = 0) {
  return {
    top: poly([{ x, y, z: z + h }, { x: x + w, y, z: z + h }, { x: x + w, y: y + d, z: z + h }, { x, y: y + d, z: z + h }]),
    left: poly([{ x, y: y + d, z: z + h }, { x: x + w, y: y + d, z: z + h }, { x: x + w, y: y + d, z }, { x, y: y + d, z }]),
    right: poly([{ x: x + w, y, z: z + h }, { x: x + w, y: y + d, z: z + h }, { x: x + w, y: y + d, z }, { x: x + w, y, z }]),
  };
}

/** A smooth cable along the floor: leaves `a` heading +gx, arrives at `b`
 *  heading +gx, so every cable reads as laid in the same direction. */
export function cable(a: G, b: G): string {
  const dx = (b.x - a.x) * 0.55;
  const p0 = iso(a);
  const c1 = iso({ x: a.x + dx, y: a.y });
  const c2 = iso({ x: b.x - dx, y: b.y });
  const p1 = iso(b);
  return `M${p0.x.toFixed(1)} ${p0.y.toFixed(1)} C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
}

/** Points sampled along the same cable — packets ride these as keyframes. */
export function cableSamples(a: G, b: G, n = 14): { x: number[]; y: number[] } {
  const dx = (b.x - a.x) * 0.55;
  const P = [iso(a), iso({ x: a.x + dx, y: a.y }), iso({ x: b.x - dx, y: b.y }), iso(b)];
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
    xs.push(k.reduce((s, kk, j) => s + kk * P[j].x, 0));
    ys.push(k.reduce((s, kk, j) => s + kk * P[j].y, 0));
  }
  return { x: xs, y: ys };
}

/* ── The room ─────────────────────────────────────────────────────────── */

export const HUB: G = { x: 4.6, y: 3.5 };

/** Four sockets along the back-left edge — the tools you might use. */
export const SOCKETS = [1.1, 2.6, 4.1, 5.6].map((y) => ({ x: 0.75, y }));
export const socketIn = (i: number): G => ({ x: 1.2, y: SOCKETS[i].y });
export const hubIn = (i: number): G => ({ x: HUB.x - 0.85, y: HUB.y + (i - 1.5) * 0.22 });

/** Three agent desks across the right half of the floor. */
export const DESKS = [
  { x: 7.1, y: 0.7 },
  { x: 8.3, y: 2.95 },
  { x: 9.5, y: 5.2 },
].map((p) => ({ ...p, w: 2.2, d: 1.4, h: 0.62 }));
export const deskIn = (i: number): G => ({ x: DESKS[i].x - 0.05, y: DESKS[i].y + DESKS[i].d * 0.55 });
export const hubOut = (i: number): G => ({ x: HUB.x + 0.85, y: HUB.y + (i - 1) * 0.3 });

/** The dashed plot the empty floor shows where the agents will stand. */
export const PLOT = { x: 6.6, y: 0.35, w: 5.1, d: 6.4 } as const;
