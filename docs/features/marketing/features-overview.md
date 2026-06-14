# Features Overview
> The value-proposition story — a 4-step "build & operate" feature card cluster plus the 6-card platform vision grid · **Route:** `/features` · **Status:** Live

## What it does
Tells a prospect *what the platform offers* and *why agents beat rigid workflows*, in two reusable marketing sections:

- **Features cluster** (`sections/features`) — a bridge intro ("you've seen *why* agents win, here's *how*"), then four numbered feature cards: design with natural language, agents that coordinate, one-click cloud deploy, and full visibility. One hero card (01) plus a 3-up grid (02–04), each card carrying an inline mini-visual and two deep links into the in-product guide.
- **Vision grid** (`sections/vision-grid`) — six branded platform-capability tiles (Vault, Templates, BYOM, Monitoring, Lab, Orchestration). Each tile is an opaque illustration on idle, brightens on hover, and click-toggles a glass info panel with a description, a 3-item detail list, and a guide deep-link.

Both are pure presentational marketing surfaces: static content, no data fetching, no stores.

**Important — what actually lives on `/features`:** the `/features` *route page* (`src/app/features/page.tsx`) does **not** render either section documented here. It composes the long-form `feature-sections/*` deep-dives (DesignEngine, MemoryLayers, HealingCircuit, SecurityVault, MultiProviderAI, ObservabilityDeck, Lab, Plugins). The `sections/features` cluster and `sections/vision-grid` documented here are mounted on the **landing page** (`/`, the vision grid at `wrapperId: "vision"` via `sections/lazy.tsx:117`) and on the dev-only `/preview/features` and `/preview/vision` surfaces (`src/app/preview/registry.ts:17,19`). The `sections/features` cluster is currently registered for preview only — it is not in the live landing `sections[]` array (`src/app/page.tsx:48`). Treat "Features Overview" as the value-prop *component family*, not a 1:1 mapping to the `/features` URL.

## How it works
**Features cluster** (`sections/features/index.tsx`). A `SectionWrapper#features` runs a one-shot reveal; `FeatureBridge` self-drives its own `whileInView` stagger (it is independent of the wrapper). The `features` array (`data.ts`) is the single source of truth: index 0 is the hero card (uses `heroSlideIn`), indices 1–3 render in a `md:grid-cols-3` grid. Each grid card's entrance animation is chosen by its `entrance` discriminator (`"slideLeft" | "fadeUp" | "slideRight"`) keyed into `gridCardVariants` — decoupled from array position so reordering cards never silently re-shuffles entrances. `FeatureCardHeader` renders the accent-tinted icon chip (`ACCENT_ICON_CLASSES[accent]`), title, and `proof` caption. Per-card mini-visuals are resolved from `FEATURE_VISUALS_BY_KEY[visualKey]` (CSS/SVG mocks in `components/visuals.tsx`, each with a descriptive `role="img"`/`aria-label`). `ProgressionThread` draws a dashed vertical spine with numbered dots aligned beside each card (md+ only, `pointer-events-none`). `GuideLinks` renders the per-card guide deep-links (row layout on the hero, stacked in the grid).

**Vision grid** (`sections/vision-grid/index.tsx`). A `staggerContainer` reveals six `PlatformCardTile`s from `PLATFORM_CARDS` (`data.ts`). Each tile (`PlatformCardTile.tsx`) is a `role="button"` `motion.div` (fixed `h-[380px]`) that toggles `open` on click or Enter/Space. `PlatformCardBackdrop` paints the dark/light Leonardo illustration (`next/image fill`, theme-swapped via `dark:` classes) with a bottom-fade scrim and a brand-tinted radial glow; opacity is `60%` idle → `100%` hover → `10%` when the panel is open. `PlatformCardPanel` slides up from the bottom (`translate-y-[70%]`→`0`) with the description, detail bullets, and a guide link. The `usePlatformCardDisclosure` hook owns all interaction state: open/close, Escape-to-close, focus-the-close-button on open (100ms timeout), focus-restore-to-card on close, and a manual Tab focus-trap scoped to the panel.

Guide links (both sections) route through `openGuideLink(guideHref(ref))` (`@/lib/guide-link`): `<button>` not `<a>`, so the desktop app can intercept via a `personas:open-external` CustomEvent; the web build falls back to `window.open(_, "_blank", "noopener,noreferrer")`. URLs are `/guide/{category}/{topic}`.

## Key files
| File | Role |
| --- | --- |
| `src/app/features/page.tsx` | `/features` route — composes `feature-sections/*` (NOT the sections below); `force-static`, `revalidate=3600` |
| `src/components/sections/features/index.tsx` | Features cluster: intro, hero card, 3-up grid, thread |
| `src/components/sections/features/data.ts` | `features[]` content + entrance/connector/orchestrator variants |
| `src/components/sections/features/types.ts` | `Feature`, `FeatureEntrance`, `GuideLink` (re-export of `GuideTopicRef`) |
| `src/components/sections/features/components/FeatureBridge.tsx` | "why → how" bridge intro (self-driven `whileInView`) |
| `src/components/sections/features/components/FeatureCardHeader.tsx` | Accent icon chip + title + `proof` caption |
| `src/components/sections/features/components/GuideLinks.tsx` | Per-card guide deep-links (`row`/`stack` layout) |
| `src/components/sections/features/components/ProgressionThread.tsx` | Dashed spine + numbered dots beside cards (md+) |
| `src/components/sections/features/components/visuals.tsx` | `FEATURE_VISUALS_BY_KEY` CSS/SVG mini-visuals |
| `src/components/sections/vision-grid/index.tsx` | Platform grid section (6 tiles, `staggerContainer`) |
| `src/components/sections/vision-grid/data.ts` | `PLATFORM_CARDS[]` (title/brand/images/description/details/guide) |
| `src/components/sections/vision-grid/PlatformCardTile.tsx` | Tile shell: title, hover arrow, click target, panel mount |
| `src/components/sections/vision-grid/platform-card-tile/PlatformCardBackdrop.tsx` | Theme-swapped illustration + scrim + brand radial glow |
| `src/components/sections/vision-grid/platform-card-tile/PlatformCardPanel.tsx` | Slide-up disclosure panel (description, details, guide link) |
| `src/components/sections/vision-grid/platform-card-tile/usePlatformCardDisclosure.ts` | Open state, focus management, Escape, Tab trap |
| `src/lib/guide-link.ts` | `guideHref` / `openGuideLink` desktop-aware guide navigation |

## Data & state
- **Source:** static module constants — `features[]` (`sections/features/data.ts`) and `PLATFORM_CARDS[]` (`sections/vision-grid/data.ts`). No runtime fetch. **Stores:** none (no Zustand). **API routes:** none. **Types:** `Feature`/`FeatureEntrance`/`FeatureVisualKey` (`features/types.ts` + `components/visuals.tsx`); `PlatformCard` (`vision-grid/data.ts`); shared `GuideTopicRef` (`@/lib/guide-link`); `BrandAccent`/`BrandKey` (`@/lib/brand-theme`). Only ephemeral UI state is the per-tile `open` boolean in `usePlatformCardDisclosure`.

## Integration points
- **Guide system** — both sections deep-link into `/guide/{category}/{topic}` via `openGuideLink(guideHref(ref))`; desktop app intercepts with the `personas:open-external` CustomEvent.
- **Brand theme** (`@/lib/brand-theme`) — features use `ACCENT_ICON_CLASSES[accent]` for icon chips; vision tiles use `BRAND_VAR[brand]` (CSS var color) and `tint(brand, n)` for glows/shadows.
- **Landing composition** — vision grid mounts via `LazyVision` (`sections/lazy.tsx:117`) in the home `sections[]` array (`src/app/page.tsx:54`, `wrapperId: "vision"`); carries `data-tour-diagram="platform"` for the product tour.
- **Preview surface** — both registered at `/preview/{vision,features}` (dev-only, 404 in prod) via `src/app/preview/registry.ts`.
- **Illustrations** — vision tiles reference `/public/imgs/platform/{id}-{dark,light}.png` (Leonardo-generated); add both variants when adding a card.
- **Shared primitives** — `SectionWrapper`, `SectionIntro`, `SectionHeading`, `GlowCard`, `GradientText`, animation tokens from `@/lib/animations`.

## Conventions & gotchas
- **i18n violation (real issue):** every string in these sections is hardcoded English in JSX. None of these files import `useTranslation` — the `features[]`/`PLATFORM_CARDS[]` copy, the bridge paragraph, headings, "Click to reveal", `aria-label`s, and visual descriptions are all inline literals. This breaks the project's non-negotiable i18n rule (all user-facing copy via `src/i18n/en.ts` + 14-locale lockstep). Any refactor that touches copy here should migrate it to translations; do not add *more* hardcoded strings.
- **Animation gating is partial.** `sections/features/index.tsx` gates correctly (`useReducedMotion` short-circuits the `whileHover` scale/glow). But the vision-grid path uses **CSS** transitions/transforms (`transition-all`, `group-hover:`, `animate-glow-border`, `animate-bar-grow`, the bounce arrow in `FeatureBridge`) and several `motion` variants with **no** `useReducedMotion` check — these still animate under "reduce motion". The visuals (`animate-bar-grow`, `animate-glow-border`) and `FeatureBridge`'s `animate-bounce` are pure CSS, so the lint rule (which only flags `requestAnimationFrame`) won't catch them.
- **ProgressionThread is hand-tuned to layout.** `HERO_DOT_TOP_PX`/`GRID_DOT_FIRST_OFFSET_PX`/`GRID_DOT_SPACING_PX` (`ProgressionThread.tsx:21-23`) are pixel offsets coupled to the hero/grid card padding in `index.tsx`. Change card spacing → re-tune these or dots drift off their cards.
- **`/features` route ≠ these components.** Re-stating because it bites: editing `sections/features` or `sections/vision-grid` changes the landing page and preview, not the `/features` URL (which renders `feature-sections/*`).
- **Entrance is decoupled from order — keep it that way.** Add a 5th feature card with an `entrance` key (not a parallel array). The hero card (index 0) ignores `entrance` and always uses `heroSlideIn`.
- **Data files stay JSX-free.** `features/data.ts` references visuals by string `visualKey`; the JSX lookup lives in `components/visuals.tsx`. Don't inline components into `data.ts`.
- **Vision tile is a nested-interactive a11y pattern.** The tile is `role="button"`; the panel inside holds a close button and a guide button. The disclosure hook manages a manual Tab focus-trap and restores focus to the card on close. Inner button handlers call `e.stopPropagation()` so they don't re-toggle the tile. Test keyboard flow (Enter to open, Tab cycles, Escape closes) when editing the panel.
- **Theme-swapped images.** Backdrop renders both `dark` and `light` `<Image>`s, toggled by `dark:`/`block dark:hidden` classes — both ship in the DOM. Keep both asset paths populated.
- **Semantic tokens, with documented exceptions.** Sections use `text-muted`, `text-muted-dark`, `border-glass(-hover)`, `text-brand-cyan`, `var(--background)` etc. Brand-colored accents are intentionally driven by `BRAND_VAR`/`tint` inline styles rather than utility classes (per the established SVG-motion brand pattern).

## Related docs
- [Pricing](pricing.md)
- [Product feature showcase index](../INDEX.md)
- [Feature index](../INDEX.md)
