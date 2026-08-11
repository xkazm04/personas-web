/**
 * WHEN everything happens in "The Wall" — the her-workshop section, variant A.
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM. The
 * scene reads this every frame and renders whatever it says; no component
 * decides timing for itself.
 *
 * The argument the clock is making, beat by beat:
 *
 *   compose   the wall's screens are held as outlines from the first frame and
 *             then solidify in three waves, so the room fills up rather than
 *             switching on. Nothing here is started — all of it is already
 *             running when you arrive.
 *   the pass  she goes over the whole wall once. One gesture, one beat.
 *   answers   and then every screen answers in the SAME instant. Most of them
 *             are still writing, so they are working. The rest have nothing on
 *             screen at all — which is an observation, not a verdict.
 *   narrow    the wall recedes a step and the quiet ones stand out on their own.
 *   split     they turn out to be four different things: two simply finished,
 *             one is holding a question for a person, one really has stopped.
 *   abstain   and the fifth she will not call. It resolves a beat AFTER the
 *             others, into "not sure" — the pause is the point, and it costs
 *             the scene no new element to make it.
 *   the job   three screens that belong to one job finish one at a time, and
 *             none of them says anything. The announcement waits for the last
 *             of them and then lands ONCE, for all three.
 *   calm      everything that does not need a person dims. Three screens stay
 *             lit, and the work that is still running keeps running.
 *
 * Stage vocabulary is the shared `stage/stages` one, so "this screen exists" is
 * never a boolean — a screen is at a STAGE, and stages are cumulative. A
 * screen's `chosen` beat is the moment she has read it, which is why every
 * screen on the wall commits at the same tick and none of them before.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { BATCH, JOBS, QUIET, QUIET_INTO, type Verdict } from "./copy";

export const TICK_MS = 900;
/** 26 × 900ms = 23.4s per loop, of which the last 4.5s are completely still. */
export const CYCLE = 26;

/** The outlines are there from the first frame — the wall's shape is not a
 *  reveal, the work already exists. The screens solidify from tick 1. */
const SHELL_AT = 1;
/** The pass, and the answer it brings back one beat later. */
const LOOK_AT = 7;
const ANSWER_AT = 8;
/** The wall steps back so the quiet ones can be looked at properly. */
const NARROW_AT = 9;
const SPLIT_AT = 11;
/** One beat later than the rest: the one she declines to call. */
const ABSTAIN_AT = 12;
/** The three pieces of one job, going out. Authored gaps, so they visibly do
 *  NOT finish together — which is the only way "you hear once" can land. */
const BATCH_OUT: readonly number[] = [14, 15, 17];
const LAST_OUT = BATCH_OUT[BATCH_OUT.length - 1];
const REPORT_AT = LAST_OUT + 1;
const CALM_AT = REPORT_AT + 2;

/**
 * Reduced-motion pinned frame: inside the hold. Every screen read, the quiet
 * five resolved into four different things plus one honest blank, the whole job
 * announced once, and only what needs a person still lit. It deliberately does
 * NOT rewind — the still frame makes the whole argument at once, and it is the
 * same frame the moving version ends on.
 */
export const INITIAL_TICK = CALM_AT + 2;

/** Where the clock sits before the section has ever been on screen. */
export const PARK_TICK = CYCLE - 1;

/** One screen's whole life. `chosen` is the beat she has read it — the same
 *  beat for every screen on the wall, because she reads them together. */
function tilePlan(i: number): StagePlan {
  const shell = SHELL_AT + JOBS[i].wave;
  return { shell, body: shell + 1, detail: shell + 2, chosen: ANSWER_AT };
}

/** The announcement. One box for a whole job — it holds its place from the
 *  moment the first piece is out, so nothing on the bench ever moves. */
const REPORT_PLAN: StagePlan = {
  shell: REPORT_AT,
  body: REPORT_AT + 1,
  detail: REPORT_AT + 1,
  chosen: CALM_AT,
};

/** What a screen is showing right now. `dark` is before she has read it — it is
 *  running either way, she just has not said anything about it yet. */
export type TileState = "dark" | Verdict;

/** The three she leaves lit at the end, because each of them wants a person. */
const NEEDS_HUMAN: readonly TileState[] = ["needsYou", "stuck", "unknown"];

export function stateAt(i: number, phase: number): TileState {
  if (phase < ANSWER_AT) return "dark";
  const quiet = QUIET.indexOf(i);
  if (quiet >= 0) {
    const into = QUIET_INTO[quiet];
    return phase < (into === "unknown" ? ABSTAIN_AT : SPLIT_AT) ? "noOutput" : into;
  }
  const piece = BATCH.indexOf(i);
  if (piece >= 0 && phase >= BATCH_OUT[piece]) return "done";
  return "working";
}

export interface SceneState {
  tiles: ModuleStage[];
  states: TileState[];
  /** Her one pass across the wall. A single beat, and it is the only beat in
   *  the section where anything travels. */
  sweeping: boolean;
  /** The wall stepped back so the quiet ones can be looked at. */
  narrowed: boolean;
  report: ModuleStage;
  reportGhost: boolean;
  /** Everything that does not need a person has dimmed. */
  calm: boolean;
  holding: boolean;
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number): SceneState {
  return {
    tiles: JOBS.map((_, i) => stageOf(tilePlan(i), phase)),
    states: JOBS.map((_, i) => stateAt(i, phase)),
    sweeping: phase === LOOK_AT,
    narrowed: phase >= NARROW_AT && phase < SPLIT_AT,
    report: stageOf(REPORT_PLAN, phase),
    // The place a message would land is reserved from the moment the wall is
    // alive, and it stays empty for thirteen beats while work finishes all over
    // the wall. The emptiness is the claim: almost none of this has to reach
    // you, and when something finally does, it arrives once.
    reportGhost: phase >= SHELL_AT + 4,
    calm: phase >= CALM_AT,
    holding: phase >= CALM_AT + 1,
  };
}

/** Which screens are standing back at this tick. Two different reasons, one
 *  treatment: while she is narrowing, everything she has ruled out steps back;
 *  once the wall is calm, everything that does not want a person does. */
export function dimmed(state: TileState, scene: SceneState): boolean {
  if (scene.calm) return !NEEDS_HUMAN.includes(state);
  if (scene.narrowed) return state !== "noOutput";
  return false;
}

/** Beats the status line also narrates. */
export const BEATS = {
  /** The last wave's fine detail lands here — the wall is fully alive. */
  ALIVE_AT: SHELL_AT + 4,
  LOOK_AT,
  ANSWER_AT,
  NARROW_AT,
  SPLIT_AT,
  ABSTAIN_AT,
  FIRST_OUT: BATCH_OUT[0],
  REPORT_AT,
  CALM_AT,
} as const;
