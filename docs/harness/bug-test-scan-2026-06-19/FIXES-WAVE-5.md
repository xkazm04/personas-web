# Fix Wave 5 — Lifecycle/Leaks + Time/Numeric

> 5 commits, 5 findings closed (4 High, 1 numeric-guard).
> Baseline preserved: tsc 0 → 0; vitest 36/36; eslint 0 errors (1 pre-existing, non-blocking warning). No new tests required (all changes are in modules tested indirectly or behaviorally; areaOverall/heatmap remain candidates for the test backlog).
> Branch: `vibeman/bug-test-fixes-2026-06-19`.

## Commits

| # | Commit | Finding | Severity | Files |
|---|---|---|---|---|
| 1 | `66598d0` | guided-tour #1 — AudioContext never closed | High | `useTourAudio.ts` |
| 2 | `6653189` | dashboard-shell #2 — error boundary never resets on nav | High | `DashboardErrorBoundary.tsx`, `dashboard/layout.tsx` |
| 3 | `141f47c` | dashboard-home #1 — heatmap DST desync | High | `useExecutionHeatmap.ts` |
| 4 | `57aaec0` | public-roadmap — areaOverall empty-set NaN | High (latent) | `roadmap/areas.ts` |
| 5 | `d6de2f7` | dashboard-shell #1 — connection dot blind to transport | High | `useSyncedRealtime.ts` |

## What was fixed

1. **AudioContext leak.** `useTourAudio` lazily created an `AudioContext` and only disconnected the per-clip source node; the context was never closed. Repeated tour runs exhausted Chromium's ~6-context cap, silently killing narration + the companion glow. Added a mount-once unmount cleanup that closes it.
2. **Error-boundary reset-on-route.** `DashboardErrorBoundary` wraps every dashboard page but reset only via the Retry button, so a crash on one route showed the fallback for ALL sibling routes until reload. Added a `resetKey` prop (the layout passes `pathname`); on change while errored it clears error + retry budget.
3. **Heatmap DST.** `deriveHeatmap` sliced the window into fixed 86.4M-ms days, but a calendar day is 23h/25h across DST — so runs plotted under the wrong weekday vs the calendar-day header. Now buckets by diffing two local midnights and rounding (absorbs the DST hour).
4. **areaOverall NaN.** `0/0` for an area with no bars rendered "NaN%" and broke the progressbar `aria-valuenow` / reveal clip-path. Guard returns 0 for empty bars.
5. **Connection-status truth.** `useSyncedRealtime`'s `channel.subscribe()` had no status callback, so `eventStore.connectionStatus` stayed at its "polling" default and the dot was decoration in supabase mode. Map the subscribe status (SUBSCRIBED/CHANNEL_ERROR/TIMED_OUT/CLOSED) → connected/reconnecting/polling and reset to polling on teardown.

## Verification

| Gate | Result |
|---|---|
| `tsc --noEmit` | 0 |
| `vitest run` | 36/36 (unchanged modules) |
| ESLint (changed files) | 0 errors (1 pre-existing multi-selector warn on useSyncedRealtime, not introduced here) |
| Playwright e2e | not run (needs live server) |

> Fixes 2 & 5 touch realtime/navigation behavior that benefits from a browser to fully confirm; the wiring is correct by construction (resetKey reset, subscribe-status mapping) and tsc/vitest are green.

## Deferred (with reasons)

- **timeline-race #1/#2 — "Pause" doesn't pause + scenario-select contradictory state.** A coupled rework of the `paused`/`isPlaying`/result-timer animation state machine; behavior can't be confirmed without running the demo. Highest-risk item; left for a runtime-verified session.
- **orchestration #1 / event-bus #3 — off-screen timer/particle suspension.** Animation-perf (Medium); needs visual verification of the scroll/visibility behavior.
- **dashboard-shell #3 — SSE stale "connected" after tab switch.** Interacts with the connection-status path just changed; needs a browser to verify the SSE+supabase interplay.
- **shared-types #5 — useSearchParamState read-once.** A shared hook whose back/forward re-sync semantics genuinely need browser testing (and it fights the consumer's writeback); deferred to avoid an unverified change to a high-blast-radius hook.
- **server rate-limit #4 — fixed-window 2× burst.** Out of this wave's theme (abuse, not lifecycle/numeric-display); documented Medium.

## Cumulative status (after Wave 5)

| Wave | Theme | Closed |
|---|---|---|
| 1 | Data correctness & durability | 6 (2C/3H/1M) |
| 2 | Success-theater & state corruption | 6 (6H) |
| 3 | Security & compliance | 6 (4H/2M) |
| 4 | Test infrastructure | runner + 36 tests + 2 fixes + 3 e2e |
| 5 | Lifecycle/leaks + time/numeric | 5 (5H) |
| **Total** | | **23 findings closed (2C/18H/3M) + the whole test-infra theme** |

Remaining: the deferred animation/realtime items above (timeline-pause, off-screen suspension, SSE stale, useSearchParamState), theme J (dead-code cleanup), and the Medium/Low tail.
