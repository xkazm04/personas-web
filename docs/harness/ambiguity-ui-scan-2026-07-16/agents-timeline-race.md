# Agent Execution Timeline Race — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. Mouse-leave silently cancels an explicit user Pause
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: hover-pause-overrides-explicit-pause
- **File**: `src/components/sections/agents-timeline/index.tsx:137`
- **Scenario**: User clicks the "Pause" control (TimelineControls, rendered *outside* the hover container), then moves the mouse across the race panel and out again. `onMouseLeave={() => setPaused(false)}` fires and resumes playback, undoing the explicit pause. Same single `paused` flag also means clicking a scenario chip (`setPaused(true)` at index.tsx:119/158) permanently kills auto-advance until the user discovers the Resume button.
- **Root cause**: One boolean conflates two distinct intents — transient hover-pause and sticky user-pause — with no recorded decision about which wins. Mouse-leave unconditionally writes `false`.
- **Impact**: Explicit user control is overridden by incidental mouse movement (a real logic bug), and chip selection produces a confusingly different sticky behavior than hover.
- **Fix sketch**: Track `hoverPaused` and `userPaused` separately; effective pause = `hoverPaused || userPaused`. Mouse-leave clears only `hoverPaused`; the Pause button toggles only `userPaused`. Decide (and comment) whether chip selection sets `userPaused`.

## 2. Scenario progress-bar buttons have no accessible name; race state is invisible to screen readers
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: a11y-unnamed-buttons-no-live-region
- **File**: `src/components/sections/agents-timeline/components/TimelineControls.tsx:26-48`
- **Scenario**: A screen-reader user tabs to the five segmented progress buttons: each contains only decorative divs, so all five announce as bare "button" with no indication of which scenario they select or which is active. The whole race (racing/complete status, FAILED/RESOLVED results, timers) also updates with zero `aria-live` or SR-only text, so nothing is announced when results land.
- **Root cause**: Buttons render a purely visual `<div>` bar with no `aria-label`/`aria-current`; result reveals rely entirely on visual `AnimatePresence` mounts.
- **Impact**: WCAG 4.1.2 (Name, Role, Value) failure on interactive controls plus an entirely visual-only outcome — the section's core message ("workflow FAILED, agent RESOLVED") is inaccessible.
- **Fix sketch**: Add `aria-label={`Play scenario ${i + 1}: ${s.name}`}` and `aria-current={i === activeIndex}` to each button; add a visually-hidden `aria-live="polite"` region in index.tsx that announces "Scenario N: workflow failed in Xs, agent resolved in Ys" when `showResults` flips true.

## 3. "Pause" freezes only the result reveal — the race animation and timers keep running
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: pause-does-not-pause-race
- **File**: `src/components/sections/agents-timeline/index.tsx:49-68`
- **Scenario**: User presses Pause (or hovers) mid-race. The banked-remainder effect correctly holds the results card, but `isPlaying` stays `true`, so RaceTimer's rAF loop (`RaceTimer.tsx:35-44`), the TimeCursor sweep, the progress underline, and the StepBlock stagger (all keyed off `isActive`/fixed framer transitions) run to completion. The race visibly finishes — timers hit their totals, all steps appear, the X/Check badge pops — while the UI claims "Pause" and status stays "racing" indefinitely until resume.
- **Root cause**: Pause state was wired only into the `setTimeout` that reveals results; the framer-motion animations and rAF timer have no pause pathway, and the comment at index.tsx:44-48 documents the result-timer fix without noting this remaining gap.
- **Impact**: Pause is a half-implemented control: a paused race that has visually finished but shows no results and a "racing" status reads as broken, especially since hover triggers this on every mouse-over.
- **Fix sketch**: Thread `paused` into TimelineRaceBody/Track/RaceTimer — stop the rAF loop banking elapsed time (mirror the raceStartRef/remainingRef pattern), and gate framer animations (e.g., pass `paused` and use time-based `animate` values, or simplest: treat pause as "hold current frame" via `transition={{ duration: 0 }}` snapshot or accept-and-document that hover only stops auto-advance and rename the control).

## 4. Per-step `durationMs` data is dead; animation runs on hardcoded 0.35s stagger and a fixed 4000ms constant
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: dead-duration-data-magic-numbers
- **File**: `src/components/sections/agents-timeline/components/StepBlock.tsx:56` (also `data.ts:3-4`, `Track.tsx:97`)
- **Scenario**: Every scenario carefully specifies `durationMs` per step and `totalMs` per track, but StepBlock ignores them entirely (`delay: index * 0.35`). Meanwhile the cursor/underline animate over `totalMs` and the results reveal after a flat `ANIMATION_DURATION_MS = 4000`. For the agent track (totalMs 1600-2000ms) the cursor finishes ~2s before results appear; a 5-step workflow finishes its stagger at ~1.75s while its cursor runs 3s — steps, cursor, timer, and reveal are four unsynchronized clocks.
- **Root cause**: Two generations of timing design coexist: data-driven durations in `data.ts` and hardcoded constants (`0.35`, `4000`, `CYCLE_MS 6000`) with no comment stating which is authoritative or why the per-step data is retained.
- **Impact**: Maintainers editing `durationMs` (the obvious knob) see no effect; the desync also means the "race" metaphor is visually loose — the winner's cursor idles at 100% for seconds. `CYCLE_MS - ANIMATION_DURATION_MS` leaves only ~2s to read the comparison before auto-advance.
- **Fix sketch**: Derive step delays from cumulative `durationMs` (scaled to `totalMs`), reveal each track's result at its own `totalMs`, and compute the cycle as `max(totalMs) + READ_TIME_MS`; or delete `durationMs` from the type and document that timing is uniform by design.

## 5. RaceTimer snaps back to 0.0s the instant the race completes
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: timer-resets-on-finish
- **File**: `src/components/sections/agents-timeline/components/RaceTimer.tsx:23-27`
- **Scenario**: When the result timeout fires, `isPlaying` flips false, and RaceTimer's effect immediately runs `setElapsed(0)`. Both track headers display "Time: 0.0s" during the entire results phase — exactly when the user is comparing times — while ComparisonSummary shows 3.0s vs 1.8s below, contradicting the tracks.
- **Root cause**: The `!isRunning` branch conflates "reset for a new run" with "run finished"; there is no terminal state that holds the final value.
- **Impact**: Momentary flash-to-zero looks glitchy and the per-track time disappears at the moment it matters; users may notice the timer never actually reaches the advertised total (it counts toward `totalMs` but is wiped at ~`ANIMATION_DURATION_MS`).
- **Fix sketch**: On stop, clamp to the final value (`setElapsed(durationMs)`) and only reset to 0 when a new run starts (e.g., key the reset off a `runId`/`raceKey` prop instead of `isRunning` going false).
