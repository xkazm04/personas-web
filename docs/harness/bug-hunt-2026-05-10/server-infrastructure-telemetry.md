# Bug Hunter — Server Infrastructure & Telemetry

> Total: 8 findings (Critical: 1, High: 4, Medium: 2, Low: 1)
> Scope: 23 files
> Date: 2026-05-10

---

## 1. PII scrubber misses `event.contexts`, `event.extra`, `event.tags` and `event.user.id`

- **Severity**: Critical
- **Category**: Privacy / PII leak / Compliance
- **File**: `src/lib/sentry-pii.ts:65-105`
- **Scenario**: Code calls `Sentry.captureException(err, { contexts: { persona: { id: personaId } } })` (see `src/lib/api.ts:261-264`) or `Sentry.setContext("dashboardErrorBoundary", { errorId })`. The persona UUID, error correlation ID, and any other field passed via `contexts` / `extra` / `tags` are sent to Sentry **un-scrubbed**, even though the same UUID inside an exception message would be reduced to `[id:abc123]`.
- **Root cause**: `scrubEvent` only walks `event.user`, `event.request.headers/data`, `event.message`, `event.exception.values[].value`, and `event.breadcrumbs`. It never iterates `event.contexts`, `event.extra`, `event.tags`, `event.transaction`, or `event.user.id` (only `email/ip_address/username` are deleted — `id` survives, and the file documents itself as scrubbing `persona_id`/`execution_id` PII). Likewise `event.exception.values[].stacktrace.frames[*].vars` (local variable snapshots Sentry attaches to source-mapped frames) is untouched.
- **Impact**: Every error fired by the dashboard ships full UUIDs / persona IDs / error IDs in plaintext to Sentry, defeating the entire PII module. CLAUDE.md mandates parity with the Rust pii module — this is a compliance gap. The `listAllSubscriptions` callsite is the most active one and ships the persona id of every failure straight into `contexts.persona.id`.
- **Fix sketch**: In `scrubEvent`, walk `event.contexts`, `event.extra`, `event.tags`, `event.transaction` recursively and either drop keys in `SENSITIVE_FIELDS` or run their string values through `scrubPii`. Also delete `event.user.id` (or scrub it). Add `stacktrace.frames[*].vars` walking. Add a unit test that verifies a `Sentry.captureException(new Error("x"), { contexts: { foo: { execution_id: "..." } } })` event has `execution_id` removed.

---

## 2. Quoted-string redaction destroys readable error messages and fails on apostrophes

- **Severity**: High
- **Category**: Observability silent failure
- **File**: `src/lib/sentry-pii.ts:20, 54-62`
- **Scenario**: A real error like `TypeError: Cannot read properties of undefined (reading 'length')` is reported. After `scrubPii`, the message becomes `TypeError: Cannot read properties of undefined (reading [redacted])`. Worse, an error message containing one apostrophe (e.g. `"can't connect to host"`) starts a quoted-string match that runs up to 200 chars and redacts a huge chunk of meaningful text.
- **Root cause**: `QUOTED_RE = /'[^']{1,200}'|"[^"]{1,200}"/g` is greedy on **any** quote pair, including JS error messages where the real data is the JS-property quoting Sentry SDK uses. There is no allow-listing for non-PII quoted strings; everything goes to `[redacted]`.
- **Impact**: Legit errors lose their most diagnostic substring (the property/method name), making 50%+ of TypeErrors un-triageable. Combined with finding #1 (contexts not scrubbed), the operator is left with neither the message nor the context — only the stack — to debug user reports.
- **Fix sketch**: Constrain the regex to single-quoted strings only OR require a `name=` / `=` prefix before the quote to bias toward credential-ish inputs. Better: drop the quoted-string heuristic entirely and rely on the explicit `SENSITIVE_FIELDS` allow-list against breadcrumb/contexts data fields. Validate against a corpus of known production exception strings.

---

## 3. Stats DELETE endpoint vulnerable to CSRF — `POST = DELETE` accepts any origin

- **Severity**: High
- **Category**: Security / CSRF
- **File**: `src/app/api/stats/route.ts:424-448`
- **Scenario**: An attacker hosts a page that auto-submits an HTML form `<form method="POST" action="https://personas.ai/api/stats">`. There is no `Origin`/`Referer` check, no `Sec-Fetch-Site` check, no CORS preflight requirement (the form post is "simple"), and no CSRF token. If the admin happens to be in a tab with `Authorization: Bearer …` baked in via a browser extension or stale auth header proxy, the purge fires.
- **Root cause**: `export const POST = DELETE` widens the attack surface to a method that can be triggered by `<form>`. The bearer-token header is _required_ to authenticate, so a basic CSRF (no header injection) cannot purge — but the route also has **no Origin/Same-Site check**, so a misbehaving CDN / proxy / corporate header rewriter that forwards `Authorization` cookies-as-headers becomes exploitable. Additionally, no rate-limiting → an attacker who scoops a leaked token has unlimited purge → forced cache stampede on the public GET.
- **Impact**: (a) Surface area widened needlessly. (b) If the admin token leaks (history, screenshot, log), an attacker can repeatedly purge → repeated cache misses → file-IO storms on every edge revalidation, plus repeat fs.rename cycles on the small `.data` directory. (c) No audit log of who purged.
- **Fix sketch**: Drop `export const POST = DELETE`. Verify `Origin`/`Sec-Fetch-Site === "same-origin"` for DELETE if browser-callable. Log every successful and failed admin auth attempt with client IP (already have `getClientIp`). Add rate-limit (e.g. 1 purge / 60s) on the admin path.

---

## 4. `readCache` returns potentially-stale Cached object whose `response.series` shape is not validated

- **Severity**: High
- **Category**: Latent failure / type confusion
- **File**: `src/app/api/stats/route.ts:187-206`
- **Scenario**: Operator deploys a release with new metric (`p95LatencyMs`). The on-disk `stats-cache.json` from the previous version still passes the truthy `cached.response.series && cached.response.trend7d` check. The next GET returns the stale schema → consumers reading `cached.response.p95LatencyMs` get `undefined` and the homepage sparklines silently render NaN bars or throw `Cannot read 'map' of undefined`.
- **Root cause**: The cache validator only asserts existence of `series` and `trend7d`, not their key set. There is also unreachable `return null` at line 205. Since cache entries persist for an hour, every deploy that adds a metric serves broken data for up to 60 minutes per stale-while-revalidate window (effectively up to 70 min including SWR).
- **Impact**: Silent landing-page breakage post-deploy (the highest-stakes path on the marketing site). The CDN's `stale-while-revalidate=600` makes the broken response sticky for 10 extra minutes per edge. No telemetry — `JSON.parse` failure path returns `null` (re-aggregate), but key-shape mismatch is _accepted_.
- **Fix sketch**: Validate that `Object.keys(cached.response.series).sort()` equals `STAT_KEYS.sort()`. Bump a `CACHE_SCHEMA_VERSION` constant baked into the file and reject mismatches. Or always re-aggregate on cold start (`cachedAt` < process start time).

---

## 5. `getClientIp` honors `x-forwarded-for` without verifying upstream proxy → IP spoofing

- **Severity**: High
- **Category**: Security / spoofable identity
- **File**: `src/lib/server/request.ts:4-10`
- **Scenario**: A request hitting the server directly (e.g. preview deploy without Vercel's edge in front, or someone bypassing the CDN) sets `X-Forwarded-For: 1.2.3.4` and the function returns whatever the attacker chose. Used downstream for rate-limit keys (`src/lib/server/rate-limit.ts`) and waitlist signup attribution.
- **Root cause**: No allow-list of trusted proxy hops; first XFF token is taken verbatim. Vercel sets `x-vercel-forwarded-for` (trusted) and `x-real-ip` (trusted, last hop) — using XFF first is wrong on Vercel's stack.
- **Impact**: Trivial bypass of any IP-based rate limit by sending varying `X-Forwarded-For` headers. Skews analytics. On environments without an edge, an attacker can completely impersonate any IP for abuse purposes (e.g. brute-forcing the admin token without lockout).
- **Fix sketch**: On Vercel, prefer `request.ip` or `x-vercel-forwarded-for`. Off Vercel, only trust XFF if `process.env.TRUST_PROXY === "true"`. Take the **last** XFF hop, not the first (the first is attacker-controlled).

---

## 6. `parseJsonBody` `content-length` check trusts client header but does not enforce body size

- **Severity**: Medium
- **Category**: Resource exhaustion / silent failure
- **File**: `src/lib/server/request.ts:12-40`
- **Scenario**: Attacker sends a request with `Content-Length: 100` and a 50MB body via Transfer-Encoding chunked or a lying header. The size guard sees `100 ≤ maxBytes` and proceeds to `req.json()`, which buffers the entire stream.
- **Root cause**: The check is only on the declared `content-length`. There's no streaming size check — the moment we `await req.json()`, the runtime reads up to whatever the platform allows (Vercel: 4.5MB hobby / configurable). A missing `content-length` (the `=== null` branch) is treated as "no limit applies".
- **Impact**: Bypass of the `maxBytes` guard. Memory pressure on every public POST endpoint that uses this helper. The protection is essentially security-theater unless the client cooperates.
- **Fix sketch**: Read the body via `req.text()` first into a length-bounded `Uint8Array` (manually consume the `req.body` ReadableStream, abort if cumulative bytes > `maxBytes`), then `JSON.parse`. Or set `runtime: "nodejs"` and use `bodyParser.json({ limit })` equivalent. Reject when content-length is missing AND maxBytes is set.

---

## 7. `getSupabase()` uses lazy module-level singleton — first-error env var leaks into subsequent requests

- **Severity**: Medium
- **Category**: Latent failure / cross-request leak
- **File**: `src/lib/supabase.ts:3-14`
- **Scenario**: A serverless instance starts during a bad rollout where `NEXT_PUBLIC_SUPABASE_URL` is missing for the first request. The throw is caught upstream. Env vars get fixed mid-instance (rare but happens with edge config rollback or feature flag), but `_client` stays `null` and **every subsequent request on the same warm instance still throws** `"Supabase env vars not configured"` until the function cold-starts again.
- **Root cause**: The module-level `let _client` cache combined with throw-on-empty-env means the negative case is not memoized BUT the env values are read once per call. Less of a bug, more of a non-issue — but the related concern is: this client uses the **anon key only** and is imported from server-side route handlers (`src/app/api/feature-requests/route.ts`, `src/app/api/votes/route.ts`, `src/app/api/roadmap/route.ts`). If the team ever adds RLS-bypass logic (e.g. service-role for admin mutation of votes), there is **no separate `getSupabaseAdmin()`** — risk of pasting service-role into the anon-key file and shipping it to client bundles via the `NEXT_PUBLIC_` prefix bleed.
- **Impact**: Latent privilege-escalation footgun. Env-var rollback case requires a force-redeploy.
- **Fix sketch**: Add a `getSupabaseAdmin()` helper in a `server-only` module that uses `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix). Document in `src/lib/supabase.ts` that it MUST stay anon-only. Add a comment / lint-rule preventing `process.env.SUPABASE_SERVICE_ROLE` references in this file.

---

## 8. `relativeTime` future-skew breadcrumb fires once-per-process, not once-per-user-session

- **Severity**: Low
- **Category**: Observability / silent miss
- **File**: `src/lib/format.ts:28-54`
- **Scenario**: `skewBreadcrumbReported` is module-level. On the **server** (where this module is shared across requests in the Node runtime) the first request with a future timestamp fires the breadcrumb; every subsequent request from a user with skewed clock or skewed upstream timestamps is silently swallowed for the lifetime of the warm Node process — possibly hours.
- **Root cause**: Module-level mutable state used as a "once flag" without considering serverless runtime semantics. Comment says "once per session" — true on client, very wrong on server.
- **Impact**: Real clock-skew bugs become invisible after the first occurrence per warm instance. Diagnostic exists but is muted.
- **Fix sketch**: Either drop the once-flag entirely (Sentry breadcrumbs are cheap) and rely on its built-in dedup, or move the flag into the React context/store so it's per-mount on the client only. Server-side: don't use this code path on the server (module is mostly client-only anyway).

---

## Notes on what was checked but found clean

- `isAdminAuthorized` correctly uses `timingSafeEqual` with length-prefix early-return (the lengths differing leaks length but that's industry-accepted).
- `safeJsonLd` correctly escapes `</script` and `<!--` for stored-XSS.
- `atomicWriteJson` correctly uses pid+random temp name + `rename` and cleans up on failure.
- `WAITLIST_MAX_BYTES` / `COUNTERS_MAX_BYTES` size caps work as advertised.
- Sentry `tracesSampleRate: 0` and `sendDefaultPii: false` are correct defaults.
- `validateOrchestratorUrl` is invoked at instrumentation register-time (fail-fast).
