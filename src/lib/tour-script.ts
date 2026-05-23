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
  | "step4"
  | "step5"
  | "features1"
  | "features2"
  | "features3"
  | "features4"
  | "features5"
  | "features6"
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
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  // Dispatch a bubbling MouseEvent rather than el.click(): the orchestration
  // trigger targets are SVG <g> nodes (no reliable .click()), and a bubbling
  // event still reaches React's delegated onClick handler either way.
  el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
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

/** Athena's spoken greeting, played while the intro pop-up is shown. */
export const INTRO_AUDIO_SRC = "/tour/intro.mp3";

// Homepage — "Meet a persona, then watch it work": what a persona is (Tools)
// → its mind, live (Agent Mind) → how it's triggered (Orchestration) → the
// platform it stands on (Platform). Each step drives its diagram via timed,
// click-based actions, then bridges into /features.
export const HOME_TOUR_STEPS: TourStep[] = [
  // 1. Tools — introduce the persona + its composable skills. The use-cases
  //    diagram auto-cycles its tools, so no action is needed here.
  {
    id: "tools",
    scrollTarget: "#tools",
    spotlightTarget: '[data-tour-diagram="tools"]',
    narration: "step1",
    dwellMs: 12000,
    audioSrc: "/tour/step1.mp3",
  },
  // 2. Agent mind — start the "Triage my Gmail" run so the agent visibly
  //    parses, plans, and executes while it's narrated.
  {
    id: "agent-mind",
    scrollTarget: "#playground",
    spotlightTarget: '[data-tour-diagram="agent-mind"]',
    narration: "step2",
    dwellMs: 13000,
    audioSrc: "/tour/step2.mp3",
    actions: [{ atMs: 2200, run: () => clickByText("Triage my Gmail") }],
  },
  // 3. Orchestration — highlight four trigger types in turn as they're named.
  {
    id: "orchestration",
    scrollTarget: "#pipelines",
    spotlightTarget: '[data-tour-diagram="orchestration"]',
    narration: "step3",
    dwellMs: 14000,
    audioSrc: "/tour/step3.mp3",
    actions: [
      { atMs: 2500, run: () => clickTarget('[data-trigger-id="schedule"]') },
      { atMs: 5000, run: () => clickTarget('[data-trigger-id="event"]') },
      { atMs: 7500, run: () => clickTarget('[data-trigger-id="polling"]') },
      { atMs: 10000, run: () => clickTarget('[data-trigger-id="webhook"]') },
    ],
  },
  // 4. Platform — open the six platform cards one at a time (each action
  //    toggles the previous closed, then opens the next).
  {
    id: "platform",
    scrollTarget: "#vision",
    spotlightTarget: '[data-tour-diagram="platform"]',
    narration: "step4",
    dwellMs: 15000,
    audioSrc: "/tour/step4.mp3",
    actions: [
      { atMs: 1500, run: () => clickTarget('[data-card-id="credential-vault"]') },
      {
        atMs: 3700,
        run: () => {
          clickTarget('[data-card-id="credential-vault"]');
          clickTarget('[data-card-id="templates"]');
        },
      },
      {
        atMs: 5900,
        run: () => {
          clickTarget('[data-card-id="templates"]');
          clickTarget('[data-card-id="byom"]');
        },
      },
      {
        atMs: 8100,
        run: () => {
          clickTarget('[data-card-id="byom"]');
          clickTarget('[data-card-id="monitoring"]');
        },
      },
      {
        atMs: 10300,
        run: () => {
          clickTarget('[data-card-id="monitoring"]');
          clickTarget('[data-card-id="lab"]');
        },
      },
      {
        atMs: 12500,
        run: () => {
          clickTarget('[data-card-id="lab"]');
          clickTarget('[data-card-id="orchestration"]');
        },
      },
    ],
  },
  // 5. Download — the call to action: grab the Windows 11 installer and the
  //    Claude Code CLI that powers local agents.
  {
    id: "download",
    scrollTarget: "#download-section",
    spotlightTarget: '[data-tour-diagram="download"]',
    narration: "step5",
    dwellMs: 12000,
    audioSrc: "/tour/step5.mp3",
  },
];

// /features — "The life of an agent": born → learns → heals → observed →
// refined in the Lab → extended with Plugins.
export const FEATURES_TOUR_STEPS: TourStep[] = [
  {
    id: "design",
    scrollTarget: "#design",
    spotlightTarget: '[data-tour-diagram="design"]',
    narration: "features1",
    dwellMs: 8000,
    audioSrc: "/tour/features1.mp3",
  },
  {
    id: "memory",
    scrollTarget: "#memory-layers",
    spotlightTarget: '[data-tour-diagram="memory"]',
    narration: "features2",
    dwellMs: 8000,
    audioSrc: "/tour/features2.mp3",
  },
  {
    id: "healing",
    scrollTarget: "#healing-circuit",
    spotlightTarget: '[data-tour-diagram="healing"]',
    narration: "features3",
    dwellMs: 8500,
    audioSrc: "/tour/features3.mp3",
  },
  {
    id: "observe",
    scrollTarget: "#observe",
    spotlightTarget: '[data-tour-diagram="observe"]',
    narration: "features4",
    dwellMs: 8500,
    audioSrc: "/tour/features4.mp3",
  },
  // 5. Lab — the six ways to make a persona better.
  {
    id: "lab",
    scrollTarget: "#lab",
    spotlightTarget: '[data-tour-diagram="lab"]',
    narration: "features5",
    dwellMs: 9000,
    audioSrc: "/tour/features5.mp3",
  },
  // 6. Plugins — the bundled specialists; select Dev Tools so the card shows
  //    that plugin while it's narrated.
  {
    id: "plugins",
    scrollTarget: "#plugins",
    spotlightTarget: '[data-tour-diagram="plugins"]',
    narration: "features6",
    dwellMs: 9500,
    audioSrc: "/tour/features6.mp3",
    actions: [{ atMs: 1800, run: () => clickTarget('[data-plugin-key="dev-tools"]') }],
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

/**
 * Tour registry keyed by a serializable id. Server components (the
 * force-static /features and /roadmap pages) pass only this string to the
 * client launcher — the step arrays contain function `actions`, which cannot
 * cross the Server→Client boundary, so they must be resolved client-side.
 */
export const TOURS_BY_ID = {
  home: HOME_TOUR_STEPS,
  features: FEATURES_TOUR_STEPS,
  roadmap: ROADMAP_TOUR_STEPS,
} as const;

export type TourId = keyof typeof TOURS_BY_ID;
