# Shared UI Primitives & Illustrations
> The reusable design-system layer — brand cards, terminal panels, chips, section intros, glow/gradient surfaces, brand icons, and the SVG illustration set shared across every page. · **Route:** n/a (shared library) · **Status:** Live

## What it does
This is the shared component toolkit the whole site is built from. Instead of every section hand-rolling the same "rounded glass card with a brand-tinted glow," "dark terminal panel," "pill filter button," or "eyebrow + heading + subtitle" markup, those patterns are factored into a small catalog of primitives. The result is one consistent visual language (the same corner radii, glass borders, brand accent colors, and motion feel) across marketing pages, product showcases, and the demo dashboard — and a single place to change the look.

It also bundles the decorative art: a set of inline SVG **illustrations** (terminal mock, security shield, pricing tiers, local/cloud split, agent grid, cloud infra) used mostly on the FAQ and security surfaces, plus small **brand icon** marks (GitHub, X/Twitter, Discord, Figma, and simplified competitor monograms for CrewAI / LangChain / n8n / AutoGen). All art is theme-aware and respects the user's reduced-motion preference.

## How it works
Primitives split into two folders. `src/components/primitives/` holds the consolidated design-system pieces (`BrandCard`, `SectionIntro`, `TerminalPanel`, `ThemedChip`, and the `terminal/` sub-system) with a barrel `index.ts`. Loose helpers (`GlowCard`, `GradientText`, `TerminalChrome`, `ImageBackground`, `HoneycombMark`, `SVGFocusRing`, `ShortcutHint`) live directly under `src/components/`. Illustrations and icons get their own subfolders.

Theming is driven by `src/lib/brand-theme.ts`: components take a `BrandKey`/`BrandAccent` prop and resolve color via `BRAND_VAR[key]` (a CSS var like `var(--brand-cyan)`) plus `tint()` / `brandShadow()` (CSS `color-mix`). This keeps every primitive correct across all theme variants (dark-midnight, light, light-ice, light-news) instead of baking in hex. `GlowCard` is the exception — it still drives per-accent Tailwind utility strings from `src/lib/colors.ts` hex triplets, falling back to the `.glow-card-dynamic` CSS class (via a `--gc-accent` custom property) when a caller passes a custom `color`.

The **terminal panel sub-system** layers three pieces: `TerminalPanel` (the dark glass shell with optional header/footer slots), `TerminalChrome` (the mac-traffic-light title bar, status dot, and an optional pause toggle wired to `useSectionPauseState`), and the `terminal/` render primitives — `TerminalLine` (one fade-in output row), `TerminalHistory` (a `command` + `output[]` block), and `BlinkingCursor`. `TerminalLine`/`TerminalHistory` are palette-agnostic: the shared `TerminalOutputLine` type leaves `color` an open `string`, and each consumer passes a `colorClasses` Record mapping its own narrow color union to Tailwind classes. `TerminalHistory` dev-warns once per unknown color key and falls back to `text-muted`.

The **illustration library** is plain inline `<svg>` — no props, fixed `viewBox`, gradient `<defs>` and brand hex baked in. They are static except `HealthyShieldIllustration`, which animates orbiting dots via SMIL `<animateMotion>` and a breathing glow via the `.animate-breathe-glow` CSS class.

`SVGFocusRing` provides a11y focus affordances inside SVG: `SVGFocusRingCircle` / `SVGFocusRingRect` render an invisible cyan stroke that the global CSS rule `.svg-focus-parent:focus-visible > .svg-focus-ring { opacity: 1 }` reveals on keyboard focus, so interactive SVG nodes get a visible focus ring matching the DOM `*:focus-visible` outline.

## Key files
| File | Role |
| --- | --- |
| `src/components/primitives/index.ts` | Barrel: re-exports `SectionIntro`, `BrandCard`/`CornerGlow`/`Pill`, `ThemedChip`, `TerminalPanel`, terminal primitives + `TerminalOutputLine` type |
| `src/components/primitives/BrandCard.tsx:27` | `BrandCard` themed glass feature card (`brand`, `gradientWash`, `interactive`); plus `CornerGlow` ambient blob (`BrandCard.tsx:70`) and `Pill` brand badge (`BrandCard.tsx:106`) |
| `src/components/primitives/SectionIntro.tsx:45` | Eyebrow + `SectionHeading` + optional `GradientText` word + subtitle trio; `fadeUp` variant; `align`, `as` (h1/h2), `id` for `aria-labelledby` |
| `src/components/primitives/TerminalPanel.tsx:62` | `forwardRef` dark glass shell; `header`/`footer` slots, `shadow` (none/soft/hero), `bg` (40/50) |
| `src/components/primitives/ThemedChip.tsx:34` | Brand-tinted `rounded-full` filter/tab button; `active`, `brand`, `glow`, `mono`, `size`; sets `aria-pressed` |
| `src/components/primitives/terminal/TerminalLine.tsx:12` | One animated output row (flat `text`/`colorClass`/`indent` props) |
| `src/components/primitives/terminal/TerminalHistory.tsx:16` | `command` + `output[]` history block; consumer `colorClasses` map; dev-warns unknown colors |
| `src/components/primitives/terminal/BlinkingCursor.tsx:10` | Blinking block cursor (framer-motion opacity loop) |
| `src/components/primitives/terminal/types.ts:12` | `TerminalOutputLine` shape (`text`, open-`string` `color`, `indent`, `delay`) |
| `src/components/GlowCard.tsx:41` | Marketing glow card; `accent`/custom `color`, `texture`, `highlighted`; uses hex from `lib/colors.ts` + `.glow-card-dynamic` |
| `src/components/GradientText.tsx:14` | Gradient-clipped text span; `marketing`/`silver` variants |
| `src/components/TerminalChrome.tsx:18` | Title bar: traffic-light dots, status, pause toggle via `useSectionPauseState` |
| `src/components/ImageBackground.tsx:18` | `next/image` cover background with overlay + optional scroll parallax |
| `src/components/HoneycombMark.tsx:6` | Small hexagon brand glyph (`aria-hidden`) |
| `src/components/SVGFocusRing.tsx:5` | `SVGFocusRingCircle` / `SVGFocusRingRect` keyboard-focus rings for SVG nodes |
| `src/components/ShortcutHint.tsx:12` | Keyboard-shortcuts popover button |
| `src/components/icons/brand-icons.tsx:12` | `forwardRef` brand SVG marks (`Github`, `Twitter`, `Discord`, `Figma`, `CrewAI`, `LangChain`, `N8n`, `AutoGen`) + `LucideIcon`-typed re-exports |
| `src/components/illustrations/*.tsx` | 7 static/animated inline-SVG illustrations (Terminal, Shield, HealthyShield, Pricing, LocalCloud, AgentGrid, CloudInfra) |
| `src/lib/brand-theme.ts:26` | `BRAND_VAR`, `tint`, `brandShadow`, `BrandKey`/`BrandAccent` — theming source for the themed primitives |
| `src/lib/colors.ts:2` | `BRAND_COLORS` hex triplets, `rgba`, `hexToRgbTriplet` — used by `GlowCard` |

## Data & state
- **Source:** none — these are presentational components with no data fetching. **Stores:** no Zustand; `ShortcutHint` keeps local `useState(visible)`. **API routes:** none. **Types:** `BrandKey`/`BrandAccent` (`src/lib/brand-theme.ts`), `TerminalOutputLine` (`primitives/terminal/types.ts`), `ShortcutEntry` (`ShortcutHint.tsx:7`), `IconProps` (`icons/brand-icons.tsx:5`). The only shared *state* dependency is the `SectionPause` context (`src/hooks/useSectionPause.ts`): `TerminalChrome` reads `useSectionPauseState()` to render its pause toggle and call `toggleManual`.

## Integration points
- **Theme system:** themed primitives resolve color through `BRAND_VAR`/`tint`/`brandShadow` and CSS vars in `src/styles/tokens.css` + `themes.css`, so they re-skin per `data-theme`.
- **Section pause / motion:** `TerminalChrome`'s toggle and the off-screen freeze come from the `SectionPause` context; the global `.page-hidden` / `.animations-paused` CSS rules and the `@media (prefers-reduced-motion)` block in `src/app/globals.css` pause/disable CSS animations site-wide.
- **CSS classes consumed:** `GlowCard` → `.glow-card`, `.glow-card-dynamic`, `.texture-{stripes,dots,lines}`; `HealthyShieldIllustration` → `.animate-breathe-glow`; `TerminalChrome` → `.animate-glow-border`; `SVGFocusRing` → `.svg-focus-parent:focus-visible > .svg-focus-ring` (all in `globals.css`).
- **Consumers:** `SectionIntro` sits above ~15 sections/pages; `TerminalPanel` shell is reused across 12+ playground/observability/demo panels; `ThemedChip` across blog/use-case/scenario filters; `TerminalLine`/`TerminalHistory` by `platform-command` and playground `TerminalSim`; illustrations by the FAQ and security pages; brand icons by the footer/social rows and the comparison/why-agents sections.

## Conventions & gotchas
- **Hardcoded English (i18n violation):** several primitives ship literal English that bypasses `src/i18n/en.ts`. `ShortcutHint.tsx` hardcodes `"Shortcuts"`, the `title="Keyboard shortcuts"`, and the `"Keyboard Shortcuts"` heading. `TerminalChrome.tsx` hardcodes the default `status = "connected"`, the `"Resume/Pause animation"` `aria-label`/`title`, and `"play"`/`"pause"` labels. `TerminalHistory` defaults `prompt = "~/agents $ "`. Several illustrations bake English text into the SVG (`UNLIMITED LOCAL AGENTS`, `YOUR INFRASTRUCTURE`, `NO ANALYTICS`/`NO TRACKING`/`LOCAL ONLY`/`YOUR DATA`, `LOCAL`/`CLOUD`/`✓ Private`/`✓ Free`, `$ claude --version`, etc.). These are user-visible and currently untranslated — fix before relying on the 14-locale guarantee.
- **Ungated SMIL motion (real reduced-motion gap):** `HealthyShieldIllustration` animates orbiting dots with SVG `<animateMotion>`. SMIL is **not** affected by the global `@media (prefers-reduced-motion) { animation-duration: 0.01ms }` reset (that rule only governs CSS `animation`), so the orbit keeps moving for reduced-motion users. The breathing glow on the same component (`.animate-breathe-glow`) *is* a CSS animation and *is* paused. The custom lint rule `custom-animation/require-animation-gating` does **not** catch this — it only fires on `requestAnimationFrame`/`cancelAnimationFrame`/`<canvas>`, none of which these SVGs use.
- **framer-motion loops rely on the global CSS guard, not JS gating:** `BlinkingCursor` and `TerminalLine` run framer-motion `animate` loops without calling `useReducedMotion`. There is no global `MotionConfig reducedMotion` wrapper, so they are only quieted because framer-motion emits CSS/WAAPI animations that the global reduced-motion rule pauses. If those components were ever moved to a JS-driven value, gating would be missing. (The lint rule still won't flag them.)
- **`GlowCard` is the un-migrated card:** unlike `BrandCard`/`ThemedChip` (which use `BRAND_VAR`/`tint` and re-skin per theme), `GlowCard` resolves accents from hardcoded hex in `lib/colors.ts` and Tailwind `border-brand-*/12` utilities. Its gradient wash (`from-white/[0.035]`) and the illustrations' `rgba(255,255,255,…)` strokes/`#06b6d4` fills are dark-theme-tuned and don't fully adapt to light themes. Prefer `BrandCard` for new feature cards.
- **Brand-icon type cast:** `brand-icons.tsx` re-exports each mark as `LucideIcon` via `as unknown as LucideIcon` so they slot into typed icon data structures — the cast is intentional; keep the `forwardRef` + `displayName` shape when adding marks.
- **Terminal palette contract:** `TerminalHistory`/`TerminalLine` never hardcode colors — always pass a `colorClasses` Record covering every `color` token your data uses, or you'll get the dev console warning and a `text-muted` fallback in production.
- **`whiteSpace: "pre"` + empty lines:** terminal rows render `text || " "` with `white-space: pre` to preserve indentation and keep blank lines from collapsing; don't trim leading spaces upstream.
- **Tokens:** these primitives use semantic Tailwind tokens (`border-glass-hover`, `text-muted`, `bg-surface`, `text-brand-*`); `TerminalPanel`/`ImageBackground` use raw `bg-black/40`-`/65` for the deliberate dark glass/overlay look — keep that intentional rather than "fixing" it to a token.

## Related docs
- [Animation & Motion System](animation-motion.md)
- [Theme System](theme-system.md)
- [Feature index](../INDEX.md)
