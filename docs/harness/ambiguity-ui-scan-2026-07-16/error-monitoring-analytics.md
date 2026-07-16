# Error Monitoring & Analytics — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Stats GET assumes a writable, persistent filesystem — unguarded cache write can 500 the endpoint on serverless
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: undocumented-deploy-assumption
- **File**: `src/app/api/stats/route.ts:407-408`
- **Scenario**: Deploy to any serverless/read-only-FS host (Vercel, most container platforms with read-only rootfs). On every cache miss, `GET` calls `await writeCache(response)` with no try/catch; `atomicWriteJson` does `fs.mkdir` + `fs.writeFile` under `process.cwd()/.data` and throws `EROFS`/`EACCES`, so the whole public GET returns 500 instead of the stats it already computed. Same for `appendTodaySnapshotIfMissing` inside `aggregateStats` (line 355) — history write failure aborts aggregation entirely.
- **Root cause**: The route is meticulously documented (size caps, atomic writes, floors) yet the single biggest assumption — that `.data/` is writable and persists between invocations — is nowhere recorded, and cache/history writes are treated as must-succeed instead of best-effort.
- **Impact**: On a mismatched deploy target the endpoint 500s on every cache miss even though the response was successfully built; on ephemeral FS the 30-day history silently resets, making trend7d/series permanently flat without any signal.
- **Fix sketch**: Wrap `writeCache` and the history append in try/catch (log + continue — the response doesn't depend on them succeeding), and add one comment/README line stating the persistent-disk requirement (or fall back to `/tmp` with a "history is best-effort" note).

## 2. Entire analytics pipeline can silently no-op: `Sentry.metrics.count` is version/opt-in sensitive and every failure is swallowed
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: silent-failure-mode
- **File**: `src/lib/analytics.ts:19-26`
- **Scenario**: `@sentry/nextjs` is pinned `^10.52.0`. The `Sentry.metrics` API was removed outright in SDK v9 and reintroduced in v10 with different semantics/opt-in requirements; the init in `src/lib/sentry.ts` sets `tracesSampleRate: 0` and enables no metrics option. If `Sentry.metrics` is undefined, disabled, or dropped client-side, `safeCount` catches the TypeError (or the SDK drops the metric) and returns — forever, on every event.
- **Root cause**: Deliberate never-throw design (correct for a click handler) with no counterweight: no dev-mode warning, no init-time assertion that the metrics API exists, and no recorded verification that events actually arrive in Sentry. The comment documents *why* errors are swallowed but not *how anyone would ever notice* a total blackout.
- **Impact**: Page views, download clicks, feature votes/requests/comments — the site's entire product-signal surface — can be zero in Sentry for months while every code path "works".
- **Fix sketch**: In `safeCount`, `if (process.env.NODE_ENV !== "production") console.warn(...)` inside the catch and once when `typeof Sentry.metrics?.count !== "function"`; add a one-line smoke test/checklist item ("event visible in Sentry Metrics") and pin the required SDK config (e.g. `enableMetrics`) next to `baseSentryConfig`.

## 3. QUOTED_RE over-redacts: unpaired apostrophes in prose collapse whole spans of error messages to `[redacted]`
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: over-redaction-tradeoff
- **File**: `src/lib/sentry-pii.ts:20`
- **Scenario**: An error message like `Couldn't parse the user's config file` contains two apostrophes acting as contractions/possessives, not quotes. `/'[^']{1,200}'/` matches `'t parse the user'` and replaces it with `[redacted]`, mangling the message. Any message with ≥2 apostrophes loses arbitrary interior text; stack traces run through `scrubPii` in `captureExceptionScrubbed` are affected too.
- **Root cause**: The pattern mirrors the Rust pii module (documented), but the known false-positive class — English contractions in exception text, which the marketing site's JS errors are full of — is an unrecorded tradeoff; nothing says "we accept mangled messages" vs "nobody considered it".
- **Impact**: Degraded debuggability of exactly the events Sentry exists for; engineers see `Couldn[redacted]s config file` and can't distinguish redacted PII from scrubber noise.
- **Fix sketch**: Require a non-word boundary before the opening quote (e.g. `/(?<![A-Za-z])'[^']{1,200}'(?![A-Za-z])/`) or scrub double-quoted strings only, and record the residual-risk decision in the file header; add 2–3 unit cases with contractions.

## 4. Unauthenticated `?nocache=1` / `?fresh=1` bypass lets anyone force disk I/O + re-aggregation per request
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: unauthenticated-cache-bypass
- **File**: `src/app/api/stats/route.ts:394-408`
- **Scenario**: Any client hits `GET /api/stats?fresh=1` in a loop. Each request skips both the CDN (`no-store` response) and the file cache, re-reads up to four files (waitlist up to 5MB), re-aggregates, and rewrites `stats-cache.json` — on a public marketing endpoint with no rate limit or token.
- **Root cause**: The DELETE purge path is carefully admin-gated (constant-time token compare), but the GET bypass — functionally a per-request mini-purge that also clobbers the shared cache file's `cachedAt` — has no stated intended consumer, no auth, and no documentation of why it's safe to expose.
- **Impact**: Cheap resource-amplification lever (CPU + disk writes per request); also lets an outsider keep the cache perpetually fresh-stamped, masking staleness signals. Not a data leak — floors/format are identical — hence Medium.
- **Fix sketch**: Either require the same `STATS_ADMIN_TOKEN` bearer for the bypass params, or drop them (the DELETE purge already covers the admin use case). Minor tidy while there: unreachable `return null` at `route.ts:205`.

## 5. Pre-consent analytics queue is memory-only — the highest-volume event (landing page_view) is usually lost
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: consent-flow-data-loss
- **File**: `src/lib/analytics.ts:8-37`
- **Scenario**: First-time visitor lands (no consent yet) — `PageViewTracker` fires `page_view`, which goes into the in-module array. Visitor reads the page, clicks Accept on the cookie banner... but if they reload, follow a full-page link, or accept in another tab after closing this one, the queue (module state) is gone. Only same-SPA-session acceptance (`CookieConsent.tsx:83` or the cross-tab storage listener at `:63`) ever flushes it.
- **Root cause**: The queue design assumes consent is granted within the same JS lifetime as the queued events; that assumption — and the deliberate cap of `MAX_QUEUE_SIZE = 50` silently dropping the *oldest* events — is undocumented. The `"all"` consent value is also a magic string duplicated between `analytics.ts:13` and `CookieConsent.tsx` rather than a shared constant.
- **Impact**: Systematic undercount of first-touch page views and download clicks — the funnel's most decision-relevant numbers — biased specifically against new visitors, invisible in the data itself.
- **Fix sketch**: Persist the pending queue to `sessionStorage` (it's pre-consent, so keep it device-local and small; flush + clear on grant), export a shared `CONSENT_ALL = "all"` constant, and note the 50-event drop-oldest policy where it's defined.
