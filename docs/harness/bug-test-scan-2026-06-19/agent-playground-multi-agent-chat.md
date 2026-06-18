# Agent Playground & Multi-Agent Chat — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 2, Medium: 2, Low: 1)

## 1. The only "playground" test exercises a different component — this context has zero coverage
- **Severity**: High
- **Lens**: test-mastery
- **Category**: coverage gap / wrong-target test (success theater)
- **File**: e2e/playground.spec.ts:1-47 (asserts against src/app/playground/*, not src/components/sections/agent-playground/*)
- **Scenario**: A maintainer changes `agent-playground/data.ts` or `index.tsx` (the components in THIS context, rendered on `/how`) and assumes the green "Playground Page" e2e suite protects them.
- **Root cause**: `e2e/playground.spec.ts` navigates to `/playground`, which is a wholly separate implementation (`src/app/playground/{data.ts,PromptSelector,TerminalSim}`) with different prompts ("Triage my inbox", "Draft release notes", "Research competitors" — 6 cards). THIS context's `AgentPlayground` ships only 4 examples ("Triage my Gmail", "Review this PR", "Summarize Slack", "Optimize my schedule") and is mounted on `/how` via `LazyAgentsChat`/lazy sections, which no e2e spec visits. The naming overlap makes the suite look like coverage when it covers nothing here.
- **Impact**: false-confidence test — both `agent-playground` and `agents-chat` sections (the auto-cycle, chip selection, simulation, race summary) are completely unverified; regressions ship silently.
- **Fix sketch**: Add an e2e spec that visits `/how`, scrolls the `#playground` and `#agents-chat` sections into view (they are lazy/`ssr:false`), clicks a chip, and asserts a `text-brand-emerald` "Done." line plus the "Resume auto-play" / "Auto-cycling" toggle appears.

## 2. No test guards the pure timeline merge/lane invariants that the whole Race Log relies on
- **Severity**: High
- **Lens**: test-mastery
- **Category**: untested pure module on a business-critical path
- **File**: src/components/sections/agents-chat/timeline-utils.ts:20-73
- **Scenario**: Someone edits `data.ts` timestamps (e.g. gives the agent a message at the same second as a workflow message, or an out-of-order `"0:11"` before `"0:08"`), or tweaks the sort comparator. The merged transcript silently renders in the wrong chronological order or draws lane terminators on the wrong row.
- **Root cause**: `parseClock`, `buildRaceRows` (stable chronological merge with workflow-first tie-break), `lastRowIndexOf`, `laneStateAt`, and `lastSeconds` are pure, deterministic, and fully LLM-test-generatable, yet there is no unit harness in the repo at all (Playwright e2e only). The "one clock · two systems" correctness claim is asserted nowhere. Note `parseClock("")` and malformed strings silently coerce to 0 via `Number(x) || 0`, which an invariant test should pin.
- **Impact**: false confidence / latent ordering corruption — the core selling visual ("agent finishes sooner") can invert with a data typo and nothing catches it.
- **Fix sketch**: Since there is no unit runner, either (a) stand up a tiny vitest harness and add a batch asserting `buildRaceRows` is sorted non-decreasing by `seconds`, ties keep `workflow` before `agent`, `laneStateAt` returns `end` exactly once per channel, and `parseClock` rejects/zeroes malformed input; or (b) add a dev-time `console.assert` that timestamps are monotonic per channel.

## 3. Auto-cycle never advances under reduced-motion, stranding the viewer on scenario 1
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: edge case / accessibility-conditional dead path
- **File**: src/components/sections/agents-chat/use-chat-sequence.ts:87-95
- **Scenario**: A user with `prefers-reduced-motion: reduce` (OS "reduce motion" on, common for vestibular/accessibility needs) loads `/how` and watches the comparison demo.
- **Root cause**: The cycle effect early-returns when `prefersReduced` is true (`if (paused || hovered || prefersReduced) return;`), so `setActiveIndex` is never scheduled. The scenario still animates once (interval drops to 200ms) and reaches satisfaction, then sits forever on "Ambiguous Request". The 3 other scenarios — including the strongest "Batch Recovery" zero-data-loss story — are only reachable by manual chip click, which is undiscoverable since the progress bar shows a static filled bar.
- **Impact**: UX degradation for reduced-motion users — they see only 1 of 4 marketing scenarios with no cue that more exist. The reduced-motion branch is also unverifiable today (no test mocks `useReducedMotion`).
- **Fix sketch**: When `prefersReduced`, still schedule the advance but with a longer static dwell (e.g. `cycleMs` clamped to a few seconds) instead of returning; keep the progress bar in its instant-filled state during the dwell.

## 4. `getScenarioCycleMs` is not derived from the actual reduced-motion interval, so cycle length can mismatch playback
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: timing / duplicated-constant drift
- **File**: src/components/sections/agents-chat/use-chat-sequence.ts:84-85 & data.ts:7-18
- **Scenario**: Reduced-motion is active (interval becomes 200ms in `playScenario` line 45) OR a future edit changes the interval in only one of the two places.
- **Root cause**: `playScenario` computes its own `interval` (`prefersReduced ? 200 : 800`) and reveals satisfaction at `maxMsgs*interval + 400`. `cycleMs` is computed separately by passing `interval` into `getScenarioCycleMs`, but the satisfaction *reveal-to-advance* spacing assumes the non-reduced cadence. The two are kept in sync only by hand; there is no shared single source and no test asserting `cycleMs >= time-of-last-reveal + dwell`. If they drift, the auto-cycle either cuts off the satisfaction badge before it is read or lingers on a blank end state.
- **Impact**: UX degradation / fragile timing — satisfaction summary can be clipped on advance; silent regression risk on any cadence edit. (Combined with finding 3, the reduced-motion path is doubly under-specified.)
- **Fix sketch**: Have `playScenario` return (or store in a ref) the actual scheduled `satisfactionAt` and advance the cycle off `satisfactionAt + SATISFACTION_DWELL_MS`, eliminating the parallel `getScenarioCycleMs` math; add an invariant test once a runner exists.

## 5. `StarRating` does not clamp score; out-of-range satisfaction renders nonsense with no guard
- **Severity**: Low
- **Lens**: test-mastery
- **Category**: validator/edge-case gap on a pure render helper
- **File**: src/components/sections/agents-chat/components/StarRating.tsx:18-39
- **Scenario**: A future scenario sets `satisfaction: 6` (or `0`, or a fractional value) in `data.ts`; the component is reused elsewhere with an arbitrary `score`.
- **Root cause**: `i < score` fills stars with no clamp to `[0, maxScore]`, and the `{score}/{maxScore}` label echoes the raw value. `score=6, maxScore=5` shows all 5 filled but reads "6/5"; a fractional score fills by truncation with no half-star. Current data (1/2/5) is safe, so the invariant is real but only latently violated — exactly the kind of pure component an LLM-generated assertion batch protects cheaply.
- **Impact**: minor UX/correctness — incorrect or contradictory rating display if data drifts; no test pins the `0 <= score <= maxScore` contract.
- **Fix sketch**: Clamp with `const filled = Math.max(0, Math.min(score, maxScore));` for both the fill loop and the label; add a unit assertion for boundary values (0, maxScore, >maxScore) when a runner is introduced.
