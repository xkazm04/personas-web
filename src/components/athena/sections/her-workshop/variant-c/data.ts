/**
 * WHEN everything happens in "The Fence" — her workshop, variant C.
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM. The
 * scene reads this every frame and renders whatever it says; no component
 * decides timing for itself. The argument it is making, beat by beat:
 *
 *   draw     you draw the line, once, and name what is inside it. The boundary
 *            exists before the work does — the only order that means anything.
 *   open     the places you opened solidify inside it, each showing how much
 *            room it has, and she arrives — inside.
 *   turn     the dial stands OUTSIDE the line and you turn it up: one job, then
 *            three, then every slot at once, and the line is never redrawn.
 *   hold     the line makes one bright pass end to end — the only moment in the
 *            whole scene where it asserts itself at all.
 *   stop     work appears above the line, and her reach stops dead at it. The
 *            beat the section exists for: something she could have done and
 *            visibly did not, with the dial still at its highest stop.
 *   settle   the yard finishes, the beads stop, and the frame calms until the
 *            line is the only thing still moving.
 *
 * Stage vocabulary is the shared `stage/stages` one, so "the fence exists" is
 * never a boolean — every module is at a STAGE, and stages are cumulative. The
 * work outside is the exception that proves it: no plan at all, because it
 * never gets past its outline.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { BEDS, JOB_TITLES } from "./copy";

export const TICK_MS = 900;
/** 27 × 900ms ≈ 24.3s per loop, the last 2.7s of it still. */
export const CYCLE = 27;
/**
 * The line draws itself corner to corner, takes its glow, and is named. Only
 * then do the places appear, then the room inside each one, then her. The dial
 * arrives already at its lowest stop, so its first move is upward — and it
 * reaches its three stops on LEVEL_AT, never falling back. HOLDS_AT is the
 * line's one assertion: a single bright pass, end to end.
 */
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
/** Six jobs, six different amounts of work — authored, not staggered by
 *  formula, so the yard never finishes in a neat sweep. Every one lands AFTER
 *  she stops at the line: the frame carrying the stop is a busy one. */
const DONE_AT = [19, 20, 19, 21, 20, 21] as const;
const ALL_DONE = Math.max(...DONE_AT);
/** Nothing new arrives from here. */
const CALM_AT = ALL_DONE + 2;

/** Reduced-motion pinned frame, inside the closing stillness: the line drawn
 *  and named, every place full and finished, the dial at its highest stop, the
 *  work above the line still an outline with her mark stopped beneath it. The
 *  whole argument in one image — and the frame the moving version ends on. */
export const INITIAL_TICK = CALM_AT + 1;

/** Where each job sits and which turn of the dial puts it in motion. Two slots
 *  per place, fixed from the moment the place appears — so turning the dial up
 *  fills the room rather than making more of it, and the last turn fills the
 *  last slot exactly. */
export interface JobSpot {
  bed: number;
  slot: number;
  level: number;
}

export const JOBS: readonly JobSpot[] = [
  { bed: 0, slot: 0, level: 0 },
  { bed: 1, slot: 0, level: 1 },
  { bed: 2, slot: 0, level: 1 },
  { bed: 0, slot: 1, level: 2 },
  { bed: 1, slot: 1, level: 2 },
  { bed: 2, slot: 1, level: 2 },
];

export const FENCE_PLAN: StagePlan = {
  shell: LINE_AT,
  body: GLOW_AT,
  detail: PLATE_AT,
  chosen: STOP_AT,
};

export const DIAL_PLAN: StagePlan = {
  shell: DIAL_AT,
  body: LEVEL_AT[0],
  detail: LEVEL_AT[1],
  chosen: LEVEL_AT[2],
};

/** Work goes in one beat AFTER the turn that allowed it — the dial is the
 *  cause, and a cause has to be seen before its effect to read as one. */
const startOf = (i: number): number => LEVEL_AT[JOBS[i].level] + 1;

export const JOB_PLANS: StagePlan[] = JOB_TITLES.map((_, i) => ({
  shell: startOf(i),
  body: startOf(i) + 1,
  detail: startOf(i) + 2,
  chosen: DONE_AT[i],
}));

/** Which jobs live in which place, in slot order — so the field can hand each
 *  place its own work without every panel knowing the whole table. */
export const JOBS_IN: number[][] = BEDS.map((_, b) =>
  JOBS.map((j, i) => ({ j, i }))
    .filter((e) => e.j.bed === b)
    .sort((a, z) => a.j.slot - z.j.slot)
    .map((e) => e.i),
);

/** A place is live once its first job goes in and finished when its last lands. */
export const BED_PLANS: StagePlan[] = JOBS_IN.map((mine) => ({
  shell: BEDS_AT,
  body: SLOTS_AT,
  detail: Math.min(...mine.map(startOf)),
  chosen: Math.max(...mine.map((i) => DONE_AT[i])),
}));

export interface SceneState {
  fence: ModuleStage;
  /** The line's single bright pass — it holds, said once and not repeated. */
  sweep: boolean;
  beds: ModuleStage[];
  jobs: ModuleStage[];
  /** 0…1 per job; the rail tweens between ticks so work reads as continuous. */
  progress: number[];
  dial: ModuleStage;
  /** Which stop the dial is at; -1 before you have turned it at all. */
  level: number;
  /** She is in the yard — and she is in it before any of the work is. */
  her: boolean;
  /** Work she may not start is on screen — an outline, and only ever that. */
  outside: boolean;
  reaching: boolean;
  /** She stopped at the line, and it carries the mark to show where. */
  stopped: boolean;
  /** Anything at all in motion inside the yard. */
  working: boolean;
  /** The closing stillness: nothing new arrives, the line breathes alone. */
  calm: boolean;
}

/** A job's own pace: it fills from the beat it goes under way to the beat it
 *  lands, so six jobs finishing at three moments read as six different amounts
 *  of work rather than one bar in six copies. */
function progressAt(i: number, phase: number): number {
  const plan = JOB_PLANS[i];
  if (phase < plan.body) return 0;
  const span = Math.max(DONE_AT[i] - plan.body, 1);
  return Math.min(Math.max((phase - plan.body) / span, 0), 1);
}

/** Which stop the dial is at. It only ever goes up. */
function levelAt(phase: number): number {
  let level = -1;
  for (let i = 0; i < LEVEL_AT.length; i += 1) if (phase >= LEVEL_AT[i]) level = i;
  return level;
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number): SceneState {
  return {
    fence: stageOf(FENCE_PLAN, phase),
    sweep: phase >= HOLDS_AT && phase < HOLDS_AT + 2,
    beds: BED_PLANS.map((p) => stageOf(p, phase)),
    jobs: JOB_PLANS.map((p) => stageOf(p, phase)),
    progress: JOB_PLANS.map((_, i) => progressAt(i, phase)),
    dial: stageOf(DIAL_PLAN, phase),
    level: levelAt(phase),
    her: phase >= HER_AT,
    outside: phase >= OUTSIDE_AT,
    reaching: phase >= REACH_AT,
    stopped: phase >= STOP_AT,
    working: phase >= LEVEL_AT[0] + 1 && phase <= ALL_DONE,
    calm: phase >= CALM_AT,
  };
}

/** Beats the status line also narrates. Named here rather than read back off a
 *  `StagePlan` (whose `chosen` is nullable by design). */
export const BEATS = {
  LINE_AT,
  BEDS_AT,
  HER_AT,
  FIRST_TURN: LEVEL_AT[0],
  LAST_TURN: LEVEL_AT[2],
  OUTSIDE_AT,
  STOP_AT,
  CALM_AT,
} as const;
