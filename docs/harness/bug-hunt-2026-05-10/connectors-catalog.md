# Bug Hunter — Connectors Catalog

> Total: 7 findings (Critical: 0, High: 3, Medium: 3, Low: 1)
> Scope: 14 files
> Date: 2026-05-10

## 1. Body scroll unlocks before modal exit animation completes

- **Severity**: High
- **Category**: Silent failure / scroll-lock leak
- **File**: `src/components/sections/connector-modal/index.tsx:41-47`
- **Scenario**: User opens any connector modal, then clicks the backdrop or presses ESC. `connector` flips from `Connector` → `null` and the React effect cleanup synchronously calls `unlockBodyScroll()`. However, `AnimatePresence` keeps the modal mounted for ~250ms (`exit` transition with `duration: 0.25`). During those 250ms, the modal is still visually covering the screen but `document.body.style.overflow` is already restored to its previous value, so the page scrolls behind the modal if the user happens to be scrolling/wheeling at close time. On touchpads with momentum scroll, the page noticeably jumps.
- **Root cause**: The lock effect is keyed on the *boolean truthiness* of `connector`, not on the modal’s actual visible/mounted state under `AnimatePresence`. There is no signal from Framer Motion's exit animation back into the lock owner.
- **Impact**: Visible page-position jumps when closing the modal; under-modal content (catalog grid) can be wheel-scrolled while the dimmed overlay is still visible. Worse on long pages.
- **Fix sketch**: Move the lock/unlock into framer-motion's animation lifecycle: `lockBodyScroll()` on entry and `unlockBodyScroll()` inside `onExitComplete` of `AnimatePresence` (or use a wrapper component whose unmount happens after exit). Alternatively, defer `unlockBodyScroll()` with `setTimeout(.., 260)` matching the exit duration.

## 2. URL hash navigation never resyncs state when the URL is changed externally

- **Severity**: High
- **Category**: Race condition / state desync
- **File**: `src/app/connections/page.tsx:21-41`
- **Scenario**: The page uses `useState(() => searchParams.get(...))` initializers to restore `activeCategory`, `search`, and `selectedConnector` from the URL on mount, then writes back via `window.history.replaceState`. If the URL ever changes again (e.g., another component calls `router.replace`, the user edits the URL bar without a full reload using soft navigation, browser autofill / restore tab, or a future shared link click on the same page), `useSearchParams` will return new values but the local state has already been initialized and is not driven by the hook. The displayed UI becomes desynced from the URL the user sees.
- **Root cause**: One-shot initializer + raw `window.history.replaceState` instead of `router.replace(..., { scroll: false })`. There is no `useEffect` watching `searchParams` to reconcile changes back into state.
- **Impact**: Shared/back-restored URLs that change after mount will not open the right connector, set the right category, or apply the right search. Bookmarklets and external category-deeplink CTAs will silently no-op if state was already seeded.
- **Fix sketch**: Either drive state purely from `useSearchParams` (read on every render) and use `router.replace` to mutate, or add a `useEffect([searchParams])` that reconciles the three values back into state when they differ.

## 3. Modal Tab focus escapes to underlying catalog (no focus trap)

- **Severity**: High
- **Category**: A11y / focus management
- **File**: `src/components/sections/connector-modal/index.tsx:49-101`
- **Scenario**: Open a connector modal with the keyboard (Enter on a card). The modal's first focusable element is *not* auto-focused, the trigger card retains focus behind the dimmed overlay. Tabbing from there moves focus into the underlying catalog cards/sidebar buttons that are visually obscured but still in the tab order. Screen readers will read background content while the modal is presented.
- **Root cause**: No `role="dialog"` / `aria-modal="true"` on the modal container, no initial focus assignment, no focus trap, no `inert` / `aria-hidden` on the rest of the page while the modal is open.
- **Impact**: WCAG 2.1.2/2.4.3 violation; keyboard and screen-reader users cannot reliably operate the modal and may interact with hidden actions (e.g., trigger another card open, mutating `selectedConnector` while a modal is already showing — see #4).
- **Fix sketch**: Add `role="dialog"` + `aria-modal="true"` + `aria-labelledby` to the content wrapper, focus the close button (or the first heading) on open via a ref, and apply `inert` to siblings (`<Navbar/>`, `<PageShell/>`, `<Footer/>`) while `connector !== null`. A small custom focus-trap on Tab/Shift-Tab within the dialog completes the fix.

## 4. Rapid connector switching can drop the simulator-reset for a short window

- **Severity**: Medium
- **Category**: Race condition / latent state leak
- **File**: `src/components/sections/connector-modal/index.tsx:19-27` and `components/TerminalSimulator.tsx:32-45`
- **Scenario**: While modal is open showing connector A with simulator running, the parent re-renders with a *new* `connector` ref pointing to B (e.g., a deep-link change, navigation, or — with #2 fixed — clicking another card without closing). The modal does the React 19 prev-state pattern at lines 23–27: `setShowSimulator(false)` + `setSimKey(k+1)`. This is correct, BUT for the brief render where `prevConnector` has just been set inline and the new render is still emitting the old `<TerminalSimulator key={\`terminal-${simKey}\`} ... />` (because state updates from the inline setters are batched into the *next* render), there is a one-frame window where the old simulator is still mounted with the new connector. Its `useEffect([connector])` cleanup fires and a new batch of timers is queued, but the previous `lines` state is still in the DOM.
- **Root cause**: Mixing the inline-prev-state-update pattern (which schedules a rerender) with `key`-based remounts (which only take effect on the *next* render after the state commits) means there is exactly one in-between render where the old subtree shows new-connector data.
- **Impact**: A brief flash of stale terminal output for connector A under connector B's header, plus a wasted set of timers (CPU + state updates after intended exit).
- **Fix sketch**: Inside `TerminalSimulator`, also reset `setLines([])` and `setDone(false)` at the top of the `useEffect([connector])` so the local state is cleansed even when remount is delayed by one render. Belt-and-suspenders against the simKey-based remount.

## 5. Unknown `?category=` value silently shows an empty grid with no recovery affordance

- **Severity**: Medium
- **Category**: Edge case / silent failure
- **File**: `src/app/connections/page.tsx:21-23` + `src/components/sections/connections-catalog/index.tsx:39-50`
- **Scenario**: Visit `/connections?category=foo`. `activeCategory` becomes `"foo"`. The `filteredConnectors` filter rejects every connector. The grid renders the "No services found. Try a different search." empty state, but `search` is empty so the "Clear filters" button (which only renders when `search` is non-empty — see `CatalogFilters.tsx:84`) is not shown. The desktop sidebar highlights nothing, the mobile pill row also highlights nothing because no `cat.key` matches `"foo"`. The user has to know to click "All" to escape — there is no visible "your filter is invalid" message.
- **Root cause**: The "Clear filters" affordance is gated only on `search`, not on `activeCategory !== "all"`. No validation of the URL value against `categories`.
- **Impact**: Bad/old/broken inbound links produce a dead-end UX with zero copy explaining why. Confirmed reproducible by editing the URL bar.
- **Fix sketch**: In `connections/page.tsx`, validate `searchParams.get("category")` against `categories.map(c => c.key)` (and `"all"`) before seeding state, defaulting to `"all"` otherwise. Additionally, in `CatalogFilters.tsx:77-95`, render the "Clear filters" button when `activeCategory !== "all" || search !== ""` (currently `search &&`).

## 6. Connector lookup by `?connector=` is case-sensitive and uncoded; an empty string is treated as a hit attempt

- **Severity**: Medium
- **Category**: Edge case / latent failure
- **File**: `src/app/connections/page.tsx:27-32`
- **Scenario**: Three sub-issues from `connectors.find((c) => c.name === name)`:
  1. `?connector=Slack` (capital S) → `find` returns `undefined`, modal is not opened, but URL keeps `?connector=Slack`. The next state-write effect (line 34-41) re-encodes — but because `selectedConnector` is `null`, the `connector` query is dropped. Net effect: silent param swallow with no user feedback.
  2. `?connector=` (empty value) → `name === ""` is truthy after the `?` checks but `searchParams.get("connector")` returns `""` which is falsy in `name ? ... : null`, so it lands as `null`. OK. But `?connector=%20` (whitespace) is truthy and falls through to `find`, returning `undefined`, same silent drop.
  3. The lookup is `O(n)` per render-init only, so perf is fine, but there's no `Map<name, Connector>` cache for share-link click-rate-heavy paths.
- **Root cause**: No normalization (trim/lowercase) of the URL param before lookup; no telemetry / no fallback messaging.
- **Impact**: Marketing/SEO inbound links that get capitalized by external systems (e.g., URL shorteners that normalize) silently fail to open the intended connector modal. Users see the catalog with no indication a deep-link was intended.
- **Fix sketch**: Build a `Map<lowerName, Connector>` once at module scope; lookup uses `name.trim().toLowerCase()`. If lookup fails *and* the param was non-empty, surface a non-blocking toast or analytic event.

## 7. `lockCount` counter is process-global and can desync if a parent suspends the modal subtree

- **Severity**: Low
- **Category**: Latent failure / scroll-lock counter integrity
- **File**: `src/lib/bodyScrollLock.ts:9-29` (used by `connector-modal/index.tsx:41-47`)
- **Scenario**: The lock uses a module-level integer `lockCount`. The lock effect's cleanup runs on unmount/dep-change and decrements — under normal React 19 strict-mode dev, effects mount-clean-mount, which already double-locks then double-unlocks (net zero). But: if the modal is rendered inside a `<Suspense>` boundary that *suspends mid-effect* (e.g., the `<Navbar/>` later imports a chunk and the route re-suspends), React may discard the effect-cleanup pair. Also, an exception thrown synchronously in any sibling effect between `lockBodyScroll()` and the cleanup leaves `lockCount` permanently above 0, freezing the page scroll forever.
- **Root cause**: No `try/finally` around the lock; no recovery for orphan increments; no symmetric `inc/dec` per *owner* (e.g., a Symbol token returned from `lockBodyScroll`).
- **Impact**: Rare but unrecoverable: page becomes unscrollable until full reload. Hard to reproduce, easy to misdiagnose.
- **Fix sketch**: Switch the API to token-based: `const token = lockBodyScroll(); ... unlockBodyScroll(token);` where each token can only release once (Set-based). Add a dev-only assertion warning if `lockCount` exceeds, say, 3.
