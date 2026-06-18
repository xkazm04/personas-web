# Authentication & User Session — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 2, Low: 0)

> **Prior-critical verification (2026-05-10 Finding #1 — `signInAsDemo` reachable in production):**
> The earlier report flagged a `!DEVELOPMENT`-gated "Try Demo" button + an un-gated `signInAsDemo` as a production auth bypass. **The current code has been deliberately re-architected so this is no longer a bypass.** There is no `DEVELOPMENT`/`NEXT_PUBLIC_USE_MOCK_API` flag anywhere in these files. Demo is now an *explicit, always-available product surface* (`SignInPrompt` docstring; `/demo` standalone route; `authStore.signInAsDemo`/`enterDemo`). Crucially, the API data-plane no longer keys off the token value — `api.ts:362-368` dispatches to `mockApi` strictly when `isDemo === true`, so the `mock-token-dev` string is never sent to the real orchestrator (it would only be sent if `isDemo` were false, which the demo path never produces). The prior High cache-leak findings (#2 SWR string-key wipe, #3 `systemStore.reset`, #4 `dashboardFilterStore.reset` + localStorage clear) are **all fixed** in the current code. The residual risk has shifted from "auth bypass" to "the `isDemo` gate is unprotected by any test and is fragile across reloads" — see Findings 1–3.

---

## 1. The demo-vs-real data-plane gate (`isDemo`) and the auth gate have zero automated coverage
- **Severity**: High
- **Lens**: test-mastery
- **Category**: Missing quality gate / security-critical coverage gap
- **File**: src/lib/api.ts:362-368, src/stores/authStore.ts:181-195, src/components/dashboard/AuthGuard.tsx:15-41
- **Scenario**: A future refactor flips the `api.ts` Proxy to dispatch on `accessToken === MOCK_TOKEN` instead of `isDemo`, or adds a new sign-in path that sets `isAuthenticated: true` without setting `isDemo`, or makes `AuthGuard` mount on a half-initialized store. Any of these silently routes a demo visitor to the **real** orchestrator (sending `X-User-Token: mock-token-dev`) or routes a real user to mock data — and nothing fails in CI.
- **Root cause**: There is **no unit test runner at all** (package.json has only `test:e2e` → Playwright; no vitest/jest). The single most security-sensitive branch in the app — "does this session hit mock data or production data?" — lives in a one-line Proxy with no test pinning the `isDemo → mockApi`, `!isDemo → realApi/supabaseApi` contract, and no test asserting `AuthGuard` blocks unauthenticated render.
- **Impact**: false-confidence / security — the demo/prod isolation that *replaced* the prior Critical is itself unguarded, so a regression reintroduces the bypass with green CI.
- **Fix sketch**: Add a unit harness (vitest + jsdom). Pin: `api` Proxy returns `mockApi` iff `isDemo`; `signInAsDemo`/`enterDemo` set `isDemo:true` + mock token together; `mockSignOut` clears all three of `user`/`accessToken`/`isAuthenticated`. Treat these as a CI gate.

## 2. `AuthGuard` authorizes on `isAuthenticated` alone — a mock/demo session is indistinguishable from a real one
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: Auth gate / weak invariant
- **File**: src/components/dashboard/AuthGuard.tsx:37-41, src/lib/mockAuth.ts:22-24
- **Scenario**: Any code path that sets `isAuthenticated: true` (today: real OAuth, optimistic localStorage hydration, `mockSignIn`) immediately mounts the full `/dashboard` shell. `mockSignIn` sets `isAuthenticated:true` + `accessToken:"mock-token-dev"` but the guard never inspects the token, `isDemo`, or session validity — it only reads the boolean. The safety of "demo never touches prod APIs" rests entirely on a *separate* flag (`isDemo`) staying in lockstep with `isAuthenticated` in every present and future code path.
- **Root cause**: The guard conflates "a flag is set" with "a verified session exists." This is the exact architectural assumption the 2026-05-10 Critical exploited; the data-plane isolation moved to `api.ts`, but the *gate* still trusts a single mutable boolean that any helper can flip.
- **Impact**: security — a single future store mutation (or hydration race writing `isAuthenticated:true` from a tampered optimistic payload) mounts the gated dashboard with no real session, and the only thing preventing real-API access is an unrelated flag.
- **Fix sketch**: Gate on a richer predicate — e.g. require `accessToken && (isDemo || sessionVerified)` and have the guard refuse to mount when `accessToken === MOCK_TOKEN` while `isDemo === false`. Add the regression test from Finding 1.

## 3. Demo session is lost on any hard reload of `/dashboard` (`isDemo` is in-memory only)
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: Session persistence / UX degradation
- **File**: src/stores/authStore.ts:64-75, 77-99, 181-195
- **Scenario**: User clicks "Try Demo" (or lands via `/demo`), explores `/dashboard/home`, then hits F5 / shares the dashboard URL / a Sentry-triggered reload occurs. `authStore` has **no `persist` middleware**, so `isDemo`, `isAuthenticated`, and the mock user all reset to their initial in-memory defaults. On reload `initialize()` runs the real-auth branch (`getSupabase()`), the demo is gone, and the user is dropped to `SignInPrompt` (or, if Supabase is unconfigured, the unauthenticated gate) — mid-demo, with no explanation.
- **Root cause**: Demo state is deliberately in-memory ("never re-run real auth over it" only holds for a remount, not a reload). `/demo`'s `enterDemo()` sets `initialized:true` to survive the client redirect, but nothing survives a full page load. A deep link straight to `/dashboard/home` was never in demo mode to begin with.
- **Impact**: UX degradation — the shareable/always-on demo silently collapses on reload or when the dashboard URL is opened directly, undercutting the "demo is always available" guarantee.
- **Fix sketch**: Persist a minimal demo marker (e.g. `sessionStorage["personas-demo"] = "1"` set in `signInAsDemo`/`enterDemo`, cleared in `signOut`) and re-enter demo at the top of `initialize()` when present, before the Supabase branch.

## 4. No cross-tab sign-out — a second tab keeps rendering the previous user (or demo) after logout
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: Multi-tab consistency / privacy
- **File**: src/stores/authStore.ts:225-266, 152-170
- **Scenario**: User opens `/dashboard` in tab A and tab B. They sign out in tab A. `clearUserScopedCaches()` and store-clear run in tab A only. Tab B's in-memory `authStore` still holds `isAuthenticated:true` + the user, keeps polling health every 30s (`AuthGuard` `usePolling`), and shows the avatar/data. For a real Supabase session, `onAuthStateChange` *may* fire cross-tab, but for a **demo** session `mockSignOut` mutates only the local Zustand store — there is no `storage`/`BroadcastChannel` notification, so tab B never learns.
- **Root cause**: Sign-out is treated as a tab-local store mutation. There is no `window.addEventListener("storage", ...)` on the Supabase auth-token key and no `BroadcastChannel("auth")` for the demo path.
- **Impact**: security/privacy — on a shared or kiosk device, the next person can re-focus tab B and continue as the prior user; the cache-clear mechanism is defeated by tab-locality.
- **Fix sketch**: In `initialize()`, add a `storage` listener that calls `signOut()` (local-clear path) when the `sb-*-auth-token` key is removed, and broadcast demo sign-out over a `BroadcastChannel("auth")` that all tabs subscribe to.

## 5. Optimistic-session validator accepts any far-future `expires_at` and any non-empty token string
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: Untrusted-input validation / stale session
- **File**: src/stores/authStore.ts:18-37, 105-127
- **Scenario**: A stale tab from days ago, a misbehaving extension, or local tampering leaves an `sb-<ref>-auth-token` payload with `expires_at = Number.MAX_SAFE_INTEGER`, a real-looking-but-dead `access_token`, and a string `user.id`. `validateOptimisticSession` returns it (only checks `expiresAt > now` and `accessToken.length > 0`), so `initialize()` synchronously sets `isAuthenticated:true`. The dashboard mounts and fires user-scoped SWR fetches with the bogus token before the async `getSession()` round-trip can clear it; on a slow/hung network the optimistic state can persist indefinitely.
- **Root cause**: The validator does a type/shape check but no *plausibility* bound (no `expires_at < now + N days`, no `refresh_token` presence, no JWT/`iss` sanity), and there is no hard timeout on the confirming `getSession()` call.
- **Impact**: security (brief unauthorized-token API burst + 401 noise / Sentry events) and UX (indefinite optimistic-authed state on a hung `getSession`).
- **Fix sketch**: Bound `expires_at` (`< now + 7*86400`), require a non-empty `refresh_token`, and add a ~5s timeout to `getSession()` that falls back to `isAuthenticated:false`.
