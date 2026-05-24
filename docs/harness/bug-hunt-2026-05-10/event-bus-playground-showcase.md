# Bug Hunter — Event Bus & Playground Showcase

> Total: 7 findings (Critical: 0, High: 3, Medium: 3, Low: 1)
> Scope: 16 files
> Date: 2026-05-10

---

## 1. Telemetry adapter resubscribes on every viewport toggle, leaking emits

- **Severity**: High
- **Category**: Race condition / Resource leak
- **File**: `src/components/sections/event-bus-showcase/index.tsx:39-43` (consumer of `src/lib/event-bus-demo.ts:73-100`)
- **Scenario**: User scrolls past the showcase section, `useInView({ once: false })` flips `inView` rapidly (e.g., via inertial scroll, scroll-snap, browser back). On every flip-on, the effect subscribes to a fresh `setInterval`. On flip-off, the cleanup runs `clearInterval`. But `subscribe()` calls `emit()` synchronously *before* installing the timer. Each subscribe therefore pushes a synchronous `setSnapshot(...)` immediately, plus restarts a new randomized interval. Repeated quickly, this fires snapshots in a tight burst that React batches into one render but re-randomizes route metrics every 200–400 ms instead of the intended 1300 ms.
- **Root cause**: The adapter's `subscribe` mixes a synchronous "kick" emit with an interval-based stream. Combined with `useInView(once:false)` on a tall section near a sticky/scroll-snap container, the effect dependency `[telemetryAdapter, inView]` causes resubscription churn. There is no debouncing of the subscription, no `document.visibilitychange` gating, and no reuse of the in-flight interval.
- **Impact**: Visual jitter (lane bars + latency badge re-randomize on every scroll bounce); CPU waste on low-power devices; possible stale-closure setSnapshot if the consumer ever stores the unsubscribe in a long-lived ref. Also, `current` (line 78) is captured per-subscribe — viewport-leave resets the random walk, breaking the perceived "live trend" of values.
- **Fix sketch**: (a) Subscribe once on mount regardless of `inView`, and gate *rendering* on `inView` instead. Or (b) keep effect but persist `current` outside `subscribe` and skip the synchronous `emit()` when re-subscribing, and add a small debounce (`setTimeout(..., 150)`) before resubscription. Also pause the interval when `document.hidden` is true.

---

## 2. setInterval/setTimeout pairs desynchronize when tab is backgrounded

- **Severity**: High
- **Category**: Latent failure / Animation lifecycle
- **File**: `src/components/sections/playground-split/use-playground-simulation.ts:62-113`; identical pattern in `src/components/sections/playground-timeline/use-pipeline-simulation.ts:74-115`
- **Scenario**: User clicks an example chip ("Triage my Gmail"), then switches browser tabs mid-run. Background tabs throttle `setTimeout` to ≥1000 ms and `setInterval` similarly. The tick interval (line 63) reads `Date.now() - startTime`, which is wall-clock truthful, so `elapsedMs` jumps to `TOTAL_DURATION_MS` on resume. Meanwhile the chained `setTimeout` calls for `parse → select → tool-* → execute → verify → result` are stretched and re-ordered by browser throttling. On return, the progress bar shows "complete" while flow nodes still flip from pending → active → done over several extra seconds. Worse, the final timeout (`stepIdx === sequence.length - 1`) clears `timerRef.current` and sets `phase: "done"`, but earlier active/done timeouts may *still be pending* and fire afterwards, briefly re-activating already-done nodes.
- **Root cause**: Mixing wall-clock-based `elapsedMs` with cumulative-`setTimeout`-based state transitions. No `document.visibilitychange` listener pauses the simulation. No guard inside the `done` timeout to short-circuit later pending timeouts (they're cleared only via `clearAll`, which is never called when the run completes naturally — `timeoutsRef.current` keeps stale handles).
- **Impact**: Out-of-order node status flips ("Result" goes done → active → done), progress bar racing ahead of node animations, ghost activations after natural completion. Reproducible by tabbing away during a run.
- **Fix sketch**: After the final `t2` callback, clear `timeoutsRef.current` (filter out fired ids or just reset to `[]` — fired ones are no-ops). Drive `elapsedMs` from a counter rather than `Date.now()`, OR pause both the interval and any future `setTimeout` chain when `document.hidden` becomes true (using `requestAnimationFrame` or chained-timeout pattern instead of pre-scheduled timeouts). At minimum, on `visibilitychange → hidden`, call `handleReset` or freeze.

---

## 3. Module-level `invalidIdxReported` flag is permanently sticky across mounts and users

- **Severity**: Medium
- **Category**: Silent failure / Observability
- **File**: `src/components/sections/playground-split/use-playground-simulation.ts:14`; `src/components/sections/playground-timeline/use-pipeline-simulation.ts:8`
- **Scenario**: A bad `exampleIdx` is reported once (Sentry capture). For the rest of the page session — across remounts, navigation back to the page, and any other instance of the hook — the flag stays `true`, suppressing all subsequent invalid-idx reports. Because Next.js App Router preserves modules across client-side route transitions, this state never resets.
- **Root cause**: Top-of-file `let invalidIdxReported = false;` is intended as a per-error dedupe but has no scope (instance, session, or time-window) and no reset path. Same anti-pattern duplicated in the timeline hook.
- **Impact**: If a real bug starts feeding bad indices (e.g., race after `examples` shrinks via experiment flag), only the first occurrence is reported. Silent telemetry blackout.
- **Fix sketch**: Move the flag into a `useRef` so each hook instance gets one report. Or use a `Set<number>` of indices already reported. Or remove dedupe entirely and rely on Sentry's server-side rate limiting / fingerprinting.

---

## 4. `tool-merge` parent reference points to a node that never exists

- **Severity**: Medium
- **Category**: Latent failure / Dead reference
- **File**: `src/components/sections/playground-split/data.ts:160` (within `buildFlowNodes`)
- **Scenario**: The `execute` flow node is built with `parentId: "tool-merge"`, but no node with id `tool-merge` is ever pushed. Currently `AgentMindPanel.computeEdges` does not consult `parentId` (it hand-wires edges by name), so the bug is silent. The first developer who refactors `computeEdges` to use the structural `parentId` field — the obvious refactor target — will hit a broken graph: the `execute` node will have no incoming edge.
- **Root cause**: Refactoring artifact; `tool-merge` was likely a planned aggregator node that was inlined but the `parentId` string wasn't updated. Type system can't help — `parentId` is a free `string`.
- **Impact**: Dead reference; latent breakage on the next refactor that trusts `parentId`. Also misleading for anyone reading the data layer to understand graph structure.
- **Fix sketch**: Either (a) change to `parentId: "select"` to reflect that `execute` aggregates from the tool fan-out via the select layer, or (b) remove `parentId` for nodes whose edges are constructed manually, or (c) introduce a real `tool-merge` node and route tools through it.

---

## 5. `LanesView` particle x-animation 0%→2600% does not pause on viewport exit

- **Severity**: Medium
- **Category**: Animation lifecycle / Edge case
- **File**: `src/components/sections/event-bus-showcase/components/LanesView.tsx:72-77`
- **Scenario**: Each lane has a glowing dot animated with `animate={inView ? { x: ["0%", "2600%"] } : { x: "0%" }}` and `transition={{ repeat: inView ? Infinity : 0 }}`. When the user scrolls the section out of view and `inView` flips to false, framer-motion is told to animate to `x: "0%"` over the same duration (`2.8 + i*0.35`s) — which means the dot snaps back via a visible eased trip while the section is offscreen. The transition object is rebuilt on every render of the parent (`laneMetrics` array reference changes via `useMemo` whenever `snapshot.routes` reference changes — every 1.3 s), so framer-motion may interrupt and restart the keyframe animation mid-flight. Combined with finding #1, the result is dots that visibly jitter back and forth at random offsets when the user scrolls in/out.
- **Root cause**: (1) `transition` object is recreated each render; framer-motion does sequence equality on transitions but a fresh `repeat` flip can interrupt; (2) the "pause" path animates to 0% with a duration instead of using `animate={false}` or stopping in place; (3) `inView` and `snapshot` updates aren't decoupled.
- **Impact**: Visual stutter, perceived jankiness, wasted compositor work for animations the user can't see.
- **Fix sketch**: Use a stable transition object: `transition={inView ? RUNNING_TRANSITION_PER_INDEX[i] : { duration: 0 }}` and `animate={inView ? { x: ["0%", "2600%"] } : false}`. Or use CSS animation-play-state via a class toggle and let the GPU handle it. Also memoize `RUNNING_TRANSITION_PER_INDEX` outside the component.

---

## 6. AnimatePresence wrapping a conditional kills exit animation for "Selected Tools"

- **Severity**: Low
- **Category**: Animation lifecycle / Edge case
- **File**: `src/components/sections/playground-split/components/PromptEditorPanel.tsx:83-114`
- **Scenario**: `Selected Tools` is rendered inside `{activeExampleData && (<AnimatePresence>...<motion.div>...)`. When `activeExampleData` becomes `null` (Reset clicked), the entire `AnimatePresence` is unmounted in the same render — so framer-motion never sees an "exit" — the panel disappears instantly with no fade. The same issue exists for the inner `AnimatePresence` around the intent text (line 55) when phase transitions away from `running`/`done` (currently doesn't happen, but is a latent footgun if Reset semantics ever change to flip phase before clearing example data).
- **Root cause**: `AnimatePresence` only animates exit when its children unmount *while it remains mounted*. Wrapping it in a conditional `activeExampleData &&` defeats the mechanism.
- **Impact**: Reset feels abrupt; inconsistency vs. the entry animation. Cosmetic only.
- **Fix sketch**: Move the conditional inside `<AnimatePresence>`: `<AnimatePresence>{activeExampleData && <motion.div key="tools" ...>...}</AnimatePresence>`. The `AnimatePresence` itself stays mounted across the toggle.

---

## 7. `AgentMindPanel.svgHeight` derived from `Math.max(...nodes.map(...))` collapses on empty arrays via spread

- **Severity**: High
- **Category**: Latent failure / Edge case
- **File**: `src/components/sections/playground-split/components/AgentMindPanel.tsx:78-79`
- **Scenario**: The expression is guarded by `nodes.length > 0`, so this is safe today. But the sibling expression `svgWidth = 600` is fixed while `buildFlowNodes` lays out tool nodes at `toolStartX = centerX - ((toolCount - 1) * toolSpacing) / 2` with `centerX = 280`, `toolSpacing = 190`. With 4 tools, `toolStartX = 280 - 285 = -5` (already left-clipped); with 5 tools, `toolStartX = -100`, and the corresponding `<foreignObject x={node.x - 88} width={176}>` in `FlowNodeCard.tsx:43` lands at `x = -188`, fully outside the `viewBox="0 0 600 …"`. The node literally vanishes. Since `examples` data currently caps at 3 tools, this is a latent bug — anyone adding a 4-tool prompt silently loses node labels.
- **Root cause**: SVG `viewBox` width and node-layout geometry are independent constants with no validation. No `clamp` or auto-sizing. Same fragility holds for the right edge with 4+ tools (right-most foreignObject ends at `centerX + (toolCount-1)/2 * 190 + 88` which exceeds 600 at 4 tools).
- **Impact**: Silent visual regression the next time the marketing team adds an example with more tools — easy to miss because the node math is in `data.ts` while the viewport is in `AgentMindPanel.tsx`.
- **Fix sketch**: Compute `svgWidth` dynamically from node bounds: `const minX = Math.min(...nodes.map(n => n.x - 88)); const maxX = Math.max(...nodes.map(n => n.x + 88)); const svgWidth = Math.max(600, maxX - minX + 40);` and shift the viewBox accordingly (`viewBox={\`${minX-20} 0 ${svgWidth} ${svgHeight}\`}`). Or add a runtime warning when any node falls outside the fixed viewBox.

---

## Cross-cutting observations

- **No `document.visibilitychange` handling anywhere in the simulation hooks.** Both pipelines keep ticking when the tab is hidden (browser-throttled, but still drifting); the event-bus telemetry adapter does the same. Adding a single `useDocumentVisibility` hook + early-return in the interval callback would fix #1, #2, and #5 simultaneously.
- **`handleExampleClick` guard `if (isRunning) return;`** is correct but feels brittle — if the chip gains keyboard focus and Space is pressed during the click-to-running gap, the second invocation falls through. Consider disabling the chip via `disabled={isRunning}` (already done in `ThemedChip`, good) but also guarding inside `runSimulation` against re-entry by checking `timerRef.current !== null`.
- **`SyntaxPrompt.tsx:6-8`** — splitting on a regex with a capturing group correctly interleaves keywords and non-keywords, but produces empty `""` segments at string boundaries which render as empty `<span>`s. Harmless DOM noise; mention only because there are quite a few `key={i}` props that could shift if the regex ever changes.
