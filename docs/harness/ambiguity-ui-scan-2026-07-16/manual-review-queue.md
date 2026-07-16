# Manual Review Queue — ambiguity+ui scan
> Total: 5 findings (Critical: 1, High: 3, Medium: 1, Low: 0)

## 1. Unmodified-key shortcuts hijack browser chords — Ctrl+R rejects a review instead of reloading
- **Severity**: Critical
- **Agent**: ui_perfectionist
- **Category**: keyboard-shortcut-modifier-guard
- **File**: `src/app/dashboard/reviews/reviews-split-pane/useReviewKeyboardShortcuts.ts:42`
- **Scenario**: Operator has a pending review selected in split-pane (one is auto-selected whenever the list is non-empty) and presses Ctrl+R / Cmd+R to reload the page, or Ctrl+A to select text. `e.key` is still `"r"` / `"a"` when a modifier is held; neither this hook nor the focus-flow handler (`ReviewsFocusFlow.tsx:78-87`) checks `e.ctrlKey/metaKey/altKey`.
- **Root cause**: Both keydown handlers branch on `e.key` alone and call `e.preventDefault()`, so browser-level chords are swallowed and routed into destructive actions.
- **Impact**: A reload muscle-memory keystroke silently **rejects** the selected pending review — an irreversible audit decision (single-item resolve has no undo window) — while also blocking the reload. Ctrl+A approves instead of selecting text. Same failure in focus-flow mode.
- **Fix sketch**: First line of both handlers: `if (e.ctrlKey || e.metaKey || e.altKey) return;` (also consider `(e.target as HTMLElement).isContentEditable` alongside the existing INPUT/TEXTAREA/SELECT guard).

## 2. Focus-flow progress counter double-counts, then resets to 0 after every resolve
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: focus-flow-progress-reset
- **File**: `src/app/dashboard/reviews/ReviewsFocusFlow.tsx:35`
- **Scenario**: Operator approves item 1 of a 3-item focus queue. Header first shows "2 of 4" (`total = pendingAll.length + processedCount` still counts the just-resolved item as pending until the async store update lands), then when `resolveReview`'s PATCH completes, `pendingAll` changes, `nextKey !== prevPendingKey` fires, and the render-time reset sets `processedCount = 0` and rebuilds the queue — the header snaps to "1 of 2".
- **Root cause**: The key-diff reset (lines 35-40) was written for *external* changes to the pending set (polling, another tab), but the operator's own resolve also mutates the pending set, so it indistinguishably nukes local progress. The assumption "pending-set change ⇒ external refresh" is undocumented and wrong for the primary interaction path. The double-count window exists because `advance()` increments `processedCount` synchronously while the store update is awaited.
- **Impact**: The core focus-mode affordance — "n of total" progress with a fill bar — never advances past the first position; every resolve visibly renumbers/shrinks the session. Undermines trust in what got processed.
- **Fix sketch**: Reset only on genuinely external changes: track resolved-by-me ids in a ref, and compute the diff key from `pendingAll` minus locally-resolved ids; or snapshot the queue once on mount and only append genuinely new pending ids (never resetting `processedCount`). Compute `total` as `queue.length + processedCount` so it can't double-count.

## 3. Single-item resolve: dead loading state, no error feedback, and keyboard resolve drops typed notes
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: resolve-error-path-untreated
- **File**: `src/app/dashboard/reviews/reviews-split-pane/ReviewDetailPanel.tsx:56`
- **Scenario**: (a) Operator clicks Approve — `handleResolve` sets `resolving`, calls `onResolve` which is fire-and-forget (`void resolveReview(...)` in `ReviewsSplitPane.tsx:81`), and the `finally` runs synchronously, so the spinner never renders and both buttons re-enable while the PATCH is still in flight (double-click ⇒ double PATCH). (b) The PATCH fails — rejection is unhandled: no toast, no retry, the row silently stays pending. (c) Operator types reviewer notes, clicks outside the textarea, presses `A` — the keyboard path (`useReviewKeyboardShortcuts.ts:41`) calls `resolveReview(id, "approved")` with **no notes**, silently discarding what was typed.
- **Root cause**: The `onResolve` contract is ambiguous — typed `(id, status, notes?) => void` but treated as awaitable by the try/finally; nobody owns the failure path (bulk actions got per-id failure tracking + retry, single resolve got nothing); the keyboard shortcut was wired to the store action, not to the panel's notes state.
- **Impact**: Loading/disabled affordances are decorative; a failed resolve looks identical to a slow one until the next 15s poll "un-resolves" the row with no explanation; conscientious operators lose annotations exactly when they use the power-user path.
- **Fix sketch**: Make `onResolve` return the promise and await it (`await resolveReview(...)`) so `resolving` is real; add a `.catch` surfacing a toast (reuse `BulkResultToast` styling) and keep the row pending; pass the current notes into the keyboard resolve (lift notes state or expose it via a ref that the shortcut hook reads).

## 4. Shortcuts HUD is fully built but mounted nowhere — the advertised "?" shortcut does not exist
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: built-but-unwired-shortcuts-hud
- **File**: `src/app/dashboard/reviews/ShortcutsHud.tsx:20`
- **Scenario**: Grep across `src/` shows `ShortcutsFooter` and `ShortcutsOverlay` have zero consumers — `page.tsx`, `ReviewsSplitPane.tsx`, and `ReviewsFocusFlow.tsx` never render them. `shortcutTypes.ts:14` advertises `?` → "Show all shortcuts", but no keydown handler in either mode listens for `?`.
- **Root cause**: A complete discoverability subsystem (footer chips, searchable focus-trapped overlay dialog, platform-mod detection — 5 files) was built and then never wired into the page that owns the shortcuts it documents.
- **Impact**: J/K/A/R/S/Esc are invisible unless the operator stumbles on the `<kbd>` hints in the empty detail panel; the `?` help affordance — the standard escape hatch — is a no-op; ~250 lines of polished UI ship as dead code. Given finding #1, undiscoverable destructive shortcuts are worse than none.
- **Fix sketch**: Render `<ShortcutsFooter onOpenAll={...}>` + `<ShortcutsOverlay>` in `ReviewsSplitPane` (below the pane) and add `e.key === "?"` handling in `useReviewKeyboardShortcuts`; extend `REVIEW_SHORTCUTS` with the missing S (skip, focus mode), Esc, and shift-click entries — or delete the HUD if the product decision is not to ship it.

## 5. ReviewRow is a clickable div with no keyboard or ARIA semantics
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: review-row-a11y-semantics
- **File**: `src/app/dashboard/reviews/reviews-split-pane/ReviewRow.tsx:25`
- **Scenario**: A keyboard or screen-reader user tabs through the review list: each row is a plain `div` with `onClick` — no `role`, no `tabIndex`, no Enter/Space handling — so rows are unreachable and unannounced (the inner select-checkbox button is the only focusable element, and it exists only for pending rows). Row selection depends entirely on the undocumented J/K shortcuts (see #4), and shift-click range selection has no keyboard equivalent at all.
- **Root cause**: Interactive semantics were put on the wrapper `div` instead of a native `button`/`role="option"`, and the list container lacks `role="listbox"`/`aria-activedescendant` to expose the active row.
- **Impact**: Core navigation of the queue fails WCAG 2.1.1 (keyboard) and 4.1.2 (name/role/value); severity dots and status dots convey state by color alone to sighted users while AT users get nothing.
- **Fix sketch**: Make the row a `<div role="option" aria-selected={isActive} tabIndex={isActive ? 0 : -1}>` inside a `role="listbox"` container with Enter/Space activating `onClick` (roving tabindex pairs naturally with the existing J/K), and give the row an `aria-label` composing persona, severity, status, and age.
