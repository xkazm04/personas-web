/**
 * WHEN everything happens in "Pick it up where you left it" — section 6,
 * variant B.
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM.
 * The scene reads this every frame and renders whatever it says; no component
 * decides timing for itself.
 *
 * The story the clock tells, beat by beat:
 *
 *   monday    a conversation about the roadmap. You mention one ordinary
 *             thing in passing — you are away from the 12th, Dana covers —
 *             and she says "Noted." What you said drops into the lane.
 *   days      the light goes off that conversation. She crosses the dark.
 *   thursday  a different conversation, about the release. You ask a question
 *             that has nothing to do with being away. The draft you would
 *             have had to type appears in the box — and clears itself, because
 *             the line got there first. Her answer already knows.
 *   days      again, and further this time.
 *   later     a third conversation. You ask something with no context in it
 *             at all. She answers it plainly, from the thing you said once.
 *   close     the light comes back up on all three at the same strength, the
 *             lane lights end to end, and what never happened gets named.
 *
 * Stage vocabulary is the shared `stage/stages` one, so "this conversation
 * exists" is never a boolean — a conversation is at a STAGE, and stages are
 * cumulative.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { MOMENTS } from "./copy";

export const TICK_MS = 900;
/** 26 × 900ms ≈ 23.4s per loop. */
export const CYCLE = 26;

/**
 * One conversation's whole life. `chosen` is the beat it settles on, which is
 * never the beat it is understood on — the answer lands at `detail` and then
 * gets a tick to just sit there, which is what makes it read as ease rather
 * than as throughput.
 */
/** The tick she takes what you said: she answers, the words light, and the
 *  line drops into the lane. Named here rather than read back off the plan
 *  below, whose `chosen` is nullable by design. */
const TAKE_AT = 4;

export const MOMENT_PLANS: readonly StagePlan[] = [
  { shell: 1, body: 2, detail: 3, chosen: TAKE_AT },
  { shell: 8, body: 9, detail: 12, chosen: 13 },
  { shell: 17, body: 18, detail: 20, chosen: 21 },
];

/** The tick the light leaves conversation i and she starts across the dark. */
const LEAVE = [6, 14] as const;
/** She stops in the middle of the second gap and waits the days out there.
 *  Travelling straight through would make the longer gap read as a faster
 *  crossing rather than as more time. */
const DRIFT_UNTIL = 16;
/** The draft appears — and is gone two ticks later without being sent. */
const DRAFT_AT = 10;
/** The line surfaces, one tick before the answer it makes possible. */
const RISE_AT = [11, 19] as const;
/** All three come back up together: it was one conversation all along. */
const CLOSE_AT = 23;
const MARK_AT = 24;

/**
 * Reduced-motion pinned frame: all three conversations lit at the same
 * strength, both lines surfaced, the lane unbroken end to end and the closing
 * mark landed. Every layer of the story is on screen at once. It deliberately
 * does NOT rewind — the still frame of a section about continuity has to be
 * the frame where the continuity is visible.
 */
export const INITIAL_TICK = MARK_AT;

/** Where she is standing. `drift` is the dark between two conversations. */
export type Stop = 0 | 1 | 2 | "drift";

export interface SceneState {
  moments: ModuleStage[];
  /** The conversation the light is on. Null while the days are passing —
   *  which is most of what makes the gaps feel like gaps. */
  focus: number | null;
  /** All three at one strength; the lane, whole. */
  closed: boolean;
  /** What never happened, named. */
  marked: boolean;
  /** The recap you were about to type. */
  draft: boolean;
  /** Whether conversation i's marked runs are lit. */
  litRuns: boolean[];
  /** The line being used right now, so the words that produced it can flicker
   *  back in the conversation you said them in. One tick only. */
  using: number | null;
  drop: boolean;
  legs: boolean[];
  risers: boolean[];
  stop: Stop;
  /** She is between conversations, and goes quiet the way the lane does. */
  dark: boolean;
}

function focusAt(phase: number): number | null {
  if (phase >= CLOSE_AT) return null;
  if (phase < LEAVE[0]) return 0;
  if (phase < MOMENT_PLANS[1].shell) return null;
  if (phase < LEAVE[1]) return 1;
  if (phase < MOMENT_PLANS[2].shell) return null;
  return 2;
}

/** Conversation i+1 is the one that leans on line i, so the flicker belongs to
 *  the run that produced it — not to the conversation that benefited. */
function usingAt(phase: number): number | null {
  for (let i = 1; i < MOMENT_PLANS.length; i += 1) {
    if (phase === MOMENT_PLANS[i].detail) return i - 1;
  }
  return null;
}

function stopAt(phase: number): Stop {
  if (phase < LEAVE[0]) return 0;
  if (phase < LEAVE[1]) return 1;
  if (phase < DRIFT_UNTIL) return "drift";
  return 2;
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number): SceneState {
  const focus = focusAt(phase);
  const closed = phase >= CLOSE_AT;
  return {
    moments: MOMENT_PLANS.map((p) => stageOf(p, phase)),
    focus,
    closed,
    marked: phase >= MARK_AT,
    draft: phase >= DRAFT_AT && phase < MOMENT_PLANS[1].detail,
    litRuns: MOMENTS.map((_, i) =>
      i === 0 ? phase >= TAKE_AT : phase >= MOMENT_PLANS[i].detail,
    ),
    using: usingAt(phase),
    drop: phase >= TAKE_AT,
    legs: LEAVE.map((t) => phase >= t),
    risers: RISE_AT.map((t) => phase >= t),
    stop: stopAt(phase),
    dark: focus === null && !closed,
  };
}

/** Beats the status line also narrates. Named here rather than read back off a
 *  `StagePlan`, whose fields say nothing about the days in between. */
export const BEATS = {
  LEAVE,
  DRAFT_AT,
  RISE_AT,
  CLOSE_AT,
  MARK_AT,
} as const;
