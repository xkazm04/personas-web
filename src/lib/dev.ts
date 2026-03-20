/**
 * Development / mock-mode flag.
 *
 * When `true` the entire dashboard runs against in-memory mock data with no
 * network calls. When `false` (the production default) the app uses real
 * Supabase auth and the orchestrator REST API.
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
 * | `mockAuth.ts`             | Provides fake user / token for auth store   |
 * | `useEventStream.ts`       | Skips real SSE connection                   |
 * | `SignInPrompt.tsx`         | Shows dev-mode sign-in UI / copy            |
 */
export const DEVELOPMENT =
  process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
