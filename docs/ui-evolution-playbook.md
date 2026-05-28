# UI Evolution Playbook

**A transferable philosophy + technique library for taking a web UI to "v2."**

This is **not a design system** and **not a style guide**. It deliberately contains no
colors, fonts, or theming. It captures *how to think* and *what techniques to reach for*
so a project can level up its UI **in its own visual language**. It was distilled from a
codebase whose UI we were especially proud of (`personas-web`); the `code-reference` pointers
name that source as a *reference implementation to learn from* — those files will not exist in
your target repo. Port the **idea**, not the file.

> **Path convention.** All `personas-web/...` references are written **relative to the `kiro/`
> parent folder** (the directory that contains both the source project and your other sites),
> never as absolute machine paths — so they resolve the same on any device. If `personas-web`
> isn't checked out beside the target, treat the pointers as descriptions, not links.

---

## Task preamble (paste this above the playbook when you attach it)

```text
You are upgrading THIS project's UI to v2. The attached "UI Evolution Playbook" is your guide.

Rules of engagement:
- Read the entire playbook before touching code.
- ADAPT, DON'T CLONE: never import the playbook source's colors, fonts, theming, or mood.
  Keep THIS project's identity; transfer only approach and execution quality.
- Work in atomic commits, surface by surface. Prefer additive, reversible changes.
- Verify every change by driving the real UI (desktop + mobile), not just a type-check.

Deliverables, in order — pause for my approval after step 2:
  1. INVENTORY + DIAGNOSIS — scan the codebase and report how it currently handles tokens,
     loading, motion, a11y, performance, reuse, and guardrails (use the playbook checklist).
  2. PRIORITIZED v2 PLAN — foundation → chrome → hero surfaces → details → guardrails,
     ordered high-impact/low-risk, each item adapted to this project's identity.
  3. EXECUTION — atomic commits implementing the approved plan.
  4. VERIFICATION — before/after notes (and screenshots where possible) proving each change.
  5. LOCK-IN — encode the new patterns as lint rules / a component catalog so v2 doesn't rot.

If the target is a different surface type than the source (e.g. data-dense app vs. marketing
splash), recalibrate density and motion accordingly — don't impose the source's pacing.
```

---

## 0. How to use this (you are an agent evolving a UI to v2)

1. **Read this whole document first.** Internalize the philosophy before touching code.
2. **Scan the target codebase** (§5 Phase 0). Build an inventory of how it currently handles
   tokens, loading, motion, a11y, performance, and reuse.
3. **Diagnose** against the smells in §5 Phase 1 and the checklist in §7.
4. **Evolve** — apply the techniques in §4, **translated into the target's own identity**.
5. **Verify by driving the real UI** (§3.8), then **lock the new patterns in as guardrails**
   so they don't decay (§4.12).

> The single most important instruction: **adapt, don't clone.** If three of "my websites"
> end up looking the same, this playbook has failed. Two sites can both be excellent and
> share *none* of their palette, type, or mood — what they share is **execution quality**.

---

## 1. The Prime Directive — Adapt, don't clone

Every technique below is about *craft*, not *appearance*. When you apply one:

- **Keep the target's existing identity** (palette, type scale, voice, density, brand motifs).
  Read its current tokens/theme and work within them.
- **Match the target's domain.** A data-dense dashboard, a marketing splash, and a docs site
  want different densities and different amounts of motion. Calibrate.
- **Raise the floor and the ceiling** — make the boring parts solid (loading, a11y, perf) and
  add one or two **signature moments** that fit *this* product (§4.9).

---

## 2. Core philosophy (the mindset)

1. **Performance *is* UX.** A steady, composed reveal beats an instant-but-janky "big bang."
   It is acceptable — often better — to make something appear slightly *later* if it appears
   *smoothly* and at the right moment.
2. **Motion is meaning, used with restraint.** Animate to explain change (where did this come
   from, where did it go), not to decorate. A few consistent, well-tuned transitions read as
   more premium than many bespoke ones.
3. **Accessibility is the default, not a toggle.** `prefers-reduced-motion`, contrast,
   focus-visible, 44px touch targets, and keyboard paths are baseline, designed in from the
   start — never retrofitted.
4. **Guardrails encode taste.** Anything you care about, encode as a lint rule or a generated
   catalog so it's enforced automatically. Willpower doesn't scale across sessions or people.
5. **Reuse over reinvention.** A small, well-named set of shared primitives, kept discoverable,
   prevents the slow drift into ten slightly-different buttons/spinners/empty-states.
6. **Delight lives in the details.** Turn dead time into a *beat* (a forced wait becomes a
   countdown). Make one element react to something real (voice, scroll, live data). Sweat the
   1s-per-number cadence.
7. **Progressive enhancement + graceful degradation.** Assume the network is slow, the GPU is
   weak, the API is missing, the browser is old. Each feature should *gracefully* do less, never
   break. Detect capability and adapt fidelity at runtime.
8. **Verify by driving the real UI.** A clean type-check is necessary, not sufficient. You only
   know it works when you've watched it render and interact.

---

## 3. Why this UI worked (the abstract wins)

- It **never dumped everything on screen at once** — content streamed in as you needed it.
- It **stayed buttery on mid-range hardware** because off-screen work was paused and fidelity
  adapted to measured frame time.
- Its motion felt **of one hand** — a single easing/duration vocabulary used everywhere.
- It was **honest under stress** — slow networks, no API, reduced-motion, and old browsers all
  produced a coherent (lesser) experience instead of a broken one.
- It had **a soul** — a signature, reactive companion moment that made the product memorable
  without being noisy.
- Quality **didn't decay** because the codebase *refused* to compile/lint the patterns we'd
  decided were wrong.

Your v2 should reproduce these *properties*, in the target's own clothes.

---

## 4. The technique library

Each entry: **the idea → why it matters → how (mechanics) → adapt → code-reference.**

### 4.1 Semantic token architecture (themeable by construction)
- **Why:** hardcoded colors/sizes make re-theming impossible and drift inevitable.
- **How:** define raw values once as CSS custom properties; expose **semantic** names
  (`--surface`, `--text-muted`, `--elevation-2`, spacing/radius/type scales) rather than raw
  hexes; bridge them into the utility framework so `bg-surface`/`text-muted` "just work";
  switch whole themes via a single `data-theme` attribute set pre-paint (no flash).
- **Adapt:** keep the target's values; only adopt the *structure* (raw → semantic → utility
  bridge → `data-theme` switch). Never inline raw colors in components.
- **Code-reference:** `personas-web/src/styles/{tokens,themes,typography}.css`, the
  `@theme inline` bridge in `personas-web/src/app/globals.css`, the pre-paint theme script in
  `personas-web/src/app/layout.tsx`.

### 4.2 Progressive, scroll-gated loading (kill the big bang)
- **Why:** shipping every section's JS + hydration at first paint is the #1 cause of a heavy,
  janky landing. Spreading it across scroll is dramatically smoother.
- **How:** **code-split** below-the-fold sections (dynamic import) **and** **viewport-gate**
  their mount with an IntersectionObserver that fires ~1 viewport early, reserving space so
  there's no layout shift. Keep the first/above-the-fold section eager for LCP. Keep anchor
  ids on the always-rendered wrapper so in-page nav still works.
- **Adapt:** tune the lead distance to the content weight; keep SEO-critical sections
  server-rendered, defer purely-decorative/interactive ones.
- **Code-reference:** `createLazySection` (`personas-web/src/components/sections/LazySection.tsx`),
  `LazyMount` (`personas-web/src/components/LazyMount.tsx`), usage in
  `personas-web/src/app/page.tsx` & `personas-web/src/app/features/page.tsx`.

### 4.3 Skeletons shaped like their content
- **Why:** a skeleton that mirrors the real layout makes load feel instant and prevents CLS;
  a generic gray box does neither.
- **How:** per-section skeletons that match heading/grid/card geometry; reserve real heights.
- **Adapt:** build one skeleton per heavy surface; reuse a shared pulse primitive.
- **Code-reference:** the section-specific skeletons in `personas-web/src/components/sections/lazy.tsx`.

### 4.4 A single motion vocabulary
- **Why:** consistency reads as polish. Ten different easings read as chaos.
- **How:** standardize a tiny set — durations **150–200ms** (small UI), **~300ms** (page/tab),
  **≤400ms** (large); **ease-out** for entrances; **animate only `transform`/`opacity`**
  (GPU-composited); use shared-element transitions (`layoutId`) for "this became that";
  `AnimatePresence` for enter/exit; reusable variants (e.g. `fadeUp`, `staggerContainer`).
- **Adapt:** pick the target's signature easing curve and reuse it everywhere.
- **Code-reference:** `personas-web/src/lib/animations.ts`; the tab-bar `layoutId` pill and
  `template.tsx` page transitions under `personas-web/src/app/m/`.

### 4.5 Reduced-motion as a first-class path
- **Why:** vestibular-sensitive users; also a respectful default.
- **How:** a global `prefers-reduced-motion` CSS block that neutralizes decorative animation;
  a motion-library-level switch (e.g. `MotionConfig reducedMotion="user"`) so component
  transforms degrade to opacity automatically; per-component fallbacks for anything bespoke.
- **Adapt:** every new animated component must have a reduced-motion branch *by default*.
- **Code-reference:** the `@media (prefers-reduced-motion: reduce)` block in
  `personas-web/src/app/globals.css`; `MotionConfig` in `personas-web/src/app/m/layout.tsx`;
  per-component `useReducedMotion()` branches.

### 4.6 Spend the animation budget only where it's seen
- **Why:** off-screen CSS animations and long lists silently burn GPU/CPU and hurt INP.
- **How:** an IntersectionObserver that toggles a `paused` class on off-screen animated
  elements; `content-visibility: auto` (+ `contain-intrinsic-size`) on long lists so off-screen
  rows skip layout/paint; pause peripheral motion in background tabs.
- **Adapt:** apply to anything that loops or any list that can grow into the hundreds.
- **Code-reference:** `useAnimationPause` (`personas-web/src/hooks/useAnimationPause.ts`) +
  `.animations-paused` in `personas-web/src/app/globals.css`; `content-visibility` on the
  `/m` route's lists.

### 4.7 Adaptive fidelity (quality tiers)
- **Why:** the same scene that delights on a laptop can melt a budget Android.
- **How:** measure real frame time at runtime; drop a "quality tier" when frames blow past
  budget; gate the most expensive effects (big animated gradients, blur stacks, particle
  layers) behind the tier, with a cheap static fallback.
- **Adapt:** tie your heaviest decorative layers to the tier; ship a static variant of each.
- **Code-reference:** `QualityProvider`/`useQualityTier`
  (`personas-web/src/contexts/QualityContext.tsx`); `.cinematic-gradient` vs
  `.cinematic-gradient-static` in `personas-web/src/app/globals.css`.

### 4.8 Decorative richness without DOM bloat
- **Why:** lush cards often get there via 5–6 extra divs each; that adds up.
- **How:** express grid overlays, shine lines, corner accents, glows as `::before`/`::after`
  pseudo-elements and box-shadows on one element; drive per-instance accents with a CSS var.
- **Adapt:** audit "decorative wrapper" divs and collapse them into pseudo-elements.
- **Code-reference:** `.glow-card::before/::after` and the texture utilities in
  `personas-web/src/app/globals.css`.

### 4.9 One signature, *reactive* moment
- **Why:** memorability comes from a detail that feels alive and specific to the product.
- **How:** make one hero element respond to something real — narration voice via a Web Audio
  `AnalyserNode`, scroll position, live metrics, cursor. Keep it tasteful and gated by
  reduced-motion/quality.
- **Adapt:** choose a moment that fits *this* product's story; don't copy the companion — find
  the target's equivalent "alive" element.
- **Code-reference:** `AthenaCompanion` (audio-reactive canvas) + `AvatarCountdown` (a forced
  4s wait turned into a ring+number+tick countdown) under `personas-web/src/components/tour/`.

### 4.10 Native-feeling interactions (esp. on touch)
- **Why:** web UIs that ignore platform conventions feel cheap on phones.
- **How:** bottom **sheets** (not centered modals) for contextual detail, with drag-to-dismiss
  **plus** a visible close + backdrop + Escape (never swipe-only); `100svh` for shells (not
  `100vh`); `env(safe-area-inset-*)` for notch/home-indicator; ≥44px targets; suppressed
  tap-highlight; ≥16px inputs to avoid iOS zoom.
- **Adapt:** apply on the target's mobile surfaces; desktop keeps its own conventions.
- **Code-reference:** `MobileSheet`, `MobileTabBar`, `MobileShell` under
  `personas-web/src/components/mobile/`.

### 4.11 A discoverable shared-component layer
- **Why:** drift starts the moment someone hand-rolls a spinner that already exists.
- **How:** a `shared/` (or `ui/`) layer of primitives + an **auto-generated catalog** so they're
  findable; a convention that new reusable patterns land there, not in feature folders.
- **Adapt:** if the target lacks this, extract the obvious primitives first (button, modal/sheet,
  empty-state, spinner, badge, copy-button, relative-time, numeric) and catalog them.

### 4.12 Guardrails — encode taste as lint/codegen
- **Why:** this is what makes quality *stick* across many sessions and contributors.
- **How:** small custom lint rules that fail the build on the mistakes you keep seeing. Examples
  worth porting (names from the source repo): no raw color/utility classes when a semantic token
  exists; no hardcoded user-facing strings (i18n); animation files must call the reduced-motion
  hook; minimum text-contrast/opacity; enforce the shared modal/sheet primitive; cap file size
  to force decomposition; forbid risky ref/`setState`-in-effect patterns.
- **Adapt:** start with 3–4 rules that match the target's actual recurring smells; grow over time.
- **Code-reference:** `personas-web/eslint-rules/*.js` and the `custom-*` plugins in
  `personas-web/eslint.config.mjs`.

---

## 5. The v2 process (run this on the target)

### Phase 0 — Scan & inventory (read-only)
Produce a short written inventory of how the target currently handles:
- **Tokens/theming:** semantic tokens or raw hexes? one theme or many? flash on load?
- **Loading:** is everything imported/hydrated up front? any code-splitting or scroll-gating?
- **Motion:** consistent vocabulary or ad-hoc? transform/opacity only, or animating layout?
- **A11y:** reduced-motion path? focus-visible? contrast? touch targets?
- **Performance:** off-screen animation running? long unvirtualized lists? heavy blur stacks?
  big bundles? Core Web Vitals (LCP/INP/CLS) hotspots.
- **Reuse:** shared primitive layer or duplicated components?
- **Guardrails:** any lint rules encoding UI quality, or none?

### Phase 1 — Diagnose (the smells)
Flag: big-bang first paint · hardcoded colors/sizes · inconsistent or layout-thrashing motion ·
missing reduced-motion · generic/absent skeletons (CLS) · always-on off-screen animation ·
modals where sheets belong on mobile · `100vh` on mobile · duplicated primitives · no guardrails.

### Phase 2 — Prioritize (high impact, low risk first)
Recommended order: **Foundation** (tokens, reduced-motion, perf budget) → **Chrome**
(nav, transitions, shared primitives) → **Hero surfaces** (landing/dashboard: scroll-gating,
skeletons, the signature moment) → **Details** (micro-interactions, empty states) →
**Guardrails** (lock it in). Commit atomically per step; verify as you go.

### Phase 3 — Execute (in the target's identity)
Apply §4 techniques, translated to the target's palette/type/density. Reuse existing infra;
don't rebuild what's already good. Prefer additive, reversible changes.

### Phase 4 — Verify by driving the UI
Run the app. Drive each changed surface in a real viewport (desktop and mobile). Watch for
jank, layout shift, broken reduced-motion, and console errors. Screenshot before/after. For
loading work, confirm staggering empirically (e.g. count chunk requests at load vs. on scroll).
A green type-check is not verification.

### Phase 5 — Lock it in
Encode the new patterns as guardrails (§4.12) and add new primitives to the catalog so v2
doesn't rot back to v1.

---

## 6. Anti-patterns (do NOT do these)

- **Don't clone this project's look.** No importing its palette/theme/mood. Adapt techniques only.
- **Don't bulk-rewrite.** Evolve surface by surface, atomic commits, verify each.
- **Don't animate layout properties** (`width`/`top`/`margin`) — stick to `transform`/`opacity`.
- **Don't stack backdrop-blur everywhere** — it's a real scroll-jank source on phones; cap it.
- **Don't ship motion without a reduced-motion branch.**
- **Don't gate content behind client-only mounts if it's SEO-critical** — keep that SSR'd.
- **Don't hardcode strings or colors** — tokens + i18n, always.
- **Don't claim done on a type-check** — drive the UI.
- **Don't add a "signature moment" that's louder than the content** — one tasteful beat, gated.

---

## 7. Quick diagnostic checklist

- [ ] Semantic tokens, not raw hexes; theme switch is flash-free.
- [ ] Below-the-fold sections are code-split + scroll-gated; first paint is light.
- [ ] Skeletons mirror content; CLS is near zero.
- [ ] One motion vocabulary (durations/easing); transform/opacity only.
- [ ] `prefers-reduced-motion` fully handled, globally and per-component.
- [ ] Off-screen animation paused; long lists use `content-visibility`/virtualization.
- [ ] Heaviest effects gated behind a runtime quality tier with static fallbacks.
- [ ] Decorative layers via pseudo-elements, not stacks of divs.
- [ ] Exactly one or two signature, reactive moments — tasteful and gated.
- [ ] Mobile: sheets over modals, `svh`, safe-area, ≥44px targets, ≥16px inputs.
- [ ] Shared primitive layer exists and is discoverable.
- [ ] UI-quality rules are enforced by lint/codegen, not memory.
- [ ] Every change was driven in a real viewport before being called done.

---

*Take the properties, leave the palette. Make it unmistakably theirs.*
