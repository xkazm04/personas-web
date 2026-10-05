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

interface ViewTraits {
  /** The view's data respects `dashboardFilterStore`, so the scope bar shows. */
  scoped: boolean;
  /** The view owns the content area edge to edge (no padding, no max width). */
  fullBleed: boolean;
}

const TRAITS: Record<DashboardViewId, ViewTraits> = {
  personas: { scoped: false, fullBleed: true },
  home: { scoped: true, fullBleed: false },
  reviews: { scoped: true, fullBleed: false },
  executions: { scoped: true, fullBleed: false },
  events: { scoped: true, fullBleed: false },
  observability: { scoped: true, fullBleed: false },
  leaderboard: { scoped: true, fullBleed: false },
  sla: { scoped: true, fullBleed: false },
  // Incidents, Health and Director keep their own windows and filters.
  incidents: { scoped: false, fullBleed: false },
  health: { scoped: false, fullBleed: false },
  knowledge: { scoped: true, fullBleed: false },
  messages: { scoped: true, fullBleed: false },
  director: { scoped: false, fullBleed: false },
  settings: { scoped: false, fullBleed: false },
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
