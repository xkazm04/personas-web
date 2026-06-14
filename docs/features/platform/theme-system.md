# Theme System
> The 11-variant theme engine — persisted Zustand store, pre-paint init, swatch switcher, and the semantic color/typography CSS tokens (`text-foreground`, `bg-surface`, `border-glass`, `text-brand-cyan`) that CLAUDE.md mandates. · **Route:** n/a (lib) · **Status:** Live

## What it does
Personas ships **11 themes** — 8 dark (Midnight, Cyan, Bronze, Frost, Purple, Pink, Red, Matrix) and 3 light (Light, Ice, News) — selectable from a row of color-dot swatches in the chrome. A visitor's choice persists across reloads (localStorage); a first-time visitor gets a **random** theme on first paint, which is then locked in. The whole UI re-themes instantly with a short crossfade, because every surface paints from semantic CSS variables (background, foreground, brand accents, glass borders) rather than hardcoded colors. This token layer is the reason CLAUDE.md forbids `text-white` / `bg-black` / raw hex in JSX: those don't adapt per theme, while `text-foreground`, `bg-surface`, `border-glass`, and `text-brand-cyan` do.

## How it works
**Token cascade.** `src/styles/tokens.css:15` defines the canonical `:root` token set (the `dark-midnight` default). `src/styles/themes.css` overrides the same custom properties under `[data-theme="…"]` selectors, one block per non-default variant. `globals.css` then re-exports them to Tailwind via `@theme inline { --color-foreground: var(--foreground); … }` (`globals.css:14`), which is what makes `text-foreground`, `bg-background`, `border-glass`, `text-brand-cyan`, `text-muted-dark`, etc. resolve. Switching theme = toggling one attribute on `<html>`; the cascade does the rest.

**Pre-paint init (no FOUC).** A tiny inline IIFE in `<head>` (`src/app/layout.tsx:98-103`) runs **before body parse**: it reads `localStorage["personas-theme"]`, validates the persisted `themeId` against the 11-name allowlist, falls back to a random pick (and writes it back) if absent/invalid, then sets `data-theme` on `<html>` (omitted for `dark-midnight`) and toggles the `.dark` class. Because this runs synchronously pre-paint, the user never sees a flash of the default before the persisted/random theme lands.

**Hydration sync (no DOM re-write).** `ThemeInit` (`src/components/ThemeInit.tsx`) is a render-null client component mounted once in the body. On mount it calls `initRandomTheme()` (`themeStore.ts:121`), which **reads the DOM back** (`data-theme` + `.dark`) and lifts the resolved id into Zustand via `setState` — it deliberately does **not** re-apply to the DOM (the inline script already did, and re-applying would re-trigger the transition). The DOM is treated as the authoritative first-paint source; the store just catches up so `ThemeSwitcher` renders the correct "selected" ring from mount.

**Store + apply.** `useThemeStore` (`themeStore.ts:84`) is a Zustand `persist` store. `setTheme(id)` / `shuffleTheme()` call `applyThemeToDOM` (`themeStore.ts:43`) then `set({ themeId })`. `applyThemeToDOM` adds a `theme-transitioning` class (drives the ~300 ms crossfade defined in `globals.css:829`), sets/clears `data-theme`, toggles `.dark`, and clears the transition class after 300 ms via a **shared timeout** that rapid switches reset so a new switch doesn't cut the running transition short. `persist` uses key `personas-theme`, partializes to `{ themeId }`, and `onRehydrateStorage` re-validates + re-applies (`themeStore.ts:101`).

**Switcher.** `ThemeSwitcher` (`src/components/ThemeSwitcher.tsx`) renders dark swatches, a divider, then light swatches from `THEMES` (filtered on `isLight`). Each `Swatch` is a color dot tinted by `theme.primary`, with a per-theme decorative SVG glyph (`SWATCH_PATTERNS`) on hover and a framer-motion tooltip. Labels/descriptions come from i18n (`t.themes[…]`, `t.themeDescriptions[…]`) via the `themeKeyMap` ThemeId→translation-key map; the `aria-label` composes `t.accessibility.selectTheme` with the theme name + description.

**Brand helpers.** `src/lib/brand-theme.ts` exposes `BRAND_VAR` (maps `cyan/purple/emerald/amber/rose/blue` to `var(--brand-*)`), `tint()` (color-mix), `brandShadow()`/`brandTextShadow()`, `STATE_COLORS` (success/warning/error semantic aliases), and `ACCENT_ICON_CLASSES` (literal Tailwind bundles for the icon-in-rounded-square pattern). `src/lib/colors.ts` holds raw RGB triplets (`BRAND_COLORS`) + `rgba()`/`hexToRgbTriplet()` for canvas/inline use. `src/lib/typography.ts` exports the shared `EYEBROW` className and `SVG_EYEBROW` style.

## Key files
| File | Role |
| --- | --- |
| `src/stores/themeStore.ts` | Zustand `persist` store, `THEMES` registry, `ThemeId` type, `applyThemeToDOM`, `initRandomTheme` |
| `src/components/ThemeInit.tsx` | Render-null client component; runs `initRandomTheme()` once on mount to sync store ← DOM |
| `src/components/ThemeSwitcher.tsx` | Swatch row UI, per-theme glyphs, i18n labels, selection ring |
| `src/lib/brand-theme.ts` | `BRAND_VAR`, `tint`, `brandShadow`, `STATE_COLORS`, `ACCENT_ICON_CLASSES`, `hexToBrand` |
| `src/lib/colors.ts` | `BRAND_COLORS` RGB triplets, `rgba`, `hexToRgbTriplet`, stage gradient helpers |
| `src/lib/typography.ts` | `EYEBROW` className + `SVG_EYEBROW` for SVG `<text>` |
| `src/styles/tokens.css` | Canonical `:root` token values (the `dark-midnight` defaults) — shared with personas-desktop |
| `src/styles/themes.css` | Per-`[data-theme]` token overrides + light-theme utility inversions |
| `src/app/globals.css` | `@theme inline` maps `--*` → Tailwind `--color-*`; transition + body-gradient rules |
| `src/app/layout.tsx` | Pre-paint inline theme/locale script in `<head>`; mounts `ThemeInit` |

## Data & state
- **Source:** client-only; no network. **Stores:** `useThemeStore` (`themeId`, `setTheme`, `shuffleTheme`), persisted to `localStorage` under `personas-theme` (`THEME_STORAGE_KEY`). **API routes:** none. **Types:** `ThemeId` (11-string union), `ThemeMeta`, `ThemeState` in `themeStore.ts`; `BrandKey`/`BrandAccent` in `brand-theme.ts`; `StageColor` in `colors.ts`.

## Integration points
- **Pre-paint script ↔ store contract:** the inline script in `layout.tsx` hardcodes the 11-name `T` array, the 3-name light list `L`, the storage key `personas-theme`, and the persist envelope shape `{state:{themeId},version:0}`. Any change to `ThemeId`, `THEME_STORAGE_KEY`, the persist `version`, or the light/dark split **must** be mirrored in that script by hand — it can't import the store.
- **`<html className="dark">`** is the SSR default (`layout.tsx:90`) with `suppressHydrationWarning`, since the script mutates `class`/`data-theme` before React hydrates.
- **Tailwind dark variant:** `@custom-variant dark` in `globals.css:10` matches both `[data-theme^="dark-"]` and `.dark`, so `dark:` utilities work for midnight (which carries no `data-theme`) via the `.dark` class.
- **Consumers:** `ThemeSwitcher` lives in the marketing/dashboard chrome; every component that uses semantic Tailwind tokens or `BRAND_VAR`/`tint`/`STATE_COLORS` is an implicit consumer. `.force-dark` / `.connector-icon` (`globals.css:943`/`961`) re-pin tokens for dark-interior islands.

## Conventions & gotchas
- **FOUC is prevented only by the inline script, not by React.** If that `<head>` script is removed, reordered after stylesheet load, throws, or drifts from `ThemeId`/`personas-theme`/the persist envelope, first paint falls back to SSR `dark-midnight` and the real theme pops in on hydration — a visible flash. The store's `initRandomTheme` does **not** rescue this (it never writes the DOM). Treat the script ↔ store as one coupled unit.
- **Token coverage is uneven across variants.** `themes.css` overrides core/brand/glass tokens per theme, but **not every brand key in every theme.** E.g. `dark-cyan` sets `--brand-cyan`/`--brand-purple` but leaves `--brand-emerald`/`--brand-amber`/`--brand-rose` at the `:root` (midnight) values; `dark-bronze` redefines cyan→amber but not rose/emerald. So `text-brand-rose` on `dark-bronze` falls through to the default rose, which may not match the theme's palette. When adding a brand-accented surface, verify the accent is defined for the themes you care about rather than assuming all 5 brand colors re-skin per variant.
- **`bg-surface` is not a defined token.** CLAUDE.md lists `bg-surface` as a mandated token, but there is no `--surface` / `--color-surface` in `tokens.css` or the `@theme inline` block — surfaces use `--card-bg` (`bg-card-bg`), `glass`/`bg-white/N` glass patterns, or `--secondary`. Prefer `bg-card-bg` / the `.glass` utility; flag `bg-surface` usages as likely dead classes until a `--surface` token is added.
- **Light themes invert glass via `!important` utility overrides.** `bg-white/N`, `border-white/N`, `text-white/N`, and `from/via/to-white` are dark-mode glass idioms; `themes.css:296+` remaps each enumerated step to a black-based rgba under `[data-theme^="light"]`. Only the **enumerated** opacity steps are covered — a `bg-white/[0.07]` with no matching override stays invisible on light themes. Reuse existing steps rather than inventing new opacities.
- **i18n:** theme names + descriptions are translated keys (`t.themes.*`, `t.themeDescriptions.*`) plus `t.accessibility.selectTheme`. Adding a theme means adding those keys across all 14 locales (per CLAUDE.md), extending `themeKeyMap` + `SWATCH_PATTERNS`, the `ThemeId` union, `THEMES`, the inline-script arrays, and a `themes.css` block.
- **React 19 purity:** `pickRandomTheme` uses `Math.random()` but only inside event handlers / the one-shot init — never in render or a `useMemo` factory. Keep it that way. `ThemeInit` guards its effect with a `ran` ref so the sync runs exactly once.
- **Animation gating:** `ThemeSwitcher` uses framer-motion `AnimatePresence` (declarative, no rAF) so it's exempt from `require-animation-gating`. The crossfade is pure CSS (`theme-transitioning`) and isn't reduced-motion-gated — note this if tightening motion-reduction coverage.
- **Tokens are shared with personas-desktop.** `tokens.css` is a copied single-source-of-truth (`check-drift.mjs` in the monorepo). Do not edit token *values* casually here without considering drift; add new tokens, don't redefine values inline in `globals.css`.

## Related docs
- [Shared UI Primitives & Illustrations](shared-ui-primitives.md)
- [Feature index](../INDEX.md)
