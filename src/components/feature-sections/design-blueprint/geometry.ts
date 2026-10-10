import type { DimKey } from "./shared/dims";
import { runScript, type Machine, type Stop, type TokenKind } from "./shared/machine";
import { makeTimeline } from "./shared/timeline";

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

/** Where a test-run token waits for the review gate. */
export const GATE_X = GATE.a - 14;

/** Each named stop of the test run on the sheet, and when (0..1 of a token's run) it is reached. */
export const STOP_AT: Record<Stop, { x: number; y: number; t: number }> = {
  origin: { x: CLOCK.cx + CLOCK.r, y: PIPE_Y, t: 0 },
  webhook: { x: CLOCK.cx + CLOCK.r, y: PIPE_Y, t: 0 },
  core: { x: CORE.x + CORE.w / 2, y: PIPE_Y, t: 0.22 },
  "gate-hold": { x: GATE_X, y: PIPE_Y, t: 0.4 },
  "gate-open": { x: GATE_X, y: PIPE_Y, t: 0.55 },
  messages: { x: BUBBLE.x + BUBBLE.w / 2, y: PIPE_Y, t: 0.72 },
  mast: { x: MAST.x, y: PIPE_Y, t: 0.9 },
};

/** One token's keyframes over the whole finale (`t` is 0..1 of RUN_MS). */
export interface Track {
  kind: TokenKind;
  stops: (Stop | "wait" | "rise")[];
  x: number[];
  y: number[];
  t: number[];
  opacity: number[];
}

/** When each token starts and how much of the run it takes (two tokens share the finale). */
const LANES: Record<number, { start: number; span: number }[]> = {
  1: [{ start: 0, span: 1 }],
  2: [
    { start: 0, span: 0.8 },
    { start: 0.2, span: 0.8 },
  ],
};

/** The test run's keyframes for a machine: each token's stops mapped onto the sheet, then up the mast. */
export function runPoints(m: Machine): Track[] {
  const tokens = runScript(m);
  return tokens.map((tok, i) => {
    const { start, span } = LANES[tokens.length][i];
    const tr: Track = { kind: tok.kind, stops: [], x: [], y: [], t: [], opacity: [] };
    const push = (stop: Track["stops"][number], x: number, y: number, t: number, o: number) => {
      tr.stops.push(stop);
      tr.x.push(x);
      tr.y.push(y);
      tr.t.push(t);
      tr.opacity.push(o);
    };
    const first = STOP_AT[tok.stops[0]];
    if (start > 0) push("wait", first.x, first.y, 0, 0);
    tok.stops.forEach((s, k) => {
      const p = STOP_AT[s];
      push(s, p.x, p.y, start + p.t * span, k === 0 ? 0 : 1);
    });
    push("rise", MAST.x, MAST.top + 6, start + span, 0);
    return tr;
  });
}

/** When (0..1 of RUN_MS) the gate holds a token and lets it go, or null when nothing waits. */
export function gateWindow(tracks: Track[]): { hold: number; open: number } | null {
  for (const tr of tracks) {
    const h = tr.stops.indexOf("gate-hold");
    const o = tr.stops.indexOf("gate-open");
    if (h >= 0 && o >= 0) return { hold: tr.t[h], open: tr.t[o] };
  }
  return null;
}

export const RUN_MS = 4200;

export const TYPE_MS = 2600;

export const STEPS = makeTimeline(
  ["tasks", "apps", "triggers", "review", "messages", "memory", "errors", "events"],
  { type: TYPE_MS, read: 1600, engage: 1100, ask: 5600, resolve: 900, finale: RUN_MS + 600 },
);
