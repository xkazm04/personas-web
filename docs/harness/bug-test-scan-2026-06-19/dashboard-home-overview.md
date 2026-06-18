# Dashboard Home Overview — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 2, Low: 0)

Scope note: the prompt's file list was partially stale. `DashboardHeaderStats.tsx`, `DashboardInstruments.tsx` and a standalone `TrafficErrorsCard` page wrapper do not exist; the real `home-page/` dir is now a "mission control" layout (TriagePane / VitalsConsole / RecentActivityCard cockpit + a LazyMount'd InstrumentsBay holding the heatmap, top-performers, traffic, upcoming-routines and vault cards). All listed-and-present files plus the five named hooks, their card consumers, `mock-dashboard-data.ts`, `supabaseApi.ts` (getSyncedLeaderboard / getSyncedTriggers), `usePageVisibility`, `relativeTime`, and the constants/test config were read (≈18 files). Confirmed: the ONLY test runner is Playwright e2e, there are zero unit tests anywhere, and there is no `dashboard/home` e2e spec — the five pure hooks have no coverage of any kind.

---

## 1. Heatmap day-bucketing uses fixed 86.4M-ms days while the weekday header uses calendar days — they desync across a DST boundary
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: timezone / aggregation correctness
- **File**: src/app/dashboard/home/home-page/useExecutionHeatmap.ts:28-44 (vs ExecutionHeatmapCard.tsx:38-46)
- **Scenario**: In real/supabase mode, a user in a DST-observing zone views the heatmap during a week that contains a clock change. The data layer computes `windowStartMs = localMidnight − 6 × 86_400_000` and buckets each execution with `Math.floor((ts − windowStartMs) / 86_400_000)`. The card's weekday header is built separately with `d.setDate(today.getDate() − (6 − i))`, which is calendar/DST-correct.
- **Root cause**: A "day" is assumed to be exactly 86,400,000 ms. On the 23h (spring-forward) or 25h (fall-back) day, fixed-ms subtraction no longer lands on local midnight, so the window start drifts by ±1h and every execution near a midnight boundary can fall into the adjacent column. The header (calendar math) and the cells (fixed-ms math) then disagree, so a run is plotted under the wrong weekday label.
- **Impact**: UX degradation / silently wrong aggregation — counts attributed to the wrong day for ~1 in 7 weeks per user, with no error surfaced. The grid looks authoritative but mis-buckets activity around DST.
- **Fix sketch**: Bucket by calendar day, not fixed ms: precompute the 7 local-midnight epoch boundaries with `setDate()` (same source the header already uses) and assign each `ts` to the last boundary it is ≥. Share one `dayBoundaries[]` array between the hook and the card.

## 2. No unit-test harness for the five pure date/aggregation hooks — risk-weighted coverage gap on the only logic in this context
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing quality gate / coverage gap
- **File**: src/app/dashboard/home/home-page/{useExecutionHeatmap,useGreeting,useUpcomingRoutines,useLastVisit,useTopPerformers}.ts
- **Scenario**: `deriveHeatmap`, `etaLabel`, `deriveRoutines`, the greeting hour→label boundaries, and the localStorage parse/min-gap logic are all pure, deterministic, invariant-rich functions — exactly the LLM-generatable test target — yet `package.json` ships only `test:e2e` (Playwright) and no vitest/jest. A search for any test referencing these symbols returns nothing, and there is no `dashboard/home` e2e spec. Every regression in these (the DST bug in #1, the ETA rounding in #3, the frozen-ETA in #4) ships unguarded.
- **Root cause**: The project treats e2e as the whole test pyramid; the pure transform layer where the real bugs live has no runner at all, so there is nowhere to even add a regression test.
- **Impact**: false-confidence / unguarded business logic — the heatmap counts, leaderboard top-3, and routine ETAs (the substantive output of this whole context) can break silently with zero CI signal.
- **Fix sketch**: Add vitest (devDep + `"test": "vitest"`), extract the three pure helpers (`deriveHeatmap`, `etaLabel`, `deriveRoutines`) for direct import, and seed tests asserting invariants: empty input → `[]`; one run per day → 7 cells of 1; out-of-window/NaN `createdAt` dropped; DST week buckets correctly; ETA boundaries at 59m/60m/23h/24h.

## 3. `etaLabel` rounds at every tier, overstating/understating routine ETAs (e.g. 18h shows "1d", 90m shows "2h")
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: rounding / display correctness
- **File**: src/app/dashboard/home/home-page/useUpcomingRoutines.ts:29-36
- **Scenario**: A real trigger's `nextTriggerAt` is 18 hours away. `mins ≈ 1080` → `hours = round(1080/60) = 18` → `18 < 24` true, returns `${round(18/24)}d` = `round(0.75)` = **"1d"**. A routine 90 minutes out: `mins=90` → `90 < 60` false → `hours = round(90/60) = round(1.5) = 2` → **"2h"**. Both labels are wrong by a meaningful margin.
- **Root cause**: `Math.round` is applied independently at each unit conversion and the day branch divides an already-rounded `hours` by 24 and rounds again, double-rounding. The intent (compact ETA) needs floor-with-unit-selection, not chained rounding.
- **Impact**: UX degradation — "Upcoming Routines" misreports when the next run lands; an 18h-away job appears imminent-ish ("1d") and sub-hour jobs round up. Erodes trust in the only quantitative field on the card.
- **Fix sketch**: Compute from a single `deltaMs`: `< 60m → ${floor(min)}m`, `< 24h → ${floor(hrs)}h`, else `${floor(days)}d` (using `floor`, derived independently from `deltaMs`, not from the prior tier).

## 4. Upcoming-routine ETA is frozen at fetch time — never re-ticks, so "6m" is shown indefinitely (success-theater)
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: stale snapshot / silent staleness
- **File**: src/app/dashboard/home/home-page/useUpcomingRoutines.ts:44,93-95 (vs RecentActivityCard.tsx:44-51)
- **Scenario**: In real mode the hook fetches once on mount, maps each trigger to a string `eta` via `etaLabel(...)`, and stores it in state with no interval. The user leaves the dashboard open. Unlike `RecentActivityCard` (which has a 30s `setTick` + visibility-resume to refresh `relativeTime`), this card has no tick. A routine fetched as "6m" still reads "6m" an hour later; a past-due trigger computes `0m` once and sticks there.
- **Root cause**: ETA is materialized to a static label at fetch time instead of being derived on render from a stored `nextTriggerAt` against a ticking clock. The mock path even documents `eta` as "demo-static", and that staticness leaked into the live path.
- **Impact**: UX degradation / false confidence — the live "next run" countdown is a lie after a few minutes; stale/past triggers masquerade as imminent. (The demo path is intentionally static; the bug is real-mode only.)
- **Fix sketch**: Store `nextTriggerAt` on `UpcomingRoutine` and compute `etaLabel` during render, adding a 30–60s `setTick` gated on `usePageVisibility` (mirror RecentActivityCard); drop already-elapsed triggers on each tick.

## 5. `deriveHeatmap` returns rows in Map-insertion order, not by activity — heatmap row order is nondeterministic & unsorted
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: aggregation / ordering
- **File**: src/app/dashboard/home/home-page/useExecutionHeatmap.ts:33-54
- **Scenario**: Real mode buckets executions into `counts: Map<personaId, number[]>` and emits `[...counts.entries()].map(...)` directly. Map iteration order = first-seen order in the `executions` array (whatever order `api.listExecutions({limit:2000})` happened to return). A persona with a single old run can sit above the busiest agent; two loads with different fetch ordering render the rows in different order, and the `key={row.persona}` rows reshuffle.
- **Root cause**: The grid is emitted in encounter order with no sort key. The mock (`MOCK_EXECUTION_HEATMAP`) is implicitly ordered by the health-digest list, so the demo looks intentional and the real-mode disorder is easy to miss.
- **Impact**: UX degradation — most-active agents aren't surfaced first and row order can change between refreshes; visually noisy and harder to scan. (Also a latent React key-stability concern if two personas share a display name → duplicate `key`.)
- **Fix sketch**: Sort the emitted rows by total activity desc (tiebreak by name) before returning: `.sort((a,b) => sum(b.days) − sum(a.days) || a.persona.localeCompare(b.persona))`; key rows on `personaId` rather than display name.
