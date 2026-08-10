/**
 * WHEN everything happens in "The Thing You Stopped Looking At" — section 5,
 * variant C. One deterministic CYCLE, pure phase functions, nothing touching
 * the DOM. The scene reads this every frame; no component decides its own
 * timing, and no value is derived impurely.
 *
 * The story the clock tells, beat by beat:
 *
 *   thriving   six things you own, lit. Your attention is on the one you were
 *              proudest of and it is the brightest thing in the field.
 *   away       your attention moves — and keeps moving. It is not neglect,
 *              it is a Tuesday.
 *   drift      EIGHT ticks, the longest stretch in the loop, because the slow
 *              part is the part nobody feels. The light cools out of cyan,
 *              dims, its rim frays, dust settles, it stops breathing. Nothing
 *              alarms, because nothing breaks.
 *   noticed    she was looking the whole time. One thread, drawn once.
 *   surfaced   she carries it forward and the rest of the field steps back.
 *   finding    what she actually found — a number, a date, and the two things
 *              that are not fine. The other four stay where they were.
 *   put right  your attention lands on it again and the arc runs backwards:
 *              rose to amber to cyan, in two beats instead of eight.
 *   watched    it goes home healthy, and a quiet mark settles on everything —
 *              you never have to remember to check.
 *
 * Stage vocabulary is the shared `stage/stages` one: a light is never shown or
 * hidden, it is AT a stage, and the stages are cumulative.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { WORST } from "./palette";

export const TICK_MS = 900;
/** 25 x 900ms = 22.5s per loop. */
export const CYCLE = 25;

/** The lights solidify out of the ghosts that were holding their places. */
const LIT_AT = 1;
/** They get their names. */
const NAMED_AT = 2;
/** …and their sparks: this is what a cared-for thing looks like. */
const ALIVE_AT = 3;
/** Your attention leaves. */
const AWAY_AT = 4;
/** The long quiet middle. Eight ticks — a quarter of the whole loop. */
const DRIFT_FROM = 5;
const DRIFT_TO = 12;
/** She turns toward it. */
const NOTICE_AT = 13;
/** …carries it forward, and the field steps back behind it. */
const SURFACE_AT = 14;
const LEAD_AT = 15;
const DIMS_AT = 16;
/** Two beats of repair against eight of decay — that ratio is the promise. */
const REPAIR_AT = 18;
/** It goes home, healthy, and the report settles into what it found. */
const HOME_AT = 20;
/** A quiet mark on everything: this is the part you never have to do. */
const WATCH_AT = 21;

/**
 * Reduced-motion pinned frame: the one tick where all four claims are true at
 * once — the field whole and lit again, the one that was fading home and
 * healthy, her mark on every light, and the report still open with the exact
 * words she found. The report leaves on the next beat, so this is the only
 * frame that carries the whole argument as a still image.
 */
export const INITIAL_TICK = 21;

/** A light: ghost, then a light, then a named one, then a living one, and
 *  finally one she has her eye on for good. */
export const CELL_PLAN: StagePlan = {
  shell: LIT_AT,
  body: NAMED_AT,
  detail: ALIVE_AT,
  chosen: WATCH_AT,
};

/** The report: the frame she opens, the finding, the two things that are not
 *  fine, and then the commit beat where it is put right. */
export const PANEL_PLAN: StagePlan = {
  shell: SURFACE_AT,
  body: LEAD_AT,
  detail: DIMS_AT,
  chosen: HOME_AT,
};

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

const SPAN = DRIFT_TO - AWAY_AT;

/**
 * The subject's health, 0 (thriving) … 6 (worst). Decay is authored to
 * accelerate slightly — a fade that arrives at an even rate reads as a
 * machine, and this one is meant to read as something being forgotten.
 */
export function subjectHealthAt(phase: number): number {
  if (phase < DRIFT_FROM) return 0;
  if (phase <= DRIFT_TO) return clamp(Math.round(((phase - AWAY_AT) / SPAN) * WORST), 0, WORST);
  if (phase < REPAIR_AT) return WORST;
  if (phase < REPAIR_AT + 1) return 3;
  if (phase < REPAIR_AT + 2) return 1;
  return 0;
}

/** A second thing is also drifting, mildly, and she does NOT surface it first.
 *  It stays faintly warm to the end — worst first is a claim this scene has to
 *  be willing to show the cost of. */
export function runnerUpHealthAt(phase: number): number {
  if (phase < DRIFT_FROM + 4) return 0;
  return phase < DRIFT_TO ? 1 : 2;
}

/** How long it has been since you looked, in whole weeks. Cleared once it is
 *  put right — the count is the wound, not a label. */
export function weeksAt(phase: number): number {
  if (phase < DRIFT_FROM || phase >= REPAIR_AT) return 0;
  return clamp(Math.ceil(((phase - AWAY_AT) / SPAN) * 6), 1, 6);
}

/** Which of the authored resting places your attention is at. It returns to
 *  the subject at the end — but only because she put it there. */
export function gazeAt(phase: number): number {
  if (phase >= HOME_AT) return 0;
  if (phase >= SURFACE_AT) return 4;
  if (phase < AWAY_AT) return 0;
  if (phase < DRIFT_FROM + 2) return 1;
  if (phase < DRIFT_FROM + 5) return 2;
  return 3;
}

export interface SceneState {
  cell: ModuleStage;
  panel: ModuleStage;
  subjectHealth: number;
  runnerUpHealth: number;
  weeks: number;
  gaze: number;
  /** Her light lifts the moment she has something to say. */
  alert: boolean;
  /** The one line she draws, from her to the thing nobody saw. */
  thread: boolean;
  /** She is holding it out to you; the rest of the field steps back. */
  surfaced: boolean;
  /** The report is up. It empties into the light it was about and leaves. */
  report: boolean;
  /** Put right — and the report says so. */
  resolved: boolean;
  /** Her mark, on all of it. */
  watching: boolean;
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number): SceneState {
  const surfaced = phase >= SURFACE_AT && phase < HOME_AT;
  return {
    cell: stageOf(CELL_PLAN, phase),
    panel: stageOf(PANEL_PLAN, phase),
    subjectHealth: subjectHealthAt(phase),
    runnerUpHealth: runnerUpHealthAt(phase),
    weeks: weeksAt(phase),
    gaze: gazeAt(phase),
    alert: phase >= NOTICE_AT && phase < REPAIR_AT,
    thread: phase >= NOTICE_AT && phase <= SURFACE_AT,
    surfaced,
    // The report outlives the beat it commits on by one tick — it hands its
    // outcome to the light it was about, and only then leaves the field whole.
    report: phase >= NOTICE_AT && phase <= WATCH_AT,
    resolved: phase >= HOME_AT,
    watching: phase >= WATCH_AT,
  };
}

/** The beats the status line also narrates, named so it never re-derives them. */
export const BEATS = {
  AWAY_AT,
  DRIFT_FROM,
  DRIFT_TO,
  NOTICE_AT,
  SURFACE_AT,
  DIMS_AT,
  REPAIR_AT,
  HOME_AT,
  WATCH_AT,
} as const;
