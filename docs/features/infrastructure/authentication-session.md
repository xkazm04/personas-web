# Authentication & User Session
> OAuth-style demo gate for `/dashboard` & `/m`: real Supabase Google sign-in *or* an always-on in-memory mock session, behind a client-only route guard. · **Route:** n/a (guards `/dashboard/*` + `/m/*`) · **Status:** Demo auth (mock)

## What it does
The dashboard and the mobile shell sit behind a sign-in gate that offers **two paths in every environment**: sign in to a real account via Supabase Google OAuth, or click "Try demo" to explore an in-memory mock session. The demo is always available, never auto-entered from the prompt, and touches no real account — it mints a fake `User` + token client-side. A separate `/demo` route enters the same demo mode un-gated (shareable link, autostarts the guided tour via `?tour=1`). While gated, the guard shows a skeleton (loading), a full-page session-error screen (verification failed), or the sign-in prompt (unauthenticated). On logout it wipes every user-scoped cache so the next account never flashes the previous one's data, and a bottom toast nudges re-sign-in when a live session silently expires.

## How it works
**Provider + lazy init.** `AuthProvider` (`src/components/AuthProvider.tsx:9`) wraps both gated trees (`src/app/dashboard/layout.tsx:38`, `src/app/m/layout.tsx:25`). It calls `authStore.initialize()` from a `useEffect` **only** when the path starts with `/dashboard` or `/m` (`AuthProvider.tsx:12`) and renders `AuthToast` for session-expiry notices.

**`initialize()`** (`authStore.ts:77`) is idempotent (guards on `initialized`). If `isDemo` is already set it short-circuits — a deliberate in-memory demo is never clobbered by re-running real auth on remount (`authStore.ts:84`). Otherwise it tries `getSupabase()`; if Supabase is unconfigured it falls through to the unauthenticated gate (keeping the "demo always available" guarantee) rather than erroring (`authStore.ts:92`). With Supabase present it does an **optimistic** read of the cached `sb-<ref>-auth-token` from `localStorage` — shape-validated by `validateOptimisticSession` (`authStore.ts:18`: finite future `expires_at`, non-empty `access_token`, non-empty user `id`) to avoid a skeleton flash — then confirms via `getSession()` and subscribes to `onAuthStateChange` for sign-in / sign-out / token refresh. The subscription's cleanup (`authStore.ts:172`) unsubscribes and resets `initialized`.

**Demo entry — two doors.** `signInAsDemo()` (`authStore.ts:181`) is the gated sign-in-button path: `mockSignIn(set)` + `isDemo:true`. `enterDemo()` (`authStore.ts:188`) is the un-gated `/demo`-route path (`src/app/demo/page.tsx:27`): same mock session **plus** `initialized:true` so the dashboard's `AuthProvider` won't re-run real auth and clobber it on the redirect into `/dashboard/home`. Both delegate to `mockSignIn` (`src/lib/mockAuth.ts:34`), which sets `MOCK_USER` (`demo@personas.dev`) and `MOCK_TOKEN`.

**Real sign-in.** `signInWithGoogle()` (`authStore.ts:197`) calls `supabase.auth.signInWithOAuth({ provider: "google", redirectTo: …/dashboard })`; any failure lands in `signInError` (kept separate from `error` so it shows inline in the prompt instead of diverting the guard to the full-page error screen — `authStore.ts:50`).

**The guard.** `AuthGuard` (`src/components/dashboard/AuthGuard.tsx:15`) reads `{isAuthenticated, isLoading, error}` and branches: `isLoading` → `DashboardSkeleton`; `error && !isAuthenticated` → full-page `SessionErrorPrompt` (retry); `!isAuthenticated` → `SignInPrompt`; else renders children. Once authenticated it bootstraps personas and polls health every 30s. `AuthLayout` (`src/components/dashboard/AuthLayout.tsx`) is the shared ambient-orb backdrop for the gate screens.

**Logout.** `signOut()` (`authStore.ts:225`) sets a module-level `userSignOutInProgress` flag (so the auth-change listener doesn't mis-fire `sessionExpired`), tears down the subscription, and either `mockSignOut` (demo) or `supabase.auth.signOut()` (real). A catch force-clears local state even if the network call rejects, and the `finally` **always** calls `clearUserScopedCaches()` (`src/lib/clearUserCaches.ts:27`): `mutate(() => true, …)` wipes all SWR cache plus `.reset()` on persona / event / execution / review / system / dashboard-filter stores.

**Session-expiry toast.** When `getSession`/`onAuthStateChange` sees an authed→unauthed transition that wasn't a deliberate sign-out, it sets `sessionExpired` (`authStore.ts:141`). `AuthToast` (`src/components/AuthToast.tsx`) shows a focus-managed, Escape-dismissable `role="alert"` toast that auto-clears after 8s and offers a re-sign-in button.

## Key files
| File | Role |
| --- | --- |
| `src/stores/authStore.ts` | Zustand auth store: state shape, `initialize`, `signInWithGoogle`, `signInAsDemo`, `enterDemo`, `signOut`, `retry`, optimistic-session validation |
| `src/lib/mockAuth.ts` | `MOCK_USER` / `MOCK_TOKEN`, `mockInitialize` / `mockSignIn` / `mockSignOut` |
| `src/lib/clearUserCaches.ts` | `clearUserScopedCaches()` — wipe all SWR + reset every user-scoped store on logout |
| `src/components/AuthProvider.tsx` | Path-gated `initialize()` trigger + `AuthToast` mount |
| `src/components/AuthToast.tsx` | Session-expired toast (focus trap, Escape, 8s auto-dismiss, re-sign-in) |
| `src/components/dashboard/AuthGuard.tsx` | Route guard: skeleton / error / sign-in-prompt / children; bootstraps data when authed |
| `src/components/dashboard/AuthLayout.tsx` | Ambient-orb backdrop shared by the gate screens |
| `src/components/dashboard/SignInPrompt.tsx` | Unauthenticated gate UI: Google OAuth + "Try demo" buttons, inline `signInError` |
| `src/components/RoleSelector.tsx` | **Marketing** "I am a…" persona-tailoring control (`ViewerRole`), used by `why-agents` section — *not* an auth/role-claim mechanism |
| `src/app/demo/page.tsx` | Un-gated `/demo` route: `enterDemo()` + redirect to `/dashboard/home` |

## Data & state
- **Source:** Supabase Google OAuth (real) + `mockAuth.ts` in-memory mock (demo). No backend session of its own. **Stores:** `authStore` (`useAuthStore`, plain Zustand — **not** persisted; session continuity for real auth comes from Supabase's own `localStorage` token, demo sessions are RAM-only and lost on hard reload). State: `user, accessToken, isAuthenticated, isLoading, initialized, isDemo, isSigningIn, isSigningOut, sessionExpired, error, signInError`. **API routes:** none — OAuth redirects straight to Supabase; demo never hits the network. **Types:** `User` (`@supabase/supabase-js`); `ViewerRole = "developer" | "product-manager" | "enterprise"` (marketing only, in `RoleSelector.tsx:7`).

## Integration points
- **Gated trees:** `src/app/dashboard/layout.tsx:38` and `src/app/m/layout.tsx:25` both wrap children in `AuthProvider` → `AuthGuard`.
- **Logout button:** `src/app/dashboard/settings/page.tsx:81` calls `signOut`, disabled on `isSigningOut`; the same page surfaces `isDemo` as `mock://demo-data` vs `NEXT_PUBLIC_ORCHESTRATOR_URL` (`settings/page.tsx:118`).
- **`/demo` entry:** `src/app/demo/page.tsx` forwards `?tour=1` so the dashboard's `TourLauncher` autostarts.
- **Cache reset fan-out:** `clearUserScopedCaches` resets `personaStore`, `eventStore`, `executionStore`, `reviewStore`, `systemStore`, `dashboardFilterStore` (deliberately in `lib/`, not the store, to avoid an authStore↔store import cycle — `clearUserCaches.ts:13`).
- **Post-auth bootstrap:** `AuthGuard` fires `personaStore.fetchPersonas()` once authed and polls `systemStore.fetchHealth()` every 30s (`AuthGuard.tsx:28`).
- **Supabase optionality:** all real-auth calls go through `getSupabase()` and degrade to the demo path when URL/anon key are absent (per CLAUDE.md §6).

## Conventions & gotchas
- **⚠️ Demo sign-in is reachable in production.** `SignInPrompt` and `/demo` expose "Try demo" / `enterDemo` in **every** environment — there is no env flag (e.g. `NEXT_PUBLIC_USE_MOCK_API`) gating them in the prompt. This is intentional per the file docs ("real visitors sign in at `/dashboard`, `/demo` is the always-on demo"), but it means anyone can mint `MOCK_USER` and browse the mock dashboard in prod. Acceptable only because the demo is mock-data-only and the mock session never touches a real account or the orchestrator. Re-audit if real data ever flows behind this gate.
- **⚠️ The guard is client-only and checks `isAuthenticated` *alone*.** `AuthGuard` (`AuthGuard.tsx:39`) gates purely on the in-memory `isAuthenticated` boolean — there is **no server-side / middleware guard**, no token verification at the route level, and no role/permission check. Anyone can set `isAuthenticated` via devtools or the demo button. This is fine for a demo with no privileged data, but it is **not** an access-control boundary — never put a real authorization decision behind it. (This area had a prior critical; keep the bar here.)
- **Optimistic session is untrusted input.** The `localStorage` auth-token read is tamper-prone (extensions, devtools, page scripts); `validateOptimisticSession` (`authStore.ts:18`) shape-checks it before letting it drive the UI, then `getSession()` confirms against the server. Don't widen what's trusted from `localStorage` without re-validating.
- **Demo session is RAM-only.** `isDemo` lives in non-persisted Zustand — a hard reload of `/dashboard` drops it and re-shows the gate (real Supabase sessions survive via Supabase's own token). The `/demo` route exists precisely to re-enter cleanly.
- **`enterDemo` vs `signInAsDemo`.** Same mock session, but `enterDemo` also sets `initialized:true` to stop `AuthProvider` re-running real auth on the redirect. Use `enterDemo` only for the standalone route; the in-app button uses `signInAsDemo`.
- **`signInError` vs `error`.** Keep sign-in *attempt* failures in `signInError` (inline banner) and *session-verification* failures in `error` (full-page screen) — conflating them sends a not-yet-signed-in user to the scary error page.
- **`RoleSelector` ≠ auth.** Despite being listed near auth, `RoleSelector`/`ViewerRole` is a marketing "I am a…" copy-tailoring control with no link to `authStore`; it grants no privileges.
- **`mockInitialize` is currently unused by the active flow.** `mockAuth.ts:22` (auto-authenticate for `NEXT_PUBLIC_USE_MOCK_API`) is exported but the live path uses `mockSignIn` via `signInAsDemo`/`enterDemo`; treat it as legacy and verify before relying on it.

## Related docs
- [Orchestrator API Client & Mock Data](orchestrator-client-mocks.md)
- [Dashboard Shell, Chrome & Realtime](../dashboard/shell-chrome.md)
- [Feature index](../INDEX.md)
