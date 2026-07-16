# Features Overview & Pricing — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Platform card is a `role="button"` containing buttons, and clicks inside the open panel close it
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: nested-interactive-disclosure
- **File**: `src/components/sections/vision-grid/PlatformCardTile.tsx:39`
- **Scenario**: A user opens a platform card and clicks anywhere in the detail panel that is not the close/guide button — e.g. to select or re-read the description text — and the panel instantly closes. A screen-reader user encounters a `role="button"` element that itself contains a close button and guide-link buttons.
- **Root cause**: The whole tile is `role="button"` with an `onClick` toggle (`PlatformCardTile.tsx:39-41`), and `PlatformCardPanel` (`PlatformCardPanel.tsx:23-88`) renders inside it without stopping propagation on its container — only the close button and guide buttons call `e.stopPropagation()`. Interactive descendants inside a `role="button"` violate WCAG 4.1.2 / ARIA nested-interactive rules; `aria-expanded` is also declared with no `aria-controls` pointing at the panel.
- **Impact**: Real interaction bug (panel dismisses while reading) plus a genuine a11y failure: assistive tech announces one big button and may not expose the inner controls; the keyboard handler on the card and the focus trap in `usePlatformCardDisclosure` partially compensate but the semantics remain broken.
- **Fix sketch**: Add `onClick={(e) => e.stopPropagation()}` on the panel's inner container so only backdrop clicks toggle; replace the tile-level `role="button"` with an explicit header toggle `<button aria-expanded aria-controls={panelId}>` (title + arrow) and give the panel `id={panelId}`, keeping the large hit area via a click handler on the non-interactive wrapper.

## 2. Pricing section renders half-translated: offer strip and CTA are hardcoded English next to i18n copy
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: partial-i18n-section
- **File**: `src/components/sections/pricing/index.tsx:38`
- **Scenario**: Any non-English locale renders this section with the heading, description, and all six group cards translated (via `t.compareSection`), but "Free forever / Self-hosted / No per-run markup / Open source", the offer paragraph ("Personas runs on your machine…"), and the "Get started free" CTA label stay in English.
- **Root cause**: The offer-framing block added at `index.tsx:34-55` bypassed the `useTranslation()` hook that the rest of the section (and `FeatureGroupCard.tsx:20`) already uses; the strings were inlined instead of added to `t.compareSection`.
- **Impact**: Mixed-language pricing section for every non-en locale — the most conversion-critical copy on the page (the free offer and the primary CTA) is the part that never translates, which reads as broken rather than intentionally untranslated.
- **Fix sketch**: Add `offerBadges: string[]`, `offerBody`, and `ctaLabel` keys under `compareSection` in the locale files and map over them in the offer block; render the CTA label from `t`. Seed non-en locales with the English placeholder if translations lag (matches the repo's i18n-parity convention).

## 3. ProgressionThread dot positions encode a stacked-card layout the md grid does not have
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: magic-numbers-false-premise
- **File**: `src/components/sections/features/components/ProgressionThread.tsx:21`
- **Scenario**: On md+ viewports (the only place the thread renders — it is `hidden md:flex`), dots 02–04 are placed at `calc(50% - 40px)`, `calc(50% + 40px)`, `calc(50% + 120px)` down the vertical line, while the three grid cards they represent sit side by side in a single `md:grid-cols-3` row (`features/index.tsx:73`) at the same vertical position.
- **Root cause**: `HERO_DOT_TOP_PX` / `GRID_DOT_FIRST_OFFSET_PX` / `GRID_DOT_SPACING_PX` and the block comment ("numbered dots beside each feature card… tied to the heights of the parent layout's hero card and grid card — change them when the card padding or spacing changes") assume cards stack vertically. They only do below md, where the thread is hidden. Nothing anchors a dot to its card; the 80px spacing is arbitrary at the breakpoint where it is visible.
- **Impact**: The documented maintenance contract is unfulfillable — no padding change can make dot 02 sit "beside" card 02 in a horizontal row — so the numbers 02/03/04 float next to nothing, and a future maintainer following the comment will tweak constants chasing an alignment that cannot exist. Visual result today is a plausible-looking but semantically meaningless progression.
- **Fix sketch**: Either (a) accept it as decoration: collapse to a single mid-line cluster or evenly distribute dots along the line and rewrite the comment to say positions are decorative; or (b) make it real: position dots via refs/`getBoundingClientRect` of the actual cards (or move dots into each card's left gutter), deleting the pixel constants.

## 4. Hardcoded white utilities break the section on the shipped light themes
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: theme-token-bypass
- **File**: `src/components/sections/features/index.tsx:24`
- **Scenario**: With `data-theme="light"` (or `light-ice`/`light-news`, all defined in `src/styles/themes.css`), the giant "01–04" numeral is `text-white/60` on a light background (invisible/washed), the ProgressionThread grid dots are `text-white/70` on `bg-white/3` (`ProgressionThread.tsx:64`), FeatureBridge pills use `bg-white/3` (`FeatureBridge.tsx:26`), and the panel close button hover is `hover:bg-white/10` (`PlatformCardPanel.tsx:47`).
- **Root cause**: These elements bypass the theme token system the rest of this very context uses correctly — `PlatformCardTile.tsx:81` uses `rgba(var(--surface-overlay), …)`, which flips 255,255,255 → 0,0,0 across dark/light themes, and backdrops use `color-mix(... var(--background) ...)`. The white literals were written against the default dark theme only.
- **Impact**: On the three light themes the features section's largest visual element disappears, thread numbering becomes unreadable, and hover feedback on the panel close button vanishes — a consistency defect in a codebase that already pays the cost of a multi-theme token system.
- **Fix sketch**: Replace the literals with the existing tokens: `text-white/60` → `style={{ color: "rgba(var(--surface-overlay), 0.6)" }}` (or a `text-overlay-*` utility if one exists), `bg-white/3` → `rgba(var(--surface-overlay), 0.03)`, `hover:bg-white/10` → token-based hover. No layout change.

## 5. Download CTA's env-dependent href fallback rests on undocumented assumptions
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: undocumented-env-fallback
- **File**: `src/components/sections/pricing/index.tsx:50`
- **Scenario**: `href={DOWNLOAD_URL ? "/api/download" : "#download"}` — when `NEXT_PUBLIC_DOWNLOAD_URL` is unset at build time, the primary "Get started free" CTA silently degrades from a file download to an in-page scroll to `#download` (the `DownloadCTA` section, `src/components/sections/DownloadCTA.tsx:40`).
- **Root cause**: Two unstated assumptions with no recorded reasoning: (a) `/api/download` is only meaningful when the env var exists — the coupling between a client-side env check and a server route's behavior is implicit; (b) a `#download` anchor exists on whatever page hosts this section — true only on the landing page, so reusing the section elsewhere yields a dead link. Neither the component comment (which documents the pricing→feature-group relabel) nor the code says why the fallback is an anchor rather than hiding/disabling the CTA.
- **Impact**: A misconfigured or missing env var in a deploy is invisible — the button still "works" but does something different (scrolls instead of downloads), the exact class of silent degradation that goes unnoticed in review; a future page-level reuse of `<Pricing />` produces a no-op CTA with no warning.
- **Fix sketch**: Centralize the decision in a small helper (e.g. `getDownloadHref()` next to the `/api/download` route) with a one-line comment stating the contract ("route 404s/redirects without NEXT_PUBLIC_DOWNLOAD_URL; anchor fallback assumes landing-page DownloadCTA"), and have DownloadCTA and Pricing both consume it so the assumption lives in one documented place.
