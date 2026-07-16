# Observability Charts & SLA — ambiguity+ui scan
> Total: 5 findings (Critical: 1, High: 2, Medium: 2, Low: 0)

## 1. Mock "Previous" compare series and fake incident annotations leak into real-mode charts
- **Severity**: Critical
- **Agent**: ambiguity_guardian
- **Category**: mock-data-leaks-into-real-mode
- **File**: `src/components/dashboard/CostChartWithCompare.tsx:33` (also `:86`, `:118`; same pattern in `ExecChartWithCompare.tsx:35`)
- **Scenario**: In real/supabase mode, `PerformanceView` feeds genuine synced cost/exec data into the compare charts. Toggling "Compare" merges `MOCK_COST_COMPARE` / `MOCK_EXEC_COMPARE` (seeded fixtures whose `MM-DD` dates are generated relative to *today*, so they always align with the real axis) as the "Previous" overlay. Worse, `MOCK_ANNOTATIONS` (`03-03 v2.1 deployed`, `03-05 Slack outage`, `03-07 1k executions`) render unconditionally — no `compare` or `isDemo` gate — so in early March real users see a fabricated "Slack outage" incident line on their genuine spend chart.
- **Root cause**: The demo/real split was enforced in `PerformanceView` (see the deliberate `isDemo`-only `CostAnomalyBanner` at `PerformanceView.tsx:97-104` and the "never the mock" health-issue comment) but the compare/annotation fixtures are baked into the shared chart components themselves, below the gate.
- **Impact**: Real users make cost/reliability judgments against invented period-over-period numbers and phantom incidents presented with the same visual authority as their real data. Violates the codebase's own stated convention that mock never surfaces in real mode.
- **Fix sketch**: Lift compare/annotation data to props (`previousSeries?: ComparePoint[]`, `annotations?: ChartAnnotation[]`); `PerformanceView` passes the mocks only when `isDemo`, and hides `CompareToggle` (or disables it with a "demo only" hint) when no real previous-period source exists.

## 2. Latency day bucketing breaks across year boundaries and has no time window
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: date-key-year-collision
- **File**: `src/app/dashboard/observability/performance-view/useLatencyData.ts:23`
- **Scenario**: Real-mode latency percentiles bucket executions by `"MM-DD"` (`dayKey`) and sort buckets lexicographically (`useLatencyData.ts:47`). The fetch is `listExecutions({ limit: 2000 })` with no date filter (`:84`), so history is unbounded: executions from 2025-12-30 and any January runs sort as `01-xx` before `12-xx`, and `07-16` from two different years silently merge into one bucket, corrupting p50/p95/p99 for that day.
- **Root cause**: The key format was chosen to "match the mock's date axis" (per the comment) — a demo-fixture constraint imposed on real data — plus the magic `limit: 2000` with no recorded rationale for window or ordering (does the API return newest-first? oldest 2000 would show stale history forever).
- **Impact**: Around New Year the chart's x-axis order is wrong; long-lived accounts get percentiles blended across years; nobody can tell which 2000 executions the chart actually reflects.
- **Fix sketch**: Bucket by full `YYYY-MM-DD`, strip to `MM-DD` only for display ticks; request a bounded window (e.g. `createdAfter: now - 14d`) instead of a bare row cap, and document the window in the hook's contract comment.

## 3. "Run analysis" button is pure theater — 3-second fake spinner, no analysis
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: fake-affordance
- **File**: `src/app/dashboard/observability/PerformanceView.tsx:72`
- **Scenario**: In the health panel (real mode included), clicking "Run analysis" sets `healingActive`, shows a spinning "Analyzing…" banner, then `setTimeout(3000)` turns it off. No API call, no re-fetch (`mutate` is right there and unused), no result — the issue list is byte-identical before and after.
- **Root cause**: A demo-era animation was wired as a real button with no gating or TODO; the surrounding code carefully distinguishes demo vs real everywhere else, so the intent for this control in real mode was never decided or recorded.
- **Impact**: Users believe a diagnostic ran and their (possibly stale) issue list is fresh — false reassurance on a *health* surface, the worst place for it. Erodes trust once noticed.
- **Fix sketch**: Minimum honest version: have it `await mutate()` so it genuinely re-fetches observability data and derive the spinner from SWR's `isValidating`; if a deeper analysis is planned, hide the button in real mode until it exists.

## 4. Chart data hooks swallow fetch failures — error renders as "no data"
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: silent-error-as-empty-state
- **File**: `src/app/dashboard/observability/performance-view/useSparklines.ts:67` (same in `useLatencyData.ts:87-89`)
- **Scenario**: In real mode, if `getObservabilityDaily()` or `listExecutions()` fails, the error goes to Sentry only; state stays `[]` and (for sparklines) there is no `loading` or `error` flag at all. The metric cards render flat/empty sparklines and the latency card shows its empty state — indistinguishable from a genuinely idle account, with no retry path.
- **Root cause**: Happy-path-only hook contracts. The sibling `useSlaData.ts` establishes the correct in-repo pattern (`error` + `retry` surfaced to `DashboardErrorBanner`), but these two hooks diverge from it without recorded reasoning.
- **Impact**: A transient backend outage silently masquerades as "you have no executions", which on an observability page is actively misleading; users can't recover without a full reload.
- **Fix sketch**: Mirror `useSlaData`: return `{ data, loading, error, retry }` from both hooks and let `PerformanceLatencyCard` / the metrics grid show the existing `DashboardErrorBanner` (or a compact inline error) instead of the empty state when `error` is set.

## 5. Data-bearing charts have no accessible alternative; sparklines are unlabeled SVG
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: charts-missing-text-alternative
- **File**: `src/components/dashboard/Sparkline.tsx:47`
- **Scenario**: Screen-reader users hit the observability page: `Sparkline` renders a bare `<svg>` with no `role`, `aria-label`, or `<title>` — it is announced as nothing, yet it conveys the cost/executions/success trend that sighted users get. The recharts surfaces (`LatencyChart.tsx:37`, cost/exec compare charts) likewise expose only unlabeled SVG geometry, and hover-only tooltips are their sole value readout (also unreachable by keyboard).
- **Root cause**: No accessibility contract was established for the chart layer — neither "decorative, hide it" (`aria-hidden` + adjacent text stats) nor "informative, label it" was ever decided, so each chart defaults to nothing.
- **Impact**: WCAG 1.1.1 failure across the whole observability/SLA analytics surface; trend information is fully invisible to assistive tech.
- **Fix sketch**: In `Sparkline`, accept an optional `label` and render `role="img" aria-label={label}` (e.g. "Cost, last 14 days, trending up 12%"), defaulting to `aria-hidden="true"` when omitted since the metric card shows the number; wrap each recharts card in a `figure` with an `aria-label` summarizing latest p50/p95/p99 or totals so the tooltip is not the only readout.
