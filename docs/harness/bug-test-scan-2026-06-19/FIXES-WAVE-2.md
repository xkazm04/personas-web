# Fix Wave 2 — Success-Theater & State Corruption

> 6 commits, 6 findings closed (6 High).
> Baseline preserved: tsc 0 → 0; eslint 0 errors on changed files (2 pre-existing/incidental `max-tsx-lines` warnings, non-blocking). No unit runner; e2e needs a live server (not run, same as baseline).
> Branch: `vibeman/bug-test-fixes-2026-06-19`. Pre-existing uncommitted changes left untouched.

## Commits

| # | Commit | Finding | Severity | Files |
|---|---|---|---|---|
| 1 | `f2fc0a5` | knowledge #1 — reject resolved identically to accept | High | `MemoriesView.tsx` |
| 2 | `8488e8c` | messages #2 — "Previous" dead-clicks after list shrinks | High | `messages/page.tsx` |
| 3 | `a89e7bf` | voting #1 — boost total inflates on re-boost | High | `feature-voting/index.tsx` |
| 4 | `827736d` | reviews #3 — pendingReviewCount double-count drift | High | `useReviewBulkActions.ts` |
| 5 | `023bff0` | reviews #2 — single-key a/r bypasses bulk-undo guard | High | `useReviewKeyboardShortcuts.ts`, `ReviewsSplitPane.tsx` |
| 6 | `109f999` | messages #1 — settings toggles never persist | High | `settingsStore.ts` (new), `NotificationsCard.tsx`, `ModelProvidersCard.tsx` |

## What was fixed

1. **Knowledge reject≠accept.** `handleApply` cleared the conflict for every decided id regardless of value, so a "reject" discarded the operator's choice and showed a still-conflicting memory as resolved. Now only `"accept"` clears the conflict.
2. **Messages pagination.** `clampedPage` was a render-only clamp while `page` drifted past `totalPages-1`; nav handlers incremented the stale `page`, so the first "Previous" click after a list shrink dead-clicked. Handlers now derive from `clampedPage`.
3. **Boost re-boost drift.** Optimistic `+= weight` disagreed with the server's one-row-per-voter upsert (re-boost *replaces* the tier), so totals inflated and persisted until reload. Added a per-feature in-flight guard and a best-effort reconcile from `fetchBoostTotals()` on success (refetch failure does not roll back a succeeded boost).
4. **Review pending-count drift.** Three optimistic mutation sites recomputed `pendingReviewCount` from the stale pre-map array + an id union, so the badge/tab drifted until a poll healed it. All three now derive the count from the freshly-mapped `reviews` array.
5. **Review keyboard guard.** Single-item `a`/`r` resolved immediately with no awareness of the bulk-undo window, double-committing a row that was also in the deferred batch (and leaving it un-undoable). Plumbed a `resolveLocked` flag into the shortcuts hook. Focus-flow needs no mirror (no bulk hook there).
6. **Settings persistence.** Severity/digest/provider toggles were component-local `useState` seeded from `MOCK_*` and reverted on every mount, while the adjacent voice toggle persisted. Added a localStorage-hydrated `settingsStore` (mirroring `reviewVoiceStore`) and wired both cards.

## Verification

| Gate | Before | After |
|---|---|---|
| `tsc --noEmit` | 0 | 0 |
| ESLint (changed files) | n/a | 0 errors (2 non-blocking max-tsx-lines warns) |
| Unit tests | none | none (no runner) |
| Playwright e2e | needs live server | needs live server (not run) |

## Deferred to Wave 4 (animation/realtime — need runtime verification, not tsc-verifiable)

- **timeline-race #1/#2 — "Pause" doesn't actually pause + scenario-select shows contradictory "Paused" state.** A coupled rework of the `paused`/`isPlaying`/result-timer state machine in `agents-timeline/index.tsx`; behavior can't be confirmed by tsc, so grouped with the lifecycle wave where the app should be run.
- **dashboard-shell #1 — connection-status dot blind to the real Supabase transport** (`useSyncedRealtime` never writes `eventStore.connectionStatus`). Needs a `channel.subscribe` status callback; grouped with the realtime/lifecycle wave.

## Cumulative status (after Wave 2)

| Wave | Theme | Closed |
|---|---|---|
| 1 | Data correctness & durability | 6 (2C/3H/1M) |
| 2 | Success-theater & state corruption | 6 (6H) |
| **Total** | | **12 (2C/9H/1M)** |

Remaining per INDEX: theme E (security/trust-boundary), F (lifecycle/leaks — incl. the 2 deferred above), G (time/numeric), I (consent), J (dead-code), then the dedicated **test-infra** wave (vitest).
