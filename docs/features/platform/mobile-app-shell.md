# Mobile App Shell & Views
> **Rebuilding.** The old `/m` dashboard companion was deleted on 2026-10-06 (owner decision M1). The plan for the new `/m` (a phone landing first, then dashboard views) is [docs/concepts/mobile-revival/PLAN.md](../../concepts/mobile-revival/PLAN.md), with its survey in [SURVEY.md](../../concepts/mobile-revival/SURVEY.md). · **Route:** none today; `/m` and `/m/*` are temporary redirects · **Status:** Phase 0 done (ground cleared)

## What it does
Today, nothing phone-specific. Phones get the normal responsive pages: the landing, the marketing routes and the
`/dashboard/*` demo (whose own narrow-width chrome is `MobileBottomNav`, see
[shell-chrome.md](../dashboard/shell-chrome.md)). No request is redirected by user agent any more.

Old `/m` links still work. They redirect to the closest desktop page, so bookmarks, shared links and notifications
don't 404.

## How it works
- **No phone redirect.** `src/proxy.ts` (Next 16's Proxy convention: it sent every mobile user agent on
  `/dashboard*` to an `/m/*` view, with a `prefer-full` cookie escape) was deleted. No other `proxy.ts` /
  `middleware.ts` exists, so nothing runs before a request.
- **Temporary redirects** live in `next.config.ts` `redirects()`. All are `permanent: false` (307), and Next forwards
  the query string:

  | Old URL | Goes to |
  | --- | --- |
  | `/m` | `/` |
  | `/m/overview` | `/dashboard/home` |
  | `/m/reviews` | `/dashboard/reviews` |
  | `/m/messages` | `/dashboard/messages` |
  | `/m/alerts` | `/dashboard/incidents` |

  The `/m` entry goes when the new `/m` landing ships (phase 1). The view entries are revisited when the mobile
  dashboard ships (phase 2), and each phase re-enables a phone redirect for its own scope.
- **What was kept.** `MobileSheet` moved to `src/components/primitives/BottomSheet.tsx` (default export
  `BottomSheet`, not in the primitives barrel). It is a bottom sheet with a focus trap (`useFocusTrap`),
  `aria-labelledby` wired to its title, drag-down, Escape, backdrop tap, a visible close button and a body-scroll lock.
  Nothing imports it yet; it is there for the new `/m`.
- **Phone verification.** The Playwright project `mobile` (`devices['iPhone 13']`: phone UA, touch, 390x844) runs
  `e2e/mobile/**` only. `e2e/mobile/baseline.spec.ts` checks that `/` doesn't scroll sideways at phone width, that a
  phone on `/dashboard/*` is not redirected, and that `/m/reviews` redirects to `/dashboard/reviews`. Run it with
  `PLAYWRIGHT_PORT=<free port> npx playwright test --project=mobile`. This is the instrument every later phase
  verifies against, because 375px can't be checked by hand on this machine.

## Key files
| File | Role |
| --- | --- |
| `next.config.ts` | `redirects()`: the five temporary `/m` redirects |
| `src/components/primitives/BottomSheet.tsx` | Kept bottom-sheet primitive for the new `/m` |
| `playwright.config.ts` | `mobile` project (iPhone 13, `e2e/mobile/**`); the `chromium` project ignores `e2e/mobile/**` |
| `e2e/mobile/baseline.spec.ts` | Phone baseline: no horizontal overflow on `/`, no `/dashboard` redirect, `/m/reviews` redirect |

Deleted 2026-10-06: `src/proxy.ts`, `src/app/m/**` (index, layout, overview, alerts, messages, reviews),
`src/components/mobile/**` (shell, tab bar, app bar, page transition, stat card, thread sheet, `ViewFullSiteLink`)
and `src/components/dashboard/HealthIssueRow.tsx` (its only consumer was `/m/alerts`).

## Data & state
None. The old views ran on the dashboard stores plus directly imported mock fixtures, so they stayed on mock data
even in a live session. The new mobile dashboard must use the same demo/live data plane as the desktop views
(PLAN.md, phase 2).

## Integration points
- **Auth.** `AuthProvider` still initialises auth for paths starting with `/m` as well as `/dashboard`
  (`src/components/AuthProvider.tsx:12`). It is left in on purpose: the phase 2 mobile dashboard needs it. Today the
  `/m` branch is inert, because `AuthProvider` is mounted only by `src/app/dashboard/layout.tsx`. The check is a bare
  prefix, so it would also match any future top-level route starting with `m`.
- **robots.** `src/app/robots.ts` still disallows `/m/`. Phase 1 decides whether to lift it for the public landing.
- **Cookies.** The `prefer-full` cookie left with `ViewFullSiteLink`; the storage register and the cookie policy no
  longer list it (see [legal.md](../content/legal.md)). A "full site" escape in the new `/m` must add a register row
  and a `POLICY_META.cookies` bump back.
- **Bundle budget.** The five `/m*` entries were removed from `bundle-budget.json`. A new `/m` route needs
  `check:bundle -- --update` with a reason.

## Conventions & gotchas
- **Merge with `dashboard/spa`.** That branch edits `src/app/m/reviews/page.tsx` (its `ReviewsFocusFlow` import
  moved). Merging it after this deletion gives a modify/delete conflict: resolve it by keeping the delete.
- **`/m` is a route path referenced from outside.** Keep the redirects until a phase replaces them (CLAUDE.md "Out of
  scope": route paths need confirmation).
- **Rules for the rebuild** (from PLAN.md): semantic tokens across all 11 themes, `useStillMotion` and
  `useLoopGate` / `usePageVisibility` for motion, `QualityProvider` on low-end phones, 44px touch targets, the safe
  area, and no sideways scroll. New copy goes in an English-only `mobile` / `mobileLab` namespace until the designs
  settle (M4).
- **The kept sheet still has style debt.** `BottomSheet` uses `bg-[rgba(8,11,20,0.6)]`, `border-white/[0.08]` and
  `bg-white/20`, not semantic tokens. Fix this when the new `/m` first uses it.

## Related docs
- [/m revival plan](../../concepts/mobile-revival/PLAN.md)
- [Dashboard Shell, Chrome & Realtime](../dashboard/shell-chrome.md)
- [Feature index](../INDEX.md)
