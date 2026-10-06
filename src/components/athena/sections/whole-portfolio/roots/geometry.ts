/**
 * Geometry for "Roots" (lab v2) - a night garden of your projects, drawn in
 * cross-section: what you see above ground, and what each one stands on
 * below it.
 *
 * One coordinate system: a 1600 x 720 viewBox. The SVG draws in it; the type
 * layer is HTML positioned in percent of the same box (the box keeps the
 * viewBox's aspect ratio), so `pct()` is the whole bridge between the two.
 *
 * Everything is authored. A garden still has to be deterministic - plant
 * heights, leaf angles and root runs come from the plant's own index, never
 * from a dice roll.
 */

export const VB = { w: 1600, h: 720 } as const;
/** The ground line. Sky above, soil below. */
export const GROUND = 320;

export interface Pt {
  x: number;
  y: number;
}

export const pct = (p: Pt): Pt => ({ x: (p.x / VB.w) * 100, y: (p.y / VB.h) * 100 });

export interface Leaf {
  /** How far up the stem, 0..1. */
  t: number;
  side: 1 | -1;
  len: number;
  /** Rest angle above horizontal, degrees. */
  lift: number;
}

export interface Plant {
  /** Index into `athenaPage.portfolio.projects`. */
  project: number;
  x: number;
  h: number;
  leaves: Leaf[];
  /** Root runs, each a polyline from the base down. */
  roots: Pt[][];
}

/** Which projects grow here, left to right. Payments API (7) is centre. */
const ORDER = [0, 1, 2, 7, 5, 3, 4] as const;
const HEIGHTS = [190, 238, 168, 226, 205, 250, 178] as const;

/** Index (within the garden) of the plant she goes down for. */
export const WORST_PLANT = 3;
/** The two that also need you - they keep waiting their turn. */
export const ATTENTION_PLANTS = [2, 4] as const;

function leavesFor(k: number, h: number): Leaf[] {
  const n = 3 + (k % 2);
  return Array.from({ length: n }, (_, j) => ({
    t: 0.28 + (j * 0.6) / n,
    side: (j + k) % 2 === 0 ? 1 : -1,
    len: 34 + ((j * 7 + k * 5) % 16) + h * 0.06,
    lift: 18 + ((j * 11 + k * 3) % 22),
  }));
}

/** Circuit-like roots: straight drops and 45-degree elbows, ending in nodes. */
function rootsFor(x: number, k: number): Pt[][] {
  const a = 30 + (k % 3) * 14;
  const d = 120 + (k % 2) * 70;
  const deep = GROUND + 170 + (k % 3) * 34;
  return [
    [{ x, y: GROUND }, { x, y: GROUND + d }],
    [{ x, y: GROUND + 28 }, { x: x - a, y: GROUND + 28 + a }, { x: x - a, y: deep }, { x: x - a - 26, y: deep + 26 }],
    [{ x, y: GROUND + 46 }, { x: x + a + 8, y: GROUND + 54 + a }, { x: x + a + 8, y: GROUND + 140 + (k % 2) * 56 }],
    [{ x, y: GROUND + d * 0.62 }, { x: x + 24, y: GROUND + d * 0.62 + 24 }, { x: x + 24, y: GROUND + d * 0.62 + 64 }],
  ];
}

/** The plant she goes down for has the deep run that has gone bad. */
export const CAUSE: Pt = { x: 708, y: 616 };
const WORST_ROOTS: Pt[][] = [
  [{ x: 800, y: GROUND }, { x: 800, y: 404 }, { x: 708, y: 496 }, CAUSE],
  [{ x: 800, y: 370 }, { x: 872, y: 442 }, { x: 872, y: 560 }, { x: 900, y: 588 }],
  [{ x: 800, y: 404 }, { x: 836, y: 440 }, { x: 836, y: 490 }],
];

/** The bad run, traced from the stem DOWN to the cause - the way she reads it. */
export const ROT_PATH = "M 800 320 L 800 404 L 708 496 L 708 616";

export const PLANTS: Plant[] = ORDER.map((project, k) => {
  const x = 140 + k * 220;
  return {
    project,
    x,
    h: HEIGHTS[k],
    leaves: leavesFor(k, HEIGHTS[k]),
    roots: k === WORST_PLANT ? WORST_ROOTS : rootsFor(x, k),
  };
});

export const polyline = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");

/** The stem: a gentle S from the base to the bud. */
export function stemPath(p: Plant): string {
  const { x, h } = p;
  const s = p.project % 2 ? 1 : -1;
  return `M ${x} ${GROUND} C ${x + 10 * s} ${GROUND - h * 0.35}, ${x - 12 * s} ${GROUND - h * 0.7}, ${x} ${GROUND - h}`;
}

/** A point on the stem at 0..1 - the same cubic `stemPath` draws. */
export function stemPoint(p: Plant, t: number): Pt {
  const { x, h } = p;
  const s = p.project % 2 ? 1 : -1;
  const xs = [x, x + 10 * s, x - 12 * s, x];
  const ys = [GROUND, GROUND - h * 0.35, GROUND - h * 0.7, GROUND - h];
  const u = 1 - t;
  const b = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return {
    x: b.reduce((a, w, i) => a + w * xs[i], 0),
    y: b.reduce((a, w, i) => a + w * ys[i], 0),
  };
}

/** A leaf blade drawn pointing right from its own origin. */
export const leafPath = (len: number) =>
  `M 0 0 C ${len * 0.3} ${-len * 0.26}, ${len * 0.75} ${-len * 0.24}, ${len} 0 C ${len * 0.72} ${len * 0.16}, ${len * 0.3} ${len * 0.18}, 0 0 Z`;

/** Where she stands, by act (viewBox units). */
export const STATIONS = {
  dawn: { x: 120, y: 38 },
  dusk: { x: 1480, y: 38 },
  over: { x: 800, y: 38 },
  rest: { x: 800, y: 38 },
} as const;

/** Her way down: along the stem, under the ground, down the bad run. */
export const DESCENT: Pt[] = [
  { x: 800, y: 38 },
  { x: 800, y: GROUND - 40 },
  { x: 800, y: 404 },
  { x: 708, y: 496 },
  { x: 646, y: CAUSE.y - 28 },
];

/** The opened finding, docked right of the cause (percent of the box). */
export const CARD = { x: 50.5, y: 46, w: 41 } as const;
