# Dashboard Shell, Chrome & Realtime — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. Connection status indicator is blind to the actual realtime transport (success theater)
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: success-theater / wrong-status
- **File**: src/hooks/useSyncedRealtime.ts:140 ; src/components/dashboard/ConnectionStatusIndicator.tsx:28 ; src/stores/eventStore.ts:89
- **Scenario**: A signed-in supabase-mode user is on `/dashboard/events`. The real live transport is the Supabase channel from `useSyncedRealtime`, but the green/amber/grey dot in the header reads `eventStore.connectionStatus`, which `useSyncedRealtime` never writes. `channel.subscribe()` is called with no `(status, err) => …` callback, so `CHANNEL_ERROR` / `TIMED_OUT` / `CLOSED` transitions are dropped on the floor.
- **Root cause**: Two independent transports (SSE `useEventStream` and Supabase `useSyncedRealtime`) feed the same UI, but only the SSE hook sets `connectionStatus`. The indicator's "connected/reconnecting/polling" is decoupled from the socket that is actually delivering data in supabase mode.
- **Impact**: Connection dot reports a state unrelated to the live socket — shows "polling" (initial value) while Realtime is healthy, or stays "connected" after the Supabase channel errors. Users trust a dot that is decorative. False confidence + masked outage.
- **Fix sketch**: Pass a status callback to `channel.subscribe((status, err) => setConnectionStatus(mapSupabaseStatus(status)))` and call `useEventStore.getState().setConnectionStatus(...)` on `SUBSCRIBED`/`CHANNEL_ERROR`/`TIMED_OUT`/`CLOSED`; on the error branch also schedule a poll backstop.

## 2. Stale "connected" dot after the SSE-mounting panel unmounts (tab switch leaves indicator lying)
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: stale-state / lifecycle
- **File**: src/app/dashboard/events/page.tsx:45-90 ; src/components/dashboard/EventsListPanel.tsx:46 ; src/hooks/useEventStream.ts:159-166
- **Scenario**: `ConnectionStatusIndicator` lives in the page header (always mounted). The SSE lifecycle (`useEventStream`) is mounted *only inside* `EventsListPanel`, which renders only when `pageTab === "events"`. Switching to Subscriptions / Swimlane / Visualization unmounts `EventsListPanel`, whose cleanup closes the EventSource — but the store's `connectionStatus` is left at its last value (`"connected"`). The header keeps showing a glowing green "Connected" dot while no stream is open.
- **Root cause**: Connection ownership is bound to a conditionally-rendered child, but the status display outlives it. Teardown frees the socket without resetting the shared status, so the indicator advertises a connection that no longer exists.
- **Impact**: UX/trust degradation — the always-visible status badge contradicts reality on 3 of 4 tabs. Compounds finding #1.
- **Fix sketch**: On `useEventStream` cleanup, `setStatusRef.current("polling")`; or hoist `useEventStream()` to the events page (always mounted) instead of `EventsListPanel`, so the indicator's lifetime matches the stream's.

## 3. Error boundary in dashboard layout never resets on route change — one crash poisons every sibling route
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: error-recovery correctness
- **File**: src/components/dashboard/DashboardErrorBoundary.tsx:37-99 ; src/app/dashboard/layout.tsx:50-55
- **Scenario**: The boundary wraps `{children}` in the persistent dashboard `layout.tsx`. React keeps the same boundary instance across client-side route navigations (same tree position). A render crash on `/dashboard/observability` sets `hasError=true`; the user clicks a sidebar link to `/dashboard/home` (sidebar is outside the boundary, so navigation works) — but `hasError` is still `true`, so the healthy home route renders the fallback. There is no `resetKeys`/pathname-derived reset; the only escape is the Retry button (capped at 3) or a full reload.
- **Root cause**: The boundary assumes the only recovery vector is in-place Retry. It has no awareness of `pathname`, so a successful navigation away from the broken route doesn't clear the error — a long-lived boundary treats a transient per-route crash as global.
- **Impact**: A crash on any one dashboard route makes the *entire* dashboard appear broken until hard reload. High blast radius (this is shared chrome across all routes). The retry cap (`MAX_RETRIES=3`) makes it worse: after 3 retries the user is stuck on a permanent fallback even though other routes are fine.
- **Fix sketch**: Make the boundary `pathname`-aware: in the parent, key it (`<DashboardErrorBoundary key={pathname}>`) or pass `resetKeys={[pathname]}` and clear `hasError`/`retryCount` in `componentDidUpdate` when the key changes, so navigating to a new route gives it a clean slate.

## 4. Zero test coverage for realtime sync, error-boundary recovery, and connection-status logic
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing test harness / risk-weighted coverage gap
- **File**: e2e/ (no spec) ; src/hooks/useSyncedRealtime.ts ; src/components/dashboard/DashboardErrorBoundary.tsx ; src/hooks/useEventStream.ts
- **Scenario**: The highest-risk shared-chrome logic — Supabase subscription/cleanup/reconnect, the announce-dedup `seen` set, debounce-timer teardown, SSE exponential backoff + double-socket guards, error-boundary retry cap, and connection-status transitions — has no automated test. The repo has Playwright e2e only (`e2e/*.spec.ts`), and none touch these; there is **no unit/component runner (no vitest/jest)**, so the hook lifecycle and the class-component recovery path are untestable as written.
- **Root cause**: The project bet entirely on browser-level e2e, but socket lifecycles, timer cleanup, and error-boundary state machines are exactly the logic that e2e cannot reach deterministically (needs fake timers, a mocked Supabase channel, and a controllable throwing child).
- **Impact**: False-confidence — bugs #1–#3 (and any future reconnect-leak / double-subscribe regression) can ship undetected. The most-shared, highest-blast-radius code is the least guarded.
- **Fix sketch**: Add a component/unit runner (vitest + Testing Library + fake timers); cover: subscribe→unmount removes channel & clears all debounce timers, reconnect doesn't re-announce a `seen` review, status callback maps Supabase states, error boundary renders fallback → Retry recovers → caps at 3, and pathname change resets the boundary.

## 5. Realtime reconnect/visibility-resume does not refresh stores, so the dot is the only reconnect signal
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: stale-data on reconnect
- **File**: src/hooks/useSyncedRealtime.ts:122-144 ; src/hooks/useEventStream.ts:126-153
- **Scenario**: In supabase mode, the channel reconnects after a network blip or tab-wake. Supabase Realtime does NOT replay `postgres_changes` events missed while the socket was down. `useSyncedRealtime` only refetches when a *new* change event arrives; it has no on-(re)subscribe refetch and no `visibilitychange` resume fetch (unlike `useEventStream`, which fetches on visibility). So rows changed during the disconnect window are silently missing until the next unrelated change or poll tick.
- **Root cause**: The hook assumes "subscription is live ⇒ store is current," but a reconnect creates a gap the live socket never backfills. Polling is described as the backstop, but `useSyncedRealtime` itself starts no polling and isn't tab-wake aware.
- **Impact**: Dashboard shows stale personas/executions/reviews after any reconnect or background→foreground transition until the slow poll fires — degraded data freshness on the exact event (reconnect) the realtime layer exists to handle.
- **Fix sketch**: On `SUBSCRIBED` (initial and re-subscribe) run a one-shot refetch of all watched stores; add a `visibilitychange` listener that refetches on `visible`, mirroring `useEventStream`'s resume behavior.
