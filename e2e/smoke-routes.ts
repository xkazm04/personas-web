/**
 * The route manifest the smoke suite walks.
 *
 * ── Why this file exists separately from the spec ──────────────────────────
 * Adding a route to the app should cost one entry here and nothing else. The
 * runner in `smoke.spec.ts` derives every test from this list, so coverage is a
 * data question rather than a copy-paste question — and a route that is added
 * to the app and forgotten here is visible as an absence in one place.
 *
 * ── Partial runs ──────────────────────────────────────────────────────────
 * Every generated test is titled `smoke [<tag>] <path>`, so Playwright's own
 * filtering is the partial-run mechanism and no custom flag is needed:
 *
 *   npx playwright test smoke                      # everything
 *   npx playwright test smoke -g "\[public\]"      # marketing surface only
 *   npx playwright test smoke -g "\[dashboard\]"   # the demo product surface
 *   npx playwright test smoke -g "/templates"      # one route
 *
 * ── What is deliberately NOT here ─────────────────────────────────────────
 * `/guide/**` is excluded by decision: it is 116 topics across 14 locales with
 * its own dedicated spec (`guide.spec.ts`), and walking it here would make a
 * smoke run slow enough that people stop running it. Smoke coverage is a
 * breadth instrument; the guide has a depth instrument already.
 *
 * `/blog/[slug]` and `/templates/[id]` are represented by one concrete instance
 * each rather than every id — the parameterised route is what is being smoked,
 * not the content set.
 */

export type SmokeTag = "public" | "dashboard" | "mobile" | "dev";

export interface SmokeRoute {
  /** Path to visit. For `dashboard`/`mobile` this is reached by in-app navigation. */
  readonly path: string;
  /** Short name used in the test title. */
  readonly name: string;
  readonly tag: SmokeTag;
  /**
   * Text that must be visible once the route has settled. Optional, because a
   * generic liveness assertion already runs on every route — this is the extra
   * per-route signal for surfaces where "something rendered" is not enough.
   */
  readonly expectText?: string;
  /** A selector that must be visible. Defaults to the page's `main` landmark. */
  readonly expectSelector?: string;
  /**
   * Console errors this route is allowed to emit, each with the reason it is
   * tolerated. An empty/absent list means: no console errors at all.
   * A tolerated error must name WHY, so the allowlist cannot quietly become a
   * place where real errors go to be forgotten.
   */
  readonly allowConsole?: readonly { readonly match: string; readonly why: string }[];
}

/** Marketing, content and public product surfaces — reached by hard navigation. */
const PUBLIC: readonly SmokeRoute[] = [
  { path: "/", name: "home", tag: "public", expectText: "Intelligent agents" },
  { path: "/features", name: "features", tag: "public" },
  { path: "/how", name: "how it works", tag: "public" },
  { path: "/connections", name: "connectors", tag: "public" },
  { path: "/templates", name: "templates gallery", tag: "public", expectText: "Agent Templates" },
  { path: "/roadmap", name: "roadmap", tag: "public" },
  { path: "/security", name: "security", tag: "public" },
  { path: "/blog", name: "blog index", tag: "public", expectText: "Updates" },
  { path: "/legal", name: "legal", tag: "public", expectText: "Privacy" },
  { path: "/playground", name: "playground", tag: "public", expectText: "See agents in action" },
  { path: "/athena", name: "athena", tag: "public" },
];

/**
 * The demo product surface. Demo mode is IN-MEMORY and never persisted, so a
 * hard navigation to any of these lands on the sign-in prompt instead of the
 * page. The runner enters demo once and then navigates by clicking the sidebar,
 * which is why every entry here is also a link in `DashboardNavigation`.
 */
const DASHBOARD: readonly SmokeRoute[] = [
  { path: "/dashboard/home", name: "mission control", tag: "dashboard" },
  { path: "/dashboard/agents", name: "agents", tag: "dashboard" },
  { path: "/dashboard/executions", name: "executions", tag: "dashboard" },
  { path: "/dashboard/events", name: "event bus", tag: "dashboard" },
  { path: "/dashboard/reviews", name: "review queue", tag: "dashboard" },
  { path: "/dashboard/messages", name: "messages", tag: "dashboard" },
  { path: "/dashboard/observability", name: "observability", tag: "dashboard" },
  { path: "/dashboard/leaderboard", name: "leaderboard", tag: "dashboard" },
  { path: "/dashboard/director", name: "director coaching", tag: "dashboard" },
  { path: "/dashboard/sla", name: "sla", tag: "dashboard" },
  { path: "/dashboard/incidents", name: "incidents", tag: "dashboard" },
  { path: "/dashboard/health", name: "system health", tag: "dashboard" },
  { path: "/dashboard/knowledge", name: "knowledge base", tag: "dashboard" },
  { path: "/dashboard/settings", name: "settings", tag: "dashboard" },
];

/** The separate mobile route tree. Same in-memory demo constraint. */
const MOBILE: readonly SmokeRoute[] = [
  { path: "/m/overview", name: "mobile overview", tag: "mobile" },
  { path: "/m/reviews", name: "mobile reviews", tag: "mobile" },
  { path: "/m/messages", name: "mobile messages", tag: "mobile" },
  { path: "/m/alerts", name: "mobile alerts", tag: "mobile" },
];

export const SMOKE_ROUTES: readonly SmokeRoute[] = [...PUBLIC, ...DASHBOARD, ...MOBILE];

export const PUBLIC_ROUTES = PUBLIC;
export const DASHBOARD_ROUTES = DASHBOARD;
export const MOBILE_ROUTES = MOBILE;

/**
 * One concrete instance per parameterised route. Kept separate because these
 * need a real id that exists, and that id is content rather than routing.
 */
export const DETAIL_ROUTES: readonly SmokeRoute[] = [
  { path: "/templates/gmail-inbox-triage", name: "template detail", tag: "public" },
];

/**
 * Routes that must NOT be reachable in a production build.
 *
 * `/preview` is the dev-only section harness. Its page calls `notFound()` when
 * `NODE_ENV === "production"`, and the not-found BODY is what renders — but the
 * route is statically prerendered, so the guard ran at build time and the
 * response ships with HTTP 200. A genuinely missing path on the same server
 * answers 404, so this is a soft 404: crawlers and uptime checks see a live
 * page where the code intended a dead one.
 */
export const MUST_404_IN_PRODUCTION: readonly string[] = ["/preview", "/preview/hero"];

/** Text that means the page failed, whatever route it appears on. */
export const FAILURE_MARKERS: readonly string[] = [
  "Application error",
  "This page could not be found",
  "Something went wrong",
];
