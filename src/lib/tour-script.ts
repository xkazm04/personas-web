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
 *
 * A step the visitor *does* rather than watches carries `advanceOn`: it
 * completes on a typed signal of the visitor's own action
 * (`lib/tourSignals.ts`), its `actions` become the "Show me" demonstration, and
 * the dwell timer is only the fallback (`lib/tour-progress.ts`).
 */

import type { TourSignal } from "./tourSignals";

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
  | "dashboardBoard"
  | "dashboardMission"
  | "dashboardHealth"
  | "dashboardReviews"
  | "roadmap1"
  | "roadmap2"
  | "roadmap3";

/** Key into `t.tour` for a step's "your move" line, shown under its narration. */
export type TourTaskKey = "dashboardReviewsTask";

/**
 * A timed side effect fired while a step is on screen — used to drive a
 * diagram's animation in sync with the narration (start the Gmail example,
 * highlight each trigger in turn, open each platform card, …). Scheduled
 * on the step's narration clock (`tour-cue-clock.ts`; frozen while paused), re-armed on step
 * change / exit. Keep `run` resilient: the target may not be mounted yet, so
 * guard DOM lookups (see `clickTarget` below).
 */
export interface TourAction {
  /** ms of narration-clock time into the step at which to fire `run`. */
  atMs: number;
  /** Side effect — typically a click that drives the focused diagram. */
  run: () => void;
}

/**
 * A timed change of the spotlight target *within* a single step — used when one
 * continuous narration clip walks across several regions of one page (the
 * dashboard home sweep). Fired on the step narration clock; the spotlight tweens
 * to each `target` as its `atMs` elapses.
 */
export interface TourSpotlightCue {
  /** ms after the step becomes active to move the spotlight to `target`. */
  atMs: number;
  /** `[data-tour-diagram]` selector the spotlight glides to. */
  target: string;
}

export interface TourStep {
  /** Stable id — used for React keys and progress tracking. */
  id: string;
  /**
   * Client route this step lives on. When set and different from the current
   * path, the engine navigates here on step entry so one tour can span pages
   * (each dashboard tab is its own step). Same-layout routes keep the tour
   * provider mounted, so state and audio survive the navigation.
   */
  route?: string;
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
  /**
   * Optional in-step spotlight itinerary. When set, the spotlight starts on
   * `spotlightTarget` then glides to each cue's `target` on its timeline,
   * keeping a single long narration in sync with the regions it describes.
   */
  spotlightSequence?: TourSpotlightCue[];
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
  /**
   * The visitor's action that completes this step. While set, the step's
   * `actions` do not run on the clock: they are the demonstration the visitor
   * plays with "Show me". Without a match the dwell timer still advances the
   * step (unless `waitForSignal`).
   */
  advanceOn?: (signal: TourSignal) => boolean;
  /**
   * Only `advanceOn` (or the visitor's own Next, Keep looking or exit) ends this
   * step: no dwell fallback, and its clip ending does not advance it.
   */
  waitForSignal?: boolean;
  /** Where the visitor's action leads once it completes the step (an href), or null. */
  followSignal?: (signal: TourSignal) => string | null;
  /** Key into `t.tour` for a "your move" line under the narration. */
  task?: TourTaskKey;
  /**
   * Dock the caption card to the bottom inline-start corner on wide viewports
   * (lg and up) instead of centring it, and let the cutout run to the bottom
   * margin. For a step whose control sits low in a large anchor: centred, the
   * card and the cutout's bottom clearance would cover the very control the
   * step asks the visitor to use.
   */
  captionDock?: "start";
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
 * Move keyboard focus to the first element matching `selector`, if present:
 * "Show me" on a step whose action is the visitor's own decision points at the
 * control rather than pressing it.
 */
export function focusTarget(selector: string): void {
  if (typeof document === "undefined") return;
  document.querySelector<HTMLElement>(selector)?.focus();
}

// `INTRO_AUDIO_SRC` lives in `@/lib/tour-audio` — TourProvider mounts on every
// page and must not pull these step scripts into the above-fold chunk.

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
  // 2. Agent mind — start the Gmail example run so the agent visibly
  //    parses, plans, and executes while it's narrated.
  {
    id: "agent-mind",
    scrollTarget: "#playground",
    spotlightTarget: '[data-tour-diagram="agent-mind"]',
    narration: "step2",
    dwellMs: 13000,
    audioSrc: "/tour/step2.mp3",
    // Aimed by the example's id, not its label: the label is translated copy.
    actions: [{ atMs: 2200, run: () => clickTarget('[data-example-id="gmail"]') }],
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
      { atMs: 5000, run: () => clickTarget('[data-trigger-id="event_listener"]') },
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
  // 5. Lab — cycle through the four variant tabs (chat → arena → evolution →
  //    eval) in time with the narration so the audience sees each refinement
  //    surface Athena names.
  {
    id: "lab",
    scrollTarget: "#lab",
    spotlightTarget: '[data-tour-diagram="lab"]',
    narration: "features5",
    dwellMs: 16000,
    audioSrc: "/tour/features5.mp3",
    actions: [
      { atMs: 4500, run: () => clickTarget('[data-lab-tab="chat"]') },
      { atMs: 7500, run: () => clickTarget('[data-lab-tab="arena"]') },
      { atMs: 10500, run: () => clickTarget('[data-lab-tab="evolution"]') },
      { atMs: 13500, run: () => clickTarget('[data-lab-tab="eval"]') },
    ],
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

/** Where a committed verdict leads: the run the review was about (`?focus=` opens its detail). */
export function verdictRunHref(signal: TourSignal): string | null {
  if (signal.kind !== "verdict" || !signal.executionId) return null;
  return `/dashboard/executions?focus=${encodeURIComponent(signal.executionId)}`;
}

// /dashboard — an operator's first shift, done rather than watched. It starts
// on the Board, where `/demo` lands, and each step completes on the visitor's
// own action (a typed signal, lib/tourSignals.ts); "Show me" plays the step's
// actions instead, and the dwell is the fallback. The Board, Mission Control
// and Health steps are silent with captions (their screens have no recorded
// narration); the Reviews clip still describes its screen, so it plays. The
// last step waits for the visitor's verdict to commit (its undo window closed),
// then opens that review's run; "Keep looking" ends the tour without one. No
// call to action (owner, 2026-10-06: the demo is a tour, not a sign-up funnel).
export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  // 1. Board: send any agent a command and watch the board change when the
  //    machine has done it. "Show me" resumes Security Scanner, a crew agent
  //    (lib/demoCrew.ts) that starts switched off, so the act carries to the
  //    synced pages too.
  {
    id: "board",
    route: "/dashboard/personas",
    scrollTarget: '[data-tour-diagram="fleet-stage"]',
    spotlightTarget: '[data-tour-diagram="fleet-stage"]',
    narration: "dashboardBoard",
    dwellMs: 45000,
    advanceOn: (s) => s.kind === "command" && s.agentId !== null,
    actions: [
      { atMs: 0, run: () => clickTarget('[data-tile="p094"]') },
      { atMs: 1200, run: () => clickTarget('[data-ctl="resume"]') },
    ],
  },
  // 2. Mission Control: open a lamp to see the evidence behind it.
  {
    id: "mission",
    route: "/dashboard/home",
    scrollTarget: '[data-tour-diagram="mission-wall"]',
    spotlightTarget: '[data-tour-diagram="mission-wall"]',
    narration: "dashboardMission",
    dwellMs: 30000,
    advanceOn: (s) => s.kind === "view" && s.view === "home" && s.focus !== null,
    actions: [{ atMs: 0, run: () => clickTarget('[data-mission-dim="queue"]') }],
  },
  // 3. Health: fix the Slack outage once; its whole incident thread settles.
  {
    id: "health",
    route: "/dashboard/health",
    scrollTarget: '[data-health-check="in_slack"]',
    spotlightTarget: '[data-health-check="in_slack"]',
    narration: "dashboardHealth",
    dwellMs: 35000,
    advanceOn: (s) => s.kind === "causeFixed" && s.causeKey === "slack-circuit-break",
    actions: [{ atMs: 0, run: () => clickTarget('[data-health-action="in_slack"]') }],
  },
  // 4. Reviews: the visitor's own verdict ends the tour. "Show me" only moves
  //    focus to Approve; the decision stays theirs. Approve and Reject sit at
  //    the foot of the detail pane, so the card docks beside the queue.
  {
    id: "reviews",
    route: "/dashboard/reviews",
    scrollTarget: '[data-tour-diagram="dashboard-reviews"]',
    spotlightTarget: '[data-tour-diagram="dashboard-reviews"]',
    narration: "dashboardReviews",
    task: "dashboardReviewsTask",
    captionDock: "start",
    dwellMs: 24000,
    audioSrc: "/tour/dashboardReviews.mp3",
    waitForSignal: true,
    advanceOn: (s) => s.kind === "verdict",
    followSignal: verdictRunHref,
    actions: [{ atMs: 0, run: () => focusTarget('[data-review-decide="approved"]') }],
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
  dashboard: DASHBOARD_TOUR_STEPS,
  roadmap: ROADMAP_TOUR_STEPS,
} as const;

export type TourId = keyof typeof TOURS_BY_ID;
