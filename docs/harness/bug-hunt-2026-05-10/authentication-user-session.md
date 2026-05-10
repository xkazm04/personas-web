# Bug Hunter — Authentication & User Session

> Total: 8 findings (Critical: 1, High: 3, Medium: 3, Low: 1)
> Scope: 9 files
> Date: 2026-05-10

---

## 1. `signInAsDemo` is reachable in production and bypasses real auth

- **Severity**: Critical
- **Category**: Security / Auth bypass
- **File**: `src/components/dashboard/SignInPrompt.tsx:129-137`, `src/stores/authStore.ts:177-180`, `src/lib/mockAuth.ts:25-27`
- **Scenario**: When `DEVELOPMENT === false` (real production build, `NEXT_PUBLIC_USE_MOCK_API !== "true"`), `SignInPrompt` still renders a "Try Demo" button. Clicking it invokes `signInAsDemo` → `mockSignIn(set)`, which writes `{ user: MOCK_USER, accessToken: "mock-token-dev", isAuthenticated: true }` directly into the auth store. `AuthGuard` only checks `isAuthenticated`, so the entire `/dashboard` shell mounts.
- **Root cause**: The `signInAsDemo` action has no `DEVELOPMENT` guard. The "Try Demo" button is intentionally shown in non-DEV mode (the `!DEVELOPMENT` branch at line 129 — opposite of intent), and the store action will happily set authenticated state regardless of environment.
- **Impact**:
  1. Anyone visiting the production marketing site can enter the gated dashboard with a fake "demo@personas.dev" identity. Even though API calls with `mock-token-dev` will fail server-side, every component that has a mock-data fallback (and there are several — see `mock-dashboard-data.ts`, `MOCK_TOOL_USAGE`) will render someone else's-looking-data, breaking the security model and confusing users about what is real.
  2. Search engines / crawlers can index gated routes via the demo path.
  3. The `isDemo` flag short-circuits the Supabase `signOut()` path entirely (`authStore.ts:224`), so a user who clicked "Try Demo" then tries to sign in for real has had no Supabase session established — the next OAuth attempt is fine, but the prior local state may have already triggered SWR fetches with the bogus token.
- **Fix sketch**: Either remove the Demo button from production (`{DEVELOPMENT && (<button …>Try Demo</button>)}` — it currently uses `!DEVELOPMENT`), OR make `signInAsDemo` route to a dedicated read-only `/dashboard/demo` shell that explicitly never hits real APIs, OR refuse `signInAsDemo` when not in DEV (`if (!DEVELOPMENT) return;`). The cleanest fix is all three: hide the button, gate the action, and isolate the demo shell.

---

## 2. `clearUserScopedCaches` misses non-`"dashboard"`-prefixed SWR keys → PII leaks across user switches

- **Severity**: High
- **Category**: Silent failure / State leak
- **File**: `src/lib/clearUserCaches.ts:19-23`
- **Scenario**: User A signs out, User B signs in on the same browser. User B opens `/dashboard/observability/usage` or `/dashboard/observability/performance` and momentarily sees User A's tool-usage and performance metrics until the new fetch resolves.
- **Root cause**: `clearUserScopedCaches` calls `mutate((key) => Array.isArray(key) && key[0] === "dashboard", undefined, { revalidate: false })`. This only matches the array-form keys produced by `dashboardKeys.agentDetail(personaId)`. But these user-scoped SWR caches use plain string keys and are NOT cleared:
  - `useSWR("observability", api.getObservability, …)` — `src/app/dashboard/observability/PerformanceView.tsx:284` and `src/app/dashboard/home/page.tsx:78` (also string `"observability"`).
  - `useSWR("usage", api.getUsageAnalytics, …)` — `src/app/dashboard/observability/UsageView.tsx:142`.
  - These `data` blobs (tool usage by persona, dailyMetrics, performance) are user-scoped PII that survives logout in the SWR global cache.
- **Impact**: PII (per-user tool usage, persona names, daily metrics) bleeds into the next user's session for the dedupingInterval window. Even if the new fetch eventually overwrites it, the previous user's data was rendered to the new user, which is the textbook silent-leak the function was supposed to prevent.
- **Fix sketch**: Broaden the predicate to a global wipe of all SWR cache except known-safe keys: `mutate(() => true, undefined, { revalidate: false })`. Or maintain an explicit allowlist of user-scoped keys. The safe default for "logout" is "blow away everything in SWR".

---

## 3. `useSystemStore` is not cleared on logout → previous user's health data persists

- **Severity**: High
- **Category**: Silent failure / State leak
- **File**: `src/lib/clearUserCaches.ts:16-28`, `src/stores/systemStore.ts`, `src/components/dashboard/AuthGuard.tsx:34`
- **Scenario**: User A is signed in. `AuthGuard` polls `fetchHealth` every 30s; `useSystemStore.health` accumulates. User A signs out, User B signs in. User B's first paint of any component reading `systemStore.health` shows User A's last-known health snapshot.
- **Root cause**: `clearUserScopedCaches` resets `personaStore`, `eventStore`, `executionStore`, `reviewStore` — but not `systemStore` (or `dashboardFilterStore`, see below). `systemStore` has no `reset()` method at all (`src/stores/systemStore.ts:12-31`).
- **Impact**: Health metadata, status info, and any future system-level data tied to the authenticated session leaks into the next account. Since `usePolling` only resumes after `isAuthenticated` flips back true, a fresh sign-in immediately renders stale data from the last user before the first poll completes.
- **Fix sketch**: Add a `reset()` to `systemStore` (mirror the pattern in personaStore) and call it from `clearUserScopedCaches`. Also audit every store under `src/stores/` for user-scoped state — currently 5 of 9 are user-scoped, only 4 are reset.

---

## 4. `dashboardFilterStore` persists `personaId` across logout → cross-account leak via filter UI

- **Severity**: Medium
- **Category**: Latent failure / Privacy
- **File**: `src/stores/dashboardFilterStore.ts:60-72,116-118`, `src/lib/clearUserCaches.ts`
- **Scenario**: User A filters their dashboard to "personaId = pers_alice_secret_123". This is persisted to `localStorage["dashboard-filter-state"]`. User A signs out. User B signs in on the same device. The store hydrates from localStorage on module load and writes `personaId: "pers_alice_secret_123"` into the filter. User B's dashboard immediately requests data filtered by a persona ID that doesn't belong to them.
- **Root cause**: The store hydrates from localStorage at module init (line 116-118) — once, ever. `clearUserScopedCaches` doesn't clear this localStorage key on logout, and `dashboardFilterStore` isn't included in the reset list.
- **Impact**: Reveals the existence of User A's persona IDs to User B (the value sits in the URL/filter UI and is sent in API requests). API requests with someone-else's `personaId` will 403 in production, but the ID itself is leaked. Also the UI shows a confusing "selected persona that doesn't exist" state.
- **Fix sketch**: Either (a) include `useDashboardFilterStore.getState().reset()` in `clearUserScopedCaches` AND clear the localStorage key, or (b) namespace the storage key by user id (`dashboard-filter-state-${userId}`).

---

## 5. AuthGuard hydration race: `isLoading: true` is the *initial* store value but `AuthProvider` only initializes on `/dashboard` paths

- **Severity**: Medium
- **Category**: Race condition / UX correctness
- **File**: `src/components/AuthProvider.tsx:9-19`, `src/stores/authStore.ts:67`, `src/components/dashboard/AuthGuard.tsx:36-40`
- **Scenario**: A user lands on `/dashboard` via a deep link. SSR renders nothing (client component). On hydration:
  1. AuthGuard mounts → `isLoading: true` (initial), renders `<DashboardSkeleton />`. Good.
  2. AuthProvider's `useEffect` fires → `initialize()` runs → in DEV, `mockInitialize` sets `isLoading: false`. AuthGuard now sees `isAuthenticated: false, error: null` → renders `<SignInPrompt />`. Good.
  3. In production with a valid Supabase session in localStorage, `validateOptimisticSession` may pass and set `isAuthenticated: true, isLoading: false` synchronously inside `initialize()`. Same render cycle as step 2, AuthGuard renders children. Fine.
  4. **But**: if React StrictMode or an HMR cycle causes `AuthProvider` to unmount, the cleanup runs `subscription.unsubscribe()` and `set({ initialized: false })`. The next mount of `AuthProvider` calls `initialize()` again. Between unsub and re-init, `isAuthenticated` is whatever it last was, but `isLoading` is whatever it last was (likely `false`). If AuthGuard re-mounts in this window with `isAuthenticated: true` from a stale prior session that was cleared elsewhere, it will mount children with no live subscription.
  5. **Worse**: when navigating from `/dashboard/x` to `/about` to `/dashboard/y`, `shouldInitializeAuth` flips false→true, the cleanup runs (`initialized: false`, subscription gone), then on returning to `/dashboard/y` `initialize()` is called fresh. During the brief unsubscribed window the user is "authenticated" with no `onAuthStateChange` listener — a real Supabase token refresh that fires now is dropped, and an actual session expiry won't surface as `sessionExpired`.
- **Root cause**: `AuthProvider` ties initialization lifecycle to pathname. The auth subscription is treated as something you set up only when needed, but the in-memory authStore state survives the cleanup, creating a "subscribed: false, isAuthenticated: true" state.
- **Impact**: In production, navigating in and out of `/dashboard` can leave the app in an authenticated UI state without a live session listener; if the token expires while the user is on a marketing page, the dashboard won't know on the next visit. Combined with Finding 1 (mock auth in production) the same path can leave a fake demo session live across pages.
- **Fix sketch**: Initialize auth at the root layout (always-on listener) and only branch the *UI gating* (AuthGuard) per route. Or, on cleanup, also clear `isAuthenticated` so the next mount goes through the full `getSession()` round-trip.

---

## 6. Optimistic session validator does not check `expires_at` upper bound or refresh-token presence

- **Severity**: Medium
- **Category**: Edge case / Stale session
- **File**: `src/stores/authStore.ts:19-38`
- **Scenario**: An attacker (or buggy extension, or a stale tab from yesterday) writes a Supabase-shaped payload with `expires_at = Number.MAX_SAFE_INTEGER`, a real-looking but expired `access_token`, and a `user.id`. `validateOptimisticSession` happily returns it because `expiresAt > now` and `accessToken.length > 0`. The app sets `isAuthenticated: true` with a token the server will reject. The subsequent `getSession()` validates against Supabase and clears it — but the optimistic render in between makes API calls with the bogus token.
- **Root cause**: The validator checks "future timestamp" but not "reasonable timestamp" (e.g., < now + 1 year). It also doesn't check for `refresh_token` presence, which is required for any subsequent session refresh — a payload missing it will fail token rotation later. Most importantly, the validator trusts an arbitrary `accessToken` shape (no JWT structure check, no `iss` claim check), so any string passes.
- **Impact**:
  - Brief unauthorized-API-call burst on every page load with bogus tokens (still rejected server-side, but counts against rate limits and produces 401 noise / Sentry events).
  - Locally tampered localStorage can hold the UI in an "authenticated" state long enough for `getSession()` to round-trip (1-3s typically), during which user-scoped fetches fire and SWR caches the empty/error responses keyed under the attacker-controlled `user.id`.
  - On unreliable network, the `getSession()` Promise hangs, so the optimistic state lasts indefinitely.
- **Fix sketch**: Add a sanity bound (`expires_at < now + 7 * 86400`), require `refresh_token: string`, and JWT-decode `access_token` to verify `iss` matches `NEXT_PUBLIC_SUPABASE_URL`. Add a hard timeout to `getSession()` (e.g., 5s) that falls back to `isAuthenticated: false` if it doesn't resolve.

---

## 7. No cross-tab sync — sign-out in one tab leaves another tab authenticated

- **Severity**: Medium
- **Category**: Race condition / Multi-tab consistency
- **File**: `src/stores/authStore.ts` (entire file — no `storage` event listener)
- **Scenario**: User opens `/dashboard` in tab A and tab B. User signs out in tab A. Supabase clears the localStorage token, but tab B's authStore still holds `isAuthenticated: true, user: A, accessToken: A's token`. Tab B continues polling health every 30s, the user's avatar is still rendered, in-flight fetches don't abort. The user thinks they signed out but tab B is still showing their data.
- **Root cause**: `authStore.initialize` subscribes to `supabase.auth.onAuthStateChange` (which IS supposed to fire across tabs in Supabase v2 since it listens to localStorage). However, the implementation skips this entirely in `DEVELOPMENT` mode (line 80-83 returns early before subscription) — and `mockSignOut` only mutates the local Zustand store, no cross-tab broadcast. Even in production, if Supabase's storage-event listening is misconfigured, there's no fallback `window.addEventListener("storage", ...)` watching the auth-token key.
- **Impact**: PII visible in stale tabs after logout — exact failure mode the entire `clearUserScopedCaches` mechanism was designed to prevent, defeated by tab-locality. On a kiosk / shared device, the next user can re-focus the open tab and continue browsing as the previous user.
- **Fix sketch**: Add an explicit `window.addEventListener("storage", e => { if (e.key?.includes("auth-token") && !e.newValue) signOut() })` in `initialize()`. Also ensure `mockSignOut` posts to a `BroadcastChannel("auth")` that other tabs listen to.

---

## 8. `signOut` failure path leaves `isDemo` partially uncleared on demo-mode error

- **Severity**: Low
- **Category**: State machine inconsistency
- **File**: `src/stores/authStore.ts:215-256`
- **Scenario**: User clicks "Try Demo" → `isDemo: true`. User clicks Sign Out. The code path takes the `if (DEVELOPMENT || get().isDemo)` branch (line 224), calls `mockSignOut(set)`, then `set({ isDemo: false, isSigningOut: false })`, then `return`. Good.
  But in the `catch` block (line 238-251), `isDemo: false` IS set — only because the catch block is also reached if `mockSignOut` itself somehow throws (it can't, it's pure local state, but the type system can't prove that). The early-return path on line 226 hits BEFORE `clearUserScopedCaches()` in the `finally` block. Wait — `finally` runs after `return`, so caches DO get cleared. OK there.
  However: `authSubscriptionCleanup()` is called *inside the try block* on line 220 BEFORE the demo branch runs. After cleanup, `authSubscriptionCleanup` is set to `null` (line 170) and `initialized: false`. Now in DEV mode the user is signed out, BUT if they subsequently sign back in via `signInAsDemo`, `initialize()` is never re-run (because AuthProvider's `useEffect` doesn't re-fire — `initialize` reference and `shouldInitializeAuth` haven't changed). The user enters the dashboard but the auth subscription is gone (in production this would mean no token-refresh listener; in DEV this is moot but the state machine is wrong).
- **Root cause**: `signOut` tears down the subscription unconditionally, but `signInAsDemo` and `signInWithGoogle` don't re-subscribe. Re-subscription only happens via `retry()` or AuthProvider remount.
- **Impact**: After sign-out → sign-in cycle without leaving `/dashboard`, the auth store is no longer listening for Supabase events. Token refreshes and external sign-outs (other tab, server-side revocation) won't propagate. Manifests as: "user changes password elsewhere, this tab keeps working with a stale token until it expires."
- **Fix sketch**: After successful sign-in (real or demo), re-call `initialize()` if `authSubscriptionCleanup === null`. Or, separate "tear down subscription" from `signOut` — only clear it on AuthProvider unmount.

---

## Summary of patterns that will repeat in production auth

1. **Cache-clearing predicates that match by prefix/shape**: every time a new SWR key is added that doesn't match the predicate, a leak ships silently. Allowlist > denylist; default-deny on logout.
2. **Per-store reset() coverage drift**: stores added later (`systemStore`, `dashboardFilterStore`) skip the convention. Need a registry pattern: `registerUserScopedStore(reset)`.
3. **Auth lifecycle tied to a specific route**: routing-driven init creates windows where auth UI says "yes" but the listener is gone. Init at root, gate at route.
4. **Optimistic local validation accepting any future timestamp**: untrusted-input shape checks need real bounds, not just type predicates.
5. **Cross-tab consistency assumed but not enforced**: every auth UI must explicitly listen to `storage` / `BroadcastChannel`, not assume Supabase does it.
