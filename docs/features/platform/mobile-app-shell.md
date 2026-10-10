# Mobile App Shell & Views
> **Phone landing live at `/m`** (not yet linked or redirected to). Plan: [docs/concepts/mobile-revival/PLAN.md](../../concepts/mobile-revival/PLAN.md), survey: [SURVEY.md](../../concepts/mobile-revival/SURVEY.md). · **Route:** `/m` (public, server-rendered, `noindex`, canonical `/`); `/m/overview|reviews|messages|alerts` are temporary redirects; `/m2` is a test landing ("Around the Clock", `noindex`, see [below](#m2-around-the-clock-test-route)) · **Status:** Phase 1 landing promoted 2026-10-06 ("Hive Reels"); phase 2 (mobile dashboard) not started

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
6. **Get it.** "Take it to your computer." A phone beams the link to a computer. Pick the computer: a platform whose
   installer is live (today only Windows, and only when `NEXT_PUBLIC_DOWNLOAD_URL` is set) sends the link through the
   share sheet (or copies it); every other platform joins its waitlist. Anyone can copy the link or download a
   calendar reminder (`.ics`). If neither share nor clipboard is allowed, the link shows for copying by hand.

The dock button is on screen at every stop: before the last poster it jumps there ("Get it on your computer"); on it,
it does the hand-off. A hex-pip rail and the top-bar chapter name show where you are. The page follows the site theme
(all 11); it has no theme control of its own.

No request is redirected to `/m` yet (decision M1): phones get the normal responsive site. Old `/m/*` dashboard links
still redirect to their desktop pages.

## How it works
- **Route.** `src/app/m/page.tsx` is a server component holding the metadata (`robots: { index: false }`,
  `alternates.canonical: "/"`, title and description from `mobileLandingCopy`). It renders `HiveLanding`, a client
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
- **Hand-off machine (shared with `/m2`).** `src/components/mobile-landing/shared/handoffMachine.ts` is the one
  authority: `handoffRoutes(downloadPlan)` maps each platform to `share` (installer live) or `waitlist` from the
  release authority (`DOWNLOAD_PLAN`, `src/lib/release.ts`), never from a platform literal; `reduce(state, event)`
  runs IDLE -> BUSY(token) -> SENT | IDLE(+error | +manual), refuses a submit while BUSY (so Enter cannot post twice)
  and drops any result whose token is not the BUSY one (a platform switch mid-flight cannot land a stale "joined");
  `view(state)` derives the dock mode, the hint key and whether the email field shows. `shared/submitWaitlist.ts` is
  the phones' one `POST /api/waitlist` client: body exactly `{ email, platform }`, injected fetch / timeout / abort
  signal / reporter, codes normalized (`rate_limited`, `store_unavailable`, `timeout`, ...). Both are pure and
  unit-tested (`*.test.ts`).
- **Hand-off (this page).** `useHandoff` runs the machine's effects: `shareOrCopy` + `browserShareCapabilities()` send
  `handoffUrl(SITE_URL)` (`/#download-section`, from `shared/handoff.ts`); a waitlist submit posts through
  `submitWaitlist` (failures to `captureExceptionScrubbed`). The beam lands no sooner than the packet's 1.15 s flight
  on a timer that a platform change or unmount clears, and the machine's token check drops it anyway.
  `buildReminderIcs` + `nextLocalTime(now, 9)` build the reminder (Dates created in the click handler). `HiveDock` and
  `HandoffPoster` render `view()`; the form carries `data-route`. There is no email service, so nothing offers to
  email the installer.

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
| `src/components/mobile-landing/shared/handoff.ts` | Phone-to-computer helpers shared with `/m2` (link, share/copy, `.ics`) |
| `src/components/mobile-landing/shared/handoffMachine.ts` | The hand-off machine: routes from `DOWNLOAD_PLAN`, `reduce`, `view` (`handoffMachine.test.ts`) |
| `src/components/mobile-landing/shared/submitWaitlist.ts` | The phones' `POST /api/waitlist` client (`submitWaitlist.test.ts`) |
| `next.config.ts` | `redirects()`: the four temporary `/m/*` view redirects |
| `e2e/mobile/m-landing.spec.ts` | Phone spec for `/m` (see below) |
| `src/components/primitives/BottomSheet.tsx` | Kept bottom-sheet primitive from the old `/m` (unused; `/m` ports the winner's own sheet) |

## Data & state
- **Copy.** `mobileLandingCopy` in `src/i18n/pending/mobileLanding.ts`, an English-only pending namespace (decision M4;
  kept off the shared en.ts bundle, M22). Tool names and jobs come from the translated `useCasesSection`, the answers from `faqSection.questions`,
  platform names from `downloadSection`, waitlist errors from `waitlist`.
- **State** is local React state: active poster, open sheet, reel / Athena / bill state; the hand-off is one
  `HandoffState` from the shared machine (the beam is derived from its phase). Nothing persists; visitors are anonymous.
- **Art.** Athena's still and idle loop are `public/athena/athena_baseline_640.webp` and `athena_idle_loop.mp4`; the
  brand mark is `public/icons/icon-192.png`. Everything else is inline SVG/CSS, tagged "Stylized illustration".

## Integration points
- **Waitlist API** (`src/app/api/waitlist/route.ts`) for every platform on the `waitlist` route, the same route the
  waitlist modal uses (which still has its own client; moving it onto `submitWaitlist` is a follow-up).
- **Release authority** (`src/lib/release.ts`): `DOWNLOAD_PLAN` decides each platform's route at build time; when
  macOS or Linux gets an installer, both phone pages follow without an edit.
- **Theme.** The root layout's pre-paint script and theme store set `html[data-theme]`; `/m` only reads it.
- **robots.** `src/app/robots.ts` still disallows `/m/` (the sub-paths); `/m` itself carries `noindex`.
- **Auth.** `AuthProvider` initialises auth for paths starting with `/m` (`src/components/AuthProvider.tsx:12`), but it
  is mounted only by `src/app/dashboard/layout.tsx`, so it is inert on `/m`.
- **Bundle budget.** `/m` has its own ceiling in `bundle-budget.json`.

## Verification
`PLAYWRIGHT_PORT=<free port> npx playwright test --project=mobile` runs `e2e/mobile/**` on the iPhone 13 profile.
`m-landing.spec.ts` asserts: the headline is in the server HTML with `noindex` and canonical `/`; no sideways scroll at
390 and 360px and the dock CTA on screen and uncovered at all six stops; share reaches `navigator.share` (skipped
when the build has no live installer: `form[data-route]`), Windows joins its waitlist when it has none, Copy link
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

## /m2: "Around the Clock" (test route)

**What it does.** A second phone landing, on test: the owner liked it more than `/m` and wants to try it on a real
phone first (decision M5). The page is one day. A 24-hour dial under a sky graded by the hour owns the screen, and
scrolling turns it: the 09:00 setup ("Say it once. It works all day."), one persona's tool shifts from 09:30 to 17:00,
Athena as the moon through the night, an all-day $0, a rotary FAQ at 21:00, and "Tomorrow, 9:00, at your computer"
at 23:00. Tapping a bead, job, moment, step or node opens it as its own scene (Back, Escape or a swipe down closes
it). The call to action is always on screen. It saves a real `.ics` reminder for the next 9:00, sends the download
link through the share sheet or the clipboard (a platform whose installer is live), or joins that platform's
waitlist (every other one; Windows too while `NEXT_PUBLIC_DOWNLOAD_URL` is unset). There is no email
service, so nothing offers to email a link. Nothing redirects phones here, and the page is `noindex`.

**How it works.**
- `src/app/m2/page.tsx` is a server component holding the metadata (`robots: { index: false }`). It renders
  `ClockLanding`, a client component, so the whole page (headline included) is in the server HTML.
- **The column scrolls, not the window.** `.col` is a `100dvh` size container; `--u` (the smaller of 1% of its width
  and 0.46% of its height) sizes the dial, the type and the stage together. On screens 500px and wider it becomes a
  phone-sized card on a backdrop. The document never scrolls, so a phone's address bar stays put (a known limit of
  the entry, kept).
- **The engine** (`useClockEngine.ts`) maps the scroller's offset to an hour (`geometry.ts` `buildKeys` / `hourAt`)
  and, in one rAF per scroll, turns the dial, grades the sky, cross-fades the four pinned chapters, places the sun and
  moon, fades the stage out across its unpin (`stageLeave`) and culls dial labels on the lower half or past the edge.
  It writes continuous values straight to the DOM through `data-k` hooks; discrete beats (chapter, tool, job, moment,
  price beat, Athena up, flow) go to React through `onBeat`. It marks the column `data-ready` after its first frame.
- **Motion.** `useStillMotion` makes the story snap between chapters with no tweening and no arrival; `.col[data-still]`
  and a `prefers-reduced-motion` block stop every CSS loop. A hidden tab stops the frame loop (`usePageVisibility`).
  The hero's step loop runs only while the hero holds the stage, motion is allowed, the tab is visible and no card is
  open. Athena's idle loop (`/athena/athena_idle_loop.mp4`) loads only when she first rises and pauses otherwise.
  The arrival (`data-arriving`: the dial rises, the clock counts 05:00 to 09:00) is server-rendered as CSS so it plays
  before hydration; any touch, wheel, key or scroll ends it.
- **The CTA** runs on the same hand-off machine as `/m` (`shared/handoffMachine.ts`, see the `/m` section):
  `useHandoff.ts` owns the selected platform, its route (`Cta` shows share / copy on `share`, the waitlist form on
  `waitlist`; the plats group carries `data-route` and a not-live Windows button reads "Waitlist"), and the waitlist
  submission through `shared/submitWaitlist.ts` (one in flight; Enter cannot re-post; a platform switch aborts it and
  its late result is dropped; failures go to `captureExceptionScrubbed`). `Waitlist.tsx` is presentational and maps
  error codes to the translated `t.waitlist` labels. Share and copy use `shareOrCopy` with the browser's
  capabilities (plus the textarea copy fallback from `waitlistUtils`); `buildReminderIcs` + `nextLocalTime` make a
  15-minute event at the next 9:00 (Dates made in the click), with a manual-copy fallback when share and copy both
  fail.

**Owner adjustments over the contest entry.** Geist Sans / Geist Mono instead of the entry's serif display and system
faces (the accent lines take `GradientText`); every colour through the site tokens, so all 11 themes repaint it (the
sky is `color-mix` over `--background`, `--primary`, `--brand-cyan` and `--brand-amber`); no purple or pink fills (the
dawn and dusk sky grade through amber, the CTA fills are `PrimaryCTA`, Athena's active chip is a purple ring, GitHub
and Stripe tint with their second brand colour); the entry's own theme toggle is gone and the footer carries the
site's `ThemeSwitcher`.

**Fixes over the entry (host pass).** Only the current tool shift keeps its time label on the ring (seven crowded the
hub at 390px); the header chip steps out of the way in the FAQ and CTA; the stage fades out across its unpin so
"Free." and the dial no longer stack over the FAQ, whose 21:00 the dial now agrees with (`FAQ_HOUR`, `CTA_HOUR`).

| File | Role |
| --- | --- |
| `src/app/m2/page.tsx` | Server page, metadata (`noindex`) |
| `src/components/mobile-landing/clock/ClockLanding.tsx` | Composition, beat state, cards, toast, hero step loop |
| `src/components/mobile-landing/clock/useClockEngine.ts` | Scroll engine (rAF, gated) |
| `src/components/mobile-landing/clock/geometry.ts` | Pure timeline, sky and cull math (`geometry.test.ts`) |
| `src/components/mobile-landing/clock/art.ts`, `data.ts`, `tool-paths.ts` | Dial geometry, the stylized day's times, tool marks |
| `src/components/mobile-landing/clock/{Sky,Dial,DialFace,DialFixed,StageHud,Lens}.tsx` | The art |
| `src/components/mobile-landing/clock/{HeroChapter,ToolsChapter,NightChapters,Faq,Cta,Waitlist,Chrome,CardLayer,cards}.tsx` | Chapters, chrome and scenes |
| `src/components/mobile-landing/clock/useHandoff.ts` | Share / copy / reminder; the hand-off machine and waitlist submit |
| `src/components/mobile-landing/clock/clock.module.css` | The entry's stylesheet, ported (tokens, Geist, data-attribute state) |
| `e2e/mobile/m2-landing.spec.ts` | Phone spec: SSR headline, no sideways scroll at 390/360, CTA at every stop, every CTA action, the story's taps, light theme, reduced motion |

**Gotchas.**
- Copy lives in the English-only pending namespace `mobileLanding2` (M4), `src/i18n/pending/mobileLanding2.ts` (M22); translate it before launch.
- The engine finds its parts by `data-k`; renaming one silently disconnects it. The e2e spec waits on `[data-ready]`.
- The day, its times and its runs are a stylized illustration (tagged "Stylized day"); Athena's portrait and loop are
  the only real product images.
- Waitlist analytics (`trackWaitlistSubmit`) are not wired: `WaitlistEntryPoint` has no `/m2` member yet.
- While no installer is live, Windows has no share / copy buttons on `/m2` (the link is still printed under the form);
  the e2e share / copy specs skip in such a build. Other `/m2` copy (e.g. the hero's "A free installer for Windows,
  about 12 MB") is not plan-aware yet.

## Related docs
- [/m revival plan](../../concepts/mobile-revival/PLAN.md)
- [Dashboard Shell, Chrome & Realtime](../dashboard/shell-chrome.md)
- [Feature index](../INDEX.md)
