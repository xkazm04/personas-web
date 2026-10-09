# The orchestrator proxy attaches the team key only for a verified Supabase session

## Context

`/api/orchestrator/[...path]` moved `TEAM_API_KEY` out of the client bundle, but the route still attached it to every request from anyone. An anonymous `curl -X POST /api/orchestrator/personas/<id>/execute` reached the orchestrator with the team's authority: the server lent its credential to any caller. The same route is also the one place the key meets a URL built from user-supplied path segments, and it relays upstream bodies on the app's own origin. That origin holds a paired phone's non-extractable Ed25519 key, which any script running there can use to sign auto-executing commands.

## Decision

Three layered controls on the one route:

1. **Session gate (`8b40c08`).** The route verifies the caller's `X-User-Token` against Supabase Auth (`GET /auth/v1/user`) before adding the key. No or forged token gives 401; Supabase unset or unreachable gives 503 (fail closed). Verified tokens are cached 30 seconds by SHA-256 so dashboard polling does not pay a round trip per call; refusals are never cached.
2. **Origin pin (`db41c87`).** Empty, `.` and `..` segments are refused with 400 `bad_path`, and the built URL must keep the configured orchestrator origin. An empty first segment would otherwise yield a protocol-relative `//evil.test/x` carrying the bearer key.
3. **JSON-only relay (`fa4c402`).** Only `application/json` and `+json` types pass through; anything else is served as `text/plain`, and every answer carries `nosniff` and `default-src 'none'; sandbox`.

## Alternatives that lost

- **Leave the key on every request.** That is the confused-deputy hole itself.
- **Fail open when Supabase is down.** A dashboard outage is cheaper than anonymous team authority.
- **Rely on Next's 308 redirect of `//` paths** instead of pinning the origin. It is not reachable today, but the route should not depend on framework behaviour.
- **Copy upstream content types.** An upstream `text/html` or `image/svg+xml` body would render as a personas.so page.

## Consequences

- Every proxied call needs a live Supabase session. The dashboard always sends one; demo mode never hits the proxy.
- A local web-to-desktop proof therefore needs a Supabase session from a local or test project, never production. Without one the proxy answers 503 or 401 before anything reaches the desktop.
- The SSE routes (`api/events/stream`, `api/executions/[id]/stream`) have the same gap and were out of scope for this change.

## Evidence

personas-web: `8b40c08`, `db41c87`, `fa4c402` (all resolve with `git cat-file -e`; each is a cherry-pick whose trailer names the original). Code: `src/app/api/orchestrator/[...path]/route.ts`, `userSession.ts`, `proxy.test.ts`.
personas: none.

## Status, 2026-10-09

The SSE routes that the Consequences left out have been gated the same way since `050c9709` (docs `ad0b569c`).
See [the SSE gate and production no-eval record](2026-10-09-sse-session-gate-and-production-no-eval.md).
