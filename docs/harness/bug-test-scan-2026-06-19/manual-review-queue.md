# Manual Review Queue — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 1, Low: 1)

Prior-fix verification (2026-05-10 criticals): BOTH hold in current code.
- **Undo-window unmount flush**: present and correct — `useReviewBulkActions` keeps a `undoStateRef` mirror and the `[]`-effect cleanup commits the pending batch via `executeBulkAction(pending.ids, pending.status)` before `clearTimeout` (useReviewBulkActions.ts:281-305). Audit decisions are no longer silently dropped on navigate-away.
- **pollPaused clobber guard**: present and live-wired — `fetchReviews` early-returns on `get().pollPaused` (reviewStore.ts:290), and `startBulkWithUndo`/`handleUndo`/`handleUndoExpire`/unmount all toggle it (useReviewBulkActions.ts:213, 219, 265, 271, 302). Not dead code anymore.

The 5 findings below are NEW or still-present issues, weighted toward the test-coverage lens (this is the highest-blast-radius audit-decision path in the app and has **zero** unit-level coverage — see finding #1).

## 1. Zero unit-level coverage on the entire bulk approve/reject + undo audit-decision path
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing test harness / risk-weighted coverage gap
- **File**: src/hooks/useReviewBulkActions.ts:1-326, src/stores/reviewStore.ts:276-396, src/lib/reviewUtils.ts:1-160
- **Scenario**: The repo has only Playwright e2e (`package.json` → `test:e2e: "playwright test"`; no vitest/jest, no config, no `@testing-library`). `grep` for `useReviewBulkActions|reviewStore|reviewUtils|startBulkWithUndo|computeAuditAnalytics` across all `*.{test,spec}.{ts,tsx}` returns **no files**, and the 13 e2e specs cover marketing/playground/tour — none touch the reviews dashboard. The most data-integrity-sensitive logic in the product (optimistic bulk commit, 5s undo, unmount-flush, failure-revert, pending-count recompute, escalation SLA) is verified by nothing but TypeScript.
- **Root cause**: The 2026-05-10 fixes hardened two criticals in pure/near-pure logic but left no regression net; a future refactor can silently reintroduce the exact dropped-decision bug with green CI.
- **Impact**: false-confidence / latent data loss — the audit trail (approve/reject = money/compliance decisions) can regress undetected.
- **Fix sketch**: Add a vitest unit harness (jsdom env) and an LLM-generatable batch asserting true invariants: (a) `startBulkWithUndo` then unmount → `executeBulkAction` called once with the same ids; (b) `handleUndo` reverts rows to `pending` and restores `pendingReviewCount`; (c) `executeBulkAction` failure path re-selects exactly `failedIds`; (d) `reviewUtils.getSlaCountdown`/`getUrgencyLevel` boundary cases; (e) `parseManualReview` fail-loud → `critical`+`parseError`. These reducers are pure-ish and mock only `resolveReview`.

## 2. Single-item keyboard approve/reject ("a"/"r") bypasses the bulk-undo guard and races the in-flight batch
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: race condition / inconsistent guard across action paths
- **File**: src/app/dashboard/reviews/reviews-split-pane/useReviewKeyboardShortcuts.ts:34-39, src/hooks/useReviewBulkActions.ts:226-232
- **Scenario**: An operator bulk-approves 20 rows; the 5s undo window opens (`pollPaused=true`, `undoState` set, commit deferred). During that window they press `a` (or `r`) on the highlighted detail row. `useReviewKeyboardShortcuts` calls `resolveReview(selectedReview.id, "approved")` **immediately and unconditionally** — it has no awareness of `undoState`/`bulkResolving` (the guard only lives in `handleBulkAction`). That row gets an immediate server PATCH while it (or a sibling) is also queued in the pending bulk batch. If the row is part of the bulk set, it is committed twice (duplicate audit-log row + duplicate webhook), and if the user then clicks Undo, the bulk-undo reverts the optimistic state but the single keyboard PATCH already landed server-side — the row is now permanently approved with no undo affordance.
- **Root cause**: The double-fire/guard discipline was added only to the bulk entry point; the per-item keyboard path (and the focus-flow `a`/`r`, ReviewsFocusFlow.tsx:78-82) was never gated on the same `undoState`/`bulkResolving` state, so two write paths to the same audit decision can run concurrently.
- **Impact**: data corruption — duplicate/un-undoable audit decisions while a bulk undo is pending.
- **Fix sketch**: Plumb `undoState`/`bulkResolving` into `useReviewKeyboardShortcuts` and early-return the `a`/`r` branches when either is truthy (and disable the per-row resolve buttons during the window). Mirror the same guard in ReviewsFocusFlow's key handler.

## 3. executeBulkAction failure-revert recomputes pendingReviewCount by double-counting still-pending rows
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: state corruption / counter drift
- **File**: src/hooks/useReviewBulkActions.ts:148-157
- **Scenario**: A bulk batch partially fails. The revert maps `failedIds` back to `pending`, then sets `pendingReviewCount` to `s.reviews.filter(r => r.status === "pending" || failedIds.includes(r.id)).length`. The `.map` that flips failedIds to pending runs against `s.reviews` in the same `setState`, but the count filter reads the **pre-map** `s.reviews` (the closure's `s`, before the new array is built). A failedId row whose status in `s` is the optimistic `"approved"` (not yet pending) is counted via the `|| failedIds.includes` branch — correct — but any failedId row that was *already* `pending` in `s` (e.g. re-entrant retry) is matched by BOTH predicates' union once (Set semantics of `||` is fine), yet rows flipped to pending by the map are NOT what's being filtered. Net: the count is derived from a stale array and from `failedIds` rather than from the post-map result, so `pendingReviewCount` diverges from the actual count of `status==="pending"` rows after the update — the sidebar badge and "Pending" filter tab show a wrong number until the next poll corrects it.
- **Root cause**: Counting from `s.reviews` + `failedIds` instead of from the freshly-mapped array. The two optimistic mutation sites elsewhere (startBulkWithUndo:197, handleUndo:259) have the same "recompute from s, not from result" pattern and are fragile for the same reason.
- **Impact**: UX degradation / wrong audit counts — badge/tab counts drift from reality until a 15s poll heals them (and the poll is paused during undo).
- **Fix sketch**: Build the mapped array once (`const reviews = s.reviews.map(...)`) and derive `pendingReviewCount: reviews.filter(r => r.status === "pending").length` from it, in all three optimistic mutation sites.

## 4. Two independent 5s timers (hook undoTimerRef + UndoToast onExpire) can clear pollPaused before the deferred commit runs
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: timing / duplicated timer ownership
- **File**: src/components/UndoToast.tsx:31-34, src/hooks/useReviewBulkActions.ts:215-221, 268-272
- **Scenario**: The undo window is governed by TWO separate 5000ms timers: the hook's `undoTimerRef` (which commits via `executeBulkAction` and only then sets `pollPaused(false)`), and `UndoToast`'s own internal `setTimeout(onExpire, durationMs)` which calls `handleUndoExpire` → sets `undoState=null` and `pollPaused(false)` **without committing**. They are started at different moments (hook on click; toast on mount/animation) so their fire order is non-deterministic. If `onExpire` wins the race, `pollPaused` is released while the optimistic rows are still un-committed; a 15s poll that happens to land in that sub-millisecond gap reverts the rows to the server's still-pending shape, then the hook timer's `executeBulkAction` re-commits — producing a visible status flicker, and if the poll's response is slow, a transient window where the queue shows the decision as un-made.
- **Root cause**: Expiry/commit responsibility is split across two components each owning its own duration timer, instead of a single source of truth driving both the visual countdown and the commit.
- **Impact**: UX degradation — status flicker / transient stale state at the undo boundary; depends on poll timing so it is intermittent and hard to reproduce.
- **Fix sketch**: Make `UndoToast` purely presentational (drive the bar/countdown from a prop, no `onExpire` timer), and let the hook's single `undoTimerRef` own both commit and `pollPaused` release; or have `handleUndoExpire` itself perform the commit so whichever timer fires first does the right thing.

## 5. resolveReview leaves the undo window armed (polling frozen, stale undoState) when a single-item resolve runs during a bulk undo
- **Severity**: Low
- **Lens**: bug-hunter
- **Category**: state desync / stuck flag
- **File**: src/stores/reviewStore.ts:314-329, src/hooks/useReviewBulkActions.ts:248-266
- **Scenario**: `resolveReview` (used by the detail-panel buttons, keyboard `a`/`r`, and focus-flow) mutates the store directly and never touches `pollPaused` or the hook's `undoState`/`undoTimerRef`. If a single resolve fires while a bulk-undo window is open (see finding #2), the bulk undo machinery is unaffected and still holds `pollPaused=true`; should the component then unmount in an unexpected order, the unmount cleanup releases `pollPaused`, but if the hook re-mounts (mode switch split↔focus) before that, a stale `undoState` snapshot from the hook can briefly re-suppress polling. Lower severity because the unmount cleanup is the backstop, but it reflects the same root design gap as #2.
- **Root cause**: `pollPaused` and undo lifecycle are owned solely by `useReviewBulkActions`, yet the store-level `resolveReview` is a parallel write path that mutates the same reviews without participating in that lifecycle.
- **Impact**: UX degradation — brief polling freeze / stale optimistic rows after a mixed single+bulk interaction; self-heals on unmount.
- **Fix sketch**: Centralize the undo/poll-pause lifecycle so any resolve path (single or bulk) goes through one coordinator, or have `resolveReview` no-op-safely coexist by having the hook clear `undoState`+`pollPaused` whenever the underlying review set changes out from under an open window.
