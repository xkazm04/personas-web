# Threat model: personas-web server surface

One page that joins the decisions in `docs/decisions/` into a single picture an
agent can check a new route against. Each decision record still owns its own
reasoning; this page owns the map. `src/lib/threatModelCoverage.test.ts` fails
`test:unit` when a `route.ts` under `src/app/api/` has no row in the route table
below, so a new route cannot ship without someone deciding where it sits.
`src/lib/threatModelAuthGate.test.ts` holds the rows to the code. Each listed method on
a `verifySession` row must refuse an anonymous caller and a forged token with 401, and
fail closed with 503 when Supabase Auth is unconfigured, and the team key must never
leave the server on any of those calls. The Methods, Caller gate and Secret cells must
also match what each `route.ts` exports, calls and reads, and no route may read
`TEAM_API_KEY` without `verifySession`.
`src/lib/threatModelControls.test.ts` does the same for the anonymous rows, whose only
defence is their Controls cell. Each row naming an IP rate limit must answer 429 with
`Retry-After` once one IP exceeds its budget, while another IP is still served. Each row
naming an allowlist must refuse an id outside it with 400. A row that names either control
without a harness in that spec fails until one is added.

## Assets

| Asset | Where it lives | Who may hold it |
|---|---|---|
| `TEAM_API_KEY` (orchestrator, full authority) | server env | the orchestrator proxy and the two SSE routes, attached only for a verified Supabase session |
| `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) | server env | `src/lib/server/env.ts` and `src/lib/supabase-admin.ts` only, both `import "server-only"` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client bundle | anyone: public by design, safe only while RLS holds |
| Paired phone's signing key | browser storage on the app origin | that phone; any script running on the origin can use it while a tab is open |
| Voter emails, waitlist emails | Supabase (or local JSON store in dev) | server routes only; never selected back to the client |
| Execution text mirrored from the desktop | `synced_executions` | accepted raw (test project only) |

## Trust boundaries

1. **Browser → Next API routes.** Every route is reachable anonymously. Anything
   a route lends (a key, a write) it must gate itself.
2. **Next server → orchestrator.** The team key crosses here. The upstream
   origin is pinned by `validateOrchestratorUrl` (`src/lib/orchestrator-config.ts`)
   and `upstreamUrl` refuses any path that could change the host.
3. **Next server → Supabase.** Anon client (`src/lib/supabase.ts`) for public
   reads; the admin client for PII-bearing writes. `getSupabaseAdmin()` falls back
   to the anon client when no service-role key is set, and that fallback is only
   safe while the legacy permissive RLS is in place (`scripts/harden-voting-rls.sql`).
4. **Phone ↔ desktop (via Supabase command plane).** Commands are signed on the
   phone, and the desktop verifies the envelope and its lifetime. See PHASE2 below.

## Routes

The `Route` column is the path under `src/app/api/` and is what the coverage test matches.

| Route | Methods | Caller gate | Secret / privilege used | Abuse control | Governing record |
|---|---|---|---|---|---|
| `orchestrator/[...path]` | GET POST PUT DELETE PATCH | `verifySession` on `X-User-Token` (Supabase `/auth/v1/user`); 401/503 otherwise | `TEAM_API_KEY` | host-pinned upstream; JSON-only relay, `nosniff` + sandbox CSP on the answer; typed 501 under `ORCHESTRATOR_TARGET=desktop` | [proxy key session-gated](decisions/2026-10-07-proxy-key-session-gated.md), [typed 501](decisions/2026-10-07-proxy-typed-501-not-on-desktop.md) |
| `events/stream` | GET (SSE) | `verifySession`, same as the proxy | `TEAM_API_KEY` | host-pinned upstream; 501 on desktop target | [SSE session gate](decisions/2026-10-09-sse-session-gate-and-production-no-eval.md) |
| `executions/[id]/stream` | GET (SSE) | `verifySession`, same as the proxy | `TEAM_API_KEY` | `id` percent-encoded; empty, `.` and `..` and any origin change rejected as `bad_path`; 501 on desktop target | [SSE session gate](decisions/2026-10-09-sse-session-gate-and-production-no-eval.md) |
| `votes` | GET POST | none (anonymous `voter_id`, validated by `isValidVoterId`) | admin client (`votes/storage.ts`) | IP rate limit (in-memory, not persisted); feature id allowlist; `email` never selected on GET | `scripts/harden-voting-rls.sql` |
| `feature-boosts` | GET POST | none (anonymous `voter_id`) | admin client | IP rate limit; `ALLOWED_FEATURES`; tier and weight validated | `scripts/harden-voting-rls.sql` |
| `feature-comments` | GET POST | none (anonymous author handle) | admin client | IP rate limit; `ALLOWED_FEATURES`; text, author and parent validated | `scripts/harden-voting-rls.sql` |
| `feature-requests` | POST | none | anon client | IP rate limit | none |
| `waitlist` | GET POST | none | admin client (`hasSupabaseServiceRole`) | separate GET/POST IP rate limits; email + platform allowlist; errors through `captureExceptionScrubbed` | none |
| `roadmap` | GET | none | anon client, read-only `roadmap_items` | none needed (public read) | none |
| `download` | GET | none | none | redirect target validated once at module load (`src/lib/release.ts`), not taken from the request | none |

**Highest blast radius:** `orchestrator/[...path]`. Misjudging its gate lends the
orchestrator's full authority to anyone on the internet, and its answers are
served on the origin that holds the phone signing key.

## The `service_role` boundary

- The key may be read only in a module whose first line is `import "server-only"`
  (today `src/lib/server/env.ts` and `src/lib/supabase-admin.ts`), and never under a
  `NEXT_PUBLIC_` name. Next fails the build if a `server-only` module reaches a
  client component, and an un-prefixed env var is never inlined.
- Routes reach it only through `getSupabaseAdmin()`, imported dynamically inside
  the handler.
- Known weak point: without the key, the admin client silently becomes the anon
  client. Until `scripts/harden-voting-rls.sql` has run, voting tables are
  writable and voter emails are readable with the public anon key.

## Paired-device trust (PHASE2)

Spec: `docs/concepts/mobile-revival/PHASE2-SPEC.md`. A trusted, paired phone
controls the desktop through signed commands relayed via Supabase.

- **Pairing:** the `#pair=` fragment carries the secret. It is scrubbed from the
  URL and router, and from Sentry values, fragments and breadcrumbs. A new pairing
  link asks before replacing an existing pairing.
  ([pairing link + team key hardening](decisions/2026-10-09-pairing-link-and-team-key-hardening.md))
- **What a phone may do:** run and chat even with a paused persona
  ([M21](decisions/2026-10-07-paused-persona-phone-run-and-chat-m21.md)). Review
  decisions on App Master packets and asks are desk-only, and notes are redacted and
  capped ([review_decide](decisions/2026-10-07-phone-review-decide-desk-only-and-redacted-notes.md)).
- **What leaves the phone:** text is masked before it is signed
  ([phone masks before signing](decisions/2026-10-09-phone-masks-before-signing.md),
  [masker fixture v2](decisions/2026-10-09-masker-keeps-its-marker-fixture-v2.md)).
- **Command plane integrity:** a finished command is final and never returns to
  pending ([pending_commands guard](decisions/2026-10-07-pending-commands-update-guard.md)).

## Accepted risks

| Risk | Why it stands | Record |
|---|---|---|
| Production `script-src` keeps `'unsafe-inline'`, so injected inline script could use the phone's signing key while a tab is open | the nonce step waits for a deployment; limited by `'unsafe-eval'` removal, no raw HTML in dashboard components, and the desktop's envelope lifetime check | [unsafe-inline](decisions/2026-10-09-accepted-risk-unsafe-inline-script-src.md) |
| Execution text is mirrored raw to `synced_executions` | cloud sync is a test project only (`pvfw`) | [raw execution text](decisions/2026-10-07-accepted-risk-execution-text-synced-raw.md), [pvfw](decisions/2026-10-07-pvfw-is-the-test-supabase-project.md) |
| Rate limits are in-memory per instance | serverless instances do not share state, so limits are best-effort | `src/app/api/waitlist/route.ts` header comment |
| Admin client falls back to anon without the service-role key | keeps deployments without the key working | `src/lib/supabase-admin.ts` |

## Checking a new route

Before adding a `route.ts` under `src/app/api/`, answer these and add its row above:

1. **Who may call it?** If it lends any secret or privilege, gate it the way the
   proxy does (`verifySession` from `src/app/api/orchestrator/userSession.ts`), and
   make the refusal a 401/503, never a degraded success.
2. **Which secret does it touch?** `TEAM_API_KEY` only behind a verified session.
   `SUPABASE_SERVICE_ROLE_KEY` only through `getSupabaseAdmin()`.
3. **Can the request steer an outbound URL?** Pin the origin and refuse empty,
   `.` and `..` path segments (see `upstreamUrl`).
4. **What does it relay back?** On this origin, a non-JSON body can run as the
   app. Relay JSON only, with `nosniff` (see `relayHeaders`).
5. **Is it a write?** Add an IP rate limit (`rateLimitGuard` from
   `src/lib/server/rate-limit.ts`), validate every field against an allowlist,
   and never select PII back.
6. **Errors:** report through `captureExceptionScrubbed` (`src/lib/sentry-pii.ts`),
   never raw `Sentry.captureException`. `no-raw-sentry-capture.test.ts` enforces this.
7. **Did it settle a judgement call?** Write a record in `docs/decisions/` and link it
   from the row.
