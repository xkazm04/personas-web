# Bug Hunter — Reviews, Knowledge & Settings

> Total: 7 findings (Critical: 2, High: 3, Medium: 1, Low: 1)
> Scope: 18 files
> Date: 2026-05-10

---

## 1. Undo-window unmount silently drops bulk approve/reject — server never called

- **Severity**: Critical
- **Category**: Silent data loss / race condition
- **File**: `src/hooks/useReviewBulkActions.ts:175-203, 250-255`
- **Scenario**:
  1. Operator selects 30 manual reviews on `/dashboard/reviews` and clicks "Approve".
  2. `startBulkWithUndo` writes optimistic `status: "approved"` into the store and starts a 5-second `setTimeout` that — on expiry — calls `executeBulkAction` (the only path that actually issues `api.updateEvent` PATCHes).
  3. Within those 5 seconds the operator navigates to `/dashboard/messages` (or any other route), causing `ReviewsSplitPane` to unmount and `useReviewBulkActions`' cleanup effect (line 252) to run.
  4. Cleanup calls `clearTimeout(undoTimerRef.current)` — but never calls `executeBulkAction`. The 30 PATCHes are silently abandoned.
  5. UI showed a green "Approved 30 reviews" toast and the rows visibly flipped to approved; user believes the action persisted.
  6. On next visit / next poll tick, `fetchReviews()` returns the rows still `pending` from the server. The reviews silently revert.
- **Root cause**: The cleanup path treats unmount as "cancel the optimistic batch" instead of "commit immediately". There is no flush-on-unmount, no `beforeunload` hook, and the store has no pending-commit log. Optimistic state lives only in component-local refs.
- **Impact**: Real audit decisions are silently dropped. For "rejected" actions on critical-severity events this is a correctness/compliance problem — the operator's "no" is forgotten and the row may then be auto-approved later when its escalation SLA hits (the default `info` rule is `auto_approve`).
- **Fix sketch**: On cleanup, if `undoTimerRef.current` is non-null, synchronously call `executeBulkAction(undoState.ids, undoState.status)` (fire-and-forget, but persist intent). Better: move the pending undo into the Zustand store with a `pendingBulk` slice so it survives unmount; flush it on the next mount or via a top-level `<UndoFlusher />` mounted in the dashboard layout. Also register a `beforeunload` handler to `navigator.sendBeacon` the PATCHes so a hard navigation/refresh during the undo window doesn't drop them.

---

## 2. `pollPaused` flag is dead code — polling clobbers optimistic bulk state mid-undo

- **Severity**: Critical
- **Category**: State corruption / race condition
- **File**: `src/stores/reviewStore.ts:262-271, 282, 331`; `src/hooks/useReviewBulkActions.ts:175-203`; `src/app/dashboard/reviews/ReviewsSplitPane.tsx:413`
- **Scenario**:
  1. `reviewStore` defines `pollPaused: boolean` and `setPollPaused`, with a JSDoc explicitly stating polling consumers "must skip fetching" while the optimistic-undo window is open (line 263-266).
  2. `usePolling(fetchReviews, 15_000, true)` runs every 15 s and never checks `pollPaused`. `setPollPaused` is never called from anywhere in the codebase (verified: `Grep "setPollPaused"` returns only the definition).
  3. Bulk-undo window is 5 s. With a 15 s poll cadence there is a ~33 % per-batch chance the next tick falls inside the window.
  4. When a poll fires during the window: `fetchReviews` calls `api.listEvents` → server still returns these rows as `pending` → `parseManualReview` returns `status: "pending"` → store reviews array is replaced — the optimistic "approved" rows revert to "pending" mid-toast.
  5. The undo toast still says "Approved 30 reviews" but the rows in the table flip back to amber pending badges. When the timer fires, `executeBulkAction` PATCHes succeed and they flip back to approved. Net effect: visible flicker plus a several-second window during which the state is lying to the operator.
- **Root cause**: Half-implemented feature. The hook abandons the optimistic intent the moment a server response comes in, and the safety valve (`pollPaused`) was wired into the store's type but never connected.
- **Impact**: State flicker, visual gaslighting, and — worse — if the poll arrives mid-undo and the user clicks Undo *during the flicker*, the click happens against a re-fetched array where the `failedIds`/`undoState.ids` may now be in a different status, leading to incorrect `pendingReviewCount` math.
- **Fix sketch**: In `startBulkWithUndo`, call `useReviewStore.getState().setPollPaused(true)`. In `handleUndo` and after the timer fires (in the `setTimeout` callback that calls `executeBulkAction`), call `setPollPaused(false)`. In `usePolling`'s consumer (or in `fetchReviews` itself), early-return when `pollPaused` is true. Also in cleanup-on-unmount, ensure pollPaused is cleared so a subsequent mount can resume.

---

## 3. Double-click on "Approve" leaks a timer and double-resolves the same IDs

- **Severity**: High
- **Category**: Race condition / timer leak
- **File**: `src/hooks/useReviewBulkActions.ts:175-203, 205-214`
- **Scenario**:
  1. Operator selects 10 reviews, clicks "Approve". `startBulkWithUndo` runs: writes optimistic state, clears `selectedIds`, sets `undoTimerRef.current` to timer T1 with `ids = [a,b,c,...j]`.
  2. While the toast is showing the operator clicks "Approve" again (button is not disabled by `bulkResolving`, which is only set during `executeBulkAction`). `handleBulkAction` reads `selectedIds` — now empty after T1 cleared it — but `Array.from(new Set())` is `[]`, so it calls `startBulkWithUndo([], "approved")`. This overwrites `undoTimerRef.current` to T2 *without clearing T1*. T1 is now orphaned and will still fire in ~5 s, calling `executeBulkAction(originalIds, "approved")` against rows that are already optimistically approved.
  3. In `executeBulkAction`, `resolveReview` is called for each id. The PATCH succeeds (orchestrator is idempotent on `processed` → `processed`) but server-side audit log gets a second "approved" entry per id with a new `processedAt`. Webhook subscribers get duplicate `manual_review.approved` deliveries.
  4. Variant: operator clicks Approve, then clicks a different already-resolved row (which selectedIds adds back to the set), then clicks Approve again before T1 fires. T2 now runs against a *different* id set; T1 still fires against the original set. Two concurrent commit waves.
- **Root cause**: `startBulkWithUndo` does not clear an existing `undoTimerRef.current` before overwriting it, and `handleBulkAction` does not gate on "is there already an undoState pending?". `bulkResolving` is the wrong gate — it only covers the post-undo PATCH phase, not the undo window itself.
- **Impact**: Duplicate audit-log rows, duplicate webhook deliveries to downstream consumers, possible duplicate Slack/email notifications wired to `manual_review.approved`. For "rejected" actions on integrations that take action on rejection (e.g. close a ticket), this can cause repeat side effects.
- **Fix sketch**: At the top of `startBulkWithUndo`, `if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); undoTimerRef.current = null; }`. In `handleBulkAction` / `handleBulkRejectConfirm`, early-return if `undoState !== null` *or* `bulkResolving`. Also disable the bulk-action buttons in the UI while `undoState` is set.

---

## 4. Escalation `escalate` action is client-only — re-fires every poll tick after store reset

- **Severity**: High
- **Category**: Silent failure / repeated side effect
- **File**: `src/stores/reviewStore.ts:373-379` (escalate branch); `283-306` (fetchReviews)
- **Scenario**:
  1. `checkEscalations` runs (poll-driven, every N seconds). For an SLA-expired pending review whose policy is `escalate`, it sets `escalatedAt: new Date().toISOString()` purely in local state — no API call, no server-side persistence (line 374-378).
  2. `fetchReviews` then runs (poll cadence) and rebuilds `reviews` from `api.listEvents`. `parseManualReview` (line 60-77) constructs each review with `escalatedAt: null` because the server has no field for it.
  3. The local `escalatedAt` is wiped. On the very next `checkEscalations` call, the same row is again "not escalated" and falls past the SLA → `set({ ... escalatedAt: ... })` again — and any user-facing escalate side effect (Sentry breadcrumb, toast, Slack post, etc. wired to a derived selector watching `escalatedAt` flips) fires again.
  4. Same pattern on tab refresh, route change back to `/dashboard/reviews`, or store `reset()` (which is called on auth change per line 332-342).
- **Root cause**: The escalate branch was written as if `escalatedAt` were durable, but `parseManualReview` doesn't read it from the event payload (no field exists). There is no API call to mark the event escalated, so client-only state is the source of truth — and it gets wiped by every fetch.
- **Impact**: For any consumer that reacts to `escalatedAt` flipping non-null (notification system, audit timeline), repeated firings cause notification spam every 15 s once an SLA expires. The cross-tab lock guards intra-pass concurrency but does not guard against the same row being re-escalated by *the next pass* after fetch wipes its `escalatedAt`.
- **Fix sketch**: Either (a) persist escalation server-side: add `api.escalateEvent(id)` and call it in the escalate branch; have the server return `escalatedAt` in the event metadata; have `parseManualReview` read it from `payload.escalatedAt` or a top-level `event.escalatedAt`. Or (b) maintain an `escalatedIds: Set<string>` in the store keyed by event id that survives `fetchReviews` and is checked before re-escalating. Option (a) is correct; option (b) is a temporary patch.

---

## 5. Retry of failed batch can run against rows that are no longer pending

- **Severity**: High
- **Category**: State corruption / TOCTOU
- **File**: `src/hooks/useReviewBulkActions.ts:243-248, 106-173`
- **Scenario**:
  1. Bulk approve of 20 rows runs. `executeBulkAction` rolls back 5 failed rows to `status: "pending"` (line 144-153) and shows `BulkResultToast`.
  2. While the toast is up, the 15 s poll fires (or the user manually interacts with one of the 5 failed rows individually — clicks Approve on one). Now some of `failedIds` are no longer pending in the store.
  3. User clicks "Retry". `retryFailed` calls `startBulkWithUndo(failedIds, status)`. Optimistic update writes `status: "approved"` over the 5 rows — including the one the user just approved individually (overwriting `resolvedAt` and `resolvedBy`) and any that the poll re-pulled.
  4. After the 5-second undo window, `executeBulkAction` runs `resolveReview` on each id. For an id that was already `processed`, the PATCH may 409 (or succeed silently with a duplicate audit-log entry per #3).
- **Root cause**: `retryFailed` trusts the snapshot in `bulkResult.failedIds` and never re-validates against current store state. There is no guard like "drop any id whose current status is no longer pending."
- **Impact**: Lost individual review decisions (overwritten by retry's optimistic update), audit-log duplication, possible API errors that bubble up as further "failed" toasts when the server enforces idempotency strictly.
- **Fix sketch**: In `retryFailed`, filter `failedIds` against the current store: `const stillPending = failedIds.filter(id => useReviewStore.getState().reviews.find(r => r.id === id)?.status === "pending")`. Pass `stillPending` to `startBulkWithUndo`. If the filtered set is empty, dismiss the toast and show a "Already resolved" message.

---

## 6. `resolveReview` doesn't write `reviewerNotes` to the optimistic local row

- **Severity**: Medium
- **Category**: State inconsistency / silent UI lag
- **File**: `src/stores/reviewStore.ts:307-322`
- **Scenario**:
  1. Operator opens a critical review, types reviewer notes, clicks "Approve with note". The page calls `resolveReview(id, "approved", "Looks correct after manual verify")`.
  2. The notes are sent to the server as `metadata: JSON.stringify({ reviewerNotes: notes })` (line 311). The server persists them.
  3. The optimistic setState (line 313-321) sets `status`, `resolvedAt`, `resolvedBy`, but not `reviewerNotes`. The local row's `reviewerNotes` stays at whatever it was (typically `null` for a freshly-pending row).
  4. UI showing the audit detail of the just-approved review displays "No reviewer notes" until the next `fetchReviews` poll (up to 15 s later) re-pulls and re-parses. Then the notes appear.
  5. If the operator screenshots the audit log immediately for a compliance ticket, the notes are missing.
- **Root cause**: Forgotten field in the optimistic mapping.
- **Impact**: Confusing UX (operator thinks notes were lost), failed compliance screenshots, and on the auto-approve path (`checkEscalations` line 372: `resolveReview(review.id, "approved", "Auto-approved: SLA expired")`), the local row never reflects the auto-approve note for up to 15 seconds.
- **Fix sketch**: In the setState mapper, also set `reviewerNotes: notes ?? r.reviewerNotes`. While there, also tag `parseError: false` if the optimistic action came from a manual operator (since the operator just verified it).

---

## 7. `SkeletonCard` shimmer animation never plays — wrong minus character in motion value

- **Severity**: Low
- **Category**: Silent failure (visual regression)
- **File**: `src/components/dashboard/SkeletonCard.tsx:23`
- **Scenario**: The shimmer overlay declares `animate={{ translateX: ["−100%", "200%"] }}`. The first value uses U+2212 MINUS SIGN (`−`) — not the ASCII hyphen-minus (`-`) framer-motion's value parser expects. The parser falls through to NaN/no-op for that keyframe, and the shimmer either never moves or jumps directly to 200 % from rest. The sibling `SkeletonChart` on line 63 uses the correct `"-100%"`, confirming the typo. Verify visually: skeleton cards on `/dashboard/reviews` (during the initial `fetchReviews`) show a static gradient with no left-to-right sweep, while skeleton charts shimmer normally.
- **Root cause**: Likely an editor auto-replace (e.g. "smart dashes" or a copy-paste from a prose document) substituted the unicode minus.
- **Impact**: Cosmetic — the loading state looks broken/frozen, which can be misinterpreted as a hung page during slow API responses.
- **Fix sketch**: Replace `"−100%"` with `"-100%"` (ASCII). Add a lint rule (eslint-plugin-unicorn `prefer-string-starts-ends-with`-style or a custom `no-unicode-minus`) to the codebase to catch the regression class.
