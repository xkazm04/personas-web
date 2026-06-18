# Public Roadmap — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 2, Medium: 3, Low: 0)

> Scope note: The page was refactored since the 2026-05-10 scan. `RoadmapCard.tsx` and the client-side `useEffect` fetch of `/api/roadmap` are **gone**; the live `/roadmap` render path is now fully static (`Roadmap` → `RoadmapProgress` + `RoadmapAreas`, all driven by `roadmap-phases.ts` and `areas.ts`). Consequently 5 of the 7 prior findings (loader-stuck, `r.ok`, runtime status validation, `sort_order` badge, page-`revalidate` mismatch) are **stale / no longer reachable** — they described code that no longer renders. The findings below are verified against the CURRENT code.

## 1. e2e roadmap test asserts UI text that the page never renders (success-theater / dead tests)
- **Severity**: High
- **Lens**: test-mastery
- **Category**: Success-theater test / coverage illusion
- **File**: e2e/roadmap.spec.ts:14-23
- **Scenario**: The only automated coverage for the public roadmap is `e2e/roadmap.spec.ts`. Test 4 (`displays roadmap items with status badges`) asserts `main` contains `"In Progress"`. But the live render path (`RoadmapProgress` + `RoadmapAreas` + `FeatureVoting` + `ChangelogTimeline`) emits NO `"In Progress"` string — that label lives only in `phaseStatusConfig` in `roadmap-phases.ts`, which is imported by nothing that renders (verified by grep: `phaseStatusConfig`/`PhaseCardStrip`/`phases` are unused on `/roadmap`). Test 3 (`shows current focus callout`) asserts `"cloud"` — there is no "current focus" callout; it passes only by coincidentally matching the lowercase word in the Core-Platform area caption "Dev mode, cloud execution, painless installs".
- **Root cause**: Tests were written against an earlier roadmap UI (status-badged `RoadmapCard` list + a focus callout) and were never updated when the page was rebuilt as static area cards. They assert text by `toContainText` against the whole `main`, so a meaningless coincidental match masks the loss of the assertion's intent.
- **Impact**: false-confidence test — test 4 is either red (and being ignored) or only ever matched stale markup; test 3 asserts nothing real. The most marketing-visible public page effectively has zero meaningful, intentional coverage despite a green-looking suite.
- **Fix sketch**: Rewrite assertions against what actually renders: progress bar text (`/\d+ of \d+ phases complete/`, `progressPercent%`), a known area title ("Internationalization"), and a `role="progressbar"` `aria-valuenow` value from `RevealTile`. Delete the `"In Progress"` and `"current focus"` assertions.

## 2. Headline progress (`progressPercent`) is the page's hero number with zero meaningful test and a latent empty-set NaN
- **Severity**: High
- **Lens**: test-mastery
- **Category**: Untested business-critical aggregator / divide-by-zero
- **File**: src/data/roadmap-phases.ts:260-266
- **Scenario**: `completedCount`, `totalPhases`, `remainingCount`, `progressPercent`, `progressWidth`, `firstRemainingPhase` are derived from `phaseCardData` at module load and drive the single most prominent public claim ("11 of 15 phases complete", "73%", the animated bar width, the done/remaining labels in `RoadmapProgress`, and the hero `command-center-geometry`). There is no unit-test runner in this repo (Playwright e2e only), and the e2e suite only checks that the word "phases" appears — it never asserts the *number* is correct. If `phaseCardData` is ever emptied or all-false, `progressPercent = Math.round((0/0)*100) = NaN` renders "NaN%" and `progressWidth = "NaN%"` produces an invalid CSS width.
- **Root cause**: A revenue/marketing-sensitive aggregation lives in a pure module with no quality gate; correctness depends entirely on a human eyeballing the rendered page, and the empty/all-incomplete edge case is unguarded.
- **Impact**: false-confidence test + latent UX degradation — a bad edit to `phaseCardData` (or a future data source) ships a wrong or "NaN%" public progress figure with nothing to catch it.
- **Fix sketch**: Add a tiny unit harness (or assert in e2e against the computed value) covering: `completedCount + remainingCount === totalPhases`, `0 ≤ progressPercent ≤ 100`, and `totalPhases === 0 → progressPercent === 0` (guard the division: `totalPhases ? Math.round(...) : 0`).

## 3. `areaOverall` returns NaN for a headline-less area with empty bars (unguarded mean)
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: Divide-by-zero / progress math
- **File**: src/components/sections/roadmap/areas.ts:179-183
- **Scenario**: `areaOverall(area)` returns `area.headline ? area.headline.value : area.bars.reduce((s,b)=>s+b.value,0) / area.bars.length`. An area authored with `bars: []` and no `headline` yields `0 / 0 = NaN`; `AreaCardShell` then renders `Math.round(NaN * 100)` → "NaN%" in the card header. All current areas have bars, so it is latent, but the data shape permits it and `AreaDef.headline` is optional.
- **Root cause**: The mean assumes `bars.length > 0` and that a headline-less area always has bars; nothing enforces it at the type or runtime level.
- **Impact**: UX degradation — a single mis-authored area renders a broken "NaN%" header on the public page.
- **Fix sketch**: Guard the mean: `const n = area.bars.length; return area.headline ? area.headline.value : n ? sum / n : 0;` and add a unit assertion that `areaOverall` is finite and in `[0,1]` for every `AREAS` entry.

## 4. Bar `value`s are never clamped to [0,1]; out-of-range values break the reveal clip and aria
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: Edge case / boundary math
- **File**: src/components/sections/roadmap/components/RoadmapAreas.tsx:81-90
- **Scenario**: `RevealTile` computes `pct = Math.round(bar.value * 100)` and builds `revealClip = inset(0 ${100 - pct}% 0 0)`. Bar values are hand-authored fractions (e.g. `57/210`, `13/40`). If any future edit produces `value > 1` (numerator > denominator) or a negative value, `pct` exceeds 100 / goes negative, `100 - pct` becomes negative (invalid `inset` → browser ignores the clip and the "developed" art shows fully regardless of real progress), and `aria-valuenow={pct}` violates the declared `aria-valuemax={100}`, misreporting to screen readers.
- **Root cause**: The component trusts that authored fractions are always within `[0,1]`; there is no `clamp(0,1)` before the percentage/clip/aria computation.
- **Impact**: UX degradation + a11y correctness — a typo'd fraction silently renders a full/garbled bar and an invalid `aria-valuenow`, with no test to catch it.
- **Fix sketch**: `const pct = Math.round(Math.min(1, Math.max(0, bar.value)) * 100);` in `RevealTile` (and mirror the clamp in `AreaCardShell`'s `overall`).

## 5. `/api/roadmap` route + `RoadmapItem` type are orphaned dead code (no consumer)
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: Dead code / latent re-wiring hazard
- **File**: src/app/api/roadmap/route.ts:1-33
- **Scenario**: Grep across `src` finds no client or server consumer of `/api/roadmap`, `roadmap_items`, `RoadmapResponse`, or `RoadmapItem` — the only references are the route, its `types.ts`, and the (unused) shared `RoadmapItem` type. The live `/roadmap` page renders entirely from static `phaseCardData`/`AREAS`. The route still reads Supabase, casts `data ?? []` straight to `RoadmapItem[]` with no runtime validation of `status`/`priority`/`sort_order`, and returns JSON with no `Cache-Control`. None of this is reachable today, but the endpoint is publicly callable and primed to reintroduce the (now-stale) 2026-05-10 validation/caching defects the instant anyone re-wires the UI to it.
- **Root cause**: A data-fetching layer was retained after the UI that consumed it was replaced with a static implementation; the unvalidated cast + missing cache policy were never removed because the code path went dormant rather than deleted.
- **Impact**: data-shape mismatch hazard on re-wire + dead surface area — a public endpoint that returns unvalidated DB rows and confuses the source-of-truth story (static phases vs Supabase items).
- **Fix sketch**: Either delete `src/app/api/roadmap/*` and the unused `RoadmapItem` type, or, if it is intended for future use, add Zod validation of rows + drop unknown-enum rows + set `export const dynamic = "force-dynamic"` and an explicit `Cache-Control` header before any UI depends on it.
