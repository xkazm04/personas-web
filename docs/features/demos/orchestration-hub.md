# Orchestration Hub
> A "lit instrument ring": ten trigger tiles orbit a central agent lens, a comet carries each signal down its spoke, and a detail card with the trigger's own vignette follows - with a Pause/Play, Previous/Next control (with a countdown ring) the visitor owns · **Route:** `/` (homepage section, wrapped `#pipelines`; section id `orchestration-hub`, address `triggers`) · **Status:** Live

## What it does

A homepage demo that explains Personas' trigger model in one picture. Ten **trigger tiles** (Schedule, Polling, Webhook, File watcher, Clipboard, App focus, Event, Chain, Composite, Manual) sit on a ring around the agent, which is shown as a lit glass lens over the persona portrait, with its name below. A ticked bezel carries a marker that turns (the short way round) to the active trigger. Idle spokes carry a faint ambient drift of signals; on the active spoke a **comet** leaves the trigger, lands on the lens, and the lens answers with a shockwave and a swell of light.

One trigger is **active** at a time: its tile is lit from inside in its own colour, lifted, and pulses on every signal beat. The **detail card** beside the ring cross-fades to show, in order: that trigger's **own vignette** (a small stylised animation of the moment it fires), its name at display size, a description, **Fires when** (a concrete condition such as `POST /github/pr.opened`), the agent it **wakes** (label "Wakes"), and a deep-link into the guide. The active trigger **auto-plays** every ~9.6 s, and the visitor owns it: a pill under the card offers **Previous**, **Pause/Play** (labelled with what a press does, wrapped in a **countdown ring** that drains toward the next advance) and **Next**, with the position as `n / 10`. Clicking a tile, stepping, or Pause **stops** the hub on that trigger (the comet and all loops stop too) until the visitor presses Play. Hovering or focusing the ring, scrolling it away, or hiding the tab only **holds** it; it resumes by itself with the time it had left. Reduced-motion visitors start stopped and can reach all ten triggers with Previous/Next.

## How it works

**Playback machine** (`playback.ts`, unchanged by the redesign). A pure reducer (`reducePlayback`) over `{ mode, active, nextAt, remainingMs, stopped, holdUntil, focusHeld, systemHeld }`. The visitor's **stop** (`stopped`: Pause, `SELECT`, `NEXT`/`PREV`, `PREFER_STILL`) is lifted only by `USER_PLAY`; the machine's **holds** (pointer, focus, system) each lift on their own release. `mode` is derived: `stopped` wins, then `held`, else `playing`. A machine resume spends the remainder banked when the hold began (floored at `MIN_RESUME_MS`, 1 s); a user resume starts a fresh `AUTO_CYCLE_MS` (9600) interval. A pointer hold carries `holdUntil` (`POINTER_HOLD_MS`, 30 s) so a touch tap with no `pointerleave` cannot wedge the cycle. `nextDeadline(state)` tells the shell when a `TICK` could change anything. `playback.test.ts` is the acceptance contract.

**Hook (`shared/useHubPlayback.ts`).** The shell lifted into a hook: `useReducer` (initial clock from a lazy `useState(() => Date.now())`), one effect that is the only timer (it first carries a changed system hold into the machine via `setTimeout(0)`, otherwise sleeps until `nextDeadline` and dispatches `TICK`). `useLoopGate(diagramRef)` supplies the system hold (`foreground` / `in-view` vetoes), `run` and `still`; reduced motion arriving after hydration dispatches `PREFER_STILL` through a prev-state check. It returns `hub` (`state`, `trigger`, `stopped`, `held`, `live = gate.run && !stopped`, `still`, `select`, `toggle`, `prev`, `next`, `holdProps` for pointer/focus on the ring) and `diagramRef`. `shared/useDialSteps.ts` turns the active index into a cumulative step count so the bezel marker never unwinds the long way.

**Section (`index.tsx`).** `SectionWrapper fit="fill" id="orchestration-hub" aria-labelledby="orchestration-hub-heading"`, `SectionIntro` from `orchestrationSectionCopy`, and a `data-stage-slot` holding the diagram `div` with `data-tour-diagram="orchestration"`: a two-column grid (ring group on the left; `DetailPanel` and `HubControls` on the right). The ring box is a `role="group"` (`aria-label = copy.ringLabel`) with `{...hub.holdProps}`, containing `RingArt`, `AgentLens` and `RingNodes` layered in one view-box.

**Geometry (`geometry.ts`).** A 600-unit view box (`VB`, centre `C`), node circle `R = 212`, lens `HUB_R = 74`, tile `TILE = 104`, bezel `BEZEL_R = 288`, one signal beat `SIGNAL_S = 2.4` s. `NODES` places the ten triggers every `STEP_DEG`, with spoke endpoints; `pct()` converts to percentages so the HTML tile layer sits exactly on the SVG spokes; `TICKS` are the 60 bezel marks.

**Art (`RingArt.tsx`, `AgentLens.tsx`).** `RingArt` is the SVG instrument: bezel, track, ten spokes, ambient drift, the comet and shockwave on the active spoke (`useId`-scoped gradients, `loopTransition(live, ...)` on every loop, `Spin` for rotations). Stopped, the comet rests just short of the lens with the shockwave mid-ring, so a still frame still tells the story. `AgentLens` is the portrait behind a glass lens that swells per beat, plus the woken agent's name (`copy.triggers[id].persona`). `shared/Spin.tsx` rotates SVG content about a point (framer pivots on the fill-box centre, so content is drawn around (0, 0) inside an invisible circle).

**Tiles (`RingNodes.tsx`).** Ten real `<button>`s over the art, each `data-trigger-id`, `aria-pressed`, glass at rest and lit/scaled when active, with a pulse border on each beat (`timedLoop(live && on, ...)`). `data-trigger-id` is the guided tour's click target (the Athena tour clicks schedule, event_listener, polling, webhook). Labels are `orchestrationSectionCopy.triggers[id].label`.

**Detail (`DetailPanel.tsx`, `shared/TriggerScene.tsx`, `shared/scenes-{a,b,c}.tsx`).** `AnimatePresence mode="wait"` cross-fades per trigger (`duration: 0` when still). `aria-live` is `polite` only while the hub is stopped, `off` during autoplay. `TriggerScene` renders the decorative 160x120 vignette from `SCENES` (`shared/scenes.ts`: one scene per `TriggerId`; scenes-a: schedule, polling, webhook; scenes-b: file_watcher, clipboard, app_focus, event_listener; scenes-c: chain, composite, manual); each acts out its trigger once per beat while `run`, rests on the "it fired" pose otherwise. `shared/scene-kit.ts` holds the theme-token ink, `mix`, `polar`, `timedLoop`, `SceneProps`.

**Controls (`shared/HubControls.tsx`).** The pill: icon-only Previous/Next (`aria-label` from `t.orchestrationHub.previousTrigger` / `nextTrigger`, chevrons mirrored under RTL), a Pause/Play toggle labelled `t.tour.pause` / `t.tour.play` (the label changes, so no `aria-pressed`), and a tabular `n / N` in its own element. The countdown ring is an SVG circle driven by the CSS keyframe `hub-countdown` over `AUTO_CYCLE_MS`, keyed on `active-playing` to restart, paused while `hub.held`, absent when stopped or still.

**Stage fit.** `fit="fill"`; the ring box is `stage:w-[min(100%,100cqh)]` (square, as large as the slot allows) and the detail card is height-capped `stage:h-[min(calc(100%-4.5rem),80cqh)]`.

**Trigger catalog (`data.ts`).** `TRIGGERS: TriggerDef[]` (ten entries: `id` - the desktop's `TriggerKind` spelling, so `file_watcher`, `app_focus`, `event_listener` rather than short forms; it is also the `orchestrationSectionCopy.triggers` key - lucide `icon`, `brand` key, optional `exampleCode`, optional `doc`), `triggerWords(copy, trigger)` joins them with `orchestrationSectionCopy.triggers[id]`, and `AUTO_CYCLE_MS = 9600`.

## Key files

| File | Role |
| --- | --- |
| `src/components/sections/orchestration-hub/index.tsx` | Section shell: intro, ring group (`RingArt` + `AgentLens` + `RingNodes`), `DetailPanel`, `HubControls` |
| `src/components/sections/orchestration-hub/playback.ts` | Pure playback reducer: user stop vs transient holds, banked remainder, `nextDeadline` |
| `src/components/sections/orchestration-hub/data.test.ts` | Pins the ten trigger ids to a dated snapshot of the desktop's `TriggerKind` |
| `src/components/sections/orchestration-hub/playback.test.ts` | Contract for the machine + tour-target guards (`data-trigger-id` in `RingNodes.tsx`) |
| `src/components/sections/orchestration-hub/shared/useHubPlayback.ts` | Hook: machine + timer + loop-gate system hold + hold props |
| `src/components/sections/orchestration-hub/shared/useDialSteps.ts` | Shortest-way cumulative dial steps |
| `src/components/sections/orchestration-hub/shared/HubControls.tsx` | Previous / Pause-Play with countdown ring / Next / `n / N` |
| `src/components/sections/orchestration-hub/geometry.ts` | View-box geometry, `NODES`, `TICKS`, `SIGNAL_S`, `pct` |
| `src/components/sections/orchestration-hub/RingArt.tsx` | SVG instrument: bezel, spokes, ambient drift, comet, shockwave |
| `src/components/sections/orchestration-hub/RingNodes.tsx` | The ten trigger buttons (`data-trigger-id`) |
| `src/components/sections/orchestration-hub/AgentLens.tsx` | Persona portrait lens + woken agent name |
| `src/components/sections/orchestration-hub/DetailPanel.tsx` | Detail card: vignette, name, description, fires-when, wakes, guide link |
| `src/components/sections/orchestration-hub/shared/TriggerScene.tsx`, `scenes.ts`, `scenes-a/b/c.tsx`, `scene-kit.ts` | Ten trigger vignettes and their shared kit |
| `src/components/sections/orchestration-hub/shared/Spin.tsx` | Rotate SVG content about a point |
| `src/components/sections/orchestration-hub/data.ts` | `TRIGGERS`, `triggerWords()`, `AUTO_CYCLE_MS` (also still exports the old ring geometry) |
| `e2e/orchestration-hub.spec.ts` | Drives Pause / Next / Play and reads the `n / N` indicator |
| `src/hooks/useLoopGate.ts`, `src/lib/motion/loop-gate.ts` | Loop gate: `run`/`still` from preference + foreground + in-view + user deciders; `loopTransition` |
| `src/components/sections/lazy.tsx` | `LazyOrchestrationHub` dynamic import (`ssr: false`) |
| `src/app/page.tsx` | Gated `LazyMount` section inside `<div id="pipelines">` |

## Data & state
- **Source:** static. `TRIGGERS` in `data.ts` plus `orchestrationSectionCopy` (`src/i18n/pending/orchestrationSection.ts`); no API, mocks or Supabase.
- **Stores:** none. State is the `useReducer` playback machine in `useHubPlayback`.
- **API routes:** none. Outbound links are `<Link>`s to `/guide/triggers/*` from each trigger's `doc.href`.
- **Copy:** the section reuses the `orchestrationSection` keys (heading, `ringLabel`, `firesWhen`, per-trigger label/description/persona/example/doc label) plus `landingSectionsCopy.hub.wakes` for the "Wakes" label; controls use the translated `t.orchestrationHub` / `t.tour` keys.

## Integration points
- **Brand theming:** `BRAND_VAR`, `tint`, `mix` (`color-mix`) colour tiles, spokes, lens and card; triggers reference brand keys so themes adapt.
- **Motion:** `useLoopGate` (via `useHubPlayback`) drives `live`/`still`; `loopTransition` / `timedLoop` gate every loop; `fadeUp` + `SectionWrapper` give the reveal.
- **Guided tour:** `data-tour-diagram="orchestration"` spotlights the diagram; the Athena tour clicks `[data-trigger-id]` tiles (see [Guided tour](../marketing/guided-tour.md)).
- **Lazy mount:** `createLazySection` in `lazy.tsx`, gated by `LazyMount minHeight={640}`; `lib/landing-address.ts` maps `orchestration-hub` and `triggers` to the same address.
- **Layout primitives:** `SectionWrapper`, `SectionIntro` (`@/components/primitives`), `EYEBROW` (`src/lib/typography.ts`).

## Conventions & gotchas
- **Replaced on 2026-10-05** by the winner of the landing review ("lit instrument ring", the faithful upgrade of the old radial hub). The previous `HubRing`, `HubNode`, `TriggerDetail` and `PlaybackControls` are in git history; the playback machine and its test are unchanged. `data.ts` still exports the old `CENTER` / `RADIUS` / `NODE_SIZE` / `nodePosition`, now unused; `geometry.ts` is the live geometry.
- **e2e contract:** the spec drives the controls by `t.tour.pause` / `t.tour.play`, the Previous/Next `aria-label`s and a standalone `n / N` element; keep all three in `HubControls`. (The spec's header comment still names the old `PlaybackControls.tsx`.)
- **i18n, English-only for now:** `orchestrationSection` and `landingSections` are in `src/i18n/pending/` (PLAN M22); the 13 other locales fall back to English. Code-shaped examples stay in `data.ts` as `exampleCode`.
- **Animation gating goes through the loop gate:** every loop reads `live` (gate open and not stopped) and switches `animate`/`transition` props, never elements; `loop-gate.test.ts` scans this directory for framer `useReducedMotion`, bare `repeat: Infinity` or a private IntersectionObserver, and guards that `RingArt`/`RingNodes`/`AgentLens` do not branch markup on `still`/`reduced`. The countdown ring is a CSS animation, off when stopped or still.
- **A selection sticks (owner-approved 2026-09-23):** clicking a tile, stepping or Pause stops the hub until Play (WCAG 2.2.2). Touch pointers take no hover hold and a pointer hold self-expires. The Athena tour therefore leaves the hub stopped on Webhook. Do not re-add a timed resume.
- **Tiles are real buttons** over the SVG in the same view-box percentages: change `geometry.ts` once and both layers move. Tiles use `aria-pressed`.
- **Spin pivot:** use `shared/Spin.tsx` for SVG rotation; framer overrides `transform-box`, so a plain rotating `<g>` orbits the wrong point.
- **Legacy wrapper id:** the section sits in `<div id="pipelines">` (leftover from the old "Pipelines" concept); the section's own id is `orchestration-hub`. Don't assume they match.

## Related docs
- [Visual Flow Composer & Playground](flow-composer.md)
- [Platform Layers](platform-layers.md)
- [Feature index](../INDEX.md)
