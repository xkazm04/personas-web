# Bug Hunter Fix Wave 3 — SSE + Streaming Reliability

> 4 commits, 4 findings closed (1 Critical + 3 High).
> Baseline preserved: `tsc --noEmit` 0 → 0 errors.

This wave bundled findings around a single mental model: **"the server-
sent-events pipeline is two proxies + one reader + one merge — and each
of the four had a class of bug that, individually, looked OK but
combined to produce silent staleness, reconnect storms, and double-
delivery."** Closing them in one session made the cross-cutting
patterns (heartbeat, status clamp, single-slot reconnect timer,
non-destructive merge) easier to reason about.

## Commits

| # | Commit | Findings closed | Severity | Files |
|---:|---|---|---|---|
| 1 | `2dc18b5` fix(executions): wrap SSE proxy in try/catch + clamp upstream status | execution-history #1 | C | `app/api/executions/[id]/stream/route.ts` |
| 2 | `273929b` fix(events): add 25s SSE heartbeat + clamp upstream status | event-bus #4 | H | `app/api/events/stream/route.ts` |
| 3 | `971f9d2` fix(events): cancel prior reconnect timer before scheduling new one | event-bus #2 | H | `hooks/useEventStream.ts` |
| 4 | `7619167` fix(eventStore): merge SSE-arrived events into fetchEvents result | event-bus #3 | H | `stores/eventStore.ts` |

## What was fixed (grouped by failure mode)

### 1. SSE proxy crash storm (commit 1)

The execution SSE proxy at `/api/executions/[id]/stream` did
`await fetch(streamUrl, …)` with no try/catch and forwarded
`upstream.status` directly into `new Response(…, { status })`. Two
failure modes combined:

- The fetch itself throws (DNS, ECONNREFUSED, TLS, AbortError on client
  disconnect). The exception propagated as a Next.js 500 with no body.
  EventSource interprets that as "the connection died with no useful
  info" and reconnects immediately, repeatedly — an infinite reconnect
  storm that pegs both the proxy and the orchestrator until the user
  closes the tab.
- The upstream succeeds with a status the Response constructor rejects
  (1xx informational, 0 on some Node fetch impls when the response was
  never assembled). Response throws `RangeError`, again the route
  returns an opaque 500 → reconnect storm.

The fix mirrors the pattern already in the events SSE route: try/catch
around the upstream fetch (AbortError → 499 silently, everything else →
JSON 502 the client can branch on), and a clamp on `upstream.status`
(anything outside 200-599 normalized to 502 before forwarding).
Hostnames stay server-side. Same status clamp added to the events SSE
route too (commit 2) — `upstream.status || 502` would have allowed a
1xx through and tripped the same RangeError there.

### 2. Idle SSE connections silently die (commit 2)

The events SSE proxy forwarded `upstream.body` raw with no traffic
during idle periods. Idle EventSource connections silently die behind
load balancers / corporate proxies / CDNs with idle timeouts of 30-60s.
EventSource fires no `error` event when the close arrives cleanly, so
the dashboard's `ConnectionStatusIndicator` stayed "Connected" while
the user thought live events were arriving but weren't. Wrap
`upstream.body` in a `ReadableStream` that injects a `: keep-alive`
comment line every 25s. Comment lines (starting with `:`) are filtered
out by the EventSource parser per the SSE spec, so they don't pollute
the event log. The `req.signal` abort listener tears down both the
heartbeat timer and the upstream reader on client disconnect.

### 3. Stacking reconnect timers → double-connect (commit 3)

`EventSource.onerror` could fire twice in rapid succession (e.g. proxy
returns a non-2xx status, then the underlying TCP connection also
drops). The handler ran `setTimeout(connect, reconnectMs)` on each
error without clearing the prior timer ref, so an orphaned T1 still
fired ~1s later. When it ran `connect()` it bypassed the just-
rescheduled T2 path, producing two parallel `EventSource` instances on
the same proxy endpoint — every event was delivered twice. The store's
`appendEvent` dedupes by id so the user wasn't visibly affected, but
the network/store work doubled per event and the proxy held twice as
many sockets per dashboard tab.

Clear `reconnectTimer` before scheduling the next one. Defensively
close any leftover `es` at the top of `connect()` so a future race
that calls `connect()` while a stale `EventSource` is still attached
doesn't leak parallel sockets either.

### 4. Destructive replace on fetchEvents drops SSE-arrived events (commit 4)

`fetchEvents` replaced the events array wholesale with the
`listEvents` response. A fetch dispatched at t=0 with `limit=100`
doesn't include events the SSE stream delivered locally at t=0.5 —
they were still in flight at the orchestrator when the `listEvents`
query ran. The pain was worst during reconnect: the SSE-arrived events
from the just-restored stream were exactly the signal of "what
happened while we were disconnected", and `fetchEvents` nuked them.
Merge by id, preserving any current event whose id isn't in the
fetched set, sort descending by `createdAt`, and cap at
`MAX_EVENTS_BUFFER`. `eventIds` is rebuilt from the merged array so
it stays in sync with the visible events.

## Verification table

| Gate | Before wave | After wave |
|---|---:|---:|
| `tsc --noEmit` errors | 0 | 0 |
| Wave-3 commits | 11 (cumulative from waves 1-2) | 15 |
| Critical findings closed (cumulative) | 7 / 9 | 8 / 9 |
| High findings closed (cumulative) | 8 / 75 | 11 / 75 |

## Cumulative status (after wave 3)

- 19 of 178 findings closed (10.7%).
- **8 of 9 criticals closed**; 1 remains (`useCanvasCompositor`
  IntersectionObserver leak across HMR/strict-mode in
  `shared-ui-primitives-animations`).
- 11 of 75 highs closed.

| Wave | Theme | Closed |
|---:|---|---:|
| 1 | A. Security / Auth / Vote integrity | 8 |
| 2 | B. State corruption (personas/reviews/event-bus stores) | 7 |
| 3 | C. SSE + streaming reliability | 4 |
| 4 | D. Animation lifecycle / observer cleanup / visibility pause | — |
| 5 | E. SSR / hydration / theme + i18n flash | — |
| 6 | F. Data integrity / SEO / ordering | — |
| 7 | G. A11y / focus / scroll-lock / modal lifecycle | — |

## Patterns established (catalogue items 9–12)

9. **Two SSE proxies should share their hardening.** When you ship two
   proxies that wrap the same upstream pattern (auth-key header
   injection + body forwarding), every defense one needs the other
   needs too: try/catch around `fetch`, status clamp before forwarding,
   abort handling, heartbeat. Lift the wrap into a small helper before
   you have a third proxy.
10. **Heartbeats prevent silent connection death, not loud connection
    failure.** EventSource fires `error` on a TCP RST or non-2xx open
    response, but a clean `FIN` from a proxy idle-timeout looks like
    "the server intentionally closed" — the browser reconnects without
    surfacing anything. Long-lived SSE connections need server-side
    heartbeats (`: keep-alive\n\n` per the SSE spec) to keep the LB,
    proxy, and CDN hops awake. The 25s default is conservative; tune
    based on the shortest known idle timeout in your hop chain.
11. **Single-slot timer refs are fragile under burst error semantics.**
    Anywhere code does `xTimer = setTimeout(…)`, ask: "can the producer
    fire twice before the timer runs?" If yes, clear the prior ref
    before assigning. Common places this bites: `EventSource.onerror`,
    `WebSocket.onclose`, `setInterval` reset patterns, debouncers
    sharing a ref. Same shape as the wave-2 review-bulk-undo and
    persona-mutex fixes.
12. **Non-destructive replace on stream re-sync.** When polling +
    streaming both feed the same store, the polled response is a *base
    snapshot* and the streamed messages are *deltas applied since*. A
    `set({ events })` from polling discards the deltas. Merge by id
    (newest-first), preserve unique items from both sources, cap at
    buffer size. This pattern repeats in messaging clients,
    observability dashboards, and any "live + history" UX.

## What remains (across the open themes)

- **Theme D (Animation lifecycle)** — 1 critical (`useCanvasCompositor`
  IO leak across HMR/strict-mode) + ~15 visibility/cleanup findings.
  Many would be closed by a shared `useVisibilityPause` hook + audited
  cleanup pattern. Recommended next.
- **Theme E (SSR / hydration / theme + i18n flash)** — no criticals;
  4-5 fixes around flash-of-unstyled-content and SSR/CSR mismatch.
- **Themes F, G** — bigger surface area; data integrity / SEO and a11y.

## Deliberately deferred (out of scope this wave)

- `useLiveStats` module-level cache + sticky `warnedOnce`
  (event-bus-observability finding #5) — fits with theme D
  (visibility/lifecycle) better than with stream proxy hardening.
- Reconnect-cap protection (orchestrator outage detection) — a
  cross-cutting "suspend reconnects after N consecutive failures and
  surface to the user" feature; fits with the toast-bus integration
  deferred from wave 2.
- Execution polling infinite-retry behavior
  (execution-history finding #3) — partially mitigated by the SSE
  status clamp in this wave (since the polling fallback only kicks in
  when SSE truly fails); a dedicated polling cap is a small follow-up
  but doesn't share this wave's mental model.

Recommended next wave: **Theme D (Animation lifecycle / observer
cleanup / visibility pause)** — has the last remaining critical
(`useCanvasCompositor` IO leak), and 15+ findings would be closed by a
single `useVisibilityPause` primitive applied across the showcase
sections. After D, all 9 criticals are closed.
