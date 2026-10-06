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
| M5 | **Contest verdict (2026-10-06):** the winner is Sonnet v1 "Hive Reels" as the default `/m`; Sonnet v2 "Around the Clock" goes to a new test route `/m2`, which the owner likes more but wants to try on a real phone first. | Both are ported with the **web's fonts (Geist Sans / Geist Mono) and theming** (semantic tokens, all 11 themes), and with **no purple/pink gradient backgrounds**. Every variant had used its own visibly different type. The vault record is `.contest/Contest/contests/mobile-landing.md`. |
| M6 | **Agent management is the core of the mobile dashboard.** | Phase 2 is designed around viewing and managing agents from the phone, not around a read-only overview. |
| M7 | **The download CTA appears only when the user cannot sync to their app.** | A signed-in user whose desktop app syncs sees no download CTA inside the mobile dashboard. Anonymous visitors on the public `/m` and `/m2` always see it. The signal "can sync" is defined in `PHASE2-SURVEY.md`. |
| M8 | **The CTA uses real actions only.** | There is no email service on the site, so "email me the link" is dropped. The CTA offers the native share sheet, copy link, and an `.ics` reminder (`src/components/mobile-landing/shared/handoff.ts`, `eedeab5`), plus the existing waitlist API for macOS and Linux. |
| M9 | **A paired device is trusted (2026-10-06).** | Commands from a paired device run with no per-command approval on the desktop. This loosens a policy on purpose: per-command approval is replaced by device-level trust, with revocation. |
| M10 | **v1 remote actions: pause/resume personas and cancellation.** The desktop already has these actions; web and mobile need the sync mechanism. Also sync the **Notes module** (goal management) and **chat conversations** with agents. | This needs new command types, desktop handlers, and new synced tables. More data goes to the cloud (notes, chat), so the owner signs off on each table in the spec. |
| M11 | **Production runs on the live Supabase data source.** | The sync signal and commands exist in production. Demo mode remains for visitors. |
| M12 | **Actions are blocked while the desktop is offline.** Commands are not queued: the desktop is assumed not to come online by itself. | The online gate is the `synced_devices` heartbeat freshness. When the desktop is offline, the UI says "open Personas on your computer". |
| M13 | **The mobile dashboard is phone layouts of `/dashboard/*`**, not `/m/<view>`. | `/m` and `/m2` stay as the public landings. The old `/m/<view>` redirects to `/dashboard/*` stay. |
| M14 | **I build both repos:** desktop `../personas` and web, plus the SQL. | Cross-repo slices land end to end, starting with pause/resume. Commits go to each repo's current branch, never pushed. |
| M15 | **Merge `dashboard/spa` first.** | Phone layouts are built on the SPA structure. |
| M16 | **The phase 2 migration is approved (2026-10-06).** | The SQL from PHASE2-SPEC §2.1, §3.2 and §4.1 goes into `scripts/setup-sync-db.sql`. The owner runs `npm run db:migrate:sync` on prod. |
| M17 | **Paired phones auto-run every v1 verb**, including the spending ones (`run_persona`, `chat_send`). | No desktop prompt and no daily cap. The trust boundary is the device key plus desktop-side revocation (spec §3.5). |
| M18 | **Chat: both kinds, Athena first.** | Athena's companion threads (the send path is already in Rust) land first. Persona chat follows after the chat turn moves into the Rust core. |
| M19 | **Notes and chat sync are separate opt-ins, off by default.** | Each is a separate desktop toggle. The privacy policy and the storage register are updated when each lands. |
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

### Phase 0 results (2026-10-06)

**Phone baseline.** `e2e/mobile/baseline.spec.ts`, run with `npx playwright test --project=mobile`, passes **3/3** on today's landing:
- **No sideways scroll at 390px.** Across 24 scroll stops, `scrollWidth` never exceeded 390px. The spec compares against the device width, because phone emulation widens `innerWidth` to fit any overflow. A 600px probe turns the spec red.
- **Phones on `/dashboard/*` are no longer redirected.**
- **`/m/reviews?id=x` returns a 307 to `/dashboard/reviews?id=x`.**

**Inputs for Phase 1:**
- **Hero headline.** Line 2 is 361px wide at 390px, so at 375px it would run about 34px past the padded box. It doesn't scroll the page, because `main` clips it, but it's cut off.
- **Browser engine.** The `mobile` project runs on Chromium with the iPhone 13 profile, because the WebKit build Playwright needs isn't installed. Run `npx playwright install webkit` and drop the `browserName` override to test on real Safari.

**Merge note.** `dashboard/spa` edits `src/app/m/reviews/page.tsx`, which this branch deletes. Keep the delete.

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
| 0: clear the ground | **done 2026-10-06**: `dfc34a4`, `e1984d1`, `188f0bc`, `3eb281d`, `7caf9bd`, `b56b6ba`, `04ef958` |
| 1: mobile landing | **ported 2026-10-06**: `/m` Hive Reels (`4c766fa`, `fb70cff`; 994.7 KB) and `/m2` Around the Clock (`0db4712`; 1010.2 KB), both noindex, no redirect yet; phone e2e 23/23. Launch (translate x13, proxy for `/`, robots) waits on the owner trying `/m2` on a phone |
| 2: mobile dashboard | surveying agent management + sync signal (`PHASE2-SURVEY.md`); design waits on the `dashboard/spa` merge |

## Phase 1 contest brief (draft for `/contest --landing`)

**Idea.** *"The Personas landing page, rebuilt phone-first for /m. It covers six sections, in order: hero, use cases
('one persona, many tools'), Athena companion, pricing (free; you pay only your Claude plan), FAQ, and a phone-native
call to action that sends the desktop download to your computer. Each variant is a complete phone page at 390×844,
not a squeezed desktop page."*

**What the host stages into each seat's `data/`:**
- this plan, and `SURVEY.md` §3–4 (the desktop sections, tokens, themes and motion gates);
- screenshots of today's desktop sections from the live page;
- the copy of the six desktop sections from `en.ts`;
- `.claude/design.md`.

**Bar, on top of `landing-bar.md`:**
- One thumb, one column. Touch targets are 44px or larger. Respect the safe area. Never scroll sideways.
- Look right in all 11 themes.
- Gate motion with `useStillMotion`; ambient loops stop on hidden tabs.
- Illustration-first: the art carries the benefit and the type sits in a scrim it owns.
- Benefit-first copy with no internal jargon.
- The CTA has to make sense on a device that cannot install the app.

**Review.** The host captures each variant with the Playwright `mobile` project (phone user agent, 390×844), plus a
desktop-frame view at `/preview/lab-m-*`. The owner picks per section and can mix sections across variants.
