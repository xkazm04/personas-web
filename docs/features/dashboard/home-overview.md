# Dashboard Home Overview
> The dashboard landing page — a fleet "Mission Control" cockpit: greeting, fleet recommendation, a triage / vitals / activity cockpit, a live status ticker, and a below-fold instruments bay · **Route:** `/dashboard/home` · **Nav label:** "Overview" · **Status:** Demo-only (mocks)

## What it does
Home is the first screen after entering the dashboard. `/dashboard` redirects here (`src/app/dashboard/page.tsx:4`), and the sidebar's "Overview" item points at `/dashboard/home` (`DashboardNavigation.tsx:26`).

It greets the user by first name with a time-of-day greeting and an optional "last seen" line, then lays out a mission-control IA mirroring the desktop overview:

- **Fleet optimization** — a heuristic "scale up / down" recommendation card (demo only), the single top recommendation.
- **Cockpit** — a 3-column row:
  - **Triage Pane** — one ranked queue of the most urgent items (active SLA breaches, open health incidents, pending reviews) sorted by severity then recency; "all clear" empty state.
  - **Vitals Console** — a success-rate ring + 14-day success sparkline over a 2×2 grid of counters (runs, agents, open alerts, pending reviews).
  - **Activity Stream** — the latest 12 executions with persona avatar, relative time, duration, cost, and status; new runs pulse cyan as they arrive.
- **Status Ticker** — a slim live strip that cross-fades through fleet vitals (success, agents online, providers, next routine, open alerts); static when reduced-motion.
- **Instruments Bay** (below the fold, lazy-mounted) — intelligence panels (Health Digest + Memory Actions), an execution-activity heatmap, Top performers alongside the 14-day traffic/errors chart, Upcoming routines + (demo) Vault changes, and four quick-link tiles.

Every stat and card is a deep link into the matching dashboard section. Like the rest of `/dashboard/*`, all numbers here are **mock data** — live data would flow through the external orchestrator (or the Supabase mirror), but this repo ships demo fixtures.

## How it works
The page (`src/app/dashboard/home/page.tsx`) is a `"use client"` component wrapped in a `staggerContainer`/`fadeUp` framer-motion tree. It pulls from five Zustand stores (`auth`, `persona`, `execution`, `review`, `system`) and derives a `stats` memo (total runs, success rate, running count, active-agent count) plus `recentExecs` (first 12 enriched executions) and `chartData`.

Key behaviors:
- **Deferred instruments bay** — the below-fold region is wrapped in `LazyMount` (`src/components/LazyMount.tsx`, mounts ~800px before viewport). The `instrumentsRef` div around it always exists, so an `IntersectionObserver` (rootMargin `220px`) flips `loadObservability` true on first approach (`page.tsx`); only then does `useSWR("observability", api.getObservability)` fire (revalidation off, 60s dedupe). `observabilityFetchedAt` feeds a `StalenessIndicator`.
- **Self-driven reveals** — `InstrumentsBay` mounts after the page's one-shot stagger has fired, so its sections animate themselves with `whileInView` (`viewport once`) rather than inherited variants (the SectionWrapper late-mount gotcha).
- **Store hydration** — one effect calls `fetchExecutions()` + `fetchReviews()` on mount.
- **Demo-conditional regions** — Fleet optimization and Vault changes render only when `isDemo`; the Triage Pane sources SLA breaches + health incidents only in demo (pending reviews come from the live store in both modes); the Intelligence panels are illustrative-only (see gotchas).

Subcomponents each own a slice:
- `DashboardGreetingHeader` → slim greeting + last-seen line (vitals now live in the Vitals Console).
- `TriagePane` → ranked queue from `useTriageQueue`; `VitalsConsole` → success ring + counters (`useOpenAlertCount` derives the alert count); `StatusTicker` → rotating live status.
- `InstrumentsBay` → composes the below-fold cards and threads the page's observability data into `TrafficErrorsCard`.
- Data hooks (`useTopPerformers`, `useUpcomingRoutines`, `useExecutionHeatmap`) all follow one pattern: seed state from a `MOCK_*` fixture when `isDemo`, otherwise fetch from `supabaseApi`/`api` in an effect with a `cancelled` guard and `Sentry.captureException` on error.

## Key files
| File | Role |
| --- | --- |
| `src/app/dashboard/home/page.tsx` | Page shell: stores, stats memo, cockpit layout, lazy instruments bay |
| `src/app/dashboard/page.tsx` | `redirect("/dashboard/home")` |
| `src/app/dashboard/home/home-page/DashboardGreetingHeader.tsx` | Slim greeting + last-seen line |
| `src/app/dashboard/home/home-page/TriagePane.tsx` | Ranked urgent queue (breaches / incidents / reviews) |
| `src/app/dashboard/home/home-page/useTriageQueue.ts` | Merges + ranks triage items (severity → weight → recency) |
| `src/app/dashboard/home/home-page/VitalsConsole.tsx` | Success-rate ring + sparkline + 2×2 counters |
| `src/app/dashboard/home/home-page/useOpenAlertCount.ts` | Open-alert count (mock in demo, fetch in real); shared by cockpit |
| `src/app/dashboard/home/home-page/StatusTicker.tsx` | Live status strip; cross-fades, static under reduced-motion |
| `src/app/dashboard/home/home-page/RecentActivityCard.tsx` | Last-12 executions feed with new-run pulse + 30s relative-time tick |
| `src/app/dashboard/home/home-page/InstrumentsBay.tsx` | Below-fold composition (panels / heatmap / traffic / routines / vault / links) |
| `src/app/dashboard/home/home-page/DashboardIntelligencePanels.tsx` | Health Digest + Memory Actions (demo only) |
| `src/app/dashboard/home/home-page/DashboardQuickLinks.tsx` | 4 deep-link tiles (Agents / Observability ×2 / Settings) |
| `src/app/dashboard/home/home-page/TrafficErrorsCard.tsx` | Dynamic (`ssr:false`) `TrafficChart` + staleness indicator |
| `src/app/dashboard/home/home-page/ExecutionHeatmapCard.tsx` | Agent × 7-day intensity grid |
| `src/app/dashboard/home/home-page/TopPerformersCard.tsx` | Top-3 leaderboard snapshot (medal/trend/score) |
| `src/app/dashboard/home/home-page/UpcomingRoutinesCard.tsx` | Next scheduled runs with trigger tint + ETA |
| `src/app/dashboard/home/home-page/VaultChangesCard.tsx` | Credential-vault recent changes (demo only) |
| `src/app/dashboard/home/home-page/useGreeting.ts` | Time-of-day greeting; minute tick crosses noon/6pm |
| `src/app/dashboard/home/home-page/useLastVisit.ts` | localStorage prior-visit timestamp (60s reload guard) |
| `src/app/dashboard/home/home-page/useExecutionHeatmap.ts` | Mock fixture or `createdAt`-bucketed grid from synced execs |
| `src/app/dashboard/home/home-page/useTopPerformers.ts` | `MOCK_LEADERBOARD` or `getSyncedLeaderboard()` |
| `src/app/dashboard/home/home-page/useUpcomingRoutines.ts` | `MOCK_UPCOMING_ROUTINES` or filtered/sorted `getSyncedTriggers()` |

## Data & state
- **Source:** Demo-only in this repo. `api` is a Proxy (`src/lib/api.ts:361`) that dispatches to `mockApi` whenever `useAuthStore.isDemo` is true; otherwise to `supabaseApi` (`NEXT_PUBLIC_DATA_SOURCE=supabase`) or `realApi` (orchestrator REST). Fixtures live in `src/lib/mock-dashboard-data.ts` (`MOCK_FLEET_RECOMMENDATION`, `MOCK_GLOBAL_EXECUTIONS`, `MOCK_HEALTH_ISSUES`, `MOCK_HEALTH_DIGEST`, `MOCK_SLA_BREACHES`, `MOCK_EXECUTION_HEATMAP`, `MOCK_LEADERBOARD`, `MOCK_UPCOMING_ROUTINES`, `MOCK_VAULT_CHANGES`, `MOCK_MODEL_PROVIDERS`, `SPARKLINE_SUCCESS`, `HEATMAP_DAYS = 7`) and `src/lib/mockApi.ts`.
- **Stores:** `authStore` (`user`, `isDemo`), `personaStore` (`personas`), `executionStore` (`fetchExecutions`, `useEnrichedExecutions`), `reviewStore` (`pendingReviewCount`, `reviews`, `fetchReviews`), `systemStore` (`health.workers.total`).
- **API routes:** No Next.js API routes of its own. Client calls `api.getObservability`, `api.getObservabilityHealthIssues`, `api.listExecutions`, `api.listPersonas`; supabase path uses `getSyncedLeaderboard` / `getSyncedTriggers` from `src/lib/supabaseApi.ts`. SWR key `"observability"`.
- **Types:** `GlobalExecution` (`src/lib/types.ts`), and from `mock-dashboard-data.ts`: `HeatmapRow`, `LeaderboardPersona`, `LeaderboardTrend`, `UpcomingRoutine`, `RoutineTrigger`, `VaultAction`, `SLABreach`; `TriageItem`/`TriageKind` (local to `useTriageQueue.ts`); `SyncedTrigger` from `supabaseApi.ts`.

## Integration points
- **Dashboard shell** — rendered inside the `/dashboard` layout (`src/app/dashboard/layout.tsx`) with `DashboardNavbar` + `DashboardNavigation`; nav label is `t.dashboard.overview`.
- **Shared primitives** — `GlowCard`, `GradientText`, `LazyMount`, `components/dashboard/*` (`StatBadge`, `Sparkline`, `PersonaAvatar`, `StatusBadge`, `EmptyState`, `SkeletonCard`, `StalenessIndicator`, `HealthDigestPanel`, `MemoryActionsPanel`, `FleetOptimizationCard`, `healthScoreColor`, `TrafficChart`), and `TourLauncher`. The `data-tour-diagram="dashboard-*"` anchors drive the guided dashboard tour (`DASHBOARD_TOUR_STEPS` in `src/lib/tour-script.ts`): `dashboard-fleet` (fleet card), `dashboard-vitals` (vitals console), `dashboard-activity` (activity stream), `dashboard-intelligence`/`dashboard-heatmap`/`dashboard-instruments` (instruments bay). Keep these anchors when restructuring — the audio sweep targets them.
- **Motion** — `fadeUp` / `staggerContainer` from `src/lib/animations.ts`; `RecentActivityCard`, `VitalsConsole` (success ring), and `StatusTicker` use `useReducedMotion`.
- **i18n** — namespaces `t.dashboard.*` and the nested `t.dashboard.home.{vitals,cockpit,heatmap,topPerformers,upcomingRoutines,vaultChanges}` (`src/i18n/en.ts:275`, EN values at `:1437`). The cockpit's triage/vitals/ticker strings live under `t.dashboard.home.cockpit`.
- **Format/util** — `relativeTime` from `src/lib/format.ts`; `usePageVisibility` hook; `DASHBOARD_LAST_VISIT_KEY` from `src/lib/constants.ts`.

## Conventions & gotchas
- **Demo-only:** every figure on this page is mock data in this repo. The orchestrator/supabase branches in the hooks exist but are dormant here.
- **i18n 14-locale lockstep:** any new key under `t.dashboard` / `t.dashboard.home` must be added to `en.ts` and hand-translated into all 13 other locales in the same commit. Non-Latin values may be written as `\uXXXX` escapes (matching existing entries) to sidestep the locale files' mojibake-on-disk hazard. Note `ExecutionHeatmapCard` deliberately derives weekday labels via `Intl.DateTimeFormat` (locale-aware) instead of new keys.
- **Semantic Tailwind tokens:** uses `text-foreground`, `text-muted-dark`, `border-glass`, `text-brand-cyan`, etc. Watch for raw-color drift — several cards use literal `bg-white/[0.04]`, `bg-cyan-500/8`, and accent hexes inline; new code should prefer tokens. Several `text-…` utilities sit at `/60`+ to stay above the WCAG-AA lint threshold.
- **Animation gating:** `RecentActivityCard`, `VitalsConsole`, and `StatusTicker` import `useReducedMotion` and disable looping/sweep motion when it's on (the success ring renders at its final offset; the ticker stops rotating and lays items out statically). The page-level `staggerContainer`/`fadeUp` are framer variants (no rAF), so no gating needed there.
- **React 19 purity:** impure date reads are cached in lazy `useState(() => …)` initializers — see `useGreeting.ts:22`, `ExecutionHeatmapCard.tsx:38`. Timer effects use `queueMicrotask`/`setInterval` inside effects rather than calling `setState` synchronously in an effect body. `useTriageQueue` ranks deterministically inside a `useMemo` (no `Date.now`/`Math.random`).

**Real issues found:**
- **Dormant Intelligence-panels branch** — `DashboardIntelligencePanels` returns `null` when `ready && !isDemo` (`DashboardIntelligencePanels.tsx:15`). `InstrumentsBay` passes `ready` directly (no skeleton delay now), so in real mode the `lg:grid-cols-2` wrapper renders empty. Both `HealthDigestPanel` and `MemoryActionsPanel` are illustrative-only with no synced source; consider `isDemo`-guarding at the `InstrumentsBay` call site like the other demo-only regions.
- **Triage in real mode** — `useTriageQueue` sources SLA breaches + health incidents only in demo (no faithful synced source), so real mode shows just pending reviews. Consistent with the other illustrative panels, but worth revisiting if a real incidents source lands.
- **Comment vs. constant (benign):** the heatmap i18n subtitle hardcodes "last 7 days" while the grid uses `HEATMAP_DAYS = 7`; will drift if the constant changes.
- **Duplicate Quick Link destinations:** two of the four Quick Links ("Observability" and "Usage analytics") both point at `/dashboard/observability` — intentional today (no separate usage route).
- **Open-alert count is demo-frozen:** `useOpenAlertCount` seeds from `MOCK_HEALTH_ISSUES` in demo and never refetches; the real branch fetches once on mount. No live polling for any vitals badge.

**Where to extend:** add below-fold cards inside `InstrumentsBay.tsx` (mind the demo/real grid-cols switch on the routines/vault row); add a triage source in `useTriageQueue.ts` or a counter in `VitalsConsole.tsx`; new telemetry data hooks should mirror the seed-from-mock-then-fetch pattern in `useTopPerformers.ts`.

## Related docs
- [Dashboard shell & chrome](shell-chrome.md)
- [Feature index](../INDEX.md)
