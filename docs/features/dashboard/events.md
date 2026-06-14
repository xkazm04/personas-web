# Event Bus & Stream Monitoring
> Live event-bus topology, swimlanes, a filterable/bulk-retriable event list, and an SSE-fed detail drawer for the agent event bus · **Route:** `/dashboard/events` · **Nav label:** "Events" · **Status:** Demo-only UI + real SSE proxy

## What it does

The Events surface is the operator's window onto the platform's event bus — the
message backbone that fans inbound triggers (GitHub, Slack, webhooks, cron, REST,
email) into the persona agents that react to them. It has four tabs:

- **Events** (default) — a live, filterable list of every `PersonaEvent`: status,
  source, target persona, event type, retry count, and time. You can full-text
  search, filter by status / event type / source type, drill into a row to see its
  JSON payload and error, follow "related event" chains (events linked by
  `sourceId`), retry a single failed event, or multi-select failed events and
  **bulk-retry** them from a sticky bottom bar.
- **Subscriptions** — which personas subscribe to which event types (handled by
  `SubscriptionsPanel`, documented elsewhere).
- **Visualization** — an animated SVG topology: source nodes on an outer ring,
  persona nodes on an inner ring, a central "BUS" hub, and glowing particles that
  flow source → hub → persona. A "Test Flow" button fires a burst; clicking any
  node opens a detail drawer with a mock payload, traffic-volume bar, and status.
- **Swimlane** — one horizontal lane per persona, a colored dot per event placed by
  time across a 15-minute window, with a hover tooltip.

A connection-status dot next to the page title shows whether the stream is
`connected`, `reconnecting`, or `polling`.

## How it works

**List + stream.** `EventsListPanel` is the heart of the Events tab. On mount it
calls `fetchEvents()` once and starts `useEventStream()`. In demo mode the hook
polls `api.listEvents({ limit: 100 })` every 10s (and on tab re-focus); against a
real orchestrator it opens an `EventSource` to `/api/events/stream`, appends each
`event` message to the store (deduped), and falls back to polling with exponential
backoff (1s → 30s) on disconnect. The list is filtered/searched client-side, capped
to a growing `visibleCount` (200 + "Load more" of 200), and renders through the
generic `DataTable`. `useEventTopology` runs a BFS over the visible events' `sourceId`
links to compute connected components ("chains"); clicking a chain badge dims all
non-chain rows.

**SSE proxy (the one real backend touch-point).** `src/app/api/events/stream/route.ts`
is a genuine streaming route handler. It proxies the orchestrator's
`/api/events/stream`, forwarding `Authorization: Bearer <NEXT_PUBLIC_TEAM_API_KEY>`
and an optional `X-User-Token`, then wraps the upstream body in a
`ReadableStream` that injects a `: keep-alive` SSE comment every 25s so idle
connections survive load-balancer/CDN idle timeouts. It maps AbortError → 499,
upstream-unreachable → a structured `{ error: "upstream_unreachable" }` 502, and
clamps out-of-range upstream statuses to 502 to avoid `Response` `RangeError`. It
never leaks the orchestrator hostname.

**Visualization.** `EventBusVisualization` lays out nodes with `nodePosition` (polar
geometry, `eventBusGeometry.ts`) and drives particles via `useEventBusParticles` —
a 60fps `requestAnimationFrame` loop that mutates particle/burst arrays in refs and
calls `forceRender` once per frame (deliberately not React state, to avoid
per-frame array allocation). Particles travel a quadratic Bézier inbound to the hub,
then re-target outbound to a random persona, spawning a burst ring at each hop. An
`IntersectionObserver` pauses the loop when the SVG scrolls out of view, and
`document.hidden` pauses it when the tab is backgrounded.

**Detail drawer.** `EventDetailDrawer` is a `role="dialog"` slide-in panel with a
focus trap (`useDialogFocusTrap`: Esc to close, Tab cycling, focus restore to the
trigger or page `<h1>`). Its event type, duration, and timestamp are randomized once
via lazy `useState` initializers; the payload comes from `mockPayloadForNode` (a
per-node-id lookup of realistic mock JSON), syntax-highlighted by `highlightJson`.

## Key files

| File | Role |
| --- | --- |
| `src/app/dashboard/events/page.tsx` | Page shell, tab state, background image, title + connection dot |
| `src/app/dashboard/events/events-page/EventsPageTabs.tsx` | Roving-tabindex tablist (events/subscriptions/visualization/swimlane) |
| `src/app/dashboard/events/events-page/EventsVisualizationView.tsx` | Visualization tab: stats, Test-Flow button, legend, node grid, drawer |
| `src/app/api/events/stream/route.ts` | **Real** SSE proxy to the orchestrator with heartbeat injection |
| `src/hooks/useEventStream.ts` | EventSource lifecycle, reconnect backoff, polling fallback |
| `src/hooks/useEventTopology.ts` | BFS over `sourceId` links → event-chain components |
| `src/stores/eventStore.ts` | Zustand store: events buffer, replay/DLQ, subscriptions |
| `src/components/dashboard/EventsListPanel.tsx` | Events tab: fetch, stream, filter, chains, bulk retry |
| `src/components/dashboard/events-list-panel/EventsListColumns.tsx` | `DataTable` column builder (select, status, persona, chain, retry) |
| `src/components/dashboard/events-list-panel/EventsFiltersToolbar.tsx` | Search input + status/eventType/sourceType filters + chain pill |
| `src/components/dashboard/events-list-panel/EventsBulkRetryBar.tsx` | Sticky bottom bulk-retry bar |
| `src/components/dashboard/events-list-panel/EventExpandedContent.tsx` | Expanded row: ids, payload viewer, error + retry |
| `src/components/dashboard/events-list-panel/EventTypeBadge.tsx` | Icon+color badge per event type |
| `src/components/dashboard/events-list-panel/eventPanelTypes.ts` | `EventPanelLabels` = the `t` translation tree type |
| `src/components/dashboard/JsonViewer.tsx` | `formatPayload` / `highlightJson` + copy-to-clipboard payload box |
| `src/components/dashboard/EventBusStats.tsx` | Simulated live counters (events/sec, total, connections) |
| `src/components/dashboard/EventBusVisualization.tsx` | SVG topology orchestrator + IntersectionObserver gating |
| `src/components/dashboard/event-bus-visualization/eventBusGeometry.ts` | Constants, `Point`/`Particle`/`BurstRing` types, polar + Bézier math |
| `src/components/dashboard/event-bus-visualization/useEventBusParticles.ts` | RAF particle/burst simulation (refs + forceRender) |
| `src/components/dashboard/event-bus-visualization/EventBusDefs.tsx` | SVG `<defs>`: hub/particle glow filters, per-persona gradients |
| `src/components/dashboard/event-bus-visualization/EventBusHub.tsx` | Central pulsing "BUS" hub |
| `src/components/dashboard/event-bus-visualization/EventBusNodes.tsx` | Source + persona node renderers (clickable) |
| `src/components/dashboard/event-bus-visualization/EventBusParticles.tsx` | Particle dots + burst rings (returns null under reduced motion) |
| `src/components/dashboard/event-bus-visualization/EventBusStaticRings.tsx` | Static spoke lines + orbit circles |
| `src/components/dashboard/EventDetailDrawer.tsx` | Node detail dialog (focus trap, volume bar, status, payload) |
| `src/components/dashboard/event-detail-drawer/*` | Drawer header/summary/metadata/payload, `mockPayloadForNode`, `useDialogFocusTrap` |
| `src/components/dashboard/EventSwimlane.tsx` | Per-persona time-lane view over a 15-min window |
| `src/components/dashboard/SwimlaneLane.tsx` | One lane: time-positioned dots + clamped hover tooltip |
| `src/components/dashboard/ConnectionStatusIndicator.tsx` | Title-bar dot reading `connectionStatus` from the store |

## Data & state

- **Source:** Demo-only. List/replay/subscriptions read mocks via `api.*` →
  `src/lib/mockApi.ts` (`listEvents`, `publishEvent`, `updateEvent`,
  `listAllSubscriptions`, …) backed by `MOCK_EVENTS` / `MOCK_SUBSCRIPTIONS`. The
  visualization, swimlane, and drawer use static fixtures from
  `src/lib/mock-dashboard-data.ts` (`SWARM_PERSONAS`, `SWARM_SOURCES`, `EVENT_TYPES`,
  `MOCK_SWIMLANE_EVENTS`, `SWIMLANE_WINDOW_MS`, `SwarmNode`). `EventBusStats` counters
  are pure simulation (a `setInterval` jittering numbers).
- **Stores:** `eventStore` (Zustand) — `events: PersonaEvent[]` (newest-first, capped
  at `MAX_EVENTS_BUFFER = 1000`), an incremental `eventIds: Set` for O(1) dedupe,
  `connectionStatus`, `replayingIds`, `retryCounts` (persisted), and the
  subscription slice. Also reads `usePersonaStore` (persona avatars/names) and
  `useAuthStore` (`isDemo`). `fetchEvents` **merges** rather than replaces, so SSE
  events that arrived mid-flight aren't dropped on a refetch.
- **API routes:** `/api/events/stream` (real SSE proxy; the only server route this
  surface owns). Everything else routes through the `api` client, which is the mock
  layer in this repo.
- **Types:** `PersonaEvent`, `PersonaEventSubscription`, `CreateEventInput`,
  `EventStatus` (`src/lib/types.ts`); `SwarmNode`, `SwimlaneEvent`, `EventFlow`
  (`src/lib/mock-dashboard-data.ts`); `Particle`, `BurstRing`, `Point`
  (`eventBusGeometry.ts`); `ConnectionStatus`, `ReplayLockedError`,
  `MAX_REPLAY_RETRIES` (`eventStore.ts`).

## Integration points

- **Orchestrator** (`NEXT_PUBLIC_ORCHESTRATOR_URL`) — only contacted by the SSE proxy
  route, and only when configured; auth via `NEXT_PUBLIC_TEAM_API_KEY` /
  `x-user-token`.
- **`eventStore`** is shared: the page header counts (`events.length`,
  `subscriptions.length`), `ConnectionStatusIndicator`, `EventsListPanel`, and
  `SubscriptionsPanel` all read from it; subscription mutations also
  `mutate(dashboardKeys.agentDetail(personaId))` to refresh the agents surface.
- **`usePersonaStore`** supplies persona avatars in the list's persona column.
- **`DataTable`** (generic table), `FilterBar`, `EmptyState`, `StatusBadge`,
  `PersonaAvatar`, `StalenessIndicator` — shared dashboard primitives.
- **`useReducedMotion`** (framer-motion) gates every animated surface here.
- `data-tour-diagram="dashboard-events"` on the Events tab anchors the guided tour.

## Conventions & gotchas

- **The real SSE proxy is dormant in this repo.** `useEventStream` short-circuits to
  polling whenever `isDemo` is true (`useEventStream.ts:38`), and the demo dashboard
  runs in demo mode — so `/api/events/stream` (and its `EventSource`/backoff path)
  only executes against a configured non-demo orchestrator. When reasoning about
  demo behavior, the stream is *polling*, never SSE. The route returns **503** if
  `NEXT_PUBLIC_ORCHESTRATOR_URL` is unset (`route.ts:12`).
- **Stream/polling is mounted only inside `EventsListPanel`, not the page.**
  `useEventStream()` and the initial `fetchEvents()` live in the list component
  (`EventsListPanel.tsx:43-46`), so switching to the Visualization/Swimlane/
  Subscriptions tabs unmounts the list and **stops the live stream/poll**; the
  title-bar connection dot then reflects the last status until you return.
- **`EventBusStats` is decoupled from real connection state.** It hardcodes
  `connected = true` (`EventBusStats.tsx:68`) and its three counters are random
  walks on a `setInterval` — it always shows "Connected" and fake throughput
  regardless of `connectionStatus`. Don't read it as live health; that's the
  title-bar `ConnectionStatusIndicator`'s job.
- **Replay lockout & retry budget.** `replayEvent` counts the *attempt* up front
  (not success) and persists `retryCounts` to `localStorage`
  (`event-replay-retry-counts`); once an event hits `MAX_REPLAY_RETRIES = 3` it's
  **replay-locked** and throws `ReplayLockedError`. This is intentional — the prior
  shape only counted successes, so an always-failing handler could be retried
  forever. `replayEvents` (bulk) pre-filters locked events as `skipped`, batches in
  groups of 10 via `Promise.allSettled`, and trips a **circuit breaker** after 5
  *consecutive* failures (resets on any success), returning
  `{ succeeded, failed, aborted, skipped }`. `store.reset()` clears the persisted
  counts.
- **Counts attempts globally, not per-handler** — the retry budget is keyed by event
  id, and `localStorage` is shared across all browser tabs, so retries in one tab
  count against another. Lockout survives reloads but not `reset()`.
- **Animation gating.** `useEventBusParticles.ts` disables
  `custom-animation/require-animation-gating` (plus `react-hooks/refs` and
  `react-hooks/immutability`) at the top of the file by design: reduced-motion
  gating is enforced one level up in `EventBusVisualization` (the RAF effect is
  guarded by `if (prefersReduced) return`, and `EventBusParticles` returns `null`).
  Under reduced motion the SVG shows a static "Event flow animation paused" caption,
  the hub/node `<animate>` SMIL elements are omitted, and the drawer's status ping is
  suppressed. If you touch the particle hook, keep the parent's `prefersReduced`
  guard intact rather than re-enabling the rule locally.
- **React 19 purity.** Randomized values are correctly cached in lazy `useState(() =>
  …)` initializers in `EventDetailDrawer` (eventType/duration/timestamp). Note two
  impure spots that are *not* in render: `bezierControlPoint` uses `Math.random()`
  but is only called inside the RAF spawn path (`useEventBusParticles`), and
  `mockPayloadForNode` computes `s_cron.next_run` with `Date.now()` at call time
  (drawer render) — harmless for mock display but don't copy the pattern into a hook
  or `useMemo`.
- **`_personaPos` monkeypatch.** Particles stash their outbound persona target via a
  cast-and-assign (`(particle as Particle & { _personaPos: Point })._personaPos`) in
  `useEventBusParticles` rather than on the typed `Particle` interface — fragile but
  intentional to keep the public geometry type clean.
- **i18n.** All strings come from `t.eventsPage.*`, `t.dashboardUi.*`, `t.common.*`,
  `t.executionsPage.*`, `t.memoriesPage.*`. Watch for stragglers: the `"Dead Letter"`
  filter label (`EventsFiltersToolbar.tsx:60`) and the `"Fast"/"Normal"/"Slow"` +
  `"ms"` duration qualifiers (`EventDrawerMetadata.tsx`) are **hardcoded English** —
  fix these by adding keys to `en.ts` and all 13 locales if you go near them.
- **Token drift.** `EventDrawerPayload` uses raw `text-white/60` and the visualization
  components use literal `rgba(...)` fills/strokes inside SVG (acceptable for SVG
  paint, but the `text-white/60` is a semantic-token violation — prefer
  `text-foreground/…` style tokens).
- **Star-topology chains.** `useEventTopology` connects all children of a `sourceId`
  to the *first* child (O(k), same connected component as all-pairs) — the chain
  count is correct but the implied graph edges are a star, not a clique. It runs only
  over the currently *visible* slice, so a chain can shrink as you paginate.

## Related docs
- [Execution History & Streaming](executions.md)
- [Dashboard shell & chrome](shell-chrome.md)
- [Feature index](../INDEX.md)
