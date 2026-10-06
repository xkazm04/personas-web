# Event Hub (Event Bus Showcase)
> The live message hub restaged as a lit scene: real tool logos on a tilted orbit, each route relayed through a glass hub with a caption, a Live / Performance view switch, live hub figures and the build-a-flow composer · **Route:** `/how` (anchor `#event-bus`) · **Status:** Live (demo section)

## What it does
Shows how agents "talk to each other" through one hub, so the next agent starts when one
finishes. Two views share the stage, switched by a tab strip:

- **Live connections** ("who talks to whom", default) - thirteen real tool marks (Gmail, Jira,
  Slack, Drive, GitHub, Figma, Calendar, Stripe, Notion, Discord, Python, Docker, Redis) ride a tilted elliptical orbit around a glass **Message hub**, the back of the orbit
  smaller and dimmer than the front. Dashed spokes swirl into the hub; every tool keeps a
  trickle of ambient traffic flowing in. Every 3.6 s one **route** is relayed: a comet runs from
  the producer into the hub, the hub pulses, a comet runs out to the consumer, both tools light
  up, and a caption under the hub says what happened ("New email → ticket filed", "Slack thread →
  summary saved", "Pull request → design check", "Meeting ends → invoice sent").
- **Performance view** ("speed and backlog") - one lane per route: producer and consumer marks,
  a pipe whose fill is the backlog with packets passing the hub node in the middle, and live
  figures (msgs/s, waiting, delivery ms).

Under the stage a row of live hub figures (being sent, waiting, typical delivery) ticks with the
mock telemetry. **"Try it yourself: build a flow"** swaps the stage for the interactive
[Flow Composer](flow-composer.md), which also opens on its own when the URL carries a `#flow=`
deep link. This is the marketing story on `/how`, distinct from the `/dashboard/events`
monitoring surface.

## How it works
**Container.** `EventsV1` (`index.tsx:42`) holds `variant` (`"swarm" | "lanes"`, `:47`), a
telemetry `snapshot` seeded with `createSnapshot("bootstrap", ROUTE_SEEDS)` in a lazy `useState`
initializer (`:48`), and the composer toggle. One `useLoopGate(stageRef, { rootMargin: "200px" })`
(`:46`) decides everything: `run` (on screen, tab visible, motion allowed) drives the relay
stepper and every loop; `tick` (as `run`, but reduced motion abstains, since figures are not
motion) subscribes to `hubTelemetry` (`:52-55`), which pushes a new snapshot every 1400 ms.
`typical` is the rounded mean route latency (`:61-64`). `phone` (`useIsMobile`, under 48rem,
`:50`) picks the phone views and drops the composer; the section is `ssr: false`, so the branch
never meets a server render.

**Relay clock.** `useStepper(run && variant === "swarm", RELAY_MS)` (`index.tsx:49`;
`shared/useStepper.ts:11`) advances `step` every 3600 ms while running and wraps over the four
`ROUTE_SEEDS` (`telemetry.ts:22`).

**Live view.** `HubView` (`HubView.tsx:20`) is a `role="img"` box at `aspect-[11/5]` that, on the
stage, sizes itself to the slot height (`stage:w-[min(100%,calc(100cqh*var(--hub-ar)))]`,
`:30`). Geometry comes from one `makeOrbit()` factory (`geometry.ts:23`) with two drawings:
`WIDE` (1100 x 500, `:59`) and `NARROW` (400 x 400, `:73`). Its `nodes(n)` (`:43`) places
tools on the orbit ellipse with a `depth` (0 back, 1 front) and a bowed `spoke` / `spokeOut`
curve to the hub rim. `HubArt` (`HubArt.tsx:21`, given the drawing as `geo`) draws the floor
light, orbit track, the drawing's dashed rings turning at their own periods (`:69`), the spokes,
ambient comets on every spoke (`:90`), and the active relay: its traces stay lit, and a
`key={step}` group (`:108`) replays the
inbound comet (delay 0.1 s), the hub pulse (1.05 s) and the outbound comet (1.35 s). HTML
overlays place the hub label, the route caption (`AnimatePresence`, `HubView.tsx:45`), and the tool tiles,
scaled by depth, the consumer lighting at 2.1 s (`:63-95`). Marks come from `ToolMark`
(`shared/ToolMark.tsx:13`): `/tools/*.svg` silhouettes painted through a CSS mask, `python` and
`redis` as full-colour `<img>`, and `calendar`/`drive` aliased to the Google product marks.

**Phone views.** `PhoneHub` (`PhoneHub.tsx:19`) draws the `NARROW` orbit with only the four
routes' eight tools, producers on one half and consumers opposite (so every relay crosses the
hub), fixed `12.5cqw` tiles with 12px names, and the route caption under the drawing, where it can
wrap. `LanesPhone` (`LanesPhone.tsx`) stacks one card per route: producer -> consumer, the pipe
(hub node outside the clipped fill), and the three figures in a row. Same stepper, gate and
telemetry as the wide views.

**Performance view.** `LanesView` (`LanesView.tsx:34`) maps `snapshot.routes` to lane rows using
`laneFigures()` (`telemetry.ts:40`: sanitised depth/eps/delivery, fill = depth / 50, min 8%);
two packets per pipe loop through `loopTransition(run, ...)` and rest at fixed points otherwise.

**Tabs.** `Tabs` (`Tabs.tsx:11`) is a real `role="tablist"` with ArrowLeft/ArrowRight roving
focus and a framer `layoutId` pill.

**Composer.** `FlowComposer` is a `next/dynamic` import with `ssr: false` (`index.tsx:22`).
`deepLinked` reads `location.hash.startsWith("#flow=")` through `useSyncExternalStore` on
`hashchange` (`:26-31`, `:57`); `composerToggle` (`null` until the visitor clicks) overrides it
(`:58-59`). Closing clears the hash with `history.replaceState` (`:84`, `:101`). While open, the
composer replaces the view inside the same stage box, scrolling vertically (`:96-104`). On phones
the "build a flow" button is not rendered and `composerOpen` is forced false, deep link included.

## Key files
| File | Role |
| --- | --- |
| `src/components/sections/event-hub/index.tsx` | Section: loop gate, telemetry subscription, relay stepper, tabs, composer toggle + deep link, hub figures |
| `src/components/sections/event-hub/Tabs.tsx` | Live / Performance tablist (`HubVariant`) |
| `src/components/sections/event-hub/HubView.tsx` | Live view: aspect-locked box, hub label, route caption, orbit tool tiles |
| `src/components/sections/event-hub/HubArt.tsx` | SVG layer: floor, orbit, turning rings, spokes, ambient traffic, active relay, glass hub |
| `src/components/sections/event-hub/geometry.ts` | `makeOrbit()` -> `WIDE` / `NARROW` (hub, orbit, floor, rings, `nodes`, `pct`); `VB_W`/`VB_H`, `HUB`, `orbitNodes`, `pct` for the wide one |
| `src/components/sections/event-hub/PhoneHub.tsx` | Phone live view: eight-tool `NARROW` orbit, tiles, caption under the art |
| `src/components/sections/event-hub/LanesPhone.tsx` | Phone performance view: one stacked card per route |
| `src/components/sections/event-hub/LanesView.tsx` | Performance view: lanes with backlog fill, packets, live figures |
| `src/components/sections/event-hub/telemetry.ts` | `ROUTE_SEEDS` (4 routes), `hubTelemetry` (1400 ms mock), `ORBIT_TOOLS`, `laneFigures`, `ink` |
| `src/components/sections/event-hub/shared/ToolMark.tsx` | Real tool mark (masked silhouette or multicolour img) |
| `src/components/sections/event-hub/shared/useStepper.ts` | Step clock gated on `run`, reset via prev-state |
| `src/lib/event-bus-demo.ts` | `createSnapshot`, `createMockQueueTelemetryAdapter` (`setInterval` + `Math.random`) |
| `src/lib/tool-catalogue.ts` | `TOOL_MAP` (names, colours), `EXTENDED_TOOLS` with `swarmFeatured` |
| `src/components/sections/how-lazy.tsx` (`:43-47`) | `LazyEventBusShowcase` imports `event-hub` (`ssr: false`, bespoke terminal-shaped skeleton `:6-41`) |
| `src/app/how/page.tsx` (`:71-73`) | Mounts it in `StageSection id="event-bus"` |

## Data & state
- **Source:** mock only. `hubTelemetry = createMockQueueTelemetryAdapter(ROUTE_SEEDS, 1400)`
  (`telemetry.ts:29`) jitters the four seeded routes (gmail->jira, slack->drive, github->figma,
  calendar->stripe; same ids and seed figures as the previous section). Orbit membership is
  every route endpoint plus every `swarmFeatured` catalogue tool (`telemetry.ts:32-37`). No
  orchestrator call, no API routes.
- **Copy:** `t.howSections.events` (`src/i18n/en.ts`): `heading`, `headingGradient`,
  `description`, and `v1` (illustration label, tab labels/hints, `hub`, figure labels,
  `buildFlow`, and `routes` keyed by route id).
- **State:** `variant`, `snapshot`, `composerToggle` (`useState`), `step` (`useStepper`), the loop
  gate's verdict. No Zustand.
- **Types:** `HubVariant` (`Tabs.tsx:7`), `OrbitNode` (`geometry.ts:12`); `QueueRouteSeed`,
  `QueueRouteMetric` from `event-bus-demo.ts`.

## Integration points
- **`/how`** - `StageSection id="event-bus"` with the role-dependent glow (`how/page.tsx:71`);
  scroll-map item `EVENTS` (`:21`). The component's `SectionWrapper fit="fill" id="event-bus"`
  (`index.tsx:73`) repeats the id, so the page has two `section#event-bus`.
- **Stage fit** - `fit="fill"`; the `motion.div` under the intro is the `data-stage-slot`
  (`index.tsx:75`, inheriting `fadeUp`), the toolbar and the figures row carry `data-stage-zoom`
  (height-tier zoom), and the stage box between them is a `size` container the hub sizes
  against (`src/styles/stage.css`).
- **Flow Composer** - the only mount site of `FlowComposer` (`src/components/FlowComposer.tsx`);
  see [flow-composer](flow-composer.md).
- **e2e** - `e2e/reduced-motion.spec.ts` pins the hub art (`#event-bus [role="tabpanel"]
  [role="img"]`): two screenshots 1.5 s apart are identical under reduced motion and differ
  without it. `e2e/reduced-motion-hydration.spec.ts` pins that the streamed `section#event-bus`
  is adopted, never discarded and re-rendered.
- **Unit test** - `src/lib/motion/loop-gate.test.ts` scans `event-hub` (no framer
  `useReducedMotion`, no bare `repeat: Infinity`, no private `IntersectionObserver`, SMIL loops
  paused on the gate).

## Conventions & gotchas
- **Replaced 2026-10-06** by the owner-picked winner of the /how prototype review (the live hub
  restaged). The previous showcase (`src/components/sections/event-bus-showcase/`: SMIL
  `SwarmView`, `VariantTabs`, `EventBusLegend`, `data.ts`, `figures.ts` + `figures.test.ts`) is
  deleted and lives in git history. The lazy export and the preview slug keep the old name
  (`LazyEventBusShowcase` -> `event-bus-showcase`).
- **i18n - English only, pending translation.** Copy is in `howSections` (`PENDING_TRANSLATION`);
  the 13 other locales fall back to English. Tool names come from the catalogue and stay as-is.
- **Phones (under 48rem) get their own views, no composer.** `PhoneHub` fits the width (eight
  route tools; the five `swarmFeatured`-only tools are not on the phone orbit) and `LanesPhone`
  stacks the lanes; nothing scrolls sideways at 360-390px. The composer is a drag-and-wire
  canvas, so its button is hidden and a `#flow=` deep link does not open it on a phone. From
  48rem up the wide `HubView` (`min-w-[44rem]` below the stage) fits without scrolling; the
  tabpanel's `overflow-x-auto` is now only a guard.
- **Reduced motion is a complete still.** With `run` false the stepper stays on step 0 (the
  Gmail -> Jira relay), the active traces stay lit with its caption shown, rings and ambient
  comets rest, tile/caption transitions are `duration: 0`, and lane packets park mid-pipe.
  Figures keep ticking (`tick`) only in a visible, on-screen tab. The pulsing live dot in the
  figures row is CSS `animate-pulse`, covered by the global reduced-motion reset; the tab pill's
  `layoutId` spring is not gated.
- **`laneFigures` lost its test.** It moved into `telemetry.ts`; `figures.test.ts` went with the
  old folder, so nothing pins the sanitising and fill maths now.
- **Orbit membership is data-driven.** Flip `swarmFeatured` in `tool-catalogue.ts` (and make sure
  `/public/tools/{id}.svg` exists, or add an `ALIAS`) to change the wide orbit (the phone orbit is
  always the routes' endpoints); the relays are the
  fixed four `ROUTE_SEEDS`, and a new route needs a `v1.routes[id]` caption.
- **A11y.** `HubView` is `role="img"` with `v1.illustration`, so the caption and tool names inside
  it are not read; only the active tab's panel is rendered, so the inactive tab's
  `aria-controls` points at an id not in the DOM.
- **React 19 purity.** `Math.random()` and `Date.now()` run only in the adapter's interval and the
  lazy snapshot initializer; `useStepper` resets through the prev-state pattern.

## Related docs
- [Flow Composer & Playground](flow-composer.md)
- [Event Bus & Stream Monitoring (dashboard)](../dashboard/events.md)
- [Feature index](../INDEX.md)
