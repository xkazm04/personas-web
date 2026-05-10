# Bug Hunter — Execution History & Streaming

> Total: 7 findings (Critical: 1, High: 3, Medium: 2, Low: 1)
> Scope: 7 files
> Date: 2026-05-10

## 1. SSE proxy swallows fetch errors and returns invalid Response statuses

- **Severity**: Critical
- **Category**: Silent failure / runtime crash
- **File**: `src/app/api/executions/[id]/stream/route.ts:30-39`
- **Scenario**:
  1. Browser opens an EventSource against `/api/executions/<id>/stream`.
  2. Orchestrator is unreachable (DNS error, ECONNREFUSED, TLS handshake failure) or the request is aborted by `req.signal` while inflight.
  3. `await fetch(...)` throws (`TypeError`/`AbortError`). There is no `try/catch`, so the route handler rejects → Next.js returns a generic 500 with no body, and the EventSource will silently auto-reconnect forever, hammering both servers.
  4. Even on a clean fetch, when the orchestrator returns a non-OK status, the proxy does `new Response("...", { status: upstream.status })`. If upstream returned `1xx` (e.g., 100/101 from a misbehaving proxy) or `0` (cors-opaque), the `Response` constructor throws `RangeError: init["status"] must be in the range of 200 to 599`, killing the route.
- **Root cause**: No error handling around `fetch`; blind passthrough of `upstream.status` to a `Response` constructor that has stricter constraints than HTTP itself.
- **Impact**: 500s with no diagnostic body, infinite EventSource reconnect storms, log noise, and possible runtime crash for edge upstream statuses. Users see "Waiting for worker..." forever with no actionable error.
- **Fix sketch**:
  ```ts
  try {
    const upstream = await fetch(streamUrl.toString(), { headers, signal: req.signal });
    if (!upstream.ok || !upstream.body) {
      const body = await upstream.text().catch(() => "");
      const safeStatus = upstream.status >= 200 && upstream.status <= 599
        ? upstream.status
        : 502;
      return new Response(body || "Failed to connect to execution stream", { status: safeStatus });
    }
    return new Response(upstream.body, { headers: { ... } });
  } catch (err) {
    if ((err as Error).name === "AbortError") return new Response(null, { status: 499 });
    return new Response("Upstream unreachable", { status: 502 });
  }
  ```
  Also emit an SSE `event: error` frame instead of bare 5xx so the client can surface a real message.

## 2. `useExecutionPolling` reset race — output wiped after first poll of new id

- **Severity**: High
- **Category**: Race condition
- **File**: `src/hooks/useExecutionPolling.ts:31-38, 44-57`
- **Scenario**:
  1. User expands execution `A`, `useExecutionPolling("A")` runs, accumulates output.
  2. User collapses A and expands `B` quickly. The component remounts with a new `executionId="B"`. (Or the parent re-keys.)
  3. The reset effect runs and schedules `setState({ output: [], status: "queued" })` inside `queueMicrotask`. `offsetRef.current = 0` runs synchronously.
  4. `poll` is recreated (new `executionId`). `usePolling` fires it immediately. The fetch resolves and calls `setState((prev) => ({ output: [...prev.output, ...] }))`.
  5. **The order of (3) microtask vs (4) state update is not guaranteed**: in React 19 batched updates, the microtask scheduled in the effect runs before the network promise resolves but the *setState callback* sees `prev = { output: [], status: "queued" }` only if it ran after. Under concurrent mode + Suspense, the microtask reset can fire AFTER the first poll's setState, blanking out the freshly fetched output.
- **Root cause**: Splitting the reset across `queueMicrotask` (state) and synchronous (`offsetRef`) makes the reset non-atomic relative to the poll callback. The microtask was likely added to dodge a "setState during render" warning, but it introduces ordering ambiguity.
- **Impact**: Expanded execution panel intermittently shows blank output ("No output yet") or status flips back to `queued` for a fraction of a second after the first real frame arrives. Misleads users into thinking nothing is running.
- **Fix sketch**: Drop `queueMicrotask`; reset synchronously in the effect (it runs after commit, no warning). Better: derive state from a ref keyed by `executionId` and ignore poll responses whose `executionId` doesn't match a captured local copy:
  ```ts
  useEffect(() => {
    setState({ output: [], status: "queued" });
    setStopped(false);
    offsetRef.current = 0;
  }, [executionId]);

  const poll = useCallback(async () => {
    const myId = executionId;
    if (!myId) return;
    const data = await api.getExecution(myId, offsetRef.current);
    if (myId !== executionId) return; // stale response
    setState(prev => ({ ... }));
  }, [executionId]);
  ```

## 3. Polling spins forever on transient API errors — no backoff, no terminal escape

- **Severity**: High
- **Category**: Latent failure / silent failure
- **File**: `src/hooks/useExecutionPolling.ts:44-57`, `src/hooks/usePolling.ts:19-25`
- **Scenario**:
  1. An execution row is expanded; `useExecutionPolling` polls every 1s.
  2. Orchestrator returns 500 / network blip → `api.getExecution` throws.
  3. `usePolling.tick` catches and swallows the error (`// Swallow — callers handle errors internally`). But `useExecutionPolling.poll` does **not** catch — so `setStopped(true)` and `offsetRef` updates after the throw never run.
  4. Polling continues at full speed (no exponential backoff, no max-attempts). If the orchestrator is hard-down, every expanded row generates 1 req/s indefinitely until the user navigates away.
  5. Worse: if `getExecution` returns `404` for a since-purged execution id, the same forever-loop happens — there's no terminal status check on errors, only on the success path's `data.status`.
- **Root cause**: Error path is dropped entirely by the outer swallow; no detection of "this id is gone" / "we should give up".
- **Impact**: Log spam, server load amplification during outages, and dead executions that 404 still being polled until tab closes. Combines with finding #1 to produce reconnect storms when SSE *and* polling both fall back.
- **Fix sketch**: Catch in `poll`, count consecutive errors, set `stopped=true` after N (e.g., 5) consecutive 404/410, exponential-backoff on 5xx. Surface a state field `error: string | null` to the UI so the terminal panel can show "Execution not found" instead of a perpetually empty stdout.

## 4. Persisted `personaId` filter for deleted personas silently filters all data to nothing

- **Severity**: High
- **Category**: Edge case / silent failure
- **File**: `src/stores/dashboardFilterStore.ts:28-58`, `src/components/dashboard/DashboardScopeBar.tsx:53-56,78-90`
- **Scenario**:
  1. User selects persona `pers_xyz` in the scope bar. `personaId` persists to localStorage.
  2. Persona `pers_xyz` is deleted (by another team member, or via API).
  3. User reloads. `hydrate()` accepts any string for `personaId` without validating it against the loaded persona list.
  4. `selectedPersona = personas.find(p => p.id === personaId) ?? null` resolves to `null`. The UI then renders "All personas" label (`selectedPersona ? selectedPersona.name : t.dashboard.scope.allPersonas`).
  5. But downstream queries (executions list, charts) still filter by the dead `personaId`, returning empty results.
  6. **Net effect**: every dashboard widget shows zero data while the scope bar truthfully claims "All personas". User has no UI affordance to clear the dangling filter — the cleanup button targets `personaId === null`, which is already what the label says.
- **Root cause**: Hydration validates the *type* of `personaId` but not its existence; UI label hides the discrepancy.
- **Impact**: Permanently broken dashboard for that user until they manually clear localStorage. Likely to be misreported as "dashboard says no executions" when in fact data exists.
- **Fix sketch**: After `usePersonaStore.fetchPersonas` resolves, run a reconciler — if `personaId` is non-null and not in `personas`, call `setPersonaId(null)` and (optionally) toast. Or render the scope bar in an "Unknown persona" warning state so the user sees the dangling filter.

## 5. List-poll fires while previous request is in flight — overlap reorders state under flapping latency

- **Severity**: Medium
- **Category**: Race condition
- **File**: `src/stores/executionStore.ts:85-109`, `src/hooks/usePolling.ts:60-72`
- **Scenario**: `usePolling` correctly chains polls (`scheduleNext` only after `tick` resolves), preventing in-the-same-hook overlap. **But** `executionStore.fetchExecutions` is called from multiple places: the page-level 3s poll, the initial `useEffect`, AND `cancelExecution` paths could realistically force a refetch in future. The store guards with `executionFetchSeq`, BUT it sets `executionsLoading: true` unconditionally at the start (line 87) and `false` in `finally` only if `seq === executionFetchSeq` (line 105-107). If two fetches start, the *first* finishes and hits `seq !== executionFetchSeq` → it skips clearing `executionsLoading`, leaving the spinner stuck after the second fetch finishes too (because the second's finally was the only one allowed to clear, and it did, but the stale `true` set could outlive it depending on commit order).
  More concretely: f1 starts (loading=true, seq=1). f2 starts before f1 returns (loading=true, seq=2). f1 resolves but skips its finally clear (seq mismatch). f2 resolves, clears loading. **Net: OK in this exact case**, but if a third call increments seq again between f2's body and finally, the spinner can stick.
- **Root cause**: `executionsLoading` is set unconditionally on entry but cleared conditionally; the symmetry is broken.
- **Impact**: Stuck loading spinner under rapid filter/refetch interleaving; minor cosmetic glitch but visible during demos.
- **Fix sketch**: Track per-call loading via a counter (`pendingFetches: number`) that increments on entry and decrements in finally regardless of seq, and derive `executionsLoading = pendingFetches > 0`. Or skip the entry `set` and let the finally always clear unconditionally.

## 6. `cancellingIds` leaks across filter changes and persona deletions

- **Severity**: Medium
- **Category**: Stale state / latent failure
- **File**: `src/stores/executionStore.ts:110-145`
- **Scenario**:
  1. User clicks Cancel on execution `e1`. `cancellingIds = { e1: true }`.
  2. The HTTP request hangs (long backend timeout or proxy buffering).
  3. User changes filter / navigates / refetches. `fetchExecutions` overwrites `rawExecutions` — `e1` may no longer be in the new list (filtered out, or 50-row limit pushed it past the page).
  4. `cancelExecution`'s catch/finally only clears the entry on resolution. But because the request is server-side cancelled by Next's `signal` only on full unmount, the Promise can resolve eventually — by then the row is gone, the user moved on, and the entry is finally cleared. Harmless on cleanup.
  5. **However**: if the `await api.cancelExecution(id)` Promise rejects after `reset()` was called (e.g. user logs out), the catch block still mutates `cancellingIds` and surfaces an error toast for an action the user has no context for. The `executionFetchSeq` guard does not extend to `cancelExecution`.
- **Root cause**: No abort signal threaded through `cancelExecution`; no seq guard on cancel.
- **Impact**: Stray error banners after logout/reset; pending cancel buttons that re-enable themselves only after backend timeout.
- **Fix sketch**: Capture a sequence id at the start of `cancelExecution`, bail out of the success/error setState if `executionFetchSeq` advanced past it. Or thread an `AbortController` so `reset()` aborts in-flight cancels.

## 7. DataTable holds `expandedId` for rows no longer in the filtered slice

- **Severity**: Low
- **Category**: Edge case
- **File**: `src/components/dashboard/DataTable.tsx:37-47`, `src/app/dashboard/executions/page.tsx:99-108`
- **Scenario**:
  1. User expands execution `e1` (status=`completed`) under filter "all".
  2. User switches filter to "running". `e1` is filtered out of `data`. `expandedId` still holds `"e1"`.
  3. User switches back to "all" or `e1`'s row reappears (or they happen to start a new execution that, after a future PR, somehow shares an id).
  4. The row immediately renders expanded again, and `useExecutionPolling("e1")` mounts fresh — re-fetches output from offset 0 and may double-poll a terminal execution that needed no further data.
  5. Also: if the parent had passed `onExpandedChange` to clear app-level expanded state on filter change, it's never called because `expandedId` lives entirely inside `DataTable`'s local state.
- **Root cause**: `DataTable` doesn't reset `expandedId` when `data`/keys change, and the parent has no way to control it.
- **Impact**: Surprise auto-expansion after filter round-trips, redundant API hits to terminal executions, and modest visual jank.
- **Fix sketch**: In `DataTable`, reset `expandedId` when the row with that id leaves `data`:
  ```ts
  useEffect(() => {
    if (expandedId && !data.some(r => keyExtractor(r) === expandedId)) {
      setExpandedId(null);
      onExpandedChange?.(null);
    }
  }, [data, expandedId, keyExtractor, onExpandedChange]);
  ```
