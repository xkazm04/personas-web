/* Geometry and beat timing for the get-started "handoff" illustration.
 * viewBox 1000 x 370: a gutter (0-150) with the lane names, Monday (150-600) and
 * four shorter days. Two lanes: you (line y 96) and your agent (line y 262). */

export const VIEW_W = 1000;
export const VIEW_H = 370;

export const YOU_Y = 96;
export const AGENT_Y = 262;
export const AXIS_Y = 350;
export const LANE_TOP = 18;
export const LANE_BOTTOM = 328;

/** Day columns: x range and label centre. */
export const DAYS = [
  { key: "mon", x0: 150, x1: 600 },
  { key: "tue", x0: 600, x1: 700 },
  { key: "wed", x0: 700, x1: 800 },
  { key: "thu", x0: 800, x1: 900 },
  { key: "fri", x0: 900, x1: 1000 },
] as const;
export type DayKey = (typeof DAYS)[number]["key"];
export const dayCenter = (i: number) => (DAYS[i].x0 + DAYS[i].x1) / 2;

/** Your four Monday steps: mark x, label side, and the beat at which each lights. */
export const STEPS = [
  { key: "install", x: 190, side: "above", at: 0.04 },
  { key: "connect", x: 280, side: "below", at: 0.12 },
  { key: "describe", x: 370, side: "above", at: 0.2 },
  { key: "promote", x: 460, side: "below", at: 0.28 },
] as const;
export type StepKey = (typeof STEPS)[number]["key"];

/** The agent's first run, right after promote, still on Monday. */
export const FIRST_RUN = { x: 555, at: 0.42 };
/** The draft exists from "describe" until promote. */
export const DRAFT = { x0: 370, x1: 460, at: 0.2 };
/** The hand-off arrow: from promote down to the first run. */
/* Leaves promote to the right, so it clears the "Test & promote" label below the mark. */
export const HANDOFF_D = `M 477 ${YOU_Y} C 540 ${YOU_Y} ${FIRST_RUN.x} 160 ${FIRST_RUN.x} ${AGENT_Y - 16}`;
export const HANDOFF_AT = 0.34;

/** Scheduled runs Tue-Fri at the day centres; `v2` marks runs after the Lab change. */
export const RUNS = [1, 2, 3, 4].map((i, k) => ({ x: dayCenter(i), at: 0.52 + k * 0.12, v2: i >= 3 }));
export const AGENT_LINE = { x0: FIRST_RUN.x, x1: RUNS[RUNS.length - 1].x, from: 0.45, to: 0.92 };

/** You change the live version in the Lab between Wednesday's and Thursday's run. */
export const LAB = { x: 800, y: 46, at: 0.7 };

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
