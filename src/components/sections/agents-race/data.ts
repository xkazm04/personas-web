import { lerp, r2, seg } from "./shared/motion";

/* Geometry for v3 "Off the rails": one stylised map, one start, one
 * destination. Fixed rules are a train on a straight track: quick, until the
 * scenario's snag blocks the line. The agent is a route that bends around the
 * snag through four waypoints (the steps it took) and arrives. */

export const W = 1200;
export const H = 560;
export const DURATION = 10;

type Pt = [number, number];
export const START: Pt = [150, 446];
export const END: Pt = [1046, 150];
const along = (t: number): Pt => [lerp(START[0], END[0], t), lerp(START[1], END[1], t)];
export const SNAG_T = 0.5;
export const SNAG = along(SNAG_T);
export const STOP_T = 0.4;
export const RAIL_ANGLE = r2((Math.atan2(END[1] - START[1], END[0] - START[0]) * 180) / Math.PI);

/** The agent's waypoints, between START and END. */
export const WAYPOINTS: Pt[] = [
  [352, 488],
  [576, 484],
  [790, 410],
  [948, 300],
];
const ROUTE: Pt[] = [START, ...WAYPOINTS, END];

/** Catmull-Rom through ROUTE, as one cubic per leg: [p0, c1, c2, p1]. */
export const LEGS: [Pt, Pt, Pt, Pt][] = ROUTE.slice(0, -1).map((p1, i) => {
  const p0 = ROUTE[Math.max(0, i - 1)];
  const p2 = ROUTE[i + 1];
  const p3 = ROUTE[Math.min(ROUTE.length - 1, i + 2)];
  const c1: Pt = [r2(p1[0] + (p2[0] - p0[0]) / 6), r2(p1[1] + (p2[1] - p0[1]) / 6)];
  const c2: Pt = [r2(p2[0] - (p3[0] - p1[0]) / 6), r2(p2[1] - (p3[1] - p1[1]) / 6)];
  return [p1, c1, c2, p2];
});
export const legPath = ([a, b, c, d]: [Pt, Pt, Pt, Pt]) => `M ${a[0]} ${a[1]} C ${b[0]} ${b[1]}, ${c[0]} ${c[1]}, ${d[0]} ${d[1]}`;

const bez = (a: number, b: number, c: number, d: number, t: number) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

/* Timing: both leave together. */
export const TRAIN = [0.03, 0.27] as const;
export const AGENT_GO = 0.05;
export const LEG = 0.165;
export const legWindow = (i: number) => [AGENT_GO + i * LEG, AGENT_GO + (i + 1) * LEG] as const;
export const ARRIVE = AGENT_GO + LEGS.length * LEG;

/** Where the agent's marker is at story progress `p`. */
export function markerAt(p: number) {
  const k = Math.min(LEGS.length - 1, Math.max(0, Math.floor((p - AGENT_GO) / LEG)));
  const [a, b, c, d] = LEGS[k];
  const t = seg(p, ...legWindow(k));
  return { x: bez(a[0], b[0], c[0], d[0], t), y: bez(a[1], b[1], c[1], d[1], t) };
}

/** The train's distance along the rail (0..STOP_T), braking into the stop. */
export function trainAt(p: number) {
  const k = seg(p, TRAIN[0], TRAIN[1]);
  const t = STOP_T * (1 - (1 - k) * (1 - k));
  const [x, y] = along(t);
  const jolt = p > TRAIN[1] ? Math.sin((p - TRAIN[1]) * 300) * 4 * Math.max(0, 1 - (p - TRAIN[1]) / 0.04) : 0;
  return { x: x + jolt, y };
}

/** Terrain contours: closed blobs drawn as smooth loops. */
export const CONTOURS: { cx: number; cy: number; rx: number; ry: number; rings: number }[] = [
  { cx: 300, cy: 210, rx: 190, ry: 110, rings: 4 },
  { cx: 860, cy: 470, rx: 210, ry: 90, rings: 3 },
  { cx: 640, cy: 130, rx: 140, ry: 70, rings: 3 },
];
