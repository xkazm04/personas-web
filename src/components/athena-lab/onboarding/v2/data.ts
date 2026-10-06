/**
 * WHEN everything happens in v2 "Moving In" — one deterministic cycle and pure
 * phase functions (DevToolsGrid pattern). The words live in i18n; this file
 * holds only beats.
 *
 * The story, one beat per tick:
 *   0       an empty, unlit workspace: a floor and a plot that says nobody
 *           works here yet.
 *   1       she arrives and the lights come up. "Which tools do you use?"
 *   2       you tick three of four (the fourth stays yours to leave out).
 *   3-5     she plugs each one in: cable drawn, socket lit.
 *   6       "Which jobs first?" — you tick three.
 *   7-11    she raises a desk for each, wired to what you connected.
 *   13      "Start them now?" — you say go.
 *   14-22   the floor is busy: screens on, work flowing down the cables, the
 *           day's runs counting up.
 */

import { DESKS, HUB, SOCKETS, type G } from "./iso";

export const CYCLE = 25;
export const TICK_MS = 950;
/** Reduced motion: a busy, finished floor — everything plugged in, every desk
 *  running, the answer to the last question on screen. */
export const STILL_TICK = 19;

export const LIGHTS_ON = 1;
export const TOOL_PICKS_AT = 2;
/** Which sockets you pick (Slack, Gmail, GitHub); Notion stays unplugged. */
export const PICKED = [true, true, true, false] as const;
export const PLUG_AT = [3, 4, 5, null] as const;
export const JOB_PICKS_AT = 6;
export const DESK_AT = [7, 9, 11] as const;
export const GO_AT = 13;
export const START_AT = 14;

export type Question = "tools" | "jobs" | "start" | null;

/** Your reply lands a beat after her question — except for the jobs, where
 *  the picks cascade in under the question within its own beat. */
const ANSWER_AT = { tools: TOOL_PICKS_AT, jobs: JOB_PICKS_AT, start: GO_AT } as const;

export interface V2State {
  lit: boolean;
  question: Question;
  /** Has your reply to the current question landed? */
  answered: boolean;
  plugged: boolean[];
  desks: boolean[];
  running: boolean;
  /** Runs completed today — the counter top right. */
  runs: number;
  orb: G & { z: number };
}

const OFF_STAGE = { x: -1.6, y: -1.2, z: 3.2 };
const OVER_HUB = { ...HUB, z: 1.55 };

function orbAt(phase: number): G & { z: number } {
  if (phase < LIGHTS_ON) return OFF_STAGE;
  for (let i = 0; i < PLUG_AT.length; i++) {
    const t = PLUG_AT[i];
    if (t !== null && phase === t) return { x: SOCKETS[i].x + 1.15, y: SOCKETS[i].y, z: 1.05 };
  }
  for (let i = 0; i < DESK_AT.length; i++) {
    const t = DESK_AT[i];
    if (phase === t || phase === t + 1) return { x: DESKS[i].x - 0.75, y: DESKS[i].y + 0.7, z: 1.25 };
  }
  return OVER_HUB;
}

function questionAt(phase: number): Question {
  if (phase < LIGHTS_ON) return null;
  if (phase < JOB_PICKS_AT) return "tools";
  if (phase < GO_AT) return "jobs";
  return "start";
}

/** Runs per tick once the floor is busy — deterministic, never random. */
const RUN_STEPS = [3, 5, 6, 9, 11, 12, 15, 17, 18, 21, 24];

export function stateAt(phase: number): V2State {
  const question = questionAt(phase);
  return {
    lit: phase >= LIGHTS_ON,
    question,
    answered: question !== null && phase >= ANSWER_AT[question],
    plugged: PLUG_AT.map((t) => t !== null && phase >= t),
    desks: DESK_AT.map((t) => phase >= t),
    running: phase >= START_AT,
    runs: phase >= START_AT ? RUN_STEPS[Math.min(phase - START_AT, RUN_STEPS.length - 1)] : 0,
    orb: orbAt(phase),
  };
}

/** Which mono status line the floor wears. */
export type StatusKey = "empty" | "together" | "running";
export function statusKeyAt(phase: number): StatusKey {
  if (phase < LIGHTS_ON) return "empty";
  return phase >= START_AT ? "running" : "together";
}
