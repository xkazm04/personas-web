# Event Bus Showcase
> An animated marketing showcase of a central message hub, with a swarm view and a lanes view (variant tabs) driven by a mock event generator · **Route:** `/how` (anchor `#event-bus`) · **Status:** Live (demo section)

## What it does
Illustrates how agents "talk to each other" through a central message hub. Two visual variants share one terminal-styled panel, switched by a tab strip:

- **Live Connections** (the `swarm` variant, default) — a radial "BUS" core ringed by tool icons (Gmail, Slack, GitHub, Jira, Figma, Notion, Discord, Python, Docker, Redis). Each tool fades in, pulses a particle toward the center, then fades out on its own staggered loop, reading as live activity converging on the hub.
- **Performance View** (the `lanes` variant) — one horizontal lane per producer→consumer route (e.g. Gmail→Jira), each showing a queue-depth fill bar, a travelling delivery dot, throughput (`msgs/s`), latency (`ms`), waiting count, and a relative delivery-time percentage.

The panel header reports a running "being sent / waiting" count, and a legend below shows the average ("typical") delivery time. A "Try it yourself — build a flow" button swaps the whole showcase for the interactive `FlowComposer` (deep link via `#flow=` hash). This is the *marketing* event-bus story on the `/how` page — distinct from the `/dashboard/events` operational monitoring surface.

## How it works
`EventBusShowcase` (`index.tsx`) is the container. It holds the active `variant` (`useState`, default `"swarm"`) and a telemetry `snapshot` seeded synchronously via `createSnapshot("bootstrap", queueRouteSeeds)` in a lazy `useState` initializer (`index.tsx:37`). A `useInView` ref (`margin: "200px"`, `once: false`) gates the data feed: when the panel enters view, an effect subscribes to a `QueueTelemetryAdapter` (the injectable `telemetryAdapter` prop, else `defaultTelemetryAdapter`) and unsubscribes on exit/unmount (`index.tsx:39-43`). The subscription pushes a fresh snapshot every 1400 ms.

From the snapshot, `index.tsx` derives `laneMetrics` (per-route producer/consumer/depth/latency/eps/color, `useMemo`) and `averageLatency` (rounded mean of route latencies). The panel renders one of two children by `variant`: `<SwarmView uid />` or `<LanesView laneMetrics inView />`.

- **SwarmView** (`SwarmView.tsx`) renders a single inline `<svg viewBox="0 0 100 100">`. The featured tool list comes from `swarmTools` (catalogue entries flagged `swarmFeatured`). For each tool, `computeSwarmTiming(i, total)` places it on a radius-35 perimeter circle and precomputes SVG SMIL timing (opacity ramp-in/hold/ramp-out/pause plus a travel pulse toward center `50,50`). Animation is **pure SVG SMIL** (`<animate>` / `<animateTransform>`, `repeatCount="indefinite"`) — no framer-motion, no `requestAnimationFrame`. Tool icons load from `/tools/{id}.svg`.
- **LanesView** (`LanesView.tsx`) maps `laneMetrics` to framer-motion lane cards. Each card has a `whileInView` entrance (staggered by index, `viewport once`), a queue-depth fill bar animated to `depthRatio*100%` (min 8%), and a delivery dot that loops `x: 0% → 2600%` only while `inView` is true (`repeat: Infinity` gated on the prop; pauses offscreen).
- **VariantTabs** (`VariantTabs.tsx`) is an accessible `role="tablist"` with ArrowLeft/ArrowRight roving focus and a framer-motion `layoutId` spring indicator under the active tab.
- **EventBusLegend** (`EventBusLegend.tsx`) is a static legend row plus the "typical delivery time" pill.

## Key files
| File | Role |
| --- | --- |
| `src/components/sections/event-bus-showcase/index.tsx` | Container: variant state, telemetry subscription gated on `useInView`, composer toggle, derived lane metrics + average latency, panel composition |
| `src/components/sections/event-bus-showcase/data.ts` | `QueueVariant` type, `queueRouteSeeds` (4 routes), `defaultTelemetryAdapter` (1400 ms mock), `swarmTools` (from catalogue), `variantTabs` labels/hints |
| `src/components/sections/event-bus-showcase/components/SwarmView.tsx` | Radial SVG/SMIL swarm: perimeter nodes, per-node lifecycle timing, particle pulse to center |
| `src/components/sections/event-bus-showcase/components/LanesView.tsx` | Per-route lane cards: framer-motion fill bars + delivery dot (gated on `inView`) |
| `src/components/sections/event-bus-showcase/components/VariantTabs.tsx` | Accessible tablist with arrow-key nav + spring `layoutId` indicator |
| `src/components/sections/event-bus-showcase/components/EventBusLegend.tsx` | Static legend + average-latency pill |
| `src/lib/event-bus-demo.ts` | Demo event generator: snapshot/pressure math + `createMockQueueTelemetryAdapter` (`setInterval` + `Math.random`) |
| `src/lib/tool-catalogue.ts` | Canonical tool registry; `swarmFeatured` flag selects swarm nodes |
| `src/components/sections/how-lazy.tsx` | `LazyEventBusShowcase` wrapper (`ssr: false`) + skeleton |
| `src/app/how/page.tsx` | Mounts `<LazyEventBusShowcase />` in a `StageSection` (anchor `#event-bus`) |

## Data & state
- **Source:** mock/demo only — `event-bus-demo.ts`'s `createMockQueueTelemetryAdapter` jitters 4 seeded routes (`queueRouteSeeds`) every 1400 ms with `Math.random()` inside a `setInterval` callback; swarm nodes come from the static `tool-catalogue.ts`. No live orchestrator call. **Stores:** none (no Zustand) — local `useState`/`useMemo` in `index.tsx` only; the adapter manages its own timer. **API routes:** none. **Types:** `QueueVariant` (`data.ts`); `QueueRouteSeed`, `QueueRouteMetric`, `QueueTelemetrySnapshot`, `QueueTelemetryAdapter` (`event-bus-demo.ts`); `ToolEntry` (`tool-catalogue.ts`).

## Integration points
- Mounted via `LazyEventBusShowcase` (`how-lazy.tsx:43`, `ssr: false`) inside a `StageSection` on `/how` (`how/page.tsx:67`); anchor target of the `EVENTS → #event-bus` scroll-map item. Wrapped by `SectionWrapper id="event-bus"` + `SectionIntro` inside the component.
- Reuses `tool-catalogue.ts` (`TOOL_MAP` for route labels/colors, `EXTENDED_TOOLS`/`swarmFeatured` for swarm nodes) — shared single source of truth with `FlowComposer`.
- The "build a flow" button lazy-loads `FlowComposer` (`next/dynamic`, `ssr: false`); opening/closing rewrites the URL hash (`#flow=` → `replaceState`). Initial open state reads `window.location.hash` so the composer can be deep-linked.
- `telemetryAdapter` prop is injectable — a real adapter (same `QueueTelemetryAdapter` shape) could replace the mock without touching the views.
- Theming via `BRAND_VAR` / `tint` (`brand-theme.ts`); typography eyebrows via `src/lib/typography.ts`; entrance via `fadeUp` (`src/lib/animations.ts`).

## Conventions & gotchas
- **All copy is hardcoded English, not i18n.** The `SectionIntro` heading/description and button (`index.tsx:73-90`), the panel header strings (`index.tsx:129-131`), tab labels/hints (`data.ts:67-70`), lane labels ("Waiting", "Delivery time", "msgs/s"), and legend text (`EventBusLegend.tsx`) never route through `useTranslation()`/`t.*`. This violates CLAUDE.md §1 — a localization pass must lift these into `src/i18n/en.ts` and all 13 other locales.
- **Reduced motion is NOT gated.** Neither `SwarmView` nor `LanesView` imports/checks `useReducedMotion`. The swarm runs continuous SVG SMIL (`<animate>`) and the lanes run an infinite framer-motion dot loop. SMIL is invisible to the `custom-animation/require-animation-gating` lint rule (it only flags `requestAnimationFrame`/`cancelAnimationFrame`), so nothing warns — but a `prefers-reduced-motion` user still sees both animations. Lanes do pause offscreen (`inView` prop) but not for reduced motion. Adding gating means either honoring `useReducedMotion()` in JS or wrapping the SMIL in a `@media (prefers-reduced-motion)` rule.
- **Variant id vs label mismatch.** Internal ids are `swarm` / `lanes`, but the UI labels them "Live Connections" / "Performance View" (`data.ts:67-69`). Search by id, not by visible label.
- **React 19 purity is respected.** `Math.random()` lives only in the adapter's `setInterval` callback (`event-bus-demo.ts:82-84`), and `Date.now()` in `createSnapshot` is reached only via the lazy `useState` initializer and the (non-render) subscription — none run in a render body or `useMemo` factory. Keep them out of render.
- **Swarm membership is data-driven.** To add/remove a swarm node, flip `swarmFeatured` in `tool-catalogue.ts` (and ensure a matching `/public/tools/{id}.svg` exists) — do not hardcode ids in `SwarmView`. Lane routes, by contrast, are the fixed 4 in `queueRouteSeeds`.
- **Telemetry only flows while in view.** The subscription is created on enter and torn down on exit (`once: false`); offscreen, the snapshot freezes at its last value. The seed snapshot keeps the panel populated before first scroll-in / on SSR-less mount.
- **Stale harness note:** older audits (`docs/harness/.../platform-showcase.md`) call this a 215-line "god component"; it has since been split — `index.tsx` is ~158 lines with tabs/views/legend extracted into `components/`.

## Related docs
- [Event Bus & Stream Monitoring (dashboard)](../dashboard/events.md)
- [Feature index](../INDEX.md)
