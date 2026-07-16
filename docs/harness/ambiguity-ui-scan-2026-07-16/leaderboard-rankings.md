# Leaderboard & Rankings — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 2, Low: 1)

## 1. Demo-mode flip mid-session leaves stale real data on screen
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: stale-state-on-mode-transition
- **File**: `src/app/dashboard/leaderboard/useLeaderboardData.ts:40`
- **Scenario**: A user starts in real/supabase mode (leaderboard fetched), then `authStore.isDemo` flips to `true` (logout into demo, session expiry, demo toggle). The effect early-returns on `if (useMock) return;` and nothing re-seeds `personas`.
- **Root cause**: The mock fixture is only seeded in the `useState` initializer, which runs once. The comment asserts "Mock/demo mode is decided once per session" but nothing enforces that assumption — `isDemo` is a live store subscription that can change, and the effect lists `useMock` as a dependency yet handles only the `false` branch.
- **Impact**: In demo mode after a real session, the page keeps showing the previous account's real leaderboard (data leak across the auth boundary) or an empty list if the fetch never completed — both silently, with `loading: false` and no error.
- **Fix sketch**: In the effect, handle the mock branch explicitly: `if (useMock) { setPersonas(MOCK_LEADERBOARD); setError(null); setLoading(false); return; }`. Alternatively, if the once-per-session invariant is real, read `isDemo` once via `useAuthStore.getState()` in the initializer and drop it from the reactive path — but record which contract is intended.

## 2. Top-3 rank badge is an icon-only Medal — rank is invisible to assistive tech
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: a11y-icon-only-rank
- **File**: `src/app/dashboard/leaderboard/leaderboard-page/leaderboardStyles.tsx:67`
- **Scenario**: For ranks 1–3 the badge renders `<Medal />` (lucide icons are `aria-hidden` by default) instead of the number, inside a plain `<span>` with no accessible name. A screen-reader user tabbing through the row buttons hears the name/score/delta but never the rank — and cannot distinguish 1st from 3rd, since all three medals are identical glyphs differing only by color.
- **Root cause**: The visual medal treatment replaced the text content without providing an equivalent accessible label; color is the only 1-vs-2-vs-3 differentiator even for sighted users.
- **Impact**: The core datum of a leaderboard (position) is missing for AT users on exactly the rows that matter most; WCAG 1.1.1/1.4.1 failure.
- **Fix sketch**: Give the span `role="img"` + `aria-label={`#${rank}`}` (or add a visually-hidden `<span className="sr-only">{rank}</span>`), and consider rendering the numeral alongside/inside the medal badge so 1/2/3 are distinguishable without color.

## 3. `compareId` compare-highlight is built but unreachable dead code
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: built-but-unwired-prop
- **File**: `src/app/dashboard/leaderboard/leaderboard-page/LeaderboardTable.tsx:22`
- **Scenario**: `LeaderboardTable` accepts `compareId = ""` and styles a second, amber-tinted "compare" row (`isCompare` branch, line 76 and 88). The only call site (`page.tsx:105`) never passes `compareId`, so the amber state can never render.
- **Root cause**: A comparison feature was either half-built or half-removed — the page-level radar already does an implicit compare against `personas[0]` (the benchmark), but the table's compare affordance was never wired to it, and no comment records which direction was intended.
- **Impact**: Dead styling path ships to users' bundles, misleads maintainers into thinking two-agent comparison works, and the radar's benchmark row gets no visual echo in the table (the actual UX gap: users can't see which table row is the dashed overlay).
- **Fix sketch**: Either wire it — pass `compareId={isComparing ? benchmark.id : ""}` from `page.tsx` so the benchmark row is amber-highlighted, matching the radar overlay — or delete the prop and the `isCompare` branch. Wiring it is one line and closes a real legibility gap; record the decision either way.

## 4. Sort state is invisible to assistive technology
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: a11y-sort-state-not-announced
- **File**: `src/app/dashboard/leaderboard/leaderboard-page/LeaderboardSortHeader.tsx:30`
- **Scenario**: A screen-reader user activates a sort header. The `aria-label` ("Sort by {field}") is static — it never reflects whether the column is active or which direction it's sorted; the chevron pair is purely visual. The surrounding layout is a CSS grid of `<span>`s and `<button>`s, so `aria-sort` has no columnheader to live on either.
- **Root cause**: The header mirrors KnowledgeSortHeader's visual shape but neither component exposes state; the table-as-grid markup forfeits native table/columnheader semantics that would carry `aria-sort`.
- **Impact**: Non-visual users can trigger sorting but get zero feedback about the current order — they must infer it from row content, and toggling asc/desc is guesswork.
- **Fix sketch**: Minimal: bake state into the label (`aria-label={`Sort by ${label}${isActive ? `, sorted ${sortDir === "asc" ? "ascending" : "descending"}` : ""}`}`) or add an `aria-live` polite announcement on change. Better: mark the header row `role="row"` with `role="columnheader"` wrappers carrying `aria-sort`, keeping the existing grid CSS.

## 5. No empty state when the leaderboard loads zero personas (e.g. after a fetch error)
- **Severity**: Low
- **Agent**: ui_perfectionist
- **Category**: missing-empty-state
- **File**: `src/app/dashboard/leaderboard/page.tsx:96`
- **Scenario**: Real-mode fetch fails (or returns `[]`): `loading` is false, `personas` is `[]`. The page renders the full non-loading layout — dimension tabs, an empty podium, a table showing only header labels with zero rows, and a radar card framing an empty 300px chart — beneath the error banner.
- **Root cause**: The render branches only on `loading`; there is no `personas.length === 0` branch, and each child component happy-paths a non-empty array (`benchmark = personas[0]`, `top = …slice(0, 3)`).
- **Impact**: A hollow, broken-looking dashboard shell; with no error (legit empty aggregate) there is no message at all explaining why the leaderboard is blank.
- **Fix sketch**: Add an explicit empty branch after `loading` (e.g. a centered card with "No agents ranked yet" + the retry action when `error` is set), and skip rendering the podium/table/radar grid when `personas.length === 0`.
