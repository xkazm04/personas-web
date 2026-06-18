# Observability Charts & SLA — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 2, Low: 0)

Scope: 47 files in the "Observability Charts & SLA" context, logic-bearing modules read in full (slaFormat, healthScoreColor, trendColor, useLiveStats, systemStore, useLatencyData, useSparklines, useSlaData, usageViewData, the SLA page + summary/target/breach components, PerformanceView + grid/cards, Sparkline, MetricCard, the real-data aggregation in `supabaseApi.getObservabilityMetrics`/`getSyncedSla`/`getObservabilityDaily`). Cross-checked against the 2026-05-10 scan, which explicitly declared the chart layer clean and never audited the SLA breach/scoring math (the highest-value ground here). No unit runner exists — only Playwright e2e (`e2e/*.spec.ts`); `package.json` has no vitest/jest.

---

## 1. Real-mode success rate is rendered 100× too low — fraction vs. percent unit mismatch
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: Aggregation / unit mismatch / data correctness
- **File**: src/app/dashboard/observability/performance-view/PerformanceMetricsGrid.tsx:28 (with src/lib/supabaseApi.ts:527 and src/lib/mockData.ts:581)
- **Scenario**: A real (non-demo / Supabase) user opens Observability with a healthy fleet (95% of executions succeeded).
- **Root cause**: `supabaseApi.getObservabilityMetrics` returns `successRate: totalSuccesses / totalExecutions` — a **fraction in [0,1]** (e.g. `0.95`). The mock path returns `successRate: 89.4` — a **percentage in [0,100]**. The tile renders `${(metrics?.successRate ?? 0).toFixed(1)}%`, which is correct for the mock but renders the real fraction as `0.9%` / `1.0%`. The two data sources disagree on units and only the mock matches the formatter.
- **Impact**: Every real-mode operator sees their success rate as ~1% — a catastrophic-looking false signal on a healthy fleet (data-correctness failure that erodes trust in the whole dashboard). The `successTrend` (also a `pctChange` of fractions) is unaffected, masking the bug in QA where only trend deltas look plausible.
- **Fix sketch**: Make the contract one scale. Either multiply in `getObservabilityMetrics` (`successRate: total>0 ? (totalSuccesses/totalExecutions)*100 : 0`) to match the mock + formatter, or have the formatter normalize. Add a unit test asserting both `mockApi` and `supabaseApi` return the same scale for a known sample.

---

## 2. SLA breaches synthesize `startedAt = now` and `durationMinutes = 0` on every fetch
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: Success-theater / fabricated breach metadata / silent data loss
- **File**: src/lib/supabaseApi.ts:869-880, 898-909 (rendered by SLABreachRow.tsx:39-95 / SLABreachDetail.tsx:29-62)
- **Scenario**: A real persona has been below the 95% success objective for 3 days. The operator opens the SLA page, then refreshes 30s later.
- **Root cause**: `getSyncedSla` derives breaches from a point-in-time leaderboard aggregate but has no breach-history table, so it stamps `startedAt: new Date().toISOString()`, `resolvedAt: null`, `durationMinutes: 0` for every breach on every call. The breach log then shows "started just now", "0 min", and "ongoing" — and the per-breach duration bar (`barPct = durationMinutes/maxDuration`) collapses because all durations are 0 (`maxDuration === 0` → every bar width 0).
- **Impact**: A long-running breach reads as brand-new on each refresh (false-confidence: the operator can never see a sustained/aging incident). `relativeTime(startedAt)` resets each fetch; the duration column and detail bar are dead. This is the kind of breach-detection success-theater the lens targets — the SLA page *looks* live but conveys no real timeline.
- **Fix sketch**: Either persist breach onset (a `synced_sla_breaches` table keyed by persona+metric with a stable `started_at`), or stop displaying `durationMinutes`/`startedAt`/`ongoing` for synthesized breaches and label them "point-in-time" explicitly. Add a test pinning that a re-fetch with unchanged inputs keeps `startedAt` stable.

---

## 3. Zero unit coverage for the SLA / health / latency / trend scoring math
- **Severity**: High
- **Lens**: test-mastery
- **Category**: Risk-weighted coverage gap / missing quality gate
- **File**: src/app/dashboard/sla/sla-page/slaFormat.ts:3-72, src/components/dashboard/healthScoreColor.ts:11-39, src/components/dashboard/trendColor.ts:20-31, src/app/dashboard/observability/performance-view/useLatencyData.ts:11-57, src/lib/supabaseApi.ts:71-74,749-752,831-913
- **Scenario**: Any future refactor (e.g. fixing finding #1's unit scale, or tweaking a band threshold) ships with no automated check that the bands, percentile interpolation, breach booleans, or `pctChange` divide-by-zero guard still hold.
- **Root cause**: The project has only Playwright e2e and no unit runner (`package.json` → `test:e2e: playwright test`; no vitest/jest dep). These are pure, deterministic, business-critical functions — exactly the prime LLM-generatable test-batch targets — yet are entirely untested. `complianceBand`/`healthScoreColor` boundary values (0, 0.95, 0.98, 0.995, 40/60/80), `percentile` (empty→0, single-element, p99 of 2 samples), `pctChange(x, 0)→0`, and `getSyncedSla` breach thresholds (`successRate < 80` critical boundary) all assert real invariants no test pins.
- **Impact**: False-confidence absence — silent regressions in the numbers operators trust ship undetected. Findings #1, #2, #4, #5 in this report would all have been caught by a 30-line test batch. No coverage gate exists on the scoring layer.
- **Fix sketch**: Add vitest (jsdom not required for these pure fns) and a `scoring.test.ts` batch covering band boundaries, `percentile` edge cases, `pctChange` zero-baseline, and `getSyncedSla` breach severity thresholds. Wire `vitest run` into the pre-push hook / CI alongside `typecheck`.

---

## 4. Latency percentiles on tiny per-day samples + local-time bucketing produce misleading p95/p99
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: Sparkline/latency math / timezone bucketing
- **File**: src/app/dashboard/observability/performance-view/useLatencyData.ts:11-57
- **Scenario**: Real mode, a persona ran twice on a given calendar day; or a UTC-stored `createdAt` near midnight is bucketed by the viewer's local day.
- **Root cause**: (a) `percentile([a,b], 99)` linearly interpolates between only two points, so "p99" on a 2-sample day is essentially the max with no statistical meaning, yet it's plotted on the same axis as a 1s SLO reference line and read as a real tail latency. (b) `dayKey` derives the bucket from `new Date(iso)` in **local time**, so a run at 23:30 UTC lands on a different day for a UTC+2 viewer than the server's day — and the mock `MOCK_LATENCY_DATA` also uses local `getMonth/getDate`, so demo and real can disagree on which day a point belongs to. Days with no completed runs silently vanish (gaps the chart doesn't flag).
- **Impact**: UX degradation / misleading tail-latency: low-volume personas show jagged, inflated p99 lines that look like breaches; cross-timezone operators see points shifted a day. Not a crash (Sparkline/Recharts handle the array), but the numbers are not trustworthy.
- **Fix sketch**: Require a minimum sample count per bucket before plotting p95/p99 (or annotate "n<N"); bucket by a fixed timezone (UTC `toISOString().slice(5,10)`) consistently across mock and real so axes align. Covered by the test batch in finding #3.

---

## 5. Empty SLA target set reports 0.00% compliance and paints critical-red — inverse success-theater
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: Empty-set / divide-by-zero guard / false breach signal
- **File**: src/app/dashboard/sla/page.tsx:24-30 (with SLASummaryGrid.tsx:18-31 and slaFormat.ts:26-31)
- **Scenario**: Real mode with no synced executions yet (or a brand-new workspace): `getSyncedSla` returns `targets: []`.
- **Root cause**: `overallCompliance = targets.reduce(...,0) / Math.max(1, targets.length)` = `0/1 = 0`. The guard avoids NaN but produces a meaningless `0`. `complianceBand(0)` falls through to the rose/critical band, and `SLASummaryGrid` renders "0.00%" in critical red with `objectives: 0`. There is no "no data" branch.
- **Impact**: A workspace with simply no data is presented as a total SLA failure (0% compliance, red) — false-confidence inverse: it manufactures an alarming breach state from absence of data, the opposite of the "healthy on no data" theater but equally wrong. Operators may chase a non-existent incident.
- **Fix sketch**: Short-circuit when `targets.length === 0` to render an explicit "no objectives / no data yet" empty state instead of computing a band on `0`. Add a test asserting `overallCompliance`/band for the empty-targets case is treated as "no data", not "critical".
