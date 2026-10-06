/* The live race's timing (src/components/sections/agents-timeline/data.ts),
 * stripped of its words, which live in i18n `howLab.timeline.scenarios`.
 * The rules track's final zero-length step is the stall itself: it becomes
 * the stamp at the break, not a step on the rail. */

export type Status = "ok" | "warn" | "error";
export type TrackTiming = { ms: number[]; status: Status[] };

const ok = (ms: number[]): TrackTiming => ({ ms, status: ms.map(() => "ok") });

export const TIMING: { rules: TrackTiming; agent: TrackTiming }[] = [
  { rules: { ms: [800, 900, 700, 600], status: ["ok", "ok", "warn", "error"] }, agent: ok([500, 600, 400, 300]) },
  { rules: { ms: [700, 800, 600, 500], status: ["ok", "ok", "warn", "error"] }, agent: ok([400, 500, 500, 300]) },
  { rules: { ms: [600, 900, 700, 800], status: ["ok", "ok", "warn", "error"] }, agent: ok([500, 600, 500, 300]) },
  { rules: { ms: [600, 1000, 500, 700], status: ["ok", "ok", "error", "error"] }, agent: ok([400, 700, 400, 500]) },
  { rules: { ms: [500, 700, 600, 500], status: ["ok", "ok", "warn", "error"] }, agent: ok([500, 400, 400, 300]) },
];

export const total = (t: TrackTiming) => t.ms.reduce((a, b) => a + b, 0);

/** Race clock: both tracks, then a short beat for the results to land. */
export const TAIL_MS = 700;
export const raceMs = (i: number) => Math.max(total(TIMING[i].rules), total(TIMING[i].agent)) + TAIL_MS;
/** The clock plays a little slower than the race it times, so each step can be read. */
export const SLOW = 1.7;

/* Board geometry, in viewBox units. */
export const W = 1200;
export const H = 520;
export const XS = 330; // rail start
export const XE = 1150; // finish gate
export const XB = XS + (XE - XS) * 0.74; // where the rules rail breaks
export const PANEL_X = 288;
export const PANEL_H = 238;
export const LANES = [
  { top: 12, rail: 118 },
  { top: 270, rail: 376 },
] as const;

/** Segment ends along a rail of `n` steps from XS to `end`. */
export const nodeX = (i: number, n: number, end: number) => XS + ((i + 1) / n) * (end - XS);

/** Where the runner is at race time `t` (ms), and how far into the track it is. */
export function runnerAt(timing: TrackTiming, end: number, t: number) {
  const n = timing.ms.length;
  let start = 0;
  for (let i = 0; i < n; i++) {
    const d = timing.ms[i];
    if (t < start + d) {
      const from = i === 0 ? XS : nodeX(i - 1, n, end);
      return { x: from + (nodeX(i, n, end) - from) * ((t - start) / d), step: i };
    }
    start += d;
  }
  return { x: end, step: n };
}

/** Start time (ms) of each step. */
export const starts = (timing: TrackTiming) => timing.ms.map((_, i) => timing.ms.slice(0, i).reduce((a, b) => a + b, 0));
