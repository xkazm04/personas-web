# Waitlist & App Download — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Download route security allowlist has zero test coverage
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing quality gate / security-critical validator untested
- **File**: src/app/api/download/route.ts:35-78 (vs e2e/download.spec.ts:1-23)
- **Scenario**: A future refactor weakens `validateDownloadUrl` — e.g. someone drops the `parsed.protocol !== "https:"` guard, adds a wildcard host, or fat-fingers the allowlist Set — and `/api/download` silently becomes an open redirect to a `javascript:`/`data:`/attacker-CDN URL. Nothing in CI catches it.
- **Root cause**: The only "download" test (`e2e/download.spec.ts`) exercises the `/download` *marketing page* (renders platform options, system requirements, footer link). The actual security control — the env-driven redirect allowlist in the `/api/download` *route* — is never invoked by any test. The route is the entire reason the allowlist exists, yet its branches (parse-fail → `/#download`, non-https → fallback, off-allowlist host → fallback, valid host → 302 to artifact) are unverified.
- **Impact**: false-confidence test (the green "Download" suite implies the redirect is safe); a real regression in an open-redirect-to-malware control could ship undetected — a business-reputation/security path.
- **Fix sketch**: Add a Playwright API-level spec hitting `/api/download` with `NEXT_PUBLIC_DOWNLOAD_URL` set to (a) an allowlisted https host → assert 3xx Location equals it, (b) an off-allowlist host, (c) an `http:` URL, (d) garbage/unset → assert each redirects to `/#download`. Use `request.get('/api/download', { maxRedirects: 0 })` and assert `response.headers().location`.

## 2. fetchCount inverted catch silently swallows real network errors (success theater)
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: silent failure / caught-and-forgotten error
- **File**: src/components/WaitlistModal.tsx:35-45
- **Scenario**: The waitlist count fetch (`GET /api/waitlist`) fails for a genuine reason — 429 rate-limit, 500, DNS/offline, CORS — while the modal is open. The user sees no count and ops sees nothing.
- **Root cause**: The catch body is `if (!(err instanceof DOMException && err.name === "AbortError")) return;`. The intent was clearly "ignore AbortError, report the rest," but the only action in the branch is a bare `return` at the end of the function, so a genuine network error is caught and discarded with no `Sentry.captureException` (unlike `handleSubmit`, which does report). Non-2xx responses are also dropped because the `if (res.ok)` block has no `else`. The error path is pure success theater — it looks handled but does nothing.
- **Impact**: UX degradation (the "Join N people waiting" social-proof header silently never appears) plus zero observability into a failing public endpoint.
- **Fix sketch**: In the catch, early-return only on AbortError, then `Sentry.captureException(err, { tags: { component: "WaitlistModal", op: "fetchCount" } })`; optionally surface a non-blocking "couldn't load count" state for non-`res.ok` responses.

## 3. Waitlist dedup index desyncs from disk on serverless / cold start → accepted "duplicates" and wrong counts
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: state corruption / stale in-memory index
- **File**: src/app/api/waitlist/route.ts:64-89, 142-166
- **Scenario**: Two warm serverless instances (or one instance after another already wrote the file) each built `dedupIndex`/`platformCounts` from their own first read. Instance B never re-reads after instance A appends, so the same email+platform passes the `dedupIndex!.has(key)` check on B and a second row is appended; the per-instance `platformCounts` also diverge, so `GET /api/waitlist` returns different counts depending on which instance answers.
- **Root cause**: The indices are built once (`if (!dedupIndex || !platformCounts)`) and then trusted as the source of truth, but the backing store is a shared file that other processes mutate. `withWriteLock` only serializes within a single process; it cannot serialize across instances, and the index is never invalidated/rebuilt against the freshly-read `data` inside the lock. The module header even documents the filesystem is ephemeral and the rate limiter is per-instance, but the dedup/count caches inherit the same flaw without acknowledging the duplicate-insert consequence.
- **Impact**: data integrity — duplicate waitlist rows and inconsistent public counts under any multi-instance deploy (the documented production target).
- **Fix sketch**: Rebuild the dedup/count from the `data` just read *inside* `withWriteLock` (don't gate on `if (!dedupIndex)`), or — per the file's own TODO — move dedup to a DB `UNIQUE(email, platform)` constraint so correctness doesn't depend on per-process memory.

## 4. No unit harness for the shared email validator / EMAIL_RE invariant
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: coverage gap on a duplicated trust-boundary validator
- **File**: src/lib/validation.ts:8-13 and src/components/waitlist-modal/waitlistUtils.ts:2
- **Scenario**: `EMAIL_RE` is defined twice — once server-side in `validation.ts` (with a 254-char length cap) and once client-side in `waitlistUtils.ts` (no cap). A future edit to one copy (tightening/loosening the char class, the `{2,}` TLD rule, or the length cap) drifts from the other, so the client accepts something the server rejects (confusing UX) or vice-versa. There is no unit runner, so nothing pins the invariant.
- **Root cause**: The same regex was copy-pasted across the trust boundary with no single source of truth and no test asserting the two agree (or asserting the documented anti-injection intent: rejects `<>'"`;(){}[]\\` and angle brackets, requires a 2+ alpha TLD, caps at 254 chars). The project has no vitest/jest, so "validator behavior" is entirely unverified.
- **Impact**: false-confidence / latent UX divergence on the primary lead-capture path; a silent ReDoS/over-permissive regression would be invisible.
- **Fix sketch**: Either import `EMAIL_RE` from one module into both, then add a small LLM-generatable table-driven test (valid: `a@b.co`; invalid: empty, `no-at`, `a@b`, 255-char local-part, `a<b>@c.com`, `a@b.c`); since there's no unit runner, gate it via a tiny `scripts/check-*.mjs` node assertion in CI or a dedicated Playwright API spec hitting `POST /api/waitlist` with each fixture.

## 5. Client trims email for display but submits the raw value; relies entirely on server normalization
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: input normalization mismatch / edge case
- **File**: src/components/WaitlistModal.tsx:61-88
- **Scenario**: A user pastes `"  User@Example.com  "` (leading/trailing whitespace, mixed case). The client validates `email.trim()` and displays `setSubmittedEmail(email.trim())`, but the POST body sends the untrimmed, un-lowercased `email` (line 78). Dedup correctness then hinges on the server's `email.trim().toLowerCase()` being byte-identical to whatever the client validated.
- **Root cause**: Three representations of "the email" coexist (raw `email` on the wire, `email.trim()` for validation+display, server `trim().toLowerCase()` for storage). They happen to converge today, but the client validating one string and transmitting a different one is fragile: if the server normalization ever changes (e.g. also stripping `+tag`), the client's optimistic `setWaitlistCount(prev+1)` and success display can disagree with what was actually stored, and a whitespace-only difference could let the same human re-submit before the server collapses it.
- **Impact**: minor data-consistency / UX-trust risk on the signup path; currently masked by server-side normalization, so low likelihood but real if either side drifts.
- **Fix sketch**: Compute `const normalized = email.trim().toLowerCase()` once in `handleSubmit`, validate it, send it in the body, and use it for `setSubmittedEmail` — single source of truth matching the server.
