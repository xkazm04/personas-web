/* Geometry and beat timing for the get-started lifecycle illustration.
 *
 * viewBox 1000 x 400. A gutter (0-150) holds the lane names; Monday (150-600) is
 * the set-up day, then four shorter days. Three lanes:
 *   you               line y 70   - the set-up steps, then one approval
 *   self-improvement  line y 181  - the Overseer companion and the Lab
 *   your agent        line y 296  - draft, first run, the daily runs
 *
 * Beats on one progress value p (0 -> 1), resolved at p = 1:
 *   0.03-0.25  your four Monday steps light in order
 *   0.28-0.36  hand-off: promote puts the agent live, first run
 *   0.40-0.62  daily runs (Tuesday's heals itself with a retry)
 *   0.52-0.60  the Overseer reads the runs and writes a coaching note
 *   0.64-0.72  the Lab measures the fix in the Arena
 *   0.74-0.80  you approve it
 *   0.84-0.92  Friday's run is the better one
 */

export const VIEW_W = 1000;
export const VIEW_H = 400;

export const YOU_Y = 70;
export const MID_Y = 181;
export const AGENT_Y = 296;
export const AXIS_Y = 388;
export const LANES = {
  you: { y0: 10, y1: 126 },
  improve: { y0: 136, y1: 226 },
  agent: { y0: 236, y1: 356 },
} as const;

export const DAYS = [
  { key: "mon", x0: 150, x1: 600 },
  { key: "tue", x0: 600, x1: 700 },
  { key: "wed", x0: 700, x1: 800 },
  { key: "thu", x0: 800, x1: 900 },
  { key: "fri", x0: 900, x1: 1000 },
] as const;
export const dayCenter = (i: number) => (DAYS[i].x0 + DAYS[i].x1) / 2;

/** Your four Monday steps: mark x, label side, and the beat at which each lights. */
export const STEPS = [
  { key: "install", x: 190, side: "above", at: 0.03 },
  { key: "connect", x: 280, side: "below", at: 0.1 },
  { key: "describe", x: 370, side: "above", at: 0.17 },
  { key: "promote", x: 460, side: "below", at: 0.24 },
] as const;

/** The draft exists from "describe" until promote. */
export const DRAFT = { x0: 370, x1: 460, at: 0.17 };
export const FIRST_RUN = { x: 555, at: 0.34 };
/* Leaves promote to the right so it clears the "Test & promote" label, then drops
 * through the (still empty) self-improvement lane to the first run. */
export const HANDOFF_D = `M 477 ${YOU_Y} C 540 ${YOU_Y} ${FIRST_RUN.x} 150 ${FIRST_RUN.x} ${AGENT_Y - 16}`;
export const HANDOFF_AT = 0.28;

/** The daily runs. Tuesday's heals itself; Wednesday's is scored before the fix,
 *  Friday's after it. */
export const RUNS = [
  { day: 1, at: 0.42, healed: true },
  { day: 2, at: 0.5, score: "before" },
  { day: 3, at: 0.6 },
  { day: 4, at: 0.88, score: "after", better: true },
].map((r) => ({ ...r, x: dayCenter(r.day) }));
export const AGENT_LINE = { x0: FIRST_RUN.x, x1: dayCenter(4), from: 0.38, to: 0.9 };

/** The self-improvement loop. */
export const OVERSEER = { x: 720, y: MID_Y, at: 0.56 };
export const LAB = { x: 860, y: MID_Y, at: 0.68 };
export const APPROVE = { x: 900, y: YOU_Y, at: 0.78 };

/** The Overseer reads the Tuesday and Wednesday runs. */
export const WATCH = [
  { d: `M ${dayCenter(1)} ${AGENT_Y - 16} C ${dayCenter(1)} 240 ${OVERSEER.x - 30} ${MID_Y + 30} ${OVERSEER.x - 12} ${MID_Y + 12}`, at: 0.52 },
  { d: `M ${dayCenter(2)} ${AGENT_Y - 16} C ${dayCenter(2)} 250 ${OVERSEER.x + 10} ${MID_Y + 40} ${OVERSEER.x + 4} ${MID_Y + 16}`, at: 0.54 },
];
export const LOOP = [
  { d: `M ${OVERSEER.x + 18} ${MID_Y} L ${LAB.x - 20} ${MID_Y}`, at: 0.64 },
  { d: `M ${LAB.x + 18} ${MID_Y} C ${LAB.x + 50} ${MID_Y} ${APPROVE.x} 130 ${APPROVE.x} ${YOU_Y + 20}`, at: 0.74 },
  { d: `M ${APPROVE.x + 16} ${YOU_Y + 8} C 960 110 ${dayCenter(4)} 200 ${dayCenter(4)} ${AGENT_Y - 20}`, at: 0.84 },
];
