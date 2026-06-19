# Fix Wave 4 — Test Infrastructure (the test-mastery half)

> 8 commits. Introduced the project's first unit-test runner + a per-area coverage gate, seeded 36 tests across 8 files (all green), folded in 2 small source fixes the tests surfaced, fixed 3 stale e2e specs, and committed the user's in-progress DevInspector tool (authorized).
> Baseline preserved: tsc 0 → 0; `vitest run` 36/36 pass; coverage gate green (96% stmts / 93% branch on gated modules).
> Branch: `vibeman/bug-test-fixes-2026-06-19`.

## Why this wave

The single dominant test-mastery theme across the 33-context scan was **"no unit runner exists"** — ~30 High findings reduced to "this business-critical pure module (validator / scorer / parser / security boundary) has zero tests, and the only runner is Playwright e2e which can't reach it." This wave installs the runner and seeds the highest-ROI batches, prioritizing tests that also **lock in the Wave-1..3 fixes** so they can't silently regress.

## Commits

| # | Commit | What |
|---|---|---|
| 1 | `c484392` | chore: DevInspector dev tool (user's in-progress files, authorized — `layout.tsx` imports it so the branch builds) |
| 2 | `f07c61b` | chore(test): vitest 4 + `@vitest/coverage-v8` + scripts + config + `server-only` stub (manifest also carries the DevInspector deps) |
| 3 | `fd183f0` | fix(leaderboard): stable A→Z name tiebreaker in both sort directions (surfaced by the test) + test |
| 4 | `eaf6cd1` | fix(content): `format-date` NaN guard (no literal "Invalid Date") + test |
| 5 | `76bd823` | test: seed batches — validation, url, slaFormat, flow-composer decode, sentry-pii, getClientIp |
| 6 | `4282595` | test(e2e): fix stale assertions (guide topic rename, roadmap area title, templates removed-section) |

## Tests seeded (36 across 8 files)

| File | Locks in | Asserts |
|---|---|---|
| `validation.test.ts` | — | email boundary table (254 cap, injection chars, TLD), voter-id 16–64 charset |
| `url.test.ts` | — | http/https pass; javascript:/data:/vbscript:/mailto:/relative → `#` |
| `format-date.test.ts` | W4 fix | UTC-stable formatting + `""` on invalid input |
| `flow-composer/data.test.ts` | **W3 #4** | decodeFlow rejects garbage / dangling wires / non-string from/to/label |
| `sentry-pii.test.ts` | **W3 #2** | scrubPii UUID/email markers; scrubEvent depth-cap → `[redacted-depth]`, no raw email |
| `server/request.test.ts` | **W3 #1** | getClientIp trust ladder: req.ip > gated x-vercel-forwarded-for > TRUST_PROXY headers > fingerprint |
| `leaderboardSort.test.ts` | W4 fix | rankByComposite tie-break, sortPersonas asc/desc with stable A→Z tiebreak |
| `slaFormat.test.ts` | — | complianceBand band boundaries (0.995/0.98/0.95), ms/s + % formatting, invalid-iso → `-` |

## Coverage gate

`test:unit:cov` enforces a **per-area** threshold (statements 80 / branches 72 / functions 72 / lines 80) scoped to the comprehensively-covered pure modules (validation, url, format-date, leaderboardSort, slaFormat) — currently **96% / 93% / 94% / 96%**. The security modules (sentry-pii, request, flow-composer) have tests that lock the fixes but also e2e-/browser-bound branches (scrubEvent, parseJsonBody, the window-gated encodeFlow), so gating their full surface would be coverage-for-coverage's-sake; they're promoted into the gate as their batches grow.

## Verification

| Gate | Result |
|---|---|
| `tsc --noEmit` | 0 errors (now also typechecks `*.test.ts`) |
| `vitest run` | 36/36 pass, 8 files |
| `test:unit:cov` | gate green (96% stmts on gated modules) |
| ESLint (changed files) | 0 errors |
| `next build` | run at campaign end (see CUMULATIVE-STATUS) |
| Playwright e2e | not run (needs live server); e2e edits verified by source-match |

## Deferred

- **Broaden the gate**: promote sentry-pii / request / flow-composer into the coverage `include` as their batches grow; add batches for `guide-search`, `format.relativeTime`, the vote/boost/comment route validators, and the manual-review `useReviewBulkActions` reducers (the remaining test-mastery Highs).
- **connections.spec.ts**: two connector-modal tests remain `test.skip` (flakiness-deferred per their comment + the scan's note that `SetupCTA`/`CopyButton` are dead code). Need a stable-selector rewrite + a real run.
- **Wire the gate into CI / the existing git-hook installer** (`scripts/install-git-hooks.mjs`) so `test:unit` runs pre-push — left as a deliberate non-goal (CI/hook changes need explicit sign-off).

## Cumulative status (after Wave 4)

| Wave | Theme | Closed |
|---|---|---|
| 1 | Data correctness & durability | 6 (2C/3H/1M) |
| 2 | Success-theater & state corruption | 6 (6H) |
| 3 | Security & compliance | 6 (4H/2M) |
| 4 | Test infrastructure | runner + 36 tests + 2 fixes + 3 e2e repairs |
| **Total** | | **18 findings closed + the entire "no unit runner" theme addressed** |

Remaining bug themes per INDEX (still open): F (lifecycle/leaks — incl. deferred timeline-pause + connection-status), G (time/numeric tail), J (dead-code cleanup), plus the Medium/Low tail.
