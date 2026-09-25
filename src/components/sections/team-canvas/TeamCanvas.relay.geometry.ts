/**
 * Geometry and beats for the "relay" team-canvas variant: one mission's step
 * graph (the orchestrator's depends_on DAG) laid out once at module scope, in a
 * wide (desktop) and a tall (phone) layout, so server and client draw the same
 * picture.
 *
 * The mission follows the SDLC Delivery Team preset: Solution Architect scopes,
 * Dev Clone builds and opens the PR, Code Reviewer and QA Guardian both follow
 * Dev Clone (they run at the same time), QA Guardian requests changes once, Dev
 * Clone's step re-runs, and QA's step shows "round 2" before the mission lands.
 */

export type NodeKey = "scope" | "build" | "review" | "test";
export type Box = { x: number; y: number; w: number; h: number };
type Pt = [number, number];

export interface RelayLayout {
  w: number;
  h: number;
  dir: "h" | "v";
  goal: Box;
  nodes: Record<NodeKey, Box>;
  landed: Box;
  loop: string;
  loopArrow: { at: Pt; dir: "up" | "left" };
  loopLabel: { x: number; y: number; lines: 1 | 2 };
  parallel: Pt;
  badge: Pt;
  title: number;
  sub: number;
}

export const WIDE: RelayLayout = {
  w: 970,
  h: 330,
  dir: "h",
  goal: { x: 6, y: 118, w: 150, h: 64 },
  nodes: {
    scope: { x: 186, y: 118, w: 172, h: 64 },
    build: { x: 390, y: 118, w: 172, h: 64 },
    review: { x: 604, y: 48, w: 172, h: 64 },
    test: { x: 604, y: 188, w: 172, h: 64 },
  },
  landed: { x: 812, y: 118, w: 152, h: 64 },
  loop: "M690 252 V286 Q690 296 680 296 H486 Q476 296 476 286 V192",
  loopArrow: { at: [476, 184], dir: "up" },
  loopLabel: { x: 583, y: 320, lines: 1 },
  parallel: [690, 32],
  badge: [716, 176],
  title: 17,
  sub: 14,
};

export const TALL: RelayLayout = {
  w: 380,
  h: 490,
  dir: "v",
  goal: { x: 30, y: 6, w: 284, h: 50 },
  nodes: {
    scope: { x: 60, y: 90, w: 180, h: 60 },
    build: { x: 60, y: 186, w: 180, h: 60 },
    review: { x: 6, y: 304, w: 170, h: 60 },
    test: { x: 204, y: 304, w: 170, h: 60 },
  },
  landed: { x: 110, y: 420, w: 160, h: 60 },
  loop: "M362 304 V226 Q362 216 352 216 H248",
  loopArrow: { at: [242, 216], dir: "left" },
  loopLabel: { x: 303, y: 256, lines: 2 },
  parallel: [190, 290],
  badge: [210, 292],
  title: 16,
  sub: 13,
};

const outPt = (l: RelayLayout, b: Box): Pt =>
  l.dir === "h" ? [b.x + b.w, b.y + b.h / 2] : [b.x + b.w / 2, b.y + b.h];
const inPt = (l: RelayLayout, b: Box): Pt =>
  l.dir === "h" ? [b.x, b.y + b.h / 2] : [b.x + b.w / 2, b.y];

/** A dependency edge, as a cubic that leaves and enters along the flow axis. */
export function edgeD(l: RelayLayout, from: Box, to: Box): string {
  const [x1, y1] = outPt(l, from);
  const [x2, y2] = inPt(l, to);
  if (l.dir === "h") {
    const m = (x1 + x2) / 2;
    return `M${x1} ${y1} C${m} ${y1} ${m} ${y2} ${x2 - 6} ${y2}`;
  }
  const m = (y1 + y2) / 2;
  return `M${x1} ${y1} C${x1} ${m} ${x2} ${m} ${x2} ${y2 - 6}`;
}

/** The DAG's edges, each with the moment it lights (its target starts). */
export function edges(l: RelayLayout): { d: string; at: number; end: Pt }[] {
  const n = l.nodes;
  const e = (from: Box, to: Box, at: number) => ({ d: edgeD(l, from, to), at, end: inPt(l, to) });
  return [
    e(l.goal, n.scope, 0.02),
    e(n.scope, n.build, 0.15),
    e(n.build, n.review, 0.31),
    e(n.build, n.test, 0.31),
    e(n.review, l.landed, 0.84),
    e(n.test, l.landed, 0.84),
  ];
}

/** A small arrowhead whose tip sits at `at`, pointing along `dir`. */
export function arrowD([x, y]: Pt, dir: "up" | "left" | "right" | "down", s = 6): string {
  if (dir === "right") return `M${x} ${y} L${x - s * 1.4} ${y - s} L${x - s * 1.4} ${y + s} Z`;
  if (dir === "down") return `M${x} ${y} L${x - s} ${y - s * 1.4} L${x + s} ${y - s * 1.4} Z`;
  if (dir === "left") return `M${x} ${y} L${x + s * 1.4} ${y - s} L${x + s * 1.4} ${y + s} Z`;
  return `M${x} ${y} L${x - s} ${y + s * 1.4} L${x + s} ${y + s * 1.4} Z`;
}

export type StepState = "run" | "done" | "fail";

/** Beat list per step: [from, to, state]; before the first entry it is pending.
 *  1  0.02-0.14  Scope runs          4  0.46-0.52  QA requests changes
 *  2  0.15-0.30  Build PR runs       5  0.52-0.62  Build PR re-runs, "round 2"
 *  3  0.31-0.46  Review + Test run   6  0.63-0.82  Test PR passes; 0.84 Landed */
export const PHASES: Record<NodeKey, [number, number, StepState][]> = {
  scope: [[0.02, 0.14, "run"], [0.14, 9, "done"]],
  build: [[0.15, 0.3, "run"], [0.3, 0.52, "done"], [0.52, 0.62, "run"], [0.62, 9, "done"]],
  review: [[0.31, 0.44, "run"], [0.44, 9, "done"]],
  test: [[0.31, 0.46, "run"], [0.46, 0.52, "fail"], [0.63, 0.82, "run"], [0.82, 9, "done"]],
};

export const LOOP_AT = 0.46;
export const ROUND_AT = 0.52;
export const LANDED_AT = 0.84;
