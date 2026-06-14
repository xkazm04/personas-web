# Memory Layers
> Geological memory-layer stack that animates agent learning as importance-ranked pills settling into category strata · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
Shows how Personas agents remember. A glassy "cortical-layers-view" panel renders four stacked geological layers — **Learning**, **Preference**, **Technical**, **Constraint** — each holding memory pills (e.g. *"Deploy window: Tue–Thu 10am–4pm only"*). Pills carry a source (`Exec #847`), an importance score (1–10) shown as a vertical fill bar, and rank highest-importance-first inside their layer. A left-hand depth scale (10 → 2, "Importance"/"depth") and a bottom legend frame the stack. Roughly every 5.5–8s a new memory drops in with a sparkle badge and glow, the layer prunes to its 3 most-recent entries per category, and the header memory count updates — visually telling the marketing story that agents "get smarter the more they work."

## How it works
`MemoryLayers` is the section wrapper: heading, blurb, the diagram, and four capability pills, all under a `SectionWrapper` with `whileInView` stagger. It renders `MemoryLayersStack`, which is just a re-export of `memory-layers-stack/index.tsx`. The stack calls `useMemoryFeed()` (in `memoryShared.tsx`) for live state, groups memories by `CATEGORIES`, and lays out a header (Layers/Brain/Search icons + live count), a `DepthScale` rail, a `LayoutGroup`-wrapped column of four `GeologicalLayer`s, and a `StackLegend`.

`useMemoryFeed` seeds 5 `initialMemories`, then on an interval (`5500 + Math.random()*2500` ms) pulls the next template from a 5-item `newMemoryPool` (round-robin via `poolIdxRef`), assigns a fresh id and `Date.now()` timestamp, appends it, then rebuilds the list keeping only the **3 most-recent per category**. The new id is set as `freshId` for 1800ms (a `setTimeout` clears it). Each `GeologicalLayer` insets/dims by depth index, sorts its pills by importance desc, and animates pill enter/exit/reorder via `AnimatePresence mode="popLayout"` + per-pill `layoutId`. `MemoryPill` paints category color into border/background/shadow, draws the importance fill bar, and shows a `Sparkles` badge while `isFresh`.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/MemoryLayers.tsx` | Section shell: heading, blurb, capability pills, `data-tour-diagram="memory"` wrapper |
| `src/components/feature-sections/MemoryLayersStack.tsx` | One-line re-export of `./memory-layers-stack/index` |
| `src/components/feature-sections/memoryShared.tsx` | Types, `CATEGORIES`/`CATEGORY_META`, seed + pool data, `useMemoryFeed()` hook |
| `src/components/feature-sections/memory-layers-stack/index.tsx` | Stack container: header, grouping, `DepthScale` + `LayoutGroup` + `StackLegend` layout |
| `.../memory-layers-stack/components/DepthScale.tsx` | Left importance/depth axis (10→2), md+ only |
| `.../memory-layers-stack/components/GeologicalLayer.tsx` | One category stratum; depth inset/opacity, pill sort + `AnimatePresence` |
| `.../memory-layers-stack/components/MemoryPill.tsx` | Single memory chip: importance bar, source, imp score, fresh sparkle badge |
| `.../memory-layers-stack/components/StackLegend.tsx` | Bottom category color legend |

## Data & state
- **Source:** fully self-contained mock — `initialMemories` (5) + `newMemoryPool` (5 templates) hardcoded in `memoryShared.tsx:55`/`63`. No fetch, no orchestrator, no Supabase. **Stores:** none global; local `useState` in `useMemoryFeed` (`memories`, `freshId`) plus `nextIdRef`/`poolIdxRef`. **API routes:** none. **Types:** `Memory`, `Category`, `CATEGORIES`, `CATEGORY_META` exported from `memoryShared.tsx:8`–`51`.

## Integration points
- **`/features` page:** mounted via `LazyMemoryLayers` (`feature-lazy.tsx:11`, `createLazySection(..., { ssr: false })`) inside `<StageSection id="memory-layers">` + `<LazyMount minHeight={760}>` (`src/app/features/page.tsx:46`). Scroll-map anchor `#memory-layers` ("MEMORY", `page.tsx:21`).
- **Guided tour:** step `id: "memory"` in `src/lib/tour-script.ts:253` spotlights `[data-tour-diagram="memory"]` (set in `MemoryLayers.tsx:45`) and scrolls to `#memory-layers`.
- **`/todo` page:** also imports `MemoryLayers` directly (`src/app/todo/page.tsx:4`).
- Conceptually mirrors the dashboard Knowledge Base surface (live agent memory) — see related docs.

## Conventions & gotchas
- **i18n — NOT followed. All copy is hardcoded English**, violating the repo's "every user-facing string lives in `en.ts`" rule. Hardcoded strings include the heading "Remembers what works" / blurb (`MemoryLayers.tsx:28`,`36`), the 4 capability pills (`MemoryLayers.tsx:60`), header labels `cortical-layers-view`/`memories`/`instant recall` (`index.tsx:31`,`38`,`42`), `DepthScale` "Importance"/"depth", `GeologicalLayer` "… layer" / "memory"/"memories" / "no memories in this layer yet", and `CATEGORY_META.label` + all seed/pool memory titles/sources. None route through `useTranslation()`.
- **React 19 purity caveat:** `const NOW = Date.now()` at module scope (`memoryShared.tsx:53`) and `Math.random()` in the interval delay (`:106`) — both are outside render (module init / effect body), so they don't trip the in-render impurity rule, but seed timestamps are import-time, not render-time.
- **Animation gating — OK.** `useMemoryFeed` short-circuits its interval when `useReducedMotion()` is true (`memoryShared.tsx:104`); `GeologicalLayer` swaps its pulsing dot to a static state under reduced motion (`:51`). The custom lint rule is satisfied (no raw `requestAnimationFrame`; framer-motion drives all motion).
- **Tailwind tokens:** mostly semantic (`text-foreground`, `border-foreground/10`, `bg-background`), but category colors are **raw hex** in `CATEGORY_META` (`#06b6d4`, `#a855f7`, `#fbbf24`, `#f43f5e`) consumed via inline `style`, and the stack uses a `force-dark` wrapper + raw `rgba()`/`white/[0.0x]` gradients (`index.tsx:26`,`63`). Several `text-foreground/60` usages sit at the WCAG-AA lint threshold (allowed, not below).
- **SSR:** the section is `ssr: false` lazy-loaded, so the live feed never runs on the server (avoids hydration mismatch from time-based state).
- **Pruning is per-category, not global:** the header count caps at 12 (4 categories × 3 kept), and the oldest memory in a category silently exits when a 4th arrives.

## Related docs
- [Multi-Provider AI](multi-provider-ai.md)
- [Knowledge Base (dashboard)](../dashboard/knowledge.md)
- [Feature index](../INDEX.md)
