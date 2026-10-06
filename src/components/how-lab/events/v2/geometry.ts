/**
 * The chain-reaction circuit (viewBox VB_W x VB_H): a shared hub runs along
 * the middle as a bus bar; the trigger plugs into its left end, the result
 * leaves at its right end, and four agents tap it from above and below.
 */
export const VB_W = 1200;
export const VB_H = 500;
export const ART_AR = VB_W / VB_H;
export const BUS_Y = 250;
export const BADGE_R = 44;

export type SlotId = "a1" | "a2" | "a3" | "a4";
export const TRIGGER = { x: 105, y: BUS_Y };
export const OUTPUT = { x: 1095, y: BUS_Y };
/** `side` is where the agent's words sit beside its badge. */
export const AGENTS: Record<SlotId, { x: number; y: number; side: "left" | "right" }> = {
  a1: { x: 350, y: 100, side: "right" },
  a2: { x: 640, y: 100, side: "right" },
  a3: { x: 640, y: 400, side: "left" },
  a4: { x: 880, y: 400, side: "right" },
};

type Pt = [number, number];
/** The badge rim where a tap leaves an agent, toward the bus. */
const rim = (s: SlotId): Pt => {
  const a = AGENTS[s];
  return [a.x, a.y < BUS_Y ? a.y + BADGE_R : a.y - BADGE_R];
};
const busAt = (x: number): Pt => [x, BUS_Y];
const route = (from: Pt, to: Pt): Pt[] => [from, busAt(from[0]), busAt(to[0]), to];

/** Each hand-off as a polyline, in play order. */
export const HANDOFFS = {
  toA1: [[TRIGGER.x + 58, BUS_Y], busAt(AGENTS.a1.x), rim("a1")] as Pt[],
  toA2: route(rim("a1"), rim("a2")),
  toA3: route(rim("a1"), rim("a3")),
  a2ToA4: route(rim("a2"), rim("a4")),
  a3ToA4: route(rim("a3"), rim("a4")),
  toOut: [rim("a4"), busAt(AGENTS.a4.x), [OUTPUT.x - 58, BUS_Y]] as Pt[],
} satisfies Record<string, Pt[]>;
export type HandoffId = keyof typeof HANDOFFS;

/** The phase a hand-off travels in (it stays lit afterwards). */
export const TRAVEL_PHASE: Record<HandoffId, number> = { toA1: 1, toA2: 3, toA3: 3, a2ToA4: 5, a3ToA4: 5, toOut: 7 };

/** Phase lengths (ms): fire, travel, work, hand off, work, hand off, work, deliver, rest. */
export const PHASE_MS = [700, 900, 1200, 1000, 1300, 1000, 1200, 900, 3400] as const;
export const FINAL_PHASE = PHASE_MS.length - 1;

export const pathOf = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

/** Keyframes that carry a packet along a polyline at constant speed. */
export function keyframesOf(pts: Pt[]) {
  const seg = pts.slice(1).map(([x, y], i) => Math.hypot(x - pts[i][0], y - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let acc = 0;
  const times = [0, ...seg.map((s) => (acc += s) / total)];
  return { cx: pts.map((p) => p[0]), cy: pts.map((p) => p[1]), times };
}

export const pct = (x: number, y: number) => ({ left: `${(x / VB_W) * 100}%`, top: `${(y / VB_H) * 100}%` });

/** Agent state for a phase: listening until its packet lands, then working, then done. */
export function agentState(slot: SlotId, phase: number): "listening" | "working" | "done" {
  const work = { a1: 2, a2: 4, a3: 4, a4: 6 }[slot];
  return phase < work ? "listening" : phase === work ? "working" : "done";
}

/** Simulated elapsed seconds at the end of a phase. */
export const elapsedAt = (phase: number) => PHASE_MS.slice(0, Math.min(phase, FINAL_PHASE)).reduce((a, b) => a + b, 0) / 1000;
