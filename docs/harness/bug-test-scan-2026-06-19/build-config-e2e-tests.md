# Build Config & E2E Tests — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. Zero e2e coverage of the voting integrity path (the only real business logic in the repo)
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing-coverage / business-critical
- **File**: e2e/ (no spec) — system under test: src/app/api/votes/route.ts:89-208, src/app/api/votes/storage.ts:11-16, src/components/sections/feature-voting/
- **Scenario**: A refactor changes the toggle semantics (add→remove→email_saved), the `ALLOWED_FEATURES` allowlist, the dedup `onConflict` upsert, or the Supabase-vs-filesystem branch. Nothing fails.
- **Root cause**: The 13 specs exclusively smoke-load marketing/content pages. The one endpoint with genuine invariants — vote idempotency, per-voter uniqueness, 400 on unknown `featureId`, 429 rate-limit, email write-only-never-read — has no test at all (e2e or otherwise). `db:migrate` exists for voting, signaling it is a shipped feature, yet it is the least-tested code in the repo.
- **Impact**: false-confidence test suite; a vote-count corruption / double-vote / allowlist-bypass regression ships green. This is the project's nearest thing to a "money path."
- **Fix sketch**: Add `e2e/votes.spec.ts` driving `POST /api/votes` via `request.post`: assert `added`→`removed` toggle, 400 for `featureId` outside `ALLOWED_FEATURES`, 400 for bad `voterId`, and that `GET` never returns `email`. Best done against the filesystem fallback (no Supabase env) for determinism.

## 2. No unit runner for pure security/validation logic the e2e suite physically cannot reach
- **Severity**: High
- **Lens**: test-mastery
- **Category**: test-infrastructure / security
- **File**: src/app/api/download/route.ts:35-60 (validateDownloadUrl), src/lib/validation.ts (isValidEmail/isValidVoterId), src/app/api/votes/rate-limit.ts:8-15
- **Scenario**: Someone widens `ALLOWED_DOWNLOAD_HOSTS`, drops the `https:` guard, or weakens `isValidVoterId`. The redirect now points at an attacker host (open-redirect-to-malware — the exact threat the file's own comment describes), and no test catches it because `DOWNLOAD_URL` is evaluated at module load from an env var that e2e never sets.
- **Root cause**: `validateDownloadUrl` is a pure function gated entirely by `process.env.NEXT_PUBLIC_DOWNLOAD_URL` set before module import — Playwright (which boots one prebuilt server) cannot exercise its allowlist/protocol branches. There is deliberately no vitest/jest, so this security-sensitive pure logic has zero automated coverage anywhere.
- **Impact**: security regression (open redirect) ships undetected; same for malformed-email and rate-limit-window logic.
- **Fix sketch**: Introduce a minimal vitest config scoped to `src/lib/**` + pure route helpers; unit-test `validateDownloadUrl` for each reject branch (non-https, off-allowlist host, `data:`/`javascript:`, unparseable) and `isValidVoterId`/`isValidEmail`. Anchor the host allowlist as a snapshot so additions are a conscious diff.

## 3. `reuseExistingServer: true` silently runs the whole suite against a stale/dev server, skipping the build
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: build-config / false-pass
- **File**: playwright.config.ts:18-23
- **Scenario**: A developer (or a previous CI step) left `next dev` or an old `next start` listening on 3002. Because `reuseExistingServer: true`, Playwright skips `npm run build && npm run start` entirely and tests the already-running process — possibly dev-mode code, possibly last week's build.
- **Root cause**: `reuseExistingServer` is unconditionally `true`. The standard pattern gates it on `!process.env.CI` so CI always builds fresh; here even CI will reuse a leftover server, and locally you can pass green against code you never rebuilt. With `retries: 0` there is no second signal that something is off.
- **Impact**: false-confidence (tests pass against the wrong artifact); intermittent "works on my machine" / "passed in CI but the deployed build is broken" divergence.
- **Fix sketch**: `reuseExistingServer: !process.env.CI`. Optionally separate build from serve so a failed build can't be masked by a reused server.

## 4. Pervasive success-theater: many specs only `.toContainText` on `main`, asserting nothing observable changed
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: weak-assertions / false-confidence
- **File**: e2e/roadmap.spec.ts:4-24, e2e/community.spec.ts:4-18, e2e/use-cases.spec.ts:14-19, e2e/connections.spec.ts:14-27, e2e/templates.spec.ts:16-37
- **Scenario**: A filter button stops filtering, search stops narrowing results, or a roadmap status badge disappears. The spec still passes because the asserted substring ("Slack", "Finance", "In Progress", "Showing") is already present on the unfiltered page — the interaction's *effect* is never verified.
- **Root cause**: Interaction tests click a control then assert text that exists regardless of whether the click did anything (e.g. `connections` types "Slack" but "Slack" is on the page before filtering; `templates` clicks Finance then only checks the word "Finance" appears). They confirm "page didn't crash," not "behavior is correct."
- **Impact**: filter/search/tab regressions ship green — degraded UX with a green board.
- **Fix sketch**: Assert the observable delta: post-filter card `count()` strictly less than pre-filter count; after a search assert a known non-matching item is *absent*; assert the active-tab `aria-selected`/active class flips. Pin counts to data length, not hardcoded `>= N`.

## 5. CSP allows `'unsafe-inline'` + `'unsafe-eval'` in script-src with no test pinning the security headers
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: security-headers / coverage-gap
- **File**: next.config.ts:35-58, 79-86
- **Scenario**: An XSS sink on any content/blog page becomes script-executable because the CSP permits arbitrary inline and `eval`'d script. Separately, a future edit drops a header (HSTS, X-Frame-Options) and nobody notices.
- **Root cause**: The CSP `script-src 'self' 'unsafe-inline' 'unsafe-eval'` effectively disables CSP's core XSS protection (any injected `<script>` or inline handler runs). It is applied to `/(.*)` so even static content pages inherit it. No e2e asserts the response headers, so the security posture is untested and silently mutable.
- **Impact**: security (CSP provides little XSS defense-in-depth); a header regression is invisible.
- **Fix sketch**: Move to nonce/hash-based `script-src` (drop `unsafe-inline`/`unsafe-eval` where Next allows), and add an `e2e/security-headers.spec.ts` asserting `response.headers()` for CSP, HSTS, X-Frame-Options, X-Content-Type-Options on a representative route.
