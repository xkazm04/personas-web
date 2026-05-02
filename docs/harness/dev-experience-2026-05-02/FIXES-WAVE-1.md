# DX Fix Wave 1 — Dead-code purge

> 4 atomic commits, 5 findings closed.
> Baseline preserved: 0 TS errors / 0 lint → 0 TS errors / 0 lint. `next build` green.
> Net source diff: **26 files changed, 6 insertions, 1022 deletions** (~1,016 LOC removed).

## Commits

| # | Commit | Findings closed | Severity | Files |
|---|---|---|---|---|
| 1 | `1a69e21` refactor(sections): delete dead Vision variants (Globe + Honeycomb) | L1, L3 | 1 Critical + 1 Medium | 18 deleted |
| 2 | `b89c703` refactor(sections): collapse Vision and VisionGrid wrappers | L4 | Medium | 2 deleted, 1 modified |
| 3 | `02ad340` refactor(sections): drop PipelineShowcase alias for OrchestrationHub | P1 | High | 1 deleted, 2 modified |
| 4 | `d0f98b5` docs(harness): record MidPageCTA phantom resolution | C1 | High | 1 modified (also: Vibeman context PUT) |

## What was fixed (grouped by sub-pattern)

### A. Orphaned A/B prototype losers
The Vision section originally had three competing variants (Grid, Globe, Honeycomb). Grid won; the other two were never deleted. The scan caught **17 source files / ~900 LOC** of code that was being type-checked, linted, and bundled with no consumer. The `vision-shared/` folder had `AnimatedCounter`, `useAgentTicker`, and `FLASH_DURATION_S` — all consumed only by the dead variants — so it went too. This single commit deleted more code than the rest of the wave combined.

The L3 finding (the `AnimatedCounter` triplet — one real + two pass-through shims) dissolved automatically: the two shims lived inside the deleted vision-globe/vision-honeycomb folders, and the real implementation in vision-shared/ had no other consumers.

### B. Indirection-only wrappers
After the dead variants were gone, `Vision.tsx` and `VisionGrid.tsx` were each one-line shims (`Vision.tsx` rendered `<VisionGrid />`, `VisionGrid.tsx` was `export { default } from "./vision-grid"`). The lazy import in `lazy.tsx` now points at `@/components/sections/vision-grid` directly — Next.js resolves the folder via index.tsx with the same chunk shape as before. Three-hop "where is this rendered?" investigation reduced to one.

### C. Phantom file from a rename
`PipelineShowcase.tsx` was a 7-line wrapper rendering `<OrchestrationHub />`, kept alive after the "Pipelines → Orchestration" concept rename to avoid touching homepage imports. The component name was misleading the search ("two pipeline files?") even though there was only one implementation. Renamed `LazyPipelineShowcase` → `LazyOrchestrationHub` in `lazy.tsx` and `app/page.tsx`. The user-visible URL anchor (`wrapperId: "pipelines"`) is preserved — that's what users actually link to.

### D. Out-of-band metadata fix
The `MidPageCTA.tsx` finding was unique: the file genuinely never existed in personas-web. The breadcrumb came from a stale entry in the **Vibeman** context's `filePaths` array (project-side metadata in a different repo). Updated the Vibeman context via `PUT /api/contexts` to drop the phantom path. Recorded the resolution in `docs/harness/harness-learnings.md` so any future scan or onboarding dev sees the answer instead of re-flagging.

## Verification table

| Gate | Before Wave 1 | After Wave 1 | Delta |
|---|---:|---:|---:|
| TypeScript errors (`tsc --noEmit`) | 0 | 0 | 0 |
| ESLint problems (`eslint --quiet src/`) | 0 | 0 | 0 |
| `next build` exit | 0 | 0 | 0 |
| Source LOC (`src/`) | (baseline) | -1,016 | -1,016 |

## Cumulative status (across all waves so far)

| Wave | Theme | Closed |
|---|---|---:|
| 1 | Dead-code purge | 5 |

Pattern catalogue: 4 items (see below). Findings closed total: 5 / 43.

## Patterns established (additions to the catalogue, items 1–4)

1. **A/B variant graveyards** — When a multi-variant prototype is built (e.g. three competing Vision visualizations) and one wins, the losers must be deleted in the same PR that ships the winner. Otherwise they accumulate as orphan code that type-checks and lints but has zero consumers. Detection: a folder that nothing in `src/app/` or `src/components/sections/lazy.tsx` imports, plus a sibling that *does* get imported.

2. **Single-line re-export wrappers (the "passthrough shim")** — A file whose entire body is `export { default } from "./somewhere/else"` adds zero value once the original reason for indirection is gone. Fix: delete the wrapper, update the one or two consumers to import the canonical folder/file directly. Next.js handles `import("@/components/sections/foo")` → `foo/index.tsx` natively, so the shim was never load-bearing.

3. **Concept renames leave alias files behind** — When a feature is renamed (Pipelines → Orchestration), the safest-feeling change is to keep the old component name as an alias and update the implementation. But aliases are a permanent tax: every search hits two files, every "which one is canonical?" question replays. Fix: rename the component everywhere in the same commit, but preserve user-facing identifiers (URL anchors, analytics events, route names) separately if those need stability.

4. **Upstream metadata can be the source of "where is this file?" pain** — When a file referenced in docs/configs/scan-targets doesn't exist, the fix isn't always "create the file." Often it's "find the upstream metadata that was never updated when the file was deleted, and update it there." Personas-web's MidPageCTA case lived in the Vibeman context's `filePaths` array (a different repo's database) — the local fix was a `PUT /api/contexts` plus a breadcrumb in `harness-learnings.md`.

## What remains

| Wave | Theme | Approx count |
|---|---|---:|
| 2 | Kill wrapper pattern + consolidate lazy-loading | 4 |
| 3 | Brand theming unification | 4 |
| 4 | Extract visual primitives | 5 |
| 5 | Terminal primitives + guide-link contract | 4 |
| 6 | Index-coupled arrays (latent bugs) | 5 |
| 7 | Hook hygiene + state-machine reducer | 5 |
| 8 (optional) | Data-convention + leftover polish | 12 |

Note: Wave 2 will continue the deletion theme — it strips the 25 `sections/*.tsx` one-line wrapper files identified in finding W5/P4/C2. That sweep will likely delete another ~25 files but with much smaller LOC impact (each wrapper is 1 line). The Vision wrappers from Wave 1 (`Vision.tsx`, `VisionGrid.tsx`) were the same pattern; their early removal demonstrates that lazy.tsx-side import path changes are the only consumer-facing edit needed.
