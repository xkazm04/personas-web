# /m revival: project plan

**Started 2026-10-06.** Owner direction: throw away the current `/m` and design new mobile content that matches
the features and style quality of the web. Scope is smaller: first a mobile take on the **landing page**, then
**dashboard** content.

The survey this plan rests on, with anchors, is [SURVEY.md](SURVEY.md).

## Decisions (owner, 2026-10-06)

| # | Decision | Consequence |
|---|---|---|
| M1 | **Redirect off while building.** | `src/proxy.ts` stops sending phones to `/m/*`, so phones get the normal responsive pages. Old `/m/*` URLs redirect to their `/dashboard` equivalents. Each phase re-enables the redirect for its own scope when it ships. |
| M2 | **Core story for the landing:** hero + use cases + Athena companion + pricing + FAQ + a phone-native CTA. | The heavy desktop spectacles (Hub, Agent Mind, Get Started dial, Team Canvas, Vision stack) are left out of `/m`. |
| M3 | **Lab + review.** | 2-3 variants per section under `/preview/lab-m-*`, judged inside a phone frame. The owner picks the winners, which are promoted into `/m`, the same as the landing and /features labs. |
| M4 | **English-only pending namespace.** | New copy goes in a named `mobileLab` / `mobile` namespace, English only. All 13 locales get translated once the designs settle, before launch. |
| — | Route paths. | `/m` stays the mobile root. The old `/m/overview`, `/m/alerts`, `/m/messages` and `/m/reviews` pages are deleted (owner-approved), and their URLs are kept alive as redirects. |

## Phase 0: clear the ground (in progress)

1. **Disable the redirect.** Retire `src/proxy.ts`. Add temporary redirects for the old views in
   `next.config.ts`:
   - `/m/overview` → `/dashboard/home`
   - `/m/reviews` → `/dashboard/reviews`
   - `/m/messages` → `/dashboard/messages`
   - `/m/alerts` → `/dashboard/incidents`
   - `/m` → `/`

   The redirect for `/m` itself is removed when the new `/m` lands.
2. **Delete the old tree:** `src/app/m/**` and `src/components/mobile/**`. **Keep `MobileSheet`**, a sound bottom-sheet
   primitive (focus trap, drag-dismiss, labelled), and move it to shared UI.
3. **Fix what depended on it:**
   - `review-ledger.test.ts`, which walks `app/m/reviews`.
   - The e2e specs: `smoke-routes.ts` `MOBILE_ROUTES`, `smoke.spec.ts` and `dashboard-demo.spec.ts`.
   - The `prefer-full` cookie, which nothing sets anymore. Remove it from the storage register and the cookie policy, in all 14 locales, with a policy changelog entry.
   - The orphan `common.viewFullSite` key, in all 14 locales.
   - The `/m*` bundle-budget entries.
   - The docs, the context map, and the FINDINGS B-12 status.
4. **Make phones testable.** Add a Playwright `mobile` project (`devices['iPhone 13']`: phone UA, touch, 390×844),
   scoped to `e2e/mobile/**`, plus a baseline spec. The spec checks two things:
   - no page on `/` overflows horizontally at phone width;
   - a phone on `/dashboard/*` is no longer redirected.

   This becomes the verification instrument for every later phase, because 375px can't be checked by hand on this machine.

## Phase 1: the mobile landing (`/m`)

**Shape.** `/m` becomes a public, server-rendered page with its own metadata. Its canonical URL is `/`, so the
two don't compete in search. It is built from phone-native sections, not desktop sections squeezed down:

| Section | Starting point | Lab variants |
|---|---|---|
| Hero | `hero-hive`: the headline clips at 375px; the honeycomb floor is heavy | 3 |
| Use cases ("one persona, many tools") | `use-cases`: the 2.5:1 reel stage collides at phone width | 3 |
| Athena companion | `companion`: already stacks; it gets a phone-first composition | 2 |
| Pricing | `pricing`: it already has tall phone art, so it's a light refinement | 2 |
| FAQ | `FAQ`: portable as it is; needs a thumb-sized accordion | 1 (direct) |
| CTA ("send to my desktop") | `DownloadCTA` offers an installer to a phone, which is wrong | 3 |

**Rules every variant follows:**
- Use the semantic tokens and look right in all 11 themes.
- Gate motion with `useStillMotion`, and stop ambient loops with `useLoopGate` / `usePageVisibility`.
- Use `QualityProvider` to step down on low-end phones.
- Keep touch targets at 44px or more, respect the safe area, and never scroll sideways.
- Follow the owner's taste: illustration-first; benefit-first copy with no internal jargon; big readable type.

**Lab.** Each slot renders inside a phone frame (390×844, safe areas shown) at `/preview/lab-m-<section>-v<n>`.
Review happens at a desktop size against a true phone viewport. The Playwright mobile project captures a
screenshot of each variant on a real phone UA, so the owner can review on a phone-sized image as well.

**Launch.**
- Promote the winners.
- Translate the `mobile` namespace into all 13 locales.
- Re-baseline the bundle budget.
- Extend `proxy.ts` to send phone visitors on `/` to `/m`. Keep a "full site" escape, which adds a cookie back to the register and the policy.
- Lift the `robots` block for `/m`.

## Phase 2: mobile dashboard (`/m/...` views)

**Prerequisite:** wait for the `dashboard/spa` branch to merge. It moves views to `src/components/dashboard/views/<view>/`, makes Personas the
default (desktop-only) view, and replaces home with Mission Control. The mobile views must mirror *that* structure,
not today's.

**Candidate scope:** the jobs a phone is for.
- Approvals: reviews in a one-thumb focus flow.
- Alerts and incidents.
- Messages, read in a bottom sheet.
- A Mission Control summary.

Each runs on the same demo and live data plane the desktop views use, behind `useDemoOnlySWR`-style gates, never on directly imported fixtures.

**Directions to weigh when scoping** (from the moonshot backlog):
- `8.1A`: the phone as a remote control over `pending_commands`.
- `8.1B`: an installable `/m` with Web Push for reviews that need a human.

**Launch.** Re-enable the `proxy.ts` deep-link map, with the new view ids, for `/dashboard*`.

## Status

| Phase | State |
|---|---|
| 0: clear the ground | in progress |
| 1: mobile landing lab | brief ready once phase 0 lands |
| 2: mobile dashboard | waiting on the `dashboard/spa` merge |
