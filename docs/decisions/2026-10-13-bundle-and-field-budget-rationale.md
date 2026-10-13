# 2026-10-13 Why the bundle and field budget numbers sit where they do

**Governs:** `bundle-budget.json`

## Context

Two committed files set performance ceilings: `bundle-budget.json` (per-route first-load JS, gated in CI by `check:bundle`) and `field-budget.json` (real-user p75 Core Web Vitals, checked by hand with `check:field`). Neither file records why a number is what it is. So a reader who hits a ceiling cannot tell whether it is a target, a measurement or a guess, and raising it is a coin toss. This record sets out the rule that produces each number. `src/lib/budgetRationale.test.ts` holds the files, the scripts and this record to the same constants.

## Decision

### Bundle budget: a ceiling is a measurement plus headroom, never a target

1. **What is measured.** Each route's first-load *uncompressed* JS in KB, read from `firstLoadUncompressedJsBytes` in the stats `next build` writes (`.next/diagnostics/route-bundle-stats.json`). Next 16 prints no size columns, so this is the only view of bundle weight the repo has (see the header of `scripts/check-bundle-budget.mjs`).
2. **Every route ceiling is `measured + toleranceKB`, rounded.** `npm run check:bundle -- --update` writes it that way for every route at once. `toleranceKB` is 40 (`TOLERANCE_KB` in the script, echoed into the file). A route's ceiling minus 40 is therefore its size on the `generatedAt` date. For example, in the 2026-10-10 baseline `/dashboard` had a ceiling of 1413, so it measured about 1373 KB. No route has a hand-picked ceiling, and the gap between routes is the gap in what they ship. The dashboard SPA and `/demo` carry the dashboard views; the marketing routes sit roughly 40 to 200 KB above the shared floor.
3. **Why 40 KB.** The tolerance is big enough that ordinary churn (a new string table entry, a small component) does not fail CI. It is small enough that one statically imported heavy dependency still does: the recharts chunk that motivated the gate was 344 KB.
4. **`sharedBaselineKB` is `sharedKB + toleranceKB`.** It covers the chunks every route loads, so a regression in the root layout fails once, against its own ceiling, rather than as noise across every route.
5. **Slack is reported, not enforced.** A route more than 80 KB (`SLACK_REPORT_KB`) under its ceiling is listed so the win can be locked in by re-baselining. The ceiling never drifts upward on its own.
6. **Raising a ceiling** means re-running `--update` for all routes after a deliberate change and giving the reason in the commit message, as the **Bundle budget** convention in `.claude/CLAUDE.md` says. Editing one number by hand breaks rule 2 and is not allowed.

Which route is closest to its ceiling today can only be answered by a fresh `npm run build` followed by `npm run check:bundle`. The numbers in the file are ceilings, not current sizes, so this record does not repeat them.

### Field budget: the defaults are the Core Web Vitals "good" thresholds

1. **Defaults are Google's "good" boundaries at p75:** LCP 2500 ms, INP 200 ms, CLS 0.1. These are the published thresholds a page must meet for 75% of visits to be rated good. `scripts/check-field-budget.mjs` also counts routes at INP ≤ 200 ms against the same boundary. These are targets, not measurements, because no route has enough field data to baseline against yet.
2. **`minSamples` is 50.** A p75 from fewer visits is mostly noise, and the reporter only sends vitals for visitors who consented, so traffic is thin. Cells below 50 are listed as "insufficient" and never gate.
3. **`routes` is empty and `warnOnly` is true** until a nightly snapshot has at least `minSamples` for a route. Then the route gets its own entry, which may sit tighter than the default but never looser, and `warnOnly` flips to false once the snapshot export runs on a schedule.

## Alternatives rejected

- **Per-route hand-set bundle targets.** A target with no measurement behind it is the guess this record exists to remove.
- **Gzip/Brotli sizes.** These are closer to bytes on the wire, but the build stats expose uncompressed totals, and compression ratio swings would make the 40 KB tolerance meaningless.
- **Field ceilings tighter than "good" from day one.** Without samples there is nothing to tighten against.
