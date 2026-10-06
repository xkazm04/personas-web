/**
 * WHEN everything happens in V2, "All At Once" - one deterministic cycle,
 * pure phase functions, nothing touching the DOM.
 *
 * The argument this clock makes is about TIME. A sentence becomes a team of
 * four, and a team works side by side: four rings close around her together,
 * while the faint outer track shows the same work done the way one person
 * would do it - one task after another - and how far that gets in the same
 * time.
 *
 *   type     the sentence arrives a clause per tick
 *   send     she takes it; she wakes at the centre of the dial
 *   derive   one teammate per tick: a phrase lights in its own colour, its
 *            ring track appears, its row joins the team
 *   start    nothing runs until Start is pressed
 *   run      four rings fill at four paces; the outer track crawls
 *   answer   the last ring closes, the answer assembles, it goes to the team
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { CLAUSE_COUNT, TASK_COUNT } from "../shared/cast";

export const TICK_MS = 900;
/** 26 x 900ms ~ 23.4s per loop. */
export const CYCLE = 26;
/** Reduced motion: every ring closed, the answer settled, and the outer
 *  track still only part of the way round - the whole claim in one frame. */
export const INITIAL_TICK = 24;

const CLAUSE_START = 2;
export const SENT_AT = 7;
const DERIVE_AT = 8;
export const READY_AT = DERIVE_AT + TASK_COUNT; // 12 - Start waits for you
export const RUN_AT = READY_AT + 1; // 13 - pressed
/** Four amounts of work, authored - never a neat left-to-right sweep. */
export const DONE_AT = [16, 19, 17, 20] as const;
const ALL_DONE = Math.max(...DONE_AT);
export const ANSWER_AT = ALL_DONE + 1;

/** One person, one task after another: the same four spans, end to end. */
const SPANS = DONE_AT.map((d) => d - RUN_AT);
const SERIAL_TOTAL = SPANS.reduce((a, b) => a + b, 0);

export const RESULT_PLAN: StagePlan = { shell: ANSWER_AT, body: ANSWER_AT + 1, detail: ANSWER_AT + 2, chosen: INITIAL_TICK };

export type StartState = "hidden" | "waiting" | "pressed" | "working" | "done";

export interface SceneState {
  sentence: ModuleStage;
  clauses: number;
  /** A phrase is lit once its teammate exists - and stays lit. */
  lit: boolean[];
  /** Has teammate i joined (ring track + roster row)? */
  joined: boolean[];
  /** 0..1 per ring. */
  progress: number[];
  done: boolean[];
  start: StartState;
  /** The outer, one-at-a-time track: 0..1 round, and which task it is on. */
  serial: number;
  serialTask: number;
  running: boolean;
  result: ModuleStage;
  /** The empty seats appear once she has the sentence - not before, or the
   *  scene gives away the shape of the answer while you are still typing. */
  seats: boolean;
  answerGhost: boolean;
}

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

function startAt(phase: number): StartState {
  if (phase < READY_AT) return "hidden";
  if (phase < RUN_AT) return "waiting";
  if (phase < RUN_AT + 1) return "pressed";
  return phase <= ALL_DONE ? "working" : "done";
}

export function sceneAt(phase: number): SceneState {
  const elapsed = Math.max(phase - RUN_AT, 0);
  let serialTask = 0;
  let acc = 0;
  for (let i = 0; i < SPANS.length; i++) {
    acc += SPANS[i];
    if (elapsed < acc) break;
    serialTask = Math.min(i + 1, TASK_COUNT - 1);
  }
  return {
    sentence: stageOf({ shell: 1, body: CLAUSE_START, detail: CLAUSE_START + CLAUSE_COUNT - 1, chosen: SENT_AT }, phase),
    clauses: Math.min(Math.max(phase - CLAUSE_START + 1, 0), CLAUSE_COUNT),
    lit: [...DONE_AT.map((_, i) => phase >= DERIVE_AT + i), phase >= ANSWER_AT],
    joined: DONE_AT.map((_, i) => phase >= DERIVE_AT + i),
    progress: DONE_AT.map((d) => (phase < RUN_AT ? 0 : clamp((phase - RUN_AT) / (d - RUN_AT)))),
    done: DONE_AT.map((d) => phase >= d),
    start: startAt(phase),
    serial: clamp(elapsed / SERIAL_TOTAL),
    serialTask,
    running: phase >= RUN_AT,
    result: stageOf(RESULT_PLAN, phase),
    seats: phase >= SENT_AT,
    answerGhost: phase >= DONE_AT[0],
  };
}

/** The status line: one plain claim per act. */
export function statusKey(phase: number) {
  if (phase < SENT_AT) return "speak" as const;
  if (phase < DERIVE_AT) return "planning" as const;
  if (phase < READY_AT) return "pieces" as const;
  if (phase < RUN_AT + 1) return "yourCall" as const;
  if (phase < ANSWER_AT) return "parallel" as const;
  if (phase < INITIAL_TICK) return "returning" as const;
  return "closing" as const;
}
