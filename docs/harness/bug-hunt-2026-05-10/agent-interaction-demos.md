# Bug Hunter — Agent Interaction Demos

> Total: 7 findings (Critical: 0, High: 3, Medium: 3, Low: 1)
> Scope: 22 files
> Date: 2026-05-10

Scope covered: `agent-playground/` (5), `agents-chat/` (10), `agents-timeline/` (8 incl. `RaceTimer.tsx`).

---

## 1. `onMouseLeave` silently undoes the "permanent pause" set by chip clicks (timeline)

- **Severity**: High
- **Category**: Race condition / state coordination bug
- **File**: `src/components/sections/agents-timeline/index.tsx:85-95, 120-121`
- **Scenario**:
  1. User clicks a scenario chip while their mouse is over the section. The chip handler runs `setActiveIndex(i); setPaused(true)` (line 86-88) — intent: pause auto-cycle so the user can study the scenario they just picked.
  2. User then moves their mouse off the section.
  3. The outer container's `onMouseLeave={() => setPaused(false)}` (line 121) flips `paused` back to `false`.
  4. The cycle effect (line 46-55) re-runs, starts a 6 s timer, and auto-advances to the next scenario — defeating the "I just picked this one, stop cycling" intent.
- **Root cause**: A single `paused` boolean is being driven by two different concerns (user-explicit pause vs. hover-pause) without distinguishing them. `onMouseEnter`/`onMouseLeave` blindly overwrite the explicit-pause set by chip clicks and the `Pause` button.
- **Impact**: Users who click a chip to dwell on a scenario lose their selection within ~6 s of moving the mouse away. The Pause/Resume toggle in `TimelineControls` (line 197) is also clobbered the same way.
- **Fix sketch**: Mirror the `agents-chat` solution — keep two independent booleans: `paused` (explicit) and `hovered` (transient). Compute `isAutoCycleEnabled = !paused && !hovered && !prefersReduced`. Hover handlers only touch `hovered`; chips and the toggle button only touch `paused`.

---

## 2. Replay does not reset the autoplay cycle timer (timeline)

- **Severity**: High
- **Category**: Race condition / timer coordination bug
- **File**: `src/components/sections/agents-timeline/index.tsx:38-44, 46-55, 196`
- **Scenario**:
  1. Scenario change at `t=0` schedules autoplay timer for `CYCLE_MS=6000` ms (line 49-51) and animation timer for `ANIMATION_DURATION_MS=4000` ms (line 32-35).
  2. At `t=5500`, user clicks **Replay** (line 196 → `startAnimation()`).
  3. `startAnimation` clears the *animation* result timer and starts a new 4 s run, but it **does not** touch `cycleTimerRef`.
  4. At `t=6000` (just 500 ms into the replay) the cycle timer fires, `setActiveIndex(prev+1)` flips the scenario, and the user's Replay is cut off mid-flight.
- **Root cause**: The autoplay cycle effect is keyed on `activeIndex`, not on a manual replay tick. There is no way for `startAnimation` to ask the cycle to "reset its 6 s grace period".
- **Impact**: Pressing Replay near the end of a cycle is a coin flip — sometimes the user sees the replay, sometimes the scenario flips out from under them. Especially bad when the user is reading the result card.
- **Fix sketch**: Either (a) call `setPaused(true)` from Replay, requiring the user to resume; or (b) introduce a `replayKey` state and include it in the cycle effect's dependency array so each replay restarts the cycle clock; or (c) clear and re-arm `cycleTimerRef` directly inside `startAnimation`.

---

## 3. Late-firing timers leak state changes after `handleReset` (playground)

- **Severity**: High
- **Category**: Race condition / silent failure
- **File**: `src/components/sections/agent-playground/index.tsx:38-64, 94-101`
- **Scenario**:
  1. Simulation is running with a queue of `setTimeout`s (line 48-60).
  2. The OS dispatches the timer callback for line `N` and pushes it onto the JS task queue.
  3. **Before** that callback runs but **after** the OS has fired the timer, the user clicks Reset.
  4. `handleReset` calls `clearTimeouts()` (line 95) — but `clearTimeout` on an already-fired-but-not-yet-executed timer is a no-op (the spec only cancels timers that have not yet been scheduled to run).
  5. The pending callback runs: it appends `line` via `setVisibleLines((prev) => [...prev, line])` to the now-empty array, and if `i === lines.length - 1` was true it also fires `setIsRunning(false); setPhase("done")` (line 55-58).
- **Root cause**: No fence/version token guards the callback body. `clearTimeouts` only releases handles; it cannot revoke callbacks already on the microtask/task queue.
- **Impact**:
  - "Ghost" first line appears in an otherwise-cleared terminal (looks like a glitch).
  - `phase` can flip to `"done"` after Reset, showing the wrong footer chip ("execution complete") while `inputValue=""` — confusing and reproducible under jank/throttling.
- **Fix sketch**: Add `const runIdRef = useRef(0)` and increment it in `runSimulation` and `handleReset`. Capture `const myRun = ++runIdRef.current` at the top of `runSimulation`, and inside each timeout callback `if (runIdRef.current !== myRun) return;` before any `setState`.

---

## 4. Clicking the currently-active chat scenario chip does not replay it

- **Severity**: Medium
- **Category**: Latent failure / silent UX bug
- **File**: `src/components/sections/agents-chat/index.tsx:50-63`, `src/components/sections/agents-chat/use-chat-sequence.ts:80-82`
- **Scenario**:
  1. Auto-cycle finishes scenario 0; user wants to re-watch it from the beginning.
  2. User clicks the scenario-0 chip; handler runs `setActiveIndex(0); setPaused(true)`.
  3. `setActiveIndex(0)` is a same-value update — React bails out, **`activeIndex` does not change**.
  4. The play effect (line 80-82) is keyed on `[activeIndex, playScenario]`. Neither identity changed (`prefersReduced`, `clearAllTimers`, `activeIndex` all stable), so `playScenario` is not re-invoked.
  5. The chat panel stays frozen at the "completed" state with stars showing — the user's click appears to do nothing except pause.
- **Root cause**: Replay intent is conflated with selection intent. There is no `replayToken` to force re-run when the same scenario is re-selected. The same hazard exists in `agents-timeline` chip handler (`index.tsx:85-89`), but timeline at least has a separate Replay button to compensate; chat has none.
- **Impact**: Users cannot re-watch a chat comparison without first navigating away and back. Especially noticeable because the section's auto-cycle pauses on hover, so users hovering to read can't restart the now-frozen scenario.
- **Fix sketch**: Add a `replayKey` state in `useChatSequence` that increments on every selection/replay request; include it in the effect's deps; or expose a `replay()` method that calls `playScenario()` directly.

---

## 5. `AnimatePresence` keyed by array index causes exit/enter collisions on reset (playground)

- **Severity**: Medium
- **Category**: Edge case / animation glitch
- **File**: `src/components/sections/agent-playground/components/PlaygroundTerminal.tsx:30-43`
- **Scenario**:
  1. Run completes with 12 lines (keys `0..11`).
  2. User clicks Reset → `setVisibleLines([])`. AnimatePresence begins exit animations for keys `0..11`.
  3. Within the same tick or shortly after, user clicks an example chip → `runSimulation` fires; first timeout (delay 400 ms) calls `setVisibleLines([line0])`, mounting key `0` again.
  4. AnimatePresence sees key `0` simultaneously in "exiting" (old line) and "entering" (new line). framer-motion drops the new mount or stalls the exit, depending on timing.
- **Root cause**: `key={i}` (array index) is unstable across resets — the same key is re-used for semantically different content. Index keys in `AnimatePresence` are documented anti-pattern.
- **Impact**: Intermittent missing/skipped enter animations on the first one or two lines after a reset; rarely a stale line text remains visible briefly. Hard to reproduce but very visible when it happens (visual jank on a marketing demo).
- **Fix sketch**: Generate a stable key per scheduled line, e.g., include a run ID: `key={`${runId}-${i}`}` where `runId` increments per `runSimulation` call. Or key by content hash if lines are unique within a run.

---

## 6. Animation completion timing is decoupled from per-scenario `totalMs` (timeline)

- **Severity**: Medium
- **Category**: Latent UX bug / silent failure
- **File**: `src/components/sections/agents-timeline/index.tsx:27-36`, `data.ts:3-4`
- **Scenario**:
  1. `ANIMATION_DURATION_MS = 4000` is a single hard-coded constant.
  2. Per-scenario `totalMs` varies: workflow ranges 2300-3000 ms, agent 1600-2000 ms.
  3. For the "vip-discount" scenario (`workflow.totalMs=2300`, `agent.totalMs=1600`):
     - `RaceTimer` finishes counting at 2.3 s / 1.6 s.
     - `TimeCursor` finishes its `0%→100%` sweep at the same time.
     - `StepBlock` last-step animation completes around `4*0.35 + 0.35 = 1.75 s` (line 56 in `StepBlock.tsx`).
     - `ResultCard` does NOT appear until 4.0 s (driven by `ANIMATION_DURATION_MS`).
  4. User stares at a frozen track for ~2 seconds with nothing happening before the result appears.
- **Root cause**: `startAnimation` uses a single global duration instead of the maximum of `workflow.totalMs` and `agent.totalMs` (plus a small buffer). The data files define real per-scenario durations that the timing logic ignores.
- **Impact**: Marketing demo feels broken/laggy on faster scenarios. Also the autoplay `CYCLE_MS=6000` is then 2 s of result + 4 s — but for slower scenarios where `totalMs > 4000`, the cursor would *overshoot* visually past the steps before results appear (the framer-motion `transition.duration` for the cursor is `totalMs/1000`, while ResultCard waits 4 s — for `staging-env` with workflow.totalMs=3000 the cursor freezes at 100% for 1 s, which is fine, but the relationship is fragile).
- **Fix sketch**: Compute `const animMs = Math.max(scenario.workflow.totalMs, scenario.agent.totalMs) + 400` and pass that to the `setShowResults` timer. Also include `animMs` in `startAnimation`'s dependency closure (currently `[]` — see also finding #7).

---

## 7. `startAnimation`/`playScenario` `useCallback` closures freeze stale `scenario` references

- **Severity**: Medium
- **Category**: Stale closure / hook dependency
- **File**: `src/components/sections/agents-timeline/index.tsx:27-36`, `src/components/sections/agents-chat/use-chat-sequence.ts:34-78`
- **Scenario** (timeline):
  1. `startAnimation` is `useCallback(..., [])` — empty deps. It does not reference `scenario` directly today, so it appears safe.
  2. **However**, the natural fix for finding #6 is to read `scenarios[activeIndex].*.totalMs` inside `startAnimation`. Adding that read without expanding the dep array silently captures `activeIndex=0` forever — the autoplay then animates with the wrong duration starting at scenario 1.
  3. The same hazard exists in `playScenario` (`use-chat-sequence.ts:34-78`): deps are `[activeIndex, prefersReduced, clearAllTimers]`, but the callback closes over `scenarios[activeIndex]`. This works *today* because `activeIndex` is in the deps, but the hook fires inside `useEffect(() => queueMicrotask(() => playScenario()), [activeIndex, playScenario])` — under React 19 StrictMode, the effect runs twice on mount, scheduling two microtasks both pointing at the same `playScenario`. Both call `clearAllTimers` then `setWfVisibleCount(0)` etc. — currently idempotent, but if anyone adds non-idempotent logic (e.g., increment a counter, log an analytics event), it will double-fire silently.
- **Root cause**: Indirect effect → microtask → callback chains that lack a cleanup function. There is no way to cancel the queued microtask if `activeIndex` changes again before it runs, and no token to detect "I'm a stale invocation."
- **Impact**: Latent — a future refactor that adds analytics, sound effects, or non-idempotent state in either callback will silently fire twice in dev (StrictMode) and once-but-stale in prod under fast scenario switching.
- **Fix sketch**: Drop the `queueMicrotask` indirection (it's not needed — React already runs effects asynchronously after commit). Run `playScenario()`/`startAnimation()` directly in the effect body and return a cleanup that calls `clearAllTimers()` / clears `resultTimerRef`. Add an `aborted` flag captured in the effect closure; check it before `setState` calls in the timeout callbacks.

---

## Notes on what was checked but found clean

- `ChatComparisonSummary.tsx` — the `at(-1) ?? FALLBACK_TIMESTAMP` guard against empty messages is correctly in place.
- `RaceTimer.tsx` — `cancelAnimationFrame` cleanup pairs correctly with each effect run; `startRef.current = null` early-return path is safe.
- `ChatChannel.tsx` sticky-bottom logic — the `passive: true` scroll listener and ref-based `stickyBottomRef` correctly avoid stale closure problems on rapid `visibleCount` updates.
- `StarRating.tsx` — `score > maxScore` would render correctly (extra "filled" iterations clipped by `Array.from({length: maxScore})`); however `score < 0` would render all empty stars and show a negative number in the label. Not exercised by current data so omitted from findings.
