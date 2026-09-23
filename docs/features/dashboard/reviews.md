# Manual Review Queue
> The dashboard surface where agent decisions that need a human are paused and routed for approve / reject / skip. **Route:** `/dashboard/reviews` · **Nav label:** "Reviews" (aka Human Review) · **Status:** Demo-only (mocks)

## What it does

Some agent decisions shouldn't be made by the agent alone. When an agent hits one of those, it emits a `manual_review` event and pauses; this surface is where a human resolves it. Each item carries the persona that raised it, the proposed action's content, a severity, and a relative timestamp — enough to decide without leaving the queue.

The operator can **approve**, **reject**, or **skip** an item, by click or by keyboard, and can attach reviewer notes when resolving. Two ways to work the queue:

- **Split-pane** (default) — a filterable list (All / Pending / Approved / Rejected) on the left, a detail panel on the right. Supports multi-select with a bulk toolbar (select-all, bulk approve/reject), shift-click range selection, a confirm dialog before bulk rejects, and `j`/`k`/`a`/`r` keyboard navigation.
- **Focus flow** — a distraction-free, one-card-at-a-time mode that walks the pending queue. `a` approves, `r` rejects, `s` sends the current item to the back of the queue, `Esc` exits. A progress header shows position and a fill bar. Focus flow also mounts on mobile at `/m/reviews`.

Every human verdict, on every path (button, key, focus card, bulk toolbar, retry), shows at once and is saved after a **5-second undo** window. Reviewer notes typed in the detail panel travel with the verdict however it was given.

**Due-soonest triage.** Every pending review carries an SLA clock ("Due in 16 min." on the row, "Was due 16 hours ago" in the detail header and on the focus card): neutral while on track, amber once past its urgency threshold, rose once past its SLA. The queue is ordered by that deadline, so the most overdue review is on top (an old `info` review can outrank a fresh `critical` one), the page header shows "Overdue: N", and focus flow walks the queue in the same order: resolve the top card and the next most urgent follows.

Beyond the manual click/keyboard path, pending items age against an **escalation SLA** (per severity): once the SLA expires the system either auto-approves or auto-escalates, so nothing risky sits forever and the rest of the fleet keeps moving. A separate **voice** option can read new review requests aloud. The value: a single human-in-the-loop gate that keeps unsafe actions from shipping while keeping throughput high.

## How it works

**Two view modes, one store.** `page.tsx:14` holds `mode` state (`"split" | "focus"`) and swaps between `ReviewsSplitPane` and `ReviewsFocusFlow`. Both read `reviews` and `decide` from the single `useReviewStore` (`src/stores/reviewStore.ts`); mode is purely a presentation switch.

**Where items come from.** `fetchReviews` calls `api.listEvents({ eventType: "manual_review", limit: 100 })` and maps each `PersonaEvent` to a `ManualReviewItem` via `parseManualReview` (`reviewStore.ts:29`). Event `status` maps to review `status`: `processed → approved`, `failed → rejected`, else `pending`. The payload JSON yields `content`/`severity`/`reviewerNotes` and, for a decided row, `resolvedBy` (the resolver the verdict write recorded; a decided event with none recorded reads as `RESOLVED_BY_SYSTEM`). **Fail-loud parsing:** if `JSON.parse` throws or `severity` is missing/invalid, the item is promoted to `critical` and tagged `parseError: true` (`reviewStore.ts:41`) — the old `info` default would have silently widened the SLA and routed a malformed-but-real critical event to auto-approve.

**Decision ledger: one door for every verdict** (`src/lib/review-ledger.ts` + `reviewStore.ts`). The ledger is a pure transition table: `idle -> window (5 s, undoable) -> in flight -> idle`, with `undo` dropping the window. `transition(state, event)` returns the next state plus effects (`schedule`, `cancelTimer`, `commit`); the store holds `ledger`, owns the **one** window timer and runs the effects. Store API, the only way a human verdict is written:
- `decide(ids, verdict): boolean` arms a window. Notes come from `drafts[id]`. Returns `false` when refused (see `refusal`).
- `undoDecision()` cancels the open window (no write).
- `flushDecisions()` commits the open window now. Called on teardown: split-pane unmount (`useReviewBulkActions`), focus-flow unmount (desktop and `/m/reviews`), `pagehide` (registered once in `reviewStore.ts`) and `reset()` (sign-out).
- `setDraft(id, text)` / `drafts`: reviewer-note drafts keyed by review id. `ReviewDetailPanel` edits them, so keyboard `a`/`r` and the buttons carry the same notes. Cleared once the write succeeds.
- `commitProgress` (multi-row commit in flight), `lastResult` + `dismissResult` (a commit with failures), `refusal` (last refused arm).

Rules the table enforces: a disjoint arm while a window is open **commits the open window first** (flush-then-arm), so rapid `a`,`a`,`a` in focus saves each earlier verdict and leaves only the newest undoable; an arm overlapping the window or an in-flight commit is **refused** (shown as a line on the undo toast), never queued; retry is an ordinary arm through the same guard; timer events carry the `batchId`, so a stale expiry is a no-op. Commits run with a **concurrency cap of 6**; failed ids return to pending (the split pane reselects them and `BulkResultToast` offers Retry; focus flow puts them back at the front of its queue).

**Overlay, not a pause flag.** The store keeps `baseReviews` (server truth) and derives `reviews = overlay(baseReviews, ledger)` and `pendingReviewCount = countPending(reviews)` in one function (`derive`) at every write, including where a fetch response is applied. A poll, even one in flight when the window opened, cannot repaint a pending verdict. A settled commit patches `baseReviews` with the acknowledged ids (`applyConfirmed`) and bumps `reviewFetchSeq` so a response that left before the write is dropped.

**Machine verdicts stay immediate.** `resolveReview(id, status, notes?)` PATCHes at once (`approved -> processed`, `rejected -> failed`, notes as `reviewerNotes` metadata) and records the verdict as the system's (`resolvedBy = RESOLVED_BY_SYSTEM`, so an auto-approved row reads "by System", not "by you"). Only `checkEscalations` calls it (auto-approve with the note "Auto-approved: SLA expired"); no review surface does (a source scan in `review-ledger.test.ts` enforces this).

**Who resolved it survives the poll.** Every verdict goes through `writeVerdict(id, status, resolvedBy, notes?)` in `reviewStore.ts`, which sends `metadata = {reviewerNotes?, resolvedBy}`: `RESOLVED_BY_REVIEWER` from a ledger commit, `RESOLVED_BY_SYSTEM` from `resolveReview`. The mock `updateEvent` folds both into the stored payload (`mergeReviewMetadata`) and `parseManualReview` reads `resolvedBy` back, so neither a human verdict ("by you") nor an escalation ("by System") changes hands on the next 15 s poll. Pinned end to end against the real `mockApi` in `src/stores/reviewStore.resolver.test.ts`.

**Undo toast.** `ReviewUndoToast` (exported from `ReviewsSplitPaneToasts.tsx`, mounted by the split pane and by focus flow) renders `UndoToast` from `ledger.window`, keyed by `batchId`. `UndoToast` only displays the window's `deadline`; it owns no expiry timer.

**The SLA rule** (`src/lib/review-sla.ts`, pure, every function takes `now`). `slaState(review, policy, now)` returns `{ phase: ok | due-soon | overdue, remainingMs (negative once overdue, never clamped), dueAt, urgency }`; an unparseable `createdAt` is treated as due now. On top of it: `orderByDue` (pending by `dueAt` ascending, ties by severity then age; decided rows after, newest-first by `createdAt` as before), `countOverdue`, `focusQueue` (pending ids in due order), `reconcileFocusQueue`, `escalationDue`, `validateEscalationPolicy` and `formatDue` (`Intl.RelativeTimeFormat`, so no per-unit strings live in the locales; minutes under 1 h, hours under 48 h, days beyond). The order keys on `dueAt`, which does not move with `now`, so the ticking clock never reshuffles a list. Nothing else multiplies `slaMinutes` (source scan in `review-sla.test.ts`).

**Rows inside the undo window.** The ledger overlay is the truth everywhere: a row whose verdict is in the open 5 s window is a decided row. It sorts with the decided group, shows no clock, does not count as overdue, cannot be escalated and leaves the focus walk. Undo puts it back in exactly its due slot (and at the front of the focus walk). Tested in `review-sla.test.ts` and `src/stores/reviewStore.sla.test.ts`.

**The clock** (`review-due.tsx`). `useReviewClock()` is the queue's one `now`: a lazy `useState(() => Date.now())`, re-sampled every 30 s while the tab is visible (`usePageVisibility`; a hidden tab stops it and it re-samples on return). Under reduced motion (`useStillMotion`) it is static, sampled on mount and on each return to the tab, never ticking in place. `page.tsx` owns it and passes `now` to the split pane (rows, detail) and focus flow; `/m/reviews` passes none, so `ReviewsFocusFlow` runs its own. `DueChip` renders the chip (design.md pill recipe) for pending rows only; the page header renders "Overdue: N" from `countOverdue`.

**Split-pane sorting & selection.** `ReviewsSplitPane` filters by status then orders with `orderByDue`. Selection state is derived (`selectedId` falls back to the first row), and the selected row is `scrollIntoView`'d on change. Per-row keyboard handling lives in `useReviewKeyboardShortcuts` (`j`/`k` move, `a`/`r` call `decide` for the pending selection, `Esc` clears a bulk selection); all handlers bail when focus is in an `INPUT`/`TEXTAREA`/`SELECT`.

**Bulk selection** (`useReviewBulkActions.ts`). Selection is a `Set<string>`; the shift-click anchor is stored as an *id* (not index) so polling/sorting can't make it point at the wrong row. Rejects go through a `ConfirmDialog` first; then the selection is passed to `decide`. The hook holds no timer or commit logic.

**Focus flow queue.** `ReviewsFocusFlow` starts its walk from `focusQueue` (due order) and reconciles it when the pending set changes (`reconcileFocusQueue` in `review-sla.ts`): a decided card leaves because the overlay makes it non-pending; an undone or failed one returns to the front; new arrivals go to the back in due order; a skipped card stays where the operator put it. Progress counts ids decided in this session that are no longer pending.

**Polling.** Split-pane runs `usePolling(fetchReviews, 15_000, true)` and, when escalation is enabled, a 30s `checkEscalations` interval. A `reviewFetchSeq` guards against out-of-order responses.

**Escalation** (`reviewStore.ts`, `checkEscalations`). It scans the overlaid `reviews` and acts where `escalationDue(review, policy, now)` holds (pending, not yet escalated, action not `none`, phase `overdue`): it either `auto_approve`s (awaited resolve) or marks `escalatedAt`. Concurrency is triple-guarded: a per-id `escalationsInFlight` Set, a per-tab `escalationRunning` flag, and a cross-tab Web Lock (`navigator.locks.request("review-escalations", { ifAvailable: true })`) so only one tab runs the pass. Background tabs (`visibilityState === "hidden"`) skip entirely. The policy is persisted in `localStorage`; both the load and `setEscalationPolicy` run `validateEscalationPolicy` (partial/corrupt rules fall back to defaults; the load emits an aggregated Sentry warning).

**Urgency vs SLA** (`review-sla.ts`). The urgency thresholds (critical 5m / warning 30m / info 120m) mark `due-soon`; the escalation SLAs (defaults 30m / 240m / 480m) mark `overdue`. `SLA >= urgency threshold` is enforced on **every** policy that enters the store: `validateEscalationPolicy` rejects a shorter SLA (`"<sev>.slaMinutes: below urgency threshold"`) and falls back to the default, and a module-load assertion checks the default itself, so a row can never auto-resolve while still rendering as calm. Urgency is `slaState(...).urgency`; the old `reviewUtils.ts` wrapper was removed as dead code (knip sweep, 72dae5f).

**Voice** (`useReviewVoice.ts`, `review-voice.ts`). A tiny framework-free pub/sub bus: `emitNewReview` (from realtime sync or the settings Preview button) fans out to `onNewReview` subscribers; `useReviewVoice` composes "New {severity} review from {persona}: {title}" and speaks it via Web Speech — only when `useReviewVoiceStore.enabled` is true. `speak` de-dups across tabs with a per-id Web Lock; `pickVoice` selects the best available voice from a curated, quality-ordered list per locale.

**Display copy** (`src/lib/review-display.ts`, pure). The store writes stable sentinels (`resolvedBy` = `RESOLVED_BY_REVIEWER` / `RESOLVED_BY_SYSTEM`, the escalation note `AUTO_APPROVE_NOTE`, which is persisted as reviewer notes); `resolverLabel` / `reviewerNotesText` map them to `t.reviewsPage.resolver.*` / `autoApprovedNote` at render, and a human name or note passes through verbatim. Row, card and detail ages use `formatAge(iso, now, language)` (`Intl.RelativeTimeFormat` over `formatDue`, the page clock's `now`), not the English-only `relativeTime` from `src/lib/format.ts`; the undo countdown's seconds come from `Intl.NumberFormat` (`unit: "second"`).

## Key files
| File | Role |
| --- | --- |
| `src/app/dashboard/reviews/page.tsx` | Route entry; header ("Overdue: N") + split/focus mode toggle; owns the page clock |
| `src/app/dashboard/reviews/review-due.tsx` | `useReviewClock` (the one `now`, visibility- and reduced-motion-gated) + `DueChip` |
| `src/lib/review-sla.ts` | The one SLA rule: `slaState`, `orderByDue`, `countOverdue`, `focusQueue`, `reconcileFocusQueue`, `escalationDue`, `validateEscalationPolicy`, `formatDue`, `DEFAULT_ESCALATION_POLICY` (tests: `review-sla.test.ts`, `reviewFixtures.test.ts`, `src/stores/reviewStore.sla.test.ts`) |
| `src/app/dashboard/reviews/ReviewsSplitPane.tsx` | List + detail layout; polling, escalation interval, filtering/sorting, keyboard wiring |
| `src/app/dashboard/reviews/ReviewsFocusFlow.tsx` | One-card-at-a-time queue; `a`/`r`/`s`/`Esc` handling |
| `src/app/dashboard/reviews/reviews-split-pane/ReviewList.tsx` · `ReviewRow.tsx` | Scrollable list + per-row render (select box, severity dot, status dot, parse-error flag) |
| `src/app/dashboard/reviews/reviews-split-pane/ReviewDetailPanel.tsx` | Detail view: content, execution id, reviewer notes editor, approve/reject actions |
| `src/app/dashboard/reviews/reviews-split-pane/ReviewsBulkToolbar.tsx` | Select-all + bulk approve/reject toolbar |
| `src/app/dashboard/reviews/reviews-split-pane/ReviewsSplitPaneToasts.tsx` | `ReviewUndoToast` (ledger window to UndoToast, shared with focus flow) + BulkProgressBar / BulkResultToast / ConfirmDialog |
| `src/app/dashboard/reviews/reviews-split-pane/useReviewKeyboardShortcuts.ts` | `j`/`k`/`a`/`r`/`Esc` for the split-pane |
| `src/app/dashboard/reviews/reviews-split-pane/{ReviewStatusDot,reviewSeverityConfig}.ts(x)` | Status indicator + severity icon/color map |
| `src/app/dashboard/reviews/reviews-focus-flow/{FocusReviewCard,FocusProgressHeader,FocusEmptyState,focusSeverityConfig}.ts(x)` | Focus-mode card, header, empty state, severity pills |
| `src/lib/review-display.ts` | Resolver / auto-approve-note sentinels + their display mapping, `formatAge` (test: `review-queue-i18n.test.ts`, which also source-scans the queue for hardcoded English) |
| `src/hooks/useReviewBulkActions.ts` | Bulk selection, reject confirm, retry and unmount flush, all through `decide` |
| `src/lib/review-ledger.ts` | Pure decision ledger: `transition`, `overlay`, `applyConfirmed`, `countPending` (tests: `review-ledger.test.ts`, `src/stores/reviewStore.test.ts`) |
| `src/hooks/useReviewVoice.ts` | Bridges new-review signals to Web Speech |
| `src/stores/reviewStore.ts` | Review state, ledger + its one timer, `decide`/`undoDecision`/`flushDecisions`, drafts, fetch, escalation policy + `checkEscalations`, `writeVerdict` (tests: `reviewStore.test.ts`, `reviewStore.sla.test.ts`, `reviewStore.resolver.test.ts`) |
| `src/stores/reviewVoiceStore.ts` | `enabled` toggle for voice (localStorage-persisted) |
| `src/lib/review-voice.ts` · `review-voice-data.ts` | Speech pub/sub + announcement composition; curated voice list |
| `src/components/{UndoToast,BulkProgressBar,BulkResultToast,ConfirmDialog}.tsx` | Shared toast/dialog primitives consumed by the bulk flow |
| `src/components/dashboard/BatchReviewModal.tsx` + `batch-review-modal/*` | Generic conflict-decision modal — used by the **Memories** page, not the review queue (see gotcha) |

## Data & state
- **Source:** `manual_review` `PersonaEvent`s from `api.listEvents` — backed by mocks (`src/lib/mockData.ts`, `ev4`-`ev6` and `ev9`-`ev11`: 5 pending, of which 2 overdue, 2 due soon, 1 on track) in demo mode. The seeds are the ones the incident log describes (`inc_15` = `ev9`, `inc_9` = `ev10`), name fleet-roster personas only, and the pending count every badge shows (nav, mobile tab bar, Home triage, `/m/overview`) is pinned in `reviewFixtures.test.ts`; live data goes through the external orchestrator. Persona name/icon/color are joined from `usePersonaStore`.
- **Stores:**
  - `useReviewStore` — `reviews` (overlaid), `baseReviews`, `reviewsLoading`, `pendingReviewCount`, `ledger`, `drafts`, `commitProgress`, `lastResult`, `refusal`, `escalationPolicy`, `escalationEnabled`. Actions: `fetchReviews`, `decide`, `undoDecision`, `flushDecisions`, `setDraft`, `dismissResult`, `resolveReview` (machine actors only), `checkEscalations`, `setEscalationPolicy`, `setEscalationEnabled`, `reset` (flushes an open window first). Escalation prefs persist in `localStorage` (`review-escalation-policy`, `review-escalation-enabled`) and survive sign-out; `reset` clears review data only.
  - `useReviewVoiceStore` — `enabled` + `setEnabled`, persisted to `localStorage` (`review-voice-enabled`), off by default, not reset on sign-out.
- **API routes:** none in-repo. All access is via the `api` client (`src/lib/api.ts`) → `listEvents` / `updateEvent`, mock-backed under `/dashboard/*`. The mock `updateEvent` writes through to the in-session `MOCK_EVENTS` (and folds `reviewerNotes` + `resolvedBy` into the payload), so a saved verdict and who gave it survive the next poll.
- **Types** (`src/lib/types.ts`): `ManualReviewItem` (adds `parseError?`, `escalatedAt`, persona info), `ReviewSeverity` (`critical|warning|info`), `ReviewStatus` (`pending|approved|rejected`), `EscalationAction` (`auto_approve|escalate|none`), `EscalationRule`, `EscalationPolicy`. Bulk hook exports `BulkResult`; voice exports `NewReviewSignal`/`VoiceCopy`.

## Integration points
- **Dashboard shell** — renders under the `/dashboard/*` layout; nav badge uses `useReviewStore.pendingReviewCount`.
- **Persona store** — joins persona name/icon/color into each item; `PersonaAvatar`/`StatusBadge` for rendering.
- **Shared primitives** — `UndoToast`, `BulkProgressBar`, `BulkResultToast`, `ConfirmDialog` (all consumed by the bulk flow); `FilterBar` for the status pills; `usePolling`, `useFocusTrap`.
- **Realtime / voice** — `emitNewReview` is driven by realtime sync and the Settings "Preview" button; the voice toggle lives in `t.settingsPage.notifications.voice`.
- **i18n** — namespaces `t.reviewsPage.*` (focus, parseError, undo, sla, resolved/resolvedBy, resolver, autoApprovedNote, bulkProcessing, severity), `t.dashboardUi.*` (most labels, `status.*` for the filter pills and the progress bar's failed count), `t.executionsPage.all` (the "All" pill), `t.eventsPage.unknownAgent`, `t.dashboard.reviews` (nav label), `t.guide…dashboardReviews` (product description), `t.memoriesPage.conflicts.*` (BatchReviewModal).
- **Telemetry** — Sentry warnings on escalation-policy validation failures and voice errors.

## Conventions & gotchas
- **i18n (14-locale lockstep):** all user-facing copy comes from `t.*` or `Intl`; any new key must be added to `en.ts` and hand-translated into all 13 other locales in the same commit. `src/lib/review-queue-i18n.test.ts` scans the queue's rendering files (this folder, `BulkProgressBar`, `BulkResultToast`, `ConfirmDialog`, `UndoToast`, `BatchReviewModal` + `batch-review-modal/*`) and fails on prose literals, JSX text, a raw `.severity`/`.status`/`.resolvedBy` rendered as text, or a `relativeTime(` call; its allowlist is only key names (`Escape`, `Enter`) and the `<kbd>` glyphs `A R S J K`. Count-bearing copy is count-neutral ("Processing reviews: {count}"), never an English plural suffix.
- **Semantic Tailwind tokens** throughout (`text-foreground`, `border-glass`, `text-brand-cyan`, severity `*-500/10` tints). No raw hex except persona color fallbacks.
- **Animation gating:** `UndoToast` (`useStillMotion`) and `BulkProgressBar` (`useReducedMotion`) gate the shrink/spin animations — required by `custom-animation/require-animation-gating`. Card transitions use framer `AnimatePresence` without rAF.
- **React 19 purity/effects:** reset-on-prop-change uses the prev-state pattern, not `setState`-in-effect — see the `prevPendingKey` queue reconcile in `ReviewsFocusFlow.tsx`, `prevResult` reselect in `useReviewBulkActions.ts`, and `prevOpen` in `BatchReviewModal.tsx:37`. Don't reintroduce effect-based resets. `new Date()`/`Date.now()` only appear in event handlers and store actions, never in render/`useMemo`.
- **Verdict door:** never call `resolveReview` or `api.updateEvent` from a review surface; go through `decide` so the verdict gets the window, the overlap guard, the notes and the teardown flush. Keep `flushDecisions()` in the unmount of every surface that shows the undo toast.
- **Derived counts:** `reviews` and `pendingReviewCount` are written only by `derive()` in `reviewStore.ts` (source scan in `review-ledger.test.ts`). Write `baseReviews` and re-derive; never patch `reviews` directly or the overlay is lost.
- **Escalation concurrency:** auto-approve/escalate is a persistent write — keep all three guards (`escalationsInFlight`, `escalationRunning`, the cross-tab Web Lock) if you refactor `checkEscalations`, or you'll get duplicate audit rows/webhooks.
- **Urgency < SLA invariant:** `validateEscalationPolicy` (`review-sla.ts`) refuses any SLA shorter than its urgency threshold on every policy it sees, and the module throws at load if the default breaks it. Respect it when tuning timings.
- **One SLA rule, one clock:** never compute SLA age inline (a source scan fails on `slaMinutes *` outside `review-sla.ts`), and never call `Date.now()` in render: take `now` from `useReviewClock` or the page's prop. Adding a manual_review seed moves every pending badge; update the pinned count in `reviewFixtures.test.ts` on purpose.
- **BatchReviewModal naming trap:** despite the "Review" name and its `batch-review-modal/` folder, `BatchReviewModal` operates on `MemoryItem` conflicts via `t.memoriesPage.conflicts.*` and belongs to the **Memories** page, not this queue. The review queue's batching lives in `useReviewBulkActions` + `ReviewsBulkToolbar`.
- **Demo-only:** the whole surface runs on mocks. To extend safely, add fields to `ManualReviewItem` + `parseManualReview`, seed `mockData.ts`, and keep `resolveReview`'s event-status mapping (`approved↔processed`, `rejected↔failed`) intact.

## Related docs
- [Dashboard shell & chrome](shell-chrome.md)
- [Agents (Personas) Management](agents.md)
- [Feature index](../INDEX.md)
