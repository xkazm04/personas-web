# Event Bus & Stream Monitoring — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 2, Low: 0)

Prior context: the 2026-05-10 critical fix (replayEvent counting the *attempt* up front rather than only successes toward the lockout) **STILL HOLDS** in the current code — `replayEvent` increments `retryCounts[event.id]` before the `await api.publishEvent` (eventStore.ts:158-168), so a permanently-broken handler trips `MAX_REPLAY_RETRIES` regardless of outcome, and `replayEvents` pre-filters locked events into `skipped` and trips a 5-consecutive-failure circuit breaker. That invariant is correct but **untested** — see findings 1 and 4.

## 1. Replay-lockout / circuit-breaker invariants have zero automated coverage (no unit harness)
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing quality gate / risk-weighted coverage gap
- **File**: src/stores/eventStore.ts:54-233 (no test exists anywhere; only Playwright e2e under e2e/*.spec.ts, none touch events)
- **Scenario**: A future refactor moves the `retryCounts` increment back inside the success branch (the exact 2026-05-10 regression), or flips the `>=` in `isReplayLocked`, or breaks `consecutiveFailures` reset — and nothing fails. "Retry All" silently regresses to pumping poison messages at the bus indefinitely.
- **Root cause**: The project has only `playwright test` (`@playwright/test`) — there is NO unit runner (no vitest/jest). The replay-lockout logic is pure, deterministic, and business-critical, but lives behind an async store with no harness to assert it. The single most expensive bug this module ever had has no regression test guarding it.
- **Impact**: false-confidence / latent re-introduction of a known critical — bus flooding, DLQ amplification.
- **Fix sketch**: Add a unit runner (vitest) and an LLM-generatable batch against the *exported pure helpers* `isReplayLocked`, `loadRetryCounts` (clamps non-finite/≤0/array), and `MAX_REPLAY_RETRIES`/`CIRCUIT_BREAKER_THRESHOLD`; then a store test asserting (a) attempt counts toward lockout even when `publishEvent` rejects, (b) `replayEvents` returns `skipped` for pre-locked and `aborted:true` after 5 consecutive failures.

## 2. "Retry All" discards the replay result — no feedback on failed / skipped / aborted
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: silent failure / UX degradation
- **File**: src/components/dashboard/EventsListPanel.tsx:77-84
- **Scenario**: User selects 30 failed events and clicks "Retry All". 12 are replay-locked (skipped), 8 fail, and the circuit breaker aborts the rest after 5 consecutive failures. The bar dismisses, selection clears — and the user sees *nothing*. They believe all 30 were retried.
- **Root cause**: `await replayEvents(selected)` throws away the `{ succeeded, failed, aborted, skipped }` return value entirely. The store was deliberately built to report these four outcomes (eventStore.ts:73, 232) but the caller ignores all of them — there is no toast/banner. The richer the store contract, the more misleading the silent drop.
- **Impact**: UX degradation on the money-path the prior critical was about — operators can't tell that poison events were locked out or that the breaker tripped, so they re-select and re-click, masking a real outage.
- **Fix sketch**: Capture the result and surface it: `const r = await replayEvents(selected); toast(\`Replayed ${r.succeeded}, failed ${r.failed}, skipped ${r.skipped}${r.aborted ? " — stopped after repeated failures" : ""}\`)`.

## 3. triggerBurst spawns particles while off-screen but tick is halted → unbounded particle backlog / burst on re-entry
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: animation/state leak / resource exhaustion
- **File**: src/components/dashboard/event-bus-visualization/useEventBusParticles.ts:54-80, 58-62
- **Scenario**: The visualization scrolls out of view (IntersectionObserver sets `inViewRef.current = false`, so `tick` early-returns at line 59-62 and stops the RAF loop). The user clicks "Test Flow" repeatedly (or `burstTrigger` increments) while the SVG is off-screen. Each burst schedules 12 `setTimeout` → `spawnParticle()` calls (line 55) that push onto `particlesRef.current` with **no in-view guard**. Nothing drains them because the tick loop is dead. When the user scrolls back, `updateParticles` advances the entire accumulated backlog at once.
- **Root cause**: `spawnParticle`/`spawnBurst` have no `inViewRef`/`document.hidden` gate — only `tick` does. Spawning and draining are gated by different conditions, so off-screen spawns accumulate without bound and replay in a burst on re-entry. The `triggerBurst` effect (line 78-80) also fires on the *initial* mount whenever `burstTrigger` arrives non-zero.
- **Impact**: UX degradation (frame-hitch / visual spam on scroll-back) and a slow unbounded array growth if the panel is left off-screen with periodic bursts.
- **Fix sketch**: Guard the spawn path: in `spawnParticle` `if (!inViewRef.current || document.hidden) return;` and in `spawnBurst` bail early on the same condition; optionally cap `particlesRef.current.length`.

## 4. useEventTopology BFS / star-hub connected-component logic is pure but untested
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: pure-function coverage gap
- **File**: src/hooks/useEventTopology.ts:8-58
- **Scenario**: A refactor to the star-hub optimization (line 31-37: "connect every child to the first child") or the `ids.has(sourceId)` guard breaks transitivity — two events that share a `sourceId` no longer land in the same component, so chain-highlight in the events table silently highlights the wrong rows. No test catches it.
- **Root cause**: The hook is a deterministic graph reducer (adjacency build + BFS over connected components) with a non-obvious invariant: "all events sharing a sourceId, plus the source event itself when present, form one component." It's exactly the kind of pure logic an LLM-generatable batch nails — but there's no runner, and an e2e test can't economically assert component membership.
- **Impact**: false-confidence / latent correctness regression in chain visualization.
- **Fix sketch**: Once a unit runner exists, assert: (a) two children of the same absent source still share a component (star-hub), (b) a present source joins its children, (c) disconnected singletons are absent from the result map, (d) a 3-event A→B,A→C chain yields one 3-member set.

## 5. Heartbeat interval can keep firing after the controller closes on upstream-done
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: stream lifecycle / minor resource leak
- **File**: src/app/api/events/stream/route.ts:80-116
- **Scenario**: Upstream completes normally (`reader.read()` returns `done:true`, line 101) and the loop `break`s. The `finally` clears the heartbeat and closes the controller — good. But if the 25s `setInterval` callback (line 83-89) fires in the narrow window *after* upstream-done but *before* the `finally` runs `clearInterval`, it `controller.enqueue` into a controller that the `break` path is about to close; the `try/catch` swallows it. More importantly, on the abort path `onAbort` cancels the reader and clears the interval, but if `reader.cancel()` rejects synchronously the interval is already cleared so this is benign — the residual risk is the enqueue-after-done race only.
- **Root cause**: The heartbeat timer's lifetime is coupled to the read loop's `finally`, not to a single authoritative "stream is closing" flag; teardown ordering between the timer tick and loop exit is not serialized.
- **Impact**: minor — a stray enqueue/exception caught by the existing `try/catch`; no leak beyond request lifetime because `finally` always clears the interval. Listed for completeness of the SSE-lifecycle lens.
- **Fix sketch**: Track a `let closed = false` set in both the `done` break and `onAbort`; guard the heartbeat body with `if (closed) return;` so a late tick never touches a closing controller.
