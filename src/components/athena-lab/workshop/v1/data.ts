/**
 * WHEN everything happens in "The Fence", evolved (workshop lab v1).
 *
 * The live section's argument, beat for beat, on one deterministic clock:
 *
 *   draw     you draw the line, once, and the ground inside it lights up.
 *   open     the places you opened solidify inside it; she arrives - inside.
 *   turn     the dial, standing on YOUR side of the line, turns up: one job,
 *            then three, then every slot at once. The line is never redrawn.
 *   hold     one bright pass runs the whole line, end to end.
 *   stop     work appears on your side; her reach runs to the line and stops
 *            dead at it. The line flares where she touched it, and the work
 *            picks up its only words: waits for you.
 *   settle   the yard finishes, the frame steps back, the line breathes alone.
 *
 * Pure phase functions; nothing here touches the DOM.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import type { Translations } from "@/i18n/en";

export const TICK_MS = 900;
/** 27 x 900ms = 24.3s per loop, the last 2.7s of it still. */
export const CYCLE = 27;

const LINE_AT = 1;
const GLOW_AT = 2;
const PLATE_AT = 3;
const BEDS_AT = 4;
const SLOTS_AT = 5;
const HER_AT = 6;
const DIAL_AT = 7;
const LEVEL_AT = [7, 10, 12] as const;
const HOLDS_AT = 14;
const OUTSIDE_AT = 16;
const REACH_AT = 17;
const STOP_AT = 18;
/** Six jobs, six amounts of work - authored, so the yard never finishes in a
 *  neat sweep, and every one lands AFTER she stops at the line. */
const DONE_AT = [19, 20, 19, 21, 20, 21] as const;
const ALL_DONE = Math.max(...DONE_AT);
const CALM_AT = ALL_DONE + 2;

/** Reduced-motion frame: the line drawn and lit, every place finished, the
 *  dial at its highest stop, and the work on your side still an outline that
 *  waits for you, with her mark on the line. The whole argument at once. */
export const STILL_TICK = CALM_AT + 1;

/** Two slots per place; which turn of the dial puts each in motion. */
export const JOBS = [
  { bed: 0, level: 0 },
  { bed: 1, level: 1 },
  { bed: 2, level: 1 },
  { bed: 0, level: 2 },
  { bed: 1, level: 2 },
  { bed: 2, level: 2 },
] as const;

/** Work goes in one beat AFTER the turn that allowed it: cause, then effect. */
const startOf = (i: number): number => LEVEL_AT[JOBS[i].level] + 1;

const JOB_PLANS: StagePlan[] = JOBS.map((_, i) => ({
  shell: startOf(i),
  body: startOf(i) + 1,
  detail: startOf(i) + 2,
  chosen: DONE_AT[i],
}));

/** Job indices per place, in slot order. */
export const JOBS_IN: number[][] = [0, 1, 2].map((b) =>
  JOBS.map((j, i) => ({ j, i }))
    .filter((e) => e.j.bed === b)
    .map((e) => e.i),
);

const BED_PLANS: StagePlan[] = JOBS_IN.map((mine) => ({
  shell: BEDS_AT,
  body: SLOTS_AT,
  detail: Math.min(...mine.map(startOf)),
  chosen: Math.max(...mine.map((i) => DONE_AT[i])),
}));

export interface Scene {
  drawn: boolean;
  lit: boolean;
  named: boolean;
  sweep: boolean;
  beds: ModuleStage[];
  jobs: ModuleStage[];
  progress: number[];
  dial: boolean;
  /** Which stop the dial is at; -1 before it has been turned. */
  level: number;
  her: boolean;
  outside: boolean;
  reaching: boolean;
  stopped: boolean;
  working: boolean;
  calm: boolean;
}

function progressAt(i: number, phase: number): number {
  const plan = JOB_PLANS[i];
  if (phase < plan.body) return 0;
  const span = Math.max(DONE_AT[i] - plan.body, 1);
  return Math.min(Math.max((phase - plan.body) / span, 0), 1);
}

function levelAt(phase: number): number {
  let level = -1;
  LEVEL_AT.forEach((at, i) => {
    if (phase >= at) level = i;
  });
  return level;
}

export function sceneAt(phase: number): Scene {
  return {
    drawn: phase >= LINE_AT,
    lit: phase >= GLOW_AT,
    named: phase >= PLATE_AT,
    sweep: phase >= HOLDS_AT && phase < HOLDS_AT + 2,
    beds: BED_PLANS.map((p) => stageOf(p, phase)),
    jobs: JOB_PLANS.map((p) => stageOf(p, phase)),
    progress: JOB_PLANS.map((_, i) => progressAt(i, phase)),
    dial: phase >= DIAL_AT,
    level: levelAt(phase),
    her: phase >= HER_AT,
    outside: phase >= OUTSIDE_AT,
    reaching: phase >= REACH_AT,
    stopped: phase >= STOP_AT,
    working: phase >= LEVEL_AT[0] + 1 && phase <= ALL_DONE,
    calm: phase >= CALM_AT,
  };
}

type Status = Translations["athenaPage"]["workshop"]["status"];

/** The live section's console line, beat for beat - [full, short]. */
export function statusAt(phase: number, c: Status): [string, string] {
  if (phase < LINE_AT) return [c.line, c.lineShort];
  if (phase < BEDS_AT) return [c.draw, c.drawShort];
  if (phase < HER_AT) return [c.places, c.placesShort];
  if (phase < LEVEL_AT[0]) return [c.inside, c.insideShort];
  if (phase < LEVEL_AT[2]) return [c.turnUp, c.turnUpShort];
  if (phase < OUTSIDE_AT) return [c.unmoved, c.unmovedShort];
  if (phase < STOP_AT) return [c.stops, c.stopsShort];
  if (phase < CALM_AT) return [c.waits, c.waitsShort];
  return [c.free, c.freeShort];
}
