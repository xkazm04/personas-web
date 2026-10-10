# Memory Layers
> "Growth rings": every run of an agent draws one ring from the centre out; rough at first, smooth once memories from earlier runs are recalled; the desktop's six memory kinds are pickable · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
Shows how Personas agents remember, under the heading **"Remembers what works"**
and the lede *"Your agents get better the more they work."* One disc is drawn ring
by ring over ten runs (a "Run N of 10" counter sits in the middle). The first rings
are rough, with a rose stumble wherever the agent went wrong. Every stumble, and
every fact, preference, instruction or piece of context the agent noted, leaves a round **memory mark** on
its ring. When a later ring passes that point, a recall line lights and the ring runs
smooth there, so by run 10 the rings are clean circles ("Rough start" on the first
ring, "Smooth by run 10" on the last). The improvement is the medium itself.

On the right, the six kinds of memory the desktop files things under (fact,
preference, instruction, context, learned, constraint) are buttons: picking one highlights its marks
on the rings (the others dim) and shows a real example sentence of that kind.
A small replay button replays the 9 s story.

## How it works
`memory-rings/index.tsx` (`MemoryLayers`) wraps everything in `MemoryShell`
(`shared/Frame.tsx`: `SectionWrapper(fit="fill", id="memory-layers")`, heading, lede)
and an `ArtBox` (`data-stage-slot` > `data-stage-art` with `--art-ar` = 1200/620,
`role="group"`, `data-tour-diagram="memory"`, an inline-size container). Children
are positioned in viewBox units with `frame(w, h)`'s `place()` (percent positions) and
`fs()` (`max(minPx, n * 100cqw / w)` font sizes), so the SVG layer and the HTML
text layer share one coordinate system.

**One progress value.** `usePlay(ref, DURATION=9, RUNS=10)` (`shared/motion.ts`) owns a
framer `MotionValue` `p` in 0..`RUNS`; integer part = which ring is being drawn.
It plays once when the art is 35% in view (`useInView`), `play()` replays from 0,
`seek()` glides to a point. `p` rests at `RUNS` (the finished picture) on the server
and under `useStillMotion`, where it also stops any running animation.

**Geometry** (`rings.ts`, viewBox 1200 x 620, computed once at module scope so server and
client draw identical SVG): ring `k` has radius `ringR(k)` plus a wobble whose amplitude
shrinks with `k` and is damped near every earlier `SEEDS` entry (`calm`), and `learned`/
`constraint` seeds (the two kinds a mistake leaves behind) ("stumbles", `isStumble`) add a sharp spike on their ring. `SEEDS` is the
fixed list of nine memories (kind, ring, angle). `STUMBLES` are the rose overlays;
`headAt`, `fracAt`, `crossXY` place the drawing head and recall-line ends.

`Disc.tsx` draws `RingPath`s (pathLength driven by `p`), `Stumble` overlays, `SeedMark`s
(born when their ring passes their angle; recall line `recallOf` lights when a later ring
head passes; dim/outline when its kind is selected), the moving `Head`, and the left
`CALLOUTS`. `Panel.tsx` is the legend + six `aria-pressed` buttons + an `aria-live`
example line; selection is `useState<CategoryKey | null>` in `index.tsx`.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/memory-rings/index.tsx` | Composition: counter, callouts, panel, replay, selection state |
| `memory-rings/rings.ts` | Geometry: `W/H/C/RUNS`, `ringR`, `SEEDS`, `RINGS` paths, `STUMBLES`, head/recall helpers |
| `memory-rings/Disc.tsx` | The animated SVG disc (rings, stumbles, seeds, head, `CALLOUTS`) |
| `memory-rings/Panel.tsx` | Six memory-kind buttons + example text (`PANEL_X`) |
| `memory-rings/shared/categories.tsx` | `CategoryKey` (= `MemoryCategory`), `MEMORY_KINDS`/`CATEGORY_KEYS`, brand colour per kind, drawn `CategoryGlyph`s; records `satisfies Record<CategoryKey, ...>` |
| `src/lib/product-facts/index.ts` | `MEMORY_CATEGORIES`/`MemoryCategory` (and `CELL_KEYS`), typed from the desktop snapshot |
| `src/lib/product-facts/desktop-facts.json` | Generated snapshot of the desktop's enumerations (`npm run sync:desktop-facts`; never hand-edit) |
| `scripts/sync-desktop-facts.mjs` | Reads `../personas` (or `PERSONAS_DESKTOP_REPO`), writes the snapshot; `-- --check` diffs, exit 1 on drift, skips (exit 0) without a checkout |
| `memory-rings/rings.test.ts`, `src/lib/product-facts/desktopFacts.test.ts` | Pin kinds, seeds, stumbles and parsers/diff to the snapshot |
| `memory-rings/shared/Frame.tsx` | `MemoryShell`, `ArtBox`, `frame()`, `ReplayButton`, `StylisedTag` |
| `memory-rings/shared/motion.ts` | `usePlay`, `beat`, `clamp01`, easings |
| `src/components/feature-sections/feature-lazy.tsx` | `LazyMemoryLayers` imports the folder (`:11-15`) |

## Data & state
- **Source:** static. Words: `memorySection.heading|headingGradient|lede|replay` (older
  namespace, reused) and `featuresSections.memory` (`stylised`, `categories.*`,
  `v3.artLabel|run|ofRuns|rough|smooth|legend|show|hint|examples.*`) in `src/i18n/en.ts`.
  No fetch, orchestrator or Supabase.
- **State:** the `p` MotionValue + a ref to the running animation (`usePlay`), and the
  selected category in `index.tsx`. No Zustand.
- **Categories** are the desktop's `MEMORY_CATEGORIES`
  (`personas:src-tauri/core/src/validation/memory.rs`), snapshotted by
  `scripts/sync-desktop-facts.mjs` into `src/lib/product-facts/desktop-facts.json`.
  `categories.tsx` records `satisfies Record<CategoryKey, ...>` (the desktop's own totality
  gate, `formatters.ts`), so a new desktop category fails `tsc` until it has a colour, glyph
  and example. Colours follow the desktop's category hues. Run
  `npm run sync:desktop-facts -- --check` on a machine with the desktop checkout to see drift.
- **Known gap (other context):** the guide's "Memory Categories" topic
  (`src/data/guide/content/memories.ts`) still teaches the old invented five kinds.

## Integration points
- `LazyMemoryLayers` (`ssr: false`) in `<StageSection id="memory-layers">` +
  `<LazyMount stage minHeight={760} label="Memory">` (`src/app/features/page.tsx:72-76`);
  scroll-map `MEMORY` -> `#memory-layers` (`page.tsx:45`).
- Guided tour step `id: "memory"` (`src/lib/tour-script.ts:237`) scrolls to
  `#memory-layers` and spotlights `[data-tour-diagram="memory"]` (the `ArtBox`).
- Conceptually mirrors the dashboard Knowledge Base (live agent memory).

## Conventions & gotchas
- **Replaced 2026-10-06** by the winner of the /features review. The previous
  implementation (`MemoryLayers.tsx` and `memory-layers/` "run twice" art with
  `RunTwiceArt`) is in git history.
- **i18n - English-only for now.** `memorySection` and `featuresSections` are both in
  `src/i18n/pending/` (PLAN M22); the other 13 locales fall back to English. Unread leftovers:
  `memorySection.artLabel|run1|run12|memory` and `featuresSections.memory.v1|v2`.
- **Motion gating.** `useStillMotion` -> `p` pinned to `RUNS` (finished rings), replay
  disabled. Markup never depends on the preference, so SSR and hydration agree. The
  animation is one-shot, not an ambient loop, so no visibility gate. Clicking a kind
  does not move `p`.
- **Hydration determinism.** Float output is rounded (`r2` in `Disc.tsx`, `toFixed(1)` in
  `rings.ts`) so server and browser agree; keep that if you add computed attributes.
- **Colour.** Rings and marks use `BRAND_VAR`/`tint()` and `var(--foreground)`; the button
  idle border uses the `--color-glass` var. `bg-background/70` on the replay button is
  the only translucent surface.
- **Accessibility.** The art box is `role="group"` with `aria-label={v3.artLabel}`; the
  six buttons carry `aria-pressed` and `aria-label` ("Show {category}"); the example
  line is `aria-live="polite"`. The "Stylised" tag marks the art as not a screenshot.
- **Duplicate anchor id.** `id="memory-layers"` is on both the page's `StageSection` and
  `MemoryShell`'s `SectionWrapper`.

## Related docs
- [Multi-Provider AI](multi-provider-ai.md)
- [Knowledge Base (dashboard)](../dashboard/knowledge.md)
- [Feature index](../INDEX.md)
