# Bug Hunter — Agents (Personas) Management

> Total: 7 findings (Critical: 1, High: 4, Medium: 2, Low: 0)
> Scope: 12 files
> Date: 2026-05-10

---

## 1. Concurrent optimistic updates lose state — last rollback wins (stale resurrection)

- **Severity**: Critical
- **Category**: State corruption / race condition
- **File**: `src/stores/personaStore.ts:114-149`
- **Scenario**:
  1. User toggles persona `enabled` → `commitOptimisticUpdate("p1", {enabled:false}, mutateA)`. `snapshotA = {enabled:true}` is captured.
  2. Before `mutateA` resolves, the user clicks again (or another panel fires) → `commitOptimisticUpdate("p1", {enabled:true}, mutateB)`. `snapshotB = {enabled:false}` (the optimistic value from #1) is captured.
  3. `mutateA` rejects → `rollbackPersona("p1", snapshotA={enabled:true})` is applied — reverting to a value the server already accepts as the next state via mutateB, so the UI now shows `enabled:true`.
  4. `mutateB` resolves successfully. No write-through happens (commit only rolls back on error). Final UI state: `enabled:true`. Final server state: `enabled:true`. Looks fine — but if order is reversed (mutateB rejects after mutateA resolves), the `snapshotB` rollback writes `{enabled:false}` over a *successful* mutateA, leaving the UI showing the opposite of what the server has. The store also has no in-flight mutex per id.
  5. Worst case: both reject. snapshotB (captured *after* the optimistic A patch) is the most recent rollback; it restores the half-applied A state, not the original.
- **Root cause**: `optimisticUpdatePersona` snapshots `personasById[id]` at call time, but two pending updates capture overlapping snapshots — the second snapshot already reflects the first's optimistic patch. Rollbacks fire in promise-rejection order, not in inverse-application order, so the merged state ends up neither "old" nor "new". There is no per-id in-flight tracking and no write-through-on-success to converge the store with the server response.
- **Impact**: Persistent UI/server divergence on rapid toggles or concurrent panels writing to the same persona. User sees a value the server doesn't have, refresh "fixes" it (confusing). No telemetry — silent data corruption.
- **Fix sketch**: (a) Maintain `inflightById: Map<id, Promise>` and serialize `commitOptimisticUpdate` calls per id (or reject the second call). (b) On `mutate` success, write the *server's response* into the store (`set state from server result`) — never trust the client-applied patch as source of truth. (c) When rolling back, only revert if the current value still equals the optimistic patch (CAS-style guard) — don't blindly clobber a newer optimistic state.

---

## 2. Mutation error swallowed when persona was removed mid-flight — silent stale UI

- **Severity**: High
- **Category**: Silent failure / state corruption
- **File**: `src/stores/personaStore.ts:129-138, 139-149`
- **Scenario**:
  1. Drawer is open on persona `p1`, user toggles a field → `commitOptimisticUpdate("p1", patch, mutate)` runs, snapshot captured.
  2. Concurrent `fetchPersonas` refetch returns a list that *omits* `p1` (server deleted it). `set` overwrites `personasById` — `p1` is gone.
  3. `mutate()` rejects (server: 404 — record is gone).
  4. `rollbackPersona("p1", snapshot)` enters; `current = s.personasById["p1"]` is `undefined`, so it short-circuits with `return s` (line 132). **The error is then re-thrown but the optimistic patch was already wiped — so there's nothing to surface visually**, AND the caller's `catch` is the outer `mutate()` — the user-visible error path is whatever the toggle component does with `await commitOptimisticUpdate(...)`.
  5. Looking at `SubscriptionsPanel.tsx:36-43`, `handleToggle` has `try { ... } finally { setToggling(false) }` — **no `catch`**. The error throws into a promise rejection (unhandled), browser console only. User sees the toggle re-enable with no indication it failed.
- **Root cause**: (a) `rollbackPersona` silently no-ops when the record is gone — by design — but the upstream consumers don't surface the rejection either. (b) No toast/error bus integration in `SubscriptionsPanel` or anywhere else — every site that uses optimistic updates has the same gap (`agents/page.tsx:49-55` `handleExecute` also has empty catch).
- **Impact**: User believes their action succeeded; it didn't. Critical for billing-relevant fields (`maxBudgetUsd`, `enabled`).
- **Fix sketch**: Make `rollbackPersona` return a discriminated result `{rolledBack:boolean, reason:'gone'|'ok'}`; have callers display a toast for both. Add a top-level error-toast bus and wire all `catch` blocks (currently `// TODO: toast`) to it.

---

## 3. SWR `keepPreviousData` leaks previous persona's executions into next persona's drawer

- **Severity**: High
- **Category**: State corruption / cross-record data bleed
- **File**: `src/lib/dashboard-queries.ts:25-35`, `src/components/dashboard/AgentDetail.tsx:25-87`
- **Scenario**:
  1. User opens drawer for persona A → SWR fires `loadAgentDetail("A")`, key = `["dashboard","agent-detail","A"]`. Returns `{executions:[…A's…], subscriptions:[…], triggers:[…]}`.
  2. User closes A and immediately opens B (different key). `useAgentDetail("B")` is called with `keepPreviousData: true`.
  3. SWR returns the *previous* key's data (A's executions) for the first frame while B's request is in-flight. `AgentDetail` renders A's executions list under B's heading because the component has no guard like `data && key === currentKey`.
  4. If user closes B before its fetch resolves, the cache for B still contains A's data shape until invalidated — and a re-open shows A's data again until the new fetch finishes.
- **Root cause**: `keepPreviousData: true` is appropriate for paginated lists (same key, changing param), but here the key *changes* per persona id. SWR's `keepPreviousData` returns the *previously rendered* data regardless of whether keys match. The component does not compare `data` provenance against the requested `personaId`.
- **Impact**: Visitors and demo users see one agent's executions briefly attributed to another. Particularly bad on the agents grid page where two adjacent expansion toggles are common.
- **Fix sketch**: Drop `keepPreviousData: true` for this hook (the skeleton already exists in `AgentDetail.tsx:39-53`). If a smooth transition is required, gate render on `key === requested key` — e.g. include `personaId` in the data and skip rendering when `data.personaId !== persona.id`.

---

## 4. `prefetchedDetailIdsRef` causes permanent staleness when expanding a persona without hover

- **Severity**: High
- **Category**: Cache invalidation / staleness
- **File**: `src/app/dashboard/agents/page.tsx:42, 152-156`; `src/components/dashboard/AgentDetail.tsx:10-23`
- **Scenario**:
  1. User hovers persona row → `prefetchAgentDetail(p.id)` runs → seeds SWR cache with `revalidate:false`. `prefetchedDetailIdsRef` records the id.
  2. Time passes (10 minutes). User opens the drawer for that persona. `useAgentDetail` returns the SWR-cached data; `dedupingInterval: 60_000` is moot since the cache has the data and `revalidateOnFocus:false`.
  3. There is no TTL on the seeded cache and no programmatic `mutate()` on drawer open. User stares at 10-minute-old execution rows believing they're live.
  4. Worse: subscription mutations elsewhere call `mutate(dashboardKeys.agentDetail(personaId))` (eventStore.ts:220, 229, 236) but these only revalidate if the key has subscribers — if the drawer was already closed, the seeded entry stays stale forever.
- **Root cause**: Prefetch uses `revalidate:false` and `useSWR` config disables `revalidateOnFocus`. There is no `revalidateOnMount` strategy, no TTL guard, and no per-id "last fetched at" check. The `prefetchedDetailIdsRef` set never clears — it survives unmount cycles.
- **Impact**: Demo dashboards (and real ones) show wrong execution counts and subscription totals indefinitely after first hover. User may think a persona is idle when it's actively running.
- **Fix sketch**: (a) Switch the SWR config to `revalidateOnMount: true`, or (b) on drawer open, call `mutate(dashboardKeys.agentDetail(id))` to force revalidation. (c) Add a `lastFetchedAt` per id and refuse to use cached data older than e.g. 60s. (d) Clear `prefetchedDetailIdsRef` on persona-list refetch.

---

## 5. `MOCK_SUBSCRIPTIONS` mutation in mockApi causes test/demo cross-contamination

- **Severity**: High
- **Category**: State corruption / shared mutable state
- **File**: `src/lib/mockApi.ts:131-171`
- **Scenario**:
  1. `createSubscription` reads `MOCK_SUBSCRIPTIONS[personaId] ?? []`, mutates the array via `arr.push(sub)`, then assigns it back. If the `??` branch fired (no entry yet), `arr` is a *new* `[]` — then push and assign, fine. But if entries existed, `arr` is the *same* array reference held by other consumers.
  2. `listSubscriptions` returns `[...(MOCK_SUBSCRIPTIONS[personaId] ?? [])]` — defensive copy, OK. But `updateSubscription` mutates `subs[idx] = updated` directly (line 163) on the *original* array, so any consumer that captured the reference (e.g. event store snapshot during a refetch race) sees the mutation immediately.
  3. `deleteSubscription` does `MOCK_SUBSCRIPTIONS[personaId] = subs.filter(...)` — re-assigns the slot, but other code paths that captured `subs` keep the deleted item.
  4. Demo session: User creates a subscription, then "navigates away" (which in dev triggers `reset()` on stores) → MOCK store still has the new subscription. Next demo visitor sees data from the previous visitor.
- **Root cause**: Module-scope mutable mock state (`MOCK_SUBSCRIPTIONS` is imported live, not cloned per-call), and inconsistent copy-on-write discipline (some calls clone, some mutate in place).
- **Impact**: In the BYOM/demo flow (`isDemo` path), mock data accumulates across sessions and tabs; tests that share modules see flaky state. Optimistic-update rollback testing becomes unreliable because a "rollback" succeeds but the underlying mock has already drifted.
- **Fix sketch**: Make all mock mutations strictly copy-on-write (`MOCK_SUBSCRIPTIONS[id] = [...arr, sub]`). Better: deep-clone the import on first access in dev-mode `mockApi` so there is no shared module state. Even better: gate mock mutations behind a `resetMockState()` hook so each demo session starts clean.

---

## 6. `MemoryActionsPanel` dismiss on unmounted persona — orphan UI state

- **Severity**: Medium
- **Category**: Edge case / state corruption
- **File**: `src/components/dashboard/MemoryActionsPanel.tsx:76-83, 81-83`
- **Scenario**:
  1. `MemoryActionsPanel` initializes `actions` from `MOCK_MEMORY_ACTIONS` once via `useState(...)` with no dependency on persona list.
  2. The `action.persona` field (e.g. `"ResearchAgent"`) is *not linked by id* to any record in `personaStore`. If a persona is renamed or removed in the store, the memory action keeps the stale name as a string label.
  3. `dismiss(id)` filters by `action.id`, ignoring whether the persona exists. Recommended action ("Reduce ResearchAgent frequency") can therefore be dismissed against a deleted agent — the user never sees that the action is dead.
  4. Worse, `MOCK_MEMORY_ACTIONS` is a *module-level array reference* (line 376 of `mock-dashboard-data.ts`). `useState(MOCK_MEMORY_ACTIONS)` initializes from the same ref every component mount. After a dismiss, `setActions(prev.filter(...))` returns a new array, but the original `MOCK_MEMORY_ACTIONS` is untouched — so a re-mount restores all items including ones the user already dismissed.
- **Root cause**: (a) Strings as foreign keys with no validation against the live persona list. (b) Local component state with no persistence — dismissals don't survive route changes.
- **Impact**: Suggestions for nonexistent agents persist visually. Dismiss action feels broken on second visit. Score progress bar (line 57-74) renders for invalid agents.
- **Fix sketch**: (a) Match `action.persona` against `personaStore.personas` and hide actions whose persona is gone (or label "Removed agent"). (b) Persist dismissed ids to localStorage so the dismiss is durable. (c) Use `useState(() => [...MOCK_MEMORY_ACTIONS])` to clone the module ref.

---

## 7. Drawer focus restoration to `<h1>` strips synthetic `tabindex` only on `blur` — keyboard trap risk

- **Severity**: Medium
- **Category**: Edge case / focus state
- **File**: `src/components/dashboard/AgentDetailDrawer.tsx:82-95`
- **Scenario**:
  1. Drawer closes; previous focus element is detached → fallback path picks `<h1>`, sets `tabIndex = -1`, calls `focus()`.
  2. Listener removes `tabindex` on `blur`. But if the user immediately re-opens the drawer (Tab + Enter, or another keyboard shortcut), the *next* drawer-close cycle runs the same fallback while the previous `blur` listener is still pending. Two listeners are now bound to the same `<h1>`; both will run and both try to remove the attribute (idempotent, OK) — but the heading already had no tabindex when the second open began, so its initial state assumption (`hadTabIndex = false`) is correct only by luck.
  3. Real bug: if the page already has `<h1 tabindex="-1">` for any other reason (skip-link patterns), `hadTabIndex = true` so the listener never fires — but if a *different* component sets `tabindex` on the same `<h1>` between the close and the blur, the listener strips it, breaking that component's focus management.
  4. Also: `panelRef.current?.querySelector<HTMLElement>("[data-drawer-close]")` (line 63) runs after a 50ms timeout. If the persona changes during that 50ms (e.g. parent passes a new persona), the timeout still fires and focuses the close button — which is now the *new* drawer's button — but the effect's previous-focus snapshot was taken from before the persona change, so on close it will try to restore focus to a node that was the active element at the moment of the *first* drawer open, not the second.
- **Root cause**: Focus management treats persona changes as "no-op" because the effect deps are `[persona]` — when persona reference changes, the cleanup runs (restoring focus to a stale target) before the new effect captures the new active element. There's no concept of "drawer is logically still open, just for a different persona."
- **Impact**: Keyboard users may end up focused on the wrong element after rapid persona switching in the drawer; SR announcements drift; in rare cases focus is stripped from a heading that another component depends on.
- **Fix sketch**: (a) Only run focus capture/restore on the open→close transition, not on persona-change while open. Track an explicit `isOpen` boolean separate from `persona`. (b) Use a `useEffect` returning early if `previousPersona && persona && previousPersona.id !== persona.id`. (c) Use `requestAnimationFrame` instead of `setTimeout(50)` for the close-button focus, so it batches with React's commit.
