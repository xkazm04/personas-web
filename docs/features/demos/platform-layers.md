# Platform Layers
> Scroll-driven architecture explainer that spreads the platform into a 4-layer stack joined by animated connection pillars · **Route:** `/how` (rendered as the third stage section, anchor `#platform-layers`) · **Status:** Live

## What it does
Presents the Personas platform as a vertical stack of four architecture layers — Infrastructure (Deploy), Execution (Coordinate), Intelligence (Design), and Observability (Monitor). On page load the cards sit compressed near the bottom; as the user scrolls the section into view the stack "spreads" apart, dashed connection pillars grow between adjacent cards with a traveling pulse, and per-layer labels fade in on the left. Each card shows the pillar name, an uppercase technical label, a one-line plain-English description, a brand icon, and a small per-layer code/visual snippet. Hovering a card lifts it, scales it slightly, and adds a brand-colored glow plus a highlight border.

## How it works
- The section (`index.tsx:13`) wires a `useScroll` tracker to a `containerRef` with `offset: ["start end", "center center"]`, so progress runs 0→1 from when the container enters the viewport to when it is centered (`index.tsx:18`).
- Raw progress is smoothed through `useSpring` (`stiffness: 80, damping: 20`) into a `spread` MotionValue that every child consumes (`index.tsx:23`).
- `spreadValues` precomputes each layer's expanded offset as `i * 120` (`index.tsx:26`). The container reserves a fixed height of `layers.length * 120 + 140` px (`index.tsx:55`).
- `Layer` (`Layer.tsx:34`) interpolates each card's `top` from a compressed offset (`index * 18`) to its expanded offset via `compressedOffset + (expanded - compressed) * s`, then flips it to a top coordinate with `stackHeight - pos - 80`. So at `spread=0` the cards overlap tightly; at `spread=1` they fan out 120 px apart.
- `LayerConnection` (`LayerConnection.tsx:9`) renders between each adjacent pair (`layers.slice(0, -1)` in `index.tsx:58`). Its `top` slides up as spread grows, its `height` grows from 0 to `120 * 0.8`, and its `opacity` ramps 0→0.8 across spread `[0.2, 0.6]`. It wraps a `ConnectionPillar`.
- `ConnectionPillar` (`ConnectionPillar.tsx:6`) is the visual pillar: a 1px-wide dashed gradient column (masked with a repeating-linear-gradient) blending `from`→`to` brand colors, plus a `motion.div` dot that loops `top: 0%→100%` every 2 s (`repeat: Infinity`) to suggest data flowing down the connection.
- `StackLabels` (`StackLabels.tsx:9`) shows the reversed list of layer `label`s on the left (lg+ only), fading in as a group across spread `[0.3, 0.7]`, with each label additionally driven by its own `whileInView` stagger.
- Hover state is a single `hoveredIndex` in the parent (`index.tsx:16`); each `Layer` gets `isHovered` and `onHover`/`onLeave`. Hover applies `y: -12`, `scale: 1.03`, and a `brandShadow` glow via a spring `animate` (`Layer.tsx:39`), plus an `AnimatePresence` border overlay (`Layer.tsx:107`).
- Per-layer right-side artwork is looked up by `layer.id` in `LAYER_VISUALS_BY_ID` (`visuals.tsx:77`) — kept in a separate `.tsx` so `data.ts` stays JSX-free.

## Key files
| File | Role |
| --- | --- |
| `src/components/sections/platform-layers/index.tsx` | Section entry; sets up scroll→spread spring, renders `StackLabels`, connections, and layer cards |
| `src/components/sections/platform-layers/data.ts` | The four `layers` (id, label, pillar, icon, brand, description) |
| `src/components/sections/platform-layers/types.ts` | `Layer` interface; `brand` is the single color source (`BrandKey`) |
| `src/components/sections/platform-layers/visuals.tsx` | `LAYER_VISUALS_BY_ID` — per-layer snippet artwork keyed by `id` |
| `src/components/sections/platform-layers/components/Layer.tsx` | A single card: scroll-driven `top`, 3D tilt, hover lift/glow, icon + text + visual |
| `src/components/sections/platform-layers/components/LayerConnection.tsx` | Positions/sizes a pillar between two adjacent layers from `spread` |
| `src/components/sections/platform-layers/components/ConnectionPillar.tsx` | The dashed gradient pillar + looping flow dot |
| `src/components/sections/platform-layers/components/StackLabels.tsx` | Left-rail layer labels (lg+), fade-in on spread |
| `src/components/sections/how-lazy.tsx` (`:61`) | `LazyPlatformLayers` — `dynamic` import, `ssr: false`, skeleton fallback |
| `src/app/how/page.tsx` (`:61`) | Renders `<LazyPlatformLayers/>` inside a `StageSection` |

## Data & state
- **Source:** Static `layers` array in `data.ts` (4 entries, hardcoded; not from an API). Icons are `lucide-react` (`Wand2, Zap, Cloud, Activity`).
- **Stores:** None (no Zustand). Only local component state: `hoveredIndex` (`useState`) and motion state via `useRef` + `useScroll`/`useSpring`/`useTransform`.
- **API routes:** None — fully static demo section, no fetch/orchestrator calls.
- **Types:** `Layer` (`types.ts:4`); `brand: BrandKey` from `@/lib/brand-theme`. Color derivations use `BRAND_VAR`, `tint`, `brandShadow` from the same module.

## Integration points
- **Render host:** `/how` page → `InfoPageLayout` → `StageSection glow="purple" fromColor="emerald" toColor="purple"` → `LazyPlatformLayers` (`how/page.tsx:60`). The `#platform-layers` anchor is set by `SectionWrapper id="platform-layers"` (`index.tsx:32`) and is targeted by the page's scroll-map item `PLATFORM: LAYERS` (`how/page.tsx:20`).
- **Lazy loading:** Imported via `createLazySection(() => import(...), SectionSkeleton, { ssr: false })` (`how-lazy.tsx:61`) — client-only, below the fold, with a skeleton placeholder.
- **Shared primitives:** `SectionWrapper` (with `dotGrid`), `SectionIntro` (eyebrow/heading/description), `fadeUp` from `@/lib/animations`.
- **Brand theme:** All colors flow from each layer's `brand` key through `brand-theme` helpers, so light/dark themes stay correct without per-layer overrides.

## Conventions & gotchas
- **Reduced-motion gating is partial.** `index.tsx:15` reads `useReducedMotion()` and threads `prefersReducedMotion` into `Layer`, where it only zeroes the static `rotateX` 3D tilt (`Layer.tsx:68`). The scroll-driven spread spring, `StackLabels` stagger, and especially `ConnectionPillar`'s infinite looping flow dot (`ConnectionPillar.tsx:37`, a perpetual `repeat: Infinity` animation) are **not** gated — they run regardless of the user's reduced-motion preference. `ConnectionPillar.tsx` uses framer-motion but never imports `useReducedMotion`; this is the kind of perpetual motion the project's `custom-animation/require-animation-gating` rule targets, so flag it if you touch this file.
- **No `requestAnimationFrame`** is used directly (all motion is framer-motion driven), so the lint rule that keys on raw `rAF` won't fire here even though the looping dot arguably should be gated.
- **Magic-number coupling.** The `120` px per-layer gap is duplicated across `index.tsx` (`maxSpread`/height math, lines 27, 55, 81), `Layer.tsx` (offsets), and `LayerConnection.tsx:20` (`gap = 120`). Changing layer spacing means editing all three; there is no shared constant.
- **`progress={1}` is hardcoded** when `LayerConnection` renders `ConnectionPillar` (`LayerConnection.tsx:33`), so the pillar's internal `opacity`/alpha ramp (`ConnectionPillar.tsx:15`) is effectively always full — the visible reveal comes entirely from the parent's `opacity`/`height` transforms. The pillar's own progress prop is dead weight as wired today.
- **No i18n.** All user-facing copy (eyebrow, heading, descriptions, layer labels/pillars) is hardcoded English in `index.tsx` and `data.ts` — it does **not** go through `useTranslation()`/`en.ts`. This is a real violation of the repo's i18n convention (every user-facing string in `src/i18n/en.ts`). The whole `/how` demo stack appears to share this gap, but it is a gotcha worth noting before extending the section.
- **Low text-opacity usage.** `StackLabels.tsx:27` uses `opacity-60` on label text and `visuals.tsx` uses several `/60` color modifiers — these sit right at the WCAG-AA threshold the `custom-a11y/no-low-text-opacity` rule warns below; anything lower would lint-warn.
- **`brand: "amber"`** for the Monitor layer maps through `BRAND_VAR` to `--brand-amber`; the visuals file hardcodes raw `amber-*`/`cyan-*`/`emerald-*`/`purple-*` Tailwind classes rather than semantic tokens, so the snippet artwork is not theme-token-driven the way the cards are.

## Related docs
- [Platform Command](platform-command.md)
- [Orchestration Hub](orchestration-hub.md)
- [Feature index](../INDEX.md)
