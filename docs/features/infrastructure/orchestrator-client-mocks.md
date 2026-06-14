# Orchestrator API Client & Mock Data
> The single typed `api` client that every dashboard data call goes through — a Proxy that dispatches to demo mocks or the live orchestrator per session. · **Route:** n/a (data layer) · **Status:** Live client + demo mocks

## What it does
This is the seam between the demo and a real deployment. Every `/dashboard/*` page reads its data through one object — `api` from `src/lib/api.ts` — which exposes a flat `ApiClient` interface (personas, executions, events, subscriptions, triggers, health/status, observability, usage). At call time `api` decides where each method runs:

- **Demo mode** (`isDemo` in the auth store, set by the "Try Demo" button) → in-memory `mockApi` backed by hand-authored fixtures. This is *what makes the dashboard "demo-only" in this repo*: no network, deterministic data, artificial latency.
- **Live mode** → the real orchestrator REST API at `NEXT_PUBLIC_ORCHESTRATOR_URL` (`realApi`), or the read-only Supabase mirror (`supabaseApi`) when `NEXT_PUBLIC_DATA_SOURCE=supabase`.

The dispatch is per-method-access and invisible to callers — the same page code works in all three environments. Demo is always an explicit user choice, never auto-enabled.

Separately, a small standalone `apiFetch` wrapper serves the marketing-side Next API routes (feature voting/comments/boosts) — it is unrelated to the orchestrator client.

## How it works
**Proxy dispatch (the key mechanism).** `api` is a JS `Proxy` over an empty object (`api.ts:361`). Its `get` trap fires on *every* property access: it reads `{ isDemo }` from `useAuthStore` fresh each time, returns `mockApi[prop]` if demo, else picks `supabaseApi` or `realApi` based on the module-level `USE_SUPABASE` flag (`api.ts:353`). Because the trap re-reads the store on access, a user can enter demo mode and the very next call routes to mocks without any module reload. All three implementations conform to the shared `ApiClient` interface (`api.ts:134`), so TypeScript enforces mock/live parity — add a method to the interface and every impl must implement it.

**Live fetch wrapper.** `orchestratorFetch<T>` (`api.ts:57`) is the real transport. It: (1) hard-fails if the auth store isn't `initialized` (guarding against API calls outside `/dashboard`); (2) resolves+validates the base URL via `validateOrchestratorUrl`; (3) builds the URL with `URLSearchParams`, dropping `undefined` params; (4) sets `Content-Type: application/json`, a `Bearer` header from `NEXT_PUBLIC_TEAM_API_KEY` (if set), and `X-User-Token` from the session `accessToken` (if present); (5) enforces a 15s timeout via `AbortController`, translating an abort into a readable "timed out" error; (6) throws `ApiError(status, body)` on non-2xx and returns `undefined` for 204. `realApi` is a thin record of methods that each call `orchestratorFetch` with a path/verb. `listAllSubscriptions` is the one fan-out: it lists personas, then `Promise.allSettled`s a subscriptions call per persona, pushing fulfilled results and reporting rejected ones to Sentry (tagged `listAllSubscriptions`) rather than failing the whole batch.

**Env validation.** `validateOrchestratorUrl` (`orchestrator-config.ts:12`) rejects empty/missing/malformed values and non-`http(s)` protocols, throwing a typed `OrchestratorConfigError` with a remediation message. It's called lazily inside `orchestratorFetch`, so a missing env var surfaces only when a live call is attempted — demo mode never touches it.

**Mock implementation.** `mockApi` (`mockApi.ts:46`) mirrors `ApiClient` method-for-method, each `await delay(ms)`-ing (100–600 ms) to fake network latency, then returning **copies** of fixtures from `mockData.ts`. Reads are filtered in-memory (e.g. `listExecutions` by `personaId`/`status`); writes mutate the module-level fixture objects so changes persist within a session (e.g. `createSubscription` pushes into `MOCK_SUBSCRIPTIONS`). `getExecution` streams the "running" execution's output progressively via a module-level `mockOutputOffset` cursor (3 lines per poll), and `executePersona` calls `resetMockOutputOffset()` so a fresh run replays from the top. The tiered observability getters use staggered delays (metrics 100 ms → spend/issues 600 ms) so the progressive-reveal observability page renders each tier as it arrives.

**Dashboard query layer.** `dashboard-queries.ts` is a thin SWR helper sitting on top of `api`. `loadAgentDetail` (`dashboard-queries.ts:15`) `Promise.all`s three `api` calls (executions/subscriptions/triggers) for an agent-detail panel; `useAgentDetail` wraps it in `useSWR` with a stable `dashboardKeys.agentDetail` tuple key, 60s deduping, `keepPreviousData`, and no focus revalidation. Most pages call `api` directly through their own stores/SWR; this file is the only shared query module so far.

## Key files
| File | Role |
| --- | --- |
| `src/lib/api.ts` | `ApiClient` interface, `realApi`, `orchestratorFetch`, `ApiError`, and the dispatching `api` Proxy |
| `src/lib/orchestrator-config.ts` | `validateOrchestratorUrl` + `OrchestratorConfigError` (env validation) |
| `src/lib/mockApi.ts` | `mockApi` — demo implementation of `ApiClient` with simulated latency |
| `src/lib/mock-dashboard-data.ts` | Static + seeded fixtures for dashboard *visualizations* (SLA, leaderboard, memories, messages, heatmaps, providers…) |
| `src/lib/mockData.ts` | Core API fixtures the `mockApi` returns (personas, executions, events, subscriptions, triggers, health, observability, usage, reviews) |
| `src/lib/dashboard-queries.ts` | SWR query layer (`loadAgentDetail` / `useAgentDetail`) over `api` |
| `src/lib/api-fetch.ts` | Unrelated lightweight `apiFetch<T>` for marketing Next API routes (feature voting) |
| `src/proxy.ts` | Mobile-UA redirect helper — **not** the API proxy (see gotchas) |

## Data & state
- **Source:** `mockApi` (demo) reads `mockData.ts`; live reads hit `NEXT_PUBLIC_ORCHESTRATOR_URL` via `orchestratorFetch`, or `supabaseApi` when `NEXT_PUBLIC_DATA_SOURCE=supabase`. **Stores:** reads `useAuthStore` (`isDemo`, `initialized`, `accessToken`) on every `api` access; `dashboard-queries` caches via SWR. **API routes:** none of its own — it *calls* the external orchestrator (`/api/personas`, `/api/executions`, `/api/events`, `/api/observability`, `/api/usage`, `/health`, `/api/status`). **Types:** the entire surface is typed against `src/lib/types.ts` (`Persona`, `PersonaExecution`, `ExecutionDetail`, `PersonaEvent`, `HealthResponse`, `ObservabilityMetrics`, etc.).

## Integration points
- **Auth session** — the Proxy reads `isDemo` to route, and `orchestratorFetch` reads `initialized`/`accessToken`; the dashboard's `AuthProvider` must initialize the store before any live call (the wrapper throws otherwise). See [Authentication & User Session](authentication-session.md).
- **Supabase mirror** — `supabaseApi` is the third dispatch target (`NEXT_PUBLIC_DATA_SOURCE=supabase`), a read-only desktop→Supabase sync mirror implementing the same `ApiClient`.
- **Sentry** — `listAllSubscriptions` reports per-persona failures via `Sentry.captureException` with a `listAllSubscriptions` tag.
- **Every dashboard page** — Overview, Agents, Executions, Events, Reviews, Observability, Usage all consume `api`; the visualization-only pages (SLA, Leaderboard, Memories, Messages, Knowledge) read directly from `mock-dashboard-data.ts` fixtures rather than through `api`.

## Conventions & gotchas
- **`src/proxy.ts` is NOT the API proxy.** Despite the name, it's a Next-middleware-shaped mobile-UA redirect (`/dashboard/*` → `/m/overview`) gated by a `prefer-full` cookie. It exports `proxy()` + a `matcher` config but **nothing imports it**, and there is no `src/middleware.ts` — Next.js only auto-runs a file literally named `middleware.ts`. So as wired today this redirect is **dormant/dead code**; the "proxy" that actually dispatches demo-vs-live is the `Proxy` in `api.ts`. Don't conflate the two.
- **Env error is lazy, not boot-time.** A missing/malformed `NEXT_PUBLIC_ORCHESTRATOR_URL` only throws when a live `orchestratorFetch` runs — demo mode never validates it, so a broken live config can hide until the first real call.
- **Two different fetch wrappers.** `orchestratorFetch` (in `api.ts`, auth + timeout + `ApiError`) is for orchestrator calls; `apiFetch` (in `api-fetch.ts`, no auth, no timeout, plain `Error`) is only for the marketing Next API routes. They are not interchangeable.
- **Mock writes mutate module state.** `mockApi` create/update/delete methods mutate the shared `MOCK_*` objects in place, so demo edits persist for the page session but reset on full reload. Reads return spread copies to avoid accidental external mutation.
- **`mockData.ts` vs `mock-dashboard-data.ts`.** Only `mockData.ts` feeds `mockApi`/`ApiClient`. `mock-dashboard-data.ts` holds richer presentational fixtures consumed *directly* by viz components — adding a field there does **not** flow through `api`.
- **Determinism caveat.** Most viz fixtures use a `seededRandom` LCG for stable renders, but a few `mockData.ts` series (`MOCK_DAILY_METRICS`, `MOCK_TOOL_USAGE_OVER_TIME`) call raw `Math.random()` at module load, so those values differ per server start — fine for a demo, but not reproducible.
- **Interface parity is the contract.** Adding/removing an `ApiClient` method requires updating `realApi`, `mockApi`, *and* `supabaseApi` in lockstep or `tsc` breaks. Treat the interface as the source of truth.
- **No client-side retries/backoff.** `orchestratorFetch` does a single attempt with a 15s abort; transient orchestrator failures surface as `ApiError`/timeout to the caller, which owns retry UX.

## Related docs
- [Authentication & User Session](authentication-session.md)
- [Dashboard Shell, Chrome & Realtime](../dashboard/shell-chrome.md)
- [Feature index](../INDEX.md)
