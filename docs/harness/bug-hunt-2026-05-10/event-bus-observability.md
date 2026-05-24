# Bug Hunter — Event Bus & Observability

> Total: 7 findings (Critical: 1, High: 3, Medium: 2, Low: 1)
> Scope: 11 files (sampled from 31)
> Date: 2026-05-10

Files read (selective sample, prioritizing SSE / streams / stores):

- `src/app/api/events/stream/route.ts`
- `src/hooks/useEventStream.ts`
- `src/hooks/useEventTopology.ts`
- `src/hooks/useLiveStats.ts`
- `src/stores/eventStore.ts`
- `src/stores/systemStore.ts`
- `src/components/dashboard/EventBusVisualization.tsx`
- `src/components/dashboard/EventBusStats.tsx`
- `src/components/dashboard/EventSwimlane.tsx`
- `src/components/dashboard/EventsListPanel.tsx`
- `src/components/dashboard/LatencyChart.tsx`
- `src/components/dashboard/TrafficChart.tsx`
- `src/components/dashboard/ObservabilityCharts.tsx`
- `src/app/dashboard/events/page.tsx`
- `src/lib/dev.ts`

---

## 1. `replayEvent` only counts SUCCESSFUL replays toward the retry lockout — broken handlers can be retried forever

- **Severity**: Critical
- **Category**: Logic / silent failure / DLQ amplification
- **File**: `src/stores/eventStore.ts:125-161`
- **Scenario**: A user clicks "Retry" (or "Retry All") on a failed event whose downstream handler is permanently broken (e.g., 4xx from a downstream tool).
  1. `replayEvent` calls `api.publishEvent(...)` which throws.
  2. Catch block runs: it removes the id from `replayingIds`, then re-throws `new Error("Replay failed")`.
  3. The catch block **never updates `retryCounts`**. `retryCounts[event.id]` is only incremented on the success path (line 142-150).
  4. `isReplayLocked` therefore returns `false` indefinitely for events that always fail.
  5. The user (or bulk Retry-All) can replay the same broken event without bound.
- **Root cause**: Increment of `retryCounts` lives inside the success branch, not in a `finally` or in the failure branch. The intent of `MAX_REPLAY_RETRIES = 3` (per the comment on line 10-12: *"the underlying handler is almost certainly broken and re-publishing just floods the bus with events that re-enter the DLQ"*) is **inverted by the implementation**: the lock fires when a handler works 3 times, not when it has failed 3 times.
- **Impact**: 
  - DLQ amplification: a broken handler creates a feedback loop where Retry-All re-publishes the same poison message every time.
  - Circuit breaker (line 192-197) only catches *consecutive* failures within a single `replayEvents` batch — it does NOT prevent the same event from being retried in the next user-initiated batch.
  - Cost / quota burn against orchestrator and any downstream APIs.
  - The skipped-count UI feedback never triggers, so users have no signal to stop trying.
- **Fix sketch**: Move retry-count increment to the failure path (or, better, do it in a `finally` block so any attempt — successful or not — counts):
  ```ts
  // After publishEvent (in finally, or duplicated in catch):
  set((s) => {
    const nextRetryCounts = {
      ...s.retryCounts,
      [event.id]: (s.retryCounts[event.id] ?? 0) + 1,
    };
    saveRetryCounts(nextRetryCounts);
    return { retryCounts: nextRetryCounts };
  });
  ```
  Add a unit test that asserts `retryCounts[id] === 3` after three thrown publishes.

---

## 2. SSE reconnect storm: `onerror` can stack reconnect timers and double connections

- **Severity**: High
- **Category**: Race condition / resource leak
- **File**: `src/hooks/useEventStream.ts:123-139`
- **Scenario**:
  1. Server returns 502 (`upstream_unreachable` from `route.ts:44-50`). Browser EventSource fires `onerror`.
  2. Handler does `es?.close(); es = null; ...; reconnectTimer = setTimeout(connect, reconnectMs)`.
  3. Some browsers (Chromium when an upstream resets mid-handshake, Firefox after `close()` during pending bytes) fire `onerror` a second time on the same EventSource instance before the close fully tears down.
  4. The handler runs again: it calls `es?.close()` (no-op because `es` is `null`), then **overwrites** `reconnectTimer = setTimeout(...)` without clearing the previous one. The previous timer keeps a reference to its own callback and will still fire.
  5. Both timers fire → two `connect()` calls → two live `EventSource` instances on `/api/events/stream`.
  6. Each instance can append events independently. Dedup via `eventIds` masks duplicates *for the same id*, but doubles the inbound bandwidth and orchestrator-side fan-out cost. On long-lived sessions this compounds.
- **Root cause**: No guard `if (reconnectTimer) clearTimeout(reconnectTimer)` before scheduling a new one inside `onerror`. Also no guard that `connect()` doesn't already have a live `es`.
- **Impact**: Reconnect-storm symptom under flaky upstream — the orchestrator sees N parallel SSE consumers per browser tab, and N can grow unboundedly across a long bad-network session because `RECONNECT_MAX_MS = 30s` caps the *delay*, not the *count*. Worse during reconnect-storm windows when many tabs do this simultaneously.
- **Fix sketch**: 
  ```ts
  es.onerror = () => {
    es?.close();
    es = null;
    if (disposed) return;
    if (reconnectTimer) return; // already scheduled — coalesce
    setStatusRef.current("reconnecting");
    scheduleFallbackPolling();
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, reconnectMs);
    reconnectMs = Math.min(reconnectMs * 2, RECONNECT_MAX_MS);
  };
  ```
  Additionally, in `connect()` add `if (es) { es.close(); es = null; }` at the top.

---

## 3. `fetchEvents` (polling) clobbers in-flight SSE events — silent event loss on every reconnect

- **Severity**: High
- **Category**: Race condition / silent data loss
- **File**: `src/stores/eventStore.ts:91-101` + `src/hooks/useEventStream.ts:84-93`
- **Scenario**:
  1. SSE drops; `onerror` fires; fallback polling starts, `setTimeout(fetchEvents, 10s)` queued.
  2. SSE reconnects 4s later via `connect()` (which calls `stopFallbackPolling()` — good).
  3. But the orchestrator's snapshot endpoint replays ~100 events from the recent past via `api.listEvents({ limit: 100 })`. SSE simultaneously delivers fresh events that arrived during the disconnect window.
  4. Race: SSE event X (id=`evt_42`) arrives at T+10ms via `appendEvent` → events list = `[X, ...prior]`, eventIds includes X.
  5. Concurrent `fetchEvents` resolves at T+30ms with API list `[Y, Z, ...]` (snapshot taken before X published). It does:
     ```ts
     set({ events, eventIds: new Set(events.map((e) => e.id)) });
     ```
     This **wholesale replaces** the events array and `eventIds` Set — wiping X without merge.
  6. X is now lost from the UI. The next SSE message for X (if any) won't re-arrive (orchestrator already delivered it once). The events list is silently incomplete; user sees a phantom gap in the swimlane / event chain.
- **Root cause**: `fetchEvents` does a destructive replace instead of merging by id. Polling and SSE are not mutually exclusive (fallback polling can still be running when SSE recovers).
- **Impact**: 
  - Audit-trail integrity: the dashboard cannot be trusted to show the actual event sequence during any network blip.
  - Worst-case: an event that fired *exactly* during a reconnect window vanishes from the UI even though it's persisted upstream — until the user manually reloads the page.
  - DLQ retry UX: replays that successfully publish during a reconnect will appear to "fail" because the new event id never makes it to the events list, breaking the perceived feedback loop.
- **Fix sketch**: Merge instead of replace in `fetchEvents`:
  ```ts
  fetchEvents: async () => {
    set({ eventsLoading: true });
    try {
      const fresh = await api.listEvents({ limit: 100 });
      set((s) => {
        const ids = new Set(s.eventIds);
        const merged: PersonaEvent[] = [];
        // SSE-arrived events not in API snapshot, prepended (newest-first)
        for (const e of s.events) {
          if (!fresh.some((f) => f.id === e.id)) merged.push(e);
        }
        for (const e of fresh) ids.add(e.id);
        const next = [...merged, ...fresh].slice(0, MAX_EVENTS_BUFFER);
        return { events: next, eventIds: new Set(next.map((e) => e.id)) };
      });
    } catch { /* leave stale */ }
    finally { set({ eventsLoading: false }); }
  },
  ```

---

## 4. SSE proxy has no heartbeat — idle connections silently die behind reverse proxies/CDNs

- **Severity**: High
- **Category**: Latent failure / silent failure
- **File**: `src/app/api/events/stream/route.ts:63-69`
- **Scenario**:
  1. User opens the dashboard. `useEventStream` connects via `new EventSource("/api/events/stream")`.
  2. Route handler proxies `upstream.body` directly to the client with `Content-Type: text/event-stream`, no heartbeat injection.
  3. Real traffic is bursty — a quiet hour produces zero events and zero bytes flow.
  4. Vercel's edge proxy / CDN / corporate proxy / Cloudflare idle timeouts (typically 60–100s) tear down the TCP connection mid-stream. No bytes have flowed → no error frame → from the orchestrator's perspective the consumer "vanished". The browser EventSource may fire `onerror` (good — triggers reconnect) **or may not** depending on TCP keepalive settings vs. proxy behavior; on macOS Safari and several mobile carriers the connection sits in a CLOSE_WAIT half-state and `onerror` doesn't fire for several minutes.
  5. During those minutes: no events delivered, fallback polling NOT started (because `onerror` hasn't fired yet — line 130 is the only path that starts polling), connectionStatus still says "connected".
- **Root cause**: 
  - No periodic comment frame (`: keepalive\n\n`) emitted by the proxy or by the orchestrator (the orchestrator behavior is out of scope but the proxy could inject heartbeats independently).
  - No `runtime = "edge"` or explicit no-buffering hint; default Node response handling on Next.js 16 may also buffer in some deployments, deferring even real events.
  - `connectionStatus` in `eventStore.ts:89` is purely event-driven by `setStatusRef.current(...)`. There's no watchdog timer that flips status to `reconnecting` after N seconds of silence.
- **Impact**: Dashboard appears live (green Wifi indicator in `EventBusStats.tsx:104-115`) while events are silently being missed. The "Connected" badge becomes a lie. Users won't know to reload.
- **Fix sketch**: 
  - Have the proxy interleave heartbeat comments. Pattern: `TransformStream` that reads upstream, forwards bytes, and on a 15s timer writes `:hb\n\n` if no bytes flowed. Heartbeat comments are ignored by EventSource consumers.
  - In the client hook, add a watchdog: track `lastBytesAt` (updated on `event` AND on `onmessage` for any heartbeat), and if `Date.now() - lastBytesAt > 45_000`, force `es?.close()` to provoke reconnect. EventSource doesn't expose comment frames natively, so the heartbeat must be a typed `event: heartbeat` frame the client can listen for.
  - Set `Cache-Control: "no-cache, no-transform, no-store"` and consider `X-Accel-Buffering: no` (some reverse proxies respect this) on the response.

---

## 5. EventSource error path is fully swallowed — no diagnostics ever reach Sentry

- **Severity**: Medium
- **Category**: Silent failure / observability gap
- **File**: `src/hooks/useEventStream.ts:109-139`
- **Scenario**:
  1. `addEventListener("event", ...)` wraps `JSON.parse(e.data)` in a `try { ... } catch {}` (line 110-115) that comments "Ignore malformed messages".
  2. If the orchestrator ever emits a malformed payload (e.g., truncated by upstream proxy, or wrong JSON shape post-deploy), every event is silently dropped. There is no Sentry capture, no console.warn (even in dev), no UI signal.
  3. `onerror` on the EventSource (line 123) likewise has no `Sentry.captureMessage` — it just flips status and reconnects.
  4. Operators have zero signal that the dashboard is broken short of a user complaint.
- **Root cause**: Error handling treats all runtime failures as transient and benign. There's no distinction between "one bad frame" (recoverable) and "every frame is bad" (production incident).
- **Impact**: A bad orchestrator deploy that breaks SSE payload schema produces a totally green-looking dashboard with stale data. Mean time to detection becomes "next time someone notices", not "next minute".
- **Fix sketch**: 
  - Swap the silent catch for a once-per-session Sentry breadcrumb / `captureMessage` (gated like `useLiveStats`'s `warnedOnce`):
    ```ts
    } catch (err) {
      if (!warnedOnce) {
        warnedOnce = true;
        Sentry.captureMessage("useEventStream: malformed SSE payload", {
          level: "warning",
          extra: { sample: e.data?.slice(0, 200) },
        });
      }
    }
    ```
  - In `onerror`, capture once after `reconnectMs >= RECONNECT_MAX_MS` (i.e., we've been failing for >= 30s) — this is the actionable signal that upstream is genuinely unreachable, not a transient blip.

---

## 6. `useLiveStats` module-level cache never invalidates → indefinitely stale stats

- **Severity**: Medium
- **Category**: Latent failure / data staleness
- **File**: `src/hooks/useLiveStats.ts:45-48,69-104`
- **Scenario**:
  1. First mount of any page using `useLiveStats` issues `fetch('/api/stats')`.
  2. Response is stored in module-level `let cachedResult` (line 45). Subsequent mounts in the same browser session take the early `return` at line 70 and never refetch.
  3. There is no TTL, no `Date.now()` check, no visibility-based revalidation. Stats reflect the moment-of-first-load until the user reloads the page.
  4. The home/leaderboard/SLA pages reuse this hook to display "totalUsers / totalExecutions / coldStartSeconds". Marketing-facing numbers can drift many hours behind reality on a single SPA session.
  5. Compounding: `warnedOnce` (line 48) is also module-level. After one fetch failure or one malformed-shape detection, **every subsequent failure is silent for the rest of the session** — Sentry receives one warning then nothing, even if the API has now broken in a different way.
- **Root cause**: Module-level mutable state with no expiry. Designed as a session-cache without any of the typical SWR semantics (no revalidate-on-focus, no TTL).
- **Impact**: 
  - Marketing/dashboard numbers visibly drift across long sessions.
  - Sentry is muted for second-and-later failures — observability hole during multi-stage incidents.
- **Fix sketch**: 
  - Replace the `let cachedResult` with SWR (already imported elsewhere in the codebase via `swr`). Use `useSWR('/api/stats', fetcher, { revalidateOnFocus: true, dedupingInterval: 60_000 })`.
  - At minimum: store `{ result, fetchedAt }` and refetch when `Date.now() - fetchedAt > 5 * 60_000`.
  - Reset `warnedOnce` on every successful fetch so a subsequent failure is reported.

---

## 7. `EventBusVisualization` `spawnBurst` setTimeouts run after unmount

- **Severity**: Low
- **Category**: Resource leak / late ref mutation
- **File**: `src/components/dashboard/EventBusVisualization.tsx:155-170`
- **Scenario**:
  1. User clicks "Test Flow" on the events page (line 142 of `events/page.tsx`), which bumps `triggerBurst`.
  2. The effect at line 166-170 calls `spawnBurst(12)`, which schedules 12 `setTimeout`s spread over 720ms (`60ms * 12`).
  3. User immediately navigates away (or switches tab from `visualization` to `events`). The component unmounts; cleanup at line 261-263 cancels the RAF but **not** the 12 pending burst timeouts.
  4. Each timeout fires post-unmount and pushes onto `particlesRef.current`. The ref still exists in memory because `_particleId` and the spawn closure hold it. The push has no visible effect (no render scheduled), but it's a small leak per click and a code-smell that masks worse refactors later.
  5. If user re-enters the page during the 720ms window, the new mount's `particlesRef.current` is a fresh array, but the closure from the old mount still references the old ref → orphan particles that never animate or get cleaned.
- **Root cause**: `spawnBurst` doesn't track or clear its scheduled timeouts. The component cleanup only cancels RAF.
- **Impact**: Minor memory growth on rapid mount/unmount cycles (e.g., automated tests, dev hot-reload). No user-visible bug. Worth fixing as a hygiene matter before this code becomes a template for higher-frequency animation patterns.
- **Fix sketch**: Track timeouts in a ref:
  ```ts
  const burstTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const spawnBurst = useCallback((count = 8) => {
    for (let i = 0; i < count; i++) {
      const t = setTimeout(() => spawnParticle(), i * 60);
      burstTimersRef.current.push(t);
    }
  }, [spawnParticle]);
  // in cleanup:
  burstTimersRef.current.forEach(clearTimeout);
  burstTimersRef.current = [];
  ```

---

## Notes on items deliberately out of scope

- `EventBusStats.tsx:65-66` — the "Connected" badge is hard-coded `true` (`useState(true)` never flipped). This is intentional fake-live UI for a marketing/demo page and not wired to the real `connectionStatus`. Calling it out as a *feature* request rather than a bug per the brief's exclusion list, but worth noting if the events page is ever upgraded to a real ops dashboard.
- `EventSwimlane.tsx:24` — `fetchedAt` is captured at mount and never refreshed. Window slides nowhere; events older than `SWIMLANE_WINDOW_MS` from mount-time disappear progressively, and the "now" tick on the right is a lie after a few minutes. This is also a feature/refresh-strategy issue and depends on whether the swimlane is meant to be live (clock-driven) or snapshot (mount-driven). Skipped.
- Chart divide-by-zero / single-point cases were checked in `LatencyChart`, `TrafficChart`, `ObservabilityCharts` — Recharts handles empty arrays gracefully; `TrafficChart` short-circuits at `chartData.length === 0`. No real bugs found in chart layer.
