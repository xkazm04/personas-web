/**
 * How a tour step ends, kept free of React and the DOM so the progression can
 * be tested with fake timers in the node runner (`tour-progress.test.ts`).
 * `TourContext` arms these per step.
 *
 * A step ends one of three ways:
 * - **its signal**: the visitor did the step's thing (`advanceOn` matched a
 *   `TourSignal`). A step with somewhere to go next (`followSignal`) ends at
 *   once; any other gets a short beat first, so the visitor sees what their
 *   action changed before the tour moves on.
 * - **its dwell**: the fallback for a visitor who only watches. A step that
 *   `waitForSignal`s has none, and a step with a clip advances on the clip.
 * - **the visitor**: Next, Keep looking or exit. That is the context's business.
 */

import { onTourSignal, type TourSignal } from "./tourSignals";
import type { TourStep } from "./tour-script";

/** The beat between the visitor's action and the next step. */
export const SIGNAL_BEAT_MS = 3000;

type StepShape = Pick<TourStep, "advanceOn" | "followSignal" | "waitForSignal" | "audioSrc" | "dwellMs">;

/**
 * Listen for the signal that completes `step`; `onMatch` runs once (after the
 * beat, or at once for a step with a `followSignal`). Returns the disposer,
 * which also cancels a beat still running. A step without `advanceOn` arms nothing.
 */
export function armStepSignal(
  step: StepShape,
  onMatch: (signal: TourSignal) => void,
  subscribe: (listener: (signal: TourSignal) => void) => () => void = onTourSignal,
): () => void {
  const advanceOn = step.advanceOn;
  if (!advanceOn) return () => {};
  let done = false;
  let beat: ReturnType<typeof setTimeout> | null = null;
  const unsubscribe = subscribe((signal) => {
    if (done || !advanceOn(signal)) return;
    done = true;
    unsubscribe();
    if (step.followSignal) onMatch(signal);
    else beat = setTimeout(() => onMatch(signal), SIGNAL_BEAT_MS);
  });
  return () => {
    done = true;
    unsubscribe();
    if (beat) clearTimeout(beat);
  };
}

/**
 * What completing `step` on `signal` does: move to the next step, or (the last
 * step, or one whose action leads somewhere) finish the tour, opening `href`.
 */
export type StepOutcome = { type: "next" } | { type: "finish"; href: string | null };

export function outcomeOf(step: Pick<TourStep, "followSignal">, isLast: boolean, signal: TourSignal): StepOutcome {
  const href = step.followSignal?.(signal) ?? null;
  return !isLast && !href ? { type: "next" } : { type: "finish", href };
}

/** Whether the dwell timer may advance `step`: not a step that waits, and not one a clip clocks. */
export function dwellAdvances(step: StepShape): boolean {
  return !step.waitForSignal && !step.audioSrc;
}

/** Arm the dwell fallback for `step` (a no-op where `dwellAdvances` says no). Returns the disposer. */
export function armStepDwell(step: StepShape, onDwell: () => void): () => void {
  if (!dwellAdvances(step)) return () => {};
  const id = setTimeout(onDwell, step.dwellMs);
  return () => clearTimeout(id);
}

/** Whether a clip's end (or its stall watchdog) may advance `step`. */
export function clipAdvances(step: Pick<TourStep, "waitForSignal"> | undefined): boolean {
  return !step?.waitForSignal;
}

/**
 * Whether `step`'s `actions` run on its clock (a step the visitor watches) or
 * only when the visitor asks for them with "Show me" (a step they do).
 */
export function actionsRunOnClock(step: Pick<TourStep, "advanceOn"> | undefined): boolean {
  return !step?.advanceOn;
}

/** What the visitor did during one tour run, counted from the signals it saw. */
export interface ShiftTally {
  /** Board commands the machine applied. */
  commands: number;
  /** Review verdicts committed (undo window closed). */
  verdicts: number;
}

export const NO_TALLY: ShiftTally = { commands: 0, verdicts: 0 };

export function tallySignal(tally: ShiftTally, signal: TourSignal): ShiftTally {
  if (signal.kind === "command") return { ...tally, commands: tally.commands + 1 };
  if (signal.kind === "verdict") return { ...tally, verdicts: tally.verdicts + 1 };
  return tally;
}
