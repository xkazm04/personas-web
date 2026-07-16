# Orchestration & Platform Visualizers — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. Hydration mismatch when landing on a `#flow=` deep link
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: ssr-hydration-mismatch
- **File**: `src/components/sections/event-bus-showcase/index.tsx:45`
- **Scenario**: A user opens a shared URL like `/#flow=...`. The `composerOpen` useState initializer reads `window.location.hash` during the first client render, so the client's initial tree renders the FlowComposer branch while the server-rendered HTML (where `typeof window === "undefined"` forced `false`) contains the showcase branch — two entirely different subtrees.
- **Root cause**: Branch-selecting state is initialized from a browser-only value inside the render path instead of being set in a post-mount `useEffect`. The `typeof window` guard silences the SSR crash but hides the real assumption ("server and client first render must match"), which nobody recorded.
- **Impact**: React hydration error on every hash deep link: console error in production, full client re-render of the section, visible flash from showcase to composer, and (in React 18 recovery mode) potential misplaced event handlers. The deep-link feature that the hash exists for is exactly the path that breaks. Bonus footgun on the same flow: `onClose` calls `replaceState(null, "", window.location.pathname)`, silently dropping any query string.
- **Fix sketch**: Initialize `composerOpen` to `false` and add `useEffect(() => { if (window.location.hash.startsWith("#flow=")) setComposerOpen(true); }, [])`. In `onClose`, preserve `window.location.search` (`pathname + search`) when clearing the hash.

## 2. Event-bus swarm and lane animations ignore `prefers-reduced-motion`
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: reduced-motion-not-honored
- **File**: `src/components/sections/event-bus-showcase/components/SwarmView.tsx:130`
- **Scenario**: A user with "reduce motion" enabled at the OS level scrolls to the event-bus section. Every swarm node runs indefinite SMIL `<animate>`/`<animateTransform>` cycles (opacity pulses + travel-to-center pings for ~10 nodes), and LanesView (`LanesView.tsx:75`) runs an infinite linear glow-dot sweep per lane — none of it gated.
- **Root cause**: The sibling visualizers set the pattern — `HubRing.tsx`, `ConnectionPillar.tsx`, and `use-terminal-sequence.ts` all branch on `useReducedMotion()` — but SwarmView/LanesView were built without it, and SMIL animations are additionally outside Framer Motion's and the global CSS `prefers-reduced-motion` media-query reach.
- **Impact**: WCAG 2.3.3 (Animation from Interactions) / 2.2.2 exposure for vestibular-disorder users on one of the busiest sections of the page, plus an internal inconsistency: half the architecture demos respect the preference, half don't. Continuous SMIL also burns CPU on low-end devices even when honoring reduced motion elsewhere.
- **Fix sketch**: Read `useReducedMotion()` in `EventBusShowcase` (or each view). In SwarmView, when reduced, render nodes at static `opacity: 0.8` without the `<animate>` children; in LanesView, reuse the existing `inView ? … : …` branch and extend the condition to `inView && !reduced` for the sweeping dot (the width bar's one-shot ease can stay).

## 3. Terminal demo is an infinitely self-restarting `aria-live` region with no stop control
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: live-region-noise-no-pause
- **File**: `src/components/sections/platform-command/use-terminal-sequence.ts:226`
- **Scenario**: A screen-reader user scrolls past the CLI section once. The sequence starts (`isInView` gates only the idle→typing transition), runs all 4 commands, shows the summary, waits 4s, then `restart()` loops it — forever, even after the user scrolls away, because no later phase checks `isInView`. The scroll container is `role="log"` + `aria-live="polite"` (`index.tsx:99-100`), so every appended line is queued for announcement.
- **Root cause**: The auto-restart loop was designed for sighted ambient motion, but the live region semantics were added without deciding (or recording) what should happen on repeat: the phase machine's diagram in the file header documents the restart loop but never mentions the live region, and there is a Skip button mid-run but no Stop/Pause — the "done" state auto-expires in 4s.
- **Impact**: Perpetual screen-reader chatter for the lifetime of the page (WCAG 2.2.2 requires a pause/stop/hide mechanism for auto-updating content lasting >5s), plus needless timers and re-renders while off-screen.
- **Fix sketch**: (a) Gate `restart()` scheduling on `isInView` (don't auto-restart while off-screen; the existing idle→typing effect will resume it). (b) Run the demo once and end at the blinking prompt, letting the existing Replay button re-trigger — kills both the infinite announcements and the missing-stop-control problem. (c) Move `aria-live` off the auto-typed stream (e.g., `aria-live="off"` on the log with a one-time polite status "demo complete"), keeping the TerminalControls `role="status"` badge as the announced progress.

## 4. "Delivery time: N%" is a wrong-unit stat built on divergent magic denominators
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: magic-number-unit-mismatch
- **File**: `src/components/sections/event-bus-showcase/components/LanesView.tsx:85`
- **Scenario**: In the Performance View, each lane shows `{latencyMs} ms` in the header pill, then a card below labeled "Delivery time: 87%" — the same latency re-expressed as a percentage of an undocumented 600ms ceiling (`latencyMs / 600` at line 39). A reader cannot tell what "Delivery time 87%" means; higher latency reads as a *bigger* (better-looking) number.
- **Root cause**: The normalization constants were invented locally and never reconciled with the canonical ones: `event-bus-demo.ts:44` computes pressure as `queueDepth/60 + latencyMs/900`, while LanesView uses `queueDepth/50` and `latencyMs/600`; the mock adapter (`event-bus-demo.ts:82-84`) emits queueDepth up to 72 and latency up to 980, so both LanesView ratios saturate at 100% well below the actual data range. `clamp`/`sanitize` are also copy-pasted into LanesView instead of imported.
- **Impact**: A user-visible nonsense metric on a page whose job is to explain the platform, depth bars pinned at full for ~half the mock's range (so the "live" telemetry looks frozen), and three inconsistent definitions of "full" that will drift further when a real telemetry adapter replaces the mock.
- **Fix sketch**: Show the latency as time, not percent — either drop the duplicate card or label it honestly (e.g., "Load" using the already-exported `pressure` from `QueueRouteMetric`, which index.tsx currently discards). Export shared `QUEUE_DEPTH_MAX` / `LATENCY_MAX` constants from `src/lib/event-bus-demo.ts` aligned with the mock's clamps (72 / 980), and import `clamp`/`sanitize` from there.

## 5. Lane sweep dot travels a hardcoded `2600%` — stops mid-bar or overshoots depending on viewport
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: hardcoded-animation-distance
- **File**: `src/components/sections/event-bus-showcase/components/LanesView.tsx:75`
- **Scenario**: The glowing dot that sweeps each lane animates `x: ["0%", "2600%"]` — percent of its own 8px width (`h-2 w-2`), i.e. a fixed ~208px of travel. Inside the `max-w-3xl` panel the track is ~600px wide on desktop, so the dot visibly stops a third of the way across and snaps back; on very narrow phones it would overshoot past the track end (masked only by `overflow-hidden` clipping).
- **Root cause**: Transform percentages resolve against the moving element, not the track, and 2600% was tuned for one viewport width with no comment recording that assumption. Nothing ties the travel distance to the actual lane width.
- **Impact**: The signature "message in flight" affordance looks broken on desktop — the exact polish moment the Performance View exists to sell — and the magic number will silently break again on any layout change.
- **Fix sketch**: Animate `left: ["0%", "100%"]` with `x: "-100%"` compensation (track-relative percentages), or use Framer Motion's layout-free approach of animating `left` from `0` to `calc(100% - 0.5rem)`. Gate on `!reduced` per finding 2.
