# Split & Pipeline Playground — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 2, Medium: 2, Low: 1)

Scope: `src/components/sections/playground-split/**` + `src/components/sections/playground-timeline/**` (19 files), plus `src/hooks/usePageVisibility.ts`, `src/app/page.tsx`, `e2e/playground.spec.ts`. Both sections render on the homepage (`playground-split` is gated/lazy in `lazy.tsx`; `playground-timeline` is its sibling). Prior bug-hunter-only scan (2026-05-10, `event-bus-playground-showcase.md`) is cross-referenced below; several findings were since fixed, several remain.

---

## 1. Pipeline-timeline simulation has NO backgrounded-tab abort — the exact desync the split hook was fixed to avoid
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: Animation lifecycle / latent failure / asymmetric regression
- **File**: src/components/sections/playground-timeline/use-pipeline-simulation.ts:33-118 (whole hook; contrast split hook lines 26,44-56,143-146)
- **Scenario**: User clicks a pipeline example ("Triage my Gmail"), then switches tabs mid-run. The hook schedules ALL stage `setTimeout`s up front from `startTime = Date.now()` and ticks `elapsedMs = Math.min(Date.now()-startTime, totalAdjusted)` on a 50ms interval. Background tabs throttle `setInterval`/`setTimeout` to ≥1s and reorder them. `elapsedMs` reads wall-clock so it jumps to `totalAdjusted` (progress bar → "pipeline complete"), while the chained stage `t1/t2` timeouts are still stretched/pending — on refocus the user sees a "done" footer while StageCards keep flipping locked→active→done, and late `t2`s can re-mark already-done stages.
- **Root cause**: The split hook was hardened (imports `usePageVisibility`, aborts on hidden in an effect, and `handleExampleClick` refuses to start when `document.hidden`) and the authors documented WHY in a comment. That fix was never ported to the timeline hook — it has no `usePageVisibility` import, no `visibilitychange` effect, and no hidden-tab guard in `handleExampleClick`. Same all-timers-up-front + wall-clock-tick shape, none of the mitigation.
- **Impact**: UX degradation on a homepage marketing demo — out-of-order stage flips, progress bar racing ahead of cards, "complete" shown over still-animating stages. Directly reproducible by tabbing away during a run; the split section right above it does NOT exhibit this, making the inconsistency obvious.
- **Fix sketch**: Mirror the split hook: add `const isHidden = usePageVisibility();`, an effect `if (isHidden && isRunning) { clearAll(); reset state to idle }`, and `if (typeof document !== "undefined" && document.hidden) return;` at the top of `handleExampleClick`/`handleReplay`.

## 2. Zero test coverage on both simulation state machines — the existing e2e tests a different page with different data
- **Severity**: High
- **Lens**: test-mastery
- **Category**: Risk-weighted coverage gap / business-critical path untested
- **File**: src/components/sections/playground-split/use-playground-simulation.ts:1-172 and src/components/sections/playground-timeline/use-pipeline-simulation.ts:1-163 (vs e2e/playground.spec.ts)
- **Scenario**: These two hooks are the engines of the homepage "watch the agent think / pipeline execute" demos. The only test, `e2e/playground.spec.ts`, navigates to `/playground` and asserts copy like "Triage my inbox" / "Draft release notes" — a SEPARATE page (`src/app/playground/data.ts`). The homepage sections use distinct data ("Triage my Gmail", `examples.length===4`) and are never exercised. There is no unit runner at all (only Playwright; no vitest/jest/testing-library in package.json), so the stateful logic — terminal-state guarantees, status sequencing, `elapsedMs` clamp, speed-multiplier math, `stageCount===0` short-circuit, invalid-index guard — has zero asserted invariants.
- **Root cause**: Coverage stops at a similarly-named page; the prior scan was bug-hunter-only so no test gate was ever proposed. Risk lives one layer above where tests stop (the timing/reducer layer), and an effect-driven `setTimeout` chain is exactly where regressions hide silently.
- **Impact**: False-confidence — a green suite while the actual homepage demos are untested; any future edit to either hook (e.g. porting finding #1's fix) can silently break monotonic progress, terminal `phase==="done"`, or `doneCount/totalStages` with nothing to catch it.
- **Fix sketch**: With no unit runner, the fastest real coverage is `renderHook` under fake timers — but absent that infra, add a Playwright spec that drives the HOMEPAGE sections: click a chip, assert progress is monotonic non-decreasing, that exactly `stages.length`/N nodes reach "done", that the footer ends "pipeline complete"/"execution complete", and that 2x finishes in ~half the wall time of 1x. Track adding a minimal `vitest` harness for the pure reducer math (`TOTAL_DURATION_MS`, `totalAdjusted = totalRaw/playbackSpeed`).

## 3. Module-level `invalidIdxReported` flag is process-sticky in both hooks — silent telemetry blackout
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: Silent failure / observability (carried from prior scan #3, still unfixed)
- **File**: src/components/sections/playground-split/use-playground-simulation.ts:15,66-75 and src/components/sections/playground-timeline/use-pipeline-simulation.ts:8,41-50
- **Scenario**: An out-of-range `exampleIdx` triggers one `captureExceptionScrubbed`, then sets a top-of-module `let invalidIdxReported = true`. Next.js App Router keeps client modules alive across route transitions and remounts, so the flag never resets for the rest of the session. If a real regression starts feeding bad indices (e.g. an A/B flag shrinks `examples` while a chip index is stale), only the very first occurrence is ever reported.
- **Root cause**: The dedupe guard has module scope with no instance/session/time-window and no reset path — shared across every hook instance and every user navigation within the SPA session.
- **Impact**: Telemetry blind spot precisely when a bad-index bug becomes systemic; the dashboard shows one stray event and goes quiet, masking severity.
- **Fix sketch**: Move the flag into a `useRef(false)` per hook instance, or drop the manual dedupe and rely on Sentry server-side fingerprinting/rate-limiting. A test asserting "second invalid index still reports" locks the invariant.

## 4. Flow-graph layout has hardcoded `svgWidth=600` and a dead `tool-merge` parentId — silent clipping on a 4th tool, with no bounds test
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: Latent layout invariant / dead reference (carried from prior scan #4 + #7, still unfixed)
- **File**: src/components/sections/playground-split/components/AgentMindPanel.tsx:77 and src/components/sections/playground-split/data.ts:135-161
- **Scenario**: `buildFlowNodes` lays tools at `toolStartX = 280 - ((toolCount-1)*190)/2`; `FlowNodeCard` renders each as `<foreignObject x={node.x-88} width={176}>`. With 4 tools the left-most foreignObject starts at x=-193 — fully left of the fixed `viewBox="0 0 600 …"`, so the node label silently vanishes. Data currently caps at 3 tools, so it's latent until marketing adds a 4-tool prompt. Separately, the `execute` node is built with `parentId: "tool-merge"`, but no `tool-merge` node is ever created; `computeEdges` hand-wires edges by id so it's silent today but breaks the moment anyone refactors `computeEdges` to trust `parentId`.
- **Root cause**: Node geometry (data.ts) and the SVG viewBox (AgentMindPanel) are independent constants with no shared bound or assertion; `parentId` is a free `string` the type system can't validate.
- **Impact**: A future data-only edit (adding a tool) produces an invisible-label regression that's easy to miss because the math lives in a different file than the viewport; and a future structural refactor inherits a broken edge.
- **Fix sketch**: Derive width from node bounds — `const minX = Math.min(...nodes.map(n=>n.x-88)), maxX = Math.max(...nodes.map(n=>n.x+88)); svgWidth = Math.max(600, maxX-minX+40)` and shift the viewBox; fix `parentId: "select"` (or drop it). Add a pure-function test over `buildFlowNodes` asserting every node's `[x-88, x+88]` stays within the rendered viewBox for tool counts 1..4.
## 5. `toggleSpeed` mid-run flips the displayed multiplier while the animation keeps the old speed
- **Severity**: Low
- **Lens**: bug-hunter
- **Category**: State desync / UX
- **File**: src/components/sections/playground-timeline/use-pipeline-simulation.ts:120-147 (toggleSpeed not gated by isRunning) + index.tsx:36-43
- **Scenario**: During a run the user taps the speed button. `toggleSpeed` is the only control NOT gated on `isRunning` (`handleExampleClick`/`handleReplay` are). `setSpeed` flips the label to "2x" immediately, but the in-flight timers, `totalDurationMs`, and the per-stage delays were all captured from the speed at `runSimulation` start. The animation and progress bar keep running at the old speed while the chip claims the new one; the change only takes effect on the next replay.
- **Root cause**: `speed` is read once into `playbackSpeed` at simulation start, but the control that mutates it stays interactive mid-run, so the label and the running animation diverge.
- **Impact**: Minor confusion — the "1x/2x" indicator lies about the speed of the currently-playing pipeline. Cosmetic; no data effect.
- **Fix sketch**: Either disable the speed button while `isRunning` (`disabled={isRunning}`), or recompute remaining timers when speed toggles mid-run; the cheap correct fix is gating it like the other controls.
