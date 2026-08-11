/**
 * WHEN everything happens in "The Decomposition" — section 4, variant B.
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM.
 * The scene reads this every frame and renders whatever it says; no component
 * decides timing for itself.
 *
 * The argument the clock is making, beat by beat:
 *
 *   type      one ordinary sentence arrives, a clause per tick. The box is
 *             mounted from tick 0 as a ghost, so nothing ever moves.
 *   send      the sentence commits; Athena wakes at the branch point.
 *   derive    one task at a time: its phrase lights inside the sentence, its
 *             thread draws, its card solidifies out of the waiting ghost.
 *             This is a PLAN — nothing is running yet.
 *   change    the plan is yours: one task's scope visibly changes.
 *   start     and only then does anything run. Four at once.
 *   settle    each task finishes on its own schedule, its answer thread
 *             draws home, and the result assembles from all four.
 *
 * Stage vocabulary is the shared `stage/stages` one, so "the card exists" is
 * never a boolean — a card is at a STAGE, and stages are cumulative.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { CLAUSE_COUNT, TASK_COUNT } from "./copy";

export { CLAUSE_COUNT, TASK_COUNT };

export const TICK_MS = 900;
/** 26 × 900ms ≈ 23.4s per loop. */
export const CYCLE = 26;
/**
 * Reduced-motion pinned frame: the first tick at which the sentence is typed,
 * every phrase is accounted for, all four tasks are done and the answer has
 * settled. The whole argument in one still image.
 */
export const INITIAL_TICK = 24;

/** A clause of the sentence lands per tick from here. */
const CLAUSE_START = 2;
/** The waiting slots appear the moment she takes the sentence — not before,
 *  or the field gives away the shape of the answer while you are still typing. */
const SLOTS_AT = 7;
/** One task derived per tick, so the eye can follow a single thread at a time. */
const DERIVE_AT = 8;
const PLAN_AT = 12;
const EDIT_AT = 13;
const CONFIRM_AT = 14;
const RUN_AT = 15;
const FILL_AT = 16;
/** Four tasks, four different amounts of work — authored, not staggered by
 *  formula, so the field never finishes in a neat left-to-right sweep. */
const DONE_AT = [17, 19, 18, 20] as const;
const ALL_DONE = Math.max(...DONE_AT);

export const REQUEST_PLAN: StagePlan = {
  shell: 1,
  body: CLAUSE_START,
  detail: CLAUSE_START + CLAUSE_COUNT - 1,
  chosen: SLOTS_AT,
};

export const TASK_PLANS: StagePlan[] = DONE_AT.map((done, i) => ({
  shell: DERIVE_AT + i,
  body: RUN_AT,
  detail: FILL_AT,
  chosen: done,
}));

export const RESULT_PLAN: StagePlan = {
  shell: ALL_DONE + 1,
  body: ALL_DONE + 2,
  detail: ALL_DONE + 3,
  chosen: INITIAL_TICK,
};

/** The two beats the status line also narrates. Named here rather than read
 *  back off a `StagePlan` (whose `chosen` is nullable by design). */
export const SENT_AT = SLOTS_AT;
export const ANSWER_AT = RESULT_PLAN.shell;
export const ANSWERED_AT = INITIAL_TICK;

/** Where the plan's control row is in its own little life. */
export type PlanState = "hidden" | "proposed" | "editing" | "confirmed" | "working" | "done";

export interface SceneState {
  request: ModuleStage;
  /** How much of the sentence has been typed. */
  clauses: number;
  /** A phrase is lit once the thing it became exists — and stays lit. */
  lit: boolean[];
  tasks: ModuleStage[];
  /** 0…1 per task; the rail tweens between ticks so work reads as continuous. */
  progress: number[];
  plan: PlanState;
  /** The scope you changed, before anything ran. */
  edited: boolean;
  result: ModuleStage;
  /** Empty slots waiting to be filled — the shape of the work, before the work. */
  slotGhosts: boolean;
  resultGhost: boolean;
  /** Every answer is home; the merge node closes. */
  gathered: boolean;
}

/** How many clauses of the sentence are on screen. */
export function clausesAt(phase: number): number {
  return Math.min(Math.max(phase - CLAUSE_START + 1, 0), CLAUSE_COUNT);
}

function planAt(phase: number): PlanState {
  if (phase < PLAN_AT) return "hidden";
  if (phase < EDIT_AT) return "proposed";
  if (phase < CONFIRM_AT) return "editing";
  if (phase < CONFIRM_AT + 1) return "confirmed";
  return phase < RESULT_PLAN.detail ? "working" : "done";
}

/** A task's own pace: it fills from the beat work starts to the beat it lands. */
function progressAt(i: number, phase: number): number {
  if (phase < RUN_AT) return 0;
  const span = DONE_AT[i] - RUN_AT;
  return Math.min(Math.max((phase - RUN_AT) / span, 0), 1);
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number): SceneState {
  const tasks = TASK_PLANS.map((p) => stageOf(p, phase));
  const lit = TASK_PLANS.map((p) => phase >= p.shell);
  lit.push(phase >= RESULT_PLAN.shell);
  return {
    request: stageOf(REQUEST_PLAN, phase),
    clauses: clausesAt(phase),
    lit,
    tasks,
    progress: TASK_PLANS.map((_, i) => progressAt(i, phase)),
    plan: planAt(phase),
    edited: phase >= EDIT_AT,
    result: stageOf(RESULT_PLAN, phase),
    slotGhosts: phase >= SLOTS_AT,
    resultGhost: phase >= DONE_AT[0],
    gathered: phase >= ALL_DONE,
  };
}
