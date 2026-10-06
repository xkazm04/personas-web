/**
 * WHEN everything happens in V3, "The Dispatch" - one deterministic cycle,
 * pure phase functions, nothing touching the DOM.
 *
 * The claim told as a place: your tools are a little world around her, and a
 * sentence turns into a team that goes out into it.
 *
 *   type     your sentence fills the bubble above her, a clause per tick
 *   send     she takes it and wakes on her pad
 *   derive   one teammate per tick: its phrase lights in its colour, its
 *            route to the tool it needs draws, and it steps onto the pad
 *   start    the team waits on the pad until you press Start
 *   out      all four leave at once, each along its own route
 *   work     each works its tool - a ring closes round the station at its
 *            own pace - and what it found appears there
 *   home     each flies back as soon as it is done
 *   answer   with the team home, the bubble that held your question turns
 *            over and holds her answer, which goes to the team
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { CLAUSE_COUNT, TASK_COUNT } from "../shared/cast";

export const TICK_MS = 900;
/** 26 x 900ms ~ 23.4s per loop. */
export const CYCLE = 26;
/** Reduced motion: the team home on the pad, every station answered, the
 *  bubble turned over to the answer - the whole story in one calm frame. */
export const INITIAL_TICK = 24;

const CLAUSE_START = 2;
export const SENT_AT = 7;
const DERIVE_AT = 8;
export const READY_AT = DERIVE_AT + TASK_COUNT; // 12
export const RUN_AT = READY_AT + 1; // 13 - Start pressed, all four leave
/** Arrival at the tool, one tick out. */
const ARRIVE_AT = RUN_AT + 1;
/** Four amounts of work, authored. */
export const DONE_AT = [16, 19, 17, 18] as const;
const HOME_BY = Math.max(...DONE_AT) + 1;
export const ANSWER_AT = HOME_BY + 1; // 21

export const ANSWER_PLAN: StagePlan = { shell: ANSWER_AT, body: ANSWER_AT + 1, detail: ANSWER_AT + 2, chosen: INITIAL_TICK };

/** Where a teammate is in its errand. */
export type Errand = "absent" | "pad" | "out" | "there" | "back" | "home";

export type StartState = "hidden" | "waiting" | "pressed" | "gone";

export interface SceneState {
  bubble: ModuleStage;
  clauses: number;
  lit: boolean[];
  /** A teammate's route has been drawn (it has a job). */
  routed: boolean[];
  errand: Errand[];
  /** 0..1 - how far the work at each station has got. */
  work: number[];
  done: boolean[];
  start: StartState;
  answer: ModuleStage;
  /** Which act the key light rests on: 0 the bubble, 1 her world, 2 the answer. */
  act: 0 | 1 | 2;
}

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

function errandAt(i: number, phase: number): Errand {
  if (phase < DERIVE_AT + i) return "absent";
  if (phase < RUN_AT) return "pad";
  if (phase < ARRIVE_AT) return "out";
  if (phase < DONE_AT[i]) return "there";
  if (phase < DONE_AT[i] + 1) return "back";
  return "home";
}

function startAt(phase: number): StartState {
  if (phase < READY_AT) return "hidden";
  if (phase < RUN_AT) return "waiting";
  return phase < RUN_AT + 1 ? "pressed" : "gone";
}

export function sceneAt(phase: number): SceneState {
  return {
    bubble: stageOf({ shell: 1, body: CLAUSE_START, detail: CLAUSE_START + CLAUSE_COUNT - 1, chosen: SENT_AT }, phase),
    clauses: Math.min(Math.max(phase - CLAUSE_START + 1, 0), CLAUSE_COUNT),
    lit: [...DONE_AT.map((_, i) => phase >= DERIVE_AT + i), phase >= ANSWER_AT],
    routed: DONE_AT.map((_, i) => phase >= DERIVE_AT + i),
    errand: DONE_AT.map((_, i) => errandAt(i, phase)),
    work: DONE_AT.map((d) => (phase < ARRIVE_AT ? 0 : clamp((phase - ARRIVE_AT + 1) / (d - ARRIVE_AT + 1)))),
    done: DONE_AT.map((d) => phase >= d),
    start: startAt(phase),
    answer: stageOf(ANSWER_PLAN, phase),
    act: phase < DERIVE_AT ? 0 : phase < ANSWER_AT ? 1 : 2,
  };
}

/** The status line: one plain claim per act. */
export function statusKey(phase: number) {
  if (phase < SENT_AT) return "speak" as const;
  if (phase < DERIVE_AT) return "planning" as const;
  if (phase < READY_AT) return "pieces" as const;
  if (phase < RUN_AT + 1) return "yourCall" as const;
  if (phase < HOME_BY) return "parallel" as const;
  if (phase < INITIAL_TICK) return "returning" as const;
  return "closing" as const;
}
