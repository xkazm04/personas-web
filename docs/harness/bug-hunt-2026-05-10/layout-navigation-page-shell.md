# Bug Hunter — Layout, Navigation & Page Shell

> Total: 7 findings (Critical: 0, High: 3, Medium: 3, Low: 1)
> Scope: 18 files (sampled from 28)
> Date: 2026-05-10

## 1. Body scroll-lock leaks across HMR / multiple panel mounts

- **Severity**: High
- **Category**: Latent failure / race condition
- **File**: `src/lib/bodyScrollLock.ts:9-29` (consumer: `src/components/navbar/useMobileMenu.ts:32-64`)
- **Scenario**: 
  1. User opens mobile menu while `open=true`. The cleanup of the body-lock effect calls `unlockBodyScroll()` on every dependency change (the `panelRef` identity in particular), but the mount only calls `lockBodyScroll()` once. If `panelRef` ever changes identity, the effect re-runs: it mounts again (lock +1) but the previous cleanup already ran (lock -1), drifting the counter. 
  2. More serious: during fast route changes, the route-change effect calls `setOpen(false)` via `queueMicrotask`. If a second panel/modal opens within the same microtask window, the cleanup of the first effect runs after the second `lockBodyScroll()`, so `lockCount` underflows on the next close path (guard `if (lockCount === 0) return;` masks it but `previousOverflow` was already restored — body is now unlocked even though another consumer believes it holds a lock).
  3. Next.js dev HMR remounts the hook; module-scoped `lockCount` and `previousOverflow` survive the remount, but the previous lock's cleanup never fired, leaving `overflow:hidden` permanently sticky.
- **Root cause**: Module-scope counters in `bodyScrollLock.ts` are not paired with a per-instance token. Cleanups can run out-of-order against locks from a different consumer; HMR survives the module but loses the React effect that would unlock it.
- **Impact**: Whole page is unscrollable until full reload, or, in the underflow case, the next modal that opens does not actually lock the body (background scrolls behind the dialog — accessibility regression for AT users).
- **Fix sketch**: Switch to a per-call token: `lockBodyScroll()` returns a unique symbol that must be passed to `unlockBodyScroll(token)`. Track active tokens in a `Set`. On HMR (`module.hot?.dispose`) clear the set and restore overflow.

## 2. Mobile menu focus trap silently breaks when the panel re-renders or routes change

- **Severity**: High
- **Category**: A11y / race condition
- **File**: `src/components/navbar/useMobileMenu.ts:67-91`
- **Scenario**: User opens the mobile menu via keyboard. The effect snapshots `document.activeElement` into `triggerRef`. They Tab into the panel, then click a link. The route changes; `pathname` effect schedules `setOpen(false)` via `queueMicrotask`. But the panel uses Framer's `AnimatePresence` with a 250ms exit, so the panel DOM is still mounted. During exit, the focus-restoration effect runs, sees `triggerRef.current` is still the old hamburger button (still in the DOM), and yanks focus back to it. If the user pressed Enter on a link that triggered SSR/Suspense, focus jumps from the activated link to the hamburger mid-transition — screen reader reads "Open menu" instead of the new page heading.
- **Root cause**: Focus restoration fires on `open` flipping to `false`, regardless of whether close was triggered by user dismiss vs route change. There is no distinction between "dialog closed deliberately" and "dialog auto-closed because navigation happened".
- **Impact**: Keyboard/SR users lose focus context on every link click in the mobile menu. WAI-ARIA Authoring Practices violation (focus should move to the new content, not back to the trigger when navigation occurs).
- **Fix sketch**: Track the close *cause*. When `usePathname` changes, set a flag `closingDueToNav.current = true` before `setOpen(false)`; in the restore effect, skip `trigger.focus()` if the flag was set, and let the new page own focus (e.g., focus `#main-content`).

## 3. Tab focus trap traverses hidden/animating elements & doesn't filter visibility

- **Severity**: Medium
- **Category**: A11y
- **File**: `src/components/navbar/useMobileMenu.ts:42-56`
- **Scenario**: The `querySelectorAll('a, button:not([disabled]), [tabindex]:not([tabindex="-1"])')` collects every focusable element inside the panel. During the panel's enter/exit Framer animation the DOM is fully present but visually off-screen (`x: 100%`). It also includes the `<button>` inside `LanguageSwitcher` even when the language dropdown is closed (its menu items are hidden via `display:none`/conditional render — which is fine), but the language switcher trigger itself plus all routes plus the close button are all included regardless of actual focusability. Worse: the selector ignores `[inert]` and `aria-hidden="true"` subtrees and returns elements whose parent has `display:none`.
- **Root cause**: The focusable selector is a blunt approximation. It does not filter by `offsetParent !== null`, `inert` attribute, `aria-hidden`, or computed visibility, and it does not exclude the close button when shift+Tab from a route is desired to wrap around naturally.
- **Impact**: Shift+Tab from the close button can jump to an off-screen download CTA mid-animation; visually-hidden focus indicator confuses sighted keyboard users. Inert subtrees in nested portals (like the Framer exit-state copy) become tab targets.
- **Fix sketch**: Replace the selector with `tabbable`/`focus-trap` library OR add `el.offsetParent !== null && !el.closest('[inert],[aria-hidden="true"]')` filter. Re-query on each Tab keypress (current code already does this — good — but tighten the filter).

## 4. `DashboardErrorBoundary` retry can re-trigger the same error in an infinite loop

- **Severity**: High
- **Category**: Latent failure / silent failure
- **File**: `src/components/dashboard/DashboardErrorBoundary.tsx:50-52, 33-48`
- **Scenario**: A child component throws on every render (e.g. a Zustand selector reading from a corrupted persisted store). User sees the fallback, taps "Retry" → `handleRetry` resets `hasError: false` → React re-renders the same children → throws again → boundary catches → `componentDidCatch` runs → `captureExceptionScrubbed` fires → repeat. With React 19's automatic error-recovery batching, this can fire 10+ Sentry events per second until the user closes the tab. There is no rate limit, no "max retries", and no way to bail out of the loop.
- **Root cause**: Retry resets state without changing any input that could break the deterministic error. No backoff, no cap.
- **Impact**: Silent failure (user perceives stuck UI). Sentry quota burn — a single bad user can fire thousands of events. Browser tab CPU spike. The `errorId` regenerates on each catch, so they aren't even deduped server-side.
- **Fix sketch**: Track retry count in state; after N retries (e.g. 3) disable the button and show "We can't recover this view. Refresh the page or contact support." Also: only call `captureExceptionScrubbed` on first catch per `errorId` cycle, set a short cooldown.

## 5. CookieConsent treats unreadable storage as "consented", silently disabling banner & analytics flush

- **Severity**: Medium
- **Category**: Silent failure / privacy
- **File**: `src/components/CookieConsent.tsx:16-22, 35-37`
- **Scenario**: In Safari Private mode (older iOS), embedded webviews, or when a user has set storage to "block all", `localStorage.getItem` throws `SecurityError`. `readConsent` catches and returns `"essential"`. The banner never shows, so the user never has a chance to click "Accept All", and `flushAnalyticsQueue()` is never called → queued analytics events sit in memory forever and are lost on tab close. There is also no mechanism to *re-show* the banner if storage later becomes available (e.g., Safari grants storage after a user gesture).
- **Root cause**: The "fail-closed" design (assume essential consent on read failure) masks the actual problem and is a privacy ambiguity: GDPR requires *explicit* consent for "all" cookies. Treating storage failure as default-essential is OK for legal cookies, but it also means the banner never appears, confusing users who later wonder where consent went.
- **Impact**: Users in private/restrictive modes never see the banner. Analytics queued before consent are effectively dead-lettered. No telemetry on how often this fail-path triggers.
- **Fix sketch**: Distinguish "could not read" from "no value": on read failure, still show the banner but mark choice as session-only; queue a Sentry breadcrumb with `tag: "cookie-consent.storage-unavailable"` so frequency is observable.

## 6. `SectionBreadcrumb` is positioned at `top-[60px]` and overlaps fixed Navbar at narrow viewports

- **Severity**: Medium
- **Category**: Edge case (very narrow / very tall content)
- **File**: `src/components/SectionBreadcrumb.tsx:28`
- **Scenario**: The breadcrumb is `fixed top-[60px] hidden md:block`. The Navbar is `py-4` with `text-base` content — at `md` breakpoint with default font-scaling, the rendered Navbar height is roughly 64-72px, *not* 60px. The breadcrumb therefore renders 4-12px under the navbar, occluded by its blurred-glass background. With browser zoom ≥125% or a user-set `text-size-adjust`, the navbar grows further and the entire breadcrumb is hidden behind it. `InfoPageLayout` then adds a `h-24` (96px) spacer assuming the breadcrumb is visible above the content — but if it's stuck behind the navbar, the spacer is wrong by exactly the breadcrumb height (32px from `h-8`).
- **Root cause**: Magic number `top-[60px]` does not match the dynamic Navbar height; no CSS variable or measurement-based positioning.
- **Impact**: Visually broken layout at non-default zoom or RTL viewports; users see breadcrumb peeking out from under the navbar. Skip-to-content link offset also affected.
- **Fix sketch**: Expose a CSS variable from the Navbar (`--navbar-height`) updated via `ResizeObserver`; use `top: var(--navbar-height)` on the breadcrumb. Or set the breadcrumb to `top-0` and apply matching `padding-top` to the navbar.

## 7. `<a href="#main-content">` skip link points to id that may not exist on every route

- **Severity**: Low
- **Category**: A11y
- **File**: `src/app/layout.tsx:104-109`, `src/components/PageShell.tsx:28`, `src/components/dashboard/DashboardSkeleton.tsx:15`
- **Scenario**: The root layout always renders the skip link targeting `#main-content`. `PageShell` and `DashboardSkeleton` set the id correctly. But several pages mount their own layout shells (legal, blog, dashboard inner pages) without `PageShell` — see e.g., dashboard pages that compose `DashboardNavbar` + `DashboardNavigation` directly without an `id="main-content"` element. When a keyboard user activates the skip link on those routes, focus moves to nothing (anchor target missing → browser scrolls to top, but `:target` styling and SR announcement do nothing useful).
- **Root cause**: Skip-link target is convention-based, not enforced. No lint rule, no runtime check.
- **Impact**: Skip-to-content silently no-ops for keyboard / SR users on dashboard pages and any route that bypasses `PageShell`.
- **Fix sketch**: Add a top-level `<main id="main-content" tabIndex={-1}>` wrapper inside `app/dashboard/layout.tsx` and any other route group missing one. Add a Playwright a11y check that asserts `#main-content` exists on every route.
