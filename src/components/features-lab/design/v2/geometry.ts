import type { DimKey } from "../shared/dims";
import { makeTimeline } from "../shared/timeline";

/**
 * The blueprint sheet: a 1000 x H drawing (1 unit = 0.1cqw of the art box),
 * the agent drawn as the machine it runs as - the schedule starts it, the
 * agent works with its apps and memory, a review gate holds its drafts,
 * messages and events leave at the end, errors loop back.
 */
export const W = 1000;
export const H = 435;
export const AR = W / H;
export const PIPE_Y = 228;

/** Unit -> cqw. */
export const u = (n: number) => `${n / 10}cqw`;

export const CLOCK = { cx: 85, cy: PIPE_Y, r: 44 };
export const CORE = { x: 235, y: 168, w: 150, h: 120 };
export const PLUGS = [
  { x: 280, tool: "gmail" },
  { x: 340, tool: "slack" },
];
export const PLUG_HEAD = { w: 34, h: 30, top: 116 };
export const LOOP = { cx: 470, cy: 268, r: 22 };
export const GATE = { a: 574, b: 610, top: 184, bottom: 268 };
export const BUBBLE = { x: 735, y: 196, w: 130, h: 64 };
export const MAST = { x: 940, top: 158 };
export const TANK = { cx: 310, top: 326, h: 58, rx: 44, ry: 10 };

/** Callout boxes (top-left, width, height) and the leader to their part. */
export interface Callout {
  x: number;
  y: number;
  w: number;
  h: number;
  align?: "left" | "right";
  leader: string;
}

export const CALLOUTS: Record<Exclude<DimKey, "tasks">, Callout> = {
  triggers: { x: 20, y: 92, w: 190, h: 70, leader: `M85 166 V${CLOCK.cy - CLOCK.r - 2}` },
  apps: { x: 384, y: 92, w: 150, h: 70, leader: `M382 130 H${PLUGS[1].x + PLUG_HEAD.w / 2 + 4}` },
  review: { x: 548, y: 92, w: 172, h: 70, leader: `M592 166 V${GATE.top - 4}` },
  events: { x: 735, y: 92, w: 150, h: 70, leader: `M887 150 L${MAST.x - 30} ${MAST.top - 4}` },
  memory: { x: 70, y: 318, w: 180, h: 80, align: "right", leader: `M252 352 H${TANK.cx - TANK.rx - 4}` },
  errors: { x: 506, y: 300, w: 196, h: 80, leader: `M504 300 L${LOOP.cx + 14} ${LOOP.cy + 18}` },
  messages: { x: 735, y: 282, w: 255, h: 64, leader: `M800 280 V${BUBBLE.y + BUBBLE.h + 4}` },
};

export const TITLE_BLOCK = { x: 735, y: 368, w: 255, h: 56 };

/** The test run's route: schedule -> agent -> gate -> messages -> event mast. */
export const RUN_X = [CLOCK.cx + CLOCK.r, CORE.x + CORE.w / 2, GATE.a - 14, GATE.b + 30, BUBBLE.x + BUBBLE.w / 2, MAST.x, MAST.x];
export const RUN_Y = [PIPE_Y, PIPE_Y, PIPE_Y, PIPE_Y, PIPE_Y, PIPE_Y, MAST.top + 6];
export const RUN_T = [0, 0.22, 0.4, 0.55, 0.72, 0.9, 1];
export const RUN_MS = 4200;

export const TYPE_MS = 2600;

export const STEPS = makeTimeline(
  ["tasks", "apps", "triggers", "review", "messages", "memory", "errors", "events"],
  { type: TYPE_MS, read: 1600, engage: 1100, ask: 5600, resolve: 900, finale: RUN_MS + 600 },
);
