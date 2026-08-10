/**
 * WHEN everything happens in "The Flight" — section 5, variant A.
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM.
 * The scene reads this every frame and renders whatever it says; no
 * component decides timing for itself, and no component decides where the
 * camera is.
 *
 * The story the clock tells, beat by beat:
 *
 *   compose   the field arrives from far away. Every plot is mounted from
 *             tick 0 as a dashed waiting outline and SOLIDIFIES in place, so
 *             the archipelago can never re-flow under the camera.
 *   survey    she checks all of them at once. A plot's health resolves as
 *             the survey reaches its band — the calm settle back, a few
 *             surface.
 *   mark      worst first. She goes to it; the camera follows her.
 *   descend   one long transform: the whole becoming the particular.
 *   open      at that range the project opens up — which dimension is
 *             failing, since when, and one specific finding in plain words —
 *             and she opens the thing that fixes it.
 *   lift      back out. The field reads calm, that one now marked handled,
 *             the two behind it still waiting their turn.
 *
 * Stage vocabulary is the shared `stage/stages` one, so "this plot exists"
 * is never a boolean: a plot is at a STAGE, and stages are cumulative.
 * `chosen: null` on every plot but one — the rest are scenery, and only the
 * project she attended to gets a commit beat.
 */

import { atStage, stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { PROJECTS, WORST } from "./copy";
import type { Rect } from "./layout";

export const TICK_MS = 900;
/** 26 x 900ms = 23.4s per loop. */
export const CYCLE = 26;

/** The plots solidify in three scattered waves rather than one sweep. */
const BODY_AT = 4;
const SURVEY_AT = 5;
/** The survey reads a band per tick, nearest to her first. */
const READ_AT = [6, 7, 8] as const;
const SETTLE_AT = 9;
const MARK_AT = 10;
const TRAVEL_AT = 11;
/** The descent is a 2.3s tween; it has landed well before this. */
const NEAR_AT = 14;
const BECKON_AT = 17;
const OPEN_AT = 18;
const LIFT_AT = 20;
const HOME_AT = 23;

/**
 * Reduced-motion pinned frame: the bottom of the descent, the beat after the
 * fix commits and everything it changed has settled. Every layer of the story
 * is on screen at once — the field around it, the plot that needed you
 * opened, what is wrong with it, since when, the finding, and the check
 * drawn. It deliberately does NOT rewind; the still frame of a camera move
 * has to be the frame the move was FOR.
 */
export const INITIAL_TICK = OPEN_AT + 1;

/**
 * Where the clock sits before the section has ever been on screen — the last
 * calm beat, which is the only assembled frame that is also AT ALTITUDE.
 * Parking on the pinned frame instead would leave the camera down at the
 * bottom of a descent nobody watched, and entering the section would open on
 * a 2.3s pull-out with no story attached to it.
 */
export const PARK_TICK = CYCLE - 1;

export const PANEL_PLAN: StagePlan = {
  shell: NEAR_AT,
  body: NEAR_AT + 1,
  detail: NEAR_AT + 2,
  chosen: OPEN_AT,
};

/**
 * One plot's whole life. The survey beat comes from the plot's own position
 * in the field rather than its index, so the read genuinely travels outward
 * from her at both breakpoints instead of following an authored list.
 */
export function planFor(i: number, rect: Rect): StagePlan {
  const band = rect.y < 33 ? 0 : rect.y < 60 ? 1 : 2;
  return {
    shell: 1 + (i % 3),
    body: BODY_AT,
    detail: READ_AT[band],
    chosen: i === WORST ? OPEN_AT : null,
  };
}

/** How a plot reads. Health is a verdict the survey delivers, not a flag the
 *  plot was born with — before `detail` nothing is known about it. */
export type Tone = "waiting" | "calm" | "attention" | "worst" | "handled";

function toneOf(i: number, stage: ModuleStage, phase: number): Tone {
  if (atStage(stage, "chosen")) return "handled";
  if (!atStage(stage, "detail")) return "waiting";
  if (PROJECTS[i].bad.length === 0) return "calm";
  return i === WORST && phase >= MARK_AT ? "worst" : "attention";
}

/** Where she is standing. The camera follows her, never the other way. */
export type Station = "rest" | "target" | "near";

function stationAt(phase: number): Station {
  if (phase >= LIFT_AT + 1) return "rest";
  if (phase >= TRAVEL_AT + 1) return "near";
  return phase >= MARK_AT ? "target" : "rest";
}

export interface SceneState {
  stages: ModuleStage[];
  tones: Tone[];
  /** The calm ones have receded — the field has been read and sorted. */
  settled: boolean;
  /** The ones that need you are still asking. They stop once you are back. */
  restless: boolean;
  /** The camera has left altitude. */
  near: boolean;
  /** Labels ride the screen, so they step aside while the camera moves and
   *  re-set at the new altitude — exactly what a map does. */
  labels: boolean;
  /** Which camera the label layer is currently placed against. It changes
   *  only while `labels` is false, so a name can never be seen sliding off
   *  the plot it belongs to. */
  labelsNear: boolean;
  surveying: boolean;
  panel: ModuleStage;
  /** The fix is offered but not taken — the beat before the commit. */
  beckon: boolean;
  station: Station;
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number, islands: readonly Rect[]): SceneState {
  const stages = islands.map((rect, i) => stageOf(planFor(i, rect), phase));
  return {
    stages,
    tones: stages.map((stage, i) => toneOf(i, stage, phase)),
    settled: phase >= SETTLE_AT,
    restless: phase >= READ_AT[0] && phase < HOME_AT,
    near: phase >= TRAVEL_AT && phase < LIFT_AT,
    labels:
      phase < TRAVEL_AT ||
      (phase >= NEAR_AT && phase < LIFT_AT) ||
      phase >= HOME_AT,
    labelsNear: phase >= NEAR_AT && phase < HOME_AT,
    surveying: phase >= SURVEY_AT && phase < SETTLE_AT,
    panel: stageOf(PANEL_PLAN, phase),
    beckon: phase >= BECKON_AT && phase < OPEN_AT,
    station: stationAt(phase),
  };
}

/** Beats the status line and the captions also narrate. Named here rather
 *  than read back off a `StagePlan` (whose `chosen` is nullable by design). */
export const BEATS = {
  SURVEY_AT,
  READ_AT,
  SETTLE_AT,
  MARK_AT,
  TRAVEL_AT,
  NEAR_AT,
  OPEN_AT,
  LIFT_AT,
  HOME_AT,
} as const;
