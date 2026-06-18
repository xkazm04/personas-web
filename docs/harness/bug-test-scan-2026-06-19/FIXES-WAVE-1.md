# Fix Wave 1 — Data Correctness & Durability

> 6 commits, 6 findings closed (2 Critical, 3 High, 1 Medium).
> Baseline preserved: tsc 0 → 0; eslint clean on changed files. (No unit runner exists; Playwright e2e needs a live server — not run, same as baseline.)
> Branch: `vibeman/bug-test-fixes-2026-06-19` (off `master`; pre-existing uncommitted changes left untouched).

## Commits

| # | Commit | Finding | Severity | Files |
|---|---|---|---|---|
| 1 | `7627776` | vote-persistence #1 — corrupt store wipes all data | **Critical** | `src/lib/server/json-file-store.ts` |
| 2 | `e00009f` | vote-persistence #3 — orphaned `.tmp` files | High | `src/lib/server/json-file-store.ts` |
| 3 | `3a4c8de` | orchestrator #1 / observability #1 — successRate fraction vs % | **Critical** | `src/lib/supabaseApi.ts` |
| 4 | `411a3fe` | supabase #2 — mapStatus/mapEvent blind-cast | High | `src/lib/supabaseApi.ts` |
| 5 | `c67cdec` | supabase #4 — SLA successRate >100% clamp | Medium | `src/lib/supabaseApi.ts` |
| 6 | `719dd85` | orchestrator #3 — mock getExecution ignores offset | High | `src/lib/mockData.ts`, `src/lib/mockApi.ts` |

## What was fixed

1. **Vote store corrupt-wipe (Critical).** `readJsonFile`'s bare `catch {}` returned the empty fallback for *every* read failure, so a corrupt/truncated/locked `votes.json` looked like "not created yet" and the next read-modify-write renamed an empty object over the real data — wiping all votes/boosts/comments while returning `{action:"added"}`. Now only ENOENT returns the fallback; other read errors and JSON-parse failures are logged and rethrown, so the RMW aborts (500) and the corrupt file is preserved for recovery — a corrupt read can never be persisted over good data.
2. **Orphaned temp files (High).** `writeJsonFile` had no cleanup when `writeFile`/`rename` threw (EXDEV, EACCES, ENOSPC, Windows EPERM) or the process died mid-write; each uniquely-named `.tmp` orphan accumulated forever. Wrapped in try/catch that best-effort unlinks the temp before rethrowing.
3. **successRate fraction-vs-percent (Critical).** `getObservabilityMetrics` returned a 0–1 fraction while the mock and the `.toFixed(1)%` tile expect 0–100, so real Supabase mode showed a healthy 95% fleet as "1.0%" — invisible in the demo path QA uses. Multiplied real-mode successRate by 100 (successTrend is a scale-invariant pctChange, left as-is). Independently flagged by two scan agents.
4. **Blind status casts (High).** `mapStatus`/`mapEvent` cast arbitrary desktop status strings into the web enums with `as`, so schema drift flowed into badges, success-rate math, and `eq("status", …)` filters that silently never match. Now validated against explicit allow-sets; unknown execution → neutral `"running"`, unknown event → `"pending"`, both with a dev warning.
5. **SLA rate clamp (Medium).** A sync skew where `successful_executions > total_executions` produced a >100% rate shown verbatim in the SLA card; clamped to [0,100].
6. **Mock offset (High).** `getMockExecutionDetail` ignored the requested offset and used a shared module-global cursor (opposite of the stateless real/supabase contract), so concurrent pollers / StrictMode double-invoke skipped or duplicated chunks and the stream could wedge short of "completed". Now honors the passed offset and the global cursor is removed.

## Verification

| Gate | Before | After |
|---|---|---|
| `tsc --noEmit` | 0 errors | 0 errors |
| ESLint (changed files) | n/a | 0 errors |
| Unit tests | none (no runner) | none (no runner) |
| Playwright e2e | needs live server (not run) | needs live server (not run) |

## Deferred (related, not contained)

- **observability #2 — SLA breaches fabricate `startedAt = now` / `durationMinutes = 0` on every fetch** (resets a long-running breach to "just now"). A correct fix needs a breach-history table (stable onset) or a UI "point-in-time" label — not a contained edit. Carry into a later wave.

## Cumulative status (after Wave 1)

| Wave | Theme | Closed |
|---|---|---|
| 1 | Data correctness & durability | 6 (2C/3H/1M) |

Remaining per INDEX: theme A (no unit runner — the dedicated test-infra wave), B (success-theater/lying UI), C (state corruption), E (security/trust-boundary), F (lifecycle/leaks), G (time/numeric), I (consent), J (dead-code/drift). 2 genuine criticals both closed.
