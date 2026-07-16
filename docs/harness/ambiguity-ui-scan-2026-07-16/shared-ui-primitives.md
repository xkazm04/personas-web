# Shared UI Primitives & Illustrations — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. GlowCard hover glow classes are built at runtime — Tailwind never compiles them, so the glow is dead code
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: runtime-tailwind-arbitrary-class
- **File**: `src/components/GlowCard.tsx:11`
- **Scenario**: Every `accentMap` entry builds its glow as a template literal: `` glow: `hover:shadow-[0_0_50px_${rgba(BRAND_COLORS.cyan, 0.08)}]` ``. Tailwind's scanner reads source text; the expanded class (`hover:shadow-[0_0_50px_rgba(6,182,212,0.08)]`) never appears literally anywhere in the repo (verified — the only literal occurrences are in `docs/visual-identity.md` with a `{accent}` placeholder, and there is no safelist). The class lands in the DOM but no matching CSS rule exists.
- **Root cause**: Runtime string interpolation inside a Tailwind arbitrary-value class — a known Tailwind anti-pattern. The comment on line 61-64 shows the custom-color path was already migrated to `--gc-accent` + `.glow-card-dynamic` (globals.css:456-459), but the four static accents kept the broken interpolated utilities.
- **Impact**: The signature per-accent hover glow on every GlowCard across the site (features, pricing, etc.) silently never renders. Only the border-color transition fires, so cards read flatter than designed — and `docs/visual-identity.md:88` documents behavior the site doesn't actually have.
- **Fix sketch**: Delete the `glow` strings and always apply `.glow-card-dynamic` (the `--gc-accent` var is already set for every accent on line 79), or replace the interpolation with four fully-literal class strings. Update visual-identity.md to match.

## 2. Illustration library has zero accessibility semantics — informative SVG text is exposed raw or lost
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: svg-a11y-missing-role
- **File**: `src/components/illustrations/PricingIllustration.tsx:3`
- **Scenario**: None of the seven illustrations (`AgentGridIllustration`, `CloudInfraIllustration`, `LocalCloudIllustration`, `PricingIllustration`, `ShieldIllustration`, `TerminalIllustration`, `HealthyShieldIllustration`) carries `role="img"` + `aria-label`, a `<title>`, or `aria-hidden="true"`. Several embed content-bearing `<text>` nodes: tier prices "$0/$19/$49", "✓ Private / ✓ Free / ✓ Instant", "NO ANALYTICS / NO TRACKING", "UNLIMITED LOCAL AGENTS".
- **Root cause**: The decorative-vs-informative decision was never made per illustration, so each SVG defaults to "unlabeled image whose stray text nodes are read in DOM order". Contrast `HoneycombMark.tsx:14`, which correctly sets `aria-hidden="true" focusable="false"` — the pattern exists but wasn't applied to the library.
- **Impact**: Screen-reader users get fragments like "$0 $19 $49" or "Fly.io AWS GCP YOUR INFRASTRUCTURE" with no context, or miss claims sighted users see (WCAG 1.1.1). Text at 0.2 opacity over a 0.05-opacity wash also fails contrast for low-vision sighted users if it is meant to inform.
- **Fix sketch**: Decide per illustration: decorative → `aria-hidden="true" focusable="false"` on the root `<svg>`; informative → `role="img"` + `aria-label` summarizing the message (e.g. "Three pricing tiers: Free, Starter, Pro"). Apply the HoneycombMark pattern as the default for the FAQ set, which duplicates adjacent visible copy.

## 3. PricingIllustration hardcodes $0 / $19 / $49 — a second, undocumented source of truth for public pricing
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: duplicated-pricing-source-of-truth
- **File**: `src/components/illustrations/PricingIllustration.tsx:15`
- **Scenario**: The FAQ/marketing illustration paints literal tier names and dollar amounts ("Free $0", "Starter $19", "Pro $49") as SVG text. When actual pricing changes on the pricing page (or in whatever config drives it), nothing forces this SVG to change with it.
- **Root cause**: Numbers were baked into artwork with no comment linking them to the canonical pricing data and no note saying "stylized, intentionally approximate". A reader cannot tell whether $19/$49 are real commitments or placeholder art.
- **Impact**: A future price change leaves the marketing site publicly displaying stale prices — a trust/legal-adjacent problem on a marketing property, and precisely the kind of drift nobody tests for because it lives inside an SVG.
- **Fix sketch**: Either accept props/import the canonical tier constants and render them into the `<text>` nodes, or strip the dollar amounts to skeleton bars (the cards already have skeleton feature lines) and keep only tier names. At minimum add a comment pointing at the canonical pricing source and stating the sync obligation.

## 4. ShortcutHint popover is mouse-only: no aria-expanded, no Escape, no outside-click dismiss, no focus handling
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: popover-keyboard-a11y
- **File**: `src/components/ShortcutHint.tsx:17`
- **Scenario**: The trigger button toggles a floating panel but exposes no `aria-expanded`/`aria-haspopup`/`aria-controls`; the open panel cannot be dismissed with Escape or by clicking elsewhere, and focus never moves into or returns from it. Also `key={s.key}` (line 36) collides if two shortcuts share the same keystroke label.
- **Root cause**: Happy-path `useState` toggle with no disclosure-widget semantics — ironic for a component whose entire purpose is advertising keyboard support.
- **Impact**: Keyboard and screen-reader users can't tell the button opens anything, and once open the panel traps stale UI on screen until the tiny trigger is re-activated; it can also overlap and block content on small viewports with no escape hatch.
- **Fix sketch**: Add `aria-expanded={visible}` + `aria-haspopup="dialog"` and `aria-controls` on the button; close on `Escape` (keydown listener while open) and on outside pointer-down (ref containment check); use `label + key` for the map key. ~15 lines, no new deps.

## 5. Brand palette hardcoded as hex in SVG primitives, bypassing the theme system the rest of the module uses
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: hardcoded-brand-hex-vs-theme-vars
- **File**: `src/components/SVGFocusRing.tsx:3`
- **Scenario**: `SVGFocusRing` pins `const CYAN = "#06b6d4"`, and all seven illustrations repeat literal `#06b6d4` / `#a855f7` / `#34d399` (plus `rgba(255,255,255,…)` washes that assume a dark background). Meanwhile the sibling primitives (`BrandCard`, `ThemedChip`, `HoneycombMark`, `GradientText`) deliberately route through `BRAND_VAR`/`var(--brand-*)` and advertise themselves as "theme-adaptive", and `src/styles/themes.css` ships `[data-theme^="light"]` overrides — so themes are a real, supported axis.
- **Root cause**: No recorded decision on whether SVG artwork is exempt from theming. The split (CSS vars in primitives, frozen hex + white-on-dark assumptions in illustrations/focus rings) is undocumented, so the next brand-color tweak or light-theme pass will update the variables and silently miss every SVG.
- **Impact**: Brand-color changes fork into two systems that drift apart; in light themes the focus ring and illustrations keep dark-theme colors and near-white text becomes invisible on light surfaces (`rgba(255,255,255,0.2)` labels). Focus-ring contrast (WCAG 2.4.7/1.4.11) degrades where cyan sits on light backgrounds.
- **Fix sketch**: Replace the hex literals with `var(--brand-cyan)` etc. (HoneycombMark proves SVG attributes accept CSS vars) and swap white washes for `var(--foreground)`-based color-mix; where that's not practical, add a one-line comment in each file declaring "dark-theme-only artwork" so the assumption is at least recorded and greppable.
