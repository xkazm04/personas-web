# Guided Product Tour — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. AudioContext is created but never closed on unmount — exhausts the per-document context budget
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: resource-leak / audio lifecycle
- **File**: src/hooks/useTourAudio.ts:78-98,113-125 (no teardown of `ctxRef`)
- **Scenario**: A visitor opens the tour (a Web Audio `AudioContext` is lazily created), exits, navigates to another page that unmounts the `TourProvider`, then opens it again — repeated across a session (or React StrictMode double-mount in dev). Each lifecycle leaves the previous `AudioContext` alive.
- **Root cause**: The creation effect's cleanup disconnects the per-clip `source` node and pauses the audio, but `ctxRef.current` (the `AudioContext`) is never `.close()`d — there is no unmount-scoped effect that closes it (contrast `AvatarCountdown.tsx:65-71`, which correctly closes its ctx). Chromium hard-caps live `AudioContext`s at ~6 per document; once exhausted, `new AudioContext()` throws, the `try/catch` swallows it, and the analyser/companion glow silently stop working — and on some builds element playback degrades too.
- **Impact**: UX degradation (narration analyser/companion reactivity silently dies after several tour runs) + slow resource leak; on the cap, audio graph fails for the rest of the session.
- **Fix sketch**: Add a mount-once cleanup effect: `useEffect(() => () => { ctxRef.current?.close().catch(() => {}); ctxRef.current = null; analyserRef.current = null; }, [])`, mirroring AvatarCountdown.

## 2. Tour navigation/sequence logic (bounds, bridge, spotlight cues) has zero direct test harness — only opaque e2e
- **Severity**: High
- **Lens**: test-mastery
- **Category**: coverage gap / no unit harness
- **File**: src/contexts/TourContext.tsx:105-141, src/hooks/useTourSpotlightSequence.ts:24-39, src/hooks/useTourNavigation.ts:22-26
- **Scenario**: The pure-ish branch logic — `next()` at-last-step → bridge-vs-exit fork, `goTo`/`prev` clamping, `useTourSpotlightSequence` "override ?? base ?? null" resolution and per-cue timers, cross-page `route !== pathname` guard — is exercised only through Playwright against a live homepage. There is no vitest/jest runner in the repo, so none of this is asserted in isolation, and the e2e never covers a step whose `spotlightTarget` is missing, `goTo(-1)`/`goTo(99)`, or the `spotlightSequence` cue timeline.
- **Root cause**: The harness assumes "tour logic is glue, the e2e covers it." But the e2e asserts caption text after clicks, not the state machine's edge transitions; the highest-risk branches (bounds, bridge fork, cue scheduling, route-skip) are LLM-generatable pure functions left untested. A regression that breaks `goTo` clamping or the bridge fork would pass CI as long as the happy-path text still renders.
- **Impact**: false-confidence test posture — the most bug-prone logic in this stateful overlay has no fast, deterministic assertion; regressions surface only as flaky 25s e2e timeouts.
- **Fix sketch**: Extract the bounds/bridge decision and `resolveSpotlight(override, step)` into pure helpers and add a lightweight unit runner (vitest); or, minimally, add e2e cases for out-of-range progress-dot clicks and a step with an absent spotlight target.

## 3. Auto-advance timer keeps firing after Pause on audio steps via a stranded `INTER_STEP_PAUSE_MS` timer
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: timer lifecycle / play-pause race
- **File**: src/hooks/useTourAudio.ts:105-126, src/contexts/TourContext.tsx:143
- **Scenario**: An audio clip's `ended` event fires (scheduling `advanceId = setTimeout(next, 2000)`), and within that 2s gap the user clicks Pause. `togglePlay` flips `playing=false`, but the creation effect does not re-run on `playing` (it isn't a dep), so the pending `advanceId` is never cleared and `next()` fires anyway ~2s later — the tour advances a step despite being paused.
- **Root cause**: The post-`ended` advance is owned by the creation effect (deps: `active, atIntro, atBridge, introSrc, stepIndex, next, steps`), which has no knowledge of `playing`. Pause is enforced only by the separate play effect calling `audio.pause()`; it cannot cancel an already-scheduled `advanceId`.
- **Impact**: UX degradation — paused tour silently jumps forward once, fighting the user's explicit control.
- **Fix sketch**: In `onEnded`, guard on a `playingRef` before scheduling, or move the inter-step advance into an effect that includes `playing` and clears the timer when `playing` goes false.

## 4. `useTourScroll` retry interval is keyed only to `spotlightTarget`; a same-target re-entry leaves the poll racing a stale step
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: stale-element / scroll-spotlight race
- **File**: src/hooks/useTourScroll.ts:18-43, src/hooks/useTourSpotlightSequence.ts:37-38
- **Scenario**: On a `spotlightSequence` step (dashboard home), the spotlight sweeps targets via `setOverride`. If a cue moves the spotlight to a target that is still lazy-mounting, `useTourScroll` starts a 200ms × 12 poll. If the user clicks `next`/a progress dot before the poll resolves, the new step may resolve to the *same* selector string (or the override resets to a base target that equals the prior one); React may not re-run the effect (deps unchanged), so the in-flight interval keeps scrolling toward an element that now belongs to the previous step's intent, and `scrollIntoblock:"center"` fights the new step's scroll.
- **Root cause**: The effect's identity is `(enabled, spotlightTarget, scrollTarget, prefersReducedMotion)` — it has no notion of `stepIndex`, so two logically-distinct scroll intents that share a selector are coalesced, and the retry loop can outlive the step that started it.
- **Impact**: UX degradation — occasional scroll jank / spotlight landing on the wrong region during fast manual navigation through sweep steps.
- **Fix sketch**: Include `stepIndex` in the scroll effect deps (plumb it through), so each step entry restarts the poll cleanly even when the selector is unchanged.

## 5. Reduced-motion is gated for visuals but narration audio still autoplays at full timeline — no audio/motion opt-out parity
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: reduced-motion gating / autoplay
- **File**: src/contexts/TourContext.tsx:154-164, src/hooks/useTourAudio.ts:60-141, src/components/tour/AthenaCompanion.tsx:34-35
- **Scenario**: A user with `prefers-reduced-motion` (often set by users sensitive to motion *and* sudden sound) starts the tour. `TourSpotlight`, `AvatarCountdown`, and `AthenaCompanion` honor reduced-motion (snap/skip), but `useTourAudio` ignores it entirely: the greeting and every step clip autoplay (subject only to the volume slider default of 0.25), and auto-advance is driven by the audio timeline.
- **Root cause**: `prefersReducedMotion` is read in the context but only passed to `useTourScroll`; the audio hook never receives it, so the design assumption "reduced-motion means calmer experience" is applied to pixels but not to the equally-jarring autoplaying voice. There is also no first-run "start muted / press to play" affordance, leaning entirely on browser autoplay policy (which, once a gesture unlocks audio via the launch click, will allow it).
- **Impact**: UX / accessibility degradation — unexpected autoplaying narration for reduced-motion users; minor a11y-expectation violation.
- **Fix sketch**: Pass `prefersReducedMotion` into `useTourAudio` and, when set, default volume to 0 (or skip autoplay and require an explicit play press), keeping the dwell-timer advance instead of the audio `ended` path.
