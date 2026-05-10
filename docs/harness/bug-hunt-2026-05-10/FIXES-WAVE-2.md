# Bug Hunter Fix Wave 2 — State Corruption (Dashboard Stores)

> 3 commits, 7 findings closed (4 Critical + 3 High).
> Baseline preserved: `tsc --noEmit` 0 → 0 errors.

This wave bundled findings around a single mental model: **"Zustand stores
in the dashboard surface optimistic state, but the concurrency primitives
that should keep optimistic state coherent are missing or wired wrong."**
The fixes share three primitives — per-id serialization, CAS-guarded
rollback, and unmount-flush-not-cancel — applied across three different
stores (`reviewStore`, `personaStore`, `eventStore`).

## Commits

| # | Commit | Findings closed | Severity | Files |
|---:|---|---|---|---|
| 1 | `bd16b38` fix(reviews): flush bulk batch on unmount, pause polling, gate double-click | reviews #1, #2, #3 | C+C+H | `hooks/useReviewBulkActions.ts`, `stores/reviewStore.ts` |
| 2 | `618537a` fix(personaStore): serialize optimistic mutations per id, CAS-guard rollback | agents #1 | C | `stores/personaStore.ts` |
| 3 | `5aa8590` fix(eventStore): count replay attempts, not successes, against retry budget | event-bus #1 | C | `stores/eventStore.ts` |

## What was fixed (grouped by store)

### 1. Reviews — undo flow safety (commit 1)

Three reinforcing fixes to one flow:

- **Unmount silently dropped the optimistic batch.** The cleanup
  `useEffect` cleared `undoTimerRef` without flushing the pending PATCH.
  An operator who selected 30 reviews, clicked Approve, and navigated
  away inside the 5-second undo window had their audit decisions
  silently abandoned — the rows reverted to pending on the next poll
  while the green toast lied that they'd been approved. Cleanup now
  fires the same `executeBulkAction` the timer would have, via an
  `undoStateRef` mirror so the cleanup closure sees the latest pending
  batch instead of the stale state captured at mount time.
- **`pollPaused` was dead code.** `reviewStore` exposed `setPollPaused`/
  `pollPaused` with explicit JSDoc, but no caller ever set it and
  `fetchReviews` never read it. With a 15s poll cadence and a 5s undo
  window, ~33% of batches got their optimistic state overwritten by a
  mid-window fetch, producing a visible status flicker and letting Undo
  race against a fresh array. `startBulkWithUndo` now sets it true; the
  timer / `handleUndo` / `handleUndoExpire` / cleanup paths all reset it
  to false; `fetchReviews` early-returns while it's true.
- **Double-click and double-undo orphaned timers.** A second click on
  Approve while the previous undo window was still open overwrote
  `undoTimerRef` without clearing the prior timer. The orphaned T1
  still fired ~5s later and double-PATCHed the original ids — duplicate
  audit-log rows, duplicate webhook deliveries, possibly duplicate
  Slack/email notifications wired to `manual_review.approved`.
  `startBulkWithUndo` now clears any pending timer before queueing the
  next, and `handleBulkAction` / `handleBulkRejectConfirm` refuse to
  start a new batch while `undoState !== null` or `bulkResolving`.

### 2. PersonaStore — concurrent optimistic-update coherence (commit 2)

`commitOptimisticUpdate` had no per-id serialization and no CAS guard:

- **Per-id mutex.** Two concurrent commits for the same persona used to
  capture overlapping snapshots — snapshot B was taken *after* A's
  optimistic patch had landed, so a later rollback of B reverted to A's
  *patched* value rather than the original. Net result: persistent UI/
  server divergence on rapid toggles or two panels writing the same
  persona. Each commit now awaits any prior in-flight mutation for the
  same id (success or failure) before snapshotting; the snapshot always
  reflects the post-mutation store of the previous commit.
- **CAS-guarded rollback.** On error, the previous code blindly wrote the
  snapshot back into the store. If a later commit had already
  overwritten the optimistic value (or `fetchPersonas` had refetched),
  that clobbering revived a stale snapshot over agreed-upon truth.
  Rollback now compares the current store value against the patch we
  applied; only when every patched field still matches do we revert.
  Otherwise the newer state stands.
- `reset()` also clears the inflight map so a logout-mid-mutation
  doesn't leak promises into the next user's session.

The third mitigation from the report — "write the server's response into
the store on success, not the optimistic patch" — was deliberately not
implemented in this wave because it requires changing every `mutate()`
callsite to return the server's persona shape. That's a bigger surgery
best done as its own focused session.

### 3. EventStore — replay retry budget (commit 3)

`replayEvent` only incremented `retryCounts` inside the success branch
of the `api.publishEvent` try, so a permanently broken handler
(always-throwing downstream tool, missing webhook target, etc.) never
tripped `MAX_REPLAY_RETRIES`. Operators clicking Retry All on a DLQ
entry whose handler is reliably broken would pump events at the bus
indefinitely, each failing the same way, polluting traces and burning
Sentry quota. Move the increment + `saveRetryCounts` to the start of
`replayEvent` (after the lock check, before `api.publishEvent`). Counts
the attempt itself, regardless of success — the semantics the
const-named "retry budget" already implied. After
`MAX_REPLAY_RETRIES` (3), the event becomes replay-locked via
`isReplayLocked` and `replayEvents` pre-filters it into `skipped`, so
further Retry-All passes don't even hit the API.

## Verification table

| Gate | Before wave | After wave |
|---|---:|---:|
| `tsc --noEmit` errors | 0 | 0 |
| Wave-2 commits | 7 (cumulative from wave 1) | 10 |
| Critical findings closed (cumulative) | 3 / 9 | 7 / 9 |
| High findings closed (cumulative) | 5 / 75 | 8 / 75 |

## Cumulative status (after wave 2)

- 15 of 178 findings closed (8.4%).
- **7 of 9 criticals closed**; 2 remain (1 in execution-history SSE proxy,
  1 in shared-ui useCanvasCompositor IO leak).
- 8 of 75 highs closed.

| Wave | Theme | Closed |
|---:|---|---:|
| 1 | A. Security / Auth / Vote integrity | 8 |
| 2 | B. State corruption (personas/reviews/event-bus stores) | 7 |
| 3 | C. SSE + streaming reliability | — |
| 4 | D. Animation lifecycle / observer cleanup / visibility pause | — |
| 5 | E. SSR / hydration / theme + i18n flash | — |
| 6 | F. Data integrity / SEO / ordering | — |
| 7 | G. A11y / focus / scroll-lock / modal lifecycle | — |

## Patterns established (catalogue items 5–8)

5. **Cleanup is for cancellation; flush before clearing on unmount.**
   When component-local optimistic state has a pending commit, the
   cleanup `useEffect` must flush it before clearing the timer — or
   move the pending state into a store that survives unmount (with a
   `<Flusher />` mounted at the layout root). Treating the optimistic
   batch as "cancellable on unmount" is what produces silent data loss
   for any operation whose actual server write happens on a debounce.
   The cleanup mirror-ref (`undoStateRef`) is the wiring that lets the
   cleanup closure see the latest pending batch instead of the stale
   state captured at mount.
6. **Half-implemented features are worse than absent ones.** A type-only
   `pollPaused: boolean` with a setter that nothing calls is a
   landmine: it documents an intent that future readers assume is
   wired. Either delete the affordance or wire it. Grep for
   `set\w+Paused`, `setLoading`, `setReady`, `setEnabled` callsites
   when implementing them — if the only hit is the definition, the
   safety valve doesn't exist.
7. **Optimistic-update rollback must be CAS-guarded.** Multiple in-
   flight mutations to the same record require: (a) per-id
   serialization so snapshots don't overlap, (b) CAS check on the
   applied patch's field-set before reverting (don't blindly clobber
   newer state). Both are required — neither alone is enough. The
   server-response-write-through is the third leg, but it can be
   deferred when callers don't yet return server shapes.
8. **Counters must count what the const name says they count.** A
   "retry budget" that only increments on success is not a budget —
   it's a "successful retry counter" with the wrong name. When the
   counter is named after a *budget* / *limit* / *quota*, the
   increment must happen on attempt, not outcome. Same trap exists in
   per-IP rate limiters that only count successful logins, login
   throttling that resets on a different code path, and circuit
   breakers that count only consecutive errors of one specific type.

## What remains (across the open themes)

- **Theme C (SSE + streaming)** — 1 critical (execution SSE crash storm
  on edge upstream statuses) + reconnect-storm and no-heartbeat
  findings in event-bus-observability. Two SSE proxies share the same
  shape; closing both at once is more efficient. Recommended next.
- **Theme D (Animation lifecycle)** — 1 critical (`useCanvasCompositor`
  IO leak) + ~15 visibility/cleanup findings. Many would be closed by
  a shared `useVisibilityPause` hook + an audited cleanup pattern.
- **Themes E, F, G** — no criticals, but bigger surface area.

## Deliberately deferred (out of scope this wave)

- Surface mutation errors via toast bus / Sentry (agents-personas
  finding #2 + many `// TODO: toast` sites). This is a UX-surfacing
  change spanning every store consumer; it deserves its own focused
  pass alongside the A11y wave (G).
- Server-response write-through in `commitOptimisticUpdate` (the third
  leg of the agents-personas finding #1 fix). Requires changing every
  `mutate()` callsite to return the server's persona shape; doing this
  surgically is its own wave.
- SWR `keepPreviousData` cross-record bleed in `AgentDetail`
  (agents-personas #3) — substantial query-key restructuring, fits
  better with theme F.

Recommended next wave: **Theme C (SSE + streaming reliability)** — has
the remaining SSE crash-storm critical, and the same reconnect/heartbeat
shape applies to both `/api/events/stream` and
`/api/executions/[id]/stream`, so 5-6 fixes share one mental model.
