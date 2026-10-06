import { endOf, type Scenario } from "../shared/scenarios";

/* The v3 track map, in viewBox units (W x H). The scripted bot's world is a
 * set of fixed tracks: a keyword switch sends the message down one of four,
 * each track ends in a bumper, and every bumper drains into one line that ends
 * at the human queue. The agent's route leaves the same origin and flies over
 * the tracks to "resolved". Every route is a polyline (curves are sampled), so
 * a position at any story second is plain arithmetic - no DOM measuring. */

export const W = 1300;
export const H = 470;
export type Pt = [number, number];

export const ORIGIN: Pt = [320, 238];
export const SWITCH: Pt = [392, 238];
export const ROWS = [125, 200, 275, 350];
export const STATIONS = [690, 800, 910];
export const BUMPER_X = 1000;
export const DRAIN_X = 1040;
export const QUEUE: Pt = [1200, 420];
export const RESOLVED: Pt = [1200, 112];
export const AGENT_Y = 40;
export const BEADS_X = [600, 800, 1000];

const rowStart = (y: number): Pt => [SWITCH[0] + 18 + Math.abs(y - SWITCH[1]) * 0.5, y];

/** The full scripted route along one track: origin, switch, track, bumper, drain, queue. */
export function trackRoute(row: number): { pts: Pt[]; marks: number[] } {
  const y = ROWS[row];
  const pts: Pt[] = [ORIGIN, SWITCH, [SWITCH[0] + 18, SWITCH[1]], rowStart(y), ...STATIONS.map((x): Pt => [x, y]), [BUMPER_X, y], [DRAIN_X - 18, y], [DRAIN_X, y + 18], [DRAIN_X, QUEUE[1] - 18], [DRAIN_X + 18, QUEUE[1]], QUEUE];
  // Vertex indices the train is timed against: switch, 3 stations, bumper, queue.
  return { pts, marks: [1, 4, 5, 6, 7, pts.length - 1] };
}

/** The rails as drawn: one path per track up to its bumper, plus the shared drain. */
export const trackPath = (row: number) => {
  const y = ROWS[row];
  const [sx, sy] = rowStart(y);
  return `M ${SWITCH[0]} ${SWITCH[1]} L ${SWITCH[0] + 18} ${SWITCH[1]} L ${sx} ${sy} L ${BUMPER_X} ${y} L ${DRAIN_X - 18} ${y} Q ${DRAIN_X} ${y} ${DRAIN_X} ${y + 18}`;
};
export const DRAIN_PATH = `M ${DRAIN_X} ${ROWS[0] + 18} L ${DRAIN_X} ${QUEUE[1] - 18} Q ${DRAIN_X} ${QUEUE[1]} ${DRAIN_X + 18} ${QUEUE[1]} L ${QUEUE[0]} ${QUEUE[1]}`;
export const FEED_PATH = `M ${ORIGIN[0]} ${ORIGIN[1]} L ${SWITCH[0]} ${SWITCH[1]}`;

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

/** The agent's route: up and over the tracks, straight across, down into "resolved". */
const LIFT: Pt = [490, AGENT_Y];
const LAND: Pt = [1100, AGENT_Y];
export const AGENT_PTS: Pt[] = [ORIGIN, ...cubic(ORIGIN, [338, 130], [390, AGENT_Y], LIFT, 18), ...BEADS_X.map((x): Pt => [x, AGENT_Y]), LAND, ...cubic(LAND, [1160, AGENT_Y], [RESOLVED[0], 60], RESOLVED, 14)];
export const AGENT_MARKS = [19, 20, 21, AGENT_PTS.length - 1]; // the three beads, then resolved
export const AGENT_PATH = `M ${ORIGIN[0]} ${ORIGIN[1]} C 338 130 390 ${AGENT_Y} ${LIFT[0]} ${LIFT[1]} L ${LAND[0]} ${LAND[1]} C 1160 ${AGENT_Y} ${RESOLVED[0]} 60 ${RESOLVED[0]} ${RESOLVED[1]}`;

/** Cumulative lengths along a polyline. */
export function lengths(pts: Pt[]): number[] {
  const out = [0];
  for (let i = 1; i < pts.length; i++) out.push(out[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return out;
}

export function pointAt(pts: Pt[], cum: number[], d: number): Pt {
  const total = cum[cum.length - 1];
  const dd = Math.min(Math.max(d, 0), total);
  let i = 1;
  while (i < cum.length - 1 && cum[i] < dd) i++;
  const span = cum[i] - cum[i - 1] || 1;
  const k = (dd - cum[i - 1]) / span;
  return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
}

const ease = (x: number) => x * x * (3 - 2 * x);

/** Distance along a route at story second `t`, given (time, vertex) keyframes. */
export function distanceAt(cum: number[], keys: { at: number; v: number }[], t: number): number {
  let prev = { at: 0, d: 0 };
  for (const k of keys) {
    const d = cum[k.v];
    if (t < k.at) {
      const span = k.at - prev.at || 1;
      return prev.d + (d - prev.d) * ease(Math.min(1, Math.max(0, (t - prev.at) / span)));
    }
    prev = { at: k.at, d };
  }
  return prev.d;
}

/** The scripted train's timetable: switch, the three stations, bumper, queue. */
export function scriptedKeys(s: Scenario, marks: number[]) {
  const times = [0.6, ...s.scripted.map((l) => l.at)];
  return marks.map((v, i) => ({ at: times[i], v }));
}

/** When the agent passes each bead, and when it lands. */
export function agentTimes(s: Scenario): number[] {
  const a = s.agent;
  const n = a.length;
  const beads = [0, 1, 2].map((k) => (k < n - 1 ? a[k].at : (a[n - 2].at + a[n - 1].at) / 2));
  return [...beads, endOf(a)];
}
