/**
 * WHEN everything happens in "One Face" (lab v3).
 *
 * One deterministic CYCLE, pure phase functions, nothing touching the DOM.
 *
 *   wall      the conversations you have going arrive as a wall of windows -
 *             typed, spoken, one per project - each slightly out of true,
 *             each its own thing.
 *   register  they fall into register, and a face develops through all of
 *             them at once. The wall was one person the whole time.
 *   open      one window comes forward and opens. You ask the only question
 *             that matters after time away - "where were we?" - and she
 *             answers with exactly where that conversation stopped.
 *   again     it goes back into the wall, and another one, on the other
 *             side, comes forward. Same question, its own answer: she picks
 *             each one up exactly where you left it.
 *   one       every window flashes on one beat; the face holds, breathing.
 */

export const TICK_MS = 900;
/** 26 x 900ms = 23.4s, of which the last 6.3s are the face, still. Each
 *  answer stays up three beats - long enough to read. */
export const CYCLE = 26;

const REGISTER_AT = 4;
/** The two windows that come forward, and when. */
export const OPENS = [
  { open: 6, ask: 7, reply: 8, close: 11 },
  { open: 12, ask: 13, reply: 14, close: 17 },
] as const;
const CHORUS_AT = 18;
const HOLD_AT = 19;

/**
 * Reduced motion pins a frame with the face whole AND the first window open
 * on her answer - both halves of the claim in one calm image.
 */
export const INITIAL_TICK = OPENS[0].reply + 1;
export const PARK_TICK = CYCLE - 1;

/** When tile i arrives: three loose waves, column-staggered, never rolled. */
export const arriveAt = (i: number, cols: number): number => 1 + ((i % cols) + Math.floor(i / cols)) % 3;

export interface OpenState {
  /** Which of OPENS is forward right now, or -1. */
  which: number;
  asked: boolean;
  answered: boolean;
}

export interface SceneState {
  phase: number;
  registered: boolean;
  open: OpenState;
  chorus: boolean;
  together: boolean;
  holding: boolean;
}

export function sceneAt(phase: number): SceneState {
  const which = OPENS.findIndex((o) => phase >= o.open && phase < o.close);
  const o = which >= 0 ? OPENS[which] : null;
  return {
    phase,
    registered: phase >= REGISTER_AT,
    open: { which, asked: !!o && phase >= o.ask, answered: !!o && phase >= o.reply },
    chorus: phase === CHORUS_AT,
    together: phase >= CHORUS_AT,
    holding: phase >= HOLD_AT,
  };
}

export const BEATS = { REGISTER_AT, CHORUS_AT, HOLD_AT } as const;
