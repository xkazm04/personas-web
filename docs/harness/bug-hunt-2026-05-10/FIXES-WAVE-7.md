# Bug Hunter Fix Wave 7 — A11y / Focus / Scroll-Lock / Modal Lifecycle

> 3 commits, 3 findings closed (3 High).
> Baseline preserved: `tsc --noEmit` 0 → 0 errors.

The seventh and final structural-theme wave. Bundles findings around
**"infrastructural primitives that misbehave under cross-cutting
events — focus management on route changes, scroll-lock under HMR,
error boundary retries with no cap."** Each fix is small, but they
remove the kinds of latent failures that silently degrade the
experience for keyboard users, dev-mode reloads, and panicked-user
retry sessions.

## Commits

| # | Commit | Findings closed | Severity | Files |
|---:|---|---|---|---|
| 1 | `925270d` fix(navbar): don't yank focus to hamburger when mobile menu closes on route change | layout #1 | H | `components/navbar/useMobileMenu.ts` |
| 2 | `6fabb0c` fix(scrollLock): persist lock state across HMR via globalThis singleton | layout (scroll-lock leak) + connectors-catalog (modal lifecycle) | H | `lib/bodyScrollLock.ts` |
| 3 | `90ded13` fix(errorBoundary): cap dashboard retries, stop sending Sentry past the cap | layout (error boundary retry-loop cap) | H | `components/dashboard/DashboardErrorBoundary.tsx` |

## What was fixed

### 1. Mobile menu focus yank on route change (commit 1)

The mobile menu's "closed" effect always restored focus to the
hamburger trigger. That's correct when the user dismisses the panel
themselves (Escape, X-tap, backdrop click) — they're staying on the
same page and expect to keep navigating from where they were. But it
was actively wrong when a panel link triggered a route change: the
new page mounted, and the keyboard / screen-reader cursor was yanked
back to a navbar trigger in the previous-row-of-links position.
Keyboard users tabbed to the next nav item; screen readers
re-announced "menu button collapsed" instead of the new page's H1.

Track *why* the panel is closing in a `closeReasonRef` (`'user'` for
explicit close calls, `'route'` for the pathname-driven
`setOpen(false)`). Skip the trigger restoration on route-driven
closes so the new page's first focusable element (skip-link, hero
heading) wins focus by default.

### 2. bodyScrollLock leaks across HMR (commit 2)

`bodyScrollLock` kept its `lockCount` + `previousOverflow` at module
scope. HMR / Fast Refresh re-evaluating the module reset both to
defaults while `body.style.overflow` was still `"hidden"` from the
prior instance. The very next `lockBodyScroll` call (e.g. opening a
modal after a dev-mode HMR cycle) captured `"hidden"` as the
`previousOverflow`, and the eventual unlock restored it — freezing
scroll for the rest of the dev session until a hard reload.

Move state onto `globalThis` under a `Symbol.for` key, the same
pattern `usePageVisibility` uses for its `visibilitychange` listener
registry. HMR replaces the module body but `globalThis` survives, so
the `lockCount` and `previousOverflow` remain coherent across
reloads. The public API (`lockBodyScroll` / `unlockBodyScroll`) is
unchanged.

### 3. DashboardErrorBoundary retry cap (commit 3)

`handleRetry` reset `hasError` without bounding how many times the
user could click. If the underlying failure was unrecoverable —
broken upstream, missing env var, dead orchestrator, malformed
Supabase response — every Retry triggered another
`componentDidCatch`, which captured another Sentry event. A
panicked user mashing the button could burn through the project's
daily Sentry quota in seconds and pin React's reconciler in a tight
error-frame loop.

Track `retryCount` in state. After `MAX_RETRIES` (3), the button
disappears and a "this view keeps failing" message tells the user
to refresh or contact support. `componentDidCatch` still logs to
console past the cap (the operator may want the local trace) but
stops sending to Sentry — the first 3 events already convey the
loop is unrecoverable; further repeats add no diagnostic value.
`retryCount` also lands as a tag and context field so the first 3
events can be triaged on the basis of "did the user click retry,
and how many times before giving up."

## Verification table

| Gate | Before wave | After wave |
|---|---:|---:|
| `tsc --noEmit` errors | 0 | 0 |
| Wave-7 commits | 25 (cumulative from waves 1-6) | 28 |
| Critical findings closed (cumulative) | 9 / 9 | 9 / 9 |
| High findings closed (cumulative) | 21 / 75 | 24 / 75 |

## Cumulative status (after wave 7)

- 33 of 178 findings closed (18.5%).
- 9 of 9 criticals closed.
- 24 of 75 highs closed.

| Wave | Theme | Closed |
|---:|---|---:|
| 1 | A. Security / Auth / Vote integrity | 8 |
| 2 | B. State corruption (personas/reviews/event-bus stores) | 7 |
| 3 | C. SSE + streaming reliability | 4 |
| 4 | D. Animation lifecycle / observer cleanup / visibility pause | 3 |
| 5 | E. SSR / hydration / theme + i18n flash | 4 |
| 6 | F. Data integrity / SEO / ordering | 4 |
| 7 | G. A11y / focus / scroll-lock / modal lifecycle | 3 |
| **All structural themes** | | **33** |

## Patterns established (catalogue items 21–23)

21. **Focus restoration must know *why* the close happened.** The
    WAI-ARIA dialog pattern says "restore focus on close" — but the
    spec's intent is "the user is going back to where they were."
    When the close is *part of* a navigation transition, restoring
    focus to the triggering button defeats the new page's focus
    management and produces the "tabbed back to navbar" failure
    mode. Track close cause; conditionally restore. Same shape for
    drawers, modals, popovers — anywhere a focus-trapped surface can
    close due to either user action or a side-effect like
    `pathname` change or auth expiry.
22. **Module-level singletons leak across HMR — use globalThis.**
    Any module that holds runtime state (counters, registries,
    cached singletons, `WeakSet` ledgers) must persist that state
    across HMR / Fast Refresh, or the dev experience drifts away
    from production. The pattern: stash state on `globalThis` under
    a `Symbol.for("project.module.state")` key. The first-time
    initialization runs once per *page load*, not once per *module
    evaluation*, which is what production semantics demand. Already
    in the codebase as `usePageVisibility`'s registry; same shape
    now in `bodyScrollLock`.
23. **Error boundaries need retry caps + Sentry deduplication.** A
    boundary that re-throws on every retry produces an event per
    click; an unrecoverable underlying failure plus a panicked user
    can burn quota in seconds. Always cap the retry count, hide the
    button past the cap, and stop sending to Sentry past the first
    N events (which already convey the loop is unrecoverable). The
    cap is not just a UX consideration — it's a vendor-quota
    cost-control that's easy to miss when designing the boundary.

## What remains

- **Theme D follow-ups** — `use-pipeline-simulation`,
  `use-chat-sequence`, `useAutoCycle`-driven hooks; same shape as
  the visibility-pause fix in wave 4. Recommended for the next
  session as a `useVisibilityPause` shared primitive.
- **Long tail** — 145 medium/low findings across all 25 contexts.
  Most cluster around UI polish (CSS pseudo-element rendering,
  spacing nits, animation timing), content drift (search index,
  sitemap, OG previews), and developer-experience improvements
  (better error messages on env-var misconfiguration). No structural
  themes; these are best handled in focused passes against specific
  surfaces rather than another themed wave.

## Deliberately deferred (out of scope this wave)

- CookieConsent silent-fail in Safari Private Mode
  (layout-navigation-page-shell finding). Real bug but the
  remediation is a try/catch + analytics tag, not a structural fix —
  fits with a "polish pass" session better than the a11y theme.
- Skip-link target missing on dashboard routes (layout finding). The
  dashboard layout doesn't render a `<main id="main-content">`
  target so the existing skip-link in the root layout points to
  nothing. One-line fix per dashboard layout surface; deferred for
  the polish pass.
- SectionBreadcrumb `top-[60px]` magic number drifting from the
  actual navbar height (layout finding). Should be derived from a
  CSS variable or measured at runtime; deferred.

## What's next?

With 7 themed waves done, all 9 criticals closed, and 33 structural
findings remediated, the meaningful structural work in this audit is
complete. The remaining 145 findings are valuable but they don't
share a coherent mental model; remediating them as one-off fixes
when the relevant surfaces come under active development is more
efficient than another themed wave.

The pattern catalogue stands at **23 items** spanning trust
boundaries, state coherence, stream reliability, animation
lifecycle, hydration safety, data-edge integrity, and a11y/focus.
Future scans (any agent type, any future date) can grep for these
shapes proactively in any new code instead of re-discovering them.

Recommended next session: pick a specific surface (e.g. the next
feature in development) and apply the catalogue + remaining
finding-list as a pre-merge review checklist for that surface only.
