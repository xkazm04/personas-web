/**
 * WHEN everything happens in section 4, variant A. One deterministic CYCLE and
 * pure phase functions the scene reads every frame — nothing here touches the
 * DOM, and nothing in the scene decides its own timing.
 *
 * Every module COMPOSES in layers, and the layers interleave with her journey:
 *
 *   shell    she DEPARTS the previous stop; the dashed ghost solidifies into
 *            the real panel — frame, header, label. She is still crossing.
 *   body     she ARRIVES; the structural content cascades in, row by row.
 *   detail   the brackets LOCK; the fine texture fills — chips, bars, hints.
 *   chosen   the commit beat plays out (a check draws, an accent sweeps, a
 *            correction lands) and the module keeps the mark for the loop.
 *
 * The tick clock sets only the STAGE; the order parts arrive inside a stage is
 * framer's job (`./modules/parts`), so every cascade finishes inside its own
 * 900ms beat and never spills into the next tick.
 *
 * One deliberate exception to "shell arrives while she travels": the start
 * control's frame and fill belong to the plan card — a plan that offers no way
 * to start it is not a plan — so it composes with the card at ticks 10/11 and
 * her own stop re-engages it later (beckon on the lock, commit on the press).
 */

import { ROUTE, targetRect, type RouteStop, type StopId, type TargetId } from "./route";
import {
  atStage,
  stageOf,
  type ModuleStage,
  type StagePlan,
} from "@/components/athena/stage/stages";
import { EDIT_ROW, layoutFor, type Point, type Rect, type SceneLayout } from "./layout";

export { COPY } from "./copy";
export { EDIT_ROW, layoutFor } from "./layout";
export { atStage, stepDelay, STEP } from "@/components/athena/stage/stages";
export type { ModuleStage } from "@/components/athena/stage/stages";
export type { Point, Rect, SceneLayout } from "./layout";
export type { StopId } from "./route";

/** Two opening beats before the first module: the window frame draws itself,
 *  then the chrome settles. The desk wakes up instead of existing already. */
const FIRST_REVEAL = 2;

export interface DeskStop extends RouteStop {
  /** She sets off for this stop — and its ghost solidifies behind her. */
  revealAt: number;
  /** She has landed. */
  arrive: number;
  /** The brackets snap on, one beat after she lands. */
  lockAt: number;
  /** The beat the whole stop exists for. */
  chooseAt: number;
  depart: number;
}

/** Beats derived from one running cursor, so no two tick numbers can drift:
 *  each stop's reveal IS the previous stop's departure. */
const REVEALS = ROUTE.reduce<number[]>((acc, _stop, i) => {
  acc.push(i === 0 ? FIRST_REVEAL : acc[i - 1] + ROUTE[i - 1].ticks);
  return acc;
}, []);

export const STOPS: DeskStop[] = ROUTE.map((stop, i) => ({
  ...stop,
  revealAt: REVEALS[i],
  arrive: REVEALS[i] + 1,
  lockAt: REVEALS[i] + 2,
  chooseAt: REVEALS[i] + stop.commitAt,
  depart: REVEALS[i] + stop.ticks,
}));

const [ASK, PLAN, EDIT, START, WORK] = STOPS;

export const CYCLE = STOPS[STOPS.length - 1].depart; // 28
export const TICK_MS = 900; // 28 ticks * 900ms = 25.2s per loop
/** Reduced-motion pinned frame: the last beat that still has her in it, and
 *  the first at which every module has reached its final stage. The whole
 *  story told at once, in one still image. */
export const INITIAL_TICK = CYCLE - 1;

export type ModuleKey = "composer" | "plan" | "confirm" | "board" | "result";

/** A stop-owned module builds around its stop's journey. */
const stopPlan = (s: DeskStop): StagePlan => ({
  shell: s.revealAt,
  body: s.arrive,
  detail: s.lockAt,
  chosen: s.chooseAt,
});

/** The whole composition order in one table — the single source of truth for
 *  when any part of the desk exists. The result waits for the work: it frames
 *  on the beat the tiles finish, fills a tick later and gets its texture a
 *  tick after that, so the payoff cascades instead of arriving finished. */
export const STAGE_PLAN: Record<ModuleKey, StagePlan> = {
  composer: stopPlan(ASK),
  plan: stopPlan(PLAN),
  confirm: { shell: PLAN.lockAt, body: PLAN.chooseAt, detail: START.lockAt, chosen: START.chooseAt },
  board: stopPlan(WORK),
  result: { shell: WORK.chooseAt, body: WORK.chooseAt + 1, detail: WORK.chooseAt + 2, chosen: null },
};

const MODULE_KEYS = Object.keys(STAGE_PLAN) as ModuleKey[];

/** The rect a stop's brackets frame, at the current breakpoint. */
export function rectFor(target: TargetId, L: SceneLayout): Rect {
  return targetRect(target, L, EDIT_ROW);
}

/** The stop she is working: its module is building and she has not departed. */
export function activeStopAt(phase: number): DeskStop | null {
  return STOPS.find((s) => phase >= s.revealAt && phase < s.depart) ?? null;
}

/** The stop whose brackets have snapped on — she lands first, then the lock. */
export function lockedStopAt(phase: number): DeskStop | null {
  const stop = activeStopAt(phase);
  return stop && phase >= stop.lockAt ? stop : null;
}

/** Where she is at a phase tick — at the active stop, else docked. */
export function orbAt(phase: number, compact: boolean): Point {
  const stop = activeStopAt(phase);
  if (!stop) return layoutFor(compact).dock;
  return compact ? stop.orbCompact : stop.orb;
}

/** True while she is crossing to a stop — the same beat that stop's panel is
 *  being framed, which is the whole point: she never waits for the UI. */
export function travelingAt(phase: number): boolean {
  const stop = activeStopAt(phase);
  return stop !== null && phase < stop.arrive;
}

/** Segmented rail — a segment fills when a stop's beat COMMITS, not when she
 *  arrives: the rail counts things that actually happened. */
export function railAt(phase: number): boolean[] {
  return STOPS.map((s) => phase >= s.chooseAt);
}

export interface SceneState {
  lockedId: StopId | null;
  /** How far each module has composed; the rest still hold their rects. */
  stage: Record<ModuleKey, ModuleStage>;
  /** The sentence is being written into the request bar. */
  typing: boolean;
  /** The request has been handed over. */
  sent: boolean;
  /** The edit affordance is showing on the step she has landed on. */
  editHinted: boolean;
  /** Her correction has landed — the step now says something else. */
  edited: boolean;
  /** The start control is beckoning, waiting on a person. */
  beckoning: boolean;
  /** The work is under way. */
  started: boolean;
  /** Every tile has finished. */
  finished: boolean;
}

/** Everything the canvas needs at a phase tick, derived in one pure read. */
export function sceneStateAt(phase: number): SceneState {
  const stage = {} as Record<ModuleKey, ModuleStage>;
  for (const key of MODULE_KEYS) stage[key] = stageOf(STAGE_PLAN[key], phase);
  return {
    lockedId: lockedStopAt(phase)?.id ?? null,
    stage,
    typing: phase >= ASK.arrive && phase < ASK.chooseAt,
    sent: atStage(stage.composer, "chosen"),
    editHinted: phase >= EDIT.lockAt,
    edited: phase >= EDIT.chooseAt,
    beckoning: atStage(stage.confirm, "detail") && !atStage(stage.confirm, "chosen"),
    started: atStage(stage.confirm, "chosen"),
    finished: atStage(stage.board, "chosen"),
  };
}

/** Seconds the sentence takes to type itself: from her arrival at the request
 *  bar to the beat it is handed over, minus a breath so the last character is
 *  on screen before the send fires. */
export const TYPE_SECONDS = ((ASK.chooseAt - ASK.arrive) * TICK_MS) / 1000 - 0.35;

export { ASK, PLAN, EDIT, START, WORK };
