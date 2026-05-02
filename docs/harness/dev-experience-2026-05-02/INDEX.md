# Dev Experience Engineer Scan — personas-web, 2026-05-02

> Audit of developer-experience friction across the **Marketing & Landing Pages** group.
> 4 parallel subagent runs, dispatched in a single wave.

---

## Totals

| | Critical | High | Medium | Low | **Total** |
|---|---:|---:|---:|---:|---:|
| Across 4 contexts | 1 | 12 | 22 | 8 | **43** |
| Share | 2.3% | 27.9% | 51.2% | 18.6% | 100% |

Counts verified two ways: (a) `> Total:` headers sum to 43, (b) `- **Severity**:` bullets count to 43. Match.

Files read across all subagents: ~117 (28 + 27 + 24 + 38 incl. cross-references).

---

## Per-context breakdown

| # | Context | Crit | High | Med | Low | Total | Report |
|---|---|---:|---:|---:|---:|---:|---|
| 1 | Landing Page Hero & Vision | 1 | 3 | 5 | 2 | 11 | [`landing-hero-vision.md`](./landing-hero-vision.md) |
| 2 | Conversion & Onboarding | 0 | 3 | 6 | 2 | 11 | [`conversion-onboarding.md`](./conversion-onboarding.md) |
| 3 | Platform Showcase | 0 | 3 | 6 | 2 | 11 | [`platform-showcase.md`](./platform-showcase.md) |
| 4 | Why Agents & Features | 0 | 3 | 5 | 2 | 10 | [`why-agents-features.md`](./why-agents-features.md) |

---

## Top-priority findings (all 1 critical + all 12 high) — one-line summary

Sorted into themes for triage. Each item links to its full entry in the per-context report.

### A. Dead code & phantom files
1. **Landing — Two Vision variants are dead code shipped in the bundle** — VisionGlobe + VisionHoneycomb (~17 files, ~600 LOC) orphaned; only Grid is wired. **CRITICAL**. [`landing-hero-vision.md#1`](./landing-hero-vision.md)
2. **Platform — PipelineShowcase is a 7-line alias for OrchestrationHub** — phantom file from old "Pipelines" naming; still referenced from homepage. [`platform-showcase.md#1`](./platform-showcase.md)
3. **Conversion — MidPageCTA.tsx referenced but missing on disk** — stale references somewhere; no git breadcrumb. [`conversion-onboarding.md#1`](./conversion-onboarding.md)

### B. Wrapper / re-export & lazy-loading sprawl
4. **Conversion — Three lazy-loading files (`LazySection`, `lazy`, `how-lazy`) overlap** — every "add lazy section" task forces a 5-min spelunk; SSR decisions inconsistent. [`conversion-onboarding.md#3`](./conversion-onboarding.md)

### C. Repetition — primitives waiting to be extracted
5. **Landing — `initialAgents` array byte-duplicated across two `data.ts` files** (Globe vs Honeycomb) plus duplicated `AgentData` type. [`landing-hero-vision.md#2`](./landing-hero-vision.md)
6. **Conversion — 5 step visuals share ~60% chrome with zero extracted primitives** (badge pill, list row, container). [`conversion-onboarding.md#4`](./conversion-onboarding.md)
7. **Why Agents — `GuideLink` type and `/guide/{cat}/{topic}` URL builder duplicated** across modules; AND `GuideLinks.tsx` uses Next `<Link>` instead of the project's `lib/guide-link.ts` helper — silent desktop-shell UX bug. [`why-agents-features.md#1`](./why-agents-features.md)
8. **Platform — Six Terminal* components siloed in `platform-command/`** despite `TerminalSim.tsx` already reinventing a blinking cursor inline. Belong in `primitives/terminal/`. [`platform-showcase.md#2`](./platform-showcase.md)

### D. Brand-theming holdouts (theme-correctness bugs)
9. **Platform — Layer styling dual-encoded as `rgb` strings + Tailwind class bundles** — every recolor is a 6-line edit per layer; light themes silently misrepresent. [`platform-showcase.md#3`](./platform-showcase.md)

### E. Cross-section UX contract violations
10. **Why Agents — Inline `<Link>` in GuideLinks bypasses desktop-routing contract** — feature-card guide links open in-webview while the rest open externally. Locale-of-build bug. [`why-agents-features.md#8`](./why-agents-features.md)

### F. Layout / positioning hardcoded values
11. **Landing — Hero badge has `ml-[500px]` that breaks at narrow widths** — visible visual bug below `lg`. [`landing-hero-vision.md#5`](./landing-hero-vision.md)

### G. Hook / state-machine fragility
12. **Why Agents — Hidden measure-pass renders 10 framer-motion subtrees forever** — each scenario × panel renders permanently for height measurement. [`why-agents-features.md#2`](./why-agents-features.md)

### H. Tooling / testability gaps
13. **Landing — No Storybook / preview route for live Vision components** — every visual review costs 10–20 minutes of code shuffling. [`landing-hero-vision.md#9`](./landing-hero-vision.md)

---

## Triage themes

11 themes detected by clustering finding categories + descriptions.

| # | Theme | Approx count | Why this is a wave, not just individual fixes |
|---|---|---:|---|
| 1 | Dead-code purge | 5 | One-shot deletion campaign; shrinks codebase ~600+ LOC before touching anything else; unblocks downstream cleanup |
| 2 | Wrapper / lazy-loading consolidation | 4 | Same set of files (`sections/*.tsx` shims + `lazy.tsx`/`how-lazy.tsx`) — touch them once |
| 3 | Brand-theming unification | 4 | Single mental model: migrate holdouts to `BRAND_VAR`/`tint()`; theme-correctness bug fix |
| 4 | Extract visual primitives | 5 | Repetition theme — same `<VisualBadge>`/`<VisualRow>`/`<HeroStatRow>`/`<GlowingStepCard>` pattern |
| 5 | Terminal primitives + cross-demo data shape | 2 | Promote 3 components to `primitives/terminal/`; touches 4+ sections in one sweep |
| 6 | Guide-link contract (desktop UX bug) | 2 | Silent bug; small but high-impact pair of fixes |
| 7 | Index-coupled / parallel-array fragility | 4 | Latent bugs from arrays paired by position instead of keyed |
| 8 | Hook hygiene + state-machine reducer extraction | 5 | Testability theme; pure refactor with optional unit tests |
| 9 | data.ts ↔ data.tsx convention | 4 | Move JSX out of data files; document the rule |
| 10 | Magic numbers, naming, file size | 4 | Smaller cleanups (`ml-[500px]`, `ProgressionThread`, `*Animated` suffix, EventBusShowcase god component) |
| 11 | Tooling — preview routes / Storybook | 1 | Single big-impact infrastructure add |

---

## Suggested next-phase split (7 waves)

Each wave is one focused session (5-7 fixes, single mental model). Order chosen so earlier waves shrink the surface area later waves work on.

### Wave 1 — Dead code purge ⭐ recommended first
**5 findings: 1 critical + 2 high + 2 medium**
- L1 (Critical): Delete VisionGlobe + VisionHoneycomb (~17 files, ~600 LOC) and `vision-shared/` if no other consumers
- P1 (High): Delete PipelineShowcase.tsx, rename `LazyPipelineShowcase` → `LazyOrchestrationHub`
- C1 (High): Resolve MidPageCTA.tsx phantom (build it, or delete refs)
- L4 (Medium): Delete `Vision.tsx` + `VisionGrid.tsx` wrappers; lazy.tsx imports `vision-grid` directly
- L3 (Medium): Delete two `AnimatedCounter.tsx` shim files; update FleetStatusBar import

**Why first**: Deletes ~600 LOC, removes phantom files, and dissolves several Wave 4/9 follow-ups (e.g. L7 — Vision data-shape inconsistency disappears once two variants are gone).

### Wave 2 — Kill the wrapper pattern + consolidate lazy-loading
**4 findings (touches ~22 files): 1 high + 3 medium**
- C3 (High): Collapse `LazySection.tsx` + `lazy.tsx` + `how-lazy.tsx` into one helper; remove trivial `LazyVision`/`LazyFAQ` wrapper functions
- W5 (Medium): Delete the 25 `sections/*.tsx` one-line re-export wrappers
- P4 (Medium): Same — wrapper-vs-index re-exports (overlap with W5; one cleanup)
- C2 (Medium): Same — Pricing.tsx + GetStarted.tsx shims (overlap with W5)

**Why second**: Touches the same set of files as Wave 1's lazy.tsx changes; do it now while context is warm. Net result: 25 files deleted, one canonical pattern, one documented decision tree for `ssr` flag.

### Wave 3 — Brand theming unification
**4 findings: 1 high + 3 medium**
- P3 (High): Migrate `platform-layers/data.tsx` from `rgb`+`tw` to `BRAND_VAR`/`tint()`
- C8 (Medium): Add `STATE_COLORS = { success, warning, error }` to brand-theme; replace `BRAND_VAR.emerald` hardcoding in WorkVisual
- C7 (Medium): Refactor DownloadCTA's hand-coded RGBA + index-keyed glow ternary into `<GlowingStepCard>` primitive using `tint()`
- W4 (Medium): Introduce shared `BrandAccent` + `BRAND_ACCENT_CLASSES` for cross-section icon styling (consolidates `features/types` + `ScenarioDuel` palettes)

**Why third**: Theme-correctness is a real bug (light-mode misrepresentation). Single mental model, no overlap with Waves 1-2.

### Wave 4 — Extract visual primitives (repetition cleanup)
**5 findings: 1 high + 4 medium-low**
- C4 (High): Extract `<VisualFrame>` + `<VisualBadge>` + `<VisualRow>` from the 5 step visuals
- C5 (Medium): Replace `STEP_BG_BY_NUMBER` map with template literal; extract `<ThemedBackgroundImage>`
- L10 (Low): Extract `<HeroStatRow>` from HeroClient (mobile + desktop dedup)
- W9 (Low): Add `staggerDelay()` / `nextDelay()` helpers to `lib/animations.ts`
- C7 spillover: complete `<GlowingStepCard>` extraction started in Wave 3

**Why fourth**: Pure repetition cleanup; no infrastructure dependencies; depends on Wave 3 brand-theme being in place.

### Wave 5 — Terminal primitives + guide-link contract
**4 findings: 2 high + 2 low**
- P2 (High): Promote `BlinkingCursor` + `TerminalLine` + `TerminalHistory` to `primitives/terminal/`; refactor `TerminalSim.tsx` to use them
- W1 (High): Add `GuideTopicRef` type + `guideHref()` builder to `lib/guide-link.ts`; refactor consumers
- W8 (High): Replace `<Link>` in `GuideLinks.tsx` with `openGuideLink(...)` from the existing helper
- P11 (Low): Define shared `TerminalOutputLine` type once Wave 5 primitives land

**Why fifth**: Two cross-cutting cleanups bundled because both touch the same kind of "scattered duplicates with a working helper sitting unused."

### Wave 6 — Index-coupled arrays + state-machine hygiene
**5 findings: 1 high + 4 medium**
- W2 (High): Extract `useMaxPanelHeight` hook in WhyAgents; portal-mount + ResizeObserver; un-render hidden subtree after measurement
- C6 (Medium): Move `STEP_ICONS`/`STEP_BRAND` into `TOUR_STEPS` (or add length assertion + Vitest)
- C10 (Medium): Replace `illustrations[i]` with `illustrations[item.illustrationKey]` Record
- W10 (Low): Add `entrance: "slideLeft"|"fadeUp"|"slideRight"` field on each Feature
- W6 (Medium): Remove `import { scenarios }` from leaf components; pass scenarios as props

**Why sixth**: All of these are latent bugs (silent index drift / closure pitfalls). Same mental model: replace position-coupling with explicit keys/props.

### Wave 7 — Hook hygiene + state-machine extraction
**5 findings: 0 high + 4 medium + 1 low**
- L8 (Medium): Refactor `useAgentTicker` to use `useRef` for the timer
- P7 (Medium): Extract `useTerminalSequence` reducer; add Vitest cycle test
- L6 (Medium): Either delete `void useReducedMotion()` or add the explanatory comment
- C9 (Low): Rename or restructure `useColumns()` to be honest about its semantics
- L11 (Low): Add JSDoc to `useId()` for SVG gradient IDs

**Why last in the recommended split**: Touches the trickiest code (state machines, hooks). Worth doing alone with full attention; testable wins.

### Optional Wave 8 — Data-convention + leftover polish (12 findings)
**Smaller items grouped for an opportunistic session**
- W3, P5, C11 — `data.ts` vs `data.tsx` rule; move `AUTO_ADVANCE_MS` to `lib/timings.ts`
- L5 — Hero badge `ml-[500px]` fix
- W7 — `ProgressionThread` magic-number constants
- P6 — Drop `*Animated.tsx` suffix
- P8 — `swarmFeatured` flag in tool catalogue
- P9 — Replace SwarmView SMIL with Framer Motion or extract `computeSwarmTiming`
- P10 — Split EventBusShowcase god component into `<VariantTabs>` + `<EventBusToggleHeader>`
- L7 — Resolved by Wave 1 (delete dead Vision variants); no work needed
- L9 — Add `/preview/[section]/[variant]` dev-only route (own infrastructure project)

---

## How this scan was run

- **Scanner prompt**: `agent_dev_experience_engineer` (Dev Experience Engineer, focus: developer productivity, tooling, codebase maintainability)
- **Date**: 2026-05-02
- **Project**: personas-web (`C:\Users\kazda\kiro\personas-web`, Next.js 15 + React 19 + Tailwind CSS)
- **Scope**: Marketing & Landing Pages group — 4 contexts (Landing Hero & Vision, Why Agents & Features, Conversion & Onboarding, Platform Showcase)
- **Side scope**: Frontend only (project has no `src-tauri/` — pure web)
- **Method**: 4 parallel general-purpose subagents, one per context, each given the DX Engineer role + full file list + findings target 6–15 + structured-markdown output spec
- **Wave size**: 4 (single wave; well under the max of 8)
- **Findings target**: 6–15 per context (actual: 10–11 per context)
- **Files read by subagents**: ~117 (28 + 27 + 24 + 38)
- **Pre-scan baseline**: 0 TS errors, 0 ESLint problems, no unit-test runner (Playwright e2e only)
- **Verification**: header-sum (`> Total: N`) and bullet-count (`- **Severity**:`) both yielded 43 — match
