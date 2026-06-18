# Leaderboard & Rankings — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Pure scoring/ranking modules have zero tests and no unit harness
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing quality gate / coverage gap
- **File**: src/app/dashboard/leaderboard/leaderboard-page/leaderboardSort.ts:8-38, src/app/dashboard/leaderboard/leaderboard-page/leaderboardRank.ts:14-26
- **Scenario**: `rankByComposite`, `sortPersonas`, `defaultDirFor`, `rankByDimension`, and `dimensionScore` are the deterministic core of the leaderboard (rank badge numbers, column sort order, podium ordering). They are pure, side-effect-free, and trivially testable — yet the project has NO unit runner (Playwright e2e only) and not a single test exercises them. The 2026-05-10 bug-hunt scan flagged nothing here; the gap persists.
- **Root cause**: Assumption that ranking correctness is "obviously right" and covered by e2e. E2e against the static `MOCK_LEADERBOARD` (which has no ties and is pre-sorted) never exercises tie-breaking, empty sets, asc/desc symmetry, or fractional supabase composites — so regressions in the sort math ship silently.
- **Impact**: false-confidence / latent ranking bugs ship unguarded — wrong rank badges, mis-ordered podium, money-adjacent "best agent" decisions made on untested math.
- **Fix sketch**: Add a unit runner (vitest) and an LLM-generatable batch asserting true invariants: `sortPersonas(asc)` is the exact reverse of `(desc)` for distinct values; ties always break A→Z by name; `rankByComposite([])` returns an empty map; rank is independent of input order; `dimensionScore(p,"overall")===p.composite`. Wire a `coverage` gate on this folder.

## 2. Supabase radar metrics are cohort-relative but rendered on an absolute 0–100 axis
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: radar-chart normalization / divide-degenerate
- **File**: src/lib/supabaseApi.ts:760-796, src/app/dashboard/leaderboard/page.tsx:45-67
- **Scenario**: In real/supabase mode `cost`, `speed`, and `volume` are normalized against the cohort max (`maxPerExecCost`, `maxDuration`, `maxVolume`). With a single persona (or a cohort where one row dominates), `perExecCost[i]/maxPerExecCost === 1`, so `cost = (1-1)*100 = 0` and `speed = 0`, while `volume = (total/maxVolume)*100 = 100`. The radar (`domain={[0,100]}`) then shows the sole/anchor persona pinned to 0 on cost & speed regardless of its actual real-world performance.
- **Root cause**: Min/max cohort normalization conflates "worst in this cohort" with "absolute 0", but the radar axis presents values as absolute capability (0=bad, 100=great). The anchor (worst/only) persona is structurally forced to ~0 on relative axes.
- **Impact**: UX degradation / misleading data — a perfectly healthy lone agent looks like it has zero cost-efficiency and zero speed; benchmark overlay comparison is meaningless when n=1.
- **Fix sketch**: Score cost/speed against an absolute reference (target/SLA budget) rather than cohort max, or special-case n<2 to skip relative scoring; at minimum label the radar axes as "relative to cohort" so the 0 anchor is interpretable.

## 3. Benchmark overlay assumes `personas[0]` is the composite #1, decoupled from `rankByComposite`
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: data-shape assumption / ranking inconsistency
- **File**: src/app/dashboard/leaderboard/page.tsx:42-43, src/app/dashboard/leaderboard/leaderboard-page/LeaderboardTable.tsx:42
- **Scenario**: `benchmark = personas[0]` and `selected ?? personas[0]` both trust array position 0 to be the true leader. The table computes the authoritative rank independently via `rankByComposite(personas)`. Both current sources happen to pre-sort by composite, but if a future/edge source returns rows in a different order (or supabase returns an unsorted `synced_leaderboard` view), the radar's "benchmark = #1" overlay and the default selection would point at a non-leader while the table's badge "1" sits on a different row.
- **Root cause**: Two independent notions of "rank #1" — positional `personas[0]` in the page vs. computed `rankByComposite` in the table — with no shared source of truth keeping them consistent.
- **Impact**: UX degradation / inconsistent UI — benchmark line and rank-1 badge disagree; "compare vs leader" silently compares against the wrong agent.
- **Fix sketch**: Derive the leader from the same ranking helper (e.g. expose a `topByComposite(personas)` and use it for both `benchmark` and the default selection) instead of `personas[0]`.

## 4. `localeCompare` tie-break is locale/host-dependent, so "stable rank badges" isn't guaranteed
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: sort stability / determinism
- **File**: src/app/dashboard/leaderboard/leaderboard-page/leaderboardSort.ts:12,35, src/app/dashboard/leaderboard/leaderboard-page/leaderboardRank.ts:24
- **Scenario**: Every tie-break uses `a.name.localeCompare(b.name)` with no locale/options argument, which falls back to the runtime's default collation. Two personas tied on composite (common with rounded/clamped supabase scores, e.g. both 73) can order differently between the SSR pass (server ICU locale) and the client hydration (browser locale), or between users in different locales — especially with diacritics or mixed case. The module comment promises "ties broken by name so the badge numbers stay stable", but that stability depends on collation parity that isn't enforced.
- **Root cause**: Relying on environment-default `localeCompare` for a determinism guarantee, with no fixed locale and no final stable tiebreaker (e.g. `id`).
- **Impact**: UX degradation / hydration mismatch — rank badges can flicker/reorder on hydration or differ per locale; the "deterministic order" invariant is not actually deterministic.
- **Fix sketch**: Pin collation (`localeCompare(b.name, "en", { sensitivity: "base" })`) and add a final stable tiebreaker on `id` so equal names/scores never reorder; cover with the test batch from finding #1.

## 5. Supabase composite is unrounded, breaking the integer display contract of the table/podium
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: data-shape mismatch / display
- **File**: src/lib/supabaseApi.ts:786-788, src/app/dashboard/leaderboard/leaderboard-page/LeaderboardTable.tsx:101,108
- **Scenario**: Mock data computes `composite` via `Math.round(avg)` (integers), but `getSyncedLeaderboard` returns `clamp100((reliability+cost+speed+quality+volume)/5)` with no rounding. The table renders `{persona.composite}` directly in the pill and as the bar width `${persona.composite}%`, and the podium `ScoreRing` shows `{pct}`. A real composite like `73.60000000000001` renders verbatim in the pill (`73.60000000000001`) — visually broken vs the integer mock and the `tabular-nums` styling intent.
- **Root cause**: Two producers of `composite` with divergent rounding contracts; the consumers assume the integer contract the mock established.
- **Impact**: UX degradation — long floating-point composite strings in pills/rings; inconsistent precision between demo and real mode.
- **Fix sketch**: Round in `getSyncedLeaderboard` to match the mock (`Math.round`), or round at render in `LeaderboardTable`/`ScoreRing` (`Math.round(persona.composite)`); assert the integer contract in the metric-normalization test batch.
