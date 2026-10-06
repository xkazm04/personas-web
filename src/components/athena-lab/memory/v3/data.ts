/**
 * WHEN everything happens in memory lab v3 - "The map of how you work".
 *
 * A third direction for "the more she carries": what she carries is a MAP of
 * how you work, and the scene is the same errand run twice across it.
 *
 *   the first time   the map is fog. She sets off to ship a fix and has to stop
 *                    at every turn and ask - when do you ship, where do we try
 *                    it, anything sensitive, long or short. Each answer clears
 *                    the fog around one landmark, and the landmark keeps her
 *                    note of it. Four stops, four questions.
 *   a month later    the same road, every landmark lit. She runs it end to end
 *                    without stopping once - each landmark brightens as she
 *                    passes, because she is using it - and the questions-asked
 *                    count reads zero.
 *   hold             the cleared map, both trips traced: the claim as one frame.
 *
 * One deterministic CYCLE, pure phase functions, no DOM.
 */

export const TICK_MS = 1000;
/** 26 x 1s; the last 5s are still. */
export const CYCLE = 26;

export type MarkKey = "ship" | "test" | "careful" | "length";
/** Landmarks in road order, and which of her kept sentences each one holds
 *  (`athenaPage.memory.kept`). */
export const MARKS: readonly { key: MarkKey; kept: number }[] = [
  { key: "ship", kept: 0 },
  { key: "test", kept: 1 },
  { key: "careful", kept: 2 },
  { key: "length", kept: 3 },
];

const OPEN_AT = 1;
/** First trip: she travels a leg on tick `arrive(i)`, asks on the next, gets
 *  your answer on the one after, and the fog clears as she sets off again. */
const LEAVE_AT = 2;
const STOP = 3;
export const arriveAt = (i: number) => LEAVE_AT + STOP * i;
const ASK = 1;
const ANSWER = 2;
const CLEAR = 3;
/** The last leg, into "shipped". */
const FIRST_DONE_AT = arriveAt(MARKS.length) + 1;
/** Second trip: back at the start, then the whole road in one run. */
export const SECOND_AT = FIRST_DONE_AT + 1;
export const RUN_AT = SECOND_AT + 1;
/** The whole second run, in ticks. */
export const RUN_TICKS = 3;
const SECOND_DONE_AT = RUN_AT + RUN_TICKS;
const HOLD_AT = SECOND_DONE_AT + 1;

/** Reduced motion pins the hold: the cleared map, both counts, both trips. */
export const INITIAL_TICK = HOLD_AT + 2;
export const PARK_TICK = CYCLE - 1;

export interface SceneState {
  open: boolean;
  /** 1 or 2 once a trip has begun, 0 before. */
  trip: number;
  /** First trip: the leg she is travelling this tick (0..4, 4 = into
   *  "shipped"), or -1; and the landmark she is stopped at, or -1. */
  leg: number;
  at: number;
  /** How many legs of the first trip have been set out on (0..5). */
  legs: number;
  /** Per landmark: 0 fog, 1 asking, 2 answered, 3 cleared and kept. */
  marks: number[];
  /** The second run is under way (and when it started), and how far along
   *  the road it is as a 0..1 share - for the landmarks it lights in passing. */
  running: boolean;
  runShare: number;
  asked: number;
  firstDone: boolean;
  secondDone: boolean;
  holding: boolean;
}

export function sceneAt(phase: number): SceneState {
  const marks = MARKS.map((_, i) => {
    const a = arriveAt(i);
    if (phase >= a + CLEAR) return 3;
    if (phase >= a + ANSWER) return 2;
    if (phase >= a + ASK) return 1;
    return 0;
  });
  const legs = Array.from({ length: MARKS.length + 1 }, (_, i) => arriveAt(i));
  const leg = phase < SECOND_AT ? legs.indexOf(phase) : -1;
  const at = phase < SECOND_AT ? marks.findIndex((m, i) => m > 0 && m < 3 && phase < arriveAt(i) + CLEAR) : -1;
  const runShare = phase < RUN_AT ? 0 : Math.min(1, (phase - RUN_AT + 1) / RUN_TICKS);
  return {
    open: phase >= OPEN_AT,
    trip: phase < LEAVE_AT ? 0 : phase < SECOND_AT ? 1 : 2,
    leg,
    at,
    legs: legs.filter((a) => phase >= a).length,
    marks,
    running: phase >= RUN_AT && phase < SECOND_DONE_AT,
    runShare,
    asked: marks.filter((m) => m >= 1).length,
    firstDone: phase >= FIRST_DONE_AT,
    secondDone: phase >= SECOND_DONE_AT,
    holding: phase >= HOLD_AT,
  };
}

/** Which status line runs at a phase: a key into `athenaLab.memory.v3.status`,
 *  or `carries` for the closing line the live section already ships. */
export function statusKeyAt(phase: number): "ask" | "clears" | "four" | "again" | "none" | "carries" {
  if (phase < arriveAt(0) + CLEAR) return "ask";
  if (phase < arriveAt(MARKS.length)) return "clears";
  if (phase < SECOND_AT) return "four";
  if (phase < RUN_AT + RUN_TICKS) return "again";
  if (phase < HOLD_AT + 1) return "none";
  return "carries";
}
