# Fix Wave 9 — Broken conversion path (theme T10)

> 3 commits, 4 findings closed (4 High).
> Baseline preserved: tsc 0 → 0 · vitest 64/64 → 64/64 · 0 regressions.

## Commits

| # | Commit | Findings closed | File(s) |
|---|---|---|---|
| 1 | `38fe9bb` | conversion-getstarted-faq-footer #1, homepage-hero #1 | PrimaryCTA.tsx, HeroClient.tsx |
| 2 | `e79388d` | waitlist-app-download #1 | WaitlistModal.tsx |
| 3 | `8201f9f` | waitlist-app-download #2 | Navbar.tsx (+ removed navbar/DownloadModal.tsx) |

## What was fixed

1. **Download-click analytics dropped** — `PrimaryCTA` rendered an `<a>` for the `href` branch without forwarding `onClick`, so `trackDownloadClick` never fired in the live-download config (the site's most important conversion metric, in the state least likely to be inspected). `onClick` is now attached to the anchor too.
2. **Hero fallback anchor dead** — with `NEXT_PUBLIC_DOWNLOAD_URL` unset the hero CTA fell back to `#download`, but `id="download"` lives inside a lazy, gated section absent from the DOM on first paint, so an early click did nothing. Now targets the always-present wrapper `#download-section`, which scrolls into view and mounts the section.
3. **Waitlist stuck on "Joining…"** — the 15s submit timeout fired `abort()` but the catch treated every AbortError as a silent return, leaving the button permanently disabled with a spinner for exactly the flaky-network users most likely to time out. A per-submit `timedOut` flag now shows an error + retry on timeout while keeping close/re-submit aborts silent.
4. **Navbar download = dead end** — the CTA opened a placeholder modal whose (non-disjoint) options just closed it, diverging from `/api/download`'s documented waitlist fallback and hardcoded English. The CTA now opens the canonical `WaitlistModal` (windows), reusing its i18n + timeout handling; the dead placeholder modal was removed.

## Verification

| | Before | After |
|---|---|---|
| tsc | 0 | 0 |
| vitest | 64/64 | 64/64 |

## Patterns established (catalogue items 16–17)

16. **A polymorphic CTA that swaps element by prop must forward every handler on both branches** — an `href ? <a> : <button>` split silently dropped `onClick` on the anchor. Forward shared handlers on both, or make the prop union a type error. And a fallback anchor must target an id that exists at first paint, not one inside a lazy/gated subtree.
17. **One AbortError path can hide two intents** — timeout-abort (needs user feedback) vs close/supersede-abort (silent) look identical. Flag why the abort happened so the timeout case surfaces an error + retry instead of a permanent spinner. And don't ship a placeholder on the highest-intent CTA — route it to the real flow.

## What remains

T8 dead/unwired surface (`/api/roadmap`, orphaned CTAs), T11 hydration/SSR, T9 i18n, T14/T15, plus deferred sub-items (tour pause, terminal no-stop, knowledge type-bucket+legends, small T5 tail). Per INDEX.md.
