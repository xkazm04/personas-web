/* V1 "The trail": geometry in viewBox units (1200 x 620).
 *
 * A winding trail through four stops (install, describe, build, run) that ends
 * by joining a loop: the agent's own circuit, which it keeps running. The trail
 * is a Catmull-Rom spline through the stops; an arc-length table lets the
 * traveller walk it at an even pace and gives each stop its point in the story
 * (p = the share of the trail walked). Pure math: no DOM measurement. */

export const W = 1200;
export const H = 620;

type Pt = readonly [number, number];

export const LOOP = { cx: 1062, cy: 448, r: 108 } as const;
const ENTRY: Pt = [LOOP.cx, LOOP.cy - LOOP.r];

const PTS: Pt[] = [
  [120, 452], // install
  [392, 250], // describe
  [650, 442], // build
  [888, 236], // run
  ENTRY,
];
/** Phantom points beyond the ends, so the trail leaves and arrives level. */
const HEAD: Pt = [20, 520];
const TAIL: Pt = [ENTRY[0] + 260, ENTRY[1]];

type Seg = { p1: Pt; c1: Pt; c2: Pt; p2: Pt };

function segments(): Seg[] {
  const all = [HEAD, ...PTS, TAIL];
  const out: Seg[] = [];
  for (let i = 1; i < all.length - 2; i++) {
    const [p0, p1, p2, p3] = [all[i - 1], all[i], all[i + 1], all[i + 2]];
    out.push({
      p1,
      c1: [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
      c2: [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
      p2,
    });
  }
  return out;
}

const SEGS = segments();
const r1 = (n: number) => Math.round(n * 10) / 10;

export const TRAIL_D =
  `M${PTS[0][0]} ${PTS[0][1]}` + SEGS.map((s) => ` C${r1(s.c1[0])} ${r1(s.c1[1])} ${r1(s.c2[0])} ${r1(s.c2[1])} ${s.p2[0]} ${s.p2[1]}`).join("");

function bez(s: Seg, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * s.p1[0] + b * s.c1[0] + c * s.c2[0] + d * s.p2[0], a * s.p1[1] + b * s.c1[1] + c * s.c2[1] + d * s.p2[1]];
}

/** Arc-length table: [x, y, length so far]. */
const STEPS = 48;
const LUT: [number, number, number][] = [[PTS[0][0], PTS[0][1], 0]];
const SEG_END: number[] = [];
for (const s of SEGS) {
  for (let i = 1; i <= STEPS; i++) {
    const [x, y] = bez(s, i / STEPS);
    const [px, py, len] = LUT[LUT.length - 1];
    LUT.push([x, y, len + Math.hypot(x - px, y - py)]);
  }
  SEG_END.push(LUT[LUT.length - 1][2]);
}
const TOTAL = LUT[LUT.length - 1][2];

/** The point `f` (0..1) of the way along the trail. */
export function pointAt(f: number): Pt {
  const target = Math.min(1, Math.max(0, f)) * TOTAL;
  let lo = 0;
  let hi = LUT.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (LUT[mid][2] < target) lo = mid;
    else hi = mid;
  }
  const [x0, y0, l0] = LUT[lo];
  const [x1, y1, l1] = LUT[hi];
  const k = l1 === l0 ? 0 : (target - l0) / (l1 - l0);
  return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
}

/** Story timing: the walk takes WALK of p; the loop's agent wakes after it. */
const WALK = 0.86;
export const walkShare = (p: number) => Math.min(1, p / WALK);
export const AGENT_AT = 0.9;

export type StopKey = "install" | "describe" | "build" | "run" | "away";

/** Where each stop's text block sits (top-left, width) and where it is on the trail. */
export const STOPS: { key: StopKey; n: number; x: number; y: number; at: number; text: { x: number; y: number; w: number } }[] = [
  { key: "install", n: 1, x: PTS[0][0], y: PTS[0][1], at: 0.02, text: { x: 36, y: 488, w: 270 } },
  { key: "describe", n: 2, x: PTS[1][0], y: PTS[1][1], at: (SEG_END[0] / TOTAL) * WALK, text: { x: 240, y: 46, w: 300 } },
  { key: "build", n: 3, x: PTS[2][0], y: PTS[2][1], at: (SEG_END[1] / TOTAL) * WALK, text: { x: 392, y: 478, w: 250 } },
  { key: "run", n: 4, x: PTS[3][0], y: PTS[3][1], at: (SEG_END[2] / TOTAL) * WALK, text: { x: 626, y: 46, w: 290 } },
  { key: "away", n: 5, x: LOOP.cx, y: LOOP.cy, at: AGENT_AT, text: { x: 948, y: 108, w: 244 } },
];

/** Points on the loop, angle in degrees (0 = right, 90 = down). */
export const onLoop = (deg: number, r: number = LOOP.r): Pt => {
  const a = (deg * Math.PI) / 180;
  return [Math.round((LOOP.cx + Math.cos(a) * r) * 100) / 100, Math.round((LOOP.cy + Math.sin(a) * r) * 100) / 100];
};
/** The loop's two gates: the 08:00 schedule and a new email. */
export const GATES = { morning: 335, email: 155 } as const;
/** The agent token starts at the trail's arrival point (the top). */
export const LOOP_START = 270;
