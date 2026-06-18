# Error Monitoring & Analytics — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 2, Low: 0)

> **Verification of the 2026-05-10 critical (Sentry PII scrubber misses `event.contexts` / `extra` / `tags` / `user.id`, leaking UUIDs):** FIXED in current code. `scrubEvent` (`src/lib/sentry-pii.ts:106-192`) now walks `contexts` (145-153), `extra` (155-157), `tags` (160-168), reduces `user.id` to a correlation prefix (113-115), strips `user.email`/`ip_address`/`username`, drops `request.headers`/`request.data`, and recurses through stack-frame `vars` and breadcrumbs. The fix holds — but it is entirely unverified by any automated test (see finding 1) and has a residual depth-cap leak (see finding 2).

## 1. Security-critical PII scrubber has zero unit-test coverage and no unit harness
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing quality gate / security regression risk
- **File**: src/lib/sentry-pii.ts:1-234 (whole module); package.json:24 (only `test:e2e` exists)
- **Scenario**: A future refactor narrows a regex, reorders the scrub passes, or drops a key from `SENSITIVE_FIELDS`, and raw emails/UUIDs/persona names start flowing to Sentry again — exactly the 2026-05-10 critical. Nothing fails. The project has only Playwright e2e specs in `e2e/` and no vitest/jest runner, so a pure-function security scrubber is exercised by nothing.
- **Root cause**: The scrubber is the site's sole PII boundary before data leaves to a third-party processor, yet correctness is assumed rather than asserted. There is no unit harness in which to even write the test.
- **Impact**: false-confidence + latent security/compliance (GDPR) regression — the prior critical can silently return and ship.
- **Fix sketch**: Add a unit runner (vitest) and a `sentry-pii.test.ts` asserting redaction invariants: `scrubPii` redacts UUID→`[id:…]`, bare email→`[redacted-email]`, URL→host-only, quoted→`[redacted]`; `scrubEvent` strips `user.email`/`ip_address`/`username`, prefixes `user.id`, and removes every `SENSITIVE_FIELDS` key from `contexts`/`extra`/`tags`/breadcrumb `data` (the exact fields from the 2026-05-10 regression).

## 2. `scrubData` returns nested values un-scrubbed past depth 6, leaking PII in deep contexts/extra payloads
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: PII leak / silent passthrough
- **File**: src/lib/sentry-pii.ts:88-103 (line 89)
- **Scenario**: A caller passes `Sentry.captureException(err, { contexts: { trace: { a: { b: { c: { d: { e: { userEmail, executionId } } } } } } } })`, or any framework-attached deep object (Redux state, nested API response). At `depth > MAX_SCRUB_DEPTH` (6), `scrubData` `return value` verbatim — the string regex pass and the `SENSITIVE_FIELDS` key-deletion are both skipped, so raw emails, UUIDs, and denylisted keys ship to Sentry unredacted.
- **Root cause**: The depth cap was added to bound cyclic/pathological structures, but it bails by returning the raw subtree instead of a safe sentinel. For a PII scrubber the safe direction on "too deep to scrub" is to drop, not to passthrough.
- **Impact**: security — PII leakage through the very `contexts`/`extra`/`tags` paths the 2026-05-10 fix was meant to close, just one nesting level deeper.
- **Fix sketch**: At the depth cap, return a redaction marker rather than the value, e.g. `if (depth > MAX_SCRUB_DEPTH) return "[redacted-depth]";`. Raise the cap modestly if legitimate payloads nest deeper, but never passthrough raw.

## 3. Admin-gated stats purge/POST endpoint has no test for its auth boundary
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing quality gate / auth boundary
- **File**: src/app/api/stats/route.ts:377-450 (`isAdminAuthorized`, `DELETE`/`POST`)
- **Scenario**: The DELETE/POST handler deletes the on-disk cache and re-aggregates; it is gated by `isAdminAuthorized` (timing-safe SHA-256 compare, 503 when `STATS_ADMIN_TOKEN` unset, 401 on mismatch). A refactor that, say, moves the `!expected` guard, swaps `timingSafeEqual` for `===`, or relaxes the `Bearer` regex would open the endpoint — and no test would catch it. There is no unit/integration test for any branch of this gate.
- **Root cause**: The gate is the only thing standing between the public marketing endpoint and an unauthenticated cache-purge/DoS, yet its three branches (missing-secret→503, bad-token→401, good-token→200) are asserted by nothing. Auth correctness is assumed.
- **Impact**: false-confidence on a security boundary — a regression that makes the purge endpoint publicly callable ships undetected.
- **Fix sketch**: Add tests (under the new unit runner, or a Playwright API spec) covering: unset `STATS_ADMIN_TOKEN`→503; missing/malformed `Authorization`→401; wrong token→401; correct `Bearer $token`→200 with `purged:true`; and that a wrong-token attempt does NOT delete the cache file.

## 4. Consent-granted analytics path calls `Sentry.metrics.count` unguarded, so an SDK throw propagates into UI click handlers
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: error handling inconsistency / silent UX failure
- **File**: src/lib/analytics.ts:16-25 (vs the guarded 27-38)
- **Scenario**: A consented user clicks "upvote"/"download"/"comment". `trackFeatureVote` → `trackEvent` → `Sentry.metrics.count(name, 1, { attributes })` with NO try/catch. The flush path (`flushAnalyticsQueue`, 31-36) deliberately wraps the identical call to "not turn a transient hiccup into a permanent blackout" — but the direct path does not. If `Sentry.metrics.count` throws (SDK not initialized, metrics disabled, transient internal error), the exception bubbles into the React click handler that called the tracker.
- **Root cause**: Two call sites for the same fragile third-party call, but only one is hardened. The hardening rationale in the flush path applies equally to the direct path.
- **Impact**: UX degradation — a telemetry hiccup can break a user-facing action (vote/comment/download) instead of failing silently, the opposite of the stated design intent.
- **Fix sketch**: Wrap the direct emit in the same try/catch, e.g. extract a `safeCount(name, attrs)` helper used by both `trackEvent` and `flushAnalyticsQueue` so analytics can never throw into UI code.

## 5. Pre-consent analytics queue silently drops events (FIFO at 50) and only ever flushes on the "Accept All" click
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: silent data loss / analytics under-counting
- **File**: src/lib/analytics.ts:8-38; src/components/CookieConsent.tsx:39-43
- **Scenario**: Before consent, `trackEvent` enqueues; at 50 entries it `queue.shift()` (drops the oldest) — page views and clicks during a long pre-consent session are silently discarded. The queue is flushed in exactly one place: `accept("all")` in CookieConsent (line 42). A user who closes the banner with the X or "Essential Only", or who navigates/closes the tab before deciding, loses every queued event; and a user who later grants consent through any other surface never triggers a flush.
- **Root cause**: The queue is a best-effort in-memory buffer with a single hard-coded flush trigger and a lossy overflow policy, with no persistence and no dedup against the live direct path — so events straddling the consent boundary are dropped, not deferred.
- **Impact**: analytics under-counting / data loss — early-session funnel events (the most valuable for a marketing site) vanish, skewing `page_view`/`download_click`/`feature_vote` totals.
- **Fix sketch**: Flush on every transition to consent (e.g. a storage/event listener, not just the one button), and on overflow either drop newest-with-a-counter or coalesce duplicate `(name, attributes)` rather than blindly shifting; document that pre-consent loss is acceptable only if intended.
