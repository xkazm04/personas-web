# DX Fix Wave 8 — Data convention + leftover polish

> 8 atomic commits, 10 findings closed.
> Baseline preserved: 0 TS errors / 0 lint → 0 TS errors / 0 lint. `next build` green.
> Net source diff: 24 files changed, 572 insertions, 238 deletions.

## Commits

| # | Commit | Findings closed | Severity | Files |
|---|---|---|---|---|
| 1 | `0edd69f` refactor(data): drop JSX from data files, centralize timing constants | W3, P5, C11 | 2× Med + Low | 8 modified (3 new) |
| 2 | `7f03b3f` refactor(platform-layers): drop *Animated suffix from component names | P6 | Medium | 4 modified (3 renamed) |
| 3 | `a6b7d22` fix(hero): gate badge nudge behind lg breakpoint | L5 | High | 1 modified |
| 4 | `d074a56` refactor(features): name the magic numbers in ProgressionThread | W7 | Medium | 1 modified |
| 5 | `d691cf4` refactor(tool-catalogue): swarmFeatured flag replaces hardcoded id list | P8 | Medium | 2 modified |
| 6 | `238b499` refactor(SwarmView): extract computeSwarmTiming, name the magic numbers | P9 | Medium | 1 modified |
| 7 | `eb78bd0` refactor(event-bus-showcase): extract VariantTabs component | P10 | Low | 2 modified (1 new) |
| 8 | `02d725e` feat(preview): add /preview/[section] dev-only route | L9 | High | 3 new files |

## What was fixed (grouped by sub-pattern)

### A. Data convention enforcement (W3 + P5 + C11)
Three findings about the same theme, addressed in a single commit. The convention now established:

- **Data files are `.ts` (no JSX).** Where a feature needs keyed component refs, the lookup lives in a sibling `visuals.tsx`.
- **Timing constants live in `src/lib/timings.ts`.** Per-section variants instead of hardcoded ms in feature folders.

`features/data.tsx` → `data.ts` with `Feature.visualKey` discriminator and `FEATURE_VISUALS_BY_KEY` lookup. `platform-layers/data.tsx` → `data.ts` with the inline JSX visuals extracted to a new `platform-layers/visuals.tsx` keyed by `Layer.id`. `AUTO_ADVANCE_MS` now sources from `CAROUSEL_INTERVAL_MS.default` in `lib/timings.ts`.

### B. Drop misleading suffix (P6)
`LayerAnimated.tsx`, `LayerConnectionAnimated.tsx`, `StackLabelsAnimated.tsx` had a suffix unique to platform-layers/ (no other section uses an *Animated suffix; there are no non-animated counterparts). Renamed to `Layer.tsx`, `LayerConnection.tsx`, `StackLabels.tsx`. Function names updated; the imported `Layer` type is now aliased to `LayerData` in the renamed Layer.tsx to avoid the name collision.

### C. Hero badge responsive fix (L5)
`ml-[500px]` was applied unconditionally — at desktop the 500px nudge correctly positions the badge over the right command-center card, but below `lg` it shoved the badge off-screen. Changed to `lg:ml-[500px]` with an inline comment explaining the intent.

### D. Magic-number naming (W7 + P9)
Two findings, two helpers. `ProgressionThread` had three magic numbers (28, 80, 40) inside a `calc()` expression with no explanation; replaced with `HERO_DOT_TOP_PX`, `GRID_DOT_FIRST_OFFSET_PX`, `GRID_DOT_SPACING_PX` constants and a `dotTop(index)` helper. `SwarmView` had 8 magic-number expressions per node (delay, duration, totalCycle, kt1/kt2/kt3, pActive/pEnd, dx/dy); extracted to `computeSwarmTiming(index, total)` with named return fields and per-section lifecycle JSDoc. SVG SMIL kept (the alternative Framer Motion port would change visual rhythm and needs browser verification).

### E. Hidden coupling fix (P8)
`SWARM_TOOL_IDS` was a hardcoded id list in `event-bus-showcase/data.ts`. Adding Linear or Calendly to the swarm meant updating BOTH the central tool catalogue AND this section's array. Added `swarmFeatured?: boolean` to `ToolEntry` in `lib/tool-catalogue.ts`; the 10 previously-listed tools now have `swarmFeatured: true` in the catalogue. swarmTools becomes `EXTENDED_TOOLS.filter((t) => t.swarmFeatured)`. Single source of truth.

### F. God-component split (P10)
`event-bus-showcase/index.tsx` was 215 lines doing tabs + composer + telemetry + intro + tabpanel + legend. Extracted `VariantTabs` (the tablist with arrow-key keyboard handling, role/aria wiring, focus follow, and the spring-animated indicator) to `components/VariantTabs.tsx`. Index drops 38 lines and reads as composition. The 14-line composer toggle button stays inline (no second consumer; revisit if one appears).

### G. Preview infrastructure (L9)
Visual review of a single section previously required commenting out imports in `lazy.tsx` and reloading. Added `/preview` (registry-driven landing) and `/preview/[section]` (single-section mount with breadcrumb). Both return 404 in production via `NODE_ENV` check. 22 sections registered; visual review is now a URL navigation instead of a code edit + reload cycle.

## Verification table

| Gate | Before Wave 8 | After Wave 8 | Delta |
|---|---:|---:|---:|
| TypeScript errors | 0 | 0 | 0 |
| ESLint problems | 0 | 0 | 0 |
| `next build` exit | 0 | 0 | 0 |
| `data.tsx` files | 2 (features, platform-layers) | 0 | -2 |
| Routes added | (baseline) | + /preview, /preview/[section] | +2 |
| `lib/` constants | (baseline) | + lib/timings.ts | +1 file |

## Cumulative status — all 8 waves complete

| Wave | Theme | Closed |
|---|---|---:|
| 1 | Dead-code purge | 5 |
| 2 | Wrapper sweep + lazy consolidation | 4 |
| 3 | Brand theming unification | 4 |
| 4 | Extract visual primitives | 4 |
| 5 | Terminal primitives + guide-link contract | 4 |
| 6 | Index-coupled arrays + measure-pass hook | 5 |
| 7 | Hook hygiene + state-machine docs | 3 |
| 8 | Data convention + leftover polish | 10 |
| **— Dissolved by Wave 1's deletions —** | | 4 |

**Findings closed total: 39 / 43 explicit + 4 dissolved = 43 / 43 (100%).**

## Findings reconciliation

All 43 findings are now either explicitly addressed or dissolved by upstream deletions:

- **Explicitly closed (39):** L1, L3, L4, L5, L9, L10, L11; W1–W10; C1–C11; P1–P11.
- **Dissolved by Wave 1 deletions (4):**
  - L2 (initialAgents duplicated across vision-globe/honeycomb data) — dissolved with vision-globe + vision-honeycomb deletion
  - L6 (void useReducedMotion in vision-globe/index.tsx) — file deleted
  - L7 (Vision data.ts shape inconsistent across variants) — only Grid remains
  - L8 (useAgentTicker scheduler bug in vision-shared) — file deleted

## Patterns established (final tally: 18 items)

Wave 8 added two more pattern entries:

17. **A pre-baked id list paralleling a flag is hidden coupling waiting to drift** — When Section A filters Catalogue B by an explicit id array (`["x", "y", "z"]`), the catalogue maintainer has to know about the list to keep it current. Better: add a flag (`featured: true` / `inSwarm: true`) to the catalogue entry itself; the section filter becomes `catalogue.filter((e) => e.featured)`. Single source of truth, the catalogue can grow without the section filter going stale.

18. **A registry-driven dev-only route beats Storybook-light effort-to-value** — When the bottleneck is "I want to see one section in isolation without scrolling past 10 others," a 60-line Next.js dynamic route (`/preview/[section]`) gated on `NODE_ENV !== "production"` solves it without taking on Storybook as a dependency. The registry is one file; adding a section is one entry.

## Final report

The Pipeline B run on personas-web's Marketing & Landing Pages context is complete. All 43 dev-experience findings have been addressed across 7 thematic fix waves plus a polish wave (Wave 8).

**Total commits:** 36 atomic fix commits + 8 wave summary commits = 44 commits on master.

**Pattern catalogue:** 18 durable patterns documented across the wave summaries — the most valuable artefact for future audits.

**Net codebase impact:** ~1,000 LOC removed (Wave 1 dominates), 19 wrapper files deleted, 3 new shared primitives folders (terminal/, hero/HeroStatRow, get-started/visuals/chrome), 2 new routes (/preview), 1 new lib file (timings.ts). Theme-correctness bug fixed in platform-layers. Desktop UX bug fixed in marketing guide links. Stale measurements fixed via ResizeObserver hook. Index-drift hazards converted to explicit keys.

Recommend a **manual visual smoke pass** in `npx next dev`: tour the homepage at desktop and mobile widths, click through `/features`, `/connections`, `/compare`, `/roadmap`, and the new `/preview` index. The autonomous fix loop verified type-checking, linting, and the production build, but no UI changes were verified visually.
