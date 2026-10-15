/**
 * The dashboard's views: one id per URL segment under `/dashboard/<id>`.
 *
 * The dashboard is a single-page app. `src/app/dashboard/[view]/page.tsx`
 * prerenders one static entry per id (so a deep link or a reload lands on the
 * right view), and the layout's `ViewOutlet` renders the view from the URL
 * after that. Moving between views is a `history.pushState`, not a route
 * change: nothing is fetched from the server, and visited views are kept alive.
 *
 * This module is server-safe on purpose (no icons, no components): the route
 * file reads the ids for `generateStaticParams`.
 */
export const DASHBOARD_VIEW_IDS = [
  "personas",
  "notes",
  "home",
  "reviews",
  "executions",
  "events",
  "observability",
  "leaderboard",
  "sla",
  "incidents",
  "health",
  "knowledge",
  "messages",
  "director",
  "settings",
] as const;

export type DashboardViewId = (typeof DASHBOARD_VIEW_IDS)[number];

/** Where `/dashboard` itself lands. */
export const DEFAULT_DASHBOARD_VIEW: DashboardViewId = "personas";

/**
 * A scope-bar dimension a view's data honours (docs/features/dashboard/
 * shell-chrome.md, "Scope"): the persona and the time window. (Compare is not a
 * bar control: the one view that can honour it, Observability, carries a
 * toggle on the same store flag in each tab that has a prior period.)
 */
export type ScopeDimension = "persona" | "window";

interface ViewTraits {
  /**
   * The scope-bar dimensions this view's data honours. The bar shows exactly
   * these controls, and none at all when the list is empty, so no control
   * claims a filter its view ignores (`scopeHonesty.test.ts` holds each claim
   * to the view's data module).
   */
  scope: readonly ScopeDimension[];
  /** The view owns the content area edge to edge (no padding, no max width). */
  fullBleed: boolean;
}

const NONE: readonly ScopeDimension[] = [];
const PERSONA_AND_WINDOW: readonly ScopeDimension[] = ["persona", "window"];

const TRAITS: Record<DashboardViewId, ViewTraits> = {
  personas: { scope: NONE, fullBleed: true },
  // Notes are grouped by the desktop's projects, not by the persona scope.
  notes: { scope: NONE, fullBleed: false },
  // Mission Control reads the scope's window (its daily series has no persona)
  // and states it in its header, so it carries no bar of its own.
  home: { scope: NONE, fullBleed: false },
  reviews: { scope: PERSONA_AND_WINDOW, fullBleed: false },
  executions: { scope: PERSONA_AND_WINDOW, fullBleed: false },
  events: { scope: PERSONA_AND_WINDOW, fullBleed: false },
  // Its tiles, trends, anomaly banner and Compare overlay are one reconciled
  // projection of the fleet's daily series, which has no persona: slicing the
  // charts by the window would part them from the tiles above. It reads the
  // store's Compare flag from its own toggle instead (PerformanceView).
  observability: { scope: NONE, fullBleed: false },
  // Scores are period aggregates with no time of their own: persona only.
  leaderboard: { scope: ["persona"], fullBleed: false },
  sla: { scope: PERSONA_AND_WINDOW, fullBleed: false },
  // Incidents, Health and Director keep their own windows and filters.
  incidents: { scope: NONE, fullBleed: false },
  health: { scope: NONE, fullBleed: false },
  knowledge: { scope: PERSONA_AND_WINDOW, fullBleed: false },
  messages: { scope: PERSONA_AND_WINDOW, fullBleed: false },
  director: { scope: NONE, fullBleed: false },
  settings: { scope: NONE, fullBleed: false },
};

export function viewTraits(id: DashboardViewId): ViewTraits {
  return TRAITS[id];
}

export function isDashboardViewId(value: string): value is DashboardViewId {
  return (DASHBOARD_VIEW_IDS as readonly string[]).includes(value);
}

export function dashboardHref(id: DashboardViewId): `/dashboard/${DashboardViewId}` {
  return `/dashboard/${id}`;
}

/**
 * The view a pathname shows, or null when it names none (`/dashboard` itself
 * redirects on the server; an unknown segment is the route's 404).
 */
export function viewIdFromPath(pathname: string): DashboardViewId | null {
  const segment = pathname.split("/")[2] ?? "";
  return isDashboardViewId(segment) ? segment : null;
}
