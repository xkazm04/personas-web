# Memory Layers
> "Run twice" illustration: the same task run twice — run 1 wanders and fails, run 12 goes straight to the goal because the failures were kept as memory · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
Shows how Personas agents remember. Under the heading **"Remembers what works"** and the one-line lede *"Your agents get better the more they work."*, a single SVG illustration draws two tracks from the same start to the same goal. **Run 1** (top, dim) wanders along a curvy path with two retry loops; a red cross marks each failure. Each failure then drops a coloured **memory chip** (amber, purple) down a dashed tether onto **Run 12**'s track (bottom, cyan→emerald), and run 12 draws straight and fast to the goal, lighting each chip as it passes; a ring pulses at its flag. A small replay button in the corner re-plays the 2.8s animation — telling the marketing story that agents "get smarter the more they work."

## How it works
`MemoryLayers.tsx` (default export `MemoryLayersRunTwice`, an `/illustrate` 1.1.0 "run-twice" variant) is a `SectionWrapper(fit="fill", id="memory-layers")` with a hand-rolled intro (`data-section-intro` / `data-section-lede`, so it takes the stage gap) and a `data-stage-slot` holding `RunTwiceArt`.

`RunTwiceArt` drives every beat from one framer `MotionValue` `p` (0..1) animated linearly over `DURATION = 2.8`s (`RunTwiceArt.tsx:43`):
- **A 0.00–0.50** run 1 draws piece by piece (`Run1Piece` opacity per sampled chunk); red `FailCross`es appear at the loop apexes.
- **B 0.50–0.64** each cross releases a `MemoryChip` that drops to run 12's track.
- **C 0.64–0.88** run 12's gradient line grows via `scaleX`; chips light as the traveller passes.
- **D 0.88–1.00** the goal ring scales/fades in.

`p` starts at `1` (the finished comparison), so the server render and reduced motion show the end state. `useInView(rootRef, { once: true, amount: 0.4 })` triggers `play()` (reset `p` to 0, `animate` to 1) once; the replay button calls `play()` again. Geometry (viewBox 1000×420, the cubic run-1 path sampled into chunks, failure points, lane y's) is computed once at module scope in `runTwiceGeometry.ts`, so server and client draw identical SVG with no DOM measurement. Only three words sit in the picture (`Run 1`, `Run 12`, `Memory`), positioned as HTML spans by viewBox percentages.

**Stage fit (desktop).** The art root carries `data-stage-art` with `--art-ar: VIEW_W / VIEW_H` (`RunTwiceArt.tsx:85-89`), so on the stage (`src/styles/stage.css`) it is `min(100%, slot height × 1000/420)` wide — as wide as the stage allows, never taller than the screen, and growing on a monitor.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/MemoryLayers.tsx` | Section shell: heading, lede, stage slot around the art |
| `src/components/feature-sections/memory-layers/RunTwiceArt.tsx` | The illustration: progress value, in-view play, replay button, SVG + labels; `data-tour-diagram="memory"` |
| `src/components/feature-sections/memory-layers/runTwiceParts.tsx` | Beat helpers (`beat`, `r1Of`, `r2Of`, `easeOut`) and animated marks: `Run1Piece`, `FailCross`, `MemoryChip`, `Flag`; chip colours `CHIPS` |
| `src/components/feature-sections/memory-layers/runTwiceGeometry.ts` | Module-scope geometry: `VIEW_W/H`, `START_X`/`GOAL_X`, `TOP_Y`/`BOTTOM_Y`/`MEM_Y`, run-1 segments + sampling (`RUN1_CHUNKS`, `run1At`), `FAILS`/`FAIL_AT` |

## Data & state
- **Source:** fully static — geometry constants in `runTwiceGeometry.ts`; copy in the `memorySection` namespace of `src/i18n/en.ts` (heading, lede, `artLabel`, `run1`, `run12`, `memory`, `replay`). No fetch, no orchestrator, no Supabase. **Stores:** none; one framer `MotionValue` plus a ref to the running animation's controls. **API routes:** none.

## Integration points
- **`/features` page:** mounted via `LazyMemoryLayers` (`feature-lazy.tsx:11`, `createLazySection(..., { ssr: false })`) inside `<StageSection id="memory-layers">` + `<LazyMount minHeight={760}>` (`src/app/features/page.tsx:66-69`). Scroll-map anchor `#memory-layers` ("MEMORY", `page.tsx:43`).
- **Guided tour:** step `id: "memory"` in `src/lib/tour-script.ts:254` spotlights `[data-tour-diagram="memory"]` (set on the art root, `RunTwiceArt.tsx:84`) and scrolls to `#memory-layers`.
- Conceptually mirrors the dashboard Knowledge Base surface (live agent memory) — see related docs.

## Conventions & gotchas
- **i18n — migrated, English-only for now.** All copy lives in `t.memorySection` (read via `useTranslation()` in both `MemoryLayers.tsx` and `RunTwiceArt.tsx`). `memorySection` is listed in `PENDING_TRANSLATION` in `en.ts`, so the 13 other locales fall back to English until it is translated.
- **Animation gating — followed.** The gate is `useStillMotion` (`RunTwiceArt.tsx:47`): when still, the effect stops any running animation and pins `p` to 1, and the replay button is `disabled`. DOM shape is identical either way (only `p` differs), so there is no hydration mismatch. The animation is one-shot, not an ambient loop, so no visibility gate is needed.
- **Tailwind tokens:** SVG colours come from `BRAND_VAR` / `tint()` (`@/lib/brand-theme`) and `currentColor` + `text-foreground`; the frame uses `border-glass`. `bg-white/[0.02]` on the frame and replay button is a raw-colour exception.
- **SSR:** the section is `ssr: false` lazy-loaded; even so, the art is written to render its end state without client state.
- **Accessibility:** the art root is `role="img"` with `aria-label={copy.artLabel}`; the SVG itself is `aria-hidden`.

## Related docs
- [Multi-Provider AI](multi-provider-ai.md)
- [Knowledge Base (dashboard)](../dashboard/knowledge.md)
- [Feature index](../INDEX.md)
