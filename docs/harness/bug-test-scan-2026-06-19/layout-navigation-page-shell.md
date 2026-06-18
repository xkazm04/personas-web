# Layout, Navigation & Page Shell — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 1, High: 2, Medium: 2, Low: 0)

## 1. Analytics gating calls a non-existent `Sentry.metrics` API — crashes on every event once consent="all"
- **Severity**: Critical
- **Lens**: bug-hunter
- **Category**: Broken dependency / compliance path failure
- **File**: src/lib/analytics.ts:16-38 (also PageViewTracker.tsx:24, DownloadCTA.tsx:78)
- **Scenario**: A user clicks "Accept All" in CookieConsent. `flushAnalyticsQueue()` runs, and from then on every `trackPageView` (fires in `PageViewTracker` on each route change), `trackDownloadClick`, and feature-vote call reaches `trackEvent`'s consent branch and executes `Sentry.metrics.count(name, 1, { attributes })`.
- **Root cause**: `@sentry/nextjs ^10.52.0` resolves its client import chain `@sentry/nextjs → @sentry/react → @sentry/browser`, and the **npm main entry of `@sentry/browser` v10 does NOT export `metrics`** (only the special `index.bundle.*.metrics` CDN builds do — verified in `node_modules/@sentry/browser/build/npm/esm/index.js`, which re-exports `logger` from core but not `metrics`). So at runtime `Sentry.metrics` is `undefined` and `.count` throws `TypeError: Cannot read properties of undefined (reading 'count')`. The `trackEvent` consent branch (line 16-18) has **no try/catch**, so the throw escapes the `useEffect` in `PageViewTracker` — an uncaught error on the highest-traffic path. (`flushAnalyticsQueue` has a per-event try/catch, so it silently swallows; `trackEvent` does not.)
- **Impact**: crash — analytics is fully broken whenever consent is granted (the entire point of the "Accept All" path), with an uncaught exception thrown on every navigation. No telemetry is ever recorded; "Accept All" turns analytics from off into broken-and-throwing.
- **Fix sketch**: Replace `Sentry.metrics.count(...)` with a supported v10 client API (e.g. `Sentry.captureMessage`/breadcrumb, or import `metrics` explicitly from `@sentry/core` if the project intends to use it) and wrap the live-track branch in try/catch like `flushAnalyticsQueue` already does. Add an e2e assertion that an analytics call actually succeeds after consent (see finding 4).

## 2. Cookie consent does not propagate across tabs and cannot be revoked — stale gating
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: Consent state / compliance correctness
- **File**: src/components/CookieConsent.tsx:32-43, src/lib/analytics.ts:11-14
- **Scenario**: User has two tabs open with the banner showing. In tab A they click "Accept All". Tab B's banner stays up (its `useState(false)` never re-reads), and any queued analytics in tab B is still gated off because nothing re-checks `localStorage`. Conversely, there is no UI path to *revoke* consent — once "all" is written, `hasAnalyticsConsent()` returns true forever and analytics fires on every load with no banner shown again (`useEffect` only sets `visible` when `readConsent()` is falsy).
- **Root cause**: Consent is read once on mount and on the accept click; there is no `window.addEventListener("storage", …)` to react to cross-tab changes, and no "manage cookies" control to clear `COOKIE_CONSENT_KEY`. The design assumes a single tab and a one-way (never-revoked) decision — which is a GDPR/ePrivacy weakness since consent must be withdrawable as easily as it is given.
- **Impact**: security/compliance + UX degradation — withdrawal of consent is impossible without devtools; multi-tab sessions show inconsistent banner/gating state.
- **Fix sketch**: Add a `storage` event listener in `CookieConsent` to re-sync `visible`/flush on cross-tab changes, and expose a "Cookie settings" link (e.g. on the legal page) that clears the key and re-shows the banner.

## 3. `error.tsx` sends the raw, unscrubbed error to Sentry while `global-error.tsx` scrubs it
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: PII leak / inconsistency
- **File**: src/app/error.tsx:21-23 (vs src/app/global-error.tsx:18-25)
- **Scenario**: Any error caught by the route-segment boundary (`error.tsx`) runs `Sentry.captureException(error)` directly. The route boundary is the *higher-volume* path (it catches per-page render/runtime errors, while `global-error` only fires when the root layout itself throws). The raw `error.message`/`error.stack` is handed to Sentry before the `beforeSend` hook runs.
- **Root cause**: `global-error.tsx` was hardened to route through `captureExceptionScrubbed` (per the CLAUDE.md PII mandate, see comment at lines 18-25), but `error.tsx` was not updated to match. The global `scrubEvent` `beforeSend` hook only touches `event.message`/`exception.values[].value`/breadcrumbs — per the doc comment in `sentry-pii.ts:194-204`, it does **not** scrub the original `error.message`/`error.stack` strings or caller-passed `extra`/`contexts`, which is exactly why `captureExceptionScrubbed` exists.
- **Impact**: security/privacy — route-level errors can leak file paths, URLs with query/path PII, emails, or quoted names into Sentry, violating the project's own scrubbing contract; inconsistent with the global boundary.
- **Fix sketch**: In `error.tsx` replace `Sentry.captureException(error)` with `captureExceptionScrubbed(error, { tags: { scope: "RouteError" } })`, mirroring `global-error.tsx`.

## 4. Cookie-consent e2e asserts persistence but not the analytics gating it exists to enforce (success-theater)
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: Coverage gap / success-theater
- **File**: e2e/cookie-consent.spec.ts:1-50
- **Scenario**: The spec checks the banner appears, that clicking the two buttons hides it, and that `localStorage` holds `"all"`/`"essential"`. It never asserts the *behavioral contract*: that with `"essential"` no analytics event is recorded, and that after `"all"` an analytics call actually succeeds (or even runs without throwing). Because of finding 1, "Accept All" currently throws on the next page-view — yet all five tests pass, because none of them exercise an analytics call. The tests give false confidence that the compliance gate works.
- **Root cause**: Tests assert the visible side effect (banner + storage key) rather than the risk-bearing invariant (PII/analytics only fires under consent). There is no unit harness (no vitest/jest) to test `hasAnalyticsConsent`/`trackEvent`/`flushAnalyticsQueue` gating in isolation, so the consent→analytics contract has zero meaningful coverage at any level.
- **Impact**: false-confidence test — the single most compliance-sensitive path (gating PII collection on consent) is unverified, and a runtime-breaking regression (finding 1) ships green.
- **Fix sketch**: Add e2e assertions that intercept Sentry transport / window error events: with "essential" no analytics request fires; with "all" the queued/page-view event is sent and **no uncaught page error** occurs. Consider adding a minimal unit runner for `analytics.ts` gating logic.

## 5. MobilePageTOC and Navbar mobile menu both scroll-lock the body; nested locks rely on a shared counter with no per-overlay test
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: Scroll-lock leak / coverage gap
- **File**: src/components/navbar/useMobileMenu.ts:48-80, src/components/MobilePageTOC.tsx:26-37, src/lib/bodyScrollLock.ts:32-51
- **Scenario**: On an info page (mobile), a user opens the page-TOC dropdown (lock #1), then opens the navbar hamburger (lock #2). The counted lock keeps `overflow:hidden` until both unlock. Both effects only run their cleanup `unlockBodyScroll()` when their own `open→false` cleanup fires. If a route change closes the navbar menu via the `queueMicrotask` path in `useMobileMenu` (lines 38-45) while the TOC is still open, or if React unmounts one overlay without its effect cleanup running in an edge case, the counter can be left `> 0` and the page stays frozen. There is no test covering nested/interleaved overlay locks or the route-change-close path, despite the global blast radius.
- **Root cause**: Scroll-lock correctness depends on every overlay's effect-cleanup running exactly once per lock, across HMR and route transitions; the counter is robust by design but completely unverified. The route-driven close (`setOpen` inside `queueMicrotask`) and the keydown/scroll-lock effect are coupled, so ordering edge cases are plausible and currently untested.
- **Impact**: UX degradation — a frozen (unscrollable) page is a hard dead-end for the user; coverage gap on a high-blast-radius shared primitive.
- **Fix sketch**: Add an e2e test that opens TOC + navbar menu together, closes each, and asserts `document.body.style.overflow` returns to its original value; add a route-change-while-open case. Optionally assert `lockCount` returns to 0.
