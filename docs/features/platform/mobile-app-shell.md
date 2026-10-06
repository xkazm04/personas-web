# Mobile App Shell & Views
> **Phone landing live at `/m`** (not yet linked or redirected to). Plan: [docs/concepts/mobile-revival/PLAN.md](../../concepts/mobile-revival/PLAN.md), survey: [SURVEY.md](../../concepts/mobile-revival/SURVEY.md). · **Route:** `/m` (public, server-rendered, `noindex`, canonical `/`); `/m/overview|reviews|messages|alerts` are temporary redirects · **Status:** Phase 1 landing promoted 2026-10-06 ("Hive Reels"); phase 2 (mobile dashboard) not started

## What it does
`/m` is the Personas landing rebuilt for one thumb: a vertical film of six one-screen posters, every picture built from
glowing hex cells.

1. **Intro.** "One event in. A whole team on it." over a hive of agent cells. An event gem drops in, a ripple crosses
   the hive, a team of cells lights and a "done" token rises. Three chips (Invoice in, New lead, Build failed) replay it;
   cells glow under a dragged finger.
2. **Use cases.** "One persona, many tools." A hex-prism reel spins and lands each job on the right tool; every landing
   adds 3 jobs to the "Chief of staff" persona. Swipe, arrows or replay; tap the reel for that tool's jobs in a sheet.
3. **Athena.** Her portrait in a lit lens with four capability satellites (always on, hold to talk, remembers, reaches
   out first). A satellite swaps the headline and she answers in a bubble; holding the portrait is the hold-to-talk demo
   (no microphone is used).
4. **Free.** A run travels from Personas ($0, MIT) through Claude Code to Anthropic; the only payment line runs from
   your own Claude Pro or Max plan.
5. **Questions.** Four question tiles; each opens the full answer (from the site FAQ) in a layer with previous / next.
6. **Get it.** "Take it to your computer." A phone beams the link to a computer. Pick the computer: Windows sends the
   link through the share sheet (or copies it); macOS and Linux join the waitlist. Anyone can copy the link or download
   a calendar reminder (`.ics`). If neither share nor clipboard is allowed, the link shows for copying by hand.

The dock button is on screen at every stop: before the last poster it jumps there ("Get it on your computer"); on it,
it does the hand-off. A hex-pip rail and the top-bar chapter name show where you are. The page follows the site theme
(all 11); it has no theme control of its own.

No request is redirected to `/m` yet (decision M1): phones get the normal responsive site. Old `/m/*` dashboard links
still redirect to their desktop pages.

## How it works
- **Route.** `src/app/m/page.tsx` is a server component holding the metadata (`robots: { index: false }`,
  `alternates.canonical: "/"`, title and description from `en.mobileLanding`). It renders `HiveLanding`, a client
  component, which still server-renders: the headline is in the initial HTML.
- **Film.** `.hm` (page root) > `.phone` (fixed column, `100dvh`, a framed 430px phone from 500px up) > `main.film`
  (`scroll-snap-type: y mandatory`) > six `section.poster[data-poster]`. `useChapters` watches the posters with an
  IntersectionObserver rooted on the film (ratio 0.55), so the active poster index (`cur`) drives the `on` class, the
  chapter name, the rail and the dock. Arrow / Page keys page through the film while no sheet is open.
- **Styling.** `hive.css` is the winner's stylesheet ported as a stylesheet (the contest promotion rule): every selector
  starts at `.hm`, every keyframe is prefixed `hm-`, so it cannot leak once loaded. Colours come from the site tokens
  through page variables (`--cy`, `--em`, `--glass`, `--line` ...), with one override block for
  `[data-theme^="light"]`. Type is the site's Geist, inherited from the root layout.
- **Motion.** `live(i)` = poster `i` is active, the tab is visible (`usePageVisibility`) and motion is welcome
  (`useStillMotion`). Timed beats (hero idle every 7.2 s, reel auto-advance 4.7 s, Athena capability cycle) run only
  while `live`. Ambient CSS loops run only on the active poster (`--ps`), pause on a hidden tab (`.page-hidden`), and
  `.hm[data-still="true"]` stops every animation and transition. Reduced motion shows each poster's finished frame
  (hero team lit, bill fully drawn). Markup never depends on the motion preference.
- **Hero beat.** `useHeroBeat` drives the ~150 hive cells through the DOM (React renders them once and never touches
  their classes again), as the winner did; the event index is React state.
- **Hand-off.** `useHandoff` uses the shared helpers in `src/components/mobile-landing/shared/handoff.ts`:
  `shareOrCopy` + `browserShareCapabilities()` send `handoffUrl(SITE_URL)` (`/#download-section`); `buildReminderIcs` +
  `nextLocalTime(now, 9)` build the reminder (Dates created in the click handler); macOS / Linux `POST /api/waitlist`
  with `{ email, platform: "macos" | "linux" }`, errors mapped by `waitlistErrorMessage`. There is no email service, so
  nothing offers to email the installer.

## Key files
| File | Role |
| --- | --- |
| `src/app/m/page.tsx` | Server route: metadata (noindex, canonical `/`), renders `HiveLanding` |
| `src/components/mobile-landing/hive/HiveLanding.tsx` | Page root: film, posters, dock, sheets, toast; motion gates |
| `src/components/mobile-landing/hive/hive.css` | The ported stylesheet, scoped `.hm`, keyframes `hm-*` |
| `src/components/mobile-landing/hive/useChapters.ts` | Active poster, jump-to, keyboard paging |
| `src/components/mobile-landing/hive/HiveChrome.tsx` | Top bar (brand, chapter name) and hex-pip rail |
| `src/components/mobile-landing/hive/HeroPoster.tsx`, `useHeroBeat.ts` | Poster 1 and its arrival beat |
| `src/components/mobile-landing/hive/ReelPoster.tsx`, `useReel.ts`, `ToolSheet.tsx` | Poster 2, the reel, the tool-jobs sheet |
| `src/components/mobile-landing/hive/AthenaPoster.tsx` | Poster 3 (satellites, hold to talk, idle video) |
| `src/components/mobile-landing/hive/BillPoster.tsx` | Poster 4, the bill play |
| `src/components/mobile-landing/hive/FaqPoster.tsx` | Poster 5 and the answer sheet |
| `src/components/mobile-landing/hive/HandoffPoster.tsx`, `useHandoff.ts`, `HiveDock.tsx` | Poster 6, the hand-off, the dock button |
| `src/components/mobile-landing/hive/HiveSheet.tsx` | Bottom sheet (drag down, Escape, scrim, focus trap and return) |
| `src/components/mobile-landing/hive/data.ts`, `toolIcons.ts`, `Glyphs.tsx` | Geometry and order, tool marks, the glyph sprite |
| `src/components/mobile-landing/shared/handoff.ts` | Phone-to-computer helpers shared with `/m2` |
| `next.config.ts` | `redirects()`: the four temporary `/m/*` view redirects |
| `e2e/mobile/m-landing.spec.ts` | Phone spec for `/m` (see below) |
| `src/components/primitives/BottomSheet.tsx` | Kept bottom-sheet primitive from the old `/m` (unused; `/m` ports the winner's own sheet) |

## Data & state
- **Copy.** `mobileLanding` in `src/i18n/en.ts`, an English-only pending namespace (listed in `PENDING_TRANSLATION`,
  decision M4). Tool names and jobs come from the translated `useCasesSection`, the answers from `faqSection.questions`,
  platform names from `downloadSection`, waitlist errors from `waitlist`.
- **State** is local React state: active poster, open sheet, reel / Athena / bill state, the hand-off (platform, mode,
  beam). Nothing persists; visitors are anonymous.
- **Art.** Athena's still and idle loop are `public/athena/athena_baseline_640.webp` and `athena_idle_loop.mp4`; the
  brand mark is `public/icons/icon-192.png`. Everything else is inline SVG/CSS, tagged "Stylized illustration".

## Integration points
- **Waitlist API** (`src/app/api/waitlist/route.ts`) for macOS / Linux, the same route the waitlist modal uses.
- **Theme.** The root layout's pre-paint script and theme store set `html[data-theme]`; `/m` only reads it.
- **robots.** `src/app/robots.ts` still disallows `/m/` (the sub-paths); `/m` itself carries `noindex`.
- **Auth.** `AuthProvider` initialises auth for paths starting with `/m` (`src/components/AuthProvider.tsx:12`), but it
  is mounted only by `src/app/dashboard/layout.tsx`, so it is inert on `/m`.
- **Bundle budget.** `/m` has its own ceiling in `bundle-budget.json`.

## Verification
`PLAYWRIGHT_PORT=<free port> npx playwright test --project=mobile` runs `e2e/mobile/**` on the iPhone 13 profile.
`m-landing.spec.ts` asserts: the headline is in the server HTML with `noindex` and canonical `/`; no sideways scroll at
390 and 360px and the dock CTA on screen and uncovered at all six stops; share reaches `navigator.share`, Copy link
reaches the clipboard and a blocked clipboard shows the manual link; the reminder downloads an `.ics` with a VEVENT;
macOS posts `{ email, platform: "macos" }` to the (stubbed) waitlist; the `light` theme applies; reduced motion leaves
no running animation. `baseline.spec.ts` still covers the `/m/reviews` redirect.

## Conventions & gotchas
- **Port fidelity.** `/m` was held to the winner with the contest's style contract (31 roles, 0 deviations at
  390x844), excluding what the owner changed: Geist type (font family everywhere; the wider Geist "$0"), the
  PrimaryCTA look on the dock (flat cyan inside a cyan-blue-purple ring instead of a cyan-to-purple fill), and no purple
  or pink washes or fills (section glows, the persona card, FAQ tiles 2 and 4, the "New lead" / "Build failed" teams
  now use emerald, amber and the info blue; purple stays as rings, strokes and dots).
- **Fixed from the host's pass.** The headline breaks only as "A whole team / on it." (two unbreakable halves), and the
  FAQ tiles cap at a thumb-sized row instead of filling the poster.
- **Keep the scope.** Everything in `hive.css` starts at `.hm` and every keyframe is `hm-*`. A bare selector or an
  unprefixed keyframe (the winner had `pulse` and `spin`) would restyle the rest of the site once `/m` has loaded.
- **The page scrolls inside `main.film`, not the window.** Tests and scripts must scroll the film.
- **`/m` is a route path referenced from outside.** Keep the `/m/*` view redirects until phase 2 replaces them.

## Related docs
- [/m revival plan](../../concepts/mobile-revival/PLAN.md)
- [Dashboard Shell, Chrome & Realtime](../dashboard/shell-chrome.md)
- [Feature index](../INDEX.md)
