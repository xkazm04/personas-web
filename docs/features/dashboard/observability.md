# Observability Charts
> Performance, usage & activity observability for the agent fleet — latency/cost/exec charts, spend breakdown, metric tiles with sparklines, a self-healing health panel, and Athena usage + value rollup · **Route:** `/dashboard/observability` · **Nav label:** "Observability" · **Status:** Demo-only (mocks)

## What it does

The Observability surface answers *How is the fleet performing, what is it costing, and which tools is it using?* It is a single page with three tabs (a `FilterBar` at the top):

- **Performance** (default tab) — the operational health view:
  - **Metric tiles** — four headline KPIs (Total Cost, Executions, Success Rate, Active Personas) each with a trend pill and a mini sparkline.
  - **Cost over time** (area chart) and **Execution health** (stacked successes/failures bar) side by side, both with a **Compare** toggle that overlays the previous period and **deployment / incident / milestone** annotation lines.
  - **Latency distribution** — a p50 / p95 / p99 line chart with a 1-second SLO reference line.
  - **Spend by Agent** — a donut of per-persona cost with a legend that includes a budget-usage bar per persona.
  - **Health Issues panel** — a filterable (by severity) list of detected issues with auto-fix / circuit-breaker badges, a demo "Run Analysis" self-healing animation, and a healthy-state empty illustration.
  - Two banners surface above the grid: a dismissible **cost-anomaly** banner and a **budget-threshold** warning when any persona crosses 80% of its budget.
- **Tool Usage** — the integration-utilization view: a top-N **Tool Invocations** horizontal bar (with an "is used Nx more than" insight badge), a **Distribution** donut with total, a 14-day stacked **Usage Over Time** area, and a **Tool Usage by Agent** stacked bar. The lower two charts mount lazily on scroll.
- **Activity** — the Companion/value view (D-C3): an **Athena usage** stacked area of daily cost by action (invoke / recall / fallback) and a **Value rollup** card (value-delivered rate, cost per delivered outcome, and a delivered/partial/blocked outcome bar). Its own **Compare** toggle overlays the previous period — a dashed prev-total line on the area and period-over-period deltas (rate +pts, cost-per-value with inverted polarity) on the rollup.

In this repo it is **demo-only**: everything renders from in-process fixtures. A real deployment swaps to the orchestrator REST API or a Supabase mirror behind the same hooks.

## How it works

**Page shell — `page.tsx`.** `ObservabilityPage` holds one `tab` state (`"performance" | "usage" | "activity"`) and renders the title/subtitle (`GradientText`), a `FilterBar` of three options, then `<PerformanceView />`, `<UsageView />`, or `<ActivityMetricsView />`. The whole page is a `staggerContainer` with `fadeUp` children (framer-motion).

**Activity data — `ActivityMetricsView.tsx` + `activity-view/`.** `useActivityMetrics()` (SWR over the standalone `getActivityMetrics` mock fetcher) returns `{ athenaUsage, valueRollup }`. The view owns a local `compare` state driving a `CompareToggle`, then renders `AthenaUsageCard` (stacked `AreaChart` of invoke/recall/fallback with a dashed `prevTotal` overlay when comparing) and `ValueRollupCard` (rate + cost-per-value with `trendColor`-coloured deltas, and an outcome bar). Demo-only; no real source.

**Performance data — `PerformanceView.tsx`.** Fetches via SWR: `useSWR("observability", api.getObservability, { refreshInterval: 30_000, dedupingInterval: 8_000, revalidateOnFocus: false, keepPreviousData: true })` (`PerformanceView.tsx:28`). From the one payload `{ metrics, dailyMetrics, personaSpend, healthIssues }` it memoizes the chart shapes: `costChartData` (`{date, Cost}`), `execChartData` (`{date, Successes, Failures}`), `spendPieData` (`{name, value, color}`), all keyed by `day.date.slice(5)` (MM-DD). Health issues get a demo-vs-real branch: when the synced list is empty it falls back to `MOCK_HEALTH_ISSUES` **only in demo** (`isDemo`), never in real mode (`PerformanceView.tsx:46`). It derives `filteredHealthIssues`, `severityCounts`, `openIssues`, and `overBudgetPersonas` (cost/budget > `BUDGET_THRESHOLD` = 0.8). `handleRunAnalysis` flips `healingActive` for 3s (a pure demo animation; runs no real analysis). While `loading && !metrics` it shows a spinner. A decorative `bg-observability.png` is layered at `opacity-[0.12]` behind the content.

**Performance subcomponents** (`performance-view/`):
- `PerformanceMetricsGrid` — four `MetricCard`s. Cost uses `goodDirection="down"` so a rise reads red. Sparkline series come from `useSparklines()`.
- `PerformanceChartGrid` — two `GlowCard`s wrapping `CostChartWithCompare` / `ExecChartWithCompare` (both `dynamic(..., { ssr: false })`). The shared `ChartTitle` appends a "vs previous period" label when compare is on.
- `PerformanceLatencyCard` — `GlowCard` + dynamically-imported `LatencyChart`; data from `useLatencyData()`. Empty data renders `t.dashboard.noExecutionsYet`.
- `PerformanceSpendCard` — donut (`ObservabilitySpendPieChart`, dynamic) + per-persona rows; each row's budget bar turns amber past `BUDGET_THRESHOLD`. Persona color is applied via inline `style` (data-driven, not a token).
- `PerformanceHealthPanel` / `PerformanceHealthIssueRow` / `SeverityFilterChips` — the issue list, severity pills (All/Critical/High/Medium/Low with counts), the "Run Analysis" button + healing banner, and the `HealthyShieldIllustration` empty state. Each row's relative age is captured once in a lazy `useState(() => relativeTime(issue.detectedAt))` (keeps `Date.now()` out of render); an expandable "Auto-fix applied" detail uses `AnimatePresence`.
- `CostAnomalyBanner` — dismissible stacked banners (per-anomaly `date` key in a `Set`), pulse gated by `useReducedMotion`. Demo-only (mounted only when `isDemo`).

**Usage data — `UsageView.tsx`.** Fetches `useSWR("usage", api.getUsageAnalytics, …)` (no `refreshInterval` — usage is less time-sensitive). Demo-vs-real: `useMock = isDemo && !hasRealData`; when true it renders the `MOCK_TOOL_USAGE*` fixtures plus an "example data" notice, otherwise the genuine (possibly empty) analytics. It derives `barData` (top 15 tools + an aggregated "Other" bucket), `pieData`, `totalInvocations`, `topTools` (top 5), `areaData` (14-day series of those top-5 tools), `personaBarData`, `allToolNames`, and an `insight` string built by `t.observabilityPage.usageInsight.replace("{top}"/"{ratio}"/"{second}", …)`. The over-time and by-persona cards are wrapped in `useDeferredMount("260px")` refs so they only mount when scrolled near.

**Usage subcomponents.** `UsageChartCards.tsx` exposes `UsageTopCharts` / `UsageOverTimeCard` / `UsageByPersonaCard`. Each chart is a per-export `dynamic(... .then(mod => mod.Xxx), { ssr: false })` import from `UsageCharts.tsx`. Deferred cards render a `ChartCardSkeleton` until `mounted`. `usageViewData.ts` holds the mock fixtures, a memo-seeded 14-day `MOCK_TOOL_USAGE_OVER_TIME` (built once at module load), and `formatToolName` (cached title-caser).

**Charts & theming.** All chart primitives are recharts, themed through `src/lib/chart-theme.tsx`: `SERIES`/`CHART_PALETTE` colors, `AXIS_TICK`, `GRID_STROKE`, `ACTIVE_DOT`, cursor styles, the shared `ChartTooltip` (with optional `valueFormatter`/`nameFormatter`), and `useChartAnimation()` (reduced-motion-aware: `isAnimationActive:false` + `animationDuration:0` when reduced, else 700ms). `CostChartWithCompare` / `ExecChartWithCompare` build a `ReadonlyMap` of the previous-period series at module scope and merge it in a `useMemo` only when `compare` is on; ExecChart swaps a plain `BarChart` for a `ComposedChart` (bars + previous-total line) in compare mode. Both inline `MOCK_ANNOTATIONS` as `ReferenceLine`s (deployment/incident/milestone, with emoji labels).

## Key files

| File | Role |
| --- | --- |
| `src/app/dashboard/observability/page.tsx` | Route page; Performance/Usage tab switch via `FilterBar` |
| `src/app/dashboard/observability/PerformanceView.tsx` | Performance tab; SWR `getObservability`, derives chart data, health/budget/anomaly logic |
| `src/app/dashboard/observability/UsageView.tsx` | Usage tab; SWR `getUsageAnalytics`, top-N bar + distribution + over-time + per-persona, deferred mount |
| `src/app/dashboard/observability/performance-view/PerformanceMetricsGrid.tsx` | Four KPI `MetricCard`s with sparklines |
| `src/app/dashboard/observability/performance-view/PerformanceChartGrid.tsx` | Cost + Exec `GlowCard`s; dynamic `*WithCompare` charts, compare title |
| `src/app/dashboard/observability/performance-view/PerformanceLatencyCard.tsx` | Latency p50/p95/p99 card; dynamic `LatencyChart`, empty state |
| `src/app/dashboard/observability/performance-view/PerformanceSpendCard.tsx` | Spend-by-agent donut + per-persona budget bars |
| `src/app/dashboard/observability/performance-view/PerformanceHealthPanel.tsx` | Health-issue list, severity chips, Run-Analysis demo, healthy empty state |
| `src/app/dashboard/observability/performance-view/PerformanceHealthIssueRow.tsx` | One issue row; severity styling, auto-fix/circuit-breaker pills, expandable fix detail |
| `src/app/dashboard/observability/performance-view/SeverityFilterChips.tsx` | All/Critical/High/Medium/Low filter pills with counts |
| `src/app/dashboard/observability/performance-view/CostAnomalyBanner.tsx` | Dismissible per-date cost-anomaly banners (demo only) |
| `src/app/dashboard/observability/performance-view/performanceViewTypes.ts` | `BUDGET_THRESHOLD` (0.8), `SeverityFilter`, `ObservabilityLabels` (derived from i18n) |
| `src/app/dashboard/observability/performance-view/useLatencyData.ts` | Latency source: `MOCK_LATENCY_DATA` (demo) vs. per-day p50/p95/p99 from `listExecutions` |
| `src/app/dashboard/observability/performance-view/useSparklines.ts` | Metric-tile sparklines: `SPARKLINE_*` (demo) vs. `getObservabilityDaily` series |
| `src/app/dashboard/observability/usage-view/UsageChartCards.tsx` | Usage card wrappers; per-export dynamic chart imports + skeletons |
| `src/app/dashboard/observability/usage-view/usageViewData.ts` | `MOCK_TOOL_USAGE*` fixtures + `formatToolName` cache |
| `src/app/dashboard/observability/usage-view/useDeferredMount.ts` | IntersectionObserver hook — mount a card only when near viewport |
| `src/components/dashboard/CompareToggle.tsx` | Shared compare pill (`aria-pressed`, tap scale) |
| `src/components/dashboard/CostChartWithCompare.tsx` | Cost area chart + previous-period overlay + annotations |
| `src/components/dashboard/ExecChartWithCompare.tsx` | Exec stacked-bar (Bar→ComposedChart in compare) + annotations |
| `src/components/dashboard/LatencyChart.tsx` | p50/p95/p99 line chart with 1s SLO reference line |
| `src/components/dashboard/ObservabilitySpendPieChart.tsx` | Donut for spend-by-agent |
| `src/components/dashboard/UsageCharts.tsx` | The four usage recharts (invocations bar / distribution pie / over-time area / by-persona bar) |
| `src/components/dashboard/usage-charts/UsageTooltip.tsx` | Thin wrapper over `ChartTooltip` with `formatToolName` name-formatter |
| `src/components/dashboard/usage-charts/usageChartTypes.ts` | `BarDatum`/`PieDatum`/`AreaDatum`/`PersonaBarDatum` |
| `src/components/dashboard/MetricCard.tsx` | KPI tile (value, trend pill, sparkline, `goodDirection`) |
| `src/components/dashboard/Sparkline.tsx` | Tiny SVG sparkline (NaN-filtered) for the metric tiles |
| `src/components/dashboard/trendColor.ts` | Favorable→emerald / unfavorable→rose mapping with `goodDirection` |
| `src/components/dashboard/healthScoreColor.ts` | 0–100 → 4-tier color band (used by health panels elsewhere) |
| `src/lib/chart-theme.tsx` | Single source of truth for recharts styling + `ChartTooltip` + `useChartAnimation` |
| `src/lib/mock-dashboard-data.ts` | All fixtures: metrics, daily, persona spend, health issues, anomalies, compare series, annotations, latency, sparklines |

## Data & state
- **Source:** demo fixtures in `src/lib/mock-dashboard-data.ts` (`MOCK_OBSERVABILITY_METRICS`, `MOCK_DAILY_METRICS`, `MOCK_PERSONA_SPEND`, `MOCK_HEALTH_ISSUES`, `MOCK_COST_ANOMALIES`, `MOCK_COST_COMPARE`, `MOCK_EXEC_COMPARE`, `MOCK_ANNOTATIONS`, `MOCK_LATENCY_DATA`, `SPARKLINE_*`) and `usage-view/usageViewData.ts` (`MOCK_TOOL_USAGE*`). All served (with simulated `delay`) by `src/lib/mockApi.ts`. Live mode swaps to the orchestrator (`realApi`) or the Supabase mirror (`supabaseApi`) behind the same `api.*` methods.
- **Stores:** `authStore.isDemo` selects mock-vs-live (read directly in `PerformanceView`, `UsageView`, `useLatencyData`, `useSparklines`, and inside the `api` proxy). **No Zustand store holds observability data** — fetching is via SWR + local hooks. `systemStore` (global health/status) is **not** consumed by this route.
- **API routes:** none in-repo for demo (mocks are in-process). Live data flows through the `api` client: `getObservability` (the single bulk payload this page uses), plus `getObservabilityDaily` and `listExecutions` (used by `useSparklines` / `useLatencyData` in real mode), and `getUsageAnalytics`. The orchestrator maps these to `/api/observability` (with a `fields` param for the tiered variants) and `/api/usage` (`src/lib/api.ts:309`).
- **Types:** `ObservabilityMetrics`, `DailyMetric`, `PersonaSpend`, `HealthIssue`, `LatencyPoint`, `ToolUsageSummary`, `ToolUsageOverTime`, `ToolUsageByPersona`, `CostAnomaly`, `ChartAnnotation` (`src/lib/mock-dashboard-data.ts` / `src/lib/types.ts`). UI types: `SeverityFilter`, `ObservabilityLabels` (`performanceViewTypes.ts`); `BarDatum`/`PieDatum`/`AreaDatum`/`PersonaBarDatum` (`usageChartTypes.ts`); `ChartTooltipEntry`/`ChartTooltipProps` (`chart-theme.tsx`).

## Integration points
- **Dashboard shell & nav.** Registered in `navItemDefs` (`src/components/dashboard/DashboardNavigation.tsx:32`) with `labelKey: "observability"`, `Activity` icon, `href: "/dashboard/observability"`. Renders inside the shared dashboard layout.
- **`api` proxy & data planes.** `src/lib/api.ts` proxies every call to `mockApi` (when `isDemo`), else `supabaseApi` or `realApi` per `NEXT_PUBLIC_DATA_SOURCE`. SWR keys `"observability"` / `"usage"` dedupe across remounts.
- **Shared dashboard primitives.** `FilterBar`, `GlowCard`, `GradientText`, `MetricCard`, `Sparkline`, `CompareToggle`, `HealthyShieldIllustration`, and `relativeTime` (`src/lib/format.ts`).
- **Chart theme.** Every chart reads `src/lib/chart-theme.tsx` — change palette/axis/tooltip there to retheme all surfaces at once. `CHART_COLORS` (re-exported from `src/lib/constants` = `CHART_PALETTE`) drives multi-series usage charts.
- **i18n.** Nav label at `t.dashboard.observability` (`en.ts:1365`). All page copy under `t.observabilityPage.*` (interface at `en.ts:577`, en values at `en.ts:1739`), plus `t.common.close`, `t.dashboard.noExecutionsYet`, `t.dashboardUi.totalLower`. Interpolations use literal `{top}`/`{ratio}`/`{second}`/`{severity}` replaced via `String.replace`.
- **Sentry.** `useLatencyData` and `useSparklines` capture fetch errors with `tags: { scope }` (real mode only).

## Conventions & gotchas
- **Demo-only in this repo.** `isDemo` is effectively always true here, so the live branches (`getObservability` over the orchestrator, `listExecutions`-derived latency, `getObservabilityDaily` sparklines) and the loading/error paths only exercise against real backends. Test them with mock toggles, not by editing the views.
- **Heads-up: scanned but NOT used by this route (legacy/duplicates).** Several components in `src/components/dashboard/` overlap with the live route but are *not* imported by `/dashboard/observability`:
  - `ObservabilityCharts.tsx` (exports `CostChart`/`ExecChart`/`SpendPieChart`) and `ChartAnnotation.tsx` (the `ChartAnnotations` component) have **zero importers** anywhere — dead/legacy code. The route uses `CostChartWithCompare` / `ExecChartWithCompare` (which inline their own annotation `ReferenceLine`s) and `ObservabilitySpendPieChart` instead.
  - `ObservabilityCostChart.tsx` / `ObservabilityExecChart.tsx` are near-duplicates of the `*WithCompare` charts and are not used by this route either.
  - `TrafficChart.tsx` and `HealthDigestPanel.tsx` belong to `/dashboard/home`; `HealthIssueRow.tsx` belongs to `/m/alerts` (mobile). Observability has its own `PerformanceHealthIssueRow`. `useLiveStats.ts` is marketing-only (`HeroClient`). Don't edit these expecting observability to change; conversely, consider them candidates for cleanup if you touch the area.
- **Tiered API calls exist but aren't used here.** `mockApi`/`api` expose `getObservabilityMetrics`/`Daily`/`PersonaSpend`/`HealthIssues` for progressive streaming, but `PerformanceView` fetches the single legacy `getObservability` bulk payload (one SWR key, 30s refresh). `useSparklines` is the only consumer of `getObservabilityDaily` (real mode). If you want per-tier reveal, the field-selected methods are already there.
- **React 19 purity.** Relative ages are seeded with lazy `useState(() => relativeTime(...))` (`PerformanceHealthIssueRow`, `HealthIssueRow`) so `Date.now()` never runs in render. `MOCK_TOOL_USAGE_OVER_TIME` is built once at module load (uses `Math.random()`/`new Date()` at import time, never in render). Follow this when adding clock/random-derived data.
- **Animation gating.** `CostAnomalyBanner` gates its pulse with `useReducedMotion`; `useChartAnimation` (chart-theme) snaps every recharts series to no-animation under reduced motion. Any new chart must spread `{...anim}` from `useChartAnimation`, not hardcode `animationDuration`.
- **Semantic Tailwind tokens.** Use `text-foreground`, `text-muted-dark`, `border-glass`, `bg-surface`, `text-brand-*`. The intentional exceptions are data-driven persona colors (spend rows / pie cells) applied via inline `style`, and recharts series colors which come from `SERIES`/`CHART_PALETTE` (hex by necessity).
- **`getObservability` runs even on the Usage tab's first mount path?** No — `PerformanceView`/`UsageView` are conditionally rendered, so each tab's SWR fetch only fires when its tab is active. But SWR caches per key, so switching back is instant.
- **Donut color precedence.** Pie `Cell`s prefer `entry.color` (persona color) and fall back to `CHART_COLORS[i % len]`; ensure persona fixtures carry a `personaColor` or colors will recycle.
- **Where to extend.** New KPI tile → `PerformanceMetricsGrid` + a series in `useSparklines` + an i18n label. New severity → extend `SeverityFilter`, `severityStyles`, `SeverityFilterChips` arrays, and `t.observabilityPage.severity`. New tool-usage chart → add an export to `UsageCharts.tsx`, a dynamic wrapper in `UsageChartCards.tsx`, and derive its data in `UsageView`. New annotation type → extend `ChartAnnotation["type"]` + the `annotationStyles` maps (duplicated in both `*WithCompare` charts — keep them in sync).

## Related docs
- [SLA & Breach Tracking](sla.md)
- [Dashboard shell & chrome](shell-chrome.md)
- [Feature index](../INDEX.md)
