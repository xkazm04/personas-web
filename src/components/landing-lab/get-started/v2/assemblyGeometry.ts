/* V2 "Built from one sentence": geometry and beats, in viewBox units (1200 x 640).
 *
 * Inside a frame that stands for your PC: you type one sentence; it parts into
 * four phrases, and each phrase drops a part of the agent onto its chassis (the
 * 08:00 trigger, the Gmail reader, the summarizer, the Slack poster). Keys lock
 * into the vault, the test passes, you switch it on, and the runs begin.
 *
 * Beats (p, 0 -> 1 over the intro):
 *   0.00 install   frame and the Personas chip arrive
 *   0.10 describe  the four phrases type in, one after another
 *   0.40 question  "Which Slack channel?" / "#team-daily"
 *   0.52 build     each phrase drops its part (0.045 apart), keys lock at 0.72
 *   0.80 run       test passed, the switch flips on at 0.86
 * Then an ambient lap: a run travels the chassis and lights each part in turn. */

export const W = 1200;
export const H = 640;

export const FRAME = { x: 24, y: 14, w: 1152, h: 494, bar: 50 } as const;
export const PROMPT = { x: 84, y: 88, w: 1032, h: 70 } as const;
export const CHIPS_Y = 172;
export const MOD = { y: 250, w: 206, h: 118 } as const;
export const CHASSIS = { x: 84, y: 392, w: 1032, h: 52 } as const;
export const RUN_Y = CHASSIS.y + CHASSIS.h / 2;
export const TOGGLE = { x: 1036, y: CHASSIS.y + 10, w: 62, h: 32 } as const;
export const RAIL_Y = 528;

export type PartKey = "when" | "read" | "think" | "send";
export const PARTS: { key: PartKey; x: number; tone: "amber" | "cyan" | "purple" | "emerald"; type: number; drop: number }[] = [
  { key: "when", x: 222, tone: "amber", type: 0.1, drop: 0.52 },
  { key: "read", x: 474, tone: "cyan", type: 0.17, drop: 0.565 },
  { key: "think", x: 726, tone: "purple", type: 0.24, drop: 0.61 },
  { key: "send", x: 978, tone: "emerald", type: 0.31, drop: 0.655 },
];

export const BEAT = { question: 0.4, answer: 0.46, lock: 0.72, tested: 0.8, on: 0.86 } as const;

export type RailKey = "install" | "describe" | "build" | "run";
export const RAIL: { key: RailKey; at: number; tone: "cyan" | "purple" | "emerald" | "amber" }[] = [
  { key: "install", at: 0, tone: "cyan" },
  { key: "describe", at: 0.1, tone: "purple" },
  { key: "build", at: 0.52, tone: "emerald" },
  { key: "run", at: 0.8, tone: "amber" },
];

/** The run lap: the pulse crosses the chassis in the first 70%, then the post lands. */
export const LAP = { from: PARTS[0].x, to: PARTS[3].x, travel: 0.7 } as const;
export const runX = (v: number) => LAP.from + (LAP.to - LAP.from) * Math.min(1, v / LAP.travel);
