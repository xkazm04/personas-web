/**
 * Playback machine for the use-case animations. Pure (no clock), so it is
 * testable and render stays free of Date.now(); the hook owns the timer.
 *
 * Position = (caseIdx, phase). Each case plays five beats:
 *   NEED -> CONSIDER -> SCAN -> CHOOSE -> DOCK
 * then the next case starts. After the last case's DOCK the machine rests on a
 * FINALE (caseIdx === count, everything docked) and then loops to case 0.
 *
 * The resting state - server render, reduced motion, a visitor's stop - is
 * case 0 at DOCK: one finished case, fully composed. Playback is ARMed once,
 * from a client-side visibility callback, and never re-armed after a visitor
 * has taken control (WCAG 2.2.2: their stop is open-ended).
 */

export const NEED = 0;
export const CONSIDER = 1;
export const SCAN = 2;
export const CHOOSE = 3;
export const DOCK = 4;
export type Phase = typeof NEED | typeof CONSIDER | typeof SCAN | typeof CHOOSE | typeof DOCK;

export interface CycleState {
  count: number;
  caseIdx: number;
  phase: Phase;
  mode: "playing" | "stopped";
  /** Set by the first ARM or by any visitor action; ARM is a no-op after. */
  armed: boolean;
  /** The visitor pressed Play / Replay (lets playback run under reduced motion by choice). */
  userPlayed: boolean;
  /** Bumped on every loop so timers keyed on it restart. */
  run: number;
}

export type CycleAction =
  | { type: "ARM" }
  | { type: "TICK" }
  | { type: "PAUSE" }
  | { type: "PLAY" }
  | { type: "REPLAY" }
  | { type: "NEXT" }
  | { type: "PREV" };

export function initialCycle(count: number): CycleState {
  return { count, caseIdx: 0, phase: DOCK, mode: "stopped", armed: false, userPlayed: false, run: 0 };
}

export const isFinale = (s: CycleState) => s.caseIdx >= s.count;

const fromTop = (s: CycleState, userPlayed: boolean): CycleState => ({
  ...s,
  caseIdx: 0,
  phase: NEED,
  mode: "playing",
  armed: true,
  userPlayed,
  run: s.run + 1,
});

const stopAt = (s: CycleState, caseIdx: number): CycleState => ({ ...s, caseIdx, phase: DOCK, mode: "stopped", armed: true });

export function reduceCycle(s: CycleState, a: CycleAction): CycleState {
  switch (a.type) {
    case "ARM":
      return s.armed ? s : fromTop(s, false);
    case "TICK": {
      if (s.mode !== "playing") return s;
      if (isFinale(s)) return fromTop(s, s.userPlayed);
      if (s.phase < DOCK) return { ...s, phase: (s.phase + 1) as Phase };
      return { ...s, caseIdx: s.caseIdx + 1, phase: NEED };
    }
    case "PAUSE":
      return { ...s, mode: "stopped", armed: true };
    case "PLAY":
      return isFinale(s) ? fromTop(s, true) : { ...s, mode: "playing", armed: true, userPlayed: true };
    case "REPLAY":
      return fromTop(s, true);
    case "NEXT": {
      const cur = Math.min(s.caseIdx, s.count - 1);
      const done = s.phase === DOCK || isFinale(s);
      return stopAt(s, done ? (cur + 1) % s.count : cur);
    }
    case "PREV": {
      const cur = Math.min(s.caseIdx, s.count - 1);
      return stopAt(s, (cur - 1 + s.count) % s.count);
    }
  }
}

/** Is case `i` docked onto the persona at this position? */
export function isDocked(s: CycleState, i: number): boolean {
  return i < s.caseIdx || (i === s.caseIdx && s.phase === DOCK);
}

/** The case on stage (the last one during the finale). */
export function stageCase(s: CycleState): number {
  return Math.min(s.caseIdx, s.count - 1);
}
