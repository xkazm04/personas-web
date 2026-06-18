# Messages & Settings — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 2, Low: 0)

Scope: 10 named files + supporting reads (`MessageRow.tsx`, `lib/format.ts`,
`lib/mock-dashboard-data.ts`, `lib/supabaseApi.ts:getSyncedMessageThreads`,
`stores/reviewVoiceStore.ts`). Test runner is **Playwright e2e only**; the
existing `e2e/` suite covers marketing pages exclusively — there is **zero**
spec touching `/dashboard/messages` or `/dashboard/settings`, and no unit
harness exists for the pure pagination/override math in `page.tsx`.

---

## 1. Settings toggles silently never persist — yet are presented as real preferences
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: Settings persistence / silent data loss (UX gaslighting)
- **File**: src/app/dashboard/settings/settings-sections/NotificationsCard.tsx:20-21,69,74; src/app/dashboard/settings/settings-sections/ModelProvidersCard.tsx:18-20,47
- **Scenario**: User opens Settings, turns on "Medium"/"Low" healing alerts, disables the weekly digest, and flips a BYOM model provider (e.g. denies a provider). They navigate to `/dashboard/messages` and back, or refresh. Every toggle has snapped back to its hardcoded default. The "voice announcement" toggle right next to them (`reviewVoiceStore`, localStorage-backed) *does* survive a reload — so the UI is inconsistent: visually identical `SettingToggle`s, half durable, half ephemeral.
- **Root cause**: Severity/digest/provider state lives in component-local `useState` (`sev`, `digest`, `allowed`) seeded from `MOCK_*` constants. There is no write-back to localStorage, store, or API — the JSDoc admits "demo-only local state," but the rendered card gives no signal that the BYOM denial or alert opt-out is non-durable. A provider toggled OFF (a security-relevant policy in the card's framing) reverts on next mount.
- **Impact**: UX degradation / false sense of control; in the BYOM-provider case the user believes they restricted which model providers the fleet may use, but the restriction evaporates on navigation.
- **Fix sketch**: Either persist like `reviewVoiceStore` (localStorage-hydrated zustand store keyed per setting) and call it on `onChange`, or render an explicit "preview only — not saved" affordance so the toggle isn't mistaken for a durable preference.

## 2. "Previous" pagination button dead-clicks after the page list shrinks (page≠clampedPage divergence)
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: Pagination off-by-one / stale derived state
- **File**: src/app/dashboard/messages/page.tsx:79-83,205-210
- **Scenario**: User is on page 3 of threads (`page=2`). They click "Mark all read" or switch the threads/list filter and the dataset shrinks so `totalPages=2`. `clampedPage=min(2,1)=1`, so page 2 renders correctly. But `page` state is still `2` and is never written back to `clampedPage`. The user clicks "Previous" (enabled, since `isFirstPage=clampedPage===0` is false): `onPrevious` runs `setPage(v => Math.max(0, v-1))` against the stale `v=2`, giving `page=1` → `clampedPage=min(1,1)=1` → **the same page 2 re-renders**. The button does nothing; a second click is needed.
- **Root cause**: `clampedPage` is a render-only clamp; the source-of-truth `page` is allowed to drift past `totalPages-1`, and both nav handlers (`onPrevious`/`onNext`) mutate `page` rather than `clampedPage`. The clamp masks the drift only for rendering, not for the increment arithmetic.
- **Impact**: UX degradation — dead-click pagination after any operation that reduces item count (mark-all-read collapsing a view, filter switch, retry returning fewer threads).
- **Fix sketch**: Either drive the handlers off `clampedPage` (`setPage(Math.max(0, clampedPage - 1))`), or add an effect `if (page !== clampedPage) setPage(clampedPage)` to keep state and clamp in sync.

## 3. Business-critical message paths have zero test coverage; override/pagination math is an untested pure reducer
- **Severity**: High
- **Lens**: test-mastery
- **Category**: Risk-weighted coverage gap (no harness on critical path)
- **File**: src/app/dashboard/messages/page.tsx:44-89 (overrides merge, unreadCount, sort, pagination slice)
- **Scenario**: The `threads`/`flatMessages` memos and the `markThreadRead`/`markAllRead` reducers encode the core invariants of the feature — overrides override base status, `unreadCount` = count of `status==="unread"` across parent+replies, threads sort newest-first by `latestTimestamp`, page slice is `[start, start+PAGE_SIZE)`. None of it is exercised: e2e covers only marketing pages, and there is no unit runner at all. A regression (e.g. an off-by-one in the slice, or `markAllRead` missing replies) ships silently.
- **Root cause**: The high-value logic is inlined in a `"use client"` component as `useMemo`/closures, not extracted into pure functions, so it is neither unit-testable nor e2e-asserted. No quality gate guards it.
- **Impact**: False confidence / unguarded regressions on the dashboard's primary read/triage path (unread badge counts, mark-read correctness, pagination boundaries).
- **Fix sketch**: Extract `applyOverrides(threads, overrides)`, `flatten(threads)`, and `paginate(items, page, size)` into a pure module and either add a minimal unit runner (vitest) for them, or add a Playwright dashboard spec (demo mode) asserting unread count drops to 0 after "Mark all read" and that page N shows the expected slice.

## 4. `useMessagesData` ignores a real→demo auth flip and never loads mock threads
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: Stale initial state / effect early-return
- **File**: src/app/dashboard/messages/useMessagesData.ts:24-57
- **Scenario**: A signed-in (non-demo) user is viewing messages with synced threads loaded, then signs out / drops into demo mode while the component stays mounted (auth store flips `isDemo`→true). `useMock` becomes true, the effect's guard `if (useMock) return` short-circuits, and `threads` retains the *previous real* data (or `[]` if the real fetch had failed) — `MOCK_MESSAGE_THREADS` is only read in the one-time `useState` initializer (line 27-29), which already ran with the old `isDemo`. The demo fixtures never appear.
- **Root cause**: Mock data is wired through lazy `useState` init (runs once) while live data flows through the effect; the demo branch has no effect path to repopulate `threads` when `useMock` becomes true post-mount. `loading` is likewise frozen at its initial value for the demo direction.
- **Impact**: UX degradation — empty or stale message list after an in-session auth transition into demo mode; inconsistent with the supabase→ direction which does refetch.
- **Fix sketch**: In the effect, handle the demo branch explicitly: `if (useMock) { setThreads(MOCK_MESSAGE_THREADS); setLoading(false); setError(null); return; }` so a flip into demo mode repopulates fixtures.
> Note: relevant because `useAuthStore` exposes `isDemo` as mutable in-session state (sign-out path); if auth can only ever resolve once at mount in practice this drops to Low.

## 5. `relativeTime` future-skew + non-finite branches power every thread/message timestamp but are untested
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: Coverage gap on a pure formatter with branchy edge cases
- **File**: src/lib/format.ts:31-73 (consumed by ThreadRow.tsx:60, MessageRow.tsx:53, ThreadDetailModal.tsx:38,91)
- **Scenario**: Every timestamp in the messages UI flows through `relativeTime`, which has non-obvious branches: invalid ISO → `"-"`, future timestamp beyond 60s tolerance → UTC absolute date + one-shot Sentry breadcrumb (guarded by a module-level `skewBreadcrumbReported` flag — only-once-per-process semantics that are easy to regress), sub-60s → `"just now"`, and minute/hour/day rollovers. A change to the tolerance constant or the `Number.isFinite` guard would silently corrupt every row's relative time with no failing test.
- **Root cause**: Pure, deterministic (with injectable `Date.now`) helper with five output branches and a stateful breadcrumb flag, but no unit harness exists and e2e never renders the dashboard.
- **Impact**: False confidence — a regression in the most-rendered formatter on this surface ships unguarded; the once-per-session breadcrumb invariant in particular is fragile and unasserted.
- **Fix sketch**: Add unit tests (needs a vitest harness) covering: invalid input→`"-"`, `Date.now()` mock at boundaries (59s→"just now", 60s→"1m ago", 59m/60m, 23h/24h), future-skew→UTC date string, and that the breadcrumb fires at most once.
