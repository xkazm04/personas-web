# Shared Types, Utilities & Hooks — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 1, Medium: 3, Low: 1)

## 1. `useParsedSearchParamState` drops the re-sync behavior its docstring promises
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: doc-behavior-mismatch
- **File**: `src/hooks/useSearchParamState.ts:35`
- **Scenario**: `src/app/connections/page.tsx` uses `useParsedSearchParamState` for `selectedConnector`. User is on /connections, clicks a shared deep link to `/connections?connector=slack` (or uses back/forward navigation) while the page is already mounted.
- **Root cause**: The JSDoc says "Same as useSearchParamState, with a custom parse", but the parsed variant only reads `searchParams` in the `useState` initializer — it has no equivalent of the sibling's `useEffect` that re-seeds state when the param changes underneath it (`useSearchParamState.ts:23-29`). The entire point of the base hook (per its own docstring, lines 7-13) is that re-sync.
- **Impact**: Back/forward navigation and in-app deep links silently do nothing for any state managed by the parsed variant — the URL says one connector, the UI shows another. Divergent behavior between two hooks documented as identical is also a trap for the next caller.
- **Fix sketch**: Mirror the base hook: keep a `lastRawRef` of the raw param, add a `useEffect([searchParams, key])` that compares `searchParams.get(key)` to the ref and calls `setValue(parse(raw))` on genuine external change. Keep `parse` in a ref (or require it stable) to avoid re-parsing on every render.

## 2. `useFocusTrap` listens on the container, so the trap silently disengages once focus escapes
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: focus-trap-escape
- **File**: `src/hooks/useFocusTrap.ts:86`
- **Scenario**: Focus leaves the dialog panel — the focused button is removed/disabled after an async action (focus falls to `document.body`), or a screen-reader user relocates focus programmatically. The user then presses Tab.
- **Root cause**: The `keydown` handler is attached to `container`, but keyboard events dispatch on the *currently focused element* and bubble up from there. Once `document.activeElement` is outside the container, Tab events never reach the container's listener, so the carefully written `!node.contains(activeEl)` recovery branches (lines 76, 80) are unreachable in exactly the case they were written for.
- **Impact**: Keyboard users can Tab into the obscured page behind the modal — the a11y guarantee the hook exists to provide (and documents at lines 33-38) fails in its hardest case. WCAG 2.1.2/2.4.3 exposure for ConfirmDialog and BatchReviewModal.
- **Fix sketch**: Attach the listener to `document` (remove on cleanup). The existing `node.contains(activeEl)` checks already make it a no-op when focus is legitimately elsewhere and correctly pull focus back when it escaped; alternatively pull focus back via a `focusin` listener on `document`.

## 3. Date formatters silently return "" for full ISO timestamps — the date-only contract is enforced but not stated
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: undocumented-input-contract
- **File**: `src/lib/format-date.ts:13`
- **Scenario**: A blog/changelog entry's `date` field is authored as `"2026-03-15T09:00:00Z"` (a perfectly valid ISO string, and the natural output of any CMS or `new Date().toISOString()`), then rendered via `formatDateShort`/`formatDateLong`.
- **Root cause**: Both functions unconditionally append `"T00:00:00Z"` (`iso + "T00:00:00Z"`), so anything other than a bare `YYYY-MM-DD` produces `"2026-03-15T09:00:00ZT00:00:00Z"` → `NaN` → `""`. The parameter is named `iso`, the doc says "parse the date as UTC midnight" but never states that *only* date-only strings are accepted, and the failure mode is a blank string in the UI rather than a loud error. Tests cover garbage input but not this near-miss shape.
- **Impact**: A content author writing a timestamp gets a card/article with the date silently missing — no build error, no console warning; easy to ship unnoticed.
- **Fix sketch**: Accept both shapes: `const d = new Date(/T/.test(iso) ? iso : iso + "T00:00:00Z")`; or validate with `/^\d{4}-\d{2}-\d{2}$/` and `console.warn` in dev on mismatch. Rename param to `isoDate` and state the contract in the JSDoc.

## 4. Half the `MatchType` values are silent no-ops in `highlightMatch`
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: dead-enum-branches
- **File**: `src/lib/highlight-match.tsx:76`
- **Scenario**: Guide search returns a result with `matchType: "exact-tag"`, `"fuzzy-tag"`, or `"description"`; `SearchResultsPopover.tsx:97-101` passes it straight to `highlightMatch` expecting the query to be marked.
- **Root cause**: The `MatchType` union (line 65) declares six values, but the function only highlights `exact-title`/`body` (exact) and `fuzzy-title` (fuzzy); the other three fall through `if (!isExact && !isFuzzy) return [text]` with no comment recording whether that's a design decision ("tag matches highlight the tag chip elsewhere, not the title") or an unfinished branch. Nothing distinguishes intentional from forgotten.
- **Impact**: Users searching by tag or description see result text with no visual indication of why it matched — inconsistent polish across match kinds — and the next maintainer can't tell if wiring `description` to `exactSegments` would be a fix or a regression.
- **Fix sketch**: Either handle the three types (`description` → exact substring like `body`; tag types presumably highlight nothing in the *title*, so keep returning `[text]`) or document the pass-through explicitly per value, e.g. an exhaustive `switch` with a comment on each no-op arm.

## 5. `lockBodyScroll` doesn't compensate for scrollbar width — visible layout jump on every modal open
- **Severity**: Low
- **Agent**: ui_perfectionist
- **Category**: scroll-lock-layout-shift
- **File**: `src/lib/bodyScrollLock.ts:37`
- **Scenario**: Desktop browser with a classic (non-overlay) scrollbar — Windows Chrome/Edge/Firefox, a large share of the marketing site's traffic — on any page tall enough to scroll. User opens a modal, drawer, or the mobile menu.
- **Root cause**: Setting `document.body.style.overflow = "hidden"` removes the vertical scrollbar (~15-17px), so the viewport widens and all centered content shifts right on lock and snaps back left on unlock. The module is otherwise carefully engineered (counting, HMR-safe globalThis state) but omits the standard compensation step.
- **Impact**: Every overlay open/close produces a horizontal content jolt behind the dialog — precisely the kind of polish defect a marketing site is judged on; also a CLS-adjacent visual glitch with fixed-position navbars.
- **Fix sketch**: On first lock, measure `window.innerWidth - document.documentElement.clientWidth` and, if > 0, set `document.body.style.paddingRight` to that value (capturing the previous padding alongside `previousOverflow`); restore both on final unlock.
