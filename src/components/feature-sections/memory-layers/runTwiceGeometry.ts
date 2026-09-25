/**
 * Geometry for the "run-twice" memory illustration, computed once at module
 * scope from plain numbers so the server and the client draw the identical
 * picture (no DOM measurement, no hydration drift).
 *
 * viewBox 1000 x 420. Top track (run 1) wanders around y=150 with two retry
 * loops whose apexes are the failure points; bottom track (run 12) is the
 * straight line y=335 from the same start x to the same goal x.
 */

export const VIEW_W = 1000;
export const VIEW_H = 420;

export const START_X = 70;
export const GOAL_X = 930;
export const TOP_Y = 150;
export const BOTTOM_Y = 335;
/** The band between the lanes where kept failures pass down as memory. */
export const MEM_Y = 240;

type Seg = [number, number, number, number, number, number];

// Cubic segments (c1x, c1y, c2x, c2y, x, y) from (START_X, TOP_Y).
const SEGS: Seg[] = [
  [130, 150, 150, 95, 210, 100],
  [270, 105, 290, 172, 330, 162],
  [405, 150, 398, 66, 350, 72], // retry loop 1: out and up to the failure
  [300, 78, 312, 196, 404, 170], // ...and back around
  [470, 150, 480, 100, 540, 110],
  [600, 120, 590, 186, 640, 170],
  [705, 152, 698, 66, 650, 72], // retry loop 2
  [600, 78, 612, 196, 704, 170],
  [770, 150, 790, 118, 840, 134],
  [880, 146, 900, 150, GOAL_X, TOP_Y],
];

/** Failure points: the apex of each retry loop (end of segments 2 and 6). */
export const FAILS = [
  { x: 350, y: 72 },
  { x: 650, y: 72 },
];

interface Pt {
  x: number;
  y: number;
  s: number;
}

const STEPS = 48;

function sample(): Pt[] {
  const pts: Pt[] = [{ x: START_X, y: TOP_Y, s: 0 }];
  let x0 = START_X;
  let y0 = TOP_Y;
  let s = 0;
  for (const [c1x, c1y, c2x, c2y, x, y] of SEGS) {
    for (let i = 1; i <= STEPS; i++) {
      const t = i / STEPS;
      const u = 1 - t;
      const px = u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x;
      const py = u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y;
      const prev = pts[pts.length - 1];
      s += Math.hypot(px - prev.x, py - prev.y);
      pts.push({ x: px, y: py, s });
    }
    x0 = x;
    y0 = y;
  }
  return pts;
}

const PTS = sample();
const TOTAL = PTS[PTS.length - 1].s;

/** Arc-length fraction at which the traveller reaches each failure point. */
export const FAIL_AT = [2, 6].map((segIndex) => PTS[(segIndex + 1) * STEPS].s / TOTAL);

/** Position on run 1 at arc-length fraction f (0..1). */
export function run1At(f: number): { x: number; y: number } {
  const target = Math.min(1, Math.max(0, f)) * TOTAL;
  let lo = 0;
  let hi = PTS.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (PTS[mid].s < target) lo = mid;
    else hi = mid;
  }
  const a = PTS[lo];
  const b = PTS[hi];
  const k = b.s === a.s ? 0 : (target - a.s) / (b.s - a.s);
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}

/** Run 1 as N equal-length pieces, so it can be drawn with opacity alone. */
export const RUN1_PIECES = 60;

const fmt = (n: number) => n.toFixed(1);

export const RUN1_CHUNKS: string[] = Array.from({ length: RUN1_PIECES }, (_, i) => {
  const from = (i / RUN1_PIECES) * TOTAL;
  const to = ((i + 1) / RUN1_PIECES) * TOTAL;
  const a = run1At(from / TOTAL);
  const inner = PTS.filter((p) => p.s > from && p.s < to);
  const b = run1At(to / TOTAL);
  return [a, ...inner, b].map((p, j) => `${j ? "L" : "M"}${fmt(p.x)} ${fmt(p.y)}`).join("");
});
