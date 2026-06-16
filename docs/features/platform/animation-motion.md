# Animation & Motion System
> Ambient motion components and the hooks/contexts that gate GPU-intensive motion behind reduced-motion, adaptive quality tiers, and page/section visibility · **Route:** n/a (shared lib) · **Status:** Live

## What it does
Drives all the "alive" feeling on the marketing site — drifting particles, pulsing orbs, parallax accents, a contour-line topo backdrop, and the typewriter hero in the cinematic breather — while staying cheap and accessible. Motion is automatically dialed down or removed for three reasons: the visitor prefers reduced motion, their device can't keep 60 fps, or the animated thing is off-screen or in a backgrounded tab. The net effect is rich motion for capable users on capable hardware, and a calm, battery-friendly page for everyone else, with no per-component decisions left to chance.

## How it works
Three layers cooperate:

1. **Quality tiering (`QualityContext`).** A provider at the app root samples frame times (`requestAnimationFrame` deltas) in ~2 s windows, computes the p90, and moves a global `tier` between `high | medium | low`: downgrade is immediate when p90 > 20 ms, upgrade needs 3 consecutive windows under 17 ms (anti-oscillation), and measurement self-settles after 15 s to stop burning CPU once stable (`QualityContext.tsx:20-147`). It also tracks `reducedMotion` and `canHover` via `matchMedia`. Components read `useQualityTier()` and scale particle/accent counts (e.g. high 30 / medium 15 / low 0 particles).

2. **Visibility pausing.** Two independent mechanisms keep motion from running when nobody sees it:
   - **Page (tab) level:** `usePageVisibility` toggles `.page-hidden` on `<html>` on `visibilitychange` so CSS keyframes can `animation-play-state: paused` globally; the canvas loops also check `document.hidden` directly and stop the rAF (`particleHostRegistry.ts:57`, `useCanvasCompositor.ts:49`).
   - **Section/element level:** `useAnimationPause` runs one IntersectionObserver that toggles `.animations-paused` on `[data-animate-when-visible]` elements (with a one-viewport `rootMargin`); `useSectionPause` exposes a `paused` boolean merging reduced-motion + in-view + tab-hidden + a manual toggle for framer-driven loops.

3. **Shared canvas compositors.** Rather than one rAF per particle component, all canvases register with a singleton loop. There are **two** such singletons: `useCanvasCompositor` (per-canvas, used by `CinematicBreather`) and the `particleHostRegistry` (one full-viewport fixed canvas with multiple "layers" keyed to host elements, used by `FloatingParticles`). Both run a single rAF, a single IntersectionObserver, and a single ResizeObserver shared across registrants, and both halt the loop entirely when nothing is in view or the tab is hidden.

CSS-only / cheap components (`AmbientOrbs`, `ParallaxAccents`, `TopoBackground`) skip the compositor: they render gated DOM/SVG with CSS `--parallax-offset` scroll-driven transforms and simply return `null` when reduced-motion is on or the tier is too low.

## Key files
| File | Role |
| --- | --- |
| `src/contexts/QualityContext.tsx` | Adaptive `high/medium/low` tier from p90 frame time; `reducedMotion`; `useQualityTier` / `useReducedMotionPreference` |
| `src/contexts/SectionObserverContext.tsx` | Shared IntersectionObserver scroll-spy; `activeSectionId`, `observe/unobserve`, MutationObserver sweep for lazy sections |
| `src/hooks/usePageVisibility.ts` | `useSyncExternalStore` tab-visibility; toggles `.page-hidden` on `<html>`; globalThis-keyed singleton listener |
| `src/hooks/useAnimationPause.ts` | IntersectionObserver toggling `.animations-paused` on `[data-animate-when-visible]` + a register hook for lazy components |
| `src/hooks/useSectionPause.ts` | Merges reduced-motion + in-view + tab-hidden + manual toggle into one `paused` flag for framer loops |
| `src/hooks/useCanvasCompositor.ts` | Singleton per-canvas rAF/IO/RO compositor; gates on `useReducedMotion` + `enabled` |
| `src/components/particle-host/particleHostRegistry.ts` | Singleton full-viewport canvas with per-host "layers"; rAF/IO/RO; lint rule disabled at top (gated by wrapper) |
| `src/components/ParticleHost.tsx` | React wrapper that mounts the registry canvas + `useParticleLayer` hook |
| `src/components/AnimationPauseObserver.tsx` | Null-render glue: calls `useAnimationPause` + `usePageVisibility`; dev-warns if zero `[data-animate-when-visible]` |
| `src/components/FloatingParticles.tsx` | Rising particle field via `useParticleLayer`; tier-scaled count; precomputed fillStyles |
| `src/components/CinematicBreather.tsx` | Typewriter hero + ambient particle field via `useCanvasCompositor` |
| `src/components/AmbientOrbs.tsx` | Fixed blur-gradient orbs (CSS `orb-pulse`); dropped on low tier |
| `src/components/ParallaxAccents.tsx` | Scattered SVG ring/cross/diamond/dot shapes, CSS parallax; tier-scaled |
| `src/components/TopoBackground.tsx` | Contour-line backdrop via layered radial-gradients + CSS parallax |
| `src/components/ScrollMap.tsx` | Fixed side nav dots reading `useActiveSectionId` |
| `src/components/LazyMount.tsx` | Viewport-gate that reserves height and mounts children once near-visible (mount-once) |
| `src/hooks/useActiveSection.ts` | Label of the active section, from `SectionObserverContext` |
| `src/hooks/useIsVisible.ts` | tab-foregrounded AND element-in-view, for gating SWR polling |
| `src/hooks/useAutoCycle.ts` | Interval-driven active index; pauses on reduced-motion / external flag; `pauseFor` for touch |
| `src/hooks/useAnimatedNumber.ts`, `src/hooks/useTweenedNumber.ts` | rAF eased number tweens; snap to target on reduced-motion |
| `src/hooks/useIsMobile.ts`, `src/hooks/useMaxScrollHeight.ts` | `matchMedia` mobile flag; ResizeObserver max-height measurement |
| `src/lib/animations.ts` | Framer `Variants` library, transition presets, ease curve, stagger helpers, and the gating contract comment |

## Data & state
- **Source:** Pure client-side runtime signals — `prefers-reduced-motion` / `hover` media queries, `requestAnimationFrame` frame timing, `document.hidden`, and IntersectionObserver/ResizeObserver readings. No backend, no mock data.
- **Stores:** No Zustand. State lives in React contexts (`QualityContext`, `SectionObserverContext`, `SectionPauseContext`) plus module-level singletons (the two compositors, the `usePageVisibility` listener registry, the `useAnimationPause` registry).
- **API routes:** None.
- **Types:** `QualityTier` (`QualityContext.tsx:6`); `HostRect`, `ParticleLayerRender/Update/Resize` (`particleHostRegistry.ts:3-22`, re-exported from `ParticleHost.tsx`); `LayerRenderFn`/`LayerResizeFn` (`useCanvasCompositor.ts:10-18`); `Variants` presets (`animations.ts`).

## Integration points
- **`QualityProvider`** wraps the whole app in `src/app/layout.tsx:124`; every tier-aware component depends on it (defaults to `high` if absent).
- **`PageShell`** (`src/components/PageShell.tsx`) mounts `SectionObserverProvider`, `AnimationPauseObserver`, `ParticleHost`, and `ScrollMap` for landing pages — this is where the section-visibility and shared-canvas infrastructure comes online.
- **`CinematicBreather`** is used on the `/how` page (`src/app/how/page.tsx:64`). `AmbientOrbs`, `ParallaxAccents`, and `TopoBackground` are ready-to-drop shared background layers (not currently mounted in PageShell — wire them in where a page wants the ambient backdrop).
- **`useParticleLayer`** (from `ParticleHost`) is the public API for any component that wants to draw onto the shared full-viewport canvas; `useCanvasCompositor` is for components that own their own `<canvas>`.
- **`useIsVisible`** gates SWR `refreshInterval` in dashboard charts; `useActiveSection`/`ScrollMap` drive nav highlighting.

## Conventions & gotchas
- **Gating is mandatory** for any rAF/canvas/GPU-intensive component: call `useReducedMotion()` (framer) or `useReducedMotionPreference()` (QualityContext) and `return null` when set, plus `useQualityTier()` to scale complexity. The contract is spelled out in `animations.ts:3-37`.
- **The `custom-animation/require-animation-gating` lint rule has a blind spot.** It only fires when a file textually uses `requestAnimationFrame`/`cancelAnimationFrame` without importing `useReducedMotion`. It does **not** catch framer-only motion (`motion.*`, `animate`, `repeat: Infinity`) or CSS-keyframe components — those can ship an ungated infinite loop and pass lint. Gate them manually via `useSectionPaused`/`useReducedMotion`. Also note `particleHostRegistry.ts:1` disables the rule with a file-level comment because its React wrapper does the gating; if you add a new entry point that doesn't go through `ParticleHost`, that exemption no longer holds.
- **Observer/timer leaks to watch:**
  - `usePageVisibility` registers a `visibilitychange` listener at **module load** keyed on a `globalThis` symbol and never removes it in production (only `__teardownPageVisibilityForTests` does). Intentional process-lifetime singleton — don't "fix" it by adding cleanup.
  - `ParticleHost` warns but **does not render a second canvas** if mounted more than once (`particleHostRegistry.ts:148-160`); mount it exactly once near the page root or later layers register against a missing canvas.
  - `SectionObserverContext` runs a `MutationObserver` on `document.body { subtree: true }` to catch lazy-hydrated sections, with a 30 s hard-cap timeout so an ID that never appears can't keep it firing on every DOM mutation forever (`SectionObserverContext.tsx:142-168`). Keep `sectionIds` accurate.
  - `useAnimationPause` defers observer setup with `setTimeout(setup, 0)` **specifically to avoid corrupting React hydration** — moving it synchronous re-introduces the "tree hydrated but attributes didn't match" warning (`useAnimationPause.ts:90-98`).
  - `useMaxScrollHeight` defers ResizeObserver `setState` through `setTimeout(0)` to break the "ResizeObserver loop completed with undelivered notifications" feedback path; keep the bail-out-if-unchanged guard.
  - Both compositors capture observer refs at mount and compare identity in cleanup (`useCanvasCompositor.ts:209-250`) so an interleaved sibling teardown doesn't synthesize-then-leak a fresh observer. Preserve that pattern if you touch the cleanup.
- **React 19 purity:** number-tween and auto-cycle hooks use the prev-state pattern instead of `setState`-in-effect for prop-change resets (`useAutoCycle.ts:54-59`), and impure values are cached — follow suit. Don't call `Math.random()`/`Date.now()` in render or `useMemo`.
- **Tier scaling lives in the component**, not the context: keep `Record<QualityTier, number>` count tables (`FloatingParticles.tsx:11`, `ParallaxAccents.tsx:7`, `CinematicBreather.tsx:60`) and let `low` mean 0/static where appropriate.
- **`useAnimatedNumber` has a stale-`current` caveat:** its effect reads `current` from closure with an exhaustive-deps disable; it works for monotonic count-ups but isn't a general spring.
- All animated decoration is `aria-hidden`/`pointer-events-none`; preserve that when adding layers.

## Related docs
- [Shared UI Primitives & Illustrations](shared-ui-primitives.md)
- [Layout, Navigation & Page Shell](layout-navigation.md)
- [Feature index](../INDEX.md)
