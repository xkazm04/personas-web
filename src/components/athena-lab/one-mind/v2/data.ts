/**
 * WHEN everything happens in "One Day" (lab v2).
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM.
 *
 * The story: one day, three places, one person.
 *
 *   morning   at your desk, in one project. You tell her to hold the release
 *             until the tests pass. What you said lifts off as a token and
 *             drops onto the line that runs under the whole day.
 *   midday    out on a walk, by voice, no screen. The token rides the line to
 *             the next stop and rises into her first words: she opens with
 *             the thing you were waiting for. You say "ship it" - a second
 *             token drops onto the line.
 *   evening   another project entirely. You ask something else, and her
 *             answer already stands on what you settled at midday.
 *   one       the day's light changed three times; she did not. The three
 *             portraits on the line light together, once.
 *   hold      the whole day visible at once, still.
 *
 * Moments use the shared `stage/stages` vocabulary: ghost outline, shell,
 * body (your words), detail (her words), chosen (the moment is behind you).
 */

import { stageOf, type ModuleStage, type StagePlan } from "@/components/athena/stage/stages";

export const TICK_MS = 900;
/** 25 x 900ms = 22.5s, of which the last 5.4s are still. */
export const CYCLE = 25;

export const MOMENTS: readonly StagePlan[] = [
  { shell: 1, body: 2, detail: 3, chosen: 6 },
  { shell: 7, body: 8, detail: 9, chosen: 13 },
  { shell: 14, body: 15, detail: 16, chosen: null },
];

/** Midday has a second line from you: "ship it". */
const SHIP_AT = 10;
const CHORUS_AT = 17;
const HOLD_AT = 19;

export const INITIAL_TICK = HOLD_AT + 1;
export const PARK_TICK = CYCLE - 1;

/** Which stop the day's light stands over. It moves on the same beat the
 *  token rides, with one long tween, so the two travel together. */
function sunAt(phase: number): number {
  if (phase < 6) return 0;
  if (phase < 13) return 1;
  return 2;
}

/**
 * A token is something you said, carried forward. Where it is, as a pure
 * read: hidden, lifting off your words, on the line at a stop, or risen into
 * her words at the next stop (where it dissolves into the phrase it became).
 */
export type TokenPlace =
  | { at: "none" }
  | { at: "said"; stop: number }
  | { at: "line"; stop: number }
  | { at: "recalled"; stop: number };

const TOKEN_PLAN = [
  { born: 4, ride: 6, rise: 9, from: 0 },
  { born: 11, ride: 13, rise: 16, from: 1 },
] as const;

export function tokenAt(k: number, phase: number): TokenPlace {
  const p = TOKEN_PLAN[k];
  if (phase < p.born) return { at: "none" };
  if (phase < p.born + 1) return { at: "said", stop: p.from };
  if (phase < p.ride) return { at: "line", stop: p.from };
  if (phase < p.rise) return { at: "line", stop: p.from + 1 };
  return { at: "recalled", stop: p.from + 1 };
}

export interface SceneState {
  moments: ModuleStage[];
  /** The moment you are in now (0..2). */
  current: number;
  sun: number;
  /** "Ship it" at midday. */
  shipped: boolean;
  tokens: TokenPlace[];
  /** Her recalled phrase at a stop is lit (the token arrived there). */
  recalled: boolean[];
  chorus: boolean;
  together: boolean;
  holding: boolean;
}

export function sceneAt(phase: number): SceneState {
  const tokens = TOKEN_PLAN.map((_, k) => tokenAt(k, phase));
  const recalled = [0, 1, 2].map((stop) =>
    tokens.some((tk) => tk.at === "recalled" && tk.stop === stop),
  );
  const moments = MOMENTS.map((plan) => stageOf(plan, phase));
  const current = phase >= MOMENTS[2].shell ? 2 : phase >= MOMENTS[1].shell ? 1 : 0;
  return {
    moments,
    current,
    sun: sunAt(phase),
    shipped: phase >= SHIP_AT,
    tokens,
    recalled,
    chorus: phase === CHORUS_AT,
    together: phase >= CHORUS_AT,
    holding: phase >= HOLD_AT,
  };
}

export const BEATS = {
  SAY_AT: 2,
  KEPT_AT: 4,
  MIDDAY_AT: MOMENTS[1].shell,
  PICKED_AT: MOMENTS[1].detail,
  EVENING_AT: MOMENTS[2].shell,
  BOTH_AT: MOMENTS[2].detail,
  HOLD_AT,
} as const;
