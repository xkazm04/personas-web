# Why Agents
> A homepage persuasion section that stages an auto-cycling "duel" — a brittle deterministic Workflow panel vs. a reasoning Personas Agent panel — across five hard scenarios. · **Route:** `/` (homepage section) · **Status:** Live

## What it does

"Why agents, not workflows" makes the core product argument on the marketing homepage. It frames the same business event (an incoming email/request) as a **scenario** and shows two side-by-side reactions:

- **Traditional Workflow** (left, rose/red) — a deterministic A→B→C pipeline of steps that each carry an `ok` / `warn` / `error` status, ending in a failure result (stuck in queue, escalated, partial deploy).
- **Personas Agent** (right, cyan) — a reasoning engine that emits *thoughts* (italic, brain icon), then *actions* (zap icon), ending in a green success result (resolved in seconds, zero data loss).

Five scenarios ship: *Unexpected Input*, *Edge Case*, *Multi-step Reasoning*, *Error Recovery*, *Context-dependent Decision*. They auto-cycle every 6s. A visitor can jump to any scenario via the top chip selector or the bottom progress-bar segments, and can pause/resume auto-play. Hovering the duel pauses it; selecting a chip latches it paused.

Above the duel, a **role switch** ("I am a Developer / Product Manager / Enterprise") swaps the tagline, subtitle, and three highlight chips so the pitch is re-framed per audience — without changing the scenario data itself.

## How it works

**Composition.** `WhyAgentsSection` is the client entry: it holds the `ViewerRole` state and renders the `RoleSelector` bar plus `<WhyAgents role={role}>`. `WhyAgents` (`index.tsx`) is the real section body and owns all cycle/measurement state.

**Role copy.** `index.tsx:20` picks `roleCopy[role]` (falling back to `defaultCopy` = the developer copy). The chosen `RoleCopy` (`tagline` / `subtitle` / `highlights[]`) is passed to `ScenarioHeader`, which cross-fades the tagline, subtitle, and highlight set on role change via keyed `AnimatePresence` blocks.

**Auto-cycle.** `useAutoCycle({ count: scenarios.length, intervalMs: CYCLE_MS })` (`index.tsx:21`) drives `activeIndex` through the five scenarios on a 6s `setInterval`, wrapping modulo `count`. It returns `{ active, setActive, paused, setPaused }`. `paused` is *derived* — true when hover/click set the internal pause flag **or** when `prefers-reduced-motion` is on (the hook reads `useReducedMotion()` and stops the interval entirely, `useAutoCycle.ts:61-64`). The interval is also skipped when `count <= 1`.

**Selection & pause wiring.**
- `ScenarioSelector` chips and `ScenarioProgress` segments both call `setActiveIndex(i)` then `setPaused(true)` — picking a scenario latches the cycle paused (`index.tsx:59-62`, `:104-107`).
- The duel container's `onMouseEnter`/`onMouseLeave` call `setPaused(true)` / `setPaused(false)` (`index.tsx:95-96`) — hover pauses, leaving resumes.
- `ScenarioProgress`'s "Auto-cycling / Resume auto-play" button toggles pause (`onTogglePause`).

**Progress indication.** `ScenarioProgress` renders one segment per scenario. The active segment animates a gradient bar from `0%`→`100%` width over `CYCLE_MS / 1000` seconds (linear) to telegraph the next switch; when paused it shows a full static bar; completed segments show a dim full bar. The bar's `key` includes `scenarioId`+`activeIndex` so the fill restarts each cycle.

**The duel panels.** `ScenarioDuel` lays out two `ComparisonCard`s in a 2-col grid (stacked on mobile, with a center arrow connector). Each card's body is a `memo`'d, `useMemo`'d child (`WorkflowContent` / `AgentContent`) keyed by `scenario.id` inside `AnimatePresence mode="wait"`, so switching scenarios cross-fades the panel content. `WorkflowPanel` maps `scenario.workflow.steps` to status-colored rows (error rows get a strikethrough) then a rose result block; `AgentPanel` maps `thoughts` then `actions` then an emerald result, each list staggered via `staggerDelay`/`nextDelay` from `@/lib/animations`.

**Height stabilization.** Scenarios have different step/thought counts, so the panels would jump height on switch. `index.tsx` renders a hidden, off-screen measurement subtree (`aria-hidden`, `opacity-0`, `-z-50`) containing *every* scenario's `WorkflowPanel` and `AgentPanel`, tagged `data-measure-wf` / `data-measure-ag`. `useMaxScrollHeight` (ResizeObserver-backed) reports the tallest of each; those `minHeight`s are applied to the visible panels so the duel reserves the worst-case height and never reflows on cycle (`index.tsx:30-36`, `:111-133`).

## Key files

| File | Role |
| --- | --- |
| `src/components/sections/why-agents/WhyAgentsSection.tsx` | Client entry; owns `ViewerRole` state, renders `RoleSelector` + `<WhyAgents>` |
| `src/components/sections/why-agents/index.tsx` | Section body; auto-cycle, hidden measurement subtree, "incoming scenario" banner, wires all subcomponents |
| `src/components/sections/why-agents/data.ts` | `scenarios[]` (5), `roleCopy`/`defaultCopy`, `CYCLE_MS = 6000` — all hardcoded English |
| `src/components/sections/why-agents/types.ts` | `Scenario`, `RoleCopy`, `RoleCopyMap` shapes |
| `src/components/sections/why-agents/components/ScenarioHeader.tsx` | Tagline / `<h2>` / subtitle / highlight chips; cross-fades on role change |
| `src/components/sections/why-agents/components/ScenarioSelector.tsx` | Top `ThemedChip` row to jump to a scenario |
| `src/components/sections/why-agents/components/ScenarioDuel.tsx` | 2-col layout of the two `ComparisonCard`s + center connector; memoized panel children |
| `src/components/sections/why-agents/components/WorkflowPanel.tsx` | Left panel: status-coded steps + rose failure result |
| `src/components/sections/why-agents/components/AgentPanel.tsx` | Right panel: thoughts → actions → emerald success result |
| `src/components/sections/why-agents/components/ComparisonCard.tsx` | Generic glass card shell (texture, orbs, grid, pulsing icon, reveal variant) |
| `src/components/sections/why-agents/components/ScenarioProgress.tsx` | Bottom progress segments + scenario count + pause/resume toggle |
| `src/components/RoleSelector.tsx` | Shared "I am a ___" role bar (also used on `/how`) |
| `src/hooks/useAutoCycle.ts` | Reusable interval-cycle hook with reduced-motion gating + pause |
| `src/hooks/useMaxScrollHeight.ts` | ResizeObserver max-`scrollHeight` measurement for panel height locking |

## Data & state
- **Source:** Static module data only. `scenarios` and `roleCopy` are literal arrays/objects in `data.ts` — no fetch, no Supabase, no orchestrator. `CYCLE_MS = 6000`.
- **Stores:** None (no Zustand). All state is component-local: `role` (`WhyAgentsSection`), `activeIndex`/`paused` via `useAutoCycle` (`index.tsx`), and the measured `minHeight`s via `useMaxScrollHeight`.
- **API routes:** None.
- **Types:** `Scenario` = `{ id, label, trigger, workflow: { steps: { text, status: "ok"|"warn"|"error" }[], result }, agent: { thoughts: string[], actions: string[], result } }`; `RoleCopy` = `{ tagline, subtitle, highlights: readonly string[] }`; `RoleCopyMap = Record<ViewerRole, RoleCopy>` where `ViewerRole = "developer" | "product-manager" | "enterprise"` (from `RoleSelector`).

## Integration points
- **Homepage mount.** Registered as `LazyWhyAgents` in `src/components/sections/lazy.tsx:143` (`createLazySection(..., SectionSkeleton, { ssr: false })`) and placed as the second homepage section in `src/app/page.tsx:50`, wrapped in `<LazyMount minHeight={640}>` (`gate: true`) so its chunk loads ~1 viewport before it scrolls into view. Section anchor `id="why-agents"`; the page-level `wrapperId` is unset, so this section has no scroll-map nav entry of its own.
- **`SectionWrapper`.** `index.tsx` renders inside `SectionWrapper` (`id="why-agents"`, `aria-roledescription="carousel"`), which is a `whileInView` `staggerContainer` that reveals children once (`viewport={{ once: true, margin: "-80px" }}`). Subcomponents that use `variants={fadeUp}` (selector, progress) inherit this one-shot reveal.
- **Shared primitives & libs.** `RoleSelector`, `ImageBackground`, `SectionWrapper`, `GradientText`, `ThemedChip` (`@/components/primitives`), and the `slideInLeft`/`slideInRight`/`fadeUp`/`fadeIn` variants + `staggerDelay`/`nextDelay` helpers from `src/lib/animations.ts`.
- **Use Cases.** In `context-map.json` this section is bundled into the **Use Cases** context (same homepage cluster); they are independent components and are documented separately. See [Use Cases](use-cases.md).

## Conventions & gotchas
- **i18n — NOT wired (real gap).** Despite the project's 14-locale lockstep rule, this entire section is **hardcoded English**. There is no `useTranslation()` / `t.*` access anywhere under `why-agents/`. Every scenario string in `data.ts` (triggers, steps, thoughts, actions, results), all role copy (taglines/subtitles/highlights), the `RoleSelector` labels ("Developer", "Product Manager", "Enterprise", "I am a"), and several in-JSX strings — `<h2>` "Why agents, not workflows" + "Personas Agent" / "Traditional Workflow" / "Reasoning engine" / "Deterministic pipeline" in `ScenarioDuel`, the "Incoming scenario" label in `index.tsx:78`, and the "Auto-cycling" / "Resume auto-play" / "Scenario N of M" labels in `ScenarioProgress` — are literal English. The `aria-label`s/`aria-roledescription` on the section, duel group, and progress buttons are English too. Localizing this section means lifting all of it into `src/i18n/en.ts` and hand-translating into the 13 other locales. Treat any new string added here as the same debt unless you also wire it through `t.*`.
- **Animation gating.** Reduced-motion is honored in three places: `useAutoCycle` stops the interval (`respectReducedMotion` default true), and `ComparisonCard` + `ScenarioDuel`'s memoized contents + `ScenarioHeader` each call `useReducedMotion()` and collapse motion (swap `slideIn*`→`fadeIn`, drop the looping icon pulse, set crossfade `duration: 0`). **Gap to note:** `WorkflowPanel`, `AgentPanel`, and `ScenarioProgress` do **not** call `useReducedMotion()` — their entrance staggers and the progress-bar fill still animate under reduced motion. These are lightweight opacity/transform fades (CSS-tier per the gating contract in `lib/animations.ts`), so the lint rule doesn't flag them, but the progress-bar width animation is a continuous motion that arguably should gate.
- **`paused` is derived, not stored.** `useAutoCycle` returns `paused = externalPause || internalPause || reducedMotion`. Don't try to read a raw boolean — reduced-motion users always report `paused: true`, which also makes `ScenarioProgress` render the static full bar instead of the animated fill.
- **Hover-pause vs. click-latch interaction.** Selecting a chip sets `setPaused(true)` and stays paused; but `onMouseLeave` of the duel sets `setPaused(false)`. So a mouse user who clicks a chip *inside* the duel and then moves the cursor out will resume auto-play. Intended, but worth knowing when debugging "why did it start cycling again".
- **Hidden measurement subtree is mandatory.** The off-screen subtree in `index.tsx:111-133` renders all 10 panels (5×workflow + 5×agent) purely to measure them. It's `aria-hidden` + `visibility:hidden` + `pointer-events-none` + `-z-50`. Removing it (or its `data-measure-*` attrs) makes the visible duel jump height on every scenario switch. `useMaxScrollHeight` is ResizeObserver-backed so heights stay correct after font-load and zoom.
- **Semantic tokens.** Cards use `border-glass`/`border-glass-hover`/`border-glass-strong`, `text-foreground`, `text-muted`/`text-muted-dark`, and `text-brand-*` (rose/cyan/purple/emerald/amber) with opacity modifiers. The data-driven status maps in `WorkflowPanel` are token-based; raw `rgba()` appears only in decorative `shadow`/grid backgrounds, not text.
- **React 19 purity.** No impure calls in render here — the cycle index is hook-owned and `useMaxScrollHeight` defers its `setState` to a fresh task to avoid ResizeObserver feedback loops. If you add time/random, follow the lazy-`useState` initializer pattern.
- **Keys restart animations on purpose.** `AnimatePresence` children are keyed by `scenario.id` (+ `-wf`/`-ag`/`-trigger`) and the progress fill by `scenarioId`+`activeIndex`. Changing those keys is how the cross-fade and bar-restart fire — don't "stabilize" them.

## Related docs
- [Use Cases](use-cases.md)
- [Homepage & Hero](homepage-hero.md)
- [Feature index](../INDEX.md)
