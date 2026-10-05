/**
 * Geometry for V1 ("run twice", relit), computed once at module scope from
 * plain numbers so the server and the client draw the identical picture.
 *
 * viewBox 1200 x 560. Top lane: run 1 wanders around y=140 with two retry
 * loops whose apexes are the failures. Middle: the memory shelf. Bottom lane:
 * run 12, a straight line at y=440 from the same start to the same goal.
 */

export const W = 1200;
export const H = 560;

export const START_X = 260;
export const GOAL_X = 1110;
export const TOP_Y = 140;
export const BOTTOM_Y = 448;
export const SHELF_Y = 296;

export const LANE_TOP = { y: 28, h: 216 };
export const LANE_BOTTOM = { y: 348, h: 196 };

type Seg = [number, number, number, number, number, number];

// The live section's path (x 70..930, centre y 150), re-fitted to this frame.
const RAW: Seg[] = [
  [130, 150, 150, 95, 210, 100],
  [270, 105, 290, 172, 330, 162],
  [405, 150, 398, 66, 350, 72],
  [300, 78, 312, 196, 404, 170],
  [470, 150, 480, 100, 540, 110],
  [600, 120, 590, 186, 640, 170],
  [705, 152, 698, 66, 650, 72],
  [600, 78, 612, 196, 704, 170],
  [770, 150, 790, 118, 840, 134],
  [880, 146, 900, 150, 930, 150],
];
const fx = (x: number) => START_X + ((x - 70) * (GOAL_X - START_X)) / 860;
const fy = (y: number) => TOP_Y + (y - 150) * 1.12;
const SEGS: Seg[] = RAW.map(([a, b, c, d, e, f]) => [fx(a), fy(b), fx(c), fy(d), fx(e), fy(f)]);

/** Failure points: the apex of each retry loop (end of segments 2 and 6). */
export const FAILS = [SEGS[2], SEGS[6]].map((s) => ({ x: s[4], y: s[5] }));

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

/** The whole of run 1 as one path (the faint ghost under the drawn pieces). */
export const RUN1_D = `M${START_X} ${TOP_Y}` + SEGS.map((s) => `C${s.map((n) => n.toFixed(1)).join(" ")}`).join("");

/** Run 1 as N equal-length pieces, so it can be drawn with opacity alone. */
export const RUN1_PIECES = 72;

const fmt = (n: number) => n.toFixed(1);

export const RUN1_CHUNKS: string[] = Array.from({ length: RUN1_PIECES }, (_, i) => {
  const from = (i / RUN1_PIECES) * TOTAL;
  const to = ((i + 1) / RUN1_PIECES) * TOTAL;
  const a = run1At(from / TOTAL);
  const inner = PTS.filter((p) => p.s > from && p.s < to);
  const b = run1At(to / TOTAL);
  return [a, ...inner, b].map((p, j) => `${j ? "L" : "M"}${fmt(p.x)} ${fmt(p.y)}`).join("");
});

/* Story beats on one progress value p (0..1). */
export const T = {
  run1: [0, 0.46] as const,
  drop: [0.46, 0.58] as const,
  recall: [0.58, 0.66] as const,
  run12: [0.66, 0.88] as const,
  goal: [0.88, 1] as const,
};
