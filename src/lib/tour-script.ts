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

/**
 * A timed side effect fired while a step is on screen — used to drive a
 * diagram's animation in sync with the narration (click "Triage my Gmail",
 * highlight each trigger in turn, open each platform card, …). Scheduled
 * relative to the moment the step becomes active and cancelled on step
 * change / exit. Keep `run` resilient: the target may not be mounted yet, so
 * guard DOM lookups (see the `click*` helpers below).
 */
export interface TourAction {
  /** ms after the step becomes active to fire `run`. */
  atMs: number;
  /** Side effect — typically a click that drives the focused diagram. */
  run: () => void;
}

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
  /**
   * Optional timed manipulations of the focused diagram, fired on a timeline
   * across the step's dwell (click-driven, so a diagram may auto-play on its
   * own until the tour reaches it). Cleared on step change / exit.
   */
  actions?: TourAction[];
  /** Pre-generated narration audio. Undefined until the final build phase. */
  audioSrc?: string;
}

/**
 * Click the first element matching `selector`, if present. Safe to call when
 * the target hasn't mounted yet — it's a no-op then. Used by step `actions`.
 */
export function clickTarget(selector: string): void {
  if (typeof document === "undefined") return;
  document.querySelector<HTMLElement>(selector)?.click();
}

/**
 * Click the first clickable element (button / [role=button] / [data-*]) whose
 * trimmed text contains `text`. Used when a control has no stable selector but
 * a unique label (e.g. the "Triage my Gmail" example chip).
 */
export function clickByText(text: string): void {
  if (typeof document === "undefined") return;
  const nodes = document.querySelectorAll<HTMLElement>(
    'button, [role="button"]',
  );
  for (const el of nodes) {
    if ((el.textContent ?? "").trim().includes(text)) {
      el.click();
      return;
    }
  }
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
