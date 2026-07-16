# Theme System — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Store rehydration re-applies the theme to the DOM on every load, directly contradicting the documented "no DOM writes" init design
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: contradictory-init-paths
- **File**: `src/stores/themeStore.ts:101`
- **Scenario**: On every page load, the pre-paint inline script in `layout.tsx` applies the theme before first paint. Then, when `themeStore.ts` is first imported on the client, zustand's `persist` rehydrates synchronously and `onRehydrateStorage` (lines 101–107) calls `applyThemeToDOM(state.themeId)` — a second, redundant DOM write that also adds the `theme-transitioning` class, forcing a 250ms `transition: ... !important` on every element in the document right as React hydrates.
- **Root cause**: Two competing init paths coexist. The `initRandomTheme` docstring (lines 112–120) explicitly states "No DOM writes — the script already did them, and re-applying would re-run `theme-transitioning` for no reason", yet `onRehydrateStorage` fifteen lines above does exactly that re-apply. Whoever refactored init-to-DOM-sync never removed the rehydrate-side write, and no comment records which path is supposed to own the DOM. `initRandomTheme` is also now mostly redundant (rehydration already lifted the persisted id into the store), and its name is a fossil — it no longer picks anything random. The unused `shuffleTheme` action (line 92, zero call sites) is a leftover from the same abandoned design.
- **Impact**: Every navigation pays a document-wide forced style/transition pass during hydration; the stated invariant is false, so the next maintainer cannot tell which of three mechanisms (inline script, rehydrate hook, ThemeInit effect) is authoritative, and edits to one silently break assumptions in another. This is the same class of drift as the layout.tsx:103 duplicate-allowlist finding, but internal to the store.
- **Fix sketch**: Make `onRehydrateStorage` validation-only (clamp invalid ids, no `applyThemeToDOM`); let the inline script own first paint and `setTheme` own subsequent switches. Rename `initRandomTheme` → `syncThemeFromDOM`, delete `shuffleTheme` or wire it up, and add one comment in the store naming the inline script as the sole first-paint writer.

## 2. Theme swatches are 12px targets with no selected-state semantics for assistive technology
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: swatch-a11y-target-and-state
- **File**: `src/components/ThemeSwitcher.tsx:127`
- **Scenario**: A keyboard or screen-reader user tabs through eleven `h-3 w-3` (12×12px) buttons. Nothing programmatic distinguishes the active theme — `active` renders only a visual ring (line 135); there is no `aria-pressed`/`aria-checked`, and the eleven buttons aren't grouped (`role="radiogroup"` / `<fieldset>`), so AT announces eleven unrelated "Select theme …" buttons with no way to know which is current. Pointer users must hit a 12px circle (hover scale doesn't enlarge the hit area before hover).
- **Root cause**: The switcher was designed as a decorative dot strip; selection state and target size were handled purely visually.
- **Impact**: Fails WCAG 2.5.8 Target Size (Minimum, 24px) and 4.1.2 Name/Role/Value for the selected state; motor-impaired and screen-reader users can't reliably operate or perceive the theme choice.
- **Fix sketch**: Wrap the strip in `role="radiogroup"` with an accessible name, give each swatch `role="radio"` + `aria-checked={active}` (or keep `<button>` with `aria-pressed`), and enlarge the interactive area to ≥24px via padding or an absolutely-positioned `::after` hit-area while keeping the 12px visual dot.

## 3. Light-theme divider variant `[data-theme^=light]:bg-black/10` never matches — divider disappears on light themes
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: broken-arbitrary-variant
- **File**: `src/components/ThemeSwitcher.tsx:91`
- **Scenario**: User switches to `light`, `light-ice`, or `light-news`. The dark/light group separator is styled `bg-white/10 [data-theme^=light]:bg-black/10`, intending a dark divider on light themes.
- **Root cause**: A Tailwind arbitrary variant without `&` scopes to the element itself — the generated selector requires the `<div>` to carry `data-theme^=light`, but the attribute lives on `<html>`. The ancestor form would be `[[data-theme^='light']_&]:bg-black/10` (or a `dark:`-based pair, since `.dark` is already toggled per theme).
- **Impact**: On all three light themes the divider stays `white/10` on a near-white background — effectively invisible — so the deliberate dark/light grouping of swatches silently vanishes for exactly the users it targets. Also signals the pattern was never visually verified on light themes.
- **Fix sketch**: Replace with `bg-black/10 dark:bg-white/10` (the store already toggles `.dark` per theme, line 56–60 of themeStore.ts), or use the correct ancestor variant `[[data-theme^='light']_&]:bg-black/10`.

## 4. Two contradictory brand-color sources: `colors.ts` hardcodes dark-tuned RGB triplets that violate `brand-theme.ts`'s own theme-adaptive rule
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: duplicate-color-sources
- **File**: `src/lib/colors.ts:2`
- **Scenario**: A component needs a brand color. Two modules offer it: `brand-theme.ts` exports `BRAND_VAR` CSS variables whose header explicitly warns "Rather than hardcoding hex values (which only look right in dark themes)…", while `colors.ts` — self-described as "single source of truth" — exports `BRAND_COLORS` as fixed RGB triplets (`cyan: "6,182,212"`, …) that never re-map per theme. `ACCENT_ICON_CLASSES` in brand-theme.ts likewise hardcodes `text-cyan-400`-family classes and fixed-rgba glow shadows. Meanwhile `THEMES[].primary` in the store carries a third set of hexes that must manually track the per-theme `--brand-*` CSS tokens.
- **Root cause**: Consolidation stopped halfway: the var-based system was introduced with a documented rationale, but the triplet/Tailwind-class constants were kept (canvas/StageSection consumers) without any note saying when each source is legitimate or that they intentionally do NOT adapt to light themes.
- **Impact**: `text-*-400` icon colors and 400-level rgba glows are tuned for dark backgrounds — on `light`/`light-ice`/`light-news` they render low-contrast washed-out accents; and any future token change (e.g. the documented "switch success to a more accessible green") must be replicated in three places, with drift detected only by eye. Two files both claiming authority makes the wrong import the likely one.
- **Fix sketch**: Document the division of labor in both headers ("colors.ts triplets = canvas/gradient contexts that cannot read CSS vars; everything else uses BRAND_VAR"), derive `BRAND_COLORS` and `THEMES[].primary` from the same literal table, and add per-`data-theme` overrides (or `light:`/`dark:` class pairs) for `ACCENT_ICON_CLASSES` text colors so light themes get 500/600-weight accents.

## 5. Theme crossfade forces 250ms transitions past `prefers-reduced-motion: reduce`
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: reduced-motion-override
- **File**: `src/stores/themeStore.ts:47`
- **Scenario**: A user with `prefers-reduced-motion: reduce` switches themes (or merely loads a page — see finding 1, rehydration adds the class too). `applyThemeToDOM` adds `theme-transitioning`, whose rule in `globals.css:830` applies `transition: background-color 250ms … !important` to every element.
- **Root cause**: The crossfade rule sits after the reduced-motion block (`globals.css:796`, `transition-duration: 0.01ms !important`) and wins on specificity (`.theme-transitioning *` beats `*`), so the global motion kill-switch is silently defeated for this one animation. Nothing records whether that override is intentional; the 300ms JS cleanup timeout (line 70) is also an undocumented magic number that must stay ≥ the CSS 250ms — change either side alone and transitions get cut mid-fade or the class lingers.
- **Impact**: Users who opted out of motion still get a full-document 250ms crossfade; maintainers have no recorded contract linking the 300ms timeout to the 250ms CSS duration.
- **Fix sketch**: Wrap the `.theme-transitioning` rule in `@media (prefers-reduced-motion: no-preference)`, and define the duration once (CSS var `--theme-transition-ms` read by both the rule and the timeout, or a shared constant with a comment pointing at globals.css:834).
