# Execution History & Streaming — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 1, High: 3, Medium: 1, Low: 0)

## 1. SSE stream route is dead code — modal streams via offset-polling, and neither has any test
- **Severity**: High
- **Lens**: test-mastery
- **Category**: coverage gap / business-critical path
- **File**: src/app/api/executions/[id]/stream/route.ts:1-83; src/hooks/useExecutionPolling.ts:44-59; src/app/dashboard/executions/executions-page/ExecutionOutput.tsx:26-27
- **Scenario**: The detail modal renders `ExecutionOutput`, which calls `useExecutionPolling` (HTTP poll of `getExecution(id, offset)` every 1s) — it never opens an `EventSource` against `/api/executions/[id]/stream`. The SSE proxy route is the artifact a prior (2026-05-10) "streaming/retry reliability" fix hardened, but no current consumer references it, and there is zero test (no `EventSource` open anywhere; `grep` of `e2e/` shows no executions/stream spec).
- **Root cause**: The streaming surface migrated from SSE to offset-polling, but the SSE route (with its 499/502/status-normalization reconnect-storm guards) was left wired to nothing. The whole business-critical "watch a live run" path — polling lifecycle, offset advance, terminal-stop, and the proxy's status normalization — runs with no automated coverage, on a repo where the only runner is Playwright.
- **Impact**: false-confidence / unverified-critical-path — the carefully-commented reconnect-storm fix in route.ts may already be unreachable (regression risk: silent), and the path that *is* used (polling) is untested. Either the route should be deleted or re-wired and an e2e/route test added.
- **Fix sketch**: Decide the contract: if SSE is dead, delete route.ts; if it's meant to be the live path, switch `ExecutionOutput` to `EventSource`. Either way add a Playwright spec that opens the execution detail modal against a mock orchestrator and asserts output lines accumulate then stop at terminal status.

## 2. Demo-mode output viewer shows partial/empty logs — mock offset is a shared module global the hook can't reset
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: state corruption / stale closure
- **File**: src/lib/mockData.ts:501-536; src/lib/mockApi.ts:87-90; src/hooks/useExecutionPolling.ts:28-53
- **Scenario**: User opens the detail modal for the running execution, watches output stream in (mock advances global `mockOutputOffset` by 3 each poll), closes it, then re-opens the same (or any) execution. The hook resets its own `offsetRef.current = 0`, but `getMockExecutionDetail` ignores the `_offset` arg and keeps slicing from the *global* `mockOutputOffset`, which is now at the end of `MOCK_OUTPUT_LINES`. The re-opened modal shows an empty/near-empty stream that never grows, and status reads `completed` immediately.
- **Root cause**: Two offset authorities that don't agree: the hook tracks a per-instance `offsetRef` (reset on `executionId` change), while the mock tracks one process-wide `mockOutputOffset` only reset inside `executePersona`. The hook's contract assumes the server honors the `offset` it sends; the mock silently doesn't. (`outputLines` is also returned cumulative while the hook advances by `data.output.length`, so even the metadata disagrees.)
- **Impact**: UX degradation in the demo (the primary unauthenticated funnel) — the headline "watch your agent run" feature appears broken on second view.
- **Fix sketch**: Make `getMockExecutionDetail(id, offset)` honor the passed offset (`MOCK_OUTPUT_LINES.slice(offset, offset+3)`) and derive `done`/status from `offset`, removing the module-global; or key the global by `executionId` and reset on modal open.

## 3. Polling reset race: first poll's output can be wiped by the deferred queueMicrotask state reset
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: race condition / timing
- **File**: src/hooks/useExecutionPolling.ts:31-59
- **Scenario**: When `executionId` changes (modal opens, or user switches from one execution detail to another quickly), the reset effect schedules `queueMicrotask(() => setState({ output: [], status: "queued" }))` but sets `offsetRef.current = 0` synchronously. `usePolling` fires `run()` immediately on the same enable transition. If the (fast/cached/mock) `poll` resolves and calls its `setState(prev => [...prev.output, ...])` before the queued microtask runs, the microtask then overwrites that fresh output with `[]`, and `offsetRef` has already advanced — so those first lines are lost permanently (offset never re-fetches them).
- **Root cause**: Split reset — `offsetRef` reset is synchronous but the `state` reset is deferred to a microtask, creating a window where a poll result and the reset interleave with no ordering guarantee. The microtask was presumably added to dodge a React render-phase setState warning, but it broke the atomicity of "reset everything before the next poll."
- **Impact**: data loss (first stream lines silently dropped) / UX flicker on rapid execution switching.
- **Fix sketch**: Reset state synchronously in the effect body (React 19 allows setState in effects), or include an `executionId` guard inside `poll` so a result for a stale id is discarded; advance `offsetRef` only after the corresponding `setState` is committed for the current id.

## 4. dashboardFilterStore is wired to nothing on the executions page and has no unit harness for its hydrate/persist invariants
- **Severity**: High
- **Lens**: test-mastery
- **Category**: coverage gap / pure-logic reducer
- **File**: src/stores/dashboardFilterStore.ts:28-118; src/app/dashboard/executions/page.tsx:35
- **Scenario**: The executions page filter is a plain `useState("all")` (page.tsx:35) — it never reads `dashboardFilterStore`, so the "filters persist via a filter store" contract does not hold for this page, and the active filter resets to "all" on every reload. Meanwhile `dashboardFilterStore` contains the genuinely tricky, business-critical logic (hydrate coercing a persisted `"custom"` range back to `"7d"` to avoid silently widening to all-time; `setDateRange("custom")` throwing; storage-disabled try/catch) with no unit test — and the repo has no unit runner to host one.
- **Root cause**: The hydrate/persist round-trip is exactly the kind of pure reducer that an LLM-generatable test batch covers fastest, but there is no vitest/jest harness; and the store's intended consumer (executions filters) was never connected, so even an e2e test wouldn't catch a hydrate regression here.
- **Impact**: false-confidence + UX degradation — a regression in the "custom → 7d" coercion would silently show all-time data; a regression in the throw-guard would land an inconsistent `dateRange="custom"`+null state; neither is caught.
- **Fix sketch**: Add a minimal unit harness (vitest) and a test batch asserting: persisted `"custom"` hydrates to `"7d"`; unknown `dateRange` is dropped; `setDateRange("custom")` throws; persist survives a throwing `localStorage`. Separately, decide whether the executions filter should use the store (persistence) or document that it intentionally doesn't.

## 5. Markdown inline parser drops malformed link tokens and has no test for its regex invariants
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: silent failure / pure-function coverage gap
- **File**: src/components/dashboard/markdown-report/markdownInline.tsx:8-42
- **Scenario**: `renderInline` matches a `[text](url)` token via `INLINE_RE`, then re-parses it with `LINK_RE.exec(tok)`. If the outer regex matched but `LINK_RE` returns null for any reason (the `else` branch's `if (lm)` is false), the token is silently swallowed — the matched source text is neither rendered as a link nor pushed as plain text, so it vanishes from the report. There is no test asserting that every matched span is emitted (no characters lost), nor that `**a*b**`, nested/adjacent tokens, or `*` inside code fences parse predictably.
- **Root cause**: The parser advances `last = match.index + tok.length` unconditionally, but only pushes output for tokens it can fully re-parse — a matched-but-unhandled token leaves a gap with no fallback `out.push(tok)`. With no unit runner, this character-conservation invariant is untested.
- **Impact**: silent content loss in rendered agent reports (rare inputs) + false-confidence (the parser "looks tested" but isn't).
- **Fix sketch**: Add an `else { out.push(tok); }` fallback so an unhandled match is emitted as literal text; add a unit batch asserting `renderInline` output concatenates back to the input length for a corpus of mixed/malformed tokens.
