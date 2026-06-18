# Agent Execution Timeline Race — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. "Pause" / hover-pause never stops the actual race — only the progress bar and auto-advance
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: state machine / success-theater control
- **File**: src/components/sections/agents-timeline/index.tsx:26-54, 100-129
- **Scenario**: A user hovers the race card (`onMouseEnter` → `setPaused(true)`) or clicks the "Pause" control mid-race to study the animating steps. The race timer (`RaceTimer` rAF), the time cursor, and the step-reveal animations all keep running; the `resultTimerRef` still fires at `ANIMATION_DURATION_MS` and flips `isPlaying`→false / `showResults`→true. Only the auto-advance cycle and the thin progress bar are actually gated by `paused`.
- **Root cause**: `paused` is wired solely into the cycle effect (line 46) and the progress-bar render (TimelineControls). The race itself is driven by `isPlaying` + `resultTimerRef`, which have no knowledge of `paused`. The design assumes "pause = stop auto-advance," but the user-facing promise of the Pause button is "stop the race so I can look at it." There is no shared paused→race coupling and no elapsed-time accounting, so the running animation cannot be frozen or resumed.
- **Impact**: UX degradation on the flagship sales demo — the headline interactive ("see the agent win the race") cannot actually be paused; hovering to inspect does nothing to the animation and the result still slams in after 4s. The control is success-theater.
- **Fix sketch**: Gate the result timer on `paused` too: in `startAnimation` skip scheduling when `paused`, and add a `useEffect([paused])` that clears `resultTimerRef` when pausing and re-arms it for the remaining time on resume; pass `paused` into `Track`/`RaceTimer`/`TimeCursor` so `isRunning = isActive && !paused`.

## 2. Selecting a scenario restarts the race but the UI reports it as "Paused" — contradictory state
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: state corruption / UI/logic mismatch
- **File**: src/components/sections/agents-timeline/index.tsx:41-43, 83-93, 120-129
- **Scenario**: User clicks a scenario chip (or a TimelineControls segment). Both handlers do `setActiveIndex(i); setPaused(true)`. The `[activeIndex]` effect then fires `queueMicrotask(startAnimation)`, which sets `isPlaying=true` and re-arms the 4s result timer — i.e. the race visibly **starts/replays**. But `paused` is now `true`, so the controls render the "Resume" (Play) button and a static (non-animating) progress bar.
- **Root cause**: Two competing intents collide: selecting a scenario is meant to "pin" it (pause auto-advance), yet the `[activeIndex]` effect unconditionally restarts the animation regardless of `paused`. There is no single source of truth for "is the race running" — `isPlaying` and `paused` drift apart. The assumption that `paused` implies "nothing is animating" is false.
- **Impact**: UX degradation / confusing demo — the race animates while the control bar says it is paused and offers "Resume." Clicking "Resume" then does nothing visible to the already-finished race and silently re-enables auto-advance, so the scenario the user just pinned jumps away ~6s later.
- **Fix sketch**: Decide the semantics: either selecting a chip should NOT auto-restart the race (guard `startAnimation` with `if (paused && !manualReplay) return`), or selecting should clear `paused`. Drive the controls' play/pause label from `isPlaying`/a derived state, not raw `paused`.

## 3. Inline race timer snaps back to "Time: 0.0s" the instant results appear, instead of holding the final time
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: cleanup / stale display
- **File**: src/components/sections/agents-timeline/components/RaceTimer.tsx:23-46; index.tsx:31-34
- **Scenario**: At `ANIMATION_DURATION_MS` (4s) the parent sets `isPlaying=false`. `RaceTimer`'s effect re-runs with `isRunning=false` and executes `queueMicrotask(() => setElapsed(0))`, resetting the per-track "Time: X.Xs" readout to `0.0s` at the exact moment `ComparisonSummary` / `ResultCard` reveal the final totals. The header timer shows 0.0s while the summary shows e.g. 3.0s / 1.8s.
- **Root cause**: The timer treats "not running" as "reset to zero" rather than "freeze at final value." It also clamps to `durationMs = totalMs` (1.6–3.0s) while the parent runs `isPlaying` for a fixed 4s, so even before reset the timer sits frozen at `totalMs` for the last ~1–2.4s — and then zeroes. The display lifecycle is decoupled from the result lifecycle.
- **Impact**: UX degradation / undermines the comparison message — the moment that should emphasize "agent finished in 1.8s" instead blanks the running timers to 0.0s. Visible flicker on every cycle.
- **Fix sketch**: On `!isRunning`, freeze: `setElapsed(durationMs)` (or keep last value) rather than 0, and only reset to 0 when a NEW run begins (`isRunning` transitions false→true). Align `RaceTimer.durationMs` / `isRunning` window with the parent's 4s reveal so the count completes in sync.

## 4. Zero automated coverage for the flagship demo's timing state machine and pure summary math
- **Severity**: High
- **Lens**: test-mastery
- **Category**: risk-weighted coverage gap / missing quality gate
- **File**: src/components/sections/agents-timeline/index.tsx (whole), components/ComparisonSummary.tsx:62-77, data.ts
- **Scenario**: There is no unit harness in this repo (Playwright e2e only) and no e2e spec references this section (`grep "agents-timeline|agents-vs-workflows"` over `e2e/` → no hits). The intertwined timing logic (cycle vs result vs replay vs pause), the `% faster` computation, and the data invariants (every scenario must have workflow.totalMs > agent.totalMs and totalMs > 0 to avoid divide-by-zero/negative "faster") are entirely unguarded. Findings #1–#3 above all live in untested branches.
- **Root cause**: The "demo that sells the product" was shipped without any test gate; the pure, easily-testable pieces (`% faster` math, data shape invariants) and the deterministic state transitions were never separated from animation so they could be asserted.
- **Impact**: False confidence / regression risk on a business-critical conversion surface — a refactor of the timers (exactly the area with the bugs above) can silently break the demo with nothing failing in CI.
- **Fix sketch**: Add a Playwright spec asserting the visible state machine on the landing page: status chip `ready→racing→complete`, results appear, "X% faster" matches `round((wf-ag)/wf*100)`, pause stops progress, replay resets. Extract the `% faster` calc into a pure helper and add a tiny data-invariant assertion (loop scenarios: `totalMs>0`, `wf.totalMs>ag.totalMs`) runnable as a guard script even without a unit runner.

## 5. Background-tab rAF throttling clamps the timer to full duration while wall-clock timers flush queued advances
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: timing / clock-coherence
- **File**: src/components/sections/agents-timeline/components/RaceTimer.tsx:34-44; index.tsx:41-54
- **Scenario**: User backgrounds the tab during the loop. `requestAnimationFrame` is paused/throttled by the browser, so the race timer stops advancing, but the parent's `setTimeout`-based cycle (6s) and result (4s) timers continue on wall-clock. On refocus, the next rAF tick computes `Math.min(now - start, durationMs)` and instantly clamps to the full `durationMs`, and any cycle timer that elapsed while hidden immediately advances `activeIndex`, re-triggering `startAnimation` via the microtask — so the user returns to a jumped/half-jumped frame with a timer that "teleported" to its end.
- **Root cause**: Two clock sources (rAF for the timer, `setTimeout` for orchestration) drift independently when the tab is hidden; there is no `visibilitychange` handling to pause/resync the loop, and `startRef` is captured once at start so the clamp masks the lost frames.
- **Impact**: UX degradation — returning to the tab shows an inconsistent frame (timer at full value, steps possibly mid-reveal, scenario possibly skipped). Cosmetic but reproducible and on a high-traffic landing surface.
- **Fix sketch**: Add a `document.visibilitychange` listener that pauses/clears the cycle+result timers while hidden and restarts the current scenario cleanly on return; or drive everything from a single `performance.now()`-based loop so all phases share one clock.
