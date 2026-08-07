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
- **Fleet sessions + Approved work** (demo only) — a 2:1 row mirroring the desktop's current Mission Control era:
  - **Fleet sessions strip** — the session ledger with parked-state classification: **Needs you** (violet, blocking on the operator, counted in a header pill), **Working** (blue), **Frozen** (orange — output silence past the stall cutoff), **Finished** (teal). Needs-you rows sort first; a session Athena has taken carries an "Athena's on it" chip.
  - **Approved work card** — reconciliation of approved ideas vs. actually dispatched work: a "{n} of {m} approved ideas never became a task" summary (+ stale count over 7 days), per-row Never dispatched / Dispatched tags with waiting age, a one-click **Dispatch** button per waiting row and a **Send to Fleet (n)** footer button. Demo-only: dispatching marks rows locally and confirms with a toast (`ExecuteToast`), nothing is actually sent.
- **Status Ticker** — a slim live strip that cross-fades through fleet vitals (success, agents online, and — demo only — providers + next routine, plus open alerts); static when reduced-motion. Rotation pauses on hover, on keyboard focus, and via a visible pause/play button (WCAG 2.2.2); the current item is announced through a polite live region.
- **Instruments Bay** (below the fold, lazy-mounted) — intelligence panels (Health Digest + Memory Actions, demo only), an execution-activity heatmap, Top performers alongside the 14-day traffic/errors chart, Upcoming routines + (demo) Vault changes, and four quick-link tiles (Agents / Observability / Executions / Settings).

Every stat and card is a deep link into the matching dashboard section. Like the rest of `/dashboard/*`, all numbers here are **mock data** — live data would flow through the external orchestrator (or the Supabase mirror), but this repo ships demo fixtures.

## How it works
The page (`src/app/dashboard/home/page.tsx`) is a `"use client"` component wrapped in a `staggerContainer`/`fadeUp` framer-motion tree. It pulls from five Zustand stores (`auth`, `persona`, `execution`, `review`, `system`) and derives a `stats` memo (total runs, success rate, running count, active-agent count) plus `recentExecs` (first 12 enriched executions) and `chartData`. Success rate is completed ÷ **terminal** (completed + failed) runs — queued/running/cancelled work is not counted as failure. The whole cockpit shares one `cockpitLoading` flag (`executionStore.executionsLoading` OR a first-load latch, since `executionsLoading` is still false on the first paint); `VitalsConsole`, `RecentActivityCard` and `StatusTicker` take it as an optional `loading` prop and render the same spinner ladder as the below-fold instruments instead of asserting 0%/empty before data lands.

Key behaviors:
- **Deferred instruments bay** — the below-fold region is wrapped in `LazyMount` (`src/components/LazyMount.tsx`, mounts ~800px before viewport) with a **measured** reserve of `minHeight={1690}`: the bay renders 1689px tall at ≥1280px wide in demo mode (517 intelligence + 268 heatmap + 434 performers/traffic + 296 routines/vault + 78 quick links + 4×24px gaps). Below `lg` the grids stack and it grows to ~2.7k — no single reserve covers both, so the desktop figure wins. The `instrumentsRef` div around it always exists, so an `IntersectionObserver` (rootMargin `220px`) flips `loadObservability` true on first approach (`page.tsx`); only then does `useSWR("observability:daily", api.getObservabilityDaily)` fire (revalidation off, 60s dedupe, `focusThrottleInterval` 60s). `fetchedAt` (stamped in SWR's `onSuccess`) feeds the Traffic & Errors `StalenessIndicator`.
- **Loading → error → empty ladder** — every data surface resolves in that order, never skipping a rung. Above the fold, one `cockpitLoading` flag (`awaitingFirstLoad` latch OR `executionsLoading`) holds `VitalsConsole`, `RecentActivityCard` and `StatusTicker` on a spinner until the first `fetchExecutions()`/`fetchReviews()` settle — the latch exists because `executionsLoading` is still `false` on the very first paint, which used to paint a rose 0% ring and a "0%" ticker frame before flipping. Below the fold, `TopPerformersCard`, `UpcomingRoutinesCard`, `ExecutionHeatmapCard` and `TrafficErrorsCard` each render spinner → `DashboardErrorBanner` (with retry) → empty state → data, so "nothing yet" only ever means resolved-and-truly-empty.
- **Self-driven reveals** — `InstrumentsBay` mounts after the page's one-shot stagger has fired, so its sections animate themselves with `whileInView` (`viewport once`) rather than inherited variants (the SectionWrapper late-mount gotcha).
- **Store hydration** — one effect calls `fetchExecutions()` + `fetchReviews()` on mount.
- **Live demo clock** — every "when" on this page is a real timestamp, never a frozen label. `MOCK_UPCOMING_ROUTINES.nextRunAt` and `MOCK_VAULT_CHANGES.changedAt` are ISO timestamps seeded at module-eval time (same shape as `mockData.ts`'s `ago()`); the routines card, vault card and ticker format them through `useLiveClock` + `relativeLabels`. The clock lives in state (no `Date.now()` in render), suspends while the tab is hidden, and catches up immediately on resume — the `RecentActivityCard` pattern. Demo routines carry an `everyMinutes` cadence so a long-open demo rolls the ETA forward instead of pinning at "0m"; real triggers omit it because `nextTriggerAt` is authoritative. The heatmap's weekday headers ride the same clock at 60s so a tab open across midnight relabels its columns.
- **Demo-conditional regions** — Fleet optimization, the Fleet sessions + Approved work row (`MOCK_FLEET_SESSIONS` / `MOCK_APPROVED_WORK` fixtures; the Approved-work "dispatch" only flips local state + shows a success toast), and Vault changes render only when `isDemo`; the Status Ticker drops its provider-count and next-routine items outside demo (both read `MOCK_*` fixtures with no synced source); the Triage Pane sources SLA breaches + health incidents only in demo (pending reviews come from the live store in both modes); the Intelligence panels are illustrative-only and are gated both at the `InstrumentsBay` call site (so real mode doesn't reserve an empty two-column row) and inside the component.

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
| `src/app/dashboard/home/home-page/FleetSessionsStrip.tsx` | Session ledger with parked-state classification (needs-you / working / frozen / finished), demo only |
| `src/app/dashboard/home/home-page/ApprovedWorkCard.tsx` | Approved-vs-dispatched reconciliation with demo-only dispatch + toast |
| `src/app/dashboard/home/home-page/StatusTicker.tsx` | Live status strip; cross-fades, static under reduced-motion |
| `src/app/dashboard/home/home-page/RecentActivityCard.tsx` | Last-12 executions feed with new-run pulse + 30s relative-time tick |
| `src/app/dashboard/home/home-page/InstrumentsBay.tsx` | Below-fold composition (panels / heatmap / traffic / routines / vault / links) |
| `src/app/dashboard/home/home-page/DashboardIntelligencePanels.tsx` | Health Digest + Memory Actions (demo only) |
| `src/app/dashboard/home/home-page/DashboardQuickLinks.tsx` | 4 deep-link tiles (Agents / Observability / Executions / Settings) |
| `src/app/dashboard/home/home-page/useDeferredObservability.ts` | IntersectionObserver gate + SWR fetch of daily metrics; owns loading/error/retry/`fetchedAt` |
| `src/app/dashboard/home/home-page/TrafficErrorsCard.tsx` | Dynamic (`ssr:false`) `TrafficChart` + staleness indicator |
| `src/app/dashboard/home/home-page/ExecutionHeatmapCard.tsx` | Agent × 7-day intensity grid |
| `src/app/dashboard/home/home-page/TopPerformersCard.tsx` | Top-3 leaderboard snapshot (medal/trend/score) |
| `src/app/dashboard/home/home-page/UpcomingRoutinesCard.tsx` | Next scheduled runs with trigger tint + ETA |
| `src/app/dashboard/home/home-page/VaultChangesCard.tsx` | Credential-vault recent changes (demo only) |
| `src/app/dashboard/home/home-page/useGreeting.ts` | Time-of-day greeting; minute tick crosses noon/6pm |
| `src/app/dashboard/home/home-page/useLastVisit.ts` | localStorage prior-visit timestamp (60s reload guard) |
| `src/app/dashboard/home/home-page/useExecutionHeatmap.ts` | Mock fixture or `createdAt`-bucketed grid from synced execs |
| `src/app/dashboard/home/home-page/useTopPerformers.ts` | `MOCK_LEADERBOARD` or `getSyncedLeaderboard()` |
| `src/app/dashboard/home/home-page/useUpcomingRoutines.ts` | `MOCK_UPCOMING_ROUTINES` or filtered/sorted `getSyncedTriggers()` (carries raw `nextRunAt`, not a baked label) |
| `src/app/dashboard/home/home-page/useLiveClock.ts` | Shared relative-time clock: state-held `now`, visibility-suspended, catch-up on resume |
| `src/app/dashboard/home/home-page/relativeLabels.ts` | Compact `6m`/`1h`/`1d` labels + cadence roll-forward (`relativeLabels.test.ts`) |
| `src/app/dashboard/home/home-page/useTickerItems.ts` | Builds the ticker's frames; owns the demo gate on providers + next routine |

## Data & state
- **Source:** Demo-only in this repo. `api` is a Proxy (`src/lib/api.ts:361`) that dispatches to `mockApi` whenever `useAuthStore.isDemo` is true; otherwise to `supabaseApi` (`NEXT_PUBLIC_DATA_SOURCE=supabase`) or `realApi` (orchestrator REST). Fixtures live in `src/lib/mock-dashboard-data.ts` (`MOCK_FLEET_RECOMMENDATION`, `MOCK_FLEET_EXECUTIONS`, `MOCK_HEALTH_ISSUES`, `MOCK_HEALTH_DIGEST`, `MOCK_SLA_BREACHES`, `MOCK_EXECUTION_HEATMAP`, `MOCK_LEADERBOARD`, `MOCK_UPCOMING_ROUTINES`, `MOCK_VAULT_CHANGES`, `MOCK_MODEL_PROVIDERS`, `SPARKLINE_SUCCESS`, `HEATMAP_DAYS = 7`) and `src/lib/mockApi.ts`.
- **One fleet, one truth:** the demo roster is projected from `MOCK_PERSONAS` into `FLEET` (`mock-dashboard-data.ts`), and every home fixture names/tints its agents from that list — there is no second roster. Magnitudes chain off one series too: `MOCK_DAILY_METRICS` (hand-tuned, deterministic, Σ 47 runs / 5 failures / $4.82 over 14 days) feeds `MOCK_OBSERVABILITY_METRICS`, the home traffic chart, `MOCK_FLEET_EXECUTIONS`, and the heatmap (each heatmap column sums to that day's chart value, split by each agent's `MOCK_PERSONA_SPEND.executionCount`). `MOCK_HEALTH_ISSUES` exists once, in `mock-dashboard-data.ts`, typed as `MockHealthIssue extends HealthIssue` so `mockApi.getObservability` serves the same array the cockpit reads.
- **Stores:** `authStore` (`user`, `isDemo`), `personaStore` (`personas`), `executionStore` (`fetchExecutions`, `useEnrichedExecutions`), `reviewStore` (`pendingReviewCount`, `reviews`, `fetchReviews`), `systemStore` (`health.workers.total`).
- **API routes:** No Next.js API routes of its own. Client calls `api.getObservabilityDaily`, `api.getObservabilityHealthIssues`, `api.listExecutions`, `api.listPersonas`; supabase path uses `getSyncedLeaderboard` / `getSyncedTriggers` from `src/lib/supabaseApi.ts`. SWR key `"observability:daily"` (`useDeferredObservability.ts`).
- **Types:** `GlobalExecution` (`src/lib/types.ts`), and from `mock-dashboard-data.ts`: `HeatmapRow`, `LeaderboardPersona`, `LeaderboardTrend`, `UpcomingRoutine`, `RoutineTrigger`, `VaultAction`, `SLABreach`; `TriageItem`/`TriageKind` (local to `useTriageQueue.ts`); `SyncedTrigger` from `supabaseApi.ts`.

## Integration points
- **Dashboard shell** — rendered inside the `/dashboard` layout (`src/app/dashboard/layout.tsx`) with `DashboardNavbar` + `DashboardNavigation`; nav label is `t.dashboard.overview`.
- **Shared primitives** — `GlowCard`, `GradientText`, `LazyMount`, `components/dashboard/*` (`StatBadge`, `Sparkline`, `PersonaAvatar`, `StatusBadge`, `EmptyState`, `SkeletonCard`, `StalenessIndicator`, `HealthDigestPanel`, `MemoryActionsPanel`, `FleetOptimizationCard`, `healthScoreColor`, `TrafficChart`), and `TourLauncher`. The `data-tour-diagram="dashboard-*"` anchors drive the guided dashboard tour (`DASHBOARD_TOUR_STEPS` in `src/lib/tour-script.ts`): `dashboard-fleet` (fleet card), `dashboard-vitals` (vitals console), `dashboard-activity` (activity stream), `dashboard-intelligence`/`dashboard-heatmap`/`dashboard-instruments` (instruments bay). Keep these anchors when restructuring — the audio sweep targets them.
- **Motion** — `fadeUp` / `staggerContainer` from `src/lib/animations.ts`; `RecentActivityCard`, `VitalsConsole` (success ring), and `StatusTicker` use `useReducedMotion`.
- **i18n** — namespaces `t.dashboard.*` and the nested `t.dashboard.home.{vitals,cockpit,heatmap,medals,errors,topPerformers,upcomingRoutines,vaultChanges}`. The cockpit's triage/vitals/ticker strings (including the pause/resume button's accessible name) live under `t.dashboard.home.cockpit`; podium ordinals under `…home.medals` (locale-specific ordinal forms: `1st` / `1.` / `1位` / `Nhất` …); the data hooks' no-message error fallbacks under `…home.errors`.
- **Format/util** — `relativeTime` from `src/lib/format.ts`; `usePageVisibility` hook; `DASHBOARD_LAST_VISIT_KEY` from `src/lib/constants.ts`.

## Conventions & gotchas
- **Demo-only:** every figure on this page is mock data in this repo. The orchestrator/supabase branches in the hooks exist but are dormant here.
- **i18n 14-locale lockstep:** any new key under `t.dashboard` / `t.dashboard.home` must be added to `en.ts` and hand-translated into all 13 other locales in the same commit. Non-Latin values may be written as `\uXXXX` escapes (matching existing entries) to sidestep the locale files' mojibake-on-disk hazard. Note `ExecutionHeatmapCard` deliberately derives weekday labels via `Intl.DateTimeFormat` (locale-aware) instead of new keys.
- **Semantic Tailwind tokens:** uses `text-foreground`, `text-muted-dark`, `border-glass`, `text-brand-cyan`, etc. Watch for raw-color drift — several cards use literal `bg-white/[0.04]`, `bg-cyan-500/8`, and accent hexes inline; new code should prefer tokens. Several `text-…` utilities sit at `/60`+ to stay above the WCAG-AA lint threshold.
- **Animation gating:** `RecentActivityCard`, `VitalsConsole`, and `StatusTicker` import `useReducedMotion` and disable looping/sweep motion when it's on (the success ring renders at its final offset; the ticker stops rotating and lays items out statically). The page-level `staggerContainer`/`fadeUp` are framer variants (no rAF), so no gating needed there.
- **React 19 purity:** impure date reads happen in lazy `useState(() => …)` initializers or inside effect callbacks, never in render or a `useMemo` factory — see `useGreeting.ts` and `useLiveClock.ts`. Anything that needs "now" during render takes it as a value from `useLiveClock` (the heatmap's weekday `useMemo` derives from that state, not `new Date()`). Timer effects use `queueMicrotask`/`setInterval` inside effects rather than calling `setState` synchronously in an effect body. `useTriageQueue` ranks deterministically inside a `useMemo` (no `Date.now`/`Math.random`).

**Real issues found:**
- **Determinism:** no `Math.random()` runs at module scope in either fixture file. `seededRandom` lives once, in `mockData.ts`, and `mock-dashboard-data.ts` imports it — every jittered series (tool usage, sparklines, heatmap noise) redraws identically on every reload. Add fixtures the same way.
- **Triage in real mode** — `useTriageQueue` sources SLA breaches + health incidents only in demo (no faithful synced source), so real mode shows just pending reviews. Consistent with the other illustrative panels, but worth revisiting if a real incidents source lands.
- **Comment vs. constant (benign):** the heatmap i18n subtitle hardcodes "last 7 days" while the grid uses `HEATMAP_DAYS = 7`; will drift if the constant changes.
- **Quick Links reach four distinct routes:** Agents / Observability / Executions / Settings. The third tile used to be a second "/dashboard/observability" link labelled "Usage Analytics"; usage numbers live one tab away inside Observability (its tabs are local state, so there is no per-tab route to link), and Executions was the only top-level section the rail didn't reach. The `usageAnalytics` / `toolUtilization` keys were removed from all 14 locales with it.
- **Open-alert count is demo-frozen:** `useOpenAlertCount` seeds from `MOCK_HEALTH_ISSUES` in demo and never refetches; the real branch fetches once on mount. No live polling for any vitals badge.

**Where to extend:** add below-fold cards inside `InstrumentsBay.tsx` (mind the demo/real grid-cols switch on the routines/vault row); add a triage source in `useTriageQueue.ts` or a counter in `VitalsConsole.tsx`; new telemetry data hooks should mirror the seed-from-mock-then-fetch pattern in `useTopPerformers.ts`.

## Related docs
- [Dashboard shell & chrome](shell-chrome.md)
- [Feature index](../INDEX.md)
