# Split & Pipeline Playground — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. Hash-prefixed keywords never highlight — `\b` cannot match before `#`
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: regex-word-boundary-bug
- **File**: `src/components/sections/playground-split/components/SyntaxPrompt.tsx:3`
- **Scenario**: Select "Review this PR" or "Summarize Slack" in the Agent Mind split view. The prompt is rendered through `SyntaxPrompt`, which highlights keywords via `/(\b(?:...|#142|...|#engineering|#product|...)\b)/gi`. In "Review PR #142 ..." the character before `#` is a space; both space and `#` are non-word characters, so `\b#` can never match. `#142`, `#engineering`, and `#product` are silently never highlighted — in the Slack example both channel names (the entire point of the prompt) render as plain muted text while generic words like "channels" light up.
- **Root cause**: `\b` asserts a word/non-word transition; `#` is a non-word char, so a leading `\b` before a `#`-prefixed token is unsatisfiable after whitespace. The keyword list also exists in three copies: the split regex + `KEYWORD_TEST` in `SyntaxPrompt.tsx:3,7` and a dead export `SYNTAX_KEYWORDS` in `data.ts:199` that nothing imports — so a fix applied to one copy will drift.
- **Impact**: The "syntax highlighting" demo — a feature-showcase moment on a marketing site — visibly fails to recognize the most distinctive tokens in 2 of 4 examples, undercutting the "agent parses your intent" story.
- **Fix sketch**: Replace the bare `\b` framing with an alternation that handles `#`-tokens explicitly, e.g. `/((?:#[\w-]+|\b(?:inbox|draft|...|next week)\b))/gi` (or `(?<=\s|^)#142` lookbehind). Consolidate to a single exported `SYNTAX_KEYWORDS` source in `data.ts`, derive both the split pattern and the membership test from it, and delete the two inline copies. Ideally derive keywords per-example from data instead of one global list.

## 2. Pipeline timeline lacks the hidden-tab guard its sibling documents as essential
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: inconsistent-visibility-handling
- **File**: `src/components/sections/playground-timeline/use-pipeline-simulation.ts:33`
- **Scenario**: Start a pipeline run, switch tabs for a few seconds, come back. All stage timeouts were scheduled up front; on hidden tabs browsers throttle/clump timers unpredictably, so the user returns to a finished (or visually desynced) timeline they never watched — the 50 ms elapsed-clock interval is also throttled to ~1 Hz, so the footer clock and the progress bar disagree with stage states mid-run.
- **Root cause**: `use-playground-simulation.ts:39-56,146` (the split view, same file shape, same all-timers-up-front pattern) explicitly cancels on `usePageVisibility()` and refuses to start against a hidden tab, with a comment declaring that throttling makes this pattern unreliable. The timeline hook was written/extracted without porting that decision — no recorded reason for the divergence, so it reads as an accident, not a choice.
- **Impact**: One of two adjacent, near-identical simulations degrades on tab-switch while the other recovers cleanly; "done already?" surprise plus mismatched clock/stage state during throttling.
- **Fix sketch**: Port the split hook's two guards: `usePageVisibility()` effect that calls `clearAll()` + resets to idle when hidden while running, and the `document.hidden` early-return in `handleExampleClick` (and `handleReplay`). If the divergence is intentional, record why in a comment mirroring the split hook's.

## 3. Simulation state is invisible to assistive tech — unnamed progressbars, no live announcements
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: a11y-status-announcement
- **File**: `src/components/sections/playground-split/index.tsx:133-139`
- **Scenario**: A screen-reader user activates an example chip. Both sections drive a ~4 s multi-stage animation, but nothing is announced: the `role="progressbar"` elements (split `index.tsx:136`, timeline `PipelineProgressBar.tsx:17`) have `aria-valuenow` but no accessible name (fails WCAG 4.1.2 — SR reads a nameless "progress bar"), and phase transitions ("Executing...", "execution complete", "Stage 3 of 7", the Result capabilities panel appearing) are plain visual text with no `aria-live` region. The timeline speed toggle (`ExampleSelector.tsx:50`) is a toggle button announced only as "1x" with no `aria-pressed` or label explaining what it controls.
- **Root cause**: Status UI was built as visual-only motion elements; no live region or naming pass was done on either playground.
- **Impact**: Non-visual users click a chip, all chips become disabled, and from their perspective nothing happens until (maybe) they re-explore the DOM — the two flagship interactive demos are effectively inert for them.
- **Fix sketch**: Add `aria-label="Simulation progress"` to both progressbars; add one visually-hidden `aria-live="polite"` element per section announcing phase changes ("Running simulation", "Execution complete — results available", timeline: "Stage N of M: <label>", throttled); give the speed button `aria-pressed={speed === 2}` and `aria-label={\`Playback speed ${speed}x\`}`.

## 4. Hardcoded stage `timing` strings contradict the clock at 2x speed and are hand-synced to `duration`
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: derived-data-hand-maintained
- **File**: `src/components/sections/playground-timeline/data.ts:23-29`
- **Scenario**: Toggle speed to 2x and run any example. The footer clock (`PipelinePanelFooter`) counts real elapsed time and finishes at ~1.9s, but every `StageCard` still shows its 1x-timeline stamp (`+3.6s` on the last card) — the cards claim the pipeline took twice as long as the visible clock says. Independently, each `timing` string is a hand-computed cumulative sum of the preceding `duration` values (currently consistent across all 28 stages); editing any `duration` silently invalidates every stamp after it with no check.
- **Root cause**: `timing` is stored as a display string duplicating information derivable from `duration`, and `StageCard.tsx:114` renders it verbatim with no awareness of `speedMultiplier` (`use-pipeline-simulation.ts:69`).
- **Impact**: Visible numeric self-contradiction in the 2x mode the UI explicitly offers; latent drift trap for anyone tuning stage durations.
- **Fix sketch**: Drop `timing` from `TimelineStage` and compute it: cumulative offset = sum of prior `duration`s, divided by playback speed, formatted `+X.Xs` at render time (pass `speed` down or precompute in the hook). If keeping the literal strings, add a dev-time assertion/unit test that recomputes and compares them.

## 5. Split view re-inlines the progress bar and footer that the timeline already extracted
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: component-duplication
- **File**: `src/components/sections/playground-split/index.tsx:77-164`
- **Scenario**: Any style or behavior tweak to the run-status chrome must be made twice. The timeline section extracted `PipelineProgressBar` and `PipelinePanelFooter`, but the split section carries byte-for-byte-similar inline JSX: the same 1px gradient progressbar with pulsing dot (split `index.tsx:133-163` vs `PipelineProgressBar.tsx`, differing only in dot size 2.5 vs 3 and shadow radius — an unexplained inconsistency in itself) and the same Clock/Hourglass elapsed/remaining footer (split `index.tsx:78-130` vs `PipelinePanelFooter.tsx`). The example-chip selector row is likewise duplicated (`index.tsx:45-72` vs `ExampleSelector.tsx`), and both `data.ts` files define parallel 4-example sets whose labels/prompts/iconColors must stay in sync by hand.
- **Root cause**: The two playgrounds evolved as siblings; extraction happened in one and was never back-applied, leaving no shared home (e.g. `sections/playground-shared/`) for chrome the two demos share.
- **Impact**: Divergence has already started (dot sizing, timeline footer's extra `doneCount` chip and spring on "complete"); future polish (e.g. the a11y fixes in finding 3) must be implemented and kept consistent in two places.
- **Fix sketch**: Promote `PipelineProgressBar` and `PipelinePanelFooter` (parameterize the left label and optional stage counter) into a shared folder and consume them from `playground-split/index.tsx`; extract the ThemedChip selector row similarly. Hoist the shared example metadata (label/icon/iconColor/prompt) into one module both `data.ts` files extend.
