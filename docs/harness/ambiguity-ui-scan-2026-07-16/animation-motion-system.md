# Animation & Motion System — ambiguity+ui scan
> Total: 5 findings (Critical: 1, High: 3, Medium: 1, Low: 0)

## 1. Reduced-motion users see a permanently invisible CinematicBreather headline
- **Severity**: Critical
- **Agent**: ui_perfectionist
- **Category**: reduced-motion-hides-content
- **File**: `src/components/CinematicBreather.tsx:32`
- **Scenario**: User has `prefers-reduced-motion: reduce` (OS accessibility setting). They scroll to the "Your agents. / Your rules. / Your infrastructure." breather section.
- **Root cause**: `TypewriterLine` renders each character with `inView && !prefersReducedMotion ? "tw-char-reveal" : "tw-char-hidden"`. When `prefersReducedMotion` is true the condition is false forever, so every char keeps `tw-char-hidden`, which `globals.css:627` defines as `opacity: 0` with no animation to ever reveal it. The text is in the DOM (screen readers get it) but visually the whole section is a blank gradient. Same bug for the `pulseAfter` overlay (harmless there, it's decorative).
- **Impact**: The entire flagship headline of the section is invisible to reduced-motion users — the exact "animated section renders nothing" failure class other scans found in PulseGridDeck / Persona Matrix, reproduced inside the motion-infrastructure context itself.
- **Fix sketch**: When `prefersReducedMotion`, render chars with no class (or a `tw-char-static` with `opacity: 1`) so the end-state shows immediately: `inView && !prefersReducedMotion ? "tw-char-reveal" : prefersReducedMotion ? "" : "tw-char-hidden"`. Skip the `pulseAfter` overlay under reduced motion.

## 2. The gating contract has no "static end-state" affordance — "reduced motion = null" is the only expressible outcome
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: api-contract-gap
- **File**: `src/lib/animations.ts:10`
- **Scenario**: A developer builds any motion component and follows the documented contract ("When reduced motion is preferred, return `null`", lines 10–20, repeated for CSS/SVG components at line 20). QualityContext offers only `useQualityTier(): tier` and `useReducedMotionPreference(): boolean`; `useCanvasCompositor`/`useParticleLayer` offer only `enabled: false`.
- **Root cause**: The contract conflates two distinct cases: purely decorative ambience (orbs, particles — `null` is correct) and content-bearing animated components (typewriter headlines, animated dashboards) where reduced motion should mean "render the final frame statically". Neither the contract text nor any API primitive (e.g. a static-fallback slot, a `renderStatic` option on the compositor hooks) expresses the second case, so every consumer copies the `return null` pattern — which is exactly how PulseGridDeck, Persona Matrix, and finding #1 shipped empty sections.
- **Impact**: Systemic accessibility regression factory: each new animated component defaults to hiding content from reduced-motion users, and reviewers can point to the contract to justify it.
- **Fix sketch**: Amend the contract with rule 4: "components whose animation reveals CONTENT must render the end-state statically under reduced motion; only pure ambience may return null". Back it with an API affordance, e.g. `useCanvasCompositor(..., { staticFrame?: LayerRenderFn })` that draws one frame then stops, and/or a `<MotionOrStatic reduced={<StaticEndState/>}>` helper, so the right thing is as easy as the wrong thing. Extend the `custom-animation/require-animation-gating` lint to flag `return null` gates in components containing text/content nodes.

## 3. Quality-tier sampler mistakes rAF throttling for slow hardware and locks the downgrade in forever
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: happy-path-frame-sampling
- **File**: `src/contexts/QualityContext.tsx:55`
- **Scenario**: User opens the site in a background tab (middle-click), an occluded window, or on a laptop in battery-saver mode during the first 15 s. Browsers throttle rAF to ~30 fps or lower in these states (Firefox: 1 fps for hidden tabs), so every sampled frame delta is ≥33 ms.
- **Root cause**: The `tick` loop (lines 55–80) records raw `now - prev` deltas with no `document.hidden` / visibility guard and no outlier rejection, and evaluates p90 against `DOWNGRADE_MS = 20`. Throttled-but-idle frames look identical to genuinely slow frames, so the tier cascades high→medium→low (one tier per 120-sample window, two windows suffice) and then `SETTLE_TIMEOUT_MS = 15_000` sets `settledRef` — measurement stops permanently, with no re-evaluation path ever. The threshold constants are documented, but the assumption "sampling happens in a focused, unthrottled foreground tab" is nowhere recorded or enforced.
- **Impact**: Capable hardware gets permanently demoted to `low`: AmbientOrbs, TopoBackground, FloatingParticles, ParallaxAccents all return `null` for the rest of the session — a silently degraded page with no recovery and no way to notice in QA (it depends on how the tab was opened).
- **Fix sketch**: In `tick`, skip sample recording while `document.hidden` (and reset `lastFrameRef` on `visibilitychange`), discard deltas above a sanity ceiling (e.g. >250 ms = throttle/GC outlier, not sustained load), and only start the settle clock once N clean foreground samples exist. Optionally allow one re-measure window after a `low` verdict reached while throttling was detected.

## 4. Shared canvas loops die on `document.hidden` but nothing restarts them on tab return
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: uncovered-edge-case-visibility-resume
- **File**: `src/components/particle-host/particleHostRegistry.ts:57`
- **Scenario**: In a browser that throttles (rather than fully suspends) hidden-tab rAF — Firefox runs hidden tabs at ~1 fps — the user switches tabs and comes back. A throttled tick executes while `document.hidden === true`.
- **Root cause**: Both singleton loops (`particleHostRegistry.ts:57` and the sibling `useCanvasCompositor.ts:49`) bail out of `tick` with `rafId = 0` when `document.hidden`. The only restart paths are IntersectionObserver callbacks (`startLoop()` on intersection change) and new layer registration — neither fires when the tab merely becomes visible again. `usePageVisibility` exists precisely to broadcast this signal (it even drives the CSS `.page-hidden` pause), but neither compositor subscribes to it.
- **Impact**: After a tab switch, FloatingParticles, CinematicBreather's AmbientParticles, and every other registered canvas layer freeze on their last frame for the rest of the session, until the user happens to scroll a host fully out of view and back. Inconsistent, browser-dependent dead ambience.
- **Fix sketch**: In both modules, add a `visibilitychange` listener during mount (or subscribe to the `usePageVisibility` listener registry) that calls `startLoop()` when the document becomes visible and `anyInView()`; also reset `lastFrameTime`/`startTime` deltas across the gap so `delta`-driven `update` callbacks don't receive a multi-second jump.

## 5. ScrollMap: active state is color-only with no `aria-current`, and smooth scroll ignores reduced motion
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: scroll-nav-accessibility
- **File**: `src/components/ScrollMap.tsx:33`
- **Scenario**: A screen-reader or keyboard user tabs through the fixed right-edge scroll map; a reduced-motion user clicks any entry.
- **Root cause**: The active item is signalled only by `text-brand-cyan` + `scale-105` + a slightly longer gradient tick (lines 33–46) — no `aria-current="true"` (or `location`) on the active button, so assistive tech announces ten identical buttons with no indication of position. Separately, `scrollTo` (line 19) hard-codes `scrollIntoView({ behavior: "smooth" })`, animating a potentially full-page scroll for users who asked for reduced motion — the one component in the motion context that bypasses the gating system entirely (no `useReducedMotion` import).
- **Impact**: Non-visual users can't tell where they are on the page; low-vision users relying on more than hue get a subtle scale as the only cue; reduced-motion users get exactly the large-viewport animated movement the rest of the system carefully suppresses.
- **Fix sketch**: Add `aria-current={i === activeIndex ? "true" : undefined}` to each button and a non-color affordance on the active row (e.g. font-weight or a filled marker). Gate scroll behavior: `el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" })` using `useReducedMotion()` from framer-motion, consistent with every sibling component.
