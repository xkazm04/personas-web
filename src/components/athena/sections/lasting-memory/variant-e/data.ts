/**
 * WHEN everything happens in "Every night, a little more" — the
 * lasting-memory section, variant E.
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM.
 *
 * The story the clock tells is not one event, it is a HABIT — five ordinary
 * days of working together, seen end to end:
 *
 *   a day      talk builds up through the column, three ticks of it, until it
 *              reaches the line that makes a night worth having.
 *   a night    she settles between the two days, briefly — it is over in a
 *              single tick, a fraction of what a day costs — and two things
 *              come down out of the talk and onto the shelf, each still joined
 *              to the day it came from. Then she writes one plain sentence.
 *   again      the next day fills to exactly the same height. The one before
 *              it fades but never leaves. The shelf underneath does not fade
 *              and does not empty.
 *   the quiet  one day barely gets going. Its talk never reaches the line, so
 *      day     no night runs — the pass is driven by how much was actually
 *              said, not by a clock, and this is where the scene says so.
 *   the payoff two days later, the first thing she ever kept lights up and
 *              runs back into the day being worked. Growth that pays off, not
 *              growth that only accumulates.
 *   settle     one shared beat, and then genuine stillness with the shelf as
 *              the brightest thing left in the frame.
 *
 * Stage vocabulary is the shared `stage/stages` one, so "this day happened" is
 * never a boolean — a day is at a STAGE, and stages are cumulative. The quiet
 * day is the one day whose plan has `chosen: null`: it is the only day that
 * never gets a commit beat, which is the difference the whole section turns on.
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";
import { DAYS } from "./layout";

export const TICK_MS = 900;
/** 27 × 900ms = 24.3s per loop, of which the last 3.6s are completely still. */
export const CYCLE = 27;

/** The three bands solidify out of their outlines before the first day. */
const OPEN_AT = 1;
const DAY0_AT = 2;
/** Three ticks of talk, then the night. */
const TALK_STEPS = 3;
const DAY_LEN = TALK_STEPS + 1;

/** The day that barely happens. Middle of the stretch on purpose: a quiet day
 *  at either end would read as the scene starting or stopping. */
export const QUIET_DAY = 2;
/** Which day each of her nights belongs to — every day but the quiet one. */
export const PASS_DAYS: readonly number[] = [0, 1, 3, 4];

export const dayStart = (i: number): number => DAY0_AT + i * DAY_LEN;
export const nightOf = (i: number): number => dayStart(i) + TALK_STEPS;

/** The day the first thing she ever kept comes back into. */
export const RECALL_INTO = 3;
const RECALL_AT = dayStart(RECALL_INTO) + 1;
const RECALL_LAND_AT = RECALL_AT + 1;
const SETTLE_AT = nightOf(DAYS - 1) + 2;
const HOLD_AT = SETTLE_AT;

/**
 * Reduced-motion pinned frame: inside the hold. Five days lived, four nights
 * run, every kept thing on the shelf and still joined to its day, all four
 * accounts written, and the one recall still traced across the field. It
 * deliberately does NOT rewind — the still frame makes the whole argument at
 * once, and it is the same frame the moving version ends on.
 */
export const INITIAL_TICK = HOLD_AT + 2;

/** Where the clock sits before the section has ever been on screen. The hold
 *  is the only assembled frame that is also a calm one. */
export const PARK_TICK = CYCLE - 1;

const BAND_PLAN: StagePlan = {
  shell: OPEN_AT,
  body: DAY0_AT,
  detail: nightOf(0),
  chosen: SETTLE_AT,
};

/** One day's whole life. The quiet day is the only one with no commit beat —
 *  it is scenery, and its being scenery is the point. */
function dayPlan(i: number): StagePlan {
  const start = dayStart(i);
  return {
    shell: start,
    body: start,
    detail: start + 2,
    chosen: i === QUIET_DAY ? null : nightOf(i),
  };
}

/** How many ticks of talk a day has behind it. The quiet day stops at one —
 *  nothing else about it is different, and nothing else needs to be. */
function stepsAt(i: number, phase: number): number {
  const cap = i === QUIET_DAY ? 1 : TALK_STEPS;
  return Math.max(0, Math.min(cap, phase - dayStart(i) + 1));
}

export interface SceneState {
  /** The three bands, as one shared stage: outlines → real → the closing beat. */
  band: ModuleStage;
  days: ModuleStage[];
  /** Turn count per day, and the count one tick ago — the talk cascades in
   *  rather than switching on. */
  steps: number[];
  stepsPrev: number[];
  /** The day being worked right now, -1 before the stretch starts. */
  today: number;
  /** The day she is sleeping on this tick, -1 otherwise. Her whole night. */
  resting: number;
  /** The night that came and went without a pass, because the day it followed
   *  never gave her enough to be worth one. */
  quietNight: boolean;
  /** Each night of the stretch: 0 still ahead, 1 came and went with nothing,
   *  2 ran. The single 1 in that list is the section's honesty. */
  nights: number[];
  /** How many of her nights have put something on the shelf, how many of those
   *  are written up, and which one is still coming down this tick. */
  kept: number;
  notes: number;
  landing: number;
  /** Each kept thing's hairline back to the day it came out of. */
  linked: boolean[];
  /** The first thing she ever kept, on its way back into a later day: 0 not
   *  yet, 1 travelling, 2 arrived and quiet. */
  recall: number;
  recallLanding: boolean;
  /** Where she is: which day she is on, whether she has moved into the night
   *  after it, and whether she has actually gone down into that night. On the
   *  quiet one she reaches it and never descends. */
  reader: { day: number; atNight: boolean; dipped: boolean; here: boolean };
  /** The closing beat, and the stillness after it. */
  settle: boolean;
  holding: boolean;
}

/** Everything the field needs at a phase tick, derived in one pure read. */
export function sceneAt(phase: number): SceneState {
  const today = phase < DAY0_AT ? -1 : Math.min(DAYS - 1, Math.floor((phase - DAY0_AT) / DAY_LEN));
  const resting = today >= 0 && phase === nightOf(today) ? today : -1;
  return {
    band: stageOf(BAND_PLAN, phase),
    days: Array.from({ length: DAYS }, (_, i) => stageOf(dayPlan(i), phase)),
    steps: Array.from({ length: DAYS }, (_, i) => stepsAt(i, phase)),
    stepsPrev: Array.from({ length: DAYS }, (_, i) => stepsAt(i, phase - 1)),
    today,
    resting,
    quietNight: resting === QUIET_DAY,
    nights: Array.from({ length: DAYS }, (_, i) =>
      phase < nightOf(i) ? 0 : i === QUIET_DAY ? 1 : 2,
    ),
    kept: PASS_DAYS.filter((day) => phase >= nightOf(day)).length,
    notes: PASS_DAYS.filter((day) => phase >= nightOf(day) + 1).length,
    landing: PASS_DAYS.findIndex((day) => phase === nightOf(day)),
    linked: PASS_DAYS.map((day) => phase >= nightOf(day) + 1),
    recall: phase < RECALL_AT ? 0 : phase <= RECALL_LAND_AT ? 1 : 2,
    recallLanding: phase === RECALL_LAND_AT,
    reader: {
      // She is over the gap only on the night itself. After the last one she
      // comes back up over the day she just lived rather than parking on the
      // far edge of the field — the stretch is what the hold should be about.
      day: today,
      atNight: resting >= 0,
      dipped: resting >= 0 && resting !== QUIET_DAY,
      here: today >= 0,
    },
    settle: phase === SETTLE_AT,
    holding: phase >= HOLD_AT,
  };
}

/** Beats the status line also narrates. Named here rather than read back off a
 *  `StagePlan` (whose `chosen` is nullable by design). */
export const BEATS = {
  DAY0_AT,
  RECALL_AT,
  RECALL_LAND_AT,
  HOLD_AT,
} as const;
