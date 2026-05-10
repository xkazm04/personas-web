# Bug Hunter — Pricing & Feature Comparison

> Total: 7 findings (Critical: 0, High: 2, Medium: 4, Low: 1)
> Scope: 15 files
> Date: 2026-05-10

## 1. `before:` highlight band on Personas column is invisible — CSS var set, never consumed
- **Severity**: high
- **Category**: Silent failure / visual regression
- **File**: `src/components/sections/comparison-table/components/FeatureRow.tsx:30-39`
- **Scenario**: Every `personas` cell renders a `<div>` whose className contains `relative before:absolute before:inset-y-[-12px] before:inset-x-[-8px] before:rounded-md before:pointer-events-none`. The inline style sets a custom CSS property `--before-bg` to `tint("cyan", 3)`. Since the `before:` pseudo-element has neither `before:content-['']` nor `before:bg-[var(--before-bg)]` (nor any background utility), the pseudo-element never paints. Tailwind v4 still requires `content-['']` to instantiate a pseudo, and the variable consumer is missing entirely.
- **Root cause**: A column-highlight band feature was wired up via a CSS variable, but the corresponding utility classes that would (a) inject a `content` value and (b) read `var(--before-bg)` as a background were never added. The component "looks" correct in code review because the `before:*` class list is long, masking the omission.
- **Impact**: The vertical "Personas" column highlight that visually anchors the comparison table is silently absent in production. Repro is universal: load `/compare`, observe that the Personas column has no soft cyan band behind its cells. No errors, no logs.
- **Fix sketch**: Add `before:content-[''] before:bg-[var(--before-bg)]` (and ideally `before:-z-10` so it sits behind the cell content) to the `personas` className. Verify with a Playwright visual snapshot — the missing fill is exactly the kind of regression that should be caught at the integration test layer.

## 2. Initial `activeIds` set is a hardcoded literal that drifts from `COMPETITORS`
- **Severity**: high
- **Category**: Latent failure / assumption landmine
- **File**: `src/components/sections/comparison-table/index.tsx:15-17`
- **Scenario**: `useState<Set<CompetitorId>>(() => new Set<CompetitorId>(["personas", "crewai", "langchain", "n8n", "autogen"]))` lists all five current competitor IDs by hand. The `assertComparisonDataComplete()` invariant (in `src/data/comparison.ts:400`) does not protect this site — it only validates row completeness, not that the default-active set matches the COMPETITORS list. If a sixth competitor (say "smolagents") is added to `COMPETITORS` and to every row, the build still succeeds, but the new competitor (a) is never in `activeIds` on first render, (b) appears as a "+" chip the user must click to enable, and (c) the chips bar will silently disable / show wrong state for it because `aria-pressed={active}` is false even though the user's mental model is "all on by default". Conversely, removing or renaming a competitor id leaves a ghost id in `activeIds` that matches nothing in `COMPETITORS`, so `activeCompetitors.length` silently shrinks and the "remove" guard `next.size <= 2` becomes wrong (the displayed chip count and the internal Set size diverge).
- **Root cause**: Two sources of truth for "which competitors are visible by default" — the data array and the literal `Set` initializer. There is no derivation from `COMPETITORS`.
- **Impact**: Adding a competitor is a two-file change with no compile-time enforcement; forgetting one yields a UX bug that ships silently. The safeguard `next.size <= 2` becomes off-by-one if the initial set contains stale ids.
- **Fix sketch**: Replace the literal with `() => new Set(COMPETITORS.map((c) => c.id))` (or a curated subset derived as `COMPETITORS.filter((c) => c.defaultActive).map(...)` if a curated default is desired). The existing `assertComparisonDataComplete()` already runs at module load — extend it to assert "all default-active ids exist in COMPETITORS" if a curated subset is kept.

## 3. `CategoryBlock` open/close state is captured once from `defaultOpen`, never reconciled
- **Severity**: medium
- **Category**: Race / stale closure
- **File**: `src/components/sections/comparison-table/components/CategoryBlock.tsx:18`
- **Scenario**: `useState(defaultOpen)` reads `defaultOpen` exactly once at mount. The parent computes `defaultOpen={i < 3}` from the iteration index over `COMPARISON_CATEGORIES`. Today the categories list is static, so this works. But: (a) if a future filter / search / reorder feature is added that re-keys items differently, the same React node may receive a new `defaultOpen` prop and ignore it; (b) more subtly, `key={cat.name}` means React preserves component instances across category reorders — if categories ever swap positions, two blocks keep their old `open` values rather than honoring the new `i < 3` rule. This is a textbook "controlled-vs-uncontrolled" hazard.
- **Root cause**: `defaultOpen` is treated as initial-only, but its derivation (`i < 3`) couples it to list position rather than category identity. Any reordering of the data invalidates the assumption.
- **Impact**: Ships fine today; quietly breaks the moment anyone adds a "expand by default" CMS field, a reorder UI, or a "search" pre-filter. The bug would manifest as "the wrong sections are open after filter" — exactly the kind of issue users report as "weird" rather than "broken".
- **Fix sketch**: Either (a) lift open/closed state to the parent so it is derived per render, or (b) add `useEffect` to sync `setOpen(defaultOpen)` when a stable identity changes (e.g., `useEffect(() => setOpen(defaultOpen), [category.name])`). Better still, drive `open` from a parent `Map<string, boolean>` keyed by `category.name` so identity is explicit.

## 4. Hardcoded "40+ features" claim drifts from actual data
- **Severity**: medium
- **Category**: Latent failure / silent staleness
- **File**: `src/components/sections/comparison-table/components/VerdictSection.tsx:27`
- **Scenario**: The verdict copy reads `The bottom line across {40}+ features compared above.` with `40` as a literal JS expression. The actual count of `ComparisonRow` items across `COMPARISON_CATEGORIES` is `9 categories × 4–6 rows = 51` today. If features are added/removed (a routine marketing/data update), this number does not update. Worse, the `{40}` syntax (rather than a string) hides the literalness from a casual reader who assumes the figure is computed.
- **Root cause**: Marketing copy uses a literal where a `useMemo`-style derivation from `COMPARISON_CATEGORIES.reduce((n, c) => n + c.features.length, 0)` would self-update. The literal also disagrees with the current data (51, not 40).
- **Impact**: An advertising claim ("40+ features") is wrong-by-omission today (under-promising) and will become wrong-by-overstatement if features are pruned to ≤ 40 without anyone noticing. Mild credibility / accuracy risk.
- **Fix sketch**: Compute at module scope: `const TOTAL_FEATURES = COMPARISON_CATEGORIES.reduce((n, c) => n + c.features.length, 0);` and render `{TOTAL_FEATURES}+ features`. Even better, render the exact count without the `+` to keep marketing honest.

## 5. `reportedMissingCells` Set is unbounded and module-scoped — leaks across SPA navigation
- **Severity**: medium
- **Category**: Memory / silent failure
- **File**: `src/components/sections/comparison-table/components/CellValue.tsx:8, 53-58`
- **Scenario**: `const reportedMissingCells = new Set<string>();` lives at module scope. The `assertComparisonDataComplete()` invariant means today this Set is never populated (every value is string|boolean by build time). However, if a future change permits `undefined` (e.g., async data, a partial competitor "tools" feature where some cells are intentionally blank), the Set grows on every distinct `(competitor, feature)` miss and never resets. Across SPA route transitions in the App Router, the module remains loaded, so the dedupe state persists for the entire tab's lifetime. With Sentry's `captureExceptionScrubbed` rate-limiting per (competitor, feature) is the intent, but if the data is dynamic per-render (e.g., a feature flag toggling rows), the cardinality grows without bound.
- **Root cause**: Module-level mutable state used as a session cache without an upper bound or eviction policy, paired with `typeof window !== "undefined"` so the assumption is "client-only and short-lived" — but App Router SPAs are anything but short-lived.
- **Impact**: Today: dead code (assertion blocks all undefined values at build). Tomorrow: silent memory growth proportional to number of distinct missing cells observed in a session, plus a Sentry storm if a regression slips past the assertion (every refresh emits one event per distinct cell).
- **Fix sketch**: Either (a) cap the Set at e.g. 50 entries with FIFO eviction, (b) move the Set into a `useRef` so it's component-scoped, or (c) drop the runtime Sentry capture entirely since `assertComparisonDataComplete()` already throws at build/load and is the better enforcement layer. Option (c) is preferable — two layers of "protection" against the same impossible state add no real defense and create a maintenance trap.

## 6. `CategoryBlock.blockId` slugifies on `category.name` — collision risk with no detection
- **Severity**: medium
- **Category**: Edge case / DOM correctness
- **File**: `src/components/sections/comparison-table/components/CategoryBlock.tsx:22`
- **Scenario**: `const blockId = "category-" + category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")`. Today's categories are all unique under that slug. But "Triggers & Scheduling" and "Triggers / Scheduling" would both slugify to `category-triggers-scheduling`, producing duplicate `id` attributes on the page. The `aria-controls` linkage breaks (assistive tech jumps to the first match), and any `document.getElementById` lookup elsewhere returns the wrong element.
- **Root cause**: Slug derivation has no uniqueness check. `category.name` is human-authored marketing copy and not constrained to be slug-unique. The data type permits the collision; nothing detects it.
- **Impact**: A11y regression and potential JS crash (if any future hash routing or anchor-scroll code does `getElementById`). The bug appears only when someone adds a similar-sounding category — the kind of change a non-engineer might make in `data.ts`.
- **Fix sketch**: Add a uniqueness assertion to `assertComparisonDataComplete()` in `src/data/comparison.ts`: build the slug for each category and throw if duplicates exist. Alternatively, attach a stable `slug` field to each `ComparisonCategory` and validate it directly.

## 7. `FeatureRow` keyed by `row.label` — silent state aliasing on duplicate labels
- **Severity**: low
- **Category**: Edge case / React state corruption
- **File**: `src/components/sections/comparison-table/components/CategoryBlock.tsx:47`, `src/data/comparison.ts:90+`
- **Scenario**: `category.features.map((row) => <FeatureRow key={row.label} ... />)`. There is no validation that labels are unique within a category. Two rows with identical labels would collide on React's reconciliation key, causing one to swallow the other's DOM (and any future per-row `useState`/animation state to swap unpredictably). Today's data has unique labels, but nothing enforces it.
- **Root cause**: React `key` derived from a non-guaranteed-unique field. The `assertComparisonDataComplete()` checks values, not label uniqueness.
- **Impact**: Silent: in dev React would log a "Encountered two children with the same key" warning, but in production this is suppressed and one row simply doesn't render. Easy to miss in QA because it requires a specific data edit.
- **Fix sketch**: Extend `assertComparisonDataComplete()` to also verify `new Set(features.map((f) => f.label)).size === features.length` per category, throwing if duplicates exist. Optionally add a `slug` or `id` field to `ComparisonRow` and key on that instead of the human-authored label.
