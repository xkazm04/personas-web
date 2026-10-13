# Runbook: when Supabase or the orchestrator is down

The README promises that the app boots with no env vars and that Supabase- and
orchestrator-backed features degrade gracefully. This page says what "gracefully"
means in practice: for each failure, what the server answers, what a visitor sees, and
what an operator checks. `src/lib/degradationDrill.test.ts` holds this page to the code in
two ways. It fails when a row in the table names a status or `error` code that the cited
route no longer returns. It also runs the real stream and proxy handlers with the
orchestrator failing (unreachable, an error status, a stream that drops mid-session, a
client abort) and checks that each answer matches what is written here. The
configuration rows (503, 501) are drilled by the routes' own specs next to them.

`e2e/degraded-dependencies.spec.ts` drills the same page against the built app over
HTTP, the way a visitor's browser meets it: with no orchestrator URL, the stream and the
proxy (reads and writes) answer 503 `orchestrator_not_configured`, and with no Supabase
env, `GET /api/votes` answers 200 from the file store (see "Supabase absent entirely").
It runs with `npm run test:e2e`, which builds and starts the app with no dependency
configured, and each group skips itself when its dependency is configured. The 502,
`auth_unavailable` and 501 rows need an orchestrator URL that is set but failing, which a
server started with no configuration cannot reach, so only the in-process drill covers
them.

The marketing pages and the `/dashboard/*` demo never call either dependency, because the
demo runs on `src/lib/mockApi.ts`. Everything below applies to the live dashboard and to
roadmap voting only.

## Failure table

| Failure | Route | Status | `error` | What the visitor sees | Operator check |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_ORCHESTRATOR_URL` unset or invalid | `src/app/api/events/stream/route.ts` | 503 | `orchestrator_not_configured` | Live feed stays on "reconnecting" and falls back to 10 s polling | Env var set on the deployment and a valid http(s) URL |
| `NEXT_PUBLIC_ORCHESTRATOR_URL` unset or invalid | `src/app/api/orchestrator/[...path]/route.ts` | 503 | `orchestrator_not_configured` | Every live dashboard call fails with an `ApiError` | Same as above |
| Supabase env missing or Auth not answering | `src/app/api/events/stream/route.ts` | 503 | `auth_unavailable` | Live feed falls back to polling; nobody can be verified, so the team key is never lent | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` set; Supabase status page |
| Supabase env missing or Auth not answering | `src/app/api/orchestrator/[...path]/route.ts` | 503 | `auth_unavailable` | Live dashboard calls fail until Auth answers again | Same as above |
| Orchestrator unreachable (DNS, refused, TLS) | `src/app/api/events/stream/route.ts` | 502 | `upstream_unreachable` | Feed shows "reconnecting"; reconnects back off from 1 s to 30 s while polling continues | Orchestrator health from the server's network; the hostname is never in the body, so read server logs |
| Orchestrator unreachable (DNS, refused, TLS) | `src/app/api/orchestrator/[...path]/route.ts` | 502 | `upstream_unreachable` | Live dashboard calls fail with `ApiError` status 502 | Same as above |
| Deployment pointed at the desktop (`ORCHESTRATOR_TARGET=desktop`) | `src/app/api/events/stream/route.ts` | 501 | `not_on_desktop` | No live feed; polling only | Expected: the desktop serves no stream |
| Supabase configured but the votes read fails | `src/app/api/votes/route.ts` | 500 | `Failed to read votes` | Roadmap voting keeps its seed counts and shows no live totals | Supabase status; RLS still allows the read |

Two failures answer without a table row because they have no error body:

- **The orchestrator drops the stream mid-session.** `src/app/api/events/stream/route.ts`
  catches the upstream read error and closes the response cleanly. The visitor keeps
  every event already received. `src/hooks/useEventStream.ts` sees the close, shows
  "reconnecting", starts polling and reconnects with backoff.
- **Schema mismatch: the orchestrator changes the event shape.** The orchestrator repo
  owns the `event` message schema; this repo pins its reading of it in
  `src/lib/personaEventWire.ts`, held by `src/lib/personaEventWire.test.ts`. A message
  that is not JSON, misses a required field (`id`, `projectId`, `eventType`, `sourceType`,
  `createdAt`), carries an unknown `status` or mistypes a field is dropped, not cast. The
  stream stays open and the indicator stays "connected", but no new rows appear until
  polling brings them, and polling reads through a different path. So "connected, yet the
  feed only moves every 10 s" means a schema change upstream: compare one `event` frame
  from the network tab with the pinned case in the spec, then update the module and the
  spec together.
- **The visitor navigates away mid-request.** Both routes answer 499 with no body and
  report nothing, because a client abort is not an outage.

## Supabase absent entirely

With no Supabase env, nothing errors. Roadmap voting reads and writes through the file
store in `src/app/api/votes/storage.ts`. A missing `SUPABASE_SERVICE_ROLE_KEY` alone makes
`src/lib/supabase-admin.ts` fall back to the anon client and log one warning. The fallback
only works while the permissive legacy RLS is in place. Treat that warning as a
configuration gap, not an outage.

## Known weak spot: the live event feed never streams today

`EventSource` cannot send the `X-User-Token` header that
`src/app/api/orchestrator/userSession.ts` requires. So on a live deployment the stream route
answers 401 `unauthenticated` to the browser every time. The feed then runs on the 10 s
polling fallback with the indicator on "reconnecting". That is the designed fallback (see
the header of the stream route), not an outage. Do not chase it as one. Fixing it needs a
transport that carries the session, which is a product decision.

## Debugging order

1. Read the `error` field of the failing response in the browser's network tab, and find
   its row above.
2. A 503 is configuration (env vars or Supabase Auth). A 502 is reachability from the
   server to the orchestrator. A 501 is the desktop target working as designed.
3. Polling (`fetchEvents` through `src/lib/api.ts`) keeps the dashboard usable while the
   stream is down. If polling fails too, the orchestrator proxy rows above apply.
