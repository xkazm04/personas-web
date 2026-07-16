# Event Bus & Stream Monitoring — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. Replay outcomes are a black hole: bulk-retry summary discarded, single retry rejects unhandled, locked events still look retryable
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: silent-failure-replay-feedback
- **File**: `src/components/dashboard/EventsListPanel.tsx:68`
- **Scenario**: User clicks Retry on a failed event, or selects failed events and hits "Retry All". `handleReplay` is `void replayEvent(event)` (line 68) — `replayEvent` throws `ReplayLockedError` or `new Error("Replay failed")` (`src/stores/eventStore.ts:189-190`), so a failed or locked retry becomes an unhandled promise rejection and the UI changes nothing. `handleBulkRetry` (lines 77-84) awaits `replayEvents` which returns a rich `{ succeeded, failed, aborted, skipped }` summary — including circuit-breaker abort after 5 consecutive failures — and throws the whole object away, then clears the selection as if everything succeeded.
- **Root cause**: The store was carefully hardened (retry budget, circuit breaker, skip-locked pre-filter) but no UI consumer surfaces any of it; the retry button in `EventsListColumns.tsx:116-123` disables only on `replayingIds`, never on `isReplayLocked`, so a locked event renders a fully enabled button that does nothing when clicked.
- **Impact**: The primary DLQ recovery action fails silently. An operator whose "Retry All" was circuit-breaker-aborted after 5 failures sees the selection clear and reasonably believes hundreds of events were replayed. Locked events present a live-looking button that is a guaranteed no-op plus a console rejection.
- **Fix sketch**: Surface the `replayEvents` result in a toast ("X replayed, Y failed, Z skipped (locked), aborted early" — the aborted case worded distinctly); catch in `handleReplay` and toast `ReplayLockedError` vs generic failure; in `RetryEventButton`, disable + retitle when `isReplayLocked(retryCounts, event.id)` (the helper is already exported).

## 2. Topology source nodes are mouse-only — no keyboard or screen-reader path to the event detail drawer
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: svg-interactive-no-keyboard-access
- **File**: `src/components/dashboard/event-bus-visualization/EventBusNodes.tsx:11`
- **Scenario**: On the Visualization tab, clicking a source node (GitHub, Slack, Webhook…) or persona node in the SVG opens `EventDetailDrawer`. Both node groups are `<g className="cursor-pointer" onClick={...}>` with no `tabIndex`, `role`, keyboard handler, or accessible name (same pattern at line 28 for personas).
- **Root cause**: Interactivity was added to raw SVG `<g>` elements without focusability. Personas happen to have a redundant keyboard-accessible button grid below the SVG (`EventsVisualizationView.tsx:82-109`), but sources appear nowhere else — the SVG click is the only entry point.
- **Impact**: Keyboard and screen-reader users cannot open detail for any source node at all (a whole class of drawer content unreachable), and the SVG announces nothing about being interactive. Notable because the drawer itself has an excellent focus trap (`useDialogFocusTrap.ts`) — the a11y investment is stranded behind a mouse-only entry.
- **Fix sketch**: Give each node group `role="button"`, `tabIndex={0}`, `aria-label={node.label}`, and an `onKeyDown` for Enter/Space (or render `<a>`/`focusable` SVG wrappers); add a visible `:focus-visible` outline ring on the circle. Alternatively add source nodes to the button grid below so parity with personas exists outside the SVG.

## 3. Fabricated "live" telemetry: simulated stats hardcode Connected, and the drawer shows one random event for every node
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: mock-data-presented-as-live
- **File**: `src/components/dashboard/EventBusStats.tsx:68`
- **Scenario**: The Visualization tab renders `EventBusStats`, whose numbers come from `useSimulatedMetrics` (random-walk counters seeded at 24 ev/s / 148,302 total, lines 11-28) and whose status is `const [connected] = useState(true)` — permanently "Connected" with a green ping, sitting on the same page as the real `ConnectionStatusIndicator` in the header, which can simultaneously say "reconnecting". Meanwhile `EventDetailDrawer.tsx:25-27` initializes `eventType`/`durationMs`/`timestamp` in `useState(() => random...)` — but the drawer is mounted once per page, so every node the user clicks shows the *identical* random event type, duration, and timestamp for the whole session.
- **Root cause**: Marketing-demo components were wired into a dashboard tab that elsewhere consumes real store/SSE data, with no visual or code-level marker distinguishing simulated from live; the drawer's mock values were placed in mount-scoped state instead of being derived per `node`.
- **Impact**: An operator can see green "Connected / 24 events/sec" while the real stream is down (the header indicator and the stats bar directly contradict each other), and the drawer's frozen mock metadata makes every node look like it fired the same event at the same instant — undermining trust in the entire monitoring surface.
- **Fix sketch**: Drive `connected` from `useEventStore((s) => s.connectionStatus)` and either feed the counters from real `events` (rate over the buffer) or badge the bar and drawer fields as "Simulated/Demo". For the drawer, re-derive mock values when `node` changes (e.g. `useMemo(..., [node?.id])` or reuse the deterministic `mockPayloadForNode` approach so per-node values are stable and distinct).

## 4. Replay retry budget doesn't follow the republished event, and localStorage retry counts grow forever
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: undocumented-retry-budget-semantics
- **File**: `src/stores/eventStore.ts:170`
- **Scenario**: `replayEvent` calls `api.publishEvent`, which mints a *new* event (new id) that is appended alongside the old one. `retryCounts` is keyed by the old id, so if the republished copy fails again its budget restarts at 0 — the MAX_REPLAY_RETRIES=3 cap only limits clicks on one row, not replays of the logical event, contradicting the comment's own framing that a "permanently broken handler" must get locked out. Meanwhile `RETRY_COUNTS_KEY` entries (line 17) are persisted to localStorage on every attempt and only cleared by full `reset()`; ids of long-gone events accumulate indefinitely across sessions.
- **Root cause**: Replay-as-republish creates a new identity, but the retry ledger and its persistence assume stable event ids; there is no pruning pass and no recorded decision on whether the budget is per-row or per-logical-event.
- **Impact**: A poison message can still be pumped at the bus indefinitely by retrying each successive republished copy (3 clicks per copy), and localStorage silently accretes stale keys — both against the explicitly stated intent of the lockout mechanism.
- **Fix sketch**: Carry the budget forward: on republish, seed `retryCounts[newEvent.id] = retryCounts[oldEvent.id]` (or key the ledger by a correlation id if the API exposes one). Prune on `loadRetryCounts`: drop entries not present in the current event buffer or older than a TTL (store `{count, ts}`). Record the chosen semantics in a comment next to `MAX_REPLAY_RETRIES`.

## 5. Borrowed and hardcoded filter labels: untranslated "Dead Letter", "processed" shown as "Completed", clear-selection labeled "clear filters"
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: i18n-label-mismatch
- **File**: `src/components/dashboard/EventsFiltersToolbar.tsx:60`
- **Scenario**: The status FilterBar hardcodes the English string `"Dead Letter"` (line 60) in an otherwise fully i18n'd page, borrows `labels.memoriesPage.status.pending` for pending and `labels.executionsPage.completed` for the `processed` status (lines 57-58) — while `StatusBadge` in the same table renders the raw status "processed", so the filter chip and the row badge use different words for the same state. In `EventsBulkRetryBar.tsx:33-35`, the button that clears the *selection* reuses `labels.eventsPage.clearFilters`.
- **Root cause**: Missing dedicated i18n keys for the events page's status vocabulary; nearby keys from other pages were borrowed and one string was left hardcoded.
- **Impact**: Non-English locales show a mixed-language toolbar; users see "Completed" in the filter but "processed" on rows (is that the same state?), and the bulk bar's "Clear filters" button actually clears the selection — a mislabeled destructive-ish action.
- **Fix sketch**: Add `eventsPage.statusPending`, `eventsPage.statusProcessed`, `eventsPage.deadLetter`, and `eventsPage.clearSelection` keys to all locale files; use them here and align wording with what `StatusBadge` displays.
