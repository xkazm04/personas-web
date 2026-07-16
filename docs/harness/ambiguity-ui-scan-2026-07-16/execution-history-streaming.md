# Execution History & Streaming — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 4, Medium: 1, Low: 0)

## 1. SSE execution-stream proxy is dead code — the modal actually polls
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: sse-proxy-dead-code-drift
- **File**: `src/app/api/executions/[id]/stream/route.ts:9`
- **Scenario**: The context (and the route's own doc comment) describe the detail modal as "streaming individual execution logs via an SSE proxy". Grep for consumers: the only `EventSource` in the app is `useEventStream.ts:115`, which connects to `/api/events/stream`. Nothing anywhere constructs `/api/executions/<id>/stream`. `ExecutionDetailModal` → `ExecutionOutput` uses `useExecutionPolling` — plain 1s HTTP polling via `api.getExecution`.
- **Root cause**: The per-execution SSE route was built (with careful 499/502/reconnect-storm handling) but the UI was wired to the polling hook instead; neither the route nor the docs record which transport is canonical, so both are being maintained.
- **Impact**: Dead, untested proxy code that silently rots (its 1xx-normalization and abort handling will never fire); anyone reading the architecture description debugs the wrong transport; polling at 1s per open modal is the actual load profile, not SSE.
- **Fix sketch**: Decide the transport. Either wire `ExecutionOutput` to an `EventSource("/api/executions/{id}/stream")` (reusing the reconnect discipline in `useEventStream`) and keep polling only as fallback, or delete the route and update the doc comment/context map to say "polled every 1s". Record the choice in the route or a nearby README.

## 2. `NEXT_PUBLIC_TEAM_API_KEY` is client-bundled — the "server-side key" comment is false
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: public-env-key-defeats-proxy
- **File**: `src/app/api/executions/[id]/stream/route.ts:24`
- **Scenario**: The route comment says "EventSource cannot send custom headers, so the team API key is attached server-side" — implying the proxy exists to keep the key off the client. But the env var is `NEXT_PUBLIC_*`, which Next.js inlines into every client bundle, and `src/lib/api.ts:89` already reads the same var from client-side code (the stores/hooks calling it are `"use client"`).
- **Root cause**: The secrecy rationale was written down, but the variable naming contradicts it; there is no recorded decision on whether this key is meant to be public (demo key) or secret (team credential).
- **Impact**: If the key is meant to gate anything real, it is extractable from the JS bundle by anyone who views source — the proxy provides zero protection. If it is intentionally public, the route comment is misleading and future maintainers will trust a non-existent boundary.
- **Fix sketch**: Pick one and document it. Secret path: rename to server-only `TEAM_API_KEY`, move all authenticated orchestrator calls behind server routes (api.ts stops attaching it client-side). Public/demo path: rewrite both route comments to state explicitly that the key is a public demo credential and the proxy exists only for the EventSource-header limitation.

## 3. Execution output viewer has no error state — failed polls look like "waiting for worker" forever
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: missing-error-state-silent-retry
- **File**: `src/hooks/useExecutionPolling.ts:44`
- **Scenario**: Open the detail modal while the orchestrator is down (or the execution id 404s). `api.getExecution` rejects every second; `usePolling`'s `tick` swallows the rejection ("callers handle errors internally" — this caller doesn't), state stays `{ output: [], status: "queued" }`, so `ExecutionOutput.tsx:106` renders the "waiting for worker" empty state indefinitely while silently re-fetching every 1s.
- **Root cause**: `poll` has no catch and `ExecutionPollState` has no error field; the happy path (fetch succeeds, status eventually terminal) is the only path implemented. The 1s interval and `MAX_OUTPUT_LINES = 500` truncation are likewise silent — no "output truncated" indicator.
- **Impact**: Users watching a real failure see a calm "queued/waiting" state instead of an error, and the browser hammers a dead endpoint once per second per open modal with no backoff or stop condition.
- **Fix sketch**: Add `error: string | null` (and a consecutive-failure counter) to the poll state; on catch, set the error and stop polling after ~3 consecutive failures. In `ExecutionOutput`, render an inline error row with a retry button (mirroring `DashboardErrorBanner` styling). Optionally show a "showing last 500 lines" chip when truncation occurs.

## 4. DataTable's ARIA table is structurally invalid — cells lose column association
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: aria-table-structure-invalid
- **File**: `src/components/dashboard/DataTable.tsx:64`
- **Scenario**: A screen-reader user navigates the executions table. The container is `role="table"` with `role="row"` and `role="columnheader"` divs, but data cells are plain divs with no `role="cell"`, there are no `rowgroup`s, and for clickable rows every cell is nested inside an inner `role="button"` div that sits between the `row` and its content.
- **Root cause**: ARIA table semantics were half-applied: the roles required for the pattern (`row` → `cell`, header/body `rowgroup`) were skipped, and interactivity was bolted on by inserting a `button` role inside the row, which breaks the required parent/child ownership (`row` must directly own `cell`/`columnheader`).
- **Impact**: Assistive tech either flattens the whole grid (no column-header announcement per value — "$0.03" reads with no "Cost" context) or announces each row as one giant unlabeled button. Declaring `role="table"` and then violating its structure is worse than a plain div list, because SRs switch into table navigation mode that then misbehaves.
- **Fix sketch**: Add `role="rowgroup"` wrappers for header and body, `role="cell"` on every column div, and make the row itself the interactive element (`role="row"` + `tabIndex` + keyboard handler, with `aria-expanded` when expandable) instead of an inner `role="button"` layer — or simplest: render a real `<table>/<tr>/<td>` and keep the flex styling via `display` utilities.

## 5. "Filters persist via a filter store" — the executions filter is ephemeral local state
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: filter-persistence-drift
- **File**: `src/app/dashboard/executions/page.tsx:35`
- **Scenario**: The context map states filters persist via a filter store, and `dashboardFilterStore.ts` implements careful localStorage persistence (with hydrate-guard for the `custom` range). But the executions page never imports it — the status filter is `useState("all")`, reset on every navigation away and back, and none of the store's persisted fields (personaId, dateRange) filter this page either.
- **Root cause**: The persistence layer and the page were built to different specs; nothing records whether the executions status filter was deliberately kept ephemeral (e.g., to always show fresh "all" state) or simply never wired.
- **Impact**: Users who filter to "Failed", open a run, navigate to a persona page and return lose their filter — inconsistent with the dashboard's persisted persona/date filters. The context map misleads future work (an agent extending "the filter store" for executions would find no integration point).
- **Fix sketch**: Either add `executionStatusFilter` to `dashboardFilterStore` (persisted, validated against the known status keys on hydrate) and consume it in `page.tsx`, or annotate the store/page with the deliberate decision to keep this filter session-local — and correct the context-map description.
