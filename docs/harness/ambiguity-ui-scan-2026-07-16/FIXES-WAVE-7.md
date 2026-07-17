# Fix Wave 7 — Mode-switch cache contract (T3) + dashboard-home error/loading (T7)

> 3 commits, 6 findings closed (6 High).
> Baseline preserved: tsc 0 → 0 · vitest 64/64 → 64/64 · 0 regressions.

## Commits

| # | Commit | Findings closed | File(s) |
|---|---|---|---|
| 1 | `f9c7bdb` | auth-user-session #1 | authStore.ts, clearUserCaches.ts |
| 2 | `128087b` | leaderboard-rankings #1, messages-settings #1 | useLeaderboardData.ts, useMessagesData.ts, useKnowledgeData.ts |
| 3 | `b019d2d` | dashboard-home-overview #1, #2 | 3 home hooks + 3 home cards |

## What was fixed

**T3 — the demo/real mode-switch stale-data leak (root cause + consumers):**
1. **Cache contract centralized in the store** — `clearUserScopedCaches()` ran only in `signOut`'s finally, so session expiry / revocation / cross-tab sign-out / account switch (via `onAuthStateChange`) and demo entry left every store + SWR cache populated with the prior account's data. Now `onAuthStateChange` clears whenever the user id changes (a plain token refresh keeps the same id, untouched), and `signInAsDemo`/`enterDemo` clear on entry. `clearUserCaches.ts` documents that the store — not consumers — owns invocation.
2. **Consumer hooks re-seed on flip** — `useLeaderboardData`/`useMessagesData`/`useKnowledgeData` baked `isDemo` into `useState` initializers and early-returned in the effect, so a real→demo switch kept the previous account's data on screen. The mock branch now explicitly re-seeds the fixture + clears loading/error.

**T7 — dashboard-home cards ignored loading/error:**
3. The heatmap / top-performers / upcoming-routines cards rendered `length===0 ? empty : list`, so real-mode visits flashed "no executions yet" during the fetch and a transient failure showed a permanent authoritative-looking empty state. The three hooks now expose `error` + `retry`; each card renders a spinner while loading and `DashboardErrorBanner` on failure before the empty state (matching the sibling `TrafficErrorsCard`).

## Verification

| | Before | After |
|---|---|---|
| tsc | 0 | 0 |
| vitest | 64/64 | 64/64 |

## Patterns established (catalogue items 12–13)

12. **Attach cache-clearing to the state transition, not one caller** — "signOut clears caches" is an implicit contract that misses expiry/revocation/account-switch/demo-entry. Clear whenever identity (`user.id`) or `isDemo` flips, owned by the auth store; consumers just refetch.
13. **`isDemo` baked into a useState initializer is a reactive value captured once** — an effect that early-returns on the mock branch never re-seeds when the store flips mid-session. Handle the mock branch explicitly (set fixture + clear loading/error) or key-remount upstream. Same shape as the fetch loading/error contract: spinner while loading, error banner on failure, empty only when resolved-and-empty.

## What remains

T6 pause/interrupt conflation, T8 dead/unwired surface, T9 i18n, T10 conversion path, T11 hydration/SSR, plus T14/T15 and the deferred sub-items (knowledge type-bucket + legends, small T5 tail). Per INDEX.md.
