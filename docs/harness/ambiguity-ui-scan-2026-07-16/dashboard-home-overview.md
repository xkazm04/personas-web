# Dashboard Home Overview — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Three instrument cards ignore their hooks' `loading` flag — empty-state flash in real mode
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: loading-state-ignored
- **File**: `src/app/dashboard/home/home-page/ExecutionHeatmapCard.tsx:35`
- **Scenario**: Non-demo (supabase) user scrolls to the Instruments Bay. `useExecutionHeatmap`, `useTopPerformers`, and `useUpcomingRoutines` all start with empty data and `loading: true`, then fetch. Each card destructures only the data (`const { rows } = useExecutionHeatmap()`, `const { leaderboard } = useTopPerformers()` in `TopPerformersCard.tsx:32`, `const { routines } = useUpcomingRoutines()` in `UpcomingRoutinesCard.tsx:26`) and never reads `loading`.
- **Root cause**: All three hooks expose `{ data, loading }` interfaces (`ExecutionHeatmapData`, `TopPerformersData`, `UpcomingRoutinesData`), but the cards render `data.length === 0 ? empty : list` unconditionally. This is the exact anti-pattern the sibling `TrafficErrorsCard.tsx:59-63` comment documents as fixed there ("previously the empty state flashed ... while data was still loading").
- **Impact**: Every real-mode visit flashes "no executions yet" / empty-routines copy for the duration of the fetch, then snaps to content — misleading (a user glancing sees "nothing has run") and visually janky, inconsistent with the spinner-gated TrafficErrorsCard right next to it.
- **Fix sketch**: In each card, destructure `loading` and render a `SkeletonCard` (already used by `DashboardIntelligencePanels`) or the shared spinner while `loading` is true, reserving the empty copy for the resolved-and-truly-empty case, matching TrafficErrorsCard's ordering.

## 2. Fetch failures render as permanent "empty" — error state indistinguishable and unrecoverable
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: error-swallowed-as-empty
- **File**: `src/app/dashboard/home/home-page/useExecutionHeatmap.ts:100-105`
- **Scenario**: In real mode, `api.listExecutions` / `getSyncedLeaderboard` / `getSyncedTriggers` fails (network blip, expired session). The catch block does `Sentry.captureException` only, `loading` goes false, and the state remains `[]`.
- **Root cause**: `useExecutionHeatmap.ts:100`, `useTopPerformers.ts:38-41`, and `useUpcomingRoutines.ts:96-99` all deliberately map errors to the initial empty array with no `error` field in their return interfaces, and no retry path. The decision that "error should look like empty" is nowhere recorded; the neighboring observability fetch made the opposite decision (`TrafficErrorsCard` gets `error` + `onRetry` + `DashboardErrorBanner`).
- **Impact**: A transient failure shows the user authoritative-looking "no executions yet" / "nothing scheduled" for the whole session — actively wrong information about their fleet with no cue that anything failed and no way to retry short of a full reload.
- **Fix sketch**: Add `error: string | null` (and a `retry()` that re-runs the effect, e.g. via a refresh counter dep) to the three hooks' return types; have the cards render the existing `DashboardErrorBanner` with retry, mirroring the TrafficErrorsCard contract.

## 3. Heatmap window relies on an undocumented `limit: 2000` + server-ordering assumption
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: magic-number-window-assumption
- **File**: `src/app/dashboard/home/home-page/useExecutionHeatmap.ts:89`
- **Scenario**: A busy fleet accumulates more than 2000 executions. The hook fetches `api.listExecutions({ limit: 2000 })` with no date filter and buckets client-side into the last `HEATMAP_DAYS` (7) days, dropping anything outside the window.
- **Root cause**: The 7-day filter is applied client-side over an arbitrarily capped page. Correctness silently depends on two unstated assumptions: (a) the API returns newest-first, and (b) 2000 rows always span at least 7 days. Neither is asserted or documented at the call site; 2000 itself is a bare magic number (contrast `HEATMAP_DAYS`, which is a named shared constant).
- **Impact**: Past 2000 runs/week, the oldest heatmap columns silently undercount — cells look "quiet" when the data was merely truncated. There is no error, no staleness cue, and the bug scales with exactly the customers most likely to stare at this chart.
- **Fix sketch**: Prefer a server-side window (`listExecutions({ since: <7 days ago> })` if the API supports it); otherwise extract `const HEATMAP_FETCH_LIMIT = 2000` with a comment stating the ordering assumption, and flag truncation (e.g. if `executions.length === limit`, treat the oldest day(s) as unknown or log/annotate).

## 4. Heatmap data is color-only and mouse-only — invisible to keyboard and screen-reader users
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: heatmap-accessibility
- **File**: `src/app/dashboard/home/home-page/ExecutionHeatmapCard.tsx:86-93`
- **Scenario**: A keyboard or screen-reader user reaches the Execution Heatmap. Each day cell is a bare `<span>` whose only information channel is `backgroundColor` plus a native `title` tooltip (`title={\`${row.persona} — ${count}\`}`) that never fires without a mouse hover; the spans are not focusable and expose no accessible name.
- **Root cause**: Counts are conveyed exclusively via a 5-step alpha ramp (`FILL`, lines 13-19) and a hover-only attribute. No `aria-label`/`sr-only` text, no `role`, and the tooltip omits the date, so even sighted mouse users can't tell *which* day a cell is ("Persona — 3" on all seven cells). Legend swatches are likewise unlabeled.
- **Impact**: WCAG 1.1.1/1.4.1 failure for the card's entire payload — non-mouse users get a heading, weekday initials, and nothing else; low-vision users must discriminate 0.28 vs 0.55 alpha violet fills. This is the dashboard's only per-agent activity view.
- **Fix sketch**: Give each cell an accessible name including the date (`aria-label={\`${row.persona}, ${weekdayLong[i]}: ${count} runs\`}` on a focusable element, or add a per-row `sr-only` textual summary), reuse the already-computed Intl formatter with `weekday: "long"`, and add the date to the visual `title` too.

## 5. Context-map drift: two listed files don't exist; the described layout is one refactor behind
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: context-map-drift
- **File**: `src/app/dashboard/home/page.tsx:32-37`
- **Scenario**: The context lists `DashboardHeaderStats.tsx` and `DashboardInstruments.tsx`; neither exists in `src/app/dashboard/home/home-page/`. The page was restructured into a "Mission Control" IA (documented in the page's own doc comment): stats now live in `VitalsConsole.tsx`, the instruments composition in `InstrumentsBay.tsx`, plus unmapped new files `TriagePane.tsx`, `StatusTicker.tsx`, `useTriageQueue.ts`, `useOpenAlertCount.ts`, `useDeferredObservability.ts`.
- **Root cause**: The dashboard-home refactor renamed/split components without the context map being regenerated, so the map describes the pre-refactor file set ("greeting header, header stats, ...").
- **Impact**: Agents and humans navigating by the context map look for phantom files and miss ~5 real ones (the triage queue and status ticker — arguably the most interactive parts of the page — are unmapped), degrading every future scan/fix pass over this context.
- **Fix sketch**: Regenerate the context map entry for Dashboard Home Overview to the current file set (drop the two phantoms, add TriagePane/VitalsConsole/StatusTicker/InstrumentsBay and their hooks) and refresh the description to the mission-control IA.
