# Shared Types, Utilities & Hooks — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. Zero unit-test harness for the highest-blast-radius pure helpers (validation/format/url/request)
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing-test-harness / false-confidence
- **File**: src/lib/validation.ts:1-37, src/lib/format.ts:1-74, src/lib/format-date.ts:1-32, src/lib/url.ts:1-24, src/lib/server/request.ts:31-147
- **Scenario**: Any refactor of an email/voter-id regex, a duration/relative-time threshold, the URL allowlist, or the IP-trust ladder ships with only `tsc` + Playwright as a net. The repo has **no unit runner at all** (package.json scripts: only `test:e2e` → `playwright test`; sole dep `@playwright/test`). These functions are pure, deterministic, and called from every API route and content page (`isValidEmail`/`isValidVoterId`/`parseJsonBody`/`getClientIp` used across votes, waitlist, feature-comments, feature-requests, feature-boosts routes; `formatDateShort/Long` across blog + changelog).
- **Root cause**: The trust-boundary + formatting layer is exercised only end-to-end through Playwright, which cannot enumerate the accept/reject boundary table (254-char email cap, 16-64 voter-id charset, `data:`/`javascript:` URL rejection, XFF leftmost-vs-trusted, oversized-body 413) — so silent regressions in these invariants are invisible until production.
- **Impact**: false-confidence test posture on the code most likely to cause security/data bugs if it regresses.
- **Fix sketch**: Add Vitest (`vitest` + `vitest run` script; no browser needed for these). Seed batch #1 = pure functions: `validation.spec.ts` (boundary length, charset, TLD), `url.spec.ts` (http/https pass, `javascript:`/`data:`/`mailto:`/relative → `#`), `format-date.spec.ts` (UTC-stable string for a fixed date + invalid-iso "Invalid Date" guard), `format.spec.ts` (null→"-", 0, 999/1000/60000/3600000 duration boundaries). This batch is the single highest-ROI LLM-generatable target.

## 2. getClientIp trusts `x-vercel-forwarded-for` before checking TRUST_PROXY — spoofable rate-limit/abuse key off-Vercel
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: security / trust-boundary
- **File**: src/lib/server/request.ts:31-44
- **Scenario**: When the app runs anywhere the edge does not strip client-supplied headers (preview/self-host, a non-Vercel platform, or any path that reaches the origin without Vercel's edge stamping the header), an attacker sends `X-Vercel-Forwarded-For: <random IP per request>`. `getClientIp` returns that value *unconditionally* (it is checked at line 35 before the `TRUST_PROXY` gate at line 38), so each forged request lands in a fresh rate-limit bucket and abuse attribution is poisoned.
- **Root cause**: The header-trust ladder assumes `x-vercel-forwarded-for` is always set by a trusted Vercel edge. `x-real-ip`/`x-forwarded-for` are correctly gated behind `TRUST_PROXY`, but `x-vercel-forwarded-for` (equally client-spoofable off-platform) is not — the env guard is applied inconsistently.
- **Impact**: security — per-IP rate limiting (votes/waitlist) trivially defeated; skewed analytics.
- **Fix sketch**: Gate the `x-vercel-forwarded-for` branch on a platform signal too (e.g. only trust when `process.env.VERCEL === "1"` or `TRUST_PROXY === "true"`); otherwise fall through to the fingerprint path. Then unit-test the ladder with each header present/absent under both env states.

## 3. format-date helpers emit "Invalid Date" for malformed/empty iso instead of a graceful fallback
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: input-validation / UX degradation
- **File**: src/lib/format-date.ts:12-31
- **Scenario**: A blog/changelog entry (CMS- or frontmatter-sourced) has a missing, empty, or non-`YYYY-MM-DD` date. `new Date("" + "T00:00:00Z")` → `Invalid Date`, and `toLocaleDateString` on an invalid Date returns the literal string `"Invalid Date"`, which renders directly into the page next to the post title.
- **Root cause**: Unlike `relativeTime` (which guards with `Number.isFinite(ts)`) and `formatDuration`/`formatCost` (which guard `null`), the date formatters assume `iso` is always a valid `YYYY-MM-DD` and never validate the parse.
- **Impact**: UX degradation — user-visible "Invalid Date" on content pages; also a hydration risk if SSR/client disagree on parse.
- **Fix sketch**: After constructing `d`, `if (Number.isNaN(d.getTime())) return "";` (or a sentinel) in both formatters; cover with the format-date test batch from finding #1.

## 4. relativeTime's once-per-session skew breadcrumb flag is module-global and never resets on the client
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: observability / stale-state
- **File**: src/lib/format.ts:28-64
- **Scenario**: The first future-skewed timestamp arms `skewBreadcrumbReported = true` for the lifetime of the loaded JS module. In an SPA navigation session the user may hit transient skew early (e.g. one bad upstream row), and every *subsequent, genuinely new* skew event for the rest of that session is silently dropped — the diagnostic the comment promises ("breadcrumb once per session") only ever fires for the very first occurrence, regardless of cause or how much time passes.
- **Root cause**: A boolean latch is used as a rate-limiter with no time-window reset; "once per session" conflates "first ever" with "first per meaningful window."
- **Impact**: observability — undercounts/loses skew diagnostics; low user impact but defeats the intended Sentry signal. (Not a server-leak: the `typeof window` guard correctly scopes it client-side.)
- **Fix sketch**: Replace the boolean with a timestamp throttle (e.g. report at most once per N minutes: `if (Date.now() - lastReportedAt > WINDOW)`), or count + report periodically. Add a test asserting fallback string is the UTC absolute date regardless of the flag.

## 5. useSearchParamState is read-once and never re-syncs when the URL changes underneath it
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: stale-state / hook-lifecycle
- **File**: src/hooks/useSearchParamState.ts:12-29
- **Scenario**: On `/connections`, state is seeded from `?category`/`?q`/`?connector` only at mount (`useState(() => searchParams.get(key) || default)`). If the URL's search params later change without a remount — back/forward navigation, a shared deep link clicked while the page is already mounted, or any external `router.push` that alters those params — the hook keeps the **stale** initial value. The page's own writeback effect (connections/page.tsx:31-38) then immediately `replaceState`s the stale value back into the URL, *erasing* the new param the user navigated to.
- **Root cause**: The hook is documented as "read-once" and assumes the URL only ever changes as an *output* of local state, never as an *input* after mount — but `useSearchParams` is reactive and back/forward + deep links violate that assumption, and the consumer's unconditional writeback turns the desync into silent data loss of the URL state.
- **Impact**: UX degradation / lost navigation state — back-button and shared filtered links don't restore the intended view.
- **Fix sketch**: Either add a `useEffect` that re-seeds state when `searchParams.get(key)` changes (guarding against the writeback loop), or document the read-once contract loudly and gate the consumer's `replaceState` so it never runs on the initial post-navigation render. Hook-lifecycle correctness here is reused across all param-driven pages.
