# Build Config & E2E Tests — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. Context-map drift: 4 listed e2e specs don't exist, 1 real spec unlisted
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: context-map-drift
- **File**: `e2e/community.spec.ts:1`
- **Scenario**: The context manifest lists `e2e/community.spec.ts`, `e2e/compare.spec.ts`, `e2e/download.spec.ts`, and `e2e/use-cases.spec.ts` — none exist on disk, and neither do `/community`, `/compare`, `/download`, `/use-cases` routes under `app/`. Meanwhile `e2e/dashboard-demo.spec.ts` (smoke coverage for the flagship demo-dashboard surface) exists but is absent from the context map.
- **Root cause**: Routes and their specs were removed (or renamed into homepage anchors — download is now `/#download`) without regenerating the context map; the new dashboard-demo spec was added without mapping it.
- **Impact**: Anyone planning work from the map budgets audits/fixes against phantom files and misses the real demo-dashboard spec entirely; scan waves and coverage accounting are silently wrong for ~30% of this context.
- **Fix sketch**: Regenerate `context-map.json` for this context: drop the 4 phantom spec entries, add `e2e/dashboard-demo.spec.ts`, and consider adding specs for the unmapped-and-untested `/how` and `/security` routes.

## 2. Tautological filter assertions in connections spec — filter tests can't fail
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: tautological-assertion
- **File**: `e2e/connections.spec.ts:16`
- **Scenario**: `search filters connectors` fills the search box with "Slack" then asserts `main` contains "Slack" — but the unfiltered page already contains "Slack" (the previous test asserts exactly that), so the test passes even if the search handler is deleted. Same shape at line 25: clicking "Databases" then asserting "PostgreSQL" is weak if PostgreSQL is visible pre-filter. Additionally, line 8 builds a `cards` locator (`[data-testid='connector-card']`) that is never asserted — dead code implying coverage that isn't there.
- **Root cause**: Assertions verify presence of the searched term rather than absence of the filtered-out ones; no negative assertion distinguishes "filter worked" from "filter did nothing".
- **Impact**: Test theater — a broken search/category filter on a key conversion page ships green; the two already-skipped modal tests mean the interactive half of `/connections` has effectively zero real coverage.
- **Fix sketch**: After filling "Slack", assert a non-matching connector (e.g. "GitHub") is NOT visible and/or assert the rendered card count shrank; for the category filter assert a non-Database connector disappears. Delete or assert the unused `cards` locator.

## 3. No `forbidOnly` in Playwright config — a stray `.only` silently shrinks CI to one test
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: missing-ci-guardrail
- **File**: `playwright.config.ts:3`
- **Scenario**: A developer debugs with `test.only(...)`, commits it, and CI goes green having run 1 of ~50 tests. The config already branches on `process.env.CI` (line 23) so CI awareness exists, but `forbidOnly: !!process.env.CI` — the standard guard — is missing, as is any `reporter` config (CI gets the default `list` with no HTML/JUnit artifact to diagnose failures alongside the on-first-retry traces).
- **Root cause**: Config covers the local-dev happy path (reuse server, one retry for traces) but the CI failure modes were never enumerated.
- **Impact**: Classic hidden-failure vector: the entire e2e gate can be reduced to a single test with zero signal that it happened; when CI does fail, no persisted report artifact exists to review.
- **Fix sketch**: Add `forbidOnly: !!process.env.CI` and `reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list"` to the config.

## 4. `script-src 'unsafe-inline' 'unsafe-eval'` in an otherwise-strict CSP, with no recorded reason
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: undocumented-security-tradeoff
- **File**: `next.config.ts:38`
- **Scenario**: The CSP is carefully constructed — `frame-ancestors 'none'`, scoped `connect-src` with a comment explaining exactly why Supabase hosts are allowed (lines 42–45), conditional Sentry entry — yet `script-src` grants both `'unsafe-inline'` and `'unsafe-eval'`, which together neutralize most of the XSS protection a CSP provides, and this line alone carries no comment.
- **Root cause**: Likely added to make Next.js hydration/dev tooling work, but the decision (which dependency actually requires `'unsafe-eval'` in production? is it dev-only?) was never recorded, unlike every other exception in the file.
- **Impact**: Future maintainers can't tell whether the directives are load-bearing or cargo-culted, so nobody will ever tighten them; any injected inline script executes despite the elaborate header block. Also, the Sentry `connect-src` entry (line 50) is baked at build time from `NEXT_PUBLIC_SENTRY_DSN` — a runtime-only DSN yields a CSP that blocks Sentry ingestion silently.
- **Fix sketch**: Test whether prod builds work with `'unsafe-eval'` removed (commonly dev-only for Next); either drop it or add a comment naming the dependency that requires it, mirroring the Supabase comment. Note the build-time-DSN constraint next to the Sentry entry.

## 5. E2E assertions pin exact marketing copy — every copy edit breaks the suite
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: copy-coupled-selectors
- **File**: `e2e/legal.spec.ts:35`
- **Scenario**: Tests assert verbatim marketing strings: "AES-256" and "yours" (legal.spec.ts:35,41), "bank-grade encryption" and "everything" (connections.spec.ts:6,58), "Our Commitment to Privacy" (legal.spec.ts:8 — whose own comment records it already broke once when copy changed from "Your Privacy Matters"), plus tour narration fragments ("stable identity", "six pillars"). Structural hooks exist in the codebase (`data-testid='connector-card'` is referenced) but the tests fall back to prose matching.
- **Root cause**: Assertions were written against whatever text happened to render instead of stable roles/testids; the copy-change comments show the maintenance tax is already being paid rather than the pattern fixed.
- **Impact**: Marketing copy iteration — the most frequent change on this site — produces spurious e2e failures, training the team to treat red e2e as noise; conversely, semantically equivalent copy that drops a magic phrase ("bank-grade") fails a "does the CTA render" test for the wrong reason.
- **Fix sketch**: Assert structure and role, not prose: sections via `data-testid`/`getByRole("heading")`, presence of an encryption blurb via a testid on that block. Reserve exact-string assertions for genuinely contractual copy (legal tab titles), and centralize tour-step phrases by importing them from `src/lib/tour-script.ts` the way guide.spec.ts already imports `GUIDE_TOPICS`.
