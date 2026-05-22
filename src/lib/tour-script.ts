/**
 * Guided "Autopilot" tour — ordered step script.
 *
 * Stage 1 ships the homepage walkthrough with no audio: `audioSrc` stays
 * undefined and the engine auto-advances on `dwellMs`. A later build phase
 * generates ElevenLabs narration from the frozen `narration` copy and fills
 * in `audioSrc`, at which point auto-advance switches to the audio `ended`
 * event instead of the dwell timer.
 */

export type TourNarrationKey = "step1" | "step2" | "step3";

export interface TourStep {
  /** Stable id — used for React keys and progress tracking. */
  id: string;
  /** CSS selector of the element to scroll to and spotlight. */
  target: string;
  /** Key into `t.tour` for the on-screen narration line. */
  narration: TourNarrationKey;
  /** ms to dwell before auto-advancing. Used until `audioSrc` is set. */
  dwellMs: number;
  /** Pre-generated narration audio. Undefined until the final build phase. */
  audioSrc?: string;
}

export const TOUR_STEPS: TourStep[] = [
  { id: "hero", target: "#hero", narration: "step1", dwellMs: 7000 },
  { id: "pipelines", target: "#pipelines", narration: "step2", dwellMs: 8500 },
  { id: "pricing", target: "#pricing", narration: "step3", dwellMs: 7500 },
];
