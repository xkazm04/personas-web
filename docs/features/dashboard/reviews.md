# Manual Review Queue
> The dashboard surface where agent decisions that need a human are paused and routed for approve / reject / skip. **Route:** `/dashboard/reviews` · **Nav label:** "Reviews" (aka Human Review) · **Status:** Demo-only (mocks)

## What it does

Some agent decisions shouldn't be made by the agent alone. When an agent hits one of those, it emits a `manual_review` event and pauses; this surface is where a human resolves it. Each item carries the persona that raised it, the proposed action's content, a severity, and a relative timestamp — enough to decide without leaving the queue.

The operator can **approve**, **reject**, or **skip** an item, by click or by keyboard, and can attach reviewer notes when resolving. Two ways to work the queue:

- **Split-pane** (default) — a filterable list (All / Pending / Approved / Rejected) on the left, a detail panel on the right. Supports multi-select with a bulk toolbar (select-all, bulk approve/reject), shift-click range selection, a confirm dialog before bulk rejects, and `j`/`k`/`a`/`r` keyboard navigation.
- **Focus flow** — a distraction-free, one-card-at-a-time mode that walks the pending queue. `a` approves, `r` rejects, `s` sends the current item to the back of the queue, `Esc` exits. A progress header shows position and a fill bar. Focus flow also mounts on mobile at `/m/reviews`.

Every human verdict, on every path (button, key, focus card, bulk toolbar, retry), shows at once and is saved after a **5-second undo** window. Reviewer notes typed in the detail panel travel with the verdict however it was given.

Beyond the manual click/keyboard path, pending items age against an **escalation SLA** (per severity): once the SLA expires the system either auto-approves or auto-escalates, so nothing risky sits forever and the rest of the fleet keeps moving. A separate **voice** option can read new review requests aloud. The value: a single human-in-the-loop gate that keeps unsafe actions from shipping while keeping throughput high.

## How it works

**Two view modes, one store.** `page.tsx:14` holds `mode` state (`"split" | "focus"`) and swaps between `ReviewsSplitPane` and `ReviewsFocusFlow`. Both read `reviews` and `decide` from the single `useReviewStore` (`src/stores/reviewStore.ts`); mode is purely a presentation switch.

**Where items come from.** `fetchReviews` calls `api.listEvents({ eventType: "manual_review", limit: 100 })` and maps each `PersonaEvent` to a `ManualReviewItem` via `parseManualReview` (`reviewStore.ts:29`). Event `status` maps to review `status`: `processed → approved`, `failed → rejected`, else `pending`. The payload JSON yields `content`/`severity`/`reviewerNotes`. **Fail-loud parsing:** if `JSON.parse` throws or `severity` is missing/invalid, the item is promoted to `critical` and tagged `parseError: true` (`reviewStore.ts:41`) — the old `info` default would have silently widened the SLA and routed a malformed-but-real critical event to auto-approve.

**Decision ledger: one door for every verdict** (`src/lib/review-ledger.ts` + `reviewStore.ts`). The ledger is a pure transition table: `idle -> window (5 s, undoable) -> in flight -> idle`, with `undo` dropping the window. `transition(state, event)` returns the next state plus effects (`schedule`, `cancelTimer`, `commit`); the store holds `ledger`, owns the **one** window timer and runs the effects. Store API, the only way a human verdict is written:
- `decide(ids, verdict): boolean` arms a window. Notes come from `drafts[id]`. Returns `false` when refused (see `refusal`).
- `undoDecision()` cancels the open window (no write).
- `flushDecisions()` commits the open window now. Called on teardown: split-pane unmount (`useReviewBulkActions`), focus-flow unmount (desktop and `/m/reviews`), `pagehide` (registered once in `reviewStore.ts`) and `reset()` (sign-out).
- `setDraft(id, text)` / `drafts`: reviewer-note drafts keyed by review id. `ReviewDetailPanel` edits them, so keyboard `a`/`r` and the buttons carry the same notes. Cleared once the write succeeds.
- `commitProgress` (multi-row commit in flight), `lastResult` + `dismissResult` (a commit with failures), `refusal` (last refused arm).

Rules the table enforces: a disjoint arm while a window is open **commits the open window first** (flush-then-arm), so rapid `a`,`a`,`a` in focus saves each earlier verdict and leaves only the newest undoable; an arm overlapping the window or an in-flight commit is **refused** (shown as a line on the undo toast), never queued; retry is an ordinary arm through the same guard; timer events carry the `batchId`, so a stale expiry is a no-op. Commits run with a **concurrency cap of 6**; failed ids return to pending (the split pane reselects them and `BulkResultToast` offers Retry; focus flow puts them back at the front of its queue).

**Overlay, not a pause flag.** The store keeps `baseReviews` (server truth) and derives `reviews = overlay(baseReviews, ledger)` and `pendingReviewCount = countPending(reviews)` in one function (`derive`) at every write, including where a fetch response is applied. A poll, even one in flight when the window opened, cannot repaint a pending verdict. A settled commit patches `baseReviews` with the acknowledged ids (`applyConfirmed`) and bumps `reviewFetchSeq` so a response that left before the write is dropped.

**Machine verdicts stay immediate.** `resolveReview(id, status, notes?)` PATCHes at once (`approved -> processed`, `rejected -> failed`, notes as `reviewerNotes` metadata). Only `checkEscalations` calls it (auto-approve with the note "Auto-approved: SLA expired"); no review surface does (a source scan in `review-ledger.test.ts` enforces this).

**Undo toast.** `ReviewUndoToast` (exported from `ReviewsSplitPaneToasts.tsx`, mounted by the split pane and by focus flow) renders `UndoToast` from `ledger.window`, keyed by `batchId`. `UndoToast` only displays the window's `deadline`; it owns no expiry timer.

**Split-pane sorting & selection.** `ReviewsSplitPane.tsx:40` filters by status then sorts pending-first, newest-first. Selection state is derived (`selectedId` falls back to the first row), and the selected row is `scrollIntoView`'d on change. Per-row keyboard handling lives in `useReviewKeyboardShortcuts` (`j`/`k` move, `a`/`r` call `decide` for the pending selection, `Esc` clears a bulk selection); all handlers bail when focus is in an `INPUT`/`TEXTAREA`/`SELECT`.

**Bulk selection** (`useReviewBulkActions.ts`). Selection is a `Set<string>`; the shift-click anchor is stored as an *id* (not index) so polling/sorting can't make it point at the wrong row. Rejects go through a `ConfirmDialog` first; then the selection is passed to `decide`. The hook holds no timer or commit logic.

**Focus flow queue.** `ReviewsFocusFlow` keeps its walk order in `queue` and reconciles it when the pending set changes (`reconcileQueue`): a decided card leaves because the overlay makes it non-pending; an undone or failed one returns to the front; new arrivals go to the back. Progress counts ids decided in this session that are no longer pending.

**Polling.** Split-pane runs `usePolling(fetchReviews, 15_000, true)` and, when escalation is enabled, a 30s `checkEscalations` interval. A `reviewFetchSeq` guards against out-of-order responses.

**Escalation** (`reviewStore.ts:350`). `checkEscalations` scans pending, non-escalated items; if an item's age exceeds the per-severity `slaMinutes` it either `auto_approve`s (awaited resolve) or marks `escalatedAt`. Concurrency is triple-guarded: a per-id `escalationsInFlight` Set, a per-tab `escalationRunning` flag, and a cross-tab Web Lock (`navigator.locks.request("review-escalations", { ifAvailable: true })`) so only one tab runs the pass. Background tabs (`visibilityState === "hidden"`) skip entirely. The policy is persisted in `localStorage` and field-validated on load (partial/corrupt rules fall back to defaults with an aggregated Sentry warning).

**Urgency vs SLA** (`reviewUtils.ts`). `getUrgencyLevel` drives a cosmetic glow at shorter thresholds (critical 5m / warning 30m / info 120m) than the escalation SLAs (30m / 240m / 480m). A module-load assertion enforces `SLA >= urgency threshold` so a row can never auto-resolve while still rendering as calm.

**Voice** (`useReviewVoice.ts`, `review-voice.ts`). A tiny framework-free pub/sub bus: `emitNewReview` (from realtime sync or the settings Preview button) fans out to `onNewReview` subscribers; `useReviewVoice` composes "New {severity} review from {persona}: {title}" and speaks it via Web Speech — only when `useReviewVoiceStore.enabled` is true. `speak` de-dups across tabs with a per-id Web Lock; `pickVoice` selects the best available voice from a curated, quality-ordered list per locale.

**Shortcuts HUD** (`ShortcutsHud.tsx`). Exports `ShortcutsFooter` and `ShortcutsOverlay` (searchable, grouped, `Esc`-to-close) plus the `REVIEW_SHORTCUTS` catalog. Note: these are presently self-contained and **not mounted** by the reviews page — the live in-pane shortcuts are wired in `useReviewKeyboardShortcuts` / `ReviewsFocusFlow`. `usePlatformMod` resolves Cmd vs Ctrl per platform.

## Key files
| File | Role |
| --- | --- |
| `src/app/dashboard/reviews/page.tsx` | Route entry; header + split/focus mode toggle |
| `src/app/dashboard/reviews/ReviewsSplitPane.tsx` | List + detail layout; polling, escalation interval, filtering/sorting, keyboard wiring |
| `src/app/dashboard/reviews/ReviewsFocusFlow.tsx` | One-card-at-a-time queue; `a`/`r`/`s`/`Esc` handling |
| `src/app/dashboard/reviews/reviews-split-pane/ReviewList.tsx` · `ReviewRow.tsx` | Scrollable list + per-row render (select box, severity dot, status dot, parse-error flag) |
| `src/app/dashboard/reviews/reviews-split-pane/ReviewDetailPanel.tsx` | Detail view: content, execution id, reviewer notes editor, approve/reject actions |
| `src/app/dashboard/reviews/reviews-split-pane/ReviewsBulkToolbar.tsx` | Select-all + bulk approve/reject toolbar |
| `src/app/dashboard/reviews/reviews-split-pane/ReviewsSplitPaneToasts.tsx` | `ReviewUndoToast` (ledger window to UndoToast, shared with focus flow) + BulkProgressBar / BulkResultToast / ConfirmDialog |
| `src/app/dashboard/reviews/reviews-split-pane/useReviewKeyboardShortcuts.ts` | `j`/`k`/`a`/`r`/`Esc` for the split-pane |
| `src/app/dashboard/reviews/reviews-split-pane/{ReviewStatusDot,reviewSeverityConfig}.ts(x)` | Status indicator + severity icon/color map |
| `src/app/dashboard/reviews/reviews-focus-flow/{FocusReviewCard,FocusProgressHeader,FocusEmptyState,focusSeverityConfig}.ts(x)` | Focus-mode card, header, empty state, severity pills |
| `src/app/dashboard/reviews/ShortcutsHud.tsx` + `shortcuts-hud/*` | Shortcuts footer/overlay, `REVIEW_SHORTCUTS`, platform mod (not currently mounted) |
| `src/hooks/useReviewBulkActions.ts` | Bulk selection, reject confirm, retry and unmount flush, all through `decide` |
| `src/lib/review-ledger.ts` | Pure decision ledger: `transition`, `overlay`, `applyConfirmed`, `countPending` (tests: `review-ledger.test.ts`, `src/stores/reviewStore.test.ts`) |
| `src/hooks/useReviewVoice.ts` | Bridges new-review signals to Web Speech |
| `src/stores/reviewStore.ts` | Review state, ledger + its one timer, `decide`/`undoDecision`/`flushDecisions`, drafts, fetch, escalation policy + `checkEscalations` |
| `src/stores/reviewVoiceStore.ts` | `enabled` toggle for voice (localStorage-persisted) |
| `src/lib/reviewUtils.ts` | Urgency level, SLA countdown, audit analytics |
| `src/lib/review-voice.ts` · `review-voice-data.ts` | Speech pub/sub + announcement composition; curated voice list |
| `src/components/{UndoToast,BulkProgressBar,BulkResultToast,ConfirmDialog}.tsx` | Shared toast/dialog primitives consumed by the bulk flow |
| `src/components/dashboard/BatchReviewModal.tsx` + `batch-review-modal/*` | Generic conflict-decision modal — used by the **Memories** page, not the review queue (see gotcha) |

## Data & state
- **Source:** `manual_review` `PersonaEvent`s from `api.listEvents` — backed by mocks (`src/lib/mockData.ts`, e.g. the "Proposed Incident Mitigation" critical item) in demo mode; live data goes through the external orchestrator. Persona name/icon/color are joined from `usePersonaStore`.
- **Stores:**
  - `useReviewStore` — `reviews` (overlaid), `baseReviews`, `reviewsLoading`, `pendingReviewCount`, `ledger`, `drafts`, `commitProgress`, `lastResult`, `refusal`, `escalationPolicy`, `escalationEnabled`. Actions: `fetchReviews`, `decide`, `undoDecision`, `flushDecisions`, `setDraft`, `dismissResult`, `resolveReview` (machine actors only), `checkEscalations`, `setEscalationPolicy`, `setEscalationEnabled`, `reset` (flushes an open window first). Escalation prefs persist in `localStorage` (`review-escalation-policy`, `review-escalation-enabled`) and survive sign-out; `reset` clears review data only.
  - `useReviewVoiceStore` — `enabled` + `setEnabled`, persisted to `localStorage` (`review-voice-enabled`), off by default, not reset on sign-out.
- **API routes:** none in-repo. All access is via the `api` client (`src/lib/api.ts`) → `listEvents` / `updateEvent`, mock-backed under `/dashboard/*`. The mock `updateEvent` writes through to the in-session `MOCK_EVENTS` (and folds `reviewerNotes` into the payload), so a saved verdict survives the next poll.
- **Types** (`src/lib/types.ts`): `ManualReviewItem` (adds `parseError?`, `escalatedAt`, persona info), `ReviewSeverity` (`critical|warning|info`), `ReviewStatus` (`pending|approved|rejected`), `EscalationAction` (`auto_approve|escalate|none`), `EscalationRule`, `EscalationPolicy`. Bulk hook exports `BulkResult`; voice exports `NewReviewSignal`/`VoiceCopy`.

## Integration points
- **Dashboard shell** — renders under the `/dashboard/*` layout; nav badge uses `useReviewStore.pendingReviewCount`.
- **Persona store** — joins persona name/icon/color into each item; `PersonaAvatar`/`StatusBadge` for rendering.
- **Shared primitives** — `UndoToast`, `BulkProgressBar`, `BulkResultToast`, `ConfirmDialog` (all consumed by the bulk flow); `FilterBar` for the status pills; `usePolling`, `useFocusTrap`.
- **Realtime / voice** — `emitNewReview` is driven by realtime sync and the Settings "Preview" button; the voice toggle lives in `t.settingsPage.notifications.voice`.
- **i18n** — namespaces `t.reviewsPage.*` (focus, parseError, undo), `t.dashboardUi.*` (most labels), `t.dashboard.reviews` (nav label), `t.guide…dashboardReviews` (product description), `t.memoriesPage.conflicts.*` (BatchReviewModal).
- **Telemetry** — Sentry warnings on escalation-policy validation failures and voice errors.

## Conventions & gotchas
- **i18n (14-locale lockstep):** all user-facing copy comes from `t.*`; any new key must be added to `en.ts` and hand-translated into all 13 other locales in the same commit. A few literals are still hardcoded in shared primitives (`"Undo"`, `"Retry"`, `"Cancel"`, `BulkProgressBar`/`BulkResultToast` label strings, the `Processing N reviews` / `Reject N reviews` templates) — match the existing pattern if you touch them.
- **Semantic Tailwind tokens** throughout (`text-foreground`, `border-glass`, `text-brand-cyan`, severity `*-500/10` tints). No raw hex except persona color fallbacks.
- **Animation gating:** `UndoToast` (`useStillMotion`) and `BulkProgressBar` (`useReducedMotion`) gate the shrink/spin animations — required by `custom-animation/require-animation-gating`. Card transitions use framer `AnimatePresence` without rAF.
- **React 19 purity/effects:** reset-on-prop-change uses the prev-state pattern, not `setState`-in-effect — see the `prevPendingKey` queue reconcile in `ReviewsFocusFlow.tsx`, `prevResult` reselect in `useReviewBulkActions.ts`, and `prevOpen` in `BatchReviewModal.tsx:37`. Don't reintroduce effect-based resets. `new Date()`/`Date.now()` only appear in event handlers and store actions, never in render/`useMemo`.
- **Verdict door:** never call `resolveReview` or `api.updateEvent` from a review surface; go through `decide` so the verdict gets the window, the overlap guard, the notes and the teardown flush. Keep `flushDecisions()` in the unmount of every surface that shows the undo toast.
- **Derived counts:** `reviews` and `pendingReviewCount` are written only by `derive()` in `reviewStore.ts` (source scan in `review-ledger.test.ts`). Write `baseReviews` and re-derive; never patch `reviews` directly or the overlay is lost.
- **Escalation concurrency:** auto-approve/escalate is a persistent write — keep all three guards (`escalationsInFlight`, `escalationRunning`, the cross-tab Web Lock) if you refactor `checkEscalations`, or you'll get duplicate audit rows/webhooks.
- **Urgency < SLA invariant:** `reviewUtils.ts` throws at module load if any escalation SLA is shorter than its urgency threshold — respect it when tuning timings.
- **BatchReviewModal naming trap:** despite the "Review" name and its `batch-review-modal/` folder, `BatchReviewModal` operates on `MemoryItem` conflicts via `t.memoriesPage.conflicts.*` and belongs to the **Memories** page, not this queue. The review queue's batching lives in `useReviewBulkActions` + `ReviewsBulkToolbar`.
- **ShortcutsHud not mounted:** `ShortcutsFooter`/`ShortcutsOverlay` aren't rendered by the reviews page today; the actual key handling is in `useReviewKeyboardShortcuts` and `ReviewsFocusFlow`. If you wire the HUD in, keep `REVIEW_SHORTCUTS` in sync with the real handlers.
- **Demo-only:** the whole surface runs on mocks. To extend safely, add fields to `ManualReviewItem` + `parseManualReview`, seed `mockData.ts`, and keep `resolveReview`'s event-status mapping (`approved↔processed`, `rejected↔failed`) intact.

## Related docs
- [Dashboard shell & chrome](shell-chrome.md)
- [Agents (Personas) Management](agents.md)
- [Feature index](../INDEX.md)
