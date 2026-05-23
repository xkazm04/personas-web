/**
 * Guided "Autopilot" tour — per-page step scripts.
 *
 * Each step spotlights an **animated diagram** (not a heading): the
 * `spotlightTarget` points at a `[data-tour-diagram="…"]` anchor placed on the
 * diagram's root element, and the narration walks the diagrams as one
 * chronological story. `scrollTarget` is the always-present section wrapper id
 * (so the scroll fires before a lazy section hydrates); the spotlight then
 * polls until the diagram itself mounts.
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
  | "features4"
  | "roadmap1"
  | "roadmap2"
  | "roadmap3";

export interface TourStep {
  /** Stable id — used for React keys and progress tracking. */
  id: string;
  /**
   * Selector scrolled into view. An always-present section wrapper id, so the
   * scroll fires even before lazy section content hydrates.
   */
  scrollTarget: string;
  /**
   * The animated diagram the spotlight hugs — a `[data-tour-diagram]` anchor.
   * May appear only after lazy hydration; the spotlight polls until it exists.
   */
  spotlightTarget: string;
  /** Key into `t.tour` for the on-screen narration line. */
  narration: TourNarrationKey;
  /** ms to dwell before auto-advancing. Used until `audioSrc` is set. */
  dwellMs: number;
  /** Pre-generated narration audio. Undefined until the final build phase. */
  audioSrc?: string;
}

// Homepage — "Watch a goal become work": command center → live agent mind →
// trigger-driven orchestration.
export const HOME_TOUR_STEPS: TourStep[] = [
  {
    id: "command-center",
    scrollTarget: "#hero",
    spotlightTarget: '[data-tour-diagram="command-center"]',
    narration: "step1",
    dwellMs: 7000,
  },
  {
    id: "agent-mind",
    scrollTarget: "#playground",
    spotlightTarget: '[data-tour-diagram="agent-mind"]',
    narration: "step2",
    dwellMs: 8500,
  },
  {
    id: "orchestration",
    scrollTarget: "#pipelines",
    spotlightTarget: '[data-tour-diagram="orchestration"]',
    narration: "step3",
    dwellMs: 8500,
  },
];

// /features — "The life of an agent": born → learns → heals → observed.
export const FEATURES_TOUR_STEPS: TourStep[] = [
  {
    id: "design",
    scrollTarget: "#design",
    spotlightTarget: '[data-tour-diagram="design"]',
    narration: "features1",
    dwellMs: 8000,
  },
  {
    id: "memory",
    scrollTarget: "#memory-layers",
    spotlightTarget: '[data-tour-diagram="memory"]',
    narration: "features2",
    dwellMs: 8000,
  },
  {
    id: "healing",
    scrollTarget: "#healing-circuit",
    spotlightTarget: '[data-tour-diagram="healing"]',
    narration: "features3",
    dwellMs: 8500,
  },
  {
    id: "observe",
    scrollTarget: "#observe",
    spotlightTarget: '[data-tour-diagram="observe"]',
    narration: "features4",
    dwellMs: 8500,
  },
];

// /roadmap — "Now → Next → Shipped".
export const ROADMAP_TOUR_STEPS: TourStep[] = [
  {
    id: "roadmap",
    scrollTarget: "#roadmap",
    spotlightTarget: '[data-tour-diagram="roadmap-progress"]',
    narration: "roadmap1",
    dwellMs: 7500,
  },
  {
    id: "vote",
    scrollTarget: "#vote",
    spotlightTarget: '[data-tour-diagram="vote"]',
    narration: "roadmap2",
    dwellMs: 7500,
  },
  {
    id: "changelog",
    scrollTarget: "#changelog",
    spotlightTarget: '[data-tour-diagram="changelog"]',
    narration: "roadmap3",
    dwellMs: 7500,
  },
];
