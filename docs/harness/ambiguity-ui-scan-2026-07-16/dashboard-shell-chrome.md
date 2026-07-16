# Dashboard Shell, Chrome & Realtime — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. Nav badges silently mix live store counts with hardcoded mock counts for real users
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: mock-data-presented-as-real
- **File**: `src/components/dashboard/DashboardNavigation.tsx:77`
- **Scenario**: Any signed-in (non-demo) user opens the dashboard. The sidebar badges for Reviews and Executions come from real stores (`pendingReviewCount`, `activeCount`), but Messages, Incidents, and Health badges come from `MOCK_UNREAD_MESSAGES` (hardcoded `7`), `MOCK_OPEN_INCIDENTS`, and `MOCK_HEALTH_ALERTS` in `mock-dashboard-data.ts` — unconditionally, in every data-source mode.
- **Root cause**: `getBadge` was written for "desktop parity" demo visuals and never gated on `isDemo` / data-source mode. There is no recorded decision that real tenants should see fabricated counts, and nothing in the component signals which badges are real.
- **Impact**: A real user permanently sees "7 unread messages" and N open incidents that don't exist in their tenant. Alarm badges (Health, Incidents) are exactly the kind of signal users act on; fabricating them erodes trust in the ones that ARE real, and the constant `7` never clears no matter what the user does.
- **Fix sketch**: In `useNavState`, gate the three mock-backed badges on `useAuthStore.getState().isDemo` (or the `NEXT_PUBLIC_DATA_SOURCE` mode): return the mock values only in demo mode, `null` (or a real store selector once one exists) otherwise. Add a one-line comment recording the decision so the next reader knows which badges are demo-only.

## 2. StatusBadge labels are hardcoded English in a 15-locale app
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: i18n-hardcoded-strings
- **File**: `src/components/dashboard/StatusBadge.tsx:11`
- **Scenario**: A user with any non-English locale (the app ships cs, de, es, fr, ja, zh, ar, … — 15 locales, and every sibling chrome component calls `useTranslation`) views executions, events, or reviews. Every status chip renders English: "Queued", "Running", "Completed", "Processed", "Failed", "Cancelled", "Pending", "Approved", "Rejected".
- **Root cause**: `statusConfig` bakes `label` strings into the component instead of i18n keys, unlike `ConnectionStatusIndicator` which correctly reads `t.eventsPage.connectionStatus[status]`. StatusBadge is used across all dashboard list surfaces, so the miss is highly visible.
- **Impact**: The most repeated piece of text in the dashboard (a status chip appears on nearly every row of every list) stays untranslated, making localization look broken; screen-reader users in other locales hear mixed-language content.
- **Fix sketch**: Replace `label: string` with a `labelKey` and resolve via `useTranslation` (e.g. `t.dashboard.status[status]`); add the 9 keys to `en.ts` and the 14 sibling locale files (note the lefthook-style key-parity expectations). The color/pulse config stays as-is.

## 3. Two contradictory "connection" indicators, and the sidebar shows red "Disconnected" before the first health fetch resolves
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: conflicting-status-sources
- **File**: `src/components/dashboard/DesktopSidebar.tsx:71`
- **Scenario**: (a) On every cold dashboard load, `useSystemStore.health` is `null`, so `isConnected = health?.status === "ok"` is `false` and the sidebar footer flashes a red WifiOff + "Disconnected" until `fetchHealth` returns — a false alarm on the happy path with no loading state. (b) Meanwhile `ConnectionStatusIndicator` derives its dot from a different source entirely (`eventStore.connectionStatus`, driven by the Supabase Realtime socket in `useSyncedRealtime.ts:143`). The two chrome indicators can permanently disagree — e.g. Realtime "connected" (green dot) while the sidebar says "Disconnected", or sidebar "Connected" while Realtime is in "reconnecting".
- **Root cause**: "Connected" has no single defined meaning: one widget means "last health poll said ok", the other means "Realtime socket subscribed". Neither component documents which truth it reports, and `null` health (not-yet-fetched) is conflated with unhealthy.
- **Impact**: Red "Disconnected" is the strongest alarm in the chrome; flashing it on every load trains users to ignore it, and two indicators that disagree make real outages undiagnosable ("is it down or not?"). Minor bonus smell at line 80: worker count reuses `t.dashboardUi.weekAbbr` ("w") as a "workers" abbreviation — a semantically wrong key that will mistranslate if any locale localizes "week".
- **Fix sketch**: Treat `health === null` as a third "checking" state (muted dot/spinner, not red). Then pick one source of truth for the footer — simplest is to reuse `eventStore.connectionStatus` (already tri-state: connected/reconnecting/polling) or a small selector combining socket + health, and label it precisely ("Backend healthy" vs "Live updates"). Add a dedicated `workersAbbr` i18n key.

## 4. ErrorBoundary's Sentry retry-cap guard is unreachable dead code (off-by-one vs the UI cap)
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: dead-guard-contradicts-comment
- **File**: `src/components/dashboard/DashboardErrorBoundary.tsx:55`
- **Scenario**: A dashboard page crashes repeatedly. The fallback stops offering Retry once `retryCount >= MAX_RETRIES` (3, `render`/line 108), so `retryCount` can never exceed 3 — `handleRetry` is the only increment. Yet `componentDidCatch` suppresses Sentry only when `retryCount > MAX_RETRIES` (line 55), a condition that can never be true.
- **Root cause**: Off-by-one between the two comparisons (`>` vs `>=`) against the same constant, hidden behind a long comment that promises quota protection ("could otherwise burn through the project's daily Sentry quota") the code can't actually deliver on its stated boundary. The only crash-loop the cap was written for — errors that re-throw without a user click — never increments `retryCount` at all, so those aren't capped either.
- **Impact**: Low practical harm today (max 4 events per boundary per route), but the comment documents a protection that doesn't exist, and the real uncapped path (automatic re-render crash loops via `resetKey` churn or parent re-renders, which fire `componentDidCatch` without touching `retryCount`) is exactly the scenario the comment worries about.
- **Fix sketch**: Decide the intended semantics and record it: either change the guard to `>= MAX_RETRIES` (suppress the post-terminal event) or count *catches* rather than *retries* (increment a `catchCount` in `componentDidCatch` and cap on that), which also covers automatic crash loops. Delete or correct the misleading comment.

## 5. SCOPED_ROUTE_PREFIXES is a hand-maintained shadow of navItemDefs with no sync rule
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: duplicate-route-registry-drift
- **File**: `src/app/dashboard/layout.tsx:14`
- **Scenario**: A developer adds a new dashboard route (the nav registry `navItemDefs` in `DashboardNavigation.tsx:27` already has 13 entries; the scope list has 10). Nothing tells them the scope bar exists or that this second list must be updated — the new page silently renders without the persona/date-range scope bar, or conversely inherits it when its data ignores those filters.
- **Root cause**: Which routes are "scoped" is a real product decision (incidents/health/settings intentionally excluded?) but it's encoded as a bare string array with no comment explaining the inclusion criterion and no structural link to `navItemDefs` — two registries for the same routes, one of them undocumented.
- **Impact**: Guaranteed drift over time: a page whose data respects `dashboardFilterStore` but never shows the scope bar gives users no way to see or change the active filter (invisible filtering — worse than no filtering), and the reverse shows controls that do nothing.
- **Fix sketch**: Make scope membership a property of the single registry: add `scoped: boolean` to each `navItemDefs` entry (with a one-line comment stating the criterion, e.g. "pages whose data respects dashboardFilterStore"), derive `SCOPED_ROUTE_PREFIXES` from it, and keep the extra non-nav prefix cases (if any) explicit. A trivial unit test asserting every scoped prefix exists in `navItemDefs` would also stop drift.
