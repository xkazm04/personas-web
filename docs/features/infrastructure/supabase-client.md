# Supabase Client
> Optional anon-key-only Supabase client + typed query helpers, guarded so the app falls back to mocks/empty when unconfigured · **Route:** n/a (lib) · **Status:** Optional (guarded)

## What it does
Provides a single shared `@supabase/supabase-js` client (`getSupabase()`) plus the typed query layer that reads Supabase tables. Two consumer families depend on it: the **community** API routes (roadmap, votes, feature requests/comments/boosts) and the **dashboard sync mirror** (`supabaseApi.ts`, the read-only desktop→Supabase data plane behind `NEXT_PUBLIC_DATA_SOURCE=supabase`). Supabase is entirely optional: when the URL + anon key env vars are absent, every consumer guards the call and falls back — community routes return empty/`"none"` JSON or a filesystem store, and the dashboard mirror is never selected (the orchestrator REST API or the demo mock is used instead).

## How it works
- `getSupabase()` (`src/lib/supabase.ts:5`) lazily memoizes one client in a module-level `_client` and returns it. It reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and — if either is missing — **throws** `"Supabase env vars not configured"` (`src/lib/supabase.ts:9-11`). It does **not** return null or a no-op. Guarding is the caller's responsibility (see gotchas).
- `supabaseApi.ts` implements the shared `ApiClient` interface (`src/lib/api.ts:134`) against the `synced_*` tables. A `rows<T>()` helper (`src/lib/supabaseApi.ts:57`) awaits each query builder and throws a uniform `ApiError(500)` on error, returning `data ?? []`. Snake_case rows are mapped to camelCase web types by per-shape `map*` functions.
- Read-only by design: write/action methods (`deletePersona`, `cancelExecution`, `publishEvent`, subscriptions, …) call `readOnly()` which throws `ApiError(501)` — "Cloud-sync mode is read-only" (`src/lib/supabaseApi.ts:50-54`). The one exception is `executePersona`, which inserts an approval-gated `pending_commands` row (Phase 2 path, `src/lib/supabaseApi.ts:345`).
- Standalone helpers (not part of `ApiClient`) export richer dashboard reads: `getSyncedMemories`, `getSyncedKnowledgePatterns`, `getSyncedLeaderboard`, `getSyncedSla`, `getSyncedMessageThreads`, `getSyncedTriggers`. Several derive display values (leaderboard radar axes, SLA targets, breaches) that are explicitly documented **proxies / app-defined defaults** — there is no desktop-side leaderboard/SLA/quality metric (`src/lib/supabaseApi.ts:731`, `:818`).
- Community routes obtain the same client via `getSupabaseClient()` in `src/app/api/votes/storage.ts:48` (a dynamic `import("@/lib/supabase")`), but only after `hasSupabase()` / `hasSupabaseEnv()` returns true; otherwise they use the filesystem JSON store. The roadmap route inlines the same pattern (`src/app/api/roadmap/route.ts:6-12`).

## Key files
| File | Role |
| --- | --- |
| `src/lib/supabase.ts` | The guarded client factory `getSupabase()` (memoized; throws if unconfigured) |
| `src/lib/supabaseApi.ts` | Typed `synced_*` query helpers + `ApiClient` impl (read-only mirror) + standalone `getSynced*` reads |
| `src/lib/api.ts` | Selects `supabaseApi` vs `realApi` vs `mockApi` (`USE_SUPABASE`, `isDemo`); owns `ApiError`, `ApiClient` |
| `src/lib/server/env.ts` | `hasSupabaseEnv()` server-only presence guard (URL + anon key) |
| `src/app/api/votes/storage.ts` | `hasSupabase()` + `getSupabaseClient()` wrappers; FS fallback for votes/shipped |
| `src/app/api/roadmap/route.ts` | Roadmap consumer — guards then reads `roadmap_items` |
| `scripts/setup-sync-db.sql` | DDL for `synced_*` tables + views the helpers read |

## Data & state
- **Source:** Supabase (anon key only); the dashboard reads `synced_*` tables/views populated by the desktop writer; community reads `roadmap_items`, `feature_*`, `votes`/voting tables.
- **Stores:** none directly. `authStore` (`src/stores/authStore.ts:2`) imports `getSupabase()` for Google OAuth/session. The dashboard helpers feed React-Query-style hooks (`useSlaData`, `useLeaderboardData`, `useMessagesData`, `useKnowledgeData`, `home-page/useTopPerformers`, `useUpcomingRoutines`), not a global store.
- **API routes (consumers):** `api/roadmap`, `api/votes`, `api/feature-requests`, `api/feature-comments`, `api/feature-boosts` — each gated on `hasSupabase*()` with a non-Supabase fallback.
- **Types:** web types from `src/lib/types.ts` (camelCase) + dashboard shapes from `src/lib/mock-dashboard-data.ts`; local `*Row` interfaces describe the snake_case wire shape. RLS (`user_id = auth.uid()`) scopes rows to the signed-in session client-side.

## Integration points
- **`api.ts` dispatch** — `const api` Proxy returns `mockApi` when `isDemo`, else `supabaseApi` when `NEXT_PUBLIC_DATA_SOURCE === "supabase"`, else `realApi` (orchestrator). The Supabase mirror is opt-in, never auto-on (`src/lib/api.ts:353,361-368`).
- **Realtime** — `src/hooks/useSyncedRealtime.ts` subscribes to `synced_*` changes via the same client.
- **Auth** — `authStore` drives sign-in/session off `getSupabase()`; `accessToken` from the session is also forwarded to the orchestrator as `X-User-Token` (`src/lib/api.ts:93-95`).
- **Community fallback** — when Supabase is absent, votes/shipped persist to atomic JSON files via `src/lib/server/json-file-store.ts`; roadmap returns `{ items: [], source: "none" }`.

## Conventions & gotchas
- **Anon-key-only, enforced by env name.** Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` is ever read (`src/lib/supabase.ts:8`, `src/lib/server/env.ts:18`). No `service_role` reference exists in `src/` — keep it that way; row isolation relies on RLS over the user session, not a privileged key.
- **`getSupabase()` THROWS — it is not a null/no-op client.** The "guarded" behaviour lives in callers, not here. Every caller must check presence first (`hasSupabaseEnv()` in routes; the `USE_SUPABASE` flag in `api.ts`) before touching the client. Calling `getSupabase()` in an unconfigured deploy is an uncaught throw. If you add a new consumer, gate it the same way.
- **Two parallel presence checks.** `hasSupabaseEnv()` (`src/lib/server/env.ts`, `server-only`) and the route-local `hasSupabase()` copies (e.g. `votes/storage.ts:44`, and duplicated inline in `feature-requests`/`feature-comments`/`feature-boosts` routes) all check the same two vars. They are consistent today but are independent copies — change one, audit the others.
- **Read-only mirror.** Mutations through `supabaseApi` throw `ApiError(501)` by design; only `executePersona` writes (an approval-gated `pending_commands` insert). Don't assume the mirror can mutate `synced_*` data.
- **Documented proxies, not real metrics.** Leaderboard `quality`, `trend`/`delta`, and all SLA targets/breaches are derived/synthesized client-side (`src/lib/supabaseApi.ts:731-808`, `:818-913`). They are app-defined defaults/proxies, not synced ground truth — surface them as such in UI copy.
- **Impure calls in helpers.** `getSyncedSla` uses `new Date().toISOString()` for breach `startedAt` and `getHealth`/`getStatus` use `Date.now()` (`src/lib/supabaseApi.ts:420,874,903`). These run inside async fetchers (not React render/`useMemo`), so they don't violate the React 19 purity rule — but don't lift this logic into a component render path.
- **Single memoized client.** `_client` is process-wide; env vars are read once at first call. Changing env at runtime won't re-create the client.

## Related docs
- [Public Roadmap](../community/public-roadmap.md)
- [Feature Voting & Comments](../community/feature-voting.md)
- [Feature index](../INDEX.md)
