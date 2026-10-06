/**
 * WHERE everything sits in memory lab v3 - the map. Design units of an
 * aspect-locked art box, so the SVG layers and the HTML labels share one
 * coordinate system and nothing stretches.
 *
 * The road is authored as a handful of stops and turned into a smooth curve
 * (Catmull-Rom through the stops, as cubic Beziers), so the same numbers give
 * the drawn path, the spark-free traveller's keyframes and the share of the
 * road at which she passes each landmark - one source, no measuring the DOM.
 */

export type Pt = { x: number; y: number };

export interface MapGeo {
  W: number;
  H: number;
  fs: { label: number; note: number; count: number };
  /** start, the four landmarks, "shipped". */
  stops: Pt[];
  /** Where each landmark's words go, centred on x, from y down. */
  notes: { x: number; y: number; w: number }[];
  clearR: number;
  face: number;
  title: Pt;
  ledger: Pt;
}

type Seg = [Pt, Pt, Pt, Pt];

/** Catmull-Rom through the stops, as one cubic Bezier per leg. */
export function segments(stops: Pt[]): Seg[] {
  const out: Seg[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const p0 = stops[Math.max(0, i - 1)];
    const p1 = stops[i];
    const p2 = stops[i + 1];
    const p3 = stops[Math.min(stops.length - 1, i + 2)];
    out.push([
      p1,
      { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p2,
    ]);
  }
  return out;
}

export const pathOf = (segs: Seg[]) =>
  segs
    .map(([a, b, c, d], i) => `${i === 0 ? `M ${a.x} ${a.y} ` : ""}C ${b.x} ${b.y} ${c.x} ${c.y} ${d.x} ${d.y}`)
    .join(" ");

export function pointOn([a, b, c, d]: Seg, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
}

/** Keyframes along some legs of the road, as percents of the art box. */
export function ride(geo: MapGeo, from: number, to: number, perLeg = 10) {
  const segs = segments(geo.stops).slice(from, to);
  const xs: string[] = [];
  const ys: string[] = [];
  segs.forEach((s, k) => {
    for (let i = k === 0 ? 0 : 1; i <= perLeg; i++) {
      const p = pointOn(s, i / perLeg);
      xs.push(`${(p.x / geo.W) * 100}%`);
      ys.push(`${(p.y / geo.H) * 100}%`);
    }
  });
  return { xs, ys };
}

export const pct = (geo: MapGeo, p: Pt) => ({ x: `${(p.x / geo.W) * 100}%`, y: `${(p.y / geo.H) * 100}%` });

export const WIDE_MAP: MapGeo = {
  W: 1200,
  H: 500,
  fs: { label: 14, note: 18, count: 40 },
  stops: [
    { x: 92, y: 292 },
    { x: 318, y: 196 },
    { x: 530, y: 330 },
    { x: 752, y: 184 },
    { x: 960, y: 322 },
    { x: 1112, y: 214 },
  ],
  notes: [
    { x: 318, y: 58, w: 250 },
    { x: 530, y: 378, w: 250 },
    { x: 752, y: 46, w: 250 },
    { x: 960, y: 370, w: 250 },
  ],
  clearR: 118,
  face: 54,
  title: { x: 30, y: 32 },
  ledger: { x: 30, y: 388 },
};

export const COMPACT_MAP: MapGeo = {
  W: 600,
  H: 1060,
  fs: { label: 19, note: 24, count: 46 },
  stops: [
    { x: 110, y: 190 },
    { x: 420, y: 290 },
    { x: 170, y: 480 },
    { x: 430, y: 660 },
    { x: 170, y: 850 },
    { x: 470, y: 980 },
  ],
  notes: [
    { x: 190, y: 268, w: 300 },
    { x: 430, y: 440, w: 300 },
    { x: 180, y: 626, w: 300 },
    { x: 410, y: 800, w: 300 },
  ],
  clearR: 120,
  face: 64,
  title: { x: 24, y: 34 },
  ledger: { x: 330, y: 22 },
};
