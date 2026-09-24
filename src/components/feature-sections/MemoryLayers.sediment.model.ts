import type { BrandKey } from "@/lib/brand-theme";

/* Geometry and timeline for the "sediment" memory illustration.
   Drawn in a 540 x 420 viewBox; one progress value (0 → 1) drives every beat:
   runs 1-3 pour grains that thicken four strata, then the important grains
   rise to the top band where the recall bracket closes on them. */

export const VB_W = 540;
export const VB_H = 420;
export const COL_X = 220;
export const COL_W = 160;
export const COL_Y = 48;
export const COL_BOTTOM = 400;
export const COL_CX = COL_X + COL_W / 2;
export const COL_RIGHT = COL_X + COL_W;
export const INNER_X = COL_X + 6;
export const INNER_W = COL_W - 12;
export const TOP_BAND_Y = 84; // where recalled grains rest
export const LABEL_X = COL_RIGHT + 44;

/** Strata from the bottom up; colours follow CATEGORY_META in memoryShared. */
export const STRATA: {
  key: string;
  label: string;
  brand: BrandKey;
  h: number;
  /** cumulative share of final thickness after run 1, 2, 3 */
  f: [number, number, number];
}[] = [
  { key: "constraint", label: "Constraint", brand: "rose", h: 44, f: [0.35, 0.72, 1] },
  { key: "technical", label: "Technical", brand: "amber", h: 62, f: [0.3, 0.58, 1] },
  { key: "preference", label: "Preference", brand: "purple", h: 52, f: [0.4, 0.7, 1] },
  { key: "learning", label: "Learning", brand: "cyan", h: 70, f: [0.26, 0.62, 1] },
];

/** y of the top edge of stratum i at rest. */
export const FINAL_TOPS = STRATA.map((s, i) =>
  STRATA.slice(0, i).reduce((y, x) => y - x.h, COL_BOTTOM) - s.h,
);
const STRATA_TOP = FINAL_TOPS[FINAL_TOPS.length - 1];

export const DURATION = 5.4;
export const RUN_START = [0.03, 0.27, 0.51] as const;
const GROW = [0.09, 0.22] as const; // offset inside a run window
export const POP = [0.76, 0.8] as const;
export const RISE = [0.82, 0.93] as const;
export const CATCH = [0.9, 0.97] as const;

export const RUN_CARDS = [150, 214, 278]; // card centre y
export const CARD_X = 22;
export const CARD_W = 104;
export const CARD_H = 46;
export const GRAINS_PER_RUN = 9;

export interface Stops {
  t: number[];
  v: number[];
}

/** Share of stratum i's final thickness, as stops over progress. */
export function growthStops(i: number): Stops {
  const f = STRATA[i].f;
  const t: number[] = [0];
  const v: number[] = [0];
  RUN_START.forEach((s, k) => {
    t.push(s + GROW[0], s + GROW[1]);
    v.push(k === 0 ? 0 : f[k - 1], f[k]);
  });
  t.push(1);
  v.push(1);
  return { t, v };
}

export function interp(p: number, { t, v }: Stops) {
  if (p <= t[0]) return v[0];
  for (let k = 1; k < t.length; k++) {
    if (p <= t[k]) {
      const span = t[k] - t[k - 1];
      return span <= 0 ? v[k] : v[k - 1] + ((p - t[k - 1]) / span) * (v[k] - v[k - 1]);
    }
  }
  return v[v.length - 1];
}

/** Deterministic scatter so server and client agree. */
export function scatter(seed: number, n: number) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: n }, () => ({ x: rnd(), y: rnd(), r: 1.4 + rnd() * 1.6 }));
}

/** Surface (y) of the whole sediment once run k has settled. */
export function surfaceAfter(k: number) {
  return STRATA_TOP + STRATA.reduce((m, s) => m + s.h * (1 - s.f[k]), 0);
}

/** Flight of grain j of run k: card → over the rim → down to the surface. */
export function grainFlight(run: number, j: number) {
  const t0 = RUN_START[run] + j * 0.01;
  const jitter = ((j * 37) % 9) - 4; // -4..4
  const x = COL_CX + jitter * 15;
  return {
    t: [t0, t0 + 0.035, t0 + 0.065, t0 + 0.12],
    x: [CARD_X + CARD_W, COL_X - 14 + jitter * 2, COL_CX + jitter * 6, x],
    y: [RUN_CARDS[run] + jitter * 2.5, 22 + Math.abs(jitter) * 2, 34, surfaceAfter(run) - 4],
    brand: STRATA[j % STRATA.length].brand,
  };
}

/** The important grain of each stratum: where it sits, and where recall holds it. */
export const RECALLED = STRATA.map((s, i) => ({
  brand: s.brand,
  fromX: COL_CX + [-40, 30, -20, 45][i],
  fromY: FINAL_TOPS[i] + s.h / 2,
  toX: COL_CX + [-48, -16, 16, 48][i],
}));
