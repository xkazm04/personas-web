# Execution History & Streaming
> A filterable executions table with a per-run detail modal that streams live output · **Route:** `/dashboard/executions` · **Nav label:** "Executions" · **Status:** Demo-only UI + real SSE proxy

## What it does

The Executions surface lists every persona run (queued, running, completed, failed, cancelled) in a sortable-feeling table, with status filter pills, per-row cancel for in-flight runs, and "load more" paging. Clicking a row opens a detail modal showing a KPI strip (duration / cost / tokens / retries), the error message if the run failed, and a terminal-style **live output viewer** that follows the run's stdout as it streams in.

For the product user this reads as "see what my agents are doing right now, drill into one, watch it work." Two pieces of plumbing back it:

- The **list + detail output** run entirely on mocks in this repo (`src/lib/mockApi.ts` → `src/lib/mockData.ts`). The viewer pulls new lines by **HTTP polling**, not a socket.
- A **real Next.js route handler** at `/api/executions/[id]/stream` proxies Server-Sent Events from the external orchestrator to the browser. It is production code (auth injection, abort handling, status normalization) but, in this repo, **nothing in `src/` actually opens that EventSource** — see gotchas.

The dashboard nav badge next to "Executions" shows the count of active (running + queued) runs, sourced from a pre-aggregated store field so the nav doesn't re-render on every list mutation.

## How it works

1. **List load + poll.** `ExecutionsPage` (`page.tsx:39`) calls `fetchExecutions()` on mount, then `usePolling(fetchExecutions, 3_000, hasRunning)` (`page.tsx:47`) re-fetches every 3s — but only while at least one run is running/queued, and only while the tab is visible (`usePolling` gates on `document.visibilityState`, `usePolling.ts:41`).
2. **Enrichment.** The store keeps `rawExecutions` normalized (no persona metadata); `useEnrichedExecutions()` (`executionStore.ts:166`) joins them against the persona store via a memoized selector, so personas loading after executions still resolve names/icons/colors without a race.
3. **Filtering + paging.** A local `filter` state ("all" / running / completed / failed / cancelled) drives a `useMemo` (`page.tsx:49`); "running" intentionally matches **running OR queued**. `visibleCount` starts at 200 and grows by 200 via the "Load more" button (`page.tsx:161`). Changing the filter resets the page size (`page.tsx:64`).
4. **Table render.** `DataTable` (generic, reused) renders columns built by `buildExecutionColumns` and a colored left-border per status via `executionRowClassName`. Row click sets `selected` and opens the modal; `DataTable`'s `expandable` path is unused here (executions use `onRowClick` instead).
5. **Detail modal.** `ExecutionDetailModal` shows KPIs + error, then mounts `ExecutionOutput` keyed by `execution.id`.
6. **Output streaming (via polling).** `ExecutionOutput` calls `useExecutionPolling(executionId)` (`useExecutionPolling.ts:20`), which polls `api.getExecution(id, offset)` every 1s, appending only new lines (offset-based), capping at 500 lines, and auto-stopping once status is terminal. The viewer auto-follows the bottom unless the user scrolls up, exposing a "Jump to latest" pill.
7. **Cancel.** Per-row cancel calls `executionStore.cancelExecution` (`executionStore.ts:110`), which is client-idempotent (skips if already in-flight or terminal), optimistically flips status to "cancelled", and recomputes `activeCount`.
8. **SSE proxy (real, separate path).** `GET /api/executions/[id]/stream` (`route.ts:9`) builds the orchestrator URL, injects the team API key server-side (EventSource can't send headers), forwards an optional `x-user-token`, and pipes `upstream.body` back with `text/event-stream` headers. It maps client aborts to 499, upstream failures to a JSON 502, and clamps out-of-range upstream statuses to avoid a 500-driven reconnect storm.

## Key files

| File | Role |
| --- | --- |
| `src/app/dashboard/executions/page.tsx` | Page: list load, poll gating, filter/paging state, modal selection |
| `src/app/dashboard/executions/executions-page/ExecutionsFilters.tsx` | Status filter pills (wraps shared `FilterBar`) + loading spinner |
| `src/app/dashboard/executions/executions-page/buildExecutionColumns.tsx` | Column defs + per-status row border class + cancel button |
| `src/app/dashboard/executions/executions-page/ExecutionsEmptyState.tsx` | Empty vs. filtered-empty states (distinct copy + "show all" action) |
| `src/app/dashboard/executions/executions-page/ExecutionDetailModal.tsx` | Detail modal: persona header, KPI strip, error, output viewer |
| `src/app/dashboard/executions/executions-page/ExecutionOutput.tsx` | Terminal-style output viewer; sticky-bottom auto-follow + jump pill |
| `src/hooks/useExecutionPolling.ts` | Offset-based output polling; stops on terminal status; 500-line cap |
| `src/hooks/usePolling.ts` | Generic interval poller; visibility-gated; clamps sub-16ms intervals |
| `src/stores/executionStore.ts` | `rawExecutions`, `activeCount`, fetch/cancel; enrichment selector |
| `src/stores/dashboardFilterStore.ts` | Persisted persona/date-range/compare filters (cross-dashboard) |
| `src/components/dashboard/DataTable.tsx` | Generic table (reused); supports row-click and expandable rows |
| `src/components/dashboard/FilterBar.tsx` | Generic pill bar with animated sliding selection (reused) |
| `src/app/api/executions/[id]/stream/route.ts` | **Real** SSE proxy: auth injection, abort/status handling |
| `src/components/dashboard/MarkdownReport.tsx` + `markdown-report/markdownInline.tsx` | Dependency-free markdown renderer — **not used by this feature** (see gotchas) |

## Data & state

- **Source:** Demo mocks. `api.listExecutions()` → `MOCK_EXECUTIONS` (`src/lib/mockData.ts:143`); `api.getExecution(id, offset)` → `getMockExecutionDetail(id)` (`src/lib/mockData.ts:503`). Live mode swaps to `realApi` (`src/lib/api.ts:165`) hitting `NEXT_PUBLIC_ORCHESTRATOR_URL`. **Stores:** `useExecutionStore` (list + `activeCount` + cancel; `executionStore.ts:79`), `usePersonaStore` (join source via `useEnrichedExecutions`). Local React state owns `filter`, `visibleCount`, `selected` — the table filter is intentionally *not* in a store. `useDashboardFilterStore` (`dashboardFilterStore.ts:74`) is a **separate, persisted** filter store (persona / date-range preset / compare), localStorage-backed under `dashboard-filter-state`; it is shared across observability/analytics surfaces and is **not wired into this executions table**. **API routes:** `/api/executions/[id]/stream` (real SSE proxy; this repo's only execution route handler). **Types:** `PersonaExecution`, `GlobalExecution` (enriched), `ExecutionDetail` (`output: string[]`, `outputLines`, `durationMs`, `totalCostUsd`), `PersonaExecutionStatus`, `ExecFilterOpts` — all in `src/lib/types.ts`.

## Integration points

- **Nav badge.** `DashboardNavigation.tsx:72` reads `useExecutionStore(s => s.activeCount)`; the badge equals the active count when `> 0`. `activeCount` is pre-aggregated in the store (`countActive`, `executionStore.ts:53`) precisely so the nav subscribes to a primitive and avoids re-rendering on unrelated list edits.
- **Persona store.** `useEnrichedExecutions` joins live against `usePersonaStore`, so persona metadata (name/icon/color) self-heals if personas arrive after executions.
- **Shared dashboard chrome.** `DataTable`, `FilterBar`, `Modal`, `StatusBadge`, `PersonaAvatar`, `EmptyState`, `DashboardErrorBanner`, `GradientText` are all reused here; nothing in those is executions-specific.
- **Orchestrator.** Real list/detail/cancel go through `orchestratorFetch`; the SSE proxy is the only piece that streams rather than request-responds.
- **i18n.** Strings live under `t.executionsPage.*`, `t.dashboardUi.*` (`stdout`, `jumpToLatest`, `loadMoreExecutions`, `cancelling`, `cancelQueuedRun`), `t.common.*`, and the subtitle borrows `t.observabilityPage.subtitle` (`page.tsx:122`).

## Conventions & gotchas

- **The SSE proxy is real but dormant.** `route.ts` is correct, defensive code, yet no `src/` consumer opens `new EventSource("/api/executions/<id>/stream")`. The only EventSource in the codebase is `useEventStream.ts`, which targets `/api/events/stream` (the global event bus), **not** this per-execution route. The execution detail viewer streams via **HTTP polling** (`useExecutionPolling`), so the proxy is effectively unreachable from the UI today. Treat it as production scaffolding for live mode, not a path the demo exercises.
- **Polling-vs-stream split.** Two different "live" mechanisms coexist: the *list* polls every 3s (gated on `hasRunning` + tab visibility), and the *detail output* polls every 1s (gated on non-terminal status). Neither uses the SSE route. If you wire the viewer to SSE later, retire `useExecutionPolling` for that path rather than running both.
- **`MarkdownReport` is not part of this feature.** It is listed in the scan set but the executions output viewer renders **raw plain-text lines** (`ExecutionOutput.tsx:111`), not markdown. `MarkdownReport`/`markdownInline` are consumed by messages/threads and mock report data — documented here only to record that they're orthogonal.
- **`DataTable` expand path is unused here.** Executions pass `onRowClick` (open modal), not `expandable`. The chevron/`AnimatePresence` height-animation branch (`DataTable.tsx:132`) never runs on this page; the older expandable-row UX was replaced by the modal.
- **Filter "running" = running OR queued, consistently.** The page filter (`page.tsx:51`), the count tally (`page.tsx:72`), and the store's `countActive` (`executionStore.ts:55`) all treat queued as active. Keep these three in lockstep or the nav badge will disagree with the table.
- **`dashboardFilterStore` "custom" coercion.** On hydrate, a persisted `dateRange: "custom"` is coerced back to `"7d"` because the custom start/end bounds aren't persisted (`dashboardFilterStore.ts:45`) — otherwise the range would silently widen to all-time. Also, `setDateRange("custom")` **throws** by design (`dashboardFilterStore.ts:88`); callers must use `setCustomRange(start, end)`. (This store is not used by the executions table, but is in scope for this surface.)
- **SSE route status normalization is load-bearing.** The `Response` constructor throws `RangeError` outside 200–599, so a 1xx or `0` upstream status previously produced a bodyless 500 that EventSource read as "connection died, reconnect now" → infinite reconnect storm. The clamp at `route.ts:64` to `502` is the fix; don't remove it. Likewise, client aborts return **499 with no body** specifically so Sentry isn't polluted with expected `AbortError`s during reconnect churn.
- **SSE route never surfaces the orchestrator hostname.** Errors return a generic `{ error: "upstream_unreachable" }` and the host is never echoed — preserve that when editing (consistent with the repo's Sentry-PII posture).
- **Output cap + offset.** `useExecutionPolling` appends only `data.output` (server returns lines past `offset`) and slices to the last 500 (`useExecutionPolling.ts:48`). If the orchestrator ever returns a non-incremental full buffer, lines would duplicate — the contract assumes offset-delta responses.
- **React 19 reset pattern.** `useExecutionPolling` resets its state inside a `queueMicrotask` in an effect (`useExecutionPolling.ts:32`) and `ExecutionOutput` mutates the scroll DOM directly in effects rather than calling `setState`, to stay clear of the React 19 no-setState-in-effect rule. Follow that pattern if extending the viewer.
- **`usePolling` clamps and warns.** Intervals below 16ms are clamped and a dev warning fires (seconds-vs-ms guard); non-finite intervals disable polling entirely (`usePolling.ts:42`).

## Related docs
- [Event Bus & Stream Monitoring](events.md)
- [Dashboard shell & chrome](shell-chrome.md)
- [Feature index](../INDEX.md)
