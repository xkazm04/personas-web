# Bug Hunter — Use Cases & Vision

> Total: 6 findings (Critical: 0, High: 2, Medium: 3, Low: 1)
> Scope: 12 files (in-scope) + 2 supporting hooks (`useConnectorPath`, `useToolSelection`)
> Date: 2026-05-10

## 1. ResizeObserver fires `updatePath()` against stale detail-card rect during AnimatePresence transitions
- **Severity**: high
- **Category**: race-condition
- **File**: `src/components/sections/use-cases/useConnectorPath.ts:68-75`
- **Scenario**: User rapidly clicks tools A → B (or autoplay advances). Both detail cards momentarily co-exist while `AnimatePresence mode="wait"` runs the exit animation of the old card. Any layout perturbation in that window (font load finishing, image lazy-load completing, scrollbar appearing) triggers the `ResizeObserver` callback, which calls `updatePath()` synchronously. `updatePath()` reads `detailCardRef.current.getBoundingClientRect()` — which still points at the *old* card mid-exit (or at a card animating to a different position). The connector SVG is then drawn to the wrong endpoint, and there is no subsequent layout event to correct it until the next manual resize.
- **Root cause**: The `setTimeout`-based path computation uses `selectionCycleRef` to guard against stale executions, but the `ResizeObserver` callback ignores that guard entirely. It assumes `detailCardRef.current` always represents the currently-selected tool, which is false during AnimatePresence exit windows.
- **Impact**: UX-degradation — users see a connector path snapping to a card that just unmounted, or terminating in empty space until the next resize.
- **Fix sketch**: Have the RO callback also consult `selectionCycleRef.current` and the AnimatePresence completion (e.g., set a `pathReady` ref that is true only after the `setTimeout` has fired for the current cycle). Skip `updatePath()` if `!pathReady.current`. Alternatively, key the `<motion.path>` on `selected` so it re-mounts cleanly with each tool change.

## 2. AgentArmyGrid simulation runs even when section is off-screen, and `flashTimers` leak across rapid prop changes
- **Severity**: high
- **Category**: cleanup-gap
- **File**: `src/components/sections/use-cases/components/AgentArmyGrid.tsx:15-49`
- **Scenario**: A user lands on a long marketing page, never scrolls down to the use-cases section, and leaves the tab open in the background. The `useEffect` runs on mount and starts the recursive 3–5 s scheduling loop indefinitely; every fire triggers `setAgents` + `setFlashIdx` re-renders + a 600 ms flash timer. Over hours, `agent.executions` (an unbounded counter) climbs into the hundreds of thousands purely off-screen. Separately, if `prefersReducedMotion` toggles (system preference change while tab is open), the effect tears down — but any `flashTimer` whose 600 ms callback is racing against the cleanup may still call `setFlashIdx(null)` post-cleanup, and on a fast cleanup the `flashTimers.delete(flashTimer)` line in the inner callback runs against a brand-new `flashTimers` Set from the next effect run, so the old timer's id is never removed and is never cleared by the next cleanup.
- **Root cause**: The simulation is unconditionally driven by mount, not by `whileInView`/IntersectionObserver. There is no idle-tab gating (no `document.hidden` check, no `requestIdleCallback`). Additionally, `flashTimers` is captured by closure inside the effect, so each effect run owns a separate Set — cleanup of run N can never see timers spawned by run N-1's pending callbacks.
- **Impact**: UX-degradation + battery drain on laptops/phones. Logged-in users who keep tabs pinned see CPU usage and re-renders forever.
- **Fix sketch**: Gate the scheduler on an IntersectionObserver or `whileInView`-driven flag — start scheduling only when the grid is visible, and pause when off-screen or `document.hidden`. Move `flashTimers` to a `useRef<Set>` so cleanup of a stale effect run can still cancel timers from prior runs.

## 3. "Healing" agents are permanently locked in healing state
- **Severity**: medium
- **Category**: state-corruption
- **File**: `src/components/sections/use-cases/components/AgentArmyGrid.tsx:28-30`
- **Scenario**: `Deploy Monitor` starts in `status: "healing"`. The flip-status branch is gated by `agent.status !== "healing"`, so a healing agent can never transition. Visitors who watch the demo for any length of time see one agent stuck in amber forever, while every other agent toggles between running and idle. Any future logic that flips an agent INTO healing (none today, but the asymmetric guard suggests it was intended) would similarly trap it.
- **Root cause**: One-way state machine: code can enter "healing" but not exit. The intent (healing means stuck) is defensible, but the visible "healing"-labelled dot with no recovery animation contradicts the marketing message ("Self-healing engine recovers from transient failures") on the same page.
- **Impact**: UX-degradation + brand-message inconsistency. The healing badge becomes a static label, undermining the self-healing claim.
- **Fix sketch**: Allow `healing → running` transition with a small probability (e.g. 10–15%) per tick, so the agent visibly recovers. Or, run a brief "healed" pulse and flip to `running` after some interval.

## 4. Mobile-detection breakpoint mismatch with Tailwind `md:`
- **Severity**: medium
- **Category**: edge-case
- **File**: `src/components/sections/use-cases/useToolSelection.ts:74`
- **Scenario**: On a viewport exactly 768px wide (e.g. iPad portrait, many tablet breakpoints), Tailwind's `md:` breakpoint activates desktop CSS while `matchMedia("(max-width: 767px)")` returns `false` for `isMobile`. That alignment is fine. But on a viewport between 767px and 768px (zoom factors, some Android devices reporting fractional widths, browser zoom + DPR combos), the JS-side `isMobile` and CSS-side desktop disagree: the JS picks `desktopButtonRefs` for keyboard/`focus()` and connector path computation, while DOM may have rendered the mobile carousel. Result: keyboard nav focuses a button that is `display:none`, and `connectorPath` reads coords from an off-screen element (`offsetParent === null` mostly catches this — but `getBoundingClientRect` on visibility:hidden returns 0,0,0,0).
- **Root cause**: Hard-coded `767px` doesn't match Tailwind's actual `md` token. There is no shared source of truth between Tailwind config and the JS breakpoint detector.
- **Impact**: Broken keyboard nav and missing connector on a narrow band of viewports / DPR combos.
- **Fix sketch**: Use `(min-width: 768px)` and invert the boolean (`isDesktop`), matching Tailwind's `md:` token exactly. Better, expose Tailwind's screens config via CSS custom properties or a constants module so JS and CSS can't drift.

## 5. `agent.name` used as React key — silent reconciliation collisions on duplicate names
- **Severity**: medium
- **Category**: state-corruption
- **File**: `src/components/sections/use-cases/components/AgentArmyGrid.tsx:69`
- **Scenario**: `key={agent.name}` is used for the agent grid. If `initialAgents` ever gains two agents with the same `name` (a plausible content edit — "Email Triage" appearing twice for two different connectors, or duplicated by mistake during data entry), React will reconcile both DOM nodes to the same key. The animation state (flash overlay, executions counter, `whileInView` reveal) of one collides with the other, the rate-bar `whileInView` may not replay correctly, and `flashIdx` highlights the wrong card.
- **Root cause**: `name` is treated as an identity field, but `AgentData` has no real ID. Names are display strings and can legitimately repeat.
- **Impact**: Visual glitches (flash on wrong card, missing reveal animations), hard-to-diagnose because dev-mode shows no key-collision warning until two collide.
- **Fix sketch**: Add an `id: string` field to `AgentData` (like the `Tool` interface already has) and use that as the key. Or, fall back to `agent.name + "-" + index` to guarantee uniqueness.

## 6. `useToolSelection` cancels and rebuilds the entire rAF loop on every auto-advance
- **Severity**: low
- **Category**: silent-failure
- **File**: `src/components/sections/use-cases/useToolSelection.ts:29-71`
- **Scenario**: The autoplay effect lists `selected` in its deps array. Every time the loop reaches `pct >= 1` and calls `advanceToNext()`, `selected` changes → effect cleanup runs (`cancelAnimationFrame`) → effect re-runs (`requestAnimationFrame`). The `visibilitychange` listener is also removed and re-added on every advance (every ~4 s). On a long page session this is dozens of add/remove cycles per minute, plus `rafStartRef.current = null` reassignments.
- **Root cause**: Including `selected` in deps was likely defensive (to "reset progress on selection change"), but the function only references `selected` indirectly through `advanceToNext` (which uses the functional-updater form). The actual reset is already handled by `setProgress(0)` inside `advanceToNext` and `handleManualClick`.
- **Impact**: Wasted work — extra DOM listener churn, more frequent state setters. Not user-visible today, but if any DevTools listener-leak detector runs, it'll see oscillating listener counts. Also makes profiling noisy.
- **Fix sketch**: Remove `selected` from the deps array. Use a ref (e.g. `selectedRef.current = selected`, kept in sync via a small effect) inside `frame` if selection-aware logic is needed. Confirm progress reset still works via `setProgress(0)` paths.
