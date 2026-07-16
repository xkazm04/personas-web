# Guided Product Tour — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. Tour dialogs claim `aria-modal="true"` but never manage focus
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: aria-modal-without-focus-management
- **File**: `src/components/tour/TourCaptionCard.tsx:39` (also `TourIntroCard.tsx:34`, `TourBridgeCard.tsx:25`)
- **Scenario**: A keyboard or screen-reader user starts the tour (or lands on `?tour=1`). The intro/caption/bridge cards render `role="dialog" aria-modal="true"`, but focus is never moved into them, there is no focus trap, and the page behind is not made `inert`. Tab order continues through the dimmed page underneath; SR users are told "everything outside this dialog is inert" when it is not.
- **Root cause**: The overlay was built as a visual layer only — no `autoFocus`/`focus()` on mount, no trap, no focus restore on exit. `aria-modal` was added for semantics without the behavior that must accompany it. The caption card is additionally not really modal (the tour deliberately lets the page animate/scroll), so the attribute is wrong there even in intent.
- **Impact**: Screen-reader users may never discover the tour controls (focus stays on the launcher, which unmounts — `if (active) return null` — dropping focus to `<body>`); keyboard users tab into spotlit page content behind an 80%-opacity scrim they can't see. This fails WCAG 2.4.3 / the ARIA dialog contract.
- **Fix sketch**: On mount, move focus to the dialog (e.g. the Begin button / play-pause button) and restore it to the launcher on exit. For the truly modal intro/bridge cards add a focus trap (or `inert` on the app root). For the caption card drop `aria-modal="true"` and use `role="region"` or a non-modal dialog, keeping the existing `aria-live` narration.

## 2. Global arrow-key handler hijacks the volume slider and stays live during intro/bridge
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: keyboard-handler-scope-conflict
- **File**: `src/hooks/useTourKeyboard.ts:13`
- **Scenario**: (a) A keyboard user focuses the volume `<input type="range">` (TourVolumeControl) and presses ArrowLeft/ArrowRight to adjust volume — the window-level keydown fires too, so every volume nudge also steps the tour forward/back. (b) While the intro pop-up or bridge prompt is showing, `active` is still true, so ArrowRight silently advances `stepIndex` behind the intro card, and ArrowLeft at the bridge decrements `stepIndex` while `atBridge` stays true — invisible state drift.
- **Root cause**: The listener is bound to `window` for the whole `active` lifetime with no check of `event.target` (interactive element?) nor of the tour phase (`atIntro`/`atBridge`), and no `preventDefault`, so both behaviors fire at once.
- **Impact**: Volume adjustment via keyboard is unusable during the tour (each press skips a narration step), and intro/bridge phases can desync step state from the visible UI. Directly hurts the exact audience (keyboard users) the arrow shortcuts were added for.
- **Fix sketch**: In `onKey`, return early when `e.target` is an input/slider/button (`(e.target as HTMLElement).closest('input, [role="slider"]')`) and gate arrows on the stepping phase (pass `atIntro`/`atBridge` in, or only bind arrows when stepping). Keep Escape global.

## 3. Pause only pauses audio — action/spotlight timelines keep running, permanently desyncing the step
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: pause-semantics-undefined
- **File**: `src/contexts/TourContext.tsx:168` (actions effect), `src/hooks/useTourSpotlightSequence.ts:24`
- **Scenario**: The user hits pause 3 s into the "orchestration" step (actions at 2.5/5/7.5/10 s) or the 48 s dashboard-home sweep, waits, then resumes. Narration audio resumes from its pause position, but the `actions` timers (TourContext.tsx:172) and `spotlightSequence` timers were scheduled on wall-clock from step entry and neither effect depends on `playing` — they fired (or expired) while paused. Diagram clicks and spotlight cues now land on the wrong sentences, or never happen; the spotlight can sit on "heatmap" while Athena is still describing "fleet". Separately, pausing a dwell-only step (roadmap) clears the dwell timeout and resume restarts the full `dwellMs` from zero.
- **Root cause**: "Pause" was only defined for the audio element (`useTourAudio` effect at line 128). No decision was recorded about what pause means for the three other clocks (actions, spotlight cues, dwell), so they silently keep wall-clock time.
- **Impact**: The headline feature — narration synced to diagram animation — breaks after any pause/resume, exactly the interaction a curious first-time visitor makes. On the dashboard sweep the desync can exceed 30 s.
- **Fix sketch**: Define pause as "freeze the step clock": keep a per-step elapsed-ms accumulator (advance only while `playing`), and schedule actions/cues against it (e.g. a single rAF/interval dispatcher that fires cues whose `atMs <= elapsed`), or simpler: on pause, cancel pending timers and on resume reschedule remaining cues at `atMs - elapsed`. Document the chosen semantics in `tour-script.ts`.

## 4. Hand-tuned millisecond timelines are invisibly coupled to committed audio clips with no recorded provenance
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: magic-timing-constants-audio-coupling
- **File**: `src/lib/tour-script.ts:319`
- **Scenario**: Someone regenerates a narration clip in ElevenLabs (copy tweak, new voice) and commits the new mp3. Nothing fails — but every `atMs` cue tuned against the old clip (`spotlightSequence` 10800/19300/26000/33800/37200 for the 46 s home sweep, the 4-click lab timeline, the 6-card platform timeline) now points the spotlight/clicks at the wrong sentences. The `dwellMs` audio-error fallbacks (48000, 27000, …) and `INTER_STEP_PAUSE_MS`/`INTRO_START_DELAY_MS` are similarly bare numbers.
- **Root cause**: The timelines encode transcript timestamps of specific audio takes, but neither the transcript nor the clip duration/take-id is recorded next to the cues; there is no check that `dwellMs` ≳ the clip length or the last cue. A symptom of the same drift already exists: `TourVolumeControl.tsx:11` doc says "Default 50%" while `useTourVolume.ts:8` is 0.25.
- **Impact**: Silent regression channel for the product's most-polished demo path; a future editor cannot tell which numbers are tunable and which are transcript-locked.
- **Fix sketch**: Annotate each timed step with the narration take (e.g. `// dashboardHome.mp3 v1, 46.2s — cues = sentence starts: "fleet"@10.8s …`) or move cues into a per-clip manifest generated alongside the audio; add a dev-only assertion that `dwellMs >= last cue/action atMs + margin`. Fix the stale 50% doc.

## 5. AthenaCompanion documents a static reduced-motion fallback but the video still autoplays and loops forever
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: reduced-motion-not-honored
- **File**: `src/components/tour/AthenaCompanion.tsx:107`
- **Scenario**: A visitor with `prefers-reduced-motion: reduce` starts the tour. The component's own doc (line 14: "falls back to a static frame under prefers-reduced-motion") is only half-implemented: the canvas glow loop is gated (line 35), but the `<video autoPlay loop muted>` idle animation plays regardless — in the intro card at 132 px and in the caption card for the whole multi-minute tour.
- **Root cause**: The reduced-motion gate was applied to the newer canvas layer only; the video element has no conditional (`autoPlay`/`loop` unconditional, no use of the already-available `prefersReducedMotion`).
- **Impact**: Continuous looping motion for users who explicitly opted out — a WCAG 2.3.3/2.2.2 concern (auto-playing, >5 s, no pause control) — and the component behaves contrary to its own documented contract, on every page of the tour.
- **Fix sketch**: When `prefersReducedMotion`, render the `poster` image (`/athena/athena_baseline.jpg`) instead of the video, or set `autoPlay={false}` and don't loop; the existing `useReducedMotion()` value is already in scope.
