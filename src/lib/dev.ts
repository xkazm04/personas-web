/**
 * Development / mock-mode flag.
 *
 * When `true` the entire dashboard runs against in-memory mock data with no
 * network calls, and `/dashboard` is reachable without a sign-in step (the
 * mock auth layer auto-authenticates a demo user on init). When `false`
 * (the production default) the app uses real Supabase auth and the
 * orchestrator REST API.
 *
 * Controlled by the **`NEXT_PUBLIC_USE_MOCK_API`** environment variable.
 * Set it to the string `"true"` to enable mock mode; any other value (or
 * absence) keeps the app pointed at real services.
 *
 * ### Systems gated by this flag
 *
 * | Consumer                  | Behaviour when `true`                       |
 * |---------------------------|---------------------------------------------|
 * | `api.ts`                  | Exports `mockApi` instead of `realApi`      |
 * | `authStore.ts`            | Uses `mockAuth` helpers (no Supabase OAuth) |
 * | `mockAuth.ts`             | Auto-signs in as demo user on init          |
 * | `useEventStream.ts`       | Skips real SSE connection                   |
 * | `SignInPrompt.tsx`         | Bypassed entirely (auto-auth)              |
 */
export const DEVELOPMENT =
  process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

/**
 * Marketing-side "Try Demo" button gate.
 *
 * `signInAsDemo` writes `isAuthenticated: true` directly into the auth store
 * without any real session, so the dashboard mounts with mock-data fallbacks
 * masquerading as real data. Default-deny in production: the button is only
 * rendered (and the action only succeeds) when this flag is explicitly on.
 *
 * Always on in DEVELOPMENT/mock mode. In a real deploy, set
 * `NEXT_PUBLIC_DEMO_ENABLED=true` to opt in.
 */
export const DEMO_ENABLED =
  DEVELOPMENT || process.env.NEXT_PUBLIC_DEMO_ENABLED === "true";
