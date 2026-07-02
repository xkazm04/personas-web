# Guided Product Tour
> Athena-companion overlay that spotlights, scrolls, and voice-narrates first-time visitors through the marketing site and demo dashboard · **Route:** overlay on `/` (also `/features`, `/dashboard/*`, `/roadmap`) · **Status:** Live

## What it does
A "take the tour" launcher button starts a guided walkthrough that dims the page and drives a cinematic spotlight from one animated diagram to the next. **Athena**, an audio-reactive companion avatar, narrates each step out loud (pre-generated ElevenLabs voice clips) while a floating caption card shows the same line as text, progress dots, and play/pause/prev/next/exit/volume controls.

The tour is chaptered. The homepage chapter opens with a welcome intro pop-up and a 4→3→2→1 avatar countdown, walks five steps (persona → agent mind → orchestration → platform → download), then offers a **bridge** to continue into `/features`. `/features` bridges onward to the demo dashboard (`/demo` → `/dashboard/home`), whose chapter sweeps a single long narration across the home regions and then visits each dashboard tab as its own step. `/roadmap` has its own three-step chapter (no audio yet).

It auto-advances (audio `ended` event, or a dwell timer for silent steps), but the visitor can pause, scrub via progress dots, step with arrow keys, jump between chapters, adjust narration volume (persisted), or press Escape to exit. A first-visit pulse ring on the launcher and a `?tour=1` URL param (used by the bridges) auto-start the tour; a `localStorage` "seen" flag suppresses the pulse afterward. Reduced-motion users get snaps instead of tweens and a static avatar.

## How it works
`TourProvider` (`src/contexts/TourContext.tsx`) is the state machine. It holds `active / atIntro / atBridge / stepIndex / playing / volume` and composes six hooks. `start(steps, options)` loads a step array and flags intro/bridge; `next()` advances, or at the last step shows the bridge prompt (if `bridgeHref` set) or exits. Auto-advance has two paths: steps **with** `audioSrc` advance on the clip's `ended` event (`useTourAudio`), steps **without** advance on a `setTimeout(next, dwellMs)` dwell timer in the provider (`TourContext.tsx:146`).

Step scripts live in `src/lib/tour-script.ts` as four arrays (`HOME_/FEATURES_/DASHBOARD_/ROADMAP_TOUR_STEPS`) registered in `TOURS_BY_ID`. Each `TourStep` carries a `scrollTarget` (always-present section-wrapper id), a `spotlightTarget` (`[data-tour-diagram="…"]` anchor on the diagram itself), a `narration` key into `t.tour`, `dwellMs`, optional `audioSrc`, optional timed `actions` (click-based side effects that drive the diagram in sync with the voice), and optional `spotlightSequence` cues (in-step spotlight moves for one continuous clip).

Per-frame mechanics:
- **Spotlight** (`TourSpotlight.tsx`) runs one `requestAnimationFrame` loop that reads the live target rect and applies it to a single dimmed cutout div (`box-shadow: 0 0 0 100vmax` scrim + cyan ring). On a target change it captures the previous rect and blends toward the new one over `TWEEN_MS` (600ms) so the spotlight visibly glides, then tracks live for free scroll-follow. It also stamps `data-tour-active="true"` on the focused element (retried for lazy mounts).
- **Spotlight sequencing** (`useTourSpotlightSequence`) returns the currently-focused selector: base `spotlightTarget`, overridden by `spotlightSequence` cue timers (the ~46s dashboard-home sweep).
- **Scroll** (`useTourScroll`) centers the live target with `scrollIntoView`; if it isn't mounted yet it scrolls the always-present `scrollTarget` to trigger lazy hydration, then polls (200ms, ≤12 tries) until the real target exists.
- **Navigation** (`useTourNavigation`) `router.replace()`s to a step's `route` when it differs from the current path — used by the dashboard chapter, whose shared `/dashboard/*` layout keeps the provider (and audio) mounted across tabs.
- **Audio** (`useTourAudio`) creates a fresh `Audio` per clip, routes it through a lazily-built Web Audio `AudioContext → MediaElementAudioSourceNode → AnalyserNode → destination`, and returns the analyser. `AthenaCompanion` taps the analyser each rAF frame to bloom her chest-core glow and open a mouth glow from the low-mid voice bands (idle breath when silent).
- **Intro countdown** (`AvatarCountdown`) fills the avatar during `INTRO_START_DELAY_MS` (4000ms) before Athena speaks, with an elapsed-time-driven rAF cadence and per-second Web Audio "blip" oscillators (no asset).

`TourOverlay` (rendered once by `PageShell` and again by the dashboard layout) chooses what to mount: intro card → spotlight + caption → bridge card, all under `AnimatePresence`.

## Key files
| File | Role |
| --- | --- |
| `src/contexts/TourContext.tsx` | State machine + provider; composes the six hooks; dwell-timer and `actions` timers |
| `src/lib/tour-script.ts` | The four step scripts, `TOURS_BY_ID`, `TourStep`/`TourAction`/`TourSpotlightCue` types, `clickTarget`/`clickByText` helpers, `INTRO_AUDIO_SRC` |
| `src/hooks/useTourAudio.ts` | Per-clip `Audio` + Web Audio analyser graph; `ended`-driven advance, `error` dwell fallback, live volume |
| `src/hooks/useTourSpotlightSequence.ts` | Resolves the in-focus selector; in-step sweep cue timers |
| `src/hooks/useTourScroll.ts` | Centers target / scrolls wrapper to force lazy hydration, polls until mounted |
| `src/hooks/useTourNavigation.ts` | `router.replace` for cross-page (`route`) steps |
| `src/hooks/useTourKeyboard.ts` | Esc = exit, ←/→ = prev/next |
| `src/hooks/useTourVolume.ts` | `localStorage`-persisted narration volume (`personas-tour-volume`, default 0.25) |
| `src/components/tour/TourOverlay.tsx` | Mounts intro / spotlight+caption / bridge by phase |
| `src/components/tour/TourSpotlight.tsx` | rAF cutout + tween + `data-tour-active` marker |
| `src/components/tour/TourCaptionCard.tsx` | Narration text, progress dots, controls, chapter quick-nav |
| `src/components/tour/AthenaCompanion.tsx` | Idle video + audio-reactive canvas glow |
| `src/components/tour/AvatarCountdown.tsx` | Pre-speech ring + 4→3→2→1 + Web Audio blips |
| `src/components/tour/TourIntroCard.tsx` | Welcome pop-up (Begin / Skip) |
| `src/components/tour/TourBridgeCard.tsx` | End-of-chapter "continue?" prompt |
| `src/components/tour/TourVolumeControl.tsx` | Volume slider bound to context |
| `src/components/tour/TourLauncher.tsx` | Launch button; `?tour=1` autostart; "seen" pulse (gated on `useReducedMotion` — static ring when reduced) |

## Data & state
- **Source:** static, in-repo. Step scripts are hand-authored in `src/lib/tour-script.ts`; narration text comes from `t.tour.*` in `src/i18n/en.ts` (`tour:` block ~`en.ts:957`/`2135`); audio clips are static assets under `public/tour/*.mp3` plus `public/athena/athena_idle_loop.mp4` + `athena_baseline.jpg`. No network/orchestrator data.
- **Stores:** React Context only (`TourContext`) — no Zustand. `volume` persists in `localStorage` (`personas-tour-volume`); the launcher's first-visit flag is `localStorage` `personas-tour-seen`.
- **API routes:** none.
- **Types:** `TourStep`, `TourAction`, `TourSpotlightCue`, `TourNarrationKey`, `TourId` (`src/lib/tour-script.ts`); `TourContextValue`, `TourStartOptions`, `TourBridgeStrings` (`TourContext.tsx`); `BridgeKey` (`TourLauncher.tsx`).

## Integration points
- **Mount:** `PageShell.tsx` wraps marketing pages in `TourProvider` + `TourOverlay`; `src/app/dashboard/layout.tsx` does the same so the dashboard chapter survives tab navigation.
- **Launch sites:** `HeroClient.tsx:153` (`tourId="home"`, `intro`, bridges to `/features?tour=1`), `InfoPageLayout.tsx:49` (features/roadmap pages, `bridgeKey`), `dashboard/home/page.tsx:123` (`tourId="dashboard"`).
- **Bridge chain:** home → `/features?tour=1` → `/demo?tour=1`. `src/app/demo/page.tsx` enters demo mode and forwards `?tour=1` to `/dashboard/home` so the dashboard launcher autostarts.
- **Diagram contract:** every spotlit diagram must expose a `[data-tour-diagram="…"]` anchor, and clickable sub-targets used by `actions` need stable selectors (`[data-trigger-id]`, `[data-card-id]`, `[data-lab-tab]`, `[data-plugin-key]`, the "Triage my Gmail" chip text). Changing those in a showcase component silently breaks the matching step.
- **Styling hooks:** `globals.css` reacts to `data-tour-active` (scale + glow lift) and `tour-cutout-pulse`.

## Conventions & gotchas
- **`src/data/tour.ts` is NOT this feature.** It exports a *different* `TourStep` interface and `TOUR_STEPS` array that power the static **Get Started** marketing section (`src/components/sections/get-started/*`). The guided-tour overlay runs entirely off `src/lib/tour-script.ts`. Two same-named types — don't cross-import.
- **i18n lockstep:** every narration line and control label is a `t.tour.*` key — add/rename/remove across all 14 locales together (`en.ts` is source of truth). Never hardcode caption or `aria-label` strings.
- **Reduced-motion:** `useReducedMotion` gates the spotlight tween (snaps instead), the Athena canvas (static frame, rAF skipped), the countdown ring/number, and `useTourScroll` behavior (`auto` vs `smooth`). Honored per `custom-animation/require-animation-gating`.
- **React 19 purity:** `setState` is never called synchronously in an effect body — `useTourAudio` and `useTourSpotlightSequence` defer via `queueMicrotask`, and `TourLauncher`'s seen-flag read does too. Keep that pattern if you touch these.
- **Server→Client boundary:** force-static `/features` and `/roadmap` pass only a serializable `tourId` string to the client launcher; the step arrays hold function `actions`, which can't cross the boundary, so `TOURS_BY_ID` resolves them client-side. Don't pass step arrays through server props.
- **rAF cleanup:** the spotlight, Athena canvas, and countdown each store their frame id and `cancelAnimationFrame` in cleanup. The spotlight loop only stops when `active`/`activeSpotlight` change or it unmounts — it runs continuously (one frame/16ms) for the whole tour, by design (free scroll-follow). If you add early-exit conditions, keep the cleanup.
- **Audio cleanup is load-bearing and partial.** Each new clip creates a new `Audio` + `MediaElementAudioSourceNode`; the effect cleanup pauses the element, disconnects the source, and clears the `ended`/`error` advance timers. **The shared `AudioContext` is intentionally never closed** (it's reused across clips and lives for the provider's lifetime) — only `AvatarCountdown` closes its own separate context on unmount. A given media element can only be wrapped by `createMediaElementSource` once, which is why a fresh element is made per clip rather than reusing one; reusing would throw.
- **Autoplay realities:** browsers block audio before a user gesture, and Web Audio contexts start `suspended` — code calls `ctx.resume()` and swallows rejected `play()` promises. The launcher click is the unlock gesture; a `?tour=1` deep-link with no prior interaction may start muted until the user interacts. Volume defaults low (0.25) so the autoplay greeting isn't a jump-scare.
- **Lazy-mount timing:** spotlight/scroll/`data-tour-active` all *poll* because target diagrams hydrate lazily; a step whose diagram never mounts (wrong `scrollTarget` or removed `data-tour-diagram`) will scroll-and-wait silently, then auto-advance on dwell/audio without ever spotlighting. Verify both the wrapper id and the diagram anchor when adding steps.
- **Bridge uses a full page load:** `confirmBridge` sets `window.location.href` (not the router) so the destination's `?tour=1` autostart fires cleanly on a fresh mount.
- **Scrim color is a literal hex, not a token** — sanctioned in `.claude/design.md` because a cinematic dim must stay dark under light/forced-colors themes; the ring still uses the `--brand-cyan` token.
- **Roadmap chapter has no audio yet** (`audioSrc` unset) — it advances purely on `dwellMs` (7500ms) via the provider dwell timer.

## Related docs
- [Homepage & Hero](homepage-hero.md)
- [Animation & motion system](../platform/animation-motion.md)
- [Feature index](../INDEX.md)
