# Dashboard Shell, Chrome & Realtime
> The single-page app around every `/dashboard/*` view — the view outlet, the two-level menu, navbar, scope bar, mobile nav, skeletons, error boundaries, status chips, and the realtime sync provider. · **Route:** `/dashboard/*` (layout + `[view]`) · **Status:** Demo-only (mocks)

## What it does
The dashboard is a **single-page app**: one route (`/dashboard/[view]`) prerenders a static entry per view, and moving between views is a `history.pushState`, so the shell, the stores and the last few views you visited stay mounted. Concretely it provides:

- A **view outlet** (`spa/ViewOutlet.tsx`) that renders the view the URL names. Each view is its own lazy chunk, and up to four visited views are kept alive in React `<Activity>` boundaries: leaving one pauses its effects (polling, simulations) but keeps its state and scroll position, so going back is instant.

- A **top navbar** (`DashboardNavbar`) with the Personas logo, a "Dashboard" breadcrumb, a demo badge, and the signed-in identity / auth controls (sign out for real accounts, "Sign in" upgrade for demo).
- A **two-level menu on desktop**, modelled on the desktop app's sidebar: a rail of sections (icon over label: **Personas**, **Overview**, Messages, Director, Settings) and, for Overview, a level-2 panel of captioned groups: *Mission* (Mission Control, Reviews), *Monitoring* (Executions, Events, Observability), *Reliability* (Leaderboard, SLA, Incidents, Health), *Memory* (Knowledge). Personas is the main view and the default landing. On mobile a **bottom tab bar** shows the same views flattened (first 5 + a "More" menu). Badges show pending reviews, active executions, and (demo only) unread messages, open incidents and health alerts; the Overview rail item shows a dot when any of its views has one. The rail ends in a connection chip.
- A **scope bar** (`DashboardScopeBar`) on the data-heavy routes — persona filter, date-range presets, and a compare toggle — that every scoped page reads from a shared filter store.
- **Loading and failure chrome**: a full-page `DashboardSkeleton` (shown by `AuthGuard` while auth initializes), per-page `SkeletonCard`/`SkeletonChart` placeholders, a render-crash `DashboardErrorBoundary` with a copyable error id and retry cap, and an inline amber `DashboardErrorBanner` for non-fatal fetch failures.
- **Shared presentational primitives** reused across pages: `StatusBadge`, `StatBadge`, `StalenessIndicator`, `ConnectionStatusIndicator`, `EmptyState`, `Modal`, and `FleetOptimizationCard`.
- A **realtime sync layer** (`SyncedRealtimeProvider` → `useSyncedRealtime`) that — in live Supabase mode only — subscribes to Postgres change events and refetches the affected store within ~400 ms, plus a voice announcer for new reviews. In this repo's demo it's a no-op (mocks only).

## How it works
**Routing** — `src/app/dashboard/[view]/page.tsx` is a server component that returns `null`: `generateStaticParams` emits one static entry per id in `spa/views.ts` (`DASHBOARD_VIEW_IDS`) and `dynamicParams = false` makes anything else a 404. `src/app/dashboard/page.tsx` redirects to the default view (`personas`). `next.config.ts` redirects the retired `/dashboard/agents` and `/dashboard/playground` to `/dashboard/personas` (307).

**Layout composition** — `src/app/dashboard/layout.tsx` nests providers outside-in: `AuthProvider` → `AuthGuard` → `TourProvider` → (`SyncedRealtimeProvider` + the visible shell). The shell is a flex column: `DashboardNavbar` on top, then a flex row of `DashboardNavigation` (menu) and `<main id="main-content">` holding `ViewOutlet` (which also renders the route's own `children`: `null` for a view, the 404 for anything else). Padding drops for a `fullBleed` view.

**View outlet** — `spa/ViewOutlet.tsx` reads `usePathname()`, keeps an LRU list of visited views (updated during render, prev-state pattern) and renders them in fixed `DASHBOARD_VIEW_IDS` order, each in `<Activity mode="visible|hidden">` wrapped in its own `DashboardErrorBoundary` (reset when the view is shown again). The scope bar renders above the active view when `viewTraits(id).scoped`. Window scroll is saved per view and restored on return. Views come from `spa/viewRegistry.tsx`: one `next/dynamic({ ssr: false })` per view plus `preloadView(id)`, which the menu calls on hover/focus.

**Navigation** — `spa/navigate.tsx`: `navigateDashboard(href, { replace })` is a native `pushState`/`replaceState` (Next syncs it into `usePathname`/`useSearchParams`, no server round trip); `DashLink` is a real `<a href>` whose plain left click becomes that call (modified clicks keep the browser default). A plain `next/link` inside a view still works (a soft navigation to the same static route). The guided tour (`useTourNavigation`) moves between dashboard views with `replaceState`. The root `PageTransition` keys its wrapper with `transitionKey()`, which collapses every `/dashboard/*` path to one key; keying it on the full pathname remounted the whole dashboard on each view switch.

**Menu registry** — `navRegistry.ts` holds `navSections` (rail sections; Overview's `groups`), labels as `t.dashboard` keys. `DashboardNavigation.tsx` derives `useNavSections()` (translated, with each section's `href` = its view or first child), `useNavLeaves()` (flat list for mobile) and `useNavState()` (`isViewActive`, `isSectionActive`, `getBadge(view)`, `getSectionBadge(section)`, connection state). Scope-bar membership and full-bleed live with the view ids in `spa/views.ts`, not in the menu.

**Desktop vs mobile** — `DesktopSidebar` is sticky under the navbar: `SectionRail` (88px; icon over label, active bar, count or dot badge, `ConnectionChip`) and `SectionPanel` (224px; section title, group captions, children behind a left rule) shown only for an open section with groups. `MobileBottomNav` (`md:hidden`, fixed bottom, `z-50`) shows the views in `PHONE_BAR_VIEWS` (`navRegistry.ts`: Personas, Reviews, Notes, Executions, per PHASE2-SPEC 6.2) as tab buttons, in that order, plus a `MobileMoreMenu` for every other leaf in menu order. The More menu's open state is keyed to the current pathname so it auto-closes on navigation, and its overlay sits at `z-30` (below the `z-50` nav) so a tap on another tab both closes the menu *and* navigates in one touch — see the in-file comment for why.

**Error boundary** — `DashboardErrorBoundary` is a class component. On a render crash it generates an 8-char correlation id (`crypto.randomUUID().slice(0,8)`, with a `Math.random` fallback), shows `ErrorBoundaryFallback` (title, description, copy-id button, Retry), and reports to Sentry via `captureExceptionScrubbed` (PII-scrubbed per the CLAUDE.md mandate). `MAX_RETRIES = 3`: after the cap, Retry is replaced by a terminal message and Sentry capture stops (to avoid a retry-loop burning the Sentry quota / pinning CPU).

**Skeletons** — `DashboardSkeleton` is the whole-page placeholder (sidebar + 6-card grid) rendered by `AuthGuard` during `isLoading`. `SkeletonCard` / `SkeletonChart` are per-card placeholders that gate their shimmer/pulse on `useReducedMotion`; their randomized line widths / bar heights are computed once in a lazy `useState(() => …)` initializer (React 19 purity).

**Realtime** — `SyncedRealtimeProvider` renders nothing; it just runs `useSyncedRealtime()` and `useReviewVoice()`. `useSyncedRealtime` no-ops unless `NEXT_PUBLIC_DATA_SOURCE === "supabase"` **and** the user is authenticated **and** not demo. When active it opens one Supabase channel (`"synced-changes"`) subscribed to `postgres_changes` on five `synced_*` tables; each change debounces a 400 ms per-table refetch of the matching Zustand store. An `INSERT` on `synced_manual_reviews` also emits a new-review signal (`emitNewReview`) consumed by `useReviewVoice` for spoken announcements (with a `seen` set guarding socket-reconnect replays). Cleanup clears timers and removes the channel. RLS makes row isolation automatic; polling stays as a backstop.

## Key files
| File | Role |
| --- | --- |
| `src/app/dashboard/layout.tsx` | App shell — providers, navbar + menu + main composition, full-bleed padding |
| `src/app/dashboard/[view]/page.tsx` | One static entry per view (`generateStaticParams`), renders `null` |
| `src/components/dashboard/spa/views.ts` | View ids, default view, per-view traits (`scoped`, `fullBleed`), path helpers (server-safe) |
| `src/components/dashboard/spa/viewRegistry.tsx` | Lazy chunk per view, `preloadView` |
| `src/components/dashboard/spa/ViewOutlet.tsx` | Keep-alive outlet (`<Activity>`), per-view error boundary and scroll |
| `src/components/dashboard/spa/navigate.tsx` | `navigateDashboard`, `DashLink`, `handleDashLinkClick` |
| `src/components/dashboard/navRegistry.ts` | Menu data: sections and Overview's groups |
| `src/components/dashboard/DashboardNavbar.tsx` | Top bar — logo, breadcrumb, demo badge, identity, sign-in/out controls |
| `src/components/dashboard/DashboardNavigation.tsx` | `useNavSections` / `useNavLeaves` / `useNavState`, badges; renders both navs |
| `src/components/dashboard/DesktopSidebar.tsx` | Desktop two-level menu — section rail, level-2 panel, chunk preload on hover, connection chip |
| `src/components/dashboard/MobileBottomNav.tsx` | Mobile bottom tab bar — the `PHONE_BAR_VIEWS` tabs + `MobileMoreMenu` for the rest |
| `src/components/dashboard/DashboardSidebar.tsx` | Thin re-export: `export { default } from "./DashboardNavigation"` |
| `src/components/dashboard/DashboardScopeBar.tsx` | Persona filter + date-range presets + compare toggle (scoped routes only) |
| `src/components/dashboard/DashboardErrorBoundary.tsx` | Class error boundary — correlation id, scrubbed Sentry, `MAX_RETRIES=3` cap |
| `src/components/dashboard/DashboardErrorBanner.tsx` | Inline amber banner for non-fatal data-fetch errors (`{ message }`) |
| `src/components/dashboard/DashboardSkeleton.tsx` | Full-page loading placeholder (rendered by `AuthGuard`) |
| `src/components/dashboard/SkeletonCard.tsx` | Per-card / per-chart skeletons (`SkeletonCard`, `SkeletonChart`), reduced-motion gated |
| `src/components/dashboard/StatusBadge.tsx` | Pill for execution/review status (`BadgeStatus`) — running state pulses |
| `src/components/dashboard/StatBadge.tsx` | Accent-colored metric chip, optional `href` + pulse-on-increase |
| `src/components/dashboard/StalenessIndicator.tsx` | "Updated {n}s ago" chip from `fetchedAt`; tab-visibility-paused 10s tick |
| `src/components/dashboard/ConnectionStatusIndicator.tsx` | Dot for event-stream `connectionStatus` (connected/reconnecting/polling) |
| `src/components/dashboard/EmptyState.tsx` | Generic icon + title + description + action empty placeholder |
| `src/components/dashboard/Modal.tsx` | Shared modal primitive — backdrop, esc/click-out close, header/body/footer |
| `src/components/dashboard/FleetOptimizationCard.tsx` | Dismissible/expandable fleet recommendation banner (severity-styled) |
| `src/components/dashboard/SyncedRealtimeProvider.tsx` | Mounts `useSyncedRealtime` + `useReviewVoice`; renders nothing |
| `src/hooks/useSyncedRealtime.ts` | Supabase Realtime subscription → debounced per-store refetch + new-review signal |

## Data & state
- **Source:** Demo-only — all dashboard data comes from `src/lib/mockApi.ts` + `src/lib/mock-dashboard-data.ts`. `MOCK_UNREAD_MESSAGES = 7` feeds the messages nav badge. Live data (Supabase/orchestrator) is gated behind `NEXT_PUBLIC_DATA_SOURCE === "supabase"` and is not active in this repo.
- **Stores (Zustand):** `useAuthStore` (`isDemo`, `user`, sign-in/out, `isLoading`), `useSystemStore` (`health` → connection state, `fetchHealth`/`fetchStatus`), `useReviewStore` (`pendingReviewCount`), `useExecutionStore` (`activeCount`), `useEventStore` (`connectionStatus`, `fetchEvents`), `usePersonaStore` (`personas`, `fetchPersonas`), `useDashboardFilterStore` (`personaId`, `dateRange`, `compareEnabled` + setters; `DATE_RANGE_PRESETS`), `useReviewVoiceStore` (voice toggle). `useSyncedRealtime` calls each store's `fetch*` imperatively via `getState()`.
- **API routes:** None owned by the shell. Realtime goes directly over the Supabase websocket (`getSupabase().channel("synced-changes")`), not through `/api/*`. Live REST/SSE for pages lives in `src/lib/api.ts` and `src/app/api/*` (e.g. event/execution streams), gated by `NEXT_PUBLIC_ORCHESTRATOR_URL`.
- **Types:** `NavSectionDef` / `NavLeafDef` (`navRegistry.ts`), `NavSection` / `NavLeaf` (`DashboardNavigation.tsx`), `DashboardViewId` (`spa/views.ts`), `BadgeStatus` (`src/lib/types.ts`), `ConnectionStatus` = `"connected" | "reconnecting" | "polling"` (`src/stores/eventStore.ts`), `DateRangePreset` (`src/stores/dashboardFilterStore.ts`), `ReviewSeverity` (`src/lib/types.ts`), `FleetRecommendation` / `FleetRecommendationSeverity` (`src/lib/mock-dashboard-data.ts`), `RealtimeChannel` (`@supabase/supabase-js`).

## Integration points
- **Depends on:** `AuthProvider` / `AuthGuard` (the shell only mounts past auth init — `AuthGuard` shows `DashboardSkeleton` while loading, a session-error prompt, or `SignInPrompt`); `TourProvider` + `TourOverlay` (guided tour state persists across tab nav because the provider lives in the layout, not a page); `useTranslation()` for every label; `getSupabase()` for realtime; `captureExceptionScrubbed` / Sentry for crash + subscription errors; `usePageVisibility` (staleness tick) and `usePolling` (health every 30 s, in `AuthGuard`).
- **Depended on by:** Every `/dashboard/*` page renders inside this layout and inherits the navbar/nav/error-boundary. Scoped pages read `useDashboardFilterStore` (set by the scope bar) and reuse `StatBadge`, `StatusBadge`, `StalenessIndicator`, `ConnectionStatusIndicator`, `EmptyState`, `Modal`, `SkeletonCard`/`SkeletonChart`, and `DashboardErrorBanner`. Adding a view means: an id + traits in `spa/views.ts`, a loader in `spa/viewRegistry.tsx`, and an entry in `navRegistry.ts` (and `e2e/smoke-routes.ts`). `MobileTabBar` (`src/components/mobile/`) is a separate `/m` shell that also reads `MOCK_UNREAD_MESSAGES`.

## Conventions & gotchas
- **Level-2 links are only in the DOM while their section is open.** e2e walks (`smoke.spec.ts`, `review-undo.spec.ts`) must click Overview before an Overview view. The mobile bar hard-slices the flattened leaves `0–5` vs `5+`, so reordering the menu changes which views are primary on mobile.
- **Kept-alive views are hidden, not gone.** Up to four views sit in the DOM with `display: none`: a global `querySelector` from one view can find another view's element. Effects of hidden views are unmounted, so listeners added in effects are safe.
- **Don't key anything above the outlet on the pathname.** A pathname key (the old `PageTransition`) remounts the whole SPA on every view switch; use `transitionKey()`.
- **Scope traits are claims.** `scoped: true` shows the scope bar, but few views actually filter by `dashboardFilterStore` yet; Mission Control is unscoped and says which window it reads.
- **`StatusBadge` labels are hardcoded English, not i18n.** `statusConfig` in `StatusBadge.tsx` uses literal `"Queued"`, `"Running"`, `"Completed"`, etc. This violates the CLAUDE.md i18n rule (every user-facing string in `en.ts`). It is widely reused, so fixing it touches all 14 locales — flag before "just translating" inline.
- **Reduced-motion gating is honored unevenly.** `SkeletonCard`/`SkeletonChart`, `StatBadge`, `StatusBadge`, and `MobileBottomNav` all gate via `useReducedMotion`. But `DashboardNavbar` (header slide-in), `DashboardErrorBanner`, `DashboardScopeBar` (menu), `Modal`, and `FleetOptimizationCard` animate **unconditionally** — they don't import `useReducedMotion`. The lint rule only fires on `requestAnimationFrame`/`cancelAnimationFrame`, so framer-only motion isn't flagged; treat these as accessibility gaps, not lint-clean.
- **React 19 purity is followed correctly** where it matters: `SkeletonCard` randomized widths and `StalenessIndicator`'s `now` seed use lazy `useState(() => …)`; `StatBadge` uses the prev-state pattern (`if (value !== prevValue) setPrevValue(...)`) instead of `setState`-in-effect. Keep new chrome to this pattern.
- **Realtime is a no-op in this repo.** `useSyncedRealtime` short-circuits unless `NEXT_PUBLIC_DATA_SOURCE === "supabase"` and the user is real (non-demo). Since `/dashboard/*` is demo-only here, the channel never opens. Don't expect live updates in the demo — `StalenessIndicator` and the 30 s health poll are the only freshness signals.
- **Two different connection concepts.** The desktop sidebar footer reflects `useSystemStore.health.status` ("Connected/Disconnected" with worker count). `ConnectionStatusIndicator` reflects `useEventStore.connectionStatus` (the **event stream**: connected/reconnecting/polling). They are unrelated stores — don't conflate them.
- **`DashboardSidebar.tsx` is a one-line re-export** of `DashboardNavigation`. Edit the real logic in `DashboardNavigation.tsx`.
- **Error boundary is render-only.** It catches React render/lifecycle throws, not async fetch rejections — those surface through each store's `error` string and the inline `DashboardErrorBanner`. The `MAX_RETRIES=3` cap is intentional Sentry-quota / CPU protection; don't raise it without understanding the retry-loop cost noted in-file.
- **Mobile More-menu z-index is load-bearing.** Overlay `z-30` below nav `z-50` is a deliberate fix so a tap dismisses the menu *and* navigates in one touch (commented in `MobileBottomNav.tsx`). Don't "tidy" the z-order.

## Related docs
- [Dashboard Home Overview](home-overview.md)
- [Feature index](../INDEX.md)
