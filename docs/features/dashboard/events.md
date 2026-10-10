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
  `sourceId`), retry a single dead-lettered event, **discard** one you have
  judged unrecoverable, or multi-select dead-lettered events and **bulk-retry
  or bulk-discard** them from a sticky bottom bar. A `failed` event offers no
  verb: like on the desktop, the automatic retry owns it until it re-queues or
  escalates to the dead letter. The **Dead Letter** filter is
  a working queue, not a read-out: every row in it carries both verbs, and the
  lane drains to empty as you resolve them.
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
`/api/events/stream`, and it forwards `Authorization: Bearer <TEAM_API_KEY>` (the
server-only key) only for a
verified session: the `X-User-Token` header must pass `verifySession`
(`src/app/api/orchestrator/userSession.ts`). An anonymous caller gets 401
`unauthenticated`, an unreachable Supabase gets 503 `auth_unavailable`, an unset
orchestrator URL gets 503 `orchestrator_not_configured`, and with
`ORCHESTRATOR_TARGET=desktop` the route answers 501 `not_on_desktop` because the
desktop serves no events stream. None of these reads the key or fetches the
orchestrator. `EventSource` sends no token, so today the browser's stream request is
refused and `useEventStream` falls back to its 10s polling. A transport that carries
the session is a later choice. When the request is allowed, the route wraps the
upstream body in a `ReadableStream` that injects a `: keep-alive` SSE comment every
25s so idle connections survive load-balancer/CDN idle timeouts. It maps AbortError
to 499, upstream-unreachable to a structured `{ error: "upstream_unreachable" }` 502,
and clamps out-of-range upstream statuses to 502 to avoid `Response` `RangeError`. It
never leaks the orchestrator hostname.

**Visualization.** `EventBusVisualization` is loaded with `dynamic(..., { ssr: false })` from `EventsVisualizationView` — it sits behind the non-default `visualization` tab, and `ssr: false` also keeps it off the server-rendered path, which matters because it branches its markup on `prefersReduced`. It lays out nodes with `nodePosition` (polar
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
| `src/components/dashboard/views/events/index.tsx` | Page shell, tab state, background image, title + connection dot |
| `src/components/dashboard/views/events/events-page/EventsPageTabs.tsx` | Roving-tabindex tablist (events/subscriptions/visualization/swimlane) |
| `src/components/dashboard/views/events/events-page/EventsVisualizationView.tsx` | Visualization tab: stats, Test-Flow button, legend, node grid, drawer |
| `src/app/api/events/stream/route.ts` | **Real** SSE proxy to the orchestrator with heartbeat injection; forwards the team key only for a verified session (401 otherwise, 501 `not_on_desktop` on the desktop target); tested in `stream.test.ts` |
| `src/hooks/useEventStream.ts` | EventSource lifecycle, reconnect backoff, polling fallback |
| `src/hooks/useEventTopology.ts` | BFS over `sourceId` links → event-chain components |
| `src/lib/eventWireStatus.ts` | Desktop status vocabulary on the wire -> web `EventStatus` (`fromWireEventStatus`), the desktop transition pairs, `MAX_MANUAL_RETRIES` / `AUTO_RETRY_LIMIT` |
| `src/lib/eventWireStatus.test.ts` | Wire adapter specs (`delivered`/`completed` -> `processed`, `skipped`) |
| `src/lib/eventStatusFsm.ts` | The event delivery FSM: the desktop matrix projected through the adapter, `assertEventTransition`, retry-budget landing |
| `src/lib/eventStatusFsm.test.ts` | FSM transition + retry-budget specs |
| `src/lib/eventStatusFsm.desktopParity.test.ts` | Parity against a literal copy of the desktop's `can_transition_to` (event.rs:108-128); verbs on `dead_letter` only |
| `src/lib/mockApi.eventLifecycle.test.ts` | Mock write-through of a retry count; the `failed -> dead_letter` auto-retry sweep |
| `src/stores/eventStore.ts` | Zustand store: events buffer, replay/DLQ/discard, subscriptions |
| `src/stores/eventStore.test.ts` | Store specs: retry re-queues the row, discard verdict, lockout |
| `src/stores/eventStore.rowRetry.test.ts` | Row-owned retry: one `updateEvent`, no publish, budget 5, in-flight rows survive a poll |
| `src/components/dashboard/EventsListPanel.tsx` | Events tab: fetch, stream, filter, chains, bulk retry |
| `src/components/dashboard/events-list-panel/EventsListColumns.tsx` | `DataTable` column builder (select, status, persona, chain, retry, discard) |
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

- **Source:** Demo-only. List/replay/discard/subscriptions read mocks via `api.*` →
  `src/lib/mockApi.ts` (`listEvents`, `publishEvent`, `updateEvent`,
  `listAllSubscriptions`, …) backed by `MOCK_EVENTS` (`src/lib/mockData.ts`) /
  `MOCK_SUBSCRIPTIONS`. `updateEvent` writes the status (and a re-queue's
  `retryCount`) back into the `MOCK_EVENTS` array, so the next poll sees it.
  Every fixture carries `retryCount`. `MOCK_EVENTS` has dead-letter and failed
  fixtures, so the Dead Letter filter can be watched draining. The "No subscription
  matched" fixture (ev-8) is `skipped`, as the desktop records it. The demo has no
  dispatcher, so `listEvents` plays the desktop's auto-retry sweep on each read:
  a `failed` row spends one attempt and escalates to `dead_letter` once
  `AUTO_RETRY_LIMIT` (3) is spent (`increment_retry_or_dead_letter`). A re-queued
  row stays `pending`, like on a desktop that has not dispatched it yet. The
  visualization, swimlane, and drawer use static fixtures from
  `src/lib/mock-dashboard-data.ts` (`SWARM_PERSONAS`, `SWARM_SOURCES`, `EVENT_TYPES`,
  `MOCK_SWIMLANE_EVENTS`, `SWIMLANE_WINDOW_MS`, `SwarmNode`). `EventBusStats` counters
  are pure simulation (a `setInterval` jittering numbers).
- **Stores:** `eventStore` (Zustand) — `events: PersonaEvent[]` (newest-first, capped
  at `MAX_EVENTS_BUFFER = 1000`), an incremental `eventIds: Set` for O(1) dedupe,
  `connectionStatus`, `replayingIds`, `discardingIds`, and the subscription slice.
  The retry count lives on the row (`PersonaEvent.retryCount`), not in the store
  or the browser. Also reads `usePersonaStore` (persona avatars/names) and
  `useAuthStore` (`isDemo`). `fetchEvents` **merges** rather than replaces, so SSE
  events that arrived mid-flight aren't dropped on a refetch, and a row with a
  retry or discard in flight keeps its local version until the write settles.
- **API routes:** `/api/events/stream` (real SSE proxy; the only server route this
  surface owns). Everything else routes through the `api` client, which is the mock
  layer in this repo.
- **Types:** `PersonaEvent`, `PersonaEventSubscription`, `CreateEventInput`,
  `EventStatus` — `pending | processing | processed | skipped | failed |
  dead_letter | discarded` (`src/lib/types.ts`), the desktop's eight statuses
  read through `fromWireEventStatus` (`delivered`/`completed` -> `processed`);
  `PersonaEvent.retryCount: number | null` (null on the Supabase plane: the
  sync mirror does not ship `retry_count`); the transition table, `assertEventTransition`
  and the `isEventRetryable` / `isEventDiscardable` predicates
  (`src/lib/eventStatusFsm.ts`); `SwarmNode`, `SwimlaneEvent`, `EventFlow`
  (`src/lib/mock-dashboard-data.ts`); `Particle`, `BurstRing`, `Point`
  (`eventBusGeometry.ts`); `ConnectionStatus`, `ReplayLockedError`,
  `MAX_MANUAL_RETRIES`, `isReplayLocked` (`eventStore.ts`).

## Integration points

- **Orchestrator** (`NEXT_PUBLIC_ORCHESTRATOR_URL`) — only contacted by the SSE proxy
  route, and only when configured; auth via `TEAM_API_KEY` /
  `x-user-token`.
- **`eventStore`** is shared: the page header tab counts (`tabCounts`), `ConnectionStatusIndicator`, `EventsListPanel`, and
  `SubscriptionsPanel` all read from it; subscription mutations also
  `mutate(dashboardKeys.agentDetail(personaId))` to refresh the agents surface.
- **`usePersonaStore`** supplies persona avatars in the list's persona column.
- **`DataTable`** (generic table), `FilterBar`, `EmptyState`, `StatusBadge`,
  `PersonaAvatar`, `StalenessIndicator` — shared dashboard primitives.
- **`useReducedMotion`** (framer-motion) gates every animated surface here.
- `data-tour-diagram="dashboard-events"` on the Events tab anchors the guided tour.

## Loading tiers

Per the [loading standard](loading-orchestration.md):

- **T0** — title, `ConnectionStatusIndicator`, subtitle (`index.tsx:45`), no entrance; the decorative background image is outside the tiers.
- **T1** — the page tab strip, `ARRIVE` index 0 (`index.tsx:54`).
- **T2** — the active tab's panel (`EventsListPanel` / `SubscriptionsPanel` / `EventSwimlane` / the visualization tab's `EventBusStats` + persona grid), one `ARRIVE` wrapper at index 1 (`index.tsx:73`). It is shared by every tab, so the entrance plays once with the view and a tab switch swaps content in place.
- **T3** — the event-bus swarm SVG (`EventsVisualizationView.tsx:98`): `<Deferred order={0} preload={loadEventBusVisualization}>`. The SVG is a responsive square (`w-full max-w-[560px]`, 500×500 viewBox), so the reservation is an invisible `ghost` of exactly that square (`SWARM_BOX`) with `minHeight={0}`, and the chunk's `loading` is the same empty square (the old `animate-pulse` 420px block was neither delayed nor the right height). The chunk still downloads only when the visualization tab opens.

The framer `staggerContainer`/`fadeUp` entrance was replaced by the CSS cascade. `EventSwimlane` is a visualization but keeps its card chrome inside the shared component, so it cannot be split into T1 chrome + T3 body from this view; it mounts as T2.

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
- **`EventBusStats` counters are simulated, but its connection state is real.**
  It reads `connectionStatus` from `eventStore` (an earlier version of this doc
  claimed it hardcoded `connected = true` — that is no longer true). The three
  counters are still random walks on a `setInterval`, so don't read the
  throughput numbers as live; the title-bar `ConnectionStatusIndicator` remains
  the authority on stream health.
- **The status FSM is the only writer of `event.status`.** `eventStore.transitionEvent`
  calls `assertEventTransition` *before* its `set()`, so an illegal move throws
  `IllegalEventTransitionError` and leaves the buffer untouched — a discarded event
  cannot be resurrected and a processed one cannot be re-failed. The table in
  `src/lib/eventStatusFsm.ts` is derived, not hand-written: the desktop's
  `can_transition_to` projected through `eventWireStatus.ts`, pinned by
  `eventStatusFsm.desktopParity.test.ts`:
  `pending -> processing | processed | skipped | failed`;
  `processing -> processed | skipped | failed`; `failed -> pending | dead_letter`;
  `dead_letter -> pending | discarded`; `processed`, `skipped` and `discarded` are
  terminal. Retry and discard are offered on `dead_letter` only: the desktop's DLQ
  commands run `WHERE status = 'dead_letter'`.
- **Retry re-queues the same row; the budget lives on it.** `replayEvent` is the
  desktop's `retry_dead_letter`: one `api.updateEvent(id, { status: "pending",
  retryCount: n + 1 })`, no publish, no new event. The optimistic `dead_letter ->
  pending` is rolled back (not transitioned) if the write fails. A row at
  `MAX_MANUAL_RETRIES = 5` (the desktop's cap) is **replay-locked**: it throws
  `ReplayLockedError` with no api call. A null count (Supabase plane) is unknown,
  not spent, so the backend's own cap decides. `replayEvents` (bulk) is the same
  code path per item. It pre-filters locked and non-retryable rows as `skipped`,
  batches in groups of 10 via `Promise.allSettled`, and trips a **circuit
  breaker** after 5 *consecutive* failures (resets on any success), returning
  `{ succeeded, failed, aborted, skipped }`. Before 2026-10 a retry published a
  brand-new event, marked the original `processed`, and kept a 3-try budget in
  one browser's localStorage (`event-replay-retry-counts`, now gone from the
  storage register).
- **Discard is the second verb the dead letter needs.** `discardEvent` /
  `discardEvents` write `discarded` through `api.updateEvent` and track in-flight
  rows in `discardingIds` (the mirror of `replayingIds`). Both are exposed per-row
  in the actions column and in bulk from `EventsBulkRetryBar`. `store.reset()`
  clears the buffer and both id sets.
- **Supabase plane: mapper only.** `supabaseApi.mapEventStatus` reads the
  synced desktop string through `fromWireEventStatus` (it used to send
  `delivered`, `completed` and `skipped` to `pending`). `publishEvent` /
  `updateEvent` there are still read-only stubs.
- **Known gap:** the `RetryButton` in `EventExpandedContent.tsx` calls
  `void replayEvent(event)` with no `.catch`, so a lock or a failed write is an
  unhandled rejection (owned by the dead-letter triage card).
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
- **The particle loop is an AMBIENT loop, gated on BOTH signals.** An
  `IntersectionObserver` in `EventBusVisualization.tsx` covers off-screen, and
  `usePageVisibility()` inside `useEventBusParticles.ts` covers a backgrounded tab.
  Before `c6de33f` only the observer could re-arm `requestAnimationFrame`, so returning
  to a backgrounded tab left the bus frozen until the element's intersection state
  happened to change. `inViewRef` is optimistically set true on FIRST activation only
  (`startedRef`) — resetting it on a visibility change would restart a scrolled-away
  loop. `useEventBusParticles.ts` no longer disables
  `custom-animation/require-animation-gating`; `usePageVisibility` is an accepted gate.
  The reduced-motion gate still lives one level up (`if (prefersReduced) return`, plus
  `EventBusParticles` returning `null`), which is safe only because the parent loads the
  component via `dynamic(..., { ssr: false })`. Do not server-render it.
- **`_personaPos` monkeypatch.** Particles stash their outbound persona target via a
  cast-and-assign (`(particle as Particle & { _personaPos: Point })._personaPos`) in
  `useEventBusParticles` rather than on the typed `Particle` interface — fragile but
  intentional to keep the public geometry type clean.
- **i18n.** All strings come from `t.eventsPage.*`, `t.dashboardUi.*`, `t.common.*`,
  `t.executionsPage.*`, `t.memoriesPage.*`. The events surfaces are fully keyed as of
  `aa75f5d` — the former stragglers (the `Dead Letter` filter chip, the `ms` suffix,
  `Fast`/`Normal`/`Slow`, the swim-lane `now` / `-Nm` axis ticks, the raw
  `success`/`failure`/`processing` legend keys and the `"... at ..."` dot `aria-label`)
  now live under `eventsPage.deadLetter`, `eventsPage.durationMs` / `durationFast` /
  `durationNormal` / `durationSlow`, and `eventsPage.swimlane.*`.
- **The swim-lane axis has its own COMPACT keys** — `eventsPage.swimlane.axisNow` and
  `axisMinutes` (`'{n}m'`) — deliberately NOT `dashboard.staleness.justNow` /
  `minutesAgo`. Five absolutely positioned `text-sm` labels share one `1fr` column in
  the `grid-cols-[8rem_1fr]` axis row, so these are chart-axis labels: translators get
  the terse form (`сейчас`, `jetzt`), never the staleness-pill sentence. The number
  still travels with its unit inside one interpolated message, so unit placement and
  RTL stay the translator's call. Leave `dashboard.staleness.*` alone —
  `StalenessIndicator` uses it and it is correct there. French `maintenant` is the
  widest label in the set; it lands on the right-aligned rightmost tick, so it grows
  away from its neighbour, but eyeball it first if the axis ever looks tight.
- **`EventDrawerMetadata` reads duration strings from `useTranslation()` directly**,
  not through the `labels` prop `EventDetailDrawer` passes for `timestamp`/`duration`.
  Two sources in one component is deliberate, not drift: the prop shape is owned by
  the drawer.
- **Token drift.** `EventDrawerPayload` uses raw `text-white/60` and the visualization
  components use literal `rgba(...)` fills/strokes inside SVG (acceptable for SVG
  paint, but the `text-white/60` is a semantic-token violation — prefer
  `text-foreground/…` style tokens).
- **Headerless columns carry `sr-only` names.** `DataTable` renders an ARIA table
  (`role="table"`/`row"`/`columnheader"` divs, not a native `<table>`), so a
  column's accessible name comes from its header content and there is no
  `<th>`-style fallback. Five of the events columns are headerless by design
  (select, status glyph, persona avatar, retry pill, actions); each ships its
  name through the `ColumnName` `sr-only` wrapper in `EventsListColumns.tsx`
  rather than an empty string. `Column.header` is typed `React.ReactNode` for
  exactly this. If you add a headerless column here, wrap a name the same way.
- **Star-topology chains.** `useEventTopology` connects all children of a `sourceId`
  to the *first* child (O(k), same connected component as all-pairs) — the chain
  count is correct but the implied graph edges are a star, not a clique. It runs only
  over the currently *visible* slice, so a chain can shrink as you paginate.

- **Desktop plane: the list is not served.** With `NEXT_PUBLIC_DATA_SOURCE=desktop`, `desktopApi.listEvents` rejects with the proxy's typed 501 `not_on_desktop` (`GET /api/events`, no request sent). `eventStore.fetchEvents` sets `listNotServed` on that 501 (cleared by the next successful read; any other error leaves it and the rows stale), and `EventsListPanel` shows `DesktopUnsupportedNote` instead of its empty state while it is set and no events are held. Other readers of `listEvents` (home triage queue, mission readings, event bus stats, `useEventStream`) are unchanged. The subscription read is handled the same way: `desktopApi.listAllSubscriptions` and `listSubscriptions` reject locally with the 501 `not_on_desktop` body (`GET /api/personas/:id/subscriptions`, no request sent; create, update and delete are not overridden). `eventStore.fetchSubscriptions` sets `subscriptionsNotServed` on that 501 (cleared by the next successful read; reset clears it; any other error leaves it and the rows), and `SubscriptionsPanel` renders `DesktopUnsupportedNote` in place of the whole panel (no toolbar, create button or empty state) while it is set and no subscriptions are held. The Events page tab counts follow the same rule through `events-page/tabCounts.ts`: the Events count is hidden while `listNotServed` is set and no events are held, and the Subscriptions count is hidden until the first successful subscription read (`eventStore.subscriptionsRead`, cleared by reset), on every plane including demo, so it never reads 0 before the Subscriptions tab is opened. The page does not prefetch subscriptions for the badge.

## Related docs
- [Execution History & Streaming](executions.md)
- [Dashboard shell & chrome](shell-chrome.md)
- [Feature index](../INDEX.md)
