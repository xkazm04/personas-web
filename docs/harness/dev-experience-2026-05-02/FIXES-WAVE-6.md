# DX Fix Wave 6 — Index-coupled arrays + WhyAgents measure-pass

> 5 atomic commits, 5 findings closed.
> Baseline preserved: 0 TS errors / 0 lint → 0 TS errors / 0 lint. `next build` green.
> Net source diff: 14 files changed, 180 insertions, 83 deletions.

## Commits

| # | Commit | Findings closed | Severity | Files |
|---|---|---|---|---|
| 1 | `eced59b` refactor(why-agents): extract useMaxScrollHeight, fix stale measurements | W2 | High | 2 modified (1 new) |
| 2 | `3a4b5d3` refactor(tour): inline icon/brand into TOUR_STEPS, drop parallel arrays | C6 | Medium | 5 modified |
| 3 | `48d827f` refactor(why-agents): pass scenarios as props instead of importing globally | W6 | Medium | 4 modified |
| 4 | `252ea7c` refactor(features): key card entrance by Feature.entrance, not array index | W10 | Low | 3 modified |
| 5 | `7677091` refactor(FAQ): defensive illustrations array + dev-only drift warning | C10 | Medium | 1 modified |

## What was fixed (grouped by sub-pattern)

### A. Stale measurement → ResizeObserver-backed hook (W2)
WhyAgents measured the tallest workflow/agent panel across scenarios once on mount via an inline `useEffect` with empty deps. Heights stayed in initial state forever — silently wrong after font-load, viewport zoom, or i18n copy changes. The measurement math (querySelectorAll + scrollHeight aggregation + queueMicrotask batching) was inlined alongside the rendering logic.

Extracted to `src/hooks/useMaxScrollHeight.ts`:
```ts
useMaxScrollHeight(containerRef, selector) → number
```

The hook uses `ResizeObserver` so heights stay current when the measurement subtree's content reflows. WhyAgents drops 18 lines of inline measurement logic and gains the freshness guarantee.

**Deferred:** the hidden subtree still mounts full framer-motion versions of the panels for measurement (10 invisible motion subtrees per load). Reducing this requires either Portal-based mount or a `static` prop on the panels — bigger refactor; the ResizeObserver fix addresses the immediate freshness bug.

### B. Inline icon + brand into TOUR_STEPS (C6)
TOUR_STEPS lived in `src/data/tour.ts` with 5 entries; the icon, brand, and visual were stored in three separate index-aligned arrays in two different files. Reordering, adding, or removing a step required updating three more arrays in two more files — and `STEP_VISUALS.length !== TOUR_STEPS.length` would yield an undefined Visual at runtime.

`TourStep` gains `brand: BrandKey` (theme-correct, replacing the legacy `color: string` hex) and `icon: LucideIcon`. `STEP_ICONS` and `STEP_BRAND` are deleted. `STEP_VISUALS` stays in `visuals/index.ts` (importing JSX-component refs into `/data/` would be a layering inversion) but gains a dev-only runtime assertion that fires on length drift. `StepChip` and the GetStarted index simplified to derive everything from `step.brand` / `step.icon`.

### C. Scenarios as a prop, not a global import (W6)
Four `why-agents/components/*` reached back into `../data` for the `scenarios` constant instead of receiving it as a prop. The parent `index.tsx` already had `scenarios` and a derived `scenario` — but only passed `scenario` (singular) down. ScenarioDuel even re-derived `scenarios[activeIndex]` twice inside its memoized children when it already received `scenario` as a prop — a latent bug the day someone added a transform between parent and child.

ScenarioSelector and ScenarioProgress now take `scenarios: Scenario[]` as a prop. ScenarioDuel takes `total: number` for its aria-label. The inner WorkflowContent and AgentContent memo components receive `scenario: Scenario` directly instead of looking it up by index — single source of truth, no double-derivation.

### D. Card entrance keyed by feature, not array position (W10)
The 3 secondary feature cards each used a different motion entrance via `gridCardVariants[i]` indexed by `features.slice(1).map((f, i) => ...)`. Reordering features re-shuffled the entrance animations without warning; adding a 5th feature made the new card get `undefined` as its variant.

New `FeatureEntrance = "slideLeft" | "fadeUp" | "slideRight"` discriminator on each Feature. `gridCardVariants` is now `Record<FeatureEntrance, Variants>` instead of `Variants[]`. Lookup is `gridCardVariants[f.entrance]`. Adding a 5th feature requires choosing an entrance value — the parallel-array bug is impossible.

### E. FAQ illustrations defensive (C10)
`illustrations[i]` paired questions to illustrations purely by array index. Translator reorders, additions, or removals would silently shift illustrations to wrong questions. The full fix (extending the i18n schema with stable per-question `id` keys across all 14 locale files) is out of scope; instead delivered a defensive interim fix:

- Renamed `illustrations` → `FAQ_ILLUSTRATIONS_BY_POSITION` so the coupling is named at the use site
- Added a dev-only console warning when lengths mismatch
- Added `FALLBACK_ILLUSTRATION` so missing entries gracefully degrade
- Inline JSDoc points readers at the harness finding for the i18n key migration

Doesn't prevent drift at compile time — that's the deferred follow-up — but catches it in dev/QA the moment it happens.

## Verification table

| Gate | Before Wave 6 | After Wave 6 | Delta |
|---|---:|---:|---:|
| TypeScript errors | 0 | 0 | 0 |
| ESLint problems | 0 | 0 | 0 |
| `next build` exit | 0 | 0 | 0 |
| Parallel arrays in get-started/ | 3 (icons + brands + visuals) | 1 (visuals only, with assertion) | -2 |
| Inline measurement logic in why-agents | 18 lines | 0 (extracted to hook) | -18 |
| Hooks added | (baseline) | + useMaxScrollHeight | +1 |

## Cumulative status (across all waves so far)

| Wave | Theme | Closed |
|---|---|---:|
| 1 | Dead-code purge | 5 |
| 2 | Wrapper sweep + lazy consolidation | 4 |
| 3 | Brand theming unification | 4 |
| 4 | Extract visual primitives | 4 |
| 5 | Terminal primitives + guide-link contract | 4 |
| 6 | Index-coupled arrays + measure-pass hook | 5 |

Pattern catalogue: 15 items (13 from prior waves, 2 new). Findings closed total: **26 / 43**.

## Patterns established (additions to the catalogue, items 14–15)

14. **Parallel arrays-by-index encode invariants the type system can't enforce** — Two arrays expected to share a length and order are a silent-drift bug waiting to fire. The structural fix is to merge the satellite array's data into the primary type as a field. The "but the data file would import React types" objection (`LucideIcon`, `BrandKey`) is usually a red herring — those are pure TypeScript types, no DOM dependency. When the satellite array genuinely can't move (component refs into a /data/ file would be a layering inversion), at minimum: rename to `*_BY_POSITION`, add a runtime length assertion, document the migration in JSDoc.

15. **Stable measurements need an observer, not a one-shot effect** — `useEffect(measure, [])` only fires once; any later change to font load, viewport, content, or i18n copy silently leaves the captured value stale. `ResizeObserver` is the right primitive — observe the container and re-measure on reflow. Extract into a hook so the call site stays declarative.

## What remains

| Wave | Theme | Approx count |
|---|---|---:|
| 7 | Hook hygiene (3 findings; 2 dissolved by Wave 1) | 3 |
| 8 (optional) | Data-convention + leftover polish | 12 |

Note: Wave 7 originally had 5 findings (L8, P7, L6, C9, L11), but two of them (L8 useAgentTicker, L6 void useReducedMotion) lived in `vision-shared/` and `vision-globe/index.tsx` — both deleted in Wave 1. Those findings are dissolved; Wave 7 has 3 actual findings remaining: P7 (useTerminalSequence reducer), C9 (useColumns rename), L11 (useId JSDoc).
