/**
 * Guided "Autopilot" tour — per-page step scripts.
 *
 * The engine itself is page-agnostic: each page passes its own steps array
 * to `<TourLauncher steps={…} />`, and the provider stores it for the
 * duration of the run. Adding a page = export a new array and slot it into
 * the page's launcher.
 *
 * `audioSrc` stays undefined until the final build phase, at which point
 * ElevenLabs-generated narration is committed under `/public/tour/` and the
 * engine switches auto-advance from the dwell timer to the audio `ended`
 * event.
 */

export type TourNarrationKey =
  | "step1"
  | "step2"
  | "step3"
  | "features1"
  | "features2"
  | "features3"
  | "roadmap1"
  | "roadmap2"
  | "roadmap3";

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

export const HOME_TOUR_STEPS: TourStep[] = [
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

export const FEATURES_TOUR_STEPS: TourStep[] = [
  {
    id: "design",
    scrollTarget: "#design",
    spotlightTarget: "#design h2",
    narration: "features1",
    dwellMs: 8000,
  },
  {
    id: "healing",
    scrollTarget: "#healing-circuit",
    spotlightTarget: "#healing-circuit h2",
    narration: "features2",
    dwellMs: 8000,
  },
  {
    id: "security",
    scrollTarget: "#security",
    spotlightTarget: "#security h2",
    narration: "features3",
    dwellMs: 8500,
  },
];

export const ROADMAP_TOUR_STEPS: TourStep[] = [
  {
    id: "roadmap",
    scrollTarget: "#roadmap",
    spotlightTarget: "#roadmap h2",
    narration: "roadmap1",
    dwellMs: 7500,
  },
  {
    id: "vote",
    scrollTarget: "#vote",
    spotlightTarget: "#vote h2",
    narration: "roadmap2",
    dwellMs: 7000,
  },
  {
    id: "changelog",
    scrollTarget: "#changelog",
    spotlightTarget: "#changelog h2",
    narration: "roadmap3",
    dwellMs: 7500,
  },
];
