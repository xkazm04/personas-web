# DX Fix Wave 2 — Wrapper sweep + lazy-loading consolidation

> 2 atomic commits, 4 findings closed.
> Baseline preserved: 0 TS errors / 0 lint → 0 TS errors / 0 lint. `next build` green.
> Net source diff: **25 files changed, 96 insertions, 120 deletions** (~24 LOC net, but **19 files deleted**).

## Commits

| # | Commit | Findings closed | Severity | Files |
|---|---|---|---|---|
| 1 | `e9246f3` refactor(sections): delete 19 PascalCase wrapper files | W5, P4, C2 | 3× Medium | 19 deleted, 5 modified |
| 2 | `374dcef` refactor(sections): consolidate lazy-loading on a single helper | C3 | High | 3 modified |

## What was fixed (grouped by sub-pattern)

### A. Kill the wrapper-vs-index pattern (W5 / P4 / C2)
Three findings from three different scan reports all pointed at the same problem: every section under `src/components/sections/` that lived in a kebab-case folder *also* had a PascalCase 1-line wrapper file (`Foo.tsx` → `export { default } from "./foo/index"`). The wrappers existed so consumers could write `import("@/components/sections/Foo")` instead of the lowercase folder path — but Next.js handles folder imports via `index.tsx` natively. The wrappers were superstition, not load-bearing infrastructure.

The audit identified 19 such wrappers. Five had no importers at all (`AgentPlayground`, `Features`, `PlatformCommand`, `PlaygroundTimeline`, `WhyAgents`) — pure scaffolding from an earlier convention that was never cleaned up. The other 14 had between 1 and 1 importer each, all of which were updated to point at the kebab-case folder directly:

- `lazy.tsx` — 5 sections
- `how-lazy.tsx` — 4 sections
- `app/connections/page.tsx` — 2 sections
- `app/compare/page.tsx` — 1 section
- `app/roadmap/page.tsx` — 2 sections

19 source files deleted in one sweep. Search/grep noise for "section X" now returns one hit instead of two; the kebab-case folder is the unambiguous source of truth.

### B. Consolidate lazy-loading on one helper (C3)
The codebase had three coexisting lazy-loading patterns:
1. `createLazySection()` from `LazySection.tsx` (forced `ssr: false`)
2. Inline `dynamic(...)` with `ssr: true` in `lazy.tsx` (Vision, Pricing, FAQ — sections that wanted SSR for SEO/first-paint)
3. Inline `dynamic(...)` with `ssr: false` in `how-lazy.tsx` (Agents*, PlatformLayers — heavy framer-motion / canvas)

…plus 13 trivial wrapper functions of the shape `function LazyVision() { return <VisionSection />; }` that added a layer between consumers and the dynamic component.

The fix:
- Extended `createLazySection(importFunc, Skeleton, options?: { ssr?: boolean })` so a single helper covers both ssr modes.
- Deleted every direct `dynamic(...)` call from `lazy.tsx` and `how-lazy.tsx`.
- Removed all 13 wrapper functions; `Lazy*` is now just `export const Lazy* = createLazySection(...)`. Consumers use `<LazyXxx />` in JSX or pass `LazyXxx` as a `Component` ref — both work identically because `dynamic(...)` returns a component.
- Added a documented SSR decision tree at the top of `LazySection.tsx` so the default (`ssr: true`) and the override criteria (browser-only APIs, heavy framer-motion below the fold) are spelled out where the helper is defined.

SSR behavior is preserved exactly: every section keeps its prior `ssr` setting.

## Verification table

| Gate | Before Wave 2 | After Wave 2 | Delta |
|---|---:|---:|---:|
| TypeScript errors (`tsc --noEmit`) | 0 | 0 | 0 |
| ESLint problems (`eslint --quiet src/`) | 0 | 0 | 0 |
| `next build` exit | 0 | 0 | 0 |
| Source files in `src/components/sections/` | (baseline) | -19 | -19 |

## Cumulative status (across all waves so far)

| Wave | Theme | Closed |
|---|---|---:|
| 1 | Dead-code purge | 5 |
| 2 | Wrapper sweep + lazy consolidation | 4 |

Pattern catalogue: 6 items (4 from Wave 1, 2 new). Findings closed total: **9 / 43**.

## Patterns established (additions to the catalogue, items 5–6)

5. **Folder-shape mismatch with import-shape** — When a feature is split into a folder for organization (e.g. `foo/index.tsx` + `foo/data.ts` + `foo/types.ts`), don't keep the old single-file path alive as a 1-line re-export wrapper. The wrapper has zero runtime value (Next.js, Vite, esbuild, and ts-node all resolve folder imports natively) and a real DX cost: every grep for "section X" returns two hits, every "where is the implementation?" question replays. If consumers depend on the old path, update them in the same PR that creates the folder; otherwise the wrapper accumulates as permanent overhead. **A second symptom of this anti-pattern is wrappers with no importers at all** — they're scaffolding from a transitional refactor that was never finished. Catch with `find . -name "*.tsx" -size -100c` to surface tiny files.

6. **Multiple "lazy-load this section" helpers compete instead of one helper with options** — When the codebase needs both SSR'd and non-SSR'd lazy sections (a real distinction; SSR matters for SEO/first-paint above the fold but blocks browser-only code below), the natural-but-wrong answer is to write two helpers (or three) and have callers pick. Better: one helper with an `{ ssr?: boolean }` option and a documented decision tree at the helper definition. Otherwise consumers either copy-paste the inline `dynamic(...)` boilerplate (because the helper feels too restrictive) or pick the wrong helper for their case. The decision tree turns the "which one do I use?" question into a 30-second read.

## What remains

| Wave | Theme | Approx count |
|---|---|---:|
| 3 | Brand theming unification | 4 |
| 4 | Extract visual primitives | 5 |
| 5 | Terminal primitives + guide-link contract | 4 |
| 6 | Index-coupled arrays (latent bugs) | 5 |
| 7 | Hook hygiene + state-machine reducer | 5 |
| 8 (optional) | Data-convention + leftover polish | 12 |
