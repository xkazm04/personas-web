# Personas Visual Identity & UI Philosophy

A comprehensive reference for the visual design system, animation architecture, and performance patterns used across the Personas platform. Use this document as a recipe for building dark-themed, premium-quality web applications.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Surface & Card System](#5-surface--card-system)
6. [Background Layers](#6-background-layers)
7. [Animation Architecture](#7-animation-architecture)
8. [Performance Patterns](#8-performance-patterns)
9. [Component Taxonomy](#9-component-taxonomy)
10. [Dashboard vs Marketing Pages](#10-dashboard-vs-marketing-pages)
11. [Accessibility](#11-accessibility)
12. [Reuse Checklist](#12-reuse-checklist)

---

## 1. Design Philosophy

### Core Principles

**Depth without clutter.** The UI creates a sense of three-dimensional depth through layered transparency, subtle gradients, and parallax motion rather than drop shadows or bordered containers. Every decorative element exists at near-invisible opacity (0.02--0.06) so it registers subconsciously without competing for attention.

**Motion as information.** Animations serve narrative purpose. Scroll-triggered reveals (fadeUp, staggerContainer) guide the eye down the page. Sparklines in metric cards communicate trend at a glance. Particle flows in the Event Bus visualization show data movement direction and volume. Nothing moves purely for decoration.

**Progressive disclosure.** The landing page unfolds in scroll-driven stages, each section gated by `whileInView` with `viewport={{ once: true }}`. Dashboard pages load skeleton placeholders first, then populate with data in staggered waves. This gives the perception of speed while complex components hydrate.

**Constraint breeds elegance.** The entire palette uses just five brand colors against a near-black background. Cards share one component (`GlowCard`) with accent-color parameterization. Animations share one easing curve. This consistency is what makes the design feel cohesive rather than assembled.

### Visual Metaphor

The brand metaphor is a **command center for AI agents** -- topographic map lines suggest terrain being explored, floating particles suggest ambient intelligence, and glowing card borders suggest active system status. The dark background is the void of possibility; the neon accents are signal lines cutting through it.

---

## 2. Color System

### Design Tokens

All colors are defined once in `src/styles/tokens.css` and exposed to Tailwind via `globals.css` theme bridge:

```css
/* Core palette */
--background: #0a0a12;        /* Deep dark navy -- base canvas */
--foreground: #f0f0f5;        /* Off-white -- primary text */
--muted: #a0a0b0;             /* Mid-gray -- secondary text */
--muted-dark: #60607a;        /* Dark gray -- tertiary text, labels */

/* Brand accent spectrum */
--brand-cyan:    #06b6d4;     /* Primary action, success, data */
--brand-purple:  #a855f7;     /* Premium, highlight, secondary */
--brand-emerald: #34d399;     /* Health, positive, nature */
--brand-amber:   #fbbf24;     /* Warning, attention, warmth */
--brand-rose:    #f43f5e;     /* Error, critical, danger */

/* Surface */
--card-bg:     rgba(255, 255, 255, 0.02);
--card-border: rgba(255, 255, 255, 0.04);
```

### Brand Color Usage Rules

| Color    | Hex       | Role                                    | Typical opacity range |
|----------|-----------|------------------------------------------|-----------------------|
| Cyan     | `#06b6d4` | Primary CTAs, active states, data lines  | 0.04--1.0             |
| Purple   | `#a855f7` | Highlighted tiers, premium features      | 0.035--1.0            |
| Emerald  | `#34d399` | Health, success, positive trends         | 0.04--1.0             |
| Amber    | `#fbbf24` | Warnings, pending states, attention      | 0.08--1.0             |
| Rose     | `#f43f5e` | Errors, negative trends, destructive     | 0.08--1.0             |

### Inline Color Helper

`src/lib/colors.ts` exports `BRAND_COLORS` (RGB triplets) and `rgba(rgb, alpha)` for building inline styles and canvas rendering without duplicating hex values.

### Gradient Patterns

Two gradient text variants via `GradientText` component:

- **Marketing** (`variant="marketing"`): `from-white via-brand-cyan/90 to-white/60` -- eye-catching, editorial
- **Silver** (`variant="silver"`): `from-white via-gray-300 to-white/70` -- clean, professional, used for dashboard and product page headers

Card hover glows use per-accent `hover:shadow-[0_0_50px_${rgba(color, 0.08)}]` -- soft enough to feel ambient, strong enough to indicate interactivity.

---

## 3. Typography

### Font Stack

```css
--font-sans: var(--font-geist-sans), system-ui, sans-serif;
--font-mono: var(--font-geist-mono), ui-monospace, monospace;
```

Geist Sans provides the clean, modern geometric feel. Geist Mono is used for code, labels, stats, and technical metadata.

### Scale

| Element         | Size                              | Weight       | Tracking       |
|-----------------|-----------------------------------|--------------|----------------|
| Hero h1         | `text-5xl` to `text-[5.5rem]`     | `extrabold`  | `tracking-tight` |
| Section h2      | `text-4xl` to `text-7xl`          | `extrabold`  | `tracking-tight` |
| Dashboard h1    | `text-2xl`                        | `bold`       | `tracking-tight` |
| Card title      | `text-base`                       | `semibold`   | default        |
| Card subtitle   | `text-sm`                         | `semibold`   | default        |
| Body text       | `text-lg` / `text-base`           | `light`      | default        |
| Labels          | `text-xs`                         | `medium`     | `tracking-wider` + `uppercase` |
| Stats/Data      | `text-2xl`                        | `bold`       | `tabular-nums` |
| Micro labels    | `text-[10px]` / `text-[11px]`     | `mono`       | `tracking-wider` |

### Heading Components

- `SectionHeading` -- h1/h2 with responsive scale, `font-extrabold tracking-tight drop-shadow-md`
- `GradientText` -- wraps inline text with gradient `bg-clip-text`, two variants
- Dashboard titles: `text-2xl font-bold tracking-tight` wrapping `<GradientText variant="silver">`

---

## 4. Spacing & Layout

### 4px Grid

```css
--spacing-1:  4px;    --spacing-2:  8px;
--spacing-3:  12px;   --spacing-4:  16px;
--spacing-6:  24px;   --spacing-8:  32px;
--spacing-12: 48px;   --spacing-16: 64px;
```

### Section Rhythm

- Marketing sections: `px-6 py-32 md:py-40` via `SectionWrapper`
- Content max-width: `max-w-6xl` (1152px)
- Section transitions: `StageSection` with gradient edge blends (`h-24` top/bottom fades between brand colors)

### Dashboard Layout

- Sidebar: 256px fixed on desktop, bottom nav on mobile
- Content area: fluid with `p-6 lg:p-8` padding
- Card grids: `grid-cols-2 lg:grid-cols-4` for metric cards, `lg:grid-cols-2` for panels
- Consistent `gap-4` between cards, `gap-6` between card groups

---

## 5. Surface & Card System

### GlowCard

The workhorse component. Every card in the app is a `GlowCard` with these properties:

```
Base:      bg-gradient-to-br from-white/[0.035] to-white/[0.008]
Border:    border-{accent}/12, hover:border-{accent}/25
Glow:      hover:shadow-[0_0_50px_rgba({accent},0.08)]
Radius:    rounded-2xl
Hover:     CSS translateY(-6px) via will-change-transform (GPU-compositable)
Transition: transition-[border-color,box-shadow] duration-500
```

Pseudo-element decorations (no extra DOM nodes):
- `::before` -- grid overlay + top shine line
- `::after` -- corner accents + bottom hover accent line

### Accent Parameterization

Four accent colors (`cyan`, `purple`, `emerald`, `amber`) map to border, glow, and icon tint classes. This means any card can be recolored with a single prop change.

### Texture Variants

Optional texture overlays via CSS classes:
- `texture-stripes` -- diagonal repeating lines at 0.018 opacity
- `texture-dots` -- radial dot grid at 0.025 opacity
- `texture-lines` -- horizontal rules at 0.015 opacity

### Glass Morphism

```css
--glass-bg:     rgba(255, 255, 255, 0.02);
--glass-blur:   12px;
--glass-border: rgba(255, 255, 255, 0.04);
```

Used sparingly on navbar, modals, and overlays. Avoided on cards (removed from GlowCard for performance -- 50+ instances rendered simultaneously).

---

## 6. Background Layers

The marketing page background is built from multiple fixed, layered elements, each contributing subtle depth:

### Layer Stack (bottom to top)

1. **Base color** -- `#0a0a12` solid background on `<body>`
2. **TopoBackground** -- CSS gradient contour lines simulating topographic maps. Three parallax layers at different scroll speeds (`--parallax-offset: -50px, -110px, -170px`). Quality-tier gated: high gets 3 layers, medium gets 2, low gets none.
3. **ParallaxAccents** -- Small geometric shapes (circles, diamonds) using CSS `animation-timeline: scroll()` for native scroll-driven parallax with zero JS overhead.
4. **FloatingParticles** -- Canvas-based particle system in the hero section. 15-30 particles depending on quality tier. Particles float upward with sine-wave motion.
5. **StageSection glow** -- 720px centered radial gradient per section, colored by section theme. Creates soft luminous pools behind content.
6. **Section dividers** -- 1px gradient lines with `section-line` class for subtle horizontal breaks.

### Noise Texture

The `.noise` class adds a fractal noise SVG overlay at 0.018 opacity via `::before`. Applied to sections that need texture (hero, download CTA). Purely decorative, pointer-events-none.

### Scroll-Driven Parallax (CSS only)

```css
.parallax-shape {
  animation: parallax-drift linear both;
  animation-timeline: scroll();
  will-change: transform;
}
@supports not (animation-timeline: scroll()) {
  .parallax-shape { animation: none; }
}
```

This provides parallax with zero JavaScript. Falls back gracefully to static positioning in browsers without support.

---

## 7. Animation Architecture

### Animation Gating Contract

Every animated component follows a three-tier contract defined in `src/lib/animations.ts`:

| Tier                | Examples                          | Requirements                          |
|---------------------|-----------------------------------|---------------------------------------|
| **Canvas/RAF**      | FloatingParticles, EventBus       | Must check `useReducedMotion()` AND `useQualityTier()`. Return null when reduced motion preferred. Scale complexity by tier. |
| **GPU-intensive**   | Parallax layers, blur filters     | Must check `useReducedMotion()`. Should read quality tier and reduce layers on medium/low. |
| **CSS-lightweight** | Opacity fades, small transforms   | Exempt from quality gating. Should still respect reduced motion for movements >10px. |

### Framer Motion Variants

Standardized ease curve used everywhere: `[0.22, 1, 0.36, 1]` (spring-like feel).

```typescript
TRANSITION_INSTANT  // 100ms -- tooltips, micro-interactions
TRANSITION_FAST     // 150ms -- dropdowns, toggles
TRANSITION_NORMAL   // 250ms -- panels, modals, drawers
TRANSITION_SLOW     // 400ms -- page transitions, large reveals
```

Shared animation variants:

| Variant             | From                          | To                    | Use case              |
|---------------------|-------------------------------|-----------------------|-----------------------|
| `fadeUp`            | opacity:0, y:30               | opacity:1, y:0        | Default section entry |
| `fadeIn`            | opacity:0                     | opacity:1             | Subtle reveals        |
| `slideInLeft`       | opacity:0, x:-40              | opacity:1, x:0        | Left-panel entries    |
| `slideInRight`      | opacity:0, x:40               | opacity:1, x:0        | Right-panel entries   |
| `scaleIn`           | opacity:0, scale:0.9          | opacity:1, scale:1    | Card entries          |
| `revealFromBelow`   | opacity:0, y:60, scale:0.95   | Full visible          | Dramatic reveals      |
| `staggerContainer`  | --                            | stagger:0.12, delay:0.1 | Parent orchestrator |

### CSS Keyframe Animations

Defined in `globals.css` inside `@media (prefers-reduced-motion: no-preference)`:

| Class                   | Keyframe             | Duration | Use case                        |
|-------------------------|----------------------|----------|---------------------------------|
| `animate-float`         | `float`              | 4s       | Floating decorative elements    |
| `animate-pulse-slow`    | `pulse-slow`         | 20s      | Very slow scale breathing       |
| `animate-shimmer`       | `shimmer`            | 2s       | Loading skeleton shimmer        |
| `animate-spin-slow`     | `spin-slow`          | 30s      | Orbital ring rotation           |
| `animate-scroll-hint`   | `scroll-hint`        | 2s       | Scroll-down chevron bounce      |
| `animate-breathe-glow`  | `breathe-glow`       | 4s       | Box-shadow breathing on CTAs    |
| `topo-bg`               | `topo-drift`         | 80s      | Topographic layer slow drift    |

### Off-Screen Pause System

The `useAnimationPause` system automatically pauses CSS animations for off-screen sections:

1. Elements with `data-animate-when-visible` attribute are observed
2. `IntersectionObserver` with `rootMargin: "100%"` (one viewport ahead)
3. When out of range, `.animations-paused` class is added
4. CSS rule: `.animations-paused * { animation-play-state: paused !important; }`
5. Client components register via `useAnimationPauseRegister()` hook

### Background Tab Pause

```css
.page-hidden * { animation-play-state: paused !important; }
```

The `page-hidden` class is toggled on the root element when `document.hidden` changes.

---

## 8. Performance Patterns

### GPU-Compositable Properties Only

Hover and transition animations use ONLY compositable properties:

- **Transform** (`translate`, `scale`, `rotate`) -- runs on compositor thread
- **Opacity** -- runs on compositor thread
- **NOT** `box-shadow`, `width`, `height`, `filter` -- these trigger layout/paint

```tsx
// Good: CSS translateY, GPU-compositable
className="hover:-translate-y-1.5 will-change-transform"

// Bad: Framer Motion layout-triggering property
whileHover={{ y: -6, boxShadow: "..." }}
```

### Targeted Transitions

Always specify which properties to transition. Never use `transition-all`:

```tsx
// Good
className="transition-[border-color,box-shadow] duration-500"

// Bad -- transitions every property including layout ones
className="transition-all duration-500"
```

### RAF Loop Visibility Gating

Every `requestAnimationFrame` loop checks visibility before running:

```typescript
// IntersectionObserver pauses loop when off-screen
const io = new IntersectionObserver(([entry]) => {
  inViewRef.current = entry.isIntersecting;
  if (entry.isIntersecting && !rafRef.current) {
    rafRef.current = requestAnimationFrame(tick);
  }
}, { threshold: 0.05 });

// Inside tick:
if (!inViewRef.current || document.hidden) {
  rafRef.current = null;
  return; // Stop loop entirely
}
```

This is applied to: `EventBusVisualization`, `MagneticGlowSurface`, `useCanvasCompositor`.

### Canvas Compositor Singleton

`useCanvasCompositor.ts` runs a single shared RAF loop for ALL canvas elements:

- One `IntersectionObserver` for visibility
- One `ResizeObserver` for responsive sizing
- Loop stops entirely when no canvas is in view (`anyInView()` check)
- Loop restarts when any canvas scrolls back into viewport

### Quality-Adaptive Rendering

`QualityContext` measures actual frame times and auto-downgrades:

- **High** (default): Full particle count, all parallax layers, all decorative effects
- **Medium**: ~60% particles, 2 topo layers, reduced blur
- **Low**: ~30% particles, no topo, static fallbacks

Measurement uses p90 frame-time over 120-frame windows. Settles after 15 seconds to avoid continuous overhead.

### Skeleton Loading

`SkeletonCard` and `SkeletonChart` provide shimmer placeholders:
- Framer Motion `translateX` animation for shimmer sweep
- `animate-pulse` on individual line placeholders with staggered `animationDelay`
- Replaced by real content with `AnimatePresence` crossfade

---

## 9. Component Taxonomy

### Layout Components

| Component         | Role                                      | File                                |
|-------------------|--------------------------------------------|--------------------------------------|
| `PageShell`       | Marketing page wrapper (topo bg, scroll map) | `src/components/PageShell.tsx`      |
| `SectionWrapper`  | Section with whileInView + animation pause | `src/components/SectionWrapper.tsx`  |
| `StageSection`    | Color-gradient section transitions         | `src/components/StageSection.tsx`    |
| `InfoPageLayout`  | Info page with navbar + stage              | `src/components/InfoPageLayout.tsx`  |

### Card Components

| Component         | Role                                      | File                                |
|-------------------|--------------------------------------------|--------------------------------------|
| `GlowCard`        | Universal card with accent glow            | `src/components/GlowCard.tsx`       |
| `MetricCard`      | Stat card with icon, value, trend, sparkline | `src/components/dashboard/MetricCard.tsx` |
| `SkeletonCard`    | Shimmer loading placeholder                | `src/components/dashboard/SkeletonCard.tsx` |
| `PhaseCard`       | Roadmap phase card                         | `src/components/PhaseCard.tsx`      |

### Typography Components

| Component         | Role                                      |
|-------------------|--------------------------------------------|
| `SectionHeading`  | Responsive h1/h2 with extrabold + shadow   |
| `GradientText`    | Gradient bg-clip text (marketing/silver)   |
| `TerminalChrome`  | Code block with window chrome              |

### Data Visualization

| Component                | Technique                     |
|--------------------------|-------------------------------|
| `Sparkline`              | Inline SVG polyline + area fill |
| `LatencyChart`           | Recharts LineChart (P50/P95/P99) |
| `CostChartWithCompare`   | Recharts AreaChart + ghost line |
| `ExecChartWithCompare`   | Recharts ComposedChart + compare |
| `EventBusVisualization`  | SVG + RAF particle system     |
| `HealthDigestPanel`      | SVG ring with animated dashoffset |

### Interactive Components

| Component               | Pattern                        |
|-------------------------|--------------------------------|
| `MagneticGlowSurface`   | Mouse-tracking radial glow     |
| `PrimaryCTA`            | Animated conic border + shimmer |
| `ScrollMap`             | Fixed scroll position indicator |
| `WaitlistModal`         | AnimatePresence modal          |

---

## 10. Dashboard vs Marketing Pages

### Marketing Pages (/, /how, /connections, /roadmap)

- Full-bleed sections with `SectionWrapper` or `StageSection`
- `PageShell` provides topo background, parallax accents, scroll map
- Section-level entry animations via `whileInView={{ once: true }}`
- Typography: `GradientText variant="marketing"` for hero headings
- Canvas particle effects (hero only)
- Full `SectionHeading` scale (5xl to 5.5rem)

### Dashboard Pages (/dashboard/*)

- Sidebar layout with constrained content area
- Typography: `GradientText variant="silver"` for page titles
- Smaller heading scale (`text-2xl font-bold`)
- Recharts for data visualization
- Skeleton loading states
- No parallax, no topo background, no scroll map
- Background illustrations per module (low-opacity `next/image`, lazy-loaded)
- MetricCards with sparklines for at-a-glance KPIs

### Shared Between Both

- `GlowCard` (with different accent colors per context)
- `fadeUp` / `staggerContainer` animation variants
- Framer Motion `AnimatePresence` for enter/exit transitions
- Same color tokens and spacing system
- Same accessibility patterns

---

## 11. Accessibility

### Reduced Motion

- `@media (prefers-reduced-motion: reduce)` kills all animations globally
- `useReducedMotion()` from Framer Motion checked in every canvas/RAF component
- Heavy decorative layers (topo, parallax) return `null` when reduced motion preferred
- Keyframe animations capped to `0.01ms` duration + single iteration

### Color Contrast

- Primary text `#f0f0f5` on `#0a0a12` = 15.4:1 ratio (exceeds AAA)
- Muted text `#a0a0b0` on `#0a0a12` = 7.2:1 ratio (exceeds AA)
- Brand cyan `#06b6d4` used only for interactive elements and accents, never for body text
- `::selection` uses cyan at 30% opacity for readable highlight

### Keyboard & Screen Readers

- All interactive elements have `focus-visible` ring: `2px solid rgba(6,182,212,0.4)`
- `.focus-ring` utility for consistent focus styles
- `aria-labelledby` on sections linking to heading IDs
- `aria-hidden="true"` on decorative elements
- `pointer-events-none` on all background layers
- `tabIndex` management in carousels and tab interfaces

### Content Containment

Key sections use `style={{ contain: "layout style paint" }}` to create independent layout contexts, preventing expensive reflows from propagating.

---

## 12. Reuse Checklist

When starting a new project using this visual identity as a recipe:

### Foundation (Day 1)

- [ ] Set up `tokens.css` with the color palette and spacing scale
- [ ] Configure Tailwind theme bridge in `globals.css`
- [ ] Install Geist font (or chosen font) via `next/font`
- [ ] Set `<body>` background to `--background`, color to `--foreground`
- [ ] Add scrollbar styling, `::selection`, and base focus-visible ring
- [ ] Create `GlowCard` component with accent parameterization
- [ ] Create `GradientText` with marketing/silver variants
- [ ] Create `SectionHeading` with responsive scale

### Animation System (Day 2)

- [ ] Copy `animations.ts` with ease curve, variants, and transition presets
- [ ] Copy `useAnimationPause.ts` with IntersectionObserver pause system
- [ ] Add `.animations-paused` and `.page-hidden` CSS rules
- [ ] Add `@media (prefers-reduced-motion: reduce)` global reset
- [ ] Set up `QualityContext` for adaptive rendering (optional but recommended)

### Background Atmosphere (Day 3)

- [ ] Create `TopoBackground` with CSS gradient contour lines
- [ ] Add `parallax-shape` CSS rule for scroll-driven parallax
- [ ] Add `.noise` texture class
- [ ] Create `SectionWrapper` with whileInView + animation pause
- [ ] Create `StageSection` for color-gradient section transitions

### Performance Guardrails

- [ ] Never use `transition-all` -- always specify properties
- [ ] Never animate `box-shadow` or `width/height` in JS -- use CSS `hover:shadow-*`
- [ ] Always gate RAF loops with `IntersectionObserver` visibility check
- [ ] Use `will-change: transform` on elements with CSS hover transforms
- [ ] Use `useCanvasCompositor` singleton for multiple canvas layers
- [ ] Remove `backdrop-blur` from components rendered in bulk (>10 instances)
- [ ] Test with Chrome DevTools Performance panel -- no forced reflows on scroll

### Polish

- [ ] Add skeleton loading states for async content
- [ ] Use `AnimatePresence` for enter/exit transitions
- [ ] Add sparklines or inline visualizations to stat cards
- [ ] Use `tabular-nums` on any numeric displays
- [ ] Test with `prefers-reduced-motion: reduce` enabled
- [ ] Verify contrast ratios meet WCAG AA minimum

---

*This document reflects the Personas platform visual identity as of March 2026. When evolving the design, update this document to keep it in sync with the codebase.*
