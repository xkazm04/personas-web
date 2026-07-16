# Orchestrator API Client & Mock Data — ambiguity+ui scan
> Total: 5 findings (Critical: 1, High: 1, Medium: 2, Low: 1)

## 1. `NEXT_PUBLIC_TEAM_API_KEY` is client-bundled and authorizes destructive orchestrator writes
- **Severity**: Critical
- **Agent**: ambiguity_guardian
- **Category**: client-bundled-secret
- **File**: `src/lib/api.ts:89`
- **Scenario**: Confirmed (expanding the earlier flag). `orchestratorFetch` reads `process.env.NEXT_PUBLIC_TEAM_API_KEY` and sends it as `Authorization: Bearer …`. `api.ts` is imported by client components (it calls `useAuthStore.getState()` and is consumed by SWR hooks like `dashboard-queries.ts`), so Next.js inlines the key's literal value into the public JS bundle. Anyone who loads `/dashboard` — or just fetches the static chunk — can extract the key.
- **Root cause**: The `NEXT_PUBLIC_` prefix was used to make the key reachable from browser-side fetches, conflating "the browser needs to authenticate" with "the browser may hold the team credential". README even labels it `public`. The real security boundary is therefore the orchestrator's network exposure, not this key — but nothing records that assumption, and the SSE proxy routes (`src/app/api/events/stream/route.ts:19`, `src/app/api/executions/[id]/stream/route.ts:24`) read the same var server-side, proving a server-only pattern already exists in the repo.
- **Impact**: Bearer of the key gets the full `ApiClient` surface including `deletePersona` (DELETE), `executePersona` (spend money/run agents), `cancelExecution`, and subscription mutation — team-wide, not per-user (`X-User-Token` is additive, not required). If the orchestrator is internet-reachable, this is credential disclosure with write impact.
- **Fix sketch**: Rename to server-only `TEAM_API_KEY` and move all orchestrator calls behind Next.js route handlers (the two existing stream proxies are the template), attaching the key server-side and authenticating browsers via the Supabase session token only. If the deployment intentionally relies on a private-network orchestrator, record that decision in README/orchestrator-config and stop calling the key "auth".

## 2. Demo mode silently diverges from the real API contract (`limit`/`offset` ignored, `publishEvent` returns the wrong event)
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: mock-real-parity-drift
- **File**: `src/lib/mockApi.ts:74`
- **Scenario**: `dashboard-queries.ts:17` requests `listExecutions({ personaId, limit: 5 })`. In live mode the orchestrator honors `limit`; `mockApi.listExecutions` filters by `personaId`/`status` but drops `limit` and `offset` entirely (same in `listEvents`, `mockApi.ts:101`). `publishEvent` (`mockApi.ts:118`) ignores its input and returns `MOCK_EVENTS[0]`, so a demo user who publishes a custom event sees an unrelated event echoed back; `getPersona`/`updateEvent` 404 correctly but `deletePersona` always "succeeds" without removing anything.
- **Root cause**: The shared `ApiClient` interface enforces type parity but nothing enforces behavioral parity; the mock implements only the happy path each demo surface happened to exercise, and there's no recorded list of which semantics the mock intentionally skips.
- **Impact**: Demo — the marketing site's primary data plane — misrepresents the product (agent-detail "recent 5" shows everything; publish/delete feedback lies), and any component developed against the mock can ship pagination bugs that only appear live.
- **Fix sketch**: Implement `slice(offset ?? 0, (offset ?? 0) + (limit ?? N))` in `listExecutions`/`listEvents`; have `publishEvent` construct a `PersonaEvent` from its `CreateEventInput` (pattern already exists in `createSubscription`); add a short "known mock deviations" comment block, and a unit test that walks `ApiClient` methods asserting the parametric behaviors.

## 3. `listAllSubscriptions` fans out N+1 with unbounded concurrency and silently renders partial data as complete
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: silent-partial-failure
- **File**: `src/lib/api.ts:245`
- **Scenario**: The real implementation fetches all personas, then fires one `subscriptions` request per persona simultaneously (`Promise.allSettled`, no concurrency cap, each with its own 15 s timeout). Any rejected shard is logged to Sentry and dropped; the caller receives the surviving subset with no signal that it is incomplete.
- **Root cause**: Partial-success semantics were decided implicitly ("log and continue") with no way for the UI to distinguish "persona has no subscriptions" from "persona's fetch failed"; the fan-out shape also assumes persona counts stay small, which is nowhere stated.
- **Impact**: A subscriptions overview can quietly show fewer rows than exist — the worst failure mode for an admin surface (user believes a subscription is gone/disabled). With many personas, the burst can itself trigger rate-limit failures that produce exactly that partial view.
- **Fix sketch**: Either add a bulk `/api/subscriptions` orchestrator endpoint, or return `{ subscriptions, failedPersonaIds }` so callers can render a "some agents could not be loaded" notice; cap concurrency (e.g. chunks of 5). Document the smallness assumption if it is one.

## 4. Two parallel fetch wrappers with divergent, undocumented semantics (`apiFetch` vs `orchestratorFetch`)
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: duplicate-fetch-wrappers
- **File**: `src/lib/api-fetch.ts:7`
- **Scenario**: `api-fetch.ts` is a second generic wrapper alongside `orchestratorFetch` (`api.ts:57`) with different behavior on every axis: it throws bare `Error` (status only, response body discarded) vs typed `ApiError` (status + body); has no timeout vs 15 s abort; sends no auth headers; and unconditionally calls `res.json()` — a 204 or empty-body 200 rejects with a JSON parse error instead of resolving. Nothing in either file says which wrapper new code should use or why both exist.
- **Root cause**: A lightweight helper grew next to the hardened one without a recorded division of responsibility (internal `/api/*` routes vs external orchestrator, presumably).
- **Impact**: Callers picking `apiFetch` lose error detail (harder support/debugging), can hang forever on a stalled connection, and break on legitimate 204 responses; error handling downstream (`instanceof ApiError` checks) silently doesn't match.
- **Fix sketch**: Add a header comment to each file stating its intended audience; give `apiFetch` the 204/empty-body guard and include `await res.text()` in its error message; consider a shared timeout helper so both enforce one.

## 5. Mobile redirect map drops agent/execution deep links despite claiming deep-link preservation
- **Severity**: Low
- **Agent**: ui_perfectionist
- **Category**: mobile-deep-link-loss
- **File**: `src/proxy.ts:13`
- **Scenario**: The comment promises a deep link "lands where the user was headed instead of always dumping them on the overview", but `MOBILE_ROUTE_MAP` covers only messages/reviews/alerts. `/dashboard/agents/<id>` and `/dashboard/executions/<id>` — the most likely targets of shared/notification links — fall through to `/m/overview`, and the redirect rewrites `pathname` wholesale, so the entity id (path segment, not query param) is destroyed; preserving `url.search` doesn't help those routes.
- **Root cause**: The map was built for the three views that had `/m` equivalents; the fallback behavior for id-bearing routes was never decided, and the comment overstates the guarantee.
- **Impact**: A phone user tapping an execution or agent link from email/Slack lands on a generic overview and must re-find the entity — precisely the experience the comment says was designed away. Minor today (marketing/demo traffic) but it's a silent trust gap between code and stated intent.
- **Fix sketch**: Either add mappings that carry the id (e.g. `/dashboard/executions/x` → `/m/overview?focus=execution:x` if no `/m` detail view exists) or amend the comment to state that entity deep links intentionally degrade to overview; optionally set `prefer-full` guidance in the fallback view.
