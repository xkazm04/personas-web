# Error Monitoring & Analytics
> Sentry across all three Next.js runtimes with a PII-scrubbing `beforeSend` pipeline, consent-gated analytics, and an admin-gated stats cache endpoint · **API:** `/api/stats` · **Status:** Config / observability

## What it does
Wires Sentry error reporting into the client, edge, and server runtimes from one shared config, then runs every outgoing event and breadcrumb through a PII scrubber (`src/lib/sentry-pii.ts`) that redacts UUIDs, URLs, quoted names, and a curated set of sensitive field keys before anything leaves the process. On the product side it provides consent-gated, low-cardinality analytics (page views, download clicks, voting/comment actions) via Sentry metrics, and a public `/api/stats` endpoint that serves cached platform counters with an admin-token-gated cache purge.

## How it works
- **Three runtimes, one config.** `sentry.client.config.ts`, `sentry.edge.config.ts`, and `sentry.server.config.ts` each call `initSentry()` from `src/lib/sentry.ts:17`, which spreads `baseSentryConfig` (DSN, `environment`, `tracesSampleRate: 0`, `sendDefaultPii: false`, and the two scrub hooks) into `Sentry.init`. The client passes overrides that disable Session Replay (`replaysSessionSampleRate: 0`, `replaysOnErrorSampleRate: 0`). If `NEXT_PUBLIC_SENTRY_DSN` is unset, init is effectively a no-op and the app runs normally.
- **Instrumentation hook.** `src/instrumentation.ts:4` (`register()`) imports the server or edge config based on `process.env.NEXT_RUNTIME`, and also fail-fast validates `NEXT_PUBLIC_ORCHESTRATOR_URL` (skipped in mock mode). `onRequestError` is re-exported from `Sentry.captureRequestError` (`src/instrumentation.ts:26`) so Next.js routes request errors into Sentry.
- **Scrub pipeline.** `beforeSend → scrubEvent` and `beforeBreadcrumb → scrubBreadcrumb` (`src/lib/sentry.ts:9`). `scrubEvent` (`src/lib/sentry-pii.ts:91`) strips `user.email`/`ip_address`/`username`, scrubs `user.id`, deletes `request.headers`/`request.data`, and scrubs `message`, `exception.values[].value`, stack-frame `vars`, `contexts`, `extra`, `tags`, and attached `breadcrumbs`. The core `scrubPii` string pass (`src/lib/sentry-pii.ts:54`) replaces UUIDs with `[id:xxxxxx]`, reduces URLs to scheme+host via `redactUrl`, and redacts quoted strings to `[redacted]`. `scrubData` (`:73`) walks objects/arrays to depth 6, deleting any key in `SENSITIVE_FIELDS`.
- **Call-site wrapper.** `captureExceptionScrubbed` (`src/lib/sentry-pii.ts:190`) pre-scrubs `error.message` and `error.stack` before `Sentry.captureException`, because `beforeSend` never touches the original Error object's strings — used by top-level error boundaries.
- **Analytics.** `src/lib/analytics.ts` exposes `trackPageView`, `trackDownloadClick`, `trackFeatureVote`, `trackFeatureRequest`, `trackFeatureComment`. Each calls `trackEvent` (`:16`), which emits `Sentry.metrics.count(name, 1, { attributes })` only when consent is `"all"`; otherwise it queues (cap 50, FIFO drop). `flushAnalyticsQueue` (`:27`) drains the queue once consent is granted.
- **Page views.** `PageViewTracker` (`src/components/PageViewTracker.tsx`) reads `usePathname`, normalizes UUID path segments to `/:id` and runs `scrubPii` on the path (`:11`), then calls `trackPageView` once per distinct normalized path (deduped via a ref).
- **Stats endpoint.** `GET /api/stats` (`src/app/api/stats/route.ts:391`) returns cached `PlatformStatsResponse` (counters + `trend7d` + 7-point `series`), aggregating from a bounded-read waitlist file + marketing floors when the cache is stale; `?nocache=1`/`?fresh=1` bypasses. `DELETE`/`POST` (`:424`/`:448`) purge the on-disk cache, gated by a constant-time Bearer check against `STATS_ADMIN_TOKEN` (`isAdminAuthorized`, `:377`).

## Key files
| File | Role |
| --- | --- |
| `src/lib/sentry.ts` | `baseSentryConfig` + `initSentry()` — shared init wiring the scrub hooks |
| `sentry.client.config.ts` | Browser runtime init (Replay disabled) |
| `sentry.edge.config.ts` | Edge runtime init |
| `sentry.server.config.ts` | Node server runtime init |
| `src/instrumentation.ts` | `register()` runtime dispatch + orchestrator URL validation; `onRequestError` export |
| `src/lib/sentry-pii.ts` | Scrub pipeline: `scrubPii`, `scrubData`, `scrubEvent`, `scrubBreadcrumb`, `captureExceptionScrubbed` |
| `src/lib/analytics.ts` | Consent-gated `trackEvent` + public `track*` helpers, queue + flush |
| `src/components/PageViewTracker.tsx` | Path-normalized, deduped page-view emitter |
| `src/app/api/stats/route.ts` | Public stats GET + admin-gated cache purge (DELETE/POST) |

## Data & state
- **Source:** Sentry SDK events/breadcrumbs; `localStorage[personas-cookie-consent]` for analytics consent; on-disk `.data/*.json` files (waitlist, stats cache, counters, history) for stats. **Stores:** in-memory analytics `queue` (max 50); `.data/stats-cache.json` (1h TTL, atomic write). **API routes:** `/api/stats` (GET public, DELETE/POST admin-gated). **Types:** `PlatformStats`, `PlatformStatsResponse`, `PlatformStatsSeries` (`src/app/api/stats/route.ts:125`); `ErrorEvent`/`Breadcrumb` from `@sentry/nextjs`; `QueuedEvent` (`analytics.ts:6`).

## Integration points
- **Env:** `NEXT_PUBLIC_SENTRY_DSN` (gates init), `NODE_ENV` (→ `environment`), `SENTRY_ORG`/`SENTRY_PROJECT` (build-time source-map upload), `STATS_ADMIN_TOKEN` (purge auth), `NEXT_PUBLIC_ORCHESTRATOR_URL` + `NEXT_PUBLIC_USE_MOCK_API` (validated in `register()`).
- **Consent:** `COOKIE_CONSENT_KEY` from `src/lib/constants.ts` couples analytics to the cookie-consent UI; `flushAnalyticsQueue` should be called when consent flips to `"all"`.
- **Error boundaries** call `captureExceptionScrubbed` rather than raw `Sentry.captureException` to scrub the original Error strings.
- **Next.js** auto-invokes `register()` and `onRequestError` from `src/instrumentation.ts`.

## Conventions & gotchas
- **`beforeSend` does NOT scrub the original Error.** `scrubEvent` only rewrites `event.message`/`exception.values[].value`; the raw `error.message`/`error.stack` are only scrubbed if the call site uses `captureExceptionScrubbed`. Any direct `Sentry.captureException(err)` can leak unscrubbed strings — prefer the wrapper.
- **Field-name allowlist is partial coverage.** Scrubbing of `contexts`/`extra`/`tags`/breadcrumb `data` relies on (a) the `SENSITIVE_FIELDS` key set and (b) the regex string pass. A sensitive value under a key *not* in `SENSITIVE_FIELDS` (e.g. `email`, `account_number`, `workspace_id`) survives unless its value happens to match the UUID/URL/quoted patterns. Add new sensitive keys to `SENSITIVE_FIELDS` (`sentry-pii.ts:24`) as payloads evolve.
- **`user.id` is scrubbed, not dropped.** It is passed through `scrubPii`, so a UUID id becomes `[id:xxxxxx]` and a non-UUID id (numeric, email-shaped) may pass through largely intact. Email/ip/username are deleted outright.
- **Depth cap.** `scrubData` stops at depth 6 (`MAX_SCRUB_DEPTH`) and returns deeper values unscrubbed — deeply nested PII can escape. The cap is intentional (cyclic/deep-tree protection on the request thread).
- **`scrubBreadcrumb` is lighter than the event path.** The standalone breadcrumb hook only scrubs `message` and deletes `SENSITIVE_FIELDS` keys — it does NOT run `scrubData` on remaining `data` values (the in-event breadcrumb pass in `scrubEvent` does). Non-sensitive-keyed string values in standalone breadcrumbs are unscrubbed.
- **`STATS_ADMIN_TOKEN` is not in `.env.example`.** The purge auth env var is undocumented in the env template; unset → `isAdminAuthorized` returns `false` and DELETE/POST return 503. Document it before relying on purge in any deployed environment. The check itself is constant-time (`timingSafeEqual`) but length-leaks via the early `a.length !== b.length` return.
- **`POST = DELETE`.** The purge handler is aliased to POST, so a POST with the bearer token also purges — intentional but easy to miss.
- **Analytics queue is unbounded in time, bounded in size.** Pre-consent events FIFO-drop past 50; nothing persists across reloads. Metric attributes are low-cardinality strings only (e.g. `trackFeatureRequest` truncates text to 200 chars).
- **`tracesSampleRate: 0`.** Performance/trace sampling is disabled by default; only errors and explicit metrics flow.

## Related docs
- [Shared Types, Utilities & Hooks](../platform/shared-utilities.md)
- [Feature index](../INDEX.md)
