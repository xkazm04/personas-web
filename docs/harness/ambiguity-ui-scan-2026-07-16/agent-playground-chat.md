# Agent Playground & Multi-Agent Chat — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. Free-text prompt matching keys on a single label word, playing the wrong canned demo
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: brittle-keyword-matching
- **File**: `src/components/sections/agent-playground/index.tsx:80`
- **Scenario**: User types their own instruction, e.g. "Review my calendar and block focus time" or "Summarize my email inbox". `handleSubmit` matches by `inputValue.toLowerCase().includes(ex.label.toLowerCase().split(" ")[0])` — i.e. the first word of each chip label ("triage", "review", "summarize", "optimize"), anywhere in the string, first match wins.
- **Root cause**: Undocumented single-keyword heuristic. "Review my calendar" contains "review" → the GitHub PR-review simulation plays; "summarize my email" → the Slack digest demo. Even negations ("no need to review anything") trigger a demo. Nothing in code or copy records why first-word-of-label was chosen or what its known false-positive surface is.
- **Impact**: The flagship "type your own instruction" marketing moment confidently narrates a run that has nothing to do with what the visitor typed — worse than the honest `noMatchLines` fallback, and it undermines the "agent parses your intent" claim the section exists to sell.
- **Fix sketch**: Match against multiple intent keywords per example (e.g. `keywords: ["gmail", "email", "inbox", "triage"]` on `ExamplePrompt`), require a match against domain nouns rather than verbs, score all examples and require a clear winner, otherwise fall back to `noMatchLines`. Document the heuristic and its fallback contract in a comment.

## 2. Scenario progress-bar buttons have no accessible name
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: a11y-unnamed-controls
- **File**: `src/components/sections/agents-chat/components/ChatProgressBar.tsx:28`
- **Scenario**: A screen-reader or voice-control user tabs across the four scenario segments under the chat race. Each `<button>` contains only decorative `<div>`s (the progress track), no text and no `aria-label`.
- **Root cause**: The clickable progress segments were built as purely visual bars; nothing supplies an accessible name or state (WCAG 4.1.2 Name/Role/Value). Active/completed state is conveyed only via background gradient (1.4.1 use-of-color as well).
- **Impact**: Assistive tech announces four bare "button"s with no way to tell which scenario each selects or which is active; voice-control users cannot target them at all. The section's only non-hover navigation besides the chips is unusable.
- **Fix sketch**: Add `aria-label={`Play scenario ${i + 1}: ${s.name}`}` and `aria-current={i === activeIndex ? "true" : undefined}` to each segment button; give the pause toggle `aria-pressed={paused}`. Same pattern applies to `ExampleChips.tsx:18`, whose active state is also style-only (add `aria-pressed={active}`).

## 3. Reveal timing ignores the merged chronological order — rows expand in the middle of the "log"
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: timeline-reveal-order-mismatch
- **File**: `src/components/sections/agents-chat/use-chat-sequence.ts:47`
- **Scenario**: Watch the "Ambiguous Request" race. Rows are sorted by transcript `seconds` (`buildRaceRows`), but reveal gating fires per channel at a uniform `i * 800ms`. workflow-bot msg 3 (T+0:05, merged row 6) becomes visible at real tick 2, while agent-bot msg 4 (T+0:04, merged row 5 — directly above it) only appears at tick 3.
- **Root cause**: Two clocks disagree: visual order is driven by data timestamps, visibility by channel index × fixed interval. The mismatch is inherent whenever the two channels' timestamps interleave unevenly, which every scenario's data does.
- **Impact**: Lines expand in the middle of an already-rendered transcript, pushing earlier lines apart — visibly contradicting the "one clock · two systems" append-only log metaphor the component's own comments promise, and making the typing chips (both bots pulse in lockstep) narratively wrong.
- **Fix sketch**: Drive reveals from the merged rows: schedule one timer per `RaceRow` at `row.seconds * SCALE` (or row order × interval) and derive `wfVisibleCount`/`agVisibleCount` (and per-channel typing) from the last revealed row of each channel. Data already carries everything needed via `buildRaceRows`.

## 4. Lane geometry is a pixel-level invariant split across two files with no recorded contract
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: undocumented-layout-coupling
- **File**: `src/components/sections/agents-chat/components/ChatTimelineVariant.tsx:26`
- **Scenario**: `OriginRow` hard-codes fork-line x-positions `left-[10px]` / `left-[30px]` inside a `w-10` gutter, which must land exactly on the lane centers produced by `TimelineRow`'s two adjacent `w-5` `LaneCell`s (`left-1/2` of each 20px cell = 10px and 30px). `top-[30px]`, dot `top-[14px]`, terminal `top-[10px]`, and stub `h-[10px]` are similarly interlocked magic values.
- **Root cause**: The commit-graph alignment is a cross-file geometric invariant expressed as seven unrelated-looking arbitrary Tailwind values, with no comment or shared constant naming the relationship.
- **Impact**: Any future tweak (a third lane, wider gutter, larger dots, font-size change shifting row height) silently breaks the fork-line continuity — lines stop meeting the dots — and nothing tells the editor which numbers must move together.
- **Fix sketch**: Extract shared constants (e.g. `LANE_W = 20`, `LANE_X = (i) => i * LANE_W + LANE_W / 2`) or a small `laneGeometry.ts`, use them in both `OriginRow` and `LaneCell` via inline styles, and add one comment stating the invariant ("origin fork lines must align with LaneCell centers").

## 5. Playground locks all controls for the full run with no way to cancel
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: missing-interrupt-affordance
- **File**: `src/components/sections/agent-playground/components/PlaygroundForm.tsx:28`
- **Scenario**: Visitor clicks an example chip; for the next ~5–6.5s (cumulative `delay`s in `data.ts`) every control is disabled — chips (`disabled={isRunning}`), the input, and the submit button — and the Reset button is only rendered once `phase === "done"`.
- **Root cause**: The form models only three phases (idle/running/done) and maps "running" to blanket disablement; no stop/skip affordance exists even though `handleReset` (which clears timeouts) already implements everything a cancel needs.
- **Impact**: A visitor who picked the wrong example or wants to try their own prompt must sit through the whole simulated run; on a marketing page where attention is measured in seconds, a 6-second forced wait invites scroll-away. Keyboard users also lose focus context when the focused chip becomes disabled mid-run.
- **Fix sketch**: While running, render the secondary button as "Stop" wired to the existing `handleReset` (or a `handleStop` that keeps `inputValue`), instead of hiding it until done; optionally keep chips enabled so clicking another one restarts the simulation (`runSimulation` already calls `clearTimeouts`).
