import { lerp, r2, seg } from "./shared/motion";

/* Geometry for v3 "Off the rails": one stylised map, one start, one
 * destination. Fixed rules are a train on a straight track: quick, until the
 * scenario's snag blocks the line. The agent is a route that bends around the
 * snag through four waypoints (the steps it took) and arrives. Two drawings
 * share the story: the wide map (desktop and wide tablets) and a portrait map
 * for phones, where the rail runs down the page and the route bows left. */

export const DURATION = 10;

type Pt = [number, number];
type Leg = [Pt, Pt, Pt, Pt];
export type Contour = { cx: number; cy: number; rx: number; ry: number; rings: number };

const SNAG_T = 0.5;
const STOP_T = 0.4;

/* Timing: both leave together. */
export const TRAIN = [0.03, 0.27] as const;
export const AGENT_GO = 0.05;
export const LEG = 0.165;
export const legWindow = (i: number) => [AGENT_GO + i * LEG, AGENT_GO + (i + 1) * LEG] as const;
const LEG_COUNT = 5;
export const ARRIVE = AGENT_GO + LEG_COUNT * LEG;

const bez = (a: number, b: number, c: number, d: number, t: number) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};
export const legPath = ([a, b, c, d]: Leg) => `M ${a[0]} ${a[1]} C ${b[0]} ${b[1]}, ${c[0]} ${c[1]}, ${d[0]} ${d[1]}`;

function track(spec: { w: number; h: number; start: Pt; end: Pt; waypoints: Pt[]; contours: Contour[]; clock: { x: number; y: number }; tip?: Pt }) {
  const { start, end, waypoints } = spec;
  const along = (t: number): Pt => [lerp(start[0], end[0], t), lerp(start[1], end[1], t)];
  const route: Pt[] = [start, ...waypoints, end];
  /** Catmull-Rom through the route, as one cubic per leg: [p0, c1, c2, p1]. */
  const legs: Leg[] = route.slice(0, -1).map((p1, i) => {
    const p0 = route[Math.max(0, i - 1)];
    const p2 = route[i + 1];
    const p3 = route[Math.min(route.length - 1, i + 2)];
    const c1: Pt = [r2(p1[0] + (p2[0] - p0[0]) / 6), r2(p1[1] + (p2[1] - p0[1]) / 6)];
    const c2: Pt = [r2(p2[0] - (p3[0] - p1[0]) / 6), r2(p2[1] - (p3[1] - p1[1]) / 6)];
    return [p1, c1, c2, p2];
  });
  return {
    ...spec,
    snag: along(SNAG_T),
    railAngle: r2((Math.atan2(end[1] - start[1], end[0] - start[0]) * 180) / Math.PI),
    legs,
    /** Where the agent's marker is at story progress `p`. */
    markerAt(p: number) {
      const k = Math.min(legs.length - 1, Math.max(0, Math.floor((p - AGENT_GO) / LEG)));
      const [a, b, c, d] = legs[k];
      const t = seg(p, ...legWindow(k));
      return { x: bez(a[0], b[0], c[0], d[0], t), y: bez(a[1], b[1], c[1], d[1], t) };
    },
    /** The train's distance along the rail (0..STOP_T), braking into the stop. */
    trainAt(p: number) {
      const k = seg(p, TRAIN[0], TRAIN[1]);
      const [x, y] = along(STOP_T * (1 - (1 - k) * (1 - k)));
      const jolt = p > TRAIN[1] ? Math.sin((p - TRAIN[1]) * 300) * 4 * Math.max(0, 1 - (p - TRAIN[1]) / 0.04) : 0;
      return { x: x + jolt, y };
    },
  };
}

export type Track = ReturnType<typeof track>;

/** The wide map. Terrain contours are closed blobs drawn as smooth loops. */
export const DESK = track({
  w: 1200,
  h: 560,
  start: [150, 446],
  end: [1046, 150],
  waypoints: [
    [352, 488],
    [576, 484],
    [790, 410],
    [948, 300],
  ],
  contours: [
    { cx: 300, cy: 210, rx: 190, ry: 110, rings: 4 },
    { cx: 860, cy: 470, rx: 210, ry: 90, rings: 3 },
    { cx: 640, cy: 130, rx: 140, ry: 70, rings: 3 },
  ],
  clock: { x: 452, y: 404 },
  tip: [170, 150],
});

/** The portrait map: rail down the page, the route bowing out to its left, the
 *  stall note and the snag's name in the open column on its right. */
export const PHONE = track({
  w: 400,
  h: 700,
  start: [84, 70],
  end: [300, 640],
  waypoints: [
    [42, 214],
    [46, 380],
    [94, 516],
    [196, 606],
  ],
  contours: [
    { cx: 318, cy: 112, rx: 96, ry: 56, rings: 3 },
    { cx: 330, cy: 500, rx: 72, ry: 96, rings: 3 },
    { cx: 112, cy: 300, rx: 66, ry: 120, rings: 2 },
  ],
  clock: { x: 222, y: 206 },
});

/* The wide map's names, as Labels reads them. */
export const { w: W, h: H, start: START, waypoints: WAYPOINTS, snag: SNAG } = DESK;
