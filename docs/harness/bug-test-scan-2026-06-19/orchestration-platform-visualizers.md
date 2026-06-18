# Orchestration & Platform Visualizers — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Pure telemetry-math module (event-bus-demo) has zero tests and no harness, despite driving user-facing counts
- **Severity**: High
- **Lens**: test-mastery
- **Category**: coverage gap on a business-critical pure module
- **File**: src/lib/event-bus-demo.ts:36-65
- **Scenario**: A seed or adapter snapshot arrives with a `NaN`, `Infinity`, or negative `queueDepth`/`latencyMs`/`throughputEps` (e.g. a future real adapter, or a regression in `clamp`), and the showcase header silently renders garbage like "NaN being sent · NaN waiting" or a wrong "Typical delivery time".
- **Root cause**: `withPressure`/`createSnapshot` encode real invariants (`inFlight = max(1, round(eps/10))`, `pressure ∈ [0,1]`, `totalInFlight`/`totalBacklog` are non-negative sums, `sanitizeNonNegative` coerces non-finite→0) but those invariants are asserted nowhere — the project has no unit runner, so the one genuinely testable, side-effect-free module in this context is completely uncovered. Playwright cannot meaningfully assert `pressure` clamping.
- **Impact**: false-confidence / latent silent-failure — the numbers shown to prospects in `TerminalChrome` ("X being sent · Y waiting", average latency) can drift wrong with no test to catch it.
- **Fix sketch**: When a unit runner is added, add a batch asserting: `withPressure` clamps `pressure` to [0,1] and floors `inFlight` at 1; `sanitizeNonNegative(NaN|−5|Infinity)===0`; `createSnapshot([])` gives `totalInFlight===0`/`totalBacklog===0`; sums equal the per-route reductions. Until then, document the gap in the test backlog.

## 2. Telemetry stream resets to seed values on every scroll-back into view
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: state-continuity / lifecycle gap
- **File**: src/components/sections/event-bus-showcase/index.tsx:39-43; src/lib/event-bus-demo.ts:78,97
- **Scenario**: User scrolls the event-bus section into view → `inView` true → effect subscribes, the mock walks `queueDepth`/`latency`/`eps` away from the seeds over time. User scrolls away → effect cleanup clears the interval (correct). User scrolls back → effect re-subscribes, but `subscribe` re-initializes `current = seedRoutes.map(...)` from scratch **and** fires a synchronous `emit()` immediately, so the "live" counters visibly snap back to the original seed numbers every single time the section re-enters the viewport.
- **Root cause**: The mock adapter holds its evolving `current` state in a closure created fresh inside each `subscribe()` call; the design assumes one subscribe per mount, but `inView` toggling makes subscribe/unsubscribe happen repeatedly, discarding accumulated stream state each cycle.
- **Impact**: UX degradation — undermines the "live message hub" illusion; numbers jump back to identical seeds on every scroll-back instead of continuing to drift.
- **Fix sketch**: Hold the evolving `current` routes outside `subscribe` (module/adapter-level), or have the showcase keep its own running snapshot and only re-arm the timer on re-entry; optionally skip the immediate `emit()` on re-subscribe.

## 3. Orchestration hub trigger nodes are keyboard-focusable but never appear in the tab order on first paint, and have no test
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: a11y/interaction correctness on an interactive demo
- **File**: src/components/sections/orchestration-hub/HubNode.tsx:36-49; src/components/sections/orchestration-hub/index.tsx:31-40
- **Scenario**: A keyboard user tabs to the hub. Each `<g role="button" tabIndex={0}>` is individually focusable (10 stops), but selection (`onClick`/Enter/Space → `handleSelect` → `pauseFor(TAP_PAUSE_MS)`) only pauses for `AUTO_CYCLE_MS*2` (~19.2s) then silently resumes auto-cycling. A user reading via keyboard has the active panel yanked out from under them mid-read once the pause lapses, with no way to pin it.
- **Root cause**: The design assumes hover (`onPointerEnter`) is the durable pause and tap is transient; but keyboard focus fires neither `pointerenter` nor a lasting pause, so focus does not suspend the cycle the way hover does — `useAutoCycle` is paused by `hovering` state only, and focus never sets it.
- **Impact**: UX degradation for keyboard/AT users — content shifts unexpectedly; the interactive promise ("Pick a trigger to see it fire") is unreliable without a mouse.
- **Fix sketch**: Treat `onFocus`/`onBlur` on the ring container like hover (`setHovering(true/false)`), or pause the cycle while any node has focus; add an e2e assertion that tabbing to a node and pressing Enter keeps that trigger's detail visible for >1 cycle.

## 4. Lane "delivery" dot travels a fixed 2600% transform that mismatches the lane width on most viewports
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: hardcoded geometry / responsive correctness
- **File**: src/components/sections/event-bus-showcase/components/LanesView.tsx:72-77
- **Scenario**: The animated delivery dot animates `x: ["0%", "2600%"]`. `2600%` is relative to the dot's own `w-2` (8px) box ≈ 208px of travel. The lane bar is full-width of a `max-w-3xl` panel (~600–700px on desktop, far less on mobile), so on desktop the dot stops ~30% across the lane and on narrow mobile it can overshoot past the lane's right edge.
- **Root cause**: Percentage on a `transform: translateX` resolves against the **animated element's own size**, not the parent lane — the magic `2600%` was hand-tuned for one width and does not scale with the responsive container.
- **Impact**: UX degradation — the core "message being delivered end-to-end" metaphor reads as broken (dot stalls mid-lane on desktop / flies off-edge on mobile) across the visualizer's main responsive range.
- **Fix sketch**: Animate the dot's container `left` from `0%`→`100%` (percentage of the lane) with a small negative margin for the dot radius, instead of a self-relative `translateX` percentage; or drive travel off a measured lane width.

## 5. Terminal sequence auto-restarts forever and runs typing/output timers even while scrolled out of view
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: lifecycle / runaway timer loop
- **File**: src/components/sections/platform-command/use-terminal-sequence.ts:84-90, 214-235
- **Scenario**: The CLI demo enters view, runs all 4 commands, shows the summary, waits 3s → `done`, waits 4s → `restart()` → `typing`. Crucially, after the **first** time the section is in view, the loop is self-sustaining via `restart()` and the `phase`-driven effects; `isInView` is only consulted for the very first `idle→typing` transition (line 85). Once started, the full type/output/summary/restart cycle runs perpetually with per-char and per-line `setTimeout`s firing forever, regardless of whether the section is on screen.
- **Root cause**: The state machine gates *entry* on `isInView` but never *re-checks* it; the design assumes the section stays roughly in view, so there is no pause-when-offscreen. Each restart re-arms dozens of timers indefinitely for the entire page lifetime.
- **Impact**: UX/perf degradation and battery drain — continuous timer churn + framer-motion re-renders on a section the user has scrolled past; on a long landing page this is permanent background work with no off-screen suspension.
- **Fix sketch**: Add an effect that, when `!isInView`, parks the machine (e.g. clear-and-hold in a `paused` phase or skip scheduling new timers) and resumes the cycle when it re-enters; reuse the existing `isInView` signal rather than only reading it once at idle.
