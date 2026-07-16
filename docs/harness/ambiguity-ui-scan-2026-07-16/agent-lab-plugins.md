# Agent Lab & Plugin Ecosystem — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Lab tab buttons have no accessible name on mobile
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: icon-only-button-no-accessible-name
- **File**: `src/components/feature-sections/lab/components/TabSwitcher.tsx:46`
- **Scenario**: Below the `sm` breakpoint the label is `hidden sm:inline`, leaving each of the four Lab tab buttons as icon-only. Lucide icons render `aria-hidden` SVGs, so the buttons expose an empty accessible name; a mobile screen-reader user hears "button, button, button, button" for the section's primary navigation. The group also uses `aria-pressed` toggles instead of tab semantics even though it drives a tab panel.
- **Root cause**: The responsive label-hiding was applied without a fallback name (`aria-label` or `sr-only` text), and the tablist pattern (`role="tablist"`/`role="tab"`/`aria-selected`) was skipped in favor of plain buttons.
- **Impact**: WCAG 4.1.2 (Name, Role, Value) failure on every mobile viewport for the Lab section's only navigation; assistive-tech users cannot tell Chat/Arena/Evolution/Eval apart or know which is active as a tab.
- **Fix sketch**: Add `aria-label={tab.label}` (or an `sr-only` span) to each button so the name survives label hiding; ideally convert the container to `role="tablist"` with `role="tab"`/`aria-selected` and `role="tabpanel"` on the switched content in `lab/index.tsx`. Same pattern applies to `PluginTabs.tsx` (which keeps visible labels, so only the tablist semantics apply there).

## 2. Active-tab glow is invalid CSS — the documented CSS-var + hex-alpha pitfall reintroduced
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: css-var-hex-alpha-invalid
- **File**: `src/components/feature-sections/lab/components/TabSwitcher.tsx:39`
- **Scenario**: `boxShadow: isActive ? \`0 0 20px ${tab.color}15\` : undefined` where `tab.color` comes from `BRAND_VAR` and is a CSS variable (`var(--brand-cyan)`). The concatenation produces `0 0 20px var(--brand-cyan)15`, which is invalid CSS — the browser drops the whole declaration, so the active Lab tab never gets its brand glow.
- **Root cause**: Hex-suffix alpha (`${color}15`) only works on literal hex values. `PluginTabs.tsx:41-44` contains a comment documenting exactly this pitfall and uses `color-mix(...)` correctly; `brand-theme.ts` even exports `tint()`/`glow()` helpers for it. TabSwitcher predates (or ignored) that fix.
- **Impact**: Silent visual defect: the per-tab colored glow that distinguishes the active Lab tab simply never renders, in every theme. Also a maintenance trap — the broken pattern sits one directory away from the comment warning about it.
- **Fix sketch**: Replace with the existing helper: `boxShadow: isActive ? glow(tab.key-color, 20, 15) : undefined`, or inline `color-mix(in srgb, ${tab.color} 8%, transparent)` as PluginTabs does. Consider storing `BrandKey` instead of the resolved var string in `TabDef` so `tint()`/`glow()` are directly usable.

## 3. ArenaTab timer choreography: dead cleanup inside setInterval, duplicated phase timers, and a scoreboard that spoils the round
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: undocumented-timer-choreography
- **File**: `src/components/feature-sections/lab/components/ArenaTab.tsx:29`
- **Scenario**: The interval callback (lines 29-34) schedules `setTimeout(() => setPhase("result"), 900)` and then `return () => clearTimeout(t)` — but a return value from a `setInterval` callback is ignored, so that cleanup is dead code and the timeout leaks on unmount mid-round. Meanwhile a second `useEffect` (lines 38-43) schedules another 900ms `setPhase("result")` for the same transition, so every round runs two competing timers that happen to be idempotent. Separately, the win tally loop (lines 46-49, `i <= currentRound`) counts the current round's winner during the "fighting" phase, so the footer scoreboard increments before the win/lose badges reveal the result.
- **Root cause**: Two mechanisms for the same phase transition were left in place with no comment saying which is authoritative, and the dead-cleanup idiom suggests the author believed the interval return was honored. The tally's off-by-one-phase is a happy-path oversight: it assumes the tally is only read after `result`.
- **Impact**: A leaked timeout can fire `setPhase` after unmount patterns change (currently masked because React tolerates it via the state setter on an unmounted component being cleaned by the outer effect only for the *last* round's timer). More concretely: the "fighting…" suspense is undermined every round because the running score already shows the outcome, and the next maintainer cannot tell which timer is load-bearing.
- **Fix sketch**: Delete the inner `setTimeout`/dead return from the interval and let the `[phase, currentRound]` effect own the fighting→result transition (it already has correct cleanup). Change the tally to `i < currentRound + (phase === "result" ? 1 : 0)` so the scoreboard updates at reveal time.

## 4. EvolutionTab header stats are hardcoded duplicates of data.ts, and the "best lineage" legend doesn't match the highlight heuristic
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: derived-values-hardcoded-and-magic-threshold
- **File**: `src/components/feature-sections/lab/components/EvolutionTab.tsx:80`
- **Scenario**: The header renders literal `Gen 5`, `Best 94`, `Lineage +52%` (lines 32-39) while the same facts live in `GENOME_NODES` in `lab/data.ts` — edit the dataset and the header silently lies. The branch highlight at line 80 uses `n.best || (n.alive && n.fitness > 80)` and paints matching edges amber, but the legend (line 148) labels amber "best lineage": the g3a→g4b-adjacent branches (g3b/g4b, fitness 79/85, not on the best lineage) get amber edges too. The `> 80` threshold is a magic number repeated at line 103 for node fill with a *different* meaning (emerald = high fitness).
- **Root cause**: Demo stats were typed by hand instead of derived, and a decorative "make more edges glow" heuristic was bolted onto the semantic `best` flag with no recorded rationale for the 80 cutoff.
- **Impact**: The diagram contradicts its own legend (amber edges that are not the best lineage), and any future tweak to `GENOME_NODES` desynchronizes header, tree, and legend in three places.
- **Fix sketch**: Derive header stats: `maxGen = Math.max(...map(n.gen))`, `best = nodes.find(n => n.best)`, lineage delta from root fitness. For edges, either highlight strictly the `best` ancestor chain (walk `parent` links from the `best` node) or rename the legend to "high-fitness branch"; hoist `80` into a named `HIGH_FITNESS_THRESHOLD` in `data.ts` used by both edge and node coloring.

## 5. Lab tab visuals hardcode dark-tuned hex colors, bypassing the theme-adaptive BRAND_VAR system the same feature already uses
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: hardcoded-hex-bypasses-brand-tokens
- **File**: `src/components/feature-sections/lab/components/ArenaTab.tsx:83`
- **Scenario**: `lab/data.ts` correctly uses `BRAND_VAR` (whose doc header warns hardcoded hex "only look right in dark themes"), but the tab bodies re-hardcode raw hex: ArenaTab `#06b6d4`/`#a855f7` (line 83), EvolutionTab `#f59e0b`/`#10b981`/`#06b6d4` plus fixed `#ffffff` node labels (lines 86-106), EvalTab `#10b981`/`rgba(16,185,129,…)` (lines 107-109). Unlike the plugin variants — which are deliberately wrapped in `force-dark` by `PluginCard.tsx:35` — the Lab tabs fully support light mode (TabBackdrop ships light variants, ChatTab uses `dark:` classes), so these dark-palette hexes render in light themes too.
- **Root cause**: The brand-token discipline was applied to the tab chrome (`data.ts`) but not to the SVG/score internals, likely because SVG attributes made string hex feel easier than CSS vars — though `stroke={BRAND_VAR.amber}` works identically.
- **Impact**: In light theme variants the Arena scores, genome tree, and eval radar keep dark-optimized saturation instead of the theme's calibrated tokens — visibly off-brand next to the correctly tokenized tab switcher — and a future palette change (the exact scenario `STATE_COLORS` was built for) misses these ~10 call sites.
- **Fix sketch**: Replace the literals with `BRAND_VAR.cyan/purple/amber/emerald` and `tint("emerald", 28)` for the radar fill (CSS vars are valid in SVG `fill`/`stroke`); for the Evolution node label use `fill="var(--background)"` instead of `#ffffff` so contrast holds on light themes.
