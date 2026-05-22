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
  /**
   * Selector scrolled into view. Must always be in the DOM (a section
   * wrapper), so the scroll fires even before lazy section content hydrates.
   */
  scrollTarget: string;
  /**
   * Selector the spotlight hugs — a focused element inside the section. May
   * appear only after lazy hydration; the spotlight polls until it exists.
   */
  spotlightTarget: string;
  /** Key into `t.tour` for the on-screen narration line. */
  narration: TourNarrationKey;
  /** ms to dwell before auto-advancing. Used until `audioSrc` is set. */
  dwellMs: number;
  /** Pre-generated narration audio. Undefined until the final build phase. */
  audioSrc?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "hero",
    scrollTarget: "#hero",
    spotlightTarget: "#hero-heading",
    narration: "step1",
    dwellMs: 7000,
  },
  {
    id: "pipelines",
    scrollTarget: "#pipelines",
    spotlightTarget: "#orchestration-hub-heading",
    narration: "step2",
    dwellMs: 8500,
  },
  {
    id: "pricing",
    scrollTarget: "#pricing",
    spotlightTarget: "#compare-heading",
    narration: "step3",
    dwellMs: 7500,
  },
];
