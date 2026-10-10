import type { CategoryKey } from "./shared/categories";

/**
 * V3 "Growth rings": geometry, computed once at module scope from plain
 * numbers so the server and the client draw the identical picture.
 *
 * viewBox 1200 x 620. One ring per run around the disc centre, run 1 inside.
 * A ring's roughness is its wobble; it shrinks run by run, and it is smoothed
 * further wherever an earlier run left a memory (the agent recalls it there).
 * A mistake leaves a `learned` or a `constraint` memory and is a sharp stumble
 * on the ring it was made on; facts, preferences, instructions and context are
 * noted without one.
 */

export const W = 1200;
export const H = 620;
export const C = { x: 470, y: 310 };
export const RUNS = 10;
const R0 = 74;
const STEP = 22.5;
export const ringR = (k: number) => R0 + k * STEP;

export interface Seed {
  k: CategoryKey;
  ring: number;
  /** Angle in radians, clockwise from twelve o'clock. */
  at: number;
}

export const SEEDS: Seed[] = [
  { k: "constraint", ring: 0, at: 0.9 },
  { k: "learned", ring: 0, at: 3.7 },
  { k: "fact", ring: 1, at: 2.25 },
  { k: "instruction", ring: 1, at: 5.05 },
  { k: "constraint", ring: 2, at: 4.4 },
  { k: "context", ring: 2, at: 1.55 },
  { k: "learned", ring: 3, at: 5.75 },
  { k: "preference", ring: 4, at: 0.25 },
  { k: "context", ring: 6, at: 3.0 },
];

export const isStumble = (s: Seed) => s.k === "learned" || s.k === "constraint";

const TAU = Math.PI * 2;
/** Shortest signed angle from b to a. */
const dAng = (a: number, b: number) => ((((a - b) % TAU) + TAU * 1.5) % TAU) - Math.PI;

function radius(k: number, th: number): number {
  const rough = 1.2 + 10 * (1 - k / (RUNS - 1)) ** 1.6;
  let calm = 1;
  for (const s of SEEDS) if (s.ring < k) calm *= 1 - 0.85 * Math.exp(-((dAng(th, s.at) / 0.38) ** 2));
  const ph = k * 1.7;
  const wobble = 0.55 * Math.sin(3 * th + ph) + 0.3 * Math.sin(7 * th + ph * 2.3) + 0.15 * Math.sin(13 * th + ph * 0.7);
  let r = ringR(k) + rough * calm * wobble;
  for (const s of SEEDS) {
    if (s.ring !== k || !isStumble(s)) continue;
    const d = dAng(th, s.at);
    r += 22 * Math.exp(-((d / 0.045) ** 2)) - 9 * Math.exp(-(((d - 0.1) / 0.045) ** 2)) + 7 * Math.exp(-(((d - 0.19) / 0.04) ** 2));
  }
  return r;
}

export const polar = (r: number, th: number) => ({ x: C.x + r * Math.sin(th), y: C.y - r * Math.cos(th) });

const N = 540;
interface Ring {
  d: string;
  /** Sample points with cumulative length, for placing the drawing head. */
  pts: { x: number; y: number; s: number }[];
}

function build(k: number): Ring {
  const pts: Ring["pts"] = [];
  let s = 0;
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * TAU;
    const p = polar(radius(k, th), th);
    if (i) s += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y);
    pts.push({ ...p, s });
  }
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("") + "Z";
  return { d, pts };
}

export const RINGS: Ring[] = Array.from({ length: RUNS }, (_, k) => build(k));

/** Point on ring k at drawn fraction f (0..1) of its length. */
export function headAt(k: number, f: number) {
  const { pts } = RINGS[k];
  const target = Math.min(1, Math.max(0, f)) * pts[N].s;
  let lo = 0;
  let hi = N;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (pts[mid].s < target) lo = mid;
    else hi = mid;
  }
  const a = pts[lo];
  const b = pts[hi];
  const t = b.s === a.s ? 0 : (target - a.s) / (b.s - a.s);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, th: ((lo + t) / N) * TAU };
}

export const seedXY = (s: Seed) => polar(ringR(s.ring), isStumble(s) ? s.at - 0.17 : s.at);
/** Where ring k crosses a seed's angle (the recall line's far end). */
export const crossXY = (s: Seed, k: number) => polar(radius(k, s.at), s.at);

/** Fraction of its length at which ring k reaches angle th (≈ th / 2π). */
export const fracAt = (k: number, th: number) => RINGS[k].pts[Math.round((th / TAU) * N)].s / RINGS[k].pts[N].s;

/** The stretch of ring around each stumble, drawn over the ring in rose. */
export const STUMBLES = SEEDS.filter(isStumble).map((s) => {
  const { pts } = RINGS[s.ring];
  const from = Math.round(((s.at - 0.12) / TAU) * N);
  const to = Math.round(((s.at + 0.26) / TAU) * N);
  const d = pts
    .slice(from, to + 1)
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join("");
  return { seed: s, d };
});
