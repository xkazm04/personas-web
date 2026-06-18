# Orchestrator API Client & Mock Data — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 1, High: 3, Medium: 1, Low: 0)

## 1. supabaseApi successRate/successTrend are fractions (0–1); mock + UI treat them as percentages
- **Severity**: Critical
- **Lens**: bug-hunter
- **Category**: mock/real contract divergence
- **File**: src/lib/supabaseApi.ts:524-532 (vs src/lib/mockData.ts:578-586, consumed at src/app/dashboard/observability/performance-view/PerformanceMetricsGrid.tsx:28)
- **Scenario**: A real tenant runs in cloud-sync mode (`NEXT_PUBLIC_DATA_SOURCE=supabase`). The dashboard reads `metrics.successRate` and renders `${(metrics?.successRate ?? 0).toFixed(1)}%`.
- **Root cause**: The `ObservabilityMetrics.successRate` contract is unitless and undocumented. The mock fixture sets it to a percentage (`successRate: 89.4`, `successTrend: -2.1`), but `supabaseApi.getObservabilityMetrics` computes `totalSuccesses / totalExecutions` (a fraction 0–1) and `successTrend` via `pctChange` of two *fractional* rates. Every implementation behind the shared `ApiClient` interface is free to pick its own unit; nothing enforces parity.
- **Impact**: data/UX corruption on the real money/health surface — a 89.4% fleet renders as "0.9%" in production sync mode (and the success ring / mobile StatCard show the same wrong value), while the demo looks perfect. Classic success theater: the bug is invisible in the only mode QA exercises.
- **Fix sketch**: Pin the unit in the `ObservabilityMetrics` type doc-comment (e.g. "percentage 0–100"), then multiply the supabase `successRate` and the two rate inputs to `successTrend` by 100; add a contract test asserting all three `ApiClient` impls return `successRate` in 0–100.

## 2. No unit harness for the fetch wrapper / proxy / query / mock-parity boundary
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing quality gate
- **File**: src/lib/api-fetch.ts, src/lib/api.ts:57-128, src/lib/dashboard-queries.ts, src/proxy.ts (package.json:17-31 — only `test:e2e`)
- **Scenario**: Any change to `orchestratorFetch` (timeout/abort, 204 handling, header forwarding, ApiError body), to the demo/supabase/real dispatch Proxy, or to a mock fixture shape ships with zero fast feedback — only Playwright e2e exists, and e2e exercises the *mock* path, never the real/supabase branches or the timeout/non-2xx paths.
- **Root cause**: The data boundary the entire dashboard depends on has no unit runner. The whole project is Next 16 + Playwright with no vitest/jest config and no source-level `*.test.ts`. Mock/real contract parity (finding #1, #3, #4, #5) is exactly the prime, easily-LLM-generatable test target that is currently untestable.
- **Impact**: false confidence — green e2e + tsc cannot catch unit-level regressions in `orchestratorFetch` (timeout→AbortError mapping, 204→undefined, ApiError on non-2xx) or any mock-vs-real shape drift. Bugs like #1 reach production undetected.
- **Fix sketch**: Add vitest (jsdom) with a `test:unit` script; seed it with (a) an `ApiClient`-parity suite that drives mock + supabase + real over a stubbed `fetch`/supabase asserting identical field shapes & units, and (b) `orchestratorFetch` tests for timeout-abort, 204, and non-2xx ApiError.body.

## 3. Mock getExecution ignores the polling offset → infinite "running" loop, divergent from real/supabase
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: mock/real behavior divergence + shared mutable state
- **File**: src/lib/mockApi.ts:87-90, src/lib/mockData.ts:501-536
- **Scenario**: Two demo users (or one user polling two running executions, or React StrictMode double-invoke) poll execution detail concurrently. `getExecution` discards the `offset` arg and advances a single module-level `mockOutputOffset`; the real and supabase impls instead key output off the request's `offset`/the row.
- **Root cause**: `getMockExecutionDetail` keeps progress in one process-global `let mockOutputOffset` shared across all callers and all demo sessions, and the mock signature drops `offset` entirely. The real client passes `offset` so the server is stateless per-request; the mock is stateful and global — opposite contracts. `executePersona` resets the offset globally, so starting one run rewinds another run's in-flight stream.
- **Impact**: UX degradation / flaky demo — interleaved polls skip or duplicate output chunks and the "done at end-of-array" check races, so the stream can never reach `completed` (composer/poller wedged). Also a coverage gap: the offset contract is exactly what a parity test would catch.
- **Fix sketch**: Make the mock honor the passed `offset` (derive `chunk = LINES.slice(offset, offset+3)`, `done = offset+3 >= LINES.length`) and drop the module-level `mockOutputOffset`/`resetMockOutputOffset`, matching the stateless real/supabase contract.

## 4. orchestratorFetch swallows non-JSON / empty 2xx bodies as a raw SyntaxError
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: error normalization / JSON parse failure
- **File**: src/lib/api.ts:120-127
- **Scenario**: The orchestrator (or a proxy / load balancer / gateway) returns a 200 with an empty body, an HTML error page, or `text/html` (e.g. a 502 rewritten to 200, a maintenance page). `res.ok` is true and status isn't 204, so `return res.json()` runs.
- **Root cause**: Success-path body handling assumes every non-204 2xx is valid JSON. A malformed/empty/HTML body throws a bare `SyntaxError: Unexpected token <` that bypasses the `ApiError` normalization, so callers, Sentry tags, and the listAllSubscriptions catch see an un-typed parse error instead of a meaningful API failure — and it is reported as a client crash, not an upstream fault.
- **Impact**: UX degradation + misleading telemetry — cryptic crash with no status/URL context; harder triage. Untested (no unit harness, finding #2).
- **Fix sketch**: Wrap `res.json()` in try/catch and rethrow as `new ApiError(res.status, "Invalid JSON from " + path + ": " + text.slice(0,200))`; treat empty 2xx bodies as `undefined as T`.

## 5. listAllSubscriptions silently drops failed personas; demo mock never fails → divergence + hidden gaps
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: silent partial failure / success theater
- **File**: src/lib/api.ts:245-268 (mock: src/lib/mockApi.ts:137-140)
- **Scenario**: In production, one persona's `/subscriptions` call fails (timeout, 500, auth). `Promise.allSettled` keeps the rest; the rejected one is sent to Sentry but the returned array silently omits that persona's subscriptions — the UI shows a complete-looking list that is actually missing rows, with no user-visible degraded-state signal. The demo mock (`Object.values(...).flat()`) can never reject, so this partial-failure path is never seen in QA.
- **Root cause**: Partial failure is logged to Sentry but not surfaced to the caller/UI, and the mock has no failure-injection, so the "some personas failed to load" state is both invisible to users and uncovered by tests.
- **Impact**: false-confidence test + silent data omission — operators trust an incomplete subscription list; demo never exercises the degraded path.
- **Fix sketch**: Return `{ subscriptions, failedPersonaIds }` (or throw if all fail) so the UI can show a "couldn't load N agents" banner; add a mock/contract test that injects a per-persona rejection and asserts the degraded shape.
