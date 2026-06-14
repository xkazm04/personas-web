# Dashboard Shell, Chrome & Realtime
> The persistent frame around every `/dashboard/*` page — navbar, sidebars, scope bar, mobile nav, skeletons, error boundary, status chips, and the realtime sync provider. · **Route:** `/dashboard/*` (layout) · **Status:** Demo-only (mocks)

## What it does
This is the chrome that wraps **all** dashboard routes: the bits that stay on screen while you move between Overview, Agents, Executions, and the rest. Concretely it provides:

- A **top navbar** (`DashboardNavbar`) with the Personas logo, a "Dashboard" breadcrumb, a demo badge, and the signed-in identity / auth controls (sign out for real accounts, "Sign in" upgrade for demo).
- A **left sidebar on desktop** and a **bottom tab bar on mobile** (`DashboardNavigation` → `DesktopSidebar` + `MobileBottomNav`), both driven by one shared registry of 11 nav routes. Live badges show pending-review count, active-execution count, and unread messages. The desktop sidebar has a connection-status footer; the mobile bar shows the first 5 items plus a "More" menu for the rest.
- A **scope bar** (`DashboardScopeBar`) on the data-heavy routes — persona filter, date-range presets, and a compare toggle — that every scoped page reads from a shared filter store.
- **Loading and failure chrome**: a full-page `DashboardSkeleton` (shown by `AuthGuard` while auth initializes), per-page `SkeletonCard`/`SkeletonChart` placeholders, a render-crash `DashboardErrorBoundary` with a copyable error id and retry cap, and an inline amber `DashboardErrorBanner` for non-fatal fetch failures.
- **Shared presentational primitives** reused across pages: `StatusBadge`, `StatBadge`, `StalenessIndicator`, `ConnectionStatusIndicator`, `EmptyState`, `Modal`, and `FleetOptimizationCard`.
- A **realtime sync layer** (`SyncedRealtimeProvider` → `useSyncedRealtime`) that — in live Supabase mode only — subscribes to Postgres change events and refetches the affected store within ~400 ms, plus a voice announcer for new reviews. In this repo's demo it's a no-op (mocks only).

## How it works
**Layout composition** — `src/app/dashboard/layout.tsx` nests providers outside-in: `AuthProvider` → `AuthGuard` → `TourProvider` → (`SyncedRealtimeProvider` + the visible shell). The shell is a flex column: `DashboardNavbar` on top, then a flex row of `DashboardNavigation` (sidebar/mobile nav) and a `<main id="main-content">`. Inside `main`, a `DashboardErrorBoundary` wraps a `max-w-7xl` container holding the optional scope bar and the route's `children`.

**Scope-bar gating** — the layout keeps a `SCOPED_ROUTE_PREFIXES` array (`layout.tsx:14`) and renders `<DashboardScopeBar />` only when `usePathname()` matches one (exact or `prefix/…`). Note: `settings`, `leaderboard`, and `knowledge` are intentionally **absent** from this list (so the scope bar does not show there) even though they appear in the nav registry. The scoped list and the nav registry are two separate sources of truth.

**Nav registry** — `DashboardNavigation.tsx:25` exports `navItemDefs`, the single ordered list of **11** items (`key`, `labelKey`, lucide `icon`, `href`). `useNavItems()` maps each to a translated `label` via `t.dashboard[labelKey]`. `useNavState()` computes per-item `getActive(item)` (active when pathname equals or starts with `href`; `/dashboard` and `/dashboard/home` both light up "home") and `getBadge(item)`:
- `reviews` → `useReviewStore.pendingReviewCount` (when > 0)
- `executions` → `useExecutionStore.activeCount` (when > 0)
- `messages` → `MOCK_UNREAD_MESSAGES` (a fixed `7` constant in mock data)

`isConnected` is derived from `useSystemStore.health?.status === "ok"`.

**Desktop vs mobile** — `DesktopSidebar` renders all 11 items as a vertical rail (`hidden … md:flex`), prefetches the current/prev/next routes on hover (`prefetchAdjacent`), and has a footer connection chip (animated Wi-Fi ping when connected, worker count, or a red "disconnected" state). `MobileBottomNav` (`md:hidden`, fixed bottom, `z-50`) shows `navItems.slice(0, 5)` as tab buttons plus a `MobileMoreMenu` for `slice(5)` (the remaining 6). The More menu's open state is keyed to the current pathname so it auto-closes on navigation, and its overlay sits at `z-30` (below the `z-50` nav) so a tap on another tab both closes the menu *and* navigates in one touch — see the in-file comment for why.

**Error boundary** — `DashboardErrorBoundary` is a class component. On a render crash it generates an 8-char correlation id (`crypto.randomUUID().slice(0,8)`, with a `Math.random` fallback), shows `ErrorBoundaryFallback` (title, description, copy-id button, Retry), and reports to Sentry via `captureExceptionScrubbed` (PII-scrubbed per the CLAUDE.md mandate). `MAX_RETRIES = 3`: after the cap, Retry is replaced by a terminal message and Sentry capture stops (to avoid a retry-loop burning the Sentry quota / pinning CPU).

**Skeletons** — `DashboardSkeleton` is the whole-page placeholder (sidebar + 6-card grid) rendered by `AuthGuard` during `isLoading`. `SkeletonCard` / `SkeletonChart` are per-card placeholders that gate their shimmer/pulse on `useReducedMotion`; their randomized line widths / bar heights are computed once in a lazy `useState(() => …)` initializer (React 19 purity).

**Realtime** — `SyncedRealtimeProvider` renders nothing; it just runs `useSyncedRealtime()` and `useReviewVoice()`. `useSyncedRealtime` no-ops unless `NEXT_PUBLIC_DATA_SOURCE === "supabase"` **and** the user is authenticated **and** not demo. When active it opens one Supabase channel (`"synced-changes"`) subscribed to `postgres_changes` on five `synced_*` tables; each change debounces a 400 ms per-table refetch of the matching Zustand store. An `INSERT` on `synced_manual_reviews` also emits a new-review signal (`emitNewReview`) consumed by `useReviewVoice` for spoken announcements (with a `seen` set guarding socket-reconnect replays). Cleanup clears timers and removes the channel. RLS makes row isolation automatic; polling stays as a backstop.

## Key files
| File | Role |
| --- | --- |
| `src/app/dashboard/layout.tsx` | Layout shell — providers, navbar+sidebar+main composition, scope-bar gating (`SCOPED_ROUTE_PREFIXES`) |
| `src/components/dashboard/DashboardNavbar.tsx` | Top bar — logo, breadcrumb, demo badge, identity, sign-in/out controls |
| `src/components/dashboard/DashboardNavigation.tsx` | Nav registry (`navItemDefs`, 11 items), `useNavItems`/`useNavState`, badges; renders both navs |
| `src/components/dashboard/DesktopSidebar.tsx` | Desktop left rail — all 11 items, hover prefetch, connection footer |
| `src/components/dashboard/MobileBottomNav.tsx` | Mobile bottom tab bar — first 5 items + `MobileMoreMenu` for the rest |
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
- **Types:** `NavItemDef` / `NavItem` (`DashboardNavigation.tsx`), `BadgeStatus` (`src/lib/types.ts`), `ConnectionStatus` = `"connected" | "reconnecting" | "polling"` (`src/stores/eventStore.ts`), `DateRangePreset` (`src/stores/dashboardFilterStore.ts`), `ReviewSeverity` (`src/lib/types.ts`), `FleetRecommendation` / `FleetRecommendationSeverity` (`src/lib/mock-dashboard-data.ts`), `RealtimeChannel` (`@supabase/supabase-js`).

## Integration points
- **Depends on:** `AuthProvider` / `AuthGuard` (the shell only mounts past auth init — `AuthGuard` shows `DashboardSkeleton` while loading, a session-error prompt, or `SignInPrompt`); `TourProvider` + `TourOverlay` (guided tour state persists across tab nav because the provider lives in the layout, not a page); `useTranslation()` for every label; `getSupabase()` for realtime; `captureExceptionScrubbed` / Sentry for crash + subscription errors; `usePageVisibility` (staleness tick) and `usePolling` (health every 30 s, in `AuthGuard`).
- **Depended on by:** Every `/dashboard/*` page renders inside this layout and inherits the navbar/nav/error-boundary. Scoped pages read `useDashboardFilterStore` (set by the scope bar) and reuse `StatBadge`, `StatusBadge`, `StalenessIndicator`, `ConnectionStatusIndicator`, `EmptyState`, `Modal`, `SkeletonCard`/`SkeletonChart`, and `DashboardErrorBanner`. Adding a route means appending to `navItemDefs` and (if it should show the scope bar) to `SCOPED_ROUTE_PREFIXES`. `MobileTabBar` (`src/components/mobile/`) is a separate `/m` shell that also reads `MOCK_UNREAD_MESSAGES`.

## Conventions & gotchas
- **`navItemDefs` is the registry, but two lists drift.** Nav order ≠ scope-bar coverage. `SCOPED_ROUTE_PREFIXES` (layout) omits `settings`, `leaderboard`, and `knowledge`; the mobile bar hard-slices `0–5` vs `5+`. Reordering `navItemDefs` silently changes which 5 items are primary on mobile **and** can move a route across the scope-bar boundary — update all three deliberately.
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
