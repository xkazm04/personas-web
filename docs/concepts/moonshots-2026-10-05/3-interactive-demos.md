# Moonshot cards - Interactive Demos & Playground (6 contexts, 12 cards)

Anchor convention: `path:line` is the working tree. `path@HEAD:line` marks a file that a concurrent session has
modified or deleted in the working tree (`src/app/page.tsx`, `orchestration-hub/index.tsx`, everything under
`playground-split/`); those anchors read the committed version. `../personas/...` is the sibling desktop repo, read
only to check what the website claims about it.

---

## Section Preview & Demo Harness
A dev-only `/preview/[section]` registry built from the three lazy tables plus a hand-kept extras list, and the public `/demo` hand-off into the mock dashboard. files=8

### 3.1A · Page manifests: one declaration feeds the page, the preview, the scroll map and the lab
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Each public page's stage stack becomes a typed manifest (component, stage chrome, address, gate, variant slots). The page, `/preview`, the scroll map, landing addresses and the lab all read that one manifest instead of copying from it.

#### Description
Today the three pages describe their composition in three different ways. `/` has a data table (`src/app/page.tsx@HEAD:45-56`, with glow/from/to, wrapper id, anchor and gate per row). `/how` writes the same information as inline JSX (`src/app/how/page.tsx:56-72`). `/athena` has no stage wrappers at all (`src/app/athena/page.tsx:21`). Several things derive from these declarations by hand. The scroll map has its own list (`src/lib/constants.ts:12,30`), guarded only by a dev-time `console.warn` (`src/app/page.tsx@HEAD:58-66`). Landing aliases are another hand-kept table (`src/lib/landing-address.ts:37`). The preview mounts each section **bare**, with no stage, glow or `LazyMount stage` (`src/app/preview/PreviewMount.tsx:68`), so it never shows a section the way production frames it. That is why the 2026-10-05 lab had to write a `LabFrame` and re-type each slot's glow by hand (`git show 23514a5:src/app/preview/lab.ts`, 18 rows of copied stage props).

The moonshot makes each page export a `PageManifest`. The page renders from it, and the scroll map, `LANDING_SECTIONS`, the alias table and `/preview` derive from it. The preview gets two modes: in-frame (the stage the page uses) and in-sequence (the whole page with one slot swapped, `?swap=agent-mind:lab-v2`). This keeps `derive.ts`'s collision rule (`src/app/preview/derive.ts:34-55`) and the existing `registry.test.ts` pinning style. No route paths change.

#### Flow
- Convert `/` (already tabular) into an exported manifest. The page and `/preview` both render from it, and the preview shows sections in-frame.
- Derive `SCROLL_MAP_SECTIONS` and `ALIASES` from the manifest. Turn the dev `console.warn` into a vitest.
- Port `/how` to the same manifest, then `/athena`.
- Add a `swap` override for in-sequence preview.

#### Expected impact
The owner, and any builder in a contest, sees a variant in its real slot between its real neighbours, with no per-contest scaffolding. Measure the files touched to stand up a variant round (lab: 133 files, 2 harness files). Risk: an SSR-vs-client shape mismatch if the manifest pulls a `"use client"` table into a server page.

#### Evaluation
Claim: quality - one composition truth instead of four
Before: 4 hand-synced declarations (page table, `LANDING_SECTIONS`, `ALIASES`, lab stage props); preview renders 0 sections in their production frame
After: 1 declaration and 3 derivations; every slug can render in-frame
Method: simulation - (1) add a section to `/`: today that means edits to page.tsx plus constants.ts plus possibly ALIASES, and it is caught only by a dev console. Under the manifest it is one row. (2) Lab slot "agent-mind-v2": today it needs LabFrame plus copied glow. Under the manifest it is `?swap=`. (3) `/how` event-bus has a role-dependent glow (`how/page.tsx:71`). This falsifies the design if a static manifest cannot express it, so it needs a function-valued stage prop.
Result: better
Gate: architecture

#### First experiment
Export `HOME_MANIFEST` from the `/` table unchanged and make `PreviewSectionMount` wrap a slug in `StageSection` when the manifest has it. Diff `/preview/orchestration-hub` against `/` at 1440×900.

#### Evidence
- `src/app/page.tsx@HEAD:45-56` - `/`'s composition is already data
- `src/app/how/page.tsx:56-72` - `/how` declares the same thing as JSX
- `src/app/preview/PreviewMount.tsx:68` - bare `createElement(Section)`, no stage frame
- `src/app/page.tsx@HEAD:58-66` - the drift guard is a dev-only `console.warn`
- `git show 23514a5 -- src/app/preview/lab.ts` - 18 hand-copied stage-prop rows

### 3.1B · The variant bench: a permanent, blind, multi-viewport review console
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
The owner judges landing variants all the time, and twice now a bespoke harness has been built and then deleted for it. Make `/preview/bench` the permanent instrument: blind seats side by side, an iframe grid covering every stage height tier, theme and reduced motion, and verdicts written down as data.

#### Description
Commit `0a0957b` added 133 files (10,400 lines) of lab variants, and `23514a5` gave them a scaffold (`lab.ts`, `LabFrame.tsx`). The working tree deletes that scaffold the same day, once winners are promoted into `playground-split/` and `orchestration-hub/`. The `/athena` contest grew and then dropped its own page-slot switcher (`9a4a5be`, `4eeed36`). The lab's blind seat-to-model map "lives in the contest vault, not here" (`lab.ts` header in `23514a5`), so verdicts never touch the tree.

Judging is also hard to do well. The stage layout has 8 height breakpoints (`src/styles/stage.css:44,146-157,168-183`), and the owner's recorded constraint is that the browser window cannot be resized for 375px checks. A grid of fixed-size iframes, each pointing at `/preview/<slug>?theme=…&still=1`, shows every tier at once whatever the window size.

The bench reads slots from the Card A manifest, or from a `BENCH_SLOTS` list until that exists. It shows variants under shuffled seat letters and records a pick plus a one-line reason per slot to a dev-only route that appends JSONL under `.claude/` (it 404s in production like the rest of `/preview`, `src/app/preview/[section]/page.tsx:15`). A contest becomes: register variants, open the bench, pick. No scaffolding is written and none is deleted.

#### Flow
- Iframe matrix for one slug: 3 heights × 2 themes × motion on/off, with query params read by the preview mount.
- Blind seats: N variants of one slot, shuffled labels, revealed after the pick.
- Verdict capture to a local JSONL file, which the contest skill reads.
- In-sequence column (needs Card A's `swap`).

#### Expected impact
The owner reviews a round in one screen instead of N tabs and manual resizes, and contest decisions become greppable history. Measure scaffold lines written and deleted per contest (≈10.4k last round) and time-to-verdict. Risk: iframes multiply dev-server load, which is a known Windows Turbopack panic trigger, so the matrix should mount lazily.

#### Evaluation
Claim: user - faster, fairer variant judgement
Before: 2 bespoke harnesses built and torn down in 2 months; 0 verdicts recorded in-tree; 375px and height tiers unverifiable from one window
After: 0 per-contest harness code; every verdict recorded; 12 viewport/theme/motion cells visible at once
Method: simulation - (1) replay the 2026-10-05 round: 18 slots become 5 bench pages with 3 to 6 seats. (2) Athena S4 (3 prototypes awaiting pick, per the PerfectWeb direction) becomes one bench page. (3) The prediction is falsified if variants depend on page-level context (scroll map, hash arrival) that an isolated iframe breaks.
Result: better
Gate: direction

#### First experiment
A 120-line `/preview/bench/[slug]` page that renders 6 iframes (3 heights × light/dark) of an existing slug. Use it on the next contest and count the tabs it saves.

#### Evidence
- `git show --stat 0a0957b` - 134 files, +10,400 lines of variants
- `git status` - `D src/app/preview/lab.ts`, `D src/app/preview/LabFrame.tsx` (scaffold discarded)
- `git show 9a4a5be` - the Athena contest's own page-slot switcher, later dropped
- `src/styles/stage.css:146-183` - height-tiered layouts a single window cannot sweep
- `src/app/preview/[section]/page.tsx:15` - the production 404 the bench would inherit

---

## Visual Flow Composer & Playground Page
The `#flow=`-shareable SVG composer (producers → event queue → consumers) on `/how`, and the scripted `/playground` terminal page. files=19

### 3.2A · The composer emits a real Personas bundle the desktop can import
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** contract

#### Summary
Turn the composer's `FlowState` into a projection of the desktop's own subscription and trigger schema, and make "Build this flow in Personas" open the visitor's graph in the app through the import path the desktop already ships.

#### Description
Today the composer's CTA promises `"Build this flow in Personas"` and `"ready to import"` (`src/components/flow-composer/components/FlowCTA.tsx:29,33`). Its link is `href="#download"` (`:21`), but the composer only mounts on `/how`, and `/how` has no `#download` target (the `id="download"` section is `DownloadCTA.tsx:65`, mounted only on `/`). The serialized graph is website-private: `btoa(JSON)` of `{nodes:{toolId,x},wires:{from,to,label}}` (`flow-composer/types.ts:11-27`, `data.ts:79-85`). Wire labels are invented as `` `${toolName}.trigger` `` (`use-flow-composer.ts:165`, so "Gmail.trigger"). The desktop's canonical event vocabulary is snake_case `<noun>_<past_participle>` (`../personas/src/lib/eventTypeTaxonomy.ts:9-11`).

The desktop already has two ways in. `personas://share` resolves to an HTTP bundle with a mandatory `hash=` (`../personas/src-tauri/src/boot/deep_link.rs:35`, `.../commands/network/bundle.rs:313-350`), and there is a clipboard bundle import (`apply_bundle_from_clipboard`, named at `bundle.rs:334`). The moonshot defines a `flow-bundle` projection. Composer producers map to trigger kinds, consumers to persona tool bindings, and wires to event subscriptions with taxonomy event types. "Copy as Personas bundle" puts it on the clipboard, and the app opens it with the existing preview and consent UI. Unsigned web bundles go through the untrusted-signer consent the dialog already has.

Side finding: `TemplateDetail.tsx:89` fires `personas://template/<id>`, but `deep_link.rs` routes only auth, share, import, ref and pair (`:19,35,43,52,61`; "template" appears 0 times). The website's existing "Open in Personas" is a dead link today.

**Bends:** the cross-repo contract. The bundle schema becomes a versioned interface between the two repos, like `roadmap/v1.json`.

#### Flow
- Fix the CTA target first: link to `/#download`, or an inline download panel.
- Write the projection `FlowState → bundle JSON` as a pure function with a vitest, using the taxonomy event names.
- Add clipboard export plus desktop import of one flow, and verify the round trip by hand.
- Then hosted share links (needs an HTTP host and hash) and gallery `personas://import/<slug>`.

#### Expected impact
A visitor's five-minute sketch becomes their first working persona wiring, which is a conversion path no static marketing site has. Measure CTA clicks to imports (needs desktop activation telemetry). Risk: if the desktop schema changes, shared links in the wild stop importing, so the bundle needs a version and a graceful refusal.

#### Evaluation
Claim: user - the composer's promise becomes true
Before: CTA links to an anchor absent from `/how`; 0 importable outputs; wire labels outside the desktop vocabulary
After: every composed flow can be pasted into the app; labels are taxonomy event types
Method: simulation - (1) default flow (gmail→jira, github→slack, webhook→database, `data.ts:43-56` region) projects to 3 subscriptions; (2) a consumer-only graph has no trigger and must be refused clearly; (3) falsified if the desktop's bundle carries required persona fields (prompt, model) the composer cannot supply, which would force a "draft persona" import mode
Result: unmeasurable
Gate: contract

#### First experiment
Export a desktop bundle for one hand-built persona with one event subscription. Write the pure projection that reproduces its subscription block from the default composer graph, and diff the two.

#### Evidence
- `src/components/flow-composer/components/FlowCTA.tsx:21,29,33` - `#download` plus "ready to import"
- `src/components/flow-composer/use-flow-composer.ts:165` - wire label invented as `<Name>.trigger`
- `../personas/src/lib/eventTypeTaxonomy.ts:9-11` - desktop event naming convention
- `../personas/src-tauri/src/commands/network/bundle.rs:313-350` - share-link resolution and hash rule
- `../personas/src-tauri/src/boot/deep_link.rs:19-61` - no `template` route (website deep link unhandled)

### 3.2B · Run your flow: the composer becomes a fault-injectable simulator
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
Press "Run" and the visitor's own wires carry simulated traffic with live queue depth, throughput and latency per route. Then let them unplug a consumer or spike a producer and watch the queue back up and recover. They don't just draw an orchestration, they stress it.

#### Description
The showcase and the composer are two disconnected models. The showcase animates 4 fixed routes (`src/components/sections/event-bus-showcase/data.ts:6-50`) through a random-walk adapter (`src/lib/event-bus-demo.ts:67-101`) with real pressure math (`:40-54`). It even takes an injectable `telemetryAdapter` prop (`event-bus-showcase/index.tsx:54`). The composer, when opened, **replaces** the showcase wholesale (`index.tsx:128`), and its wires animate a constant decorative dot with no data behind it (`FlowWires.tsx:50`). The visitor's graph never meets the telemetry engine.

The moonshot compiles composer wires to `QueueRouteSeed[]` (`event-bus-demo.ts:1-12`: producer, consumer and colour are already in `TOOL_MAP`) and feeds them to the same adapter shape. A "Run" toggle overlays `LanesView`-style metrics on the visitor's wires. Fault controls are just pure adapter parameters: pause consumer X (depth climbs, pressure → 1), 5× burst from producer Y, slow tool Z. A heal action shows the platform's answer (retry, reroute, backpressure), which links to the Healing feature. It is deterministic given a seed, so reduced motion gets numbers without dots, and the existing loop gate stops it off-screen.

#### Flow
- `wiresToSeeds(nodes, wires)` pure function plus a vitest. Lanes render the visitor's routes.
- A seeded deterministic adapter (replacing `Math.random` with a seeded PRNG) so shared `#flow=` links replay identically.
- Fault toggles (pause, burst, slow) as adapter params, with i18n strings in all 14 locales.
- A heal beat linking to the self-healing feature section.

#### Expected impact
`/how` visitors move from watching a diagram to running an experiment, the "aha" an orchestration product should own. Measure Run clicks, fault toggles per session and share-link creation. Risk: the composer's strings are already hardcoded English (doc gotcha), so shipping more UI here raises the 14-locale debt unless the extraction lands first.

#### Evaluation
Claim: user - interaction depth on `/how`
Before: composer wires carry 0 data; showcase routes are fixed at 4 and unaffected by the visitor
After: every wire has live depth/eps/latency; 3 fault modes
Method: simulation - (1) default 3-wire flow gives 3 lanes with pressures from `withPressure`; (2) pausing Jira with Gmail at 28 eps: depth rises ~28/tick to the 72 clamp, pressure saturates, and the lane must visibly redden; (3) falsified if a 12-wire graph makes lanes unreadable, so it would need aggregation by consumer
Result: better
Gate: direction

#### First experiment
Pass `createMockQueueTelemetryAdapter(wiresToSeeds(DEFAULT_NODES, DEFAULT_WIRES))` into `EventBusShowcase` in `/preview/event-bus-showcase` and confirm the lanes view renders the composer's routes unchanged.

#### Evidence
- `src/components/sections/event-bus-showcase/index.tsx:54,128` - injectable adapter; composer replaces the showcase
- `src/lib/event-bus-demo.ts:40-54,67-101` - pressure model and random-walk adapter
- `src/components/sections/event-bus-showcase/data.ts:6-50` - 4 hard-coded routes
- `src/components/flow-composer/components/FlowWires.tsx:50` - wire dot is a fixed loop, not data

---

## Orchestration & Platform Visualizers
Architecture explainers: the 10-trigger orchestration hub on `/` (pure playback reducer), the event-bus showcase, platform layers on `/how`, and the preview-only CLI terminal. files=32

### 3.3A · A desktop vocabulary snapshot: visualizers derived from the app's generated bindings
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** contract

#### Summary
Vendor the desktop's ts-rs-generated vocabularies (trigger kinds, event-type taxonomy) into a synced, dated snapshot, and type the hub, the event-bus copy and the composer as `Record<TriggerKind, …>`. A trigger the app adds or drops then fails the website's typecheck instead of drifting silently.

#### Description
The hub says it "mirrors personas/src/features/triggers/sub_triggers/configs" (`src/components/sections/orchestration-hub/data.ts:17-18`), but it is a hand-typed list with its own ids (`file`, `focus`, `event`, `:44-101`). The desktop solved this exact drift on its side. `TriggerKind` is "the closed vocabulary of trigger types — the single source", created after the same set was "re-typed by hand in six places at four different arities" and four of ten could not be stored (`../personas/src/lib/bindings/TriggerKind.ts:3-12`). Its menu is `TRIGGER_KINDS` with ids `event_listener`, `file_watcher`, `app_focus` (`../personas/src/lib/utils/platform/triggerConstants.ts:23-34`). The event-bus showcase labels routes with prose (`event-bus-showcase/data.ts:14,26,38,50`) where the app has a canonical snake_case taxonomy (`../personas/src/lib/eventTypeTaxonomy.ts:4-11`).

The repo already mirrors desktop truth by hand, with provenance fields `source` and `verifiedAgainst` (`src/data/desktop-plugins.ts:1-27`). The moonshot automates that pattern. A `scripts/sync-desktop-vocab.mjs` copies the generated `.ts` bindings into `src/data/desktop/` with a header recording the commit SHA and date, and a CI check flags staleness. The hub's `TRIGGERS` becomes `Record<TriggerKind, TriggerDef>`, which is total, so a new kind is a compile error until it gets an icon and copy. The same snapshot feeds Flow Composer card A's event names.

**Bends:** a build-time dependency on a sibling repo's files (vendored snapshot, not a live import, so CI stays self-contained).

#### Flow
- Sync script plus vendored `TriggerKind.ts` with SHA header. Map web ids to kinds (`file→file_watcher` …).
- Re-key `TRIGGERS` as `Record<TriggerKind, …>`. tsc proves totality.
- Vendor the event taxonomy and replace the showcase's prose `eventType` with taxonomy ids plus translated captions.
- A CI staleness warning when the snapshot SHA is more than N days behind.

#### Expected impact
The site's architecture claims cannot outlive the app's reality, and a desktop trigger rename shows up in the web build, not in a customer's eyes. Measure vocabulary mismatches found on first sync and staleness days thereafter. Risk: the hub's i18n keys are keyed by web ids (`t.orchestrationSection.triggers[id]`), so re-keying touches en.ts and every locale that has the namespace.

#### Evaluation
Claim: quality - claimed vocabulary equals shipped vocabulary
Before: 10 hand-typed trigger ids, 3 of which differ in spelling from the app's kinds; 4 prose event labels vs a canonical taxonomy; 0 automated checks
After: 0 spelling divergences, compile-time totality, dated provenance
Method: simulation - (1) the desktop adds a kind, the next sync gives a web tsc error in `data.ts`; (2) the desktop removes `clipboard`, the hub node becomes a type error rather than a phantom feature; (3) falsified if the web needs marketing-only pseudo-triggers the app does not have
Result: better
Gate: contract

#### First experiment
Copy `TriggerKind.ts` into `src/data/desktop/` and add `satisfies Record<TriggerKind, TriggerId>` for a mapping object. Count the compile errors (expected 0 after mapping the 3 renamed ids).

#### Evidence
- `src/components/sections/orchestration-hub/data.ts:17-18,44-101` - "mirrors" claim plus hand-typed ids
- `../personas/src/lib/bindings/TriggerKind.ts:3-12` - desktop's single generated source, with its drift history
- `../personas/src/lib/utils/platform/triggerConstants.ts:23-34` - canonical kind ids
- `src/components/sections/event-bus-showcase/data.ts:14` - prose event label
- `src/data/desktop-plugins.ts:1-27` - existing hand-mirror pattern this automates

### 3.3B · The hub wakes on the visitor's own signals
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 8/10  ·  **Risk:** 4/10  ·  **Gate:** direction

#### Summary
Five of the ten triggers the hub explains can genuinely fire in a browser tab: paste something, switch tabs and come back, drop a file, wait for a tick, press a button. Wire those real events into the hub so the ring lights up because the visitor did something, not because a timer moved.

#### Description
The hub's machine is a pure reducer with a `SELECT` action that stops on a chosen trigger (`src/components/sections/orchestration-hub/playback.ts:40-53,129-130`), dispatched by `handleSelect` (`orchestration-hub/index.tsx@HEAD:62-64`). Its catalog includes `file` with `~/inbox/*.pdf` (`data.ts:63-66`), `clipboard` (`:70`), `focus` (app focus, `:76`), `schedule` (`:44`) and `manual` (`:101`). Each has a browser analogue: the `drop` event, `paste`, `visibilitychange`/`focus` (already wrapped by `usePageVisibility`), an interval tick, and a click. The working-tree redesign keeps this mechanism ("same layout and mechanism… visitor-owned playback from playback.ts", `src/components/sections/orchestration-hub/index.tsx:20-26`), so the moonshot is independent of the visual winner.

The moonshot adds an opt-in "Try it live" toggle. While it is on, listeners scoped to the section dispatch a new `SIGNAL` action (`SELECT` plus a pulse flag), and the detail panel shows "You just fired a Clipboard trigger → *Research Assistant* would wake", with the persona taken from existing copy. Privacy by construction: it reads the event type only, never clipboard contents or file bytes (`clipboardData` is not touched; a drop reads only `file.name` extension to match the glob). Webhook, polling, event, chain and composite stay scripted, and the panel says why ("needs a server"). Reduced motion gives the same events with no pulse.

#### Flow
- Add a `SIGNAL` action to `reducePlayback` plus a vitest (stop-on-signal semantics match `SELECT`).
- `useBrowserSignals(sectionRef, enabled)`: paste, drop, visibility return, click.
- Detail-panel "you fired it" variant with copy in `orchestrationSection` (pending namespace, so en plus a translation pass).
- Schedule: a visible 10-second countdown the visitor starts.

#### Expected impact
"Any signal can wake any agent" stops being an assertion and becomes something the visitor does with their own hands, five times. Measure the share of hub sessions that fire at least one real signal and dwell time. Risk: a paste listener on a marketing page can read as invasive, so the opt-in toggle and an explicit "we read only that it happened" line are part of the design, not polish.

#### Evaluation
Claim: user - explanatory power of the trigger section
Before: 0 of 10 triggers respond to anything the visitor does except clicking a node
After: 5 of 10 fire from genuine browser events
Method: simulation - (1) visitor pastes a URL into the page: `paste` → `SIGNAL clipboard` → hub stops on Clipboard with the "you fired it" panel; (2) visitor alt-tabs and returns: `focus` fires; check that it doesn't collide with the system hold that `useLoopGate` already applies on hidden tabs (order: release hold, then signal); (3) falsified if mobile browsers give no usable paste/drop on a non-input element, which would force a mobile fallback of tap-to-simulate
Result: better
Gate: direction

#### First experiment
In `/preview/orchestration-hub`, add a 30-line effect that dispatches `SELECT` for clipboard on `paste` and for focus on `visibilitychange→visible`. Hand it to two people unprompted and see whether they discover it.

#### Evidence
- `src/components/sections/orchestration-hub/playback.ts:40-53,129-130` - action union; `SELECT` stops on a trigger
- `src/components/sections/orchestration-hub/data.ts:44,63-66,70,76,101` - schedule/file/clipboard/focus/manual triggers
- `src/components/sections/orchestration-hub/index.tsx@HEAD:62-64` - selection path the signal would reuse
- `src/components/sections/orchestration-hub/index.tsx:20-26` (WIP) - redesign keeps playback.ts, so the card survives it

---

## Split & Pipeline Playground
The homepage "Agent Mind" split demo (prompt editor plus parse→tools→verify→result flowchart) and its preview-only pipeline-timeline sibling, both scripted with up-front `setTimeout` chains. files=19

### 3.4A · One virtual-clock run engine for every scripted demo
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Replace the timer chains in the scripted demos with one engine. A run is a script plus a clock, and every frame is the pure function `frameAt(script, t)`. Pause, seek, 2× speed, tab-hide resume, scrubbing and tests then come free, and split, timeline and terminal become lenses on the same run.

#### Description
Every scripted demo schedules its whole future up front. Split pushes 2 timeouts per step (`src/components/sections/playground-split/use-playground-simulation.ts@HEAD:84-122`). Because of that, a hidden tab **aborts the run to idle** rather than pausing it (`:36-53`), and runs can't be interrupted (`:129`). The pipeline timeline keeps a separate 50 ms interval clock beside its timeouts (`playground-timeline/use-pipeline-simulation.ts:82,98,118`), and its speed toggle can't retime a live run (`:152`). The agent playground has no run-id fence, so late timers leak after Reset (`agent-playground/index.tsx:38-64`). The chat schedules typing timers per message (`agents-chat/use-chat-sequence.ts:45-74`). Platform-command deferred a reducer because "no unit-test runner" existed (`platform-command/use-terminal-sequence.ts:41-48`, stale since vitest). Count: **24 `setTimeout(` and 2 `setInterval(` across 7 demo directories**. The working-tree "Camera" restage still uses the same shape (`playground-split/shared/useMindRun.ts:82-84`).

The repo already has the right pattern in two places: the hub's pure reducer with `nextDeadline` (`orchestration-hub/playback.ts:116,151`) and Athena's pure `stageOf(plan, phase)` (`src/components/athena/stage/stages.ts:51`). The moonshot is `src/lib/run-script/`. A `RunScript` is a list of beats with durations, `frameAt(script, t)` is pure, and `useRunClock` owns one rAF/deadline timer gated by `useStillMotion` plus `usePageVisibility`. The split, timeline and agent-playground scripts become data. This differs from the open challenge item "pure reducer for the terminal sequence", which covers platform-command only. This card is the shared runtime it would plug into.

#### Flow
- `frameAt` plus vitest (seek, speed, beat boundaries). Port the preview-only `playground-timeline` first (zero public risk).
- Port split, or the Camera restage once it lands: hidden tab means pause and resume, and the run is interruptible.
- Port agent-playground (the run-id leak disappears) and the chat.
- Add a scrubber affordance to any demo for free.

#### Expected impact
Visitors who switch tabs come back to a paused run instead of a reset. Every demo gains pause, seek and speed, and the owner gets unit-tested choreography. Measure timer call sites (26 → ~1) and open demo defects closed (run-id leak, speed retime, clock drift). Risk: a mid-flight port collides with the concurrent Camera restage, so sequence after it merges.

#### Evaluation
Claim: resilience - deterministic, interruptible playback
Before: 26 timer call sites; tab-hide = abort; speed change ignored mid-run; Reset can leak a ghost line
After: one clock; tab-hide = pause; speed and seek at any t; no late callbacks possible (no callbacks)
Method: simulation - (1) split run hidden at t=1.8s: today it goes idle; under the engine `frameAt(t=1.8)` is restored on return; (2) timeline 1×→2× at stage 3: the clock rate changes and `frameAt` stays continuous; (3) falsified if framer `layout`/`AnimatePresence` transitions depend on the old mount order, which would show as visual regressions after the port
Result: better
Gate: architecture

#### First experiment
Write `frameAt` for `playground-timeline`'s 7-stage script, with tests for t=0, mid-stage and end at 1× and 2×. Drive the existing `TimelineTrack` from it in `/preview/playground-timeline`.

#### Evidence
- `src/components/sections/playground-split/use-playground-simulation.ts@HEAD:36-53,84-122` - abort-on-hide, up-front schedule
- `src/components/sections/playground-timeline/use-pipeline-simulation.ts:82,98,118,152` - dual clocks, speed not retimed
- `src/components/sections/agent-playground/index.tsx:38-64` - no run fence
- `src/components/sections/orchestration-hub/playback.ts:116,151` and `src/components/athena/stage/stages.ts:51` - the pure-time pattern already in the repo
- grep count: `setTimeout(` 24 / `setInterval(` 2 across playground, agent-playground, agents-chat, agents-timeline, playground-timeline, platform-command, playground-split@HEAD

### 3.4B · You are the human in the loop: the demo pauses for your approval and remembers it
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 8/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
The Agent Mind ends on a static card that says "Human review" and "Memory learned". Make the visitor that human. The run stops at the approval gate, the visitor approves, edits or rejects the drafted action, and the "memory learned" line is computed from what *they* chose.

#### Description
The four result dimensions are Personas' real outputs: message, human review, event, memory (`src/components/sections/playground-split/data.ts@HEAD:28-33`; `types.ts@HEAD:11-16`). In the demo all four are read-only strings. The Gmail run's review reads "Approve billing dispute reply before sending to legal@acme.com" (`src/i18n/en.ts:4976`) and its memory "legal@acme.com → always priority sender" (`:4977`), both fixed before the visitor does anything. The run is a fixed sequence `parse → select → tools → execute → verify → result` (`use-playground-simulation.ts@HEAD:84-91`) with no branch. HITL approval and learning memory are among the product's most differentiating ideas (registry subjects `hitl-approval` and `agent-memory` are mapped to this group), and the demo dramatizes them by printing their names.

The moonshot inserts a `review` beat before `result`. The flowchart's verify node turns amber and waits indefinitely (never times out, the Athena "waits, amber, never guessed" grammar). The prompt pane shows the drafted message with three choices: Approve, Make it shorter, Reject. Each choice branches to a short authored continuation (rejected → the agent drafts an alternative and asks again). The memory line is derived: "Prefers shorter replies to legal@acme.com", "Never auto-reply to billing disputes". The emitted event reflects the decision (`…approved` / `…rejected`). This is 4 examples × 3 choices = 12 authored continuations, all through `t.playgroundSection` (a pending namespace, so en first and the translation pass is tracked).

#### Flow
- Gmail example only: review beat, 3 choices, derived memory line (needs Card A's clock or a simple await).
- Extend to the other 3 examples.
- An `aria-live` announcement of the waiting gate, keyboard-first choices.
- Optional: carry the learned memory into the next prompt the visitor runs ("remembered: you like short replies").

#### Expected impact
Visitors feel the product's two hardest-to-explain properties, oversight and learning, in 10 seconds on the homepage. Measure the share of runs reaching the gate that get a decision and the click-through to download after a decision. Risk: an indefinite wait on the homepage can read as a stall, so the gate needs an unmistakable "your turn" treatment.

#### Evaluation
Claim: user - comprehension of HITL plus memory
Before: 0 visitor decisions; memory and review are fixed strings set before the run
After: 1 decision per run; memory and event lines derived from the decision (3 outcomes per example)
Method: simulation - (1) Gmail, "Make it shorter": the agent redrafts, memory reads "prefers shorter replies to legal@acme.com", event `…approved`; (2) PR, Reject: blocker comment withdrawn, memory "skip style nits on #142's author"; (3) falsified if visitors don't notice the gate (no decision in most runs), in which case the gate should auto-highlight after 2s
Result: better
Gate: direction

#### First experiment
Prototype the Gmail review beat as a `/preview` variant of the current split with 3 hard-coded branches, and watch 3 people use it without instructions.

#### Evidence
- `src/components/sections/playground-split/data.ts@HEAD:28-33` - the four dimensions incl. humanReview and memories
- `src/i18n/en.ts:4976-4977` - review and memory are fixed strings
- `src/components/sections/playground-split/use-playground-simulation.ts@HEAD:84-91` - single linear sequence, no branch point
- `.ai/registry-map.json` - `hitl-approval`, `agent-memory` mapped to this demo group

---

## Agent Execution Timeline Race
The `/how` head-to-head: a rigid Workflow track always fails and an Agent track always resolves, across 5 authored scenarios with a "% faster" summary. files=11

### 3.5A · Measured races: every number on the track comes from a recorded desktop run
**Slot:** structural  ·  **Size:** XL  ·  **Effort:** 8/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** contract

#### Summary
Turn the five scenarios into eval cases the real app runs. The agent track replays a recorded execution trace (steps, durations, outcome) exported from the desktop, and every displayed number carries its provenance. The race stops being choreography that happens to show seconds.

#### Description
Today the race's numbers contradict themselves. In `ambiguous-email` the agent's total is `1800` ms (`src/components/sections/agents-timeline/data.ts:39`) but its result reads "Resolved in 4 seconds" (`:40`). The workflow totals `3000` ms (`:29`) while its result says "No one helps the customer for hours" (`:30`). The summary prints `(wf − ag) / wf` as "Agent resolved 40% faster" (`components/ComparisonSummary.tsx:66-75`), a speed-up measured against a track that ended `STUCK` (`data.ts:26-27`) and never resolved. All step durations are authored (`types.ts:1-5`). The registry's `public-claim-provenance` golden path names this exact failure: two provenances, "derived from what ships" and "a person typed it", that render identically.

The desktop has the instruments. `get_execution_trace` (`../personas/src-tauri/src/commands/execution/executions.rs:870`) and an eval-run store (`../personas/src-tauri/src/commands/eval_runs.rs:605,707`). The moonshot defines `race-trace/v1`: per scenario, the customer input, the agent's recorded steps (tool calls compressed to labels), wall-clock durations and the outcome. These are exported from an eval run of the real app, committed as fixtures with run id plus date, and replayed on Card A's clock from Split & Pipeline (time-compressed, with the true duration shown). The workflow side becomes an explicit rule table (see card B). The headline changes from "% faster" to "resolved vs. escalated, agent took Ns of real time".

**Bends:** a cross-repo fixture contract, and the honesty rule bites. If a real run fails a scenario, the site shows it or drops the scenario.

#### Flow
- Fix the internal contradictions now: derive result-line seconds from `totalMs`, and drop "% faster" against a failed track.
- Write `race-trace/v1` and a hand-made fixture for one scenario, with replay driven from the fixture.
- Run the ambiguous-email case through the desktop eval harness and export a real trace.
- Add a provenance chip on each track ("recorded 2026-10-…, run #…").

#### Expected impact
Skeptical technical buyers on `/how` see claims they can trust, and the race doubles as a public regression test of the agent. Measure contradictions on the section (today ≥3 in one scenario) and the share of displayed numbers with provenance. Risk: real runs are slower and messier than authored ones, so the visual punch may soften. That is the price of the claim.

#### Evaluation
Claim: quality - displayed claims are derived, not typed
Before: 10/10 durations authored; in ambiguous-email the timer says 1.8s, the copy says 4s, and "40% faster" compares against a non-resolution
After: agent durations and outcome from a recorded run; 0 internal contradictions; each number dated
Method: simulation - (1) ambiguous-email under replay: timer and copy both read the trace's duration; (2) vip-discount fails in the real run: the gate forces showing or removing it; (3) falsified if desktop traces lack per-step timing at usable granularity, which would need an exporter change
Result: better
Gate: contract

#### First experiment
Run the ambiguous-email customer message through a local desktop persona, call `get_execution_trace`, and hand-convert it to the race's `TrackStep[]`. Check whether a real trace has 4 to 6 legible steps.

#### Evidence
- `src/components/sections/agents-timeline/data.ts:26-30,39-40` - STUCK workflow; 1.8s vs "4 seconds"
- `src/components/sections/agents-timeline/components/ComparisonSummary.tsx:66-75` - % faster vs a failed track
- `../personas/src-tauri/src/commands/execution/executions.rs:870` - execution trace export exists
- `../personas/src-tauri/src/commands/eval_runs.rs:605,707` - eval-run store
- `ai-registry/knowledge/software-engineering/ui-surfaces/published-surfaces/public-claim-provenance/public-claim-provenance.md` - governing standard

### 3.5B · Break the workflow yourself: visitor-chosen curveballs against a rule table that really runs
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
Instead of watching a workflow that is scripted to fail, the visitor throws the curveball: "pay with two cards", "change my mind mid-sentence", "I'm a VIP on a legacy plan". The workflow track is an actual if/then rule table executing in the browser, and the visitor sees exactly which rule had nothing to say.

#### Description
The workflow's failure is a label someone typed: "Notice conflicting instructions" → "No rule for this situation" → "STUCK" (`src/components/sections/agents-timeline/data.ts:23-27`). The step status is an authored field (`types.ts:1-5`), and the trigger is a fixed quote per scenario (`data.ts:20`). Visitors can only pick a scenario or pause. A skeptic's natural objection is "you rigged the workflow", and the current design has no answer to it.

The moonshot gives each scenario a small, plausible rule table (6 to 10 rules a real Zapier-style flow would have: `intent=cancel → cancel_order`, `payment.methods=1 → refund_to_method`). There is a deck of 3 to 4 curveball chips per scenario that mutate the customer input (add a second payment method, add a correction clause, add a legacy-plan flag). The workflow track becomes `evaluate(rules, input)`, so its steps and its failure point are computed, with the unmatched input field highlighted. The visitor can even toggle "add a rule for this" and watch the next curveball break it anyway, which is the actual argument for agents. The agent track stays authored per curveball, or uses Agent Playground card B's planner later. Tracks render through the existing `Track`/`StepBlock` components.

#### Flow
- One scenario (split-payment): rule table, 3 curveballs, computed workflow track.
- "Add a rule" toggle plus a second curveball that defeats the patch.
- Extend to the remaining 4 scenarios. Lift all copy into en.ts plus 13 locales (the section is 0% i18n today).
- Show the rule table itself on demand ("see the workflow's rules").

#### Expected impact
The section stops asserting and starts letting visitors find the brittleness themselves, which persuades the ops buyers who own today's workflows. Measure curveballs thrown per session and the "add a rule" toggle rate. Risk: rule tables that look strawmanned undercut the point, so they should be reviewed against a real automation template.

#### Evaluation
Claim: user - credibility of the workflow-vs-agent argument
Before: workflow failure is 1 authored label per scenario; 0 visitor inputs change either track
After: the failure point is computed from rules × input; 3 to 4 visitor curveballs per scenario
Method: simulation - (1) split-payment, "two cards": `refund_to_method` expects 1 method, so the workflow halts at rule 3 with "payment.methods=2 unmatched"; (2) visitor adds a 2-method rule, then "one card expired": it halts again at the new rule; (3) falsified if visitors read the rule table as a strawman (qualitative test with 3 ops people)
Result: better
Gate: direction

#### First experiment
Write the split-payment rule table plus an `evaluate()` (≈60 lines) with a vitest, and render its output through the existing `Track` in `/preview/agents-timeline`.

#### Evidence
- `src/components/sections/agents-timeline/data.ts:20,23-27` - fixed trigger; failure is typed text
- `src/components/sections/agents-timeline/types.ts:1-5` - `status` is authored, not computed
- grep: `useTranslation` appears in 0 files under `agents-timeline/` (i18n debt any expansion inherits)

---

## Agent Playground & Multi-Agent Chat
The preview-only free-text terminal demo (canned transcripts, first-word matcher) and the `/how` workflow-bot vs agent-bot merged chat race. files=17

### 3.6A · One scenario corpus for every demo, written and translated once
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** architecture

#### Summary
The site tells two stories (support edge cases, and Gmail/PR/Slack/schedule) and keeps 6 diverging copies of them. Make a single typed corpus in which a scenario is facts plus beats, rendered as race, chat, split, terminal or timeline, and localized once into 14 locales instead of six times.

#### Description
`/how` places the race and the chat back to back (`src/app/how/page.tsx:56-62`), and they tell the same four stories with different facts. Scenario names differ: "Ambiguous Email" vs "Ambiguous Request" (`agents-timeline/data.ts:19` vs `agents-chat/data.ts:23`), "Error Recovery" vs "Batch Recovery" (`:97` vs `:99`). The ids differ too (`split-payment` vs `split-refund`, `:44` vs `:47`). For the same ambiguous-email failure, the race says the customer waits "for hours" (`agents-timeline/data.ts:30`) while the chat says "Expected wait: 47 minutes" (`agents-chat/data.ts:32`). Neither directory calls `useTranslation` (0 files), across 39 chat message texts and 45 race step labels. The second story set, Gmail/PR/Slack/schedule, is re-authored in `playground-split/data.ts@HEAD:40-86` (the only i18n'd copy, pending), `agent-playground/data.ts:14,34,53,72`, `playground-timeline/data.ts` and `src/app/playground/data.ts`.

The moonshot is `src/data/scenarios/`. Each scenario has an id, its facts (order #, amounts, wait times, satisfaction), and per-lens beats (race steps, chat messages, split tools) that reference the facts instead of restating them. The copy goes into an `en.ts` `scenarios` namespace once and is hand-translated once. Every demo is a renderer. Facts can carry Race card A's trace provenance. This removes the largest block of untranslated user-facing copy on `/how` and makes contradictions unrepresentable.

#### Flow
- Build the corpus for the 4 shared support scenarios. Point race and chat at it with no visual change.
- Lift the corpus copy into en.ts, then 13 hand translations (the repo's rule), so `/how`'s two sections are fully localized.
- Fold in the Gmail/PR/Slack/schedule set and port the split, agent-playground, timeline and `/playground` renderers.
- A vitest asserting every lens of a scenario cites the same facts.

#### Expected impact
Non-English visitors get a localized `/how`, and the owner edits a story once. Measure duplicated scenario definitions (≈6 sets → 1) and untranslated strings on `/how`. Risk: race and chat beats differ legitimately (steps vs utterances), so the corpus must share facts, not force one beat shape.

#### Evaluation
Claim: quality - consistency plus localization coverage
Before: 2 story sets × up to 4 copies; ≥3 name/id/fact contradictions between adjacent `/how` sections; 0% i18n in race and chat
After: 1 corpus; contradictions blocked by construction; race and chat translated in 14 locales
Method: simulation - (1) ambiguous-email: `facts.humanWait` is set once, and race "Stuck…" plus chat "Expected wait" both render it; (2) vip-discount exists only in the race, so the corpus allows lens-optional scenarios; (3) falsified if the translation cost per string is not lower than today's scattered extraction (it should be, since 84 strings are extracted once rather than per component)
Result: better
Gate: architecture

#### First experiment
Move `ambiguous-email` facts (order #4821, wait, satisfaction) into one object and make both data files reference it. Count the contradictions the type checker or test now catches.

#### Evidence
- `src/components/sections/agents-timeline/data.ts:18-19,30,44,96-97` vs `src/components/sections/agents-chat/data.ts:22-23,32,47,98-99` - same stories, divergent names/ids/facts
- `src/app/how/page.tsx:56-62` - the two sections are adjacent on one page
- `src/components/sections/agent-playground/data.ts:14,34,53,72` - Gmail/PR/Slack/schedule set re-authored
- grep: 0 `useTranslation` in agents-chat, agents-timeline, agent-playground

### 3.6B · Your sentence, really planned: a live planner behind the free-text box, ending in a real template
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 9/10  ·  **Risk:** 6/10  ·  **Gate:** policy-loosen

#### Summary
The agent playground already has the free-text box every visitor wants to use, and it answers "No scripted simulation matches this prompt" to anything off-script. Put a small model behind it: a server route returns a structured plan (intent, tools from the real connector catalog, approval gate, emitted event, memory), the existing renderer plays it, and the run ends at the closest real template with "open in Personas".

#### Description
`AgentPlayground` takes free text but matches only on the first word of four labels (`src/components/sections/agent-playground/index.tsx:80-81`). "triage my Outlook" plays the Gmail script, "summarize my emails" plays Slack, and anything else gets `noMatchLines` (`agent-playground/data.ts:5-10`). The component is preview-only, and the public `/playground` runs 6 canned prompts. The renderers already have a structured target: split's `ExamplePrompt` is exactly `{intentText, tools[], result:{messages, humanReview, events, memories}}` (`playground-split/types.ts@HEAD:18-26`). The site has 57 real templates (`src/lib/templates.ts`), including the demos' own subjects (`gmail-inbox-triage` `:40`, `slack-channel-summarizer` `:122`, `github-pr-reviewer` `:202`). Yet no demo links to a specific template. Only `/playground` links to the `/templates` index (`src/app/playground/page.tsx:71`).

The moonshot adds `POST /api/plan`. It is rate-limited with the existing `rateLimitGuard` (`src/app/api/votes/rate-limit.ts:7-16` pattern), and the key is server-only per CLAUDE.md §6. It calls a small model with a schema-constrained output whose `tools` enum comes from the connector catalog and whose `template` enum comes from `templates.ts`, replying in the visitor's locale. The plan plays through the run renderer, then shows "closest template: Inbox Triage → Open in Personas". Prompts are never sent to Sentry (§5) and are not stored.

**Bends, explicitly:** (1) the site gains a paid, abusable LLM dependency (cost cap plus kill-switch flag required). (2) Model output is user-facing text outside `en.ts`, a deliberate exception to §1, mitigated by locale-targeted generation. (3) The handoff exposes that `personas://template/<id>` is unhandled by the desktop (`../personas/src-tauri/src/boot/deep_link.rs:19-61` has no template route), so it needs either that route or the existing `personas://import/<slug>`.

#### Flow
- An offline eval first: 50 real visitor-style prompts → plans, judged for tool validity and template fit.
- `/api/plan` behind a flag on `/preview/agent-playground`: structured output, rate limit, cost ceiling.
- Template handoff, with the desktop `template` deep-link route (cross-repo).
- Promote to `/playground` (existing route, no path change), keeping the canned prompts as instant examples.

#### Expected impact
The highest-intent visitors, the ones who type their own job, get a plan for *their* work and a one-click path into the product. Measure the share of free-text submits that produce a valid plan, template-click rate and cost per plan. Risk: the model plans a tool Personas lacks or hallucinates capability, so the enum constraint and "closest template" framing are load-bearing.

#### Evaluation
Claim: user - off-script prompts get a real answer
Before: 4 prompts matched (by first word, with misfires); everything else gets "No scripted simulation matches"; 0 demo-to-template links
After: any prompt gets a schema-valid plan over real connectors plus a named template
Method: simulation - (1) "triage my Outlook": today it plays the Gmail script; planned, it gives Outlook tool (if in catalog) or nearest + gmail-inbox-triage; (2) "chase unpaid invoices every Friday": today no match; planned, a schedule trigger, finance tools and a Finance-category template; (3) falsified if the offline eval shows template fit under ~70%, which would mean the catalog cannot back open-ended prompts
Result: unmeasurable
Gate: policy-loosen

#### First experiment
Run 30 typed prompts through a model offline with the `ExamplePrompt` JSON schema plus a template-id enum. Score tool validity and template fit by hand, with no site code.

#### Evidence
- `src/components/sections/agent-playground/index.tsx:80-81` - first-word matcher
- `src/components/sections/agent-playground/data.ts:5-10` - the "no scripted simulation" dead end
- `src/components/sections/playground-split/types.ts@HEAD:18-26` - a ready structured-output target
- `src/lib/templates.ts:40,122,202` - real templates matching the demos' subjects
- `src/app/templates/[id]/TemplateDetail.tsx:89` and `../personas/src-tauri/src/boot/deep_link.rs:19-61` - template deep link fired but never routed
