# Observability Deck & Security Vault — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. Reduced-motion users get a permanently dead deck that still claims "auto-refreshing"
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: reduced-motion-empty-state
- **File**: `src/components/feature-sections/observability-deck/variants/PulseGridDeck.tsx:38`
- **Scenario**: A visitor with `prefers-reduced-motion` scrolls to the "See everything, miss nothing" section. The `useEffect` bails with `if (reduced) return;`, so the simulated event interval never starts: every agent lane sits at "idle" with a dimmed dot, counts stay `0` / `$0.00`, sparklines render as dashed placeholder lines — yet the footer permanently reads "auto-refreshing" and TerminalChrome says "streaming".
- **Root cause**: Reduced-motion was implemented by disabling the data simulation entirely instead of disabling only the animations (pulse ping, AnimatePresence pop-ins). No static fallback dataset is substituted (the existing `baseActivity` seed in `data.ts` is not used here).
- **Impact**: The section's core value demo looks broken/empty for reduced-motion users, and the "streaming / auto-refreshing" copy is actively false — worse than showing nothing. This is the exact audience a11y settings are meant to serve.
- **Fix sketch**: Keep the interval running under reduced motion (state updates are not "motion") while gating only the animated bits — AgentLane already respects `useReducedMotion` for the ping. Alternatively, seed `stats` with a static snapshot (reuse/extend `baseActivity`) when `reduced` is true and change the footer label to "snapshot".

## 2. Module filter-prefix mapping is inconsistent: two tags share one filter and "Activity" filters reviews
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: ambiguous-filter-mapping
- **File**: `src/components/feature-sections/observability-deck/data.ts:107`
- **Scenario**: Click the "Executions" tag — both "Executions" AND "Analytics" light up as active, because `rightModules` "Analytics" reuses `filterPrefix: "execution"` (data.ts:121) and active state in `index.tsx` is `filterPrefix === m.filterPrefix`. Click "Activity" ("Live lanes across all personas") — the grid filters to `review.*` events only, showing mostly-empty lanes, because it maps to `filterPrefix: "review"`.
- **Root cause**: The tag→event-prefix mapping was assigned ad hoc with no recorded reasoning: "Activity" (described as all lanes) maps to the unrelated `review` prefix, and two semantically different modules share `execution`. There is no comment or type-level constraint tying `filterPrefix` to `EventType` prefixes.
- **Impact**: Confusing interactive behavior on the flagship observability demo — dual-highlighted tags and a filter whose label contradicts its result undermine the "see everything, miss nothing" promise.
- **Fix sketch**: Give each module a unique, semantically honest prefix (e.g. Activity → no filter / `null` meaning "all", Analytics → its own concept or remove its filter affordance), key active state by module identity rather than prefix, and type `filterPrefix` as a union derived from `EventType` prefixes with a one-line comment on intent.

## 3. Headline metric "96.2%" renders as "96%" — decimal silently dropped by a magic threshold
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: magic-number-formatting
- **File**: `src/components/feature-sections/observability-deck/components/AnimatedMetric.tsx:29`
- **Scenario**: The stats strip passes `target={96.2}` for "Success rate" (PulseGridDeck.tsx:90). `formatted = target >= 10 ? Math.round(value).toString() : value.toFixed(1)` rounds anything ≥ 10 to an integer, so the tween settles on "96%" — the authored `.2` never displays. Also, when reduced motion or not-in-view keeps the tween disabled, display precision depends on this same undocumented `>= 10` cutoff.
- **Root cause**: A magic threshold (`10`) conflates "big numbers don't need decimals" with the actual requirement (respect the precision of the authored target). No comment explains the rule, and the caller's data (96.2) contradicts it.
- **Impact**: The marketing number shown differs from the number the author specified; anyone tuning `data`/props to "96.2" will silently ship "96". Classic happy-path formatting bug.
- **Fix sketch**: Derive precision from the target itself — e.g. `const decimals = Number.isInteger(target) ? 0 : 1; value.toFixed(decimals)` — or accept an explicit `decimals` prop; document the rule in the props JSDoc.

## 4. Hardcoded white strokes/dividers break the pulse grid in light theme
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: theme-token-inconsistency
- **File**: `src/components/feature-sections/observability-deck/variants/pulse-grid-deck/Sparkline.tsx:17`
- **Scenario**: In light mode, the empty-state sparkline draws `stroke="rgba(255,255,255,0.12)"` — white at 12% on a light `bg-background/80` card, effectively invisible — and the metrics row uses `divide-white/[0.04]` (PulseGridDeck.tsx:89), a white hairline on a white card. The rest of the deck correctly uses `foreground/…` tokens and even ships explicit `dark:` shadow variants, so light theme is clearly supported.
- **Root cause**: Two spots were styled against an assumed dark background with raw white RGBA instead of the theme tokens used everywhere else in the same component tree.
- **Impact**: Light-theme users lose the "no data yet" affordance in sparklines and the column separators, making the deck look unfinished; inconsistent with the codebase's own token discipline.
- **Fix sketch**: Replace with theme-aware values — `stroke="currentColor"` plus a `text-foreground/15` class (or `var(--foreground)` with low opacity) for the dashed line, and `divide-foreground/[0.04]` to match the sibling `border-foreground/[0.04]` usages.

## 5. Dead `baseActivity` export and phantom ActivityFeed module — context map drifted from reality
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: dead-code-context-drift
- **File**: `src/components/feature-sections/observability-deck/data.ts:14`
- **Scenario**: `baseActivity` (3 hand-crafted `ActivityRow`s) is exported but consumed by nothing in the deck; its only plausible consumers — `components/ActivityFeed.tsx` and `useActivityFeed.ts`, both still listed in the context map for this area — do not exist on disk. `ActivityRow` in `types.ts` survives solely to type this orphaned constant, and `ObservabilityDeck.tsx` is now a one-line re-export shim.
- **Root cause**: The activity-feed variant was removed in favor of PulseGridDeck, but its seed data, row type, and context-map entries were never cleaned up; no note records that the feed was retired or why.
- **Impact**: Future contributors (and scanners) are pointed at files that don't exist and data that does nothing; the static seed rows also invite someone to "fix" reduced-motion emptiness by wiring stale data with mismatched shape (`ActivityRow` strings vs `Pulse` numbers).
- **Fix sketch**: Delete `baseActivity` and `ActivityRow` (or repurpose them as the reduced-motion static snapshot per finding 1, converting to `Pulse` shape), update the context map to drop the two phantom files, and add a one-line note in `data.ts` that PulseGridDeck superseded the activity feed.
