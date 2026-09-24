import { CATEGORY_META, type Category } from "./memoryShared";

/*
 * Constellation geometry and timing. One progress value (0 -> 1) drives it:
 *   0     seed map: four category clusters of linked nodes around the agent
 *   1-4   one run each: a spark leaves the agent, lands as a new node, and
 *         links to its nearest relatives (runs 3 and 4 link across clusters)
 *   5     recall: a path lights node by node from a far memory to the agent,
 *         and the agent answers with one pulse
 * The resting state (server render, reduced motion) is progress = 1.
 */

export const W = 720;
export const H = 520;
export const HUB = { x: 360, y: 262, r: 36 };
export const DURATION = 3.4;

/* The real category colours, fixed across site themes like the current section. */
export const color = (c: Category) => CATEGORY_META[c].color;
export const wash = (c: Category, pct: number) => `color-mix(in srgb, ${color(c)} ${pct}%, transparent)`;

export interface MapNode {
  id: string;
  cat: Category;
  x: number;
  y: number;
  r: number;
}

export const SEEDS: MapNode[] = [
  { id: "L1", cat: "learning", x: 128, y: 104, r: 10 },
  { id: "L2", cat: "learning", x: 206, y: 72, r: 6 },
  { id: "L3", cat: "learning", x: 222, y: 150, r: 7 },
  { id: "L4", cat: "learning", x: 112, y: 176, r: 5 },
  { id: "P1", cat: "preference", x: 598, y: 92, r: 9 },
  { id: "P2", cat: "preference", x: 520, y: 62, r: 5 },
  { id: "P3", cat: "preference", x: 628, y: 166, r: 6 },
  { id: "P4", cat: "preference", x: 538, y: 150, r: 7 },
  { id: "T1", cat: "technical", x: 604, y: 424, r: 10 },
  { id: "T2", cat: "technical", x: 528, y: 452, r: 6 },
  { id: "T3", cat: "technical", x: 640, y: 350, r: 5 },
  { id: "T4", cat: "technical", x: 530, y: 372, r: 7 },
  { id: "C1", cat: "constraint", x: 126, y: 420, r: 9 },
  { id: "C2", cat: "constraint", x: 204, y: 458, r: 6 },
  { id: "C3", cat: "constraint", x: 98, y: 344, r: 5 },
  { id: "C4", cat: "constraint", x: 208, y: 372, r: 7 },
];

/* One new node per run, with the relatives it links to. */
export const RUNS: { node: MapNode; links: string[] }[] = [
  { node: { id: "L5", cat: "learning", x: 284, y: 112, r: 7 }, links: ["L3", "L2"] },
  { node: { id: "T5", cat: "technical", x: 448, y: 414, r: 7 }, links: ["T4", "T2"] },
  { node: { id: "P5", cat: "preference", x: 454, y: 110, r: 6 }, links: ["P4", "L5"] },
  { node: { id: "C5", cat: "constraint", x: 282, y: 424, r: 6 }, links: ["C4", "T5"] },
];

export const SEED_LINKS: [string, string][] = [
  ["L1", "L2"], ["L1", "L3"], ["L1", "L4"], ["L2", "L3"],
  ["P1", "P2"], ["P1", "P3"], ["P1", "P4"], ["P2", "P4"],
  ["T1", "T2"], ["T1", "T3"], ["T1", "T4"], ["T3", "T4"],
  ["C1", "C2"], ["C1", "C3"], ["C1", "C4"], ["C3", "C4"],
];

/* The recall path: a far preference, through the links runs added, to the agent. */
export const RECALL = ["P1", "P4", "P5", "L5", "HUB"];

export const POS: Record<string, { x: number; y: number }> = { HUB };
export const CAT_OF: Record<string, Category> = {};
for (const n of [...SEEDS, ...RUNS.map((r) => r.node)]) {
  POS[n.id] = n;
  CAT_OF[n.id] = n.cat;
}

/* Where a line into the hub stops: on its rim, so the agent glyph stays clear. */
export function toRim(from: { x: number; y: number }) {
  const dx = from.x - HUB.x;
  const dy = from.y - HUB.y;
  const d = Math.hypot(dx, dy);
  return { x: HUB.x + (dx / d) * (HUB.r + 3), y: HUB.y + (dy / d) * (HUB.r + 3) };
}

export const RUN0 = 0.04;
export const RUN_LEN = 0.17;
export const RECALL0 = RUN0 + RUNS.length * RUN_LEN + 0.02;
export const RECALL_STEP = (0.94 - RECALL0) / (RECALL.length - 1);
export const runStart = (k: number) => RUN0 + k * RUN_LEN;
export const recallAt = (i: number) => RECALL0 + i * RECALL_STEP;

/* Category fields and labels, on the outer corner of each cluster. */
export const CLUSTERS: { cat: Category; cx: number; cy: number; left: number; top: number; end: boolean }[] = [
  { cat: "learning", cx: 172, cy: 120, left: 4, top: 3, end: false },
  { cat: "preference", cx: 570, cy: 116, left: 96, top: 3, end: true },
  { cat: "constraint", cx: 168, cy: 404, left: 4, top: 92, end: false },
  { cat: "technical", cx: 572, cy: 404, left: 96, top: 92, end: true },
];
