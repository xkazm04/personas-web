# /m revival: survey (read-only, 2026-10-06)

Tree: `revamp/stage-fit` @ `1601b63` (includes `fd3853a` landing winners + `55cdbf0` /features winners).
The SPA dashboard is on the unmerged branch `dashboard/spa` (`C:/t/dash-spa`).

---

## 1. Current /m

### Files (14 files, 1087 LOC)

| File | LOC | What it is |
|---|---|---|
| `src/app/m/page.tsx` | 5 | `redirect("/m/overview")` |
| `src/app/m/layout.tsx` | 42 | `"use client"`. `AuthProvider` → `AuthGuard` → `MotionConfig reducedMotion="user"` → `MobileShell` + `MobileTabBar` (`:26-37`) |
| `src/app/m/overview/page.tsx` | 164 | Greeting, a "N running" pill, a 2x2 `MobileStatCard` grid (success %, runs, agents, pending reviews), an alerts banner linking to `/m/alerts`, and the shared `RecentActivityCard` (8 rows) |
| `src/app/m/alerts/page.tsx` | 195 | Drill-in page with four blocks: open incidents (top 6 by severity), a 2-col health-section grid, `HealthIssueRow` list, SLA breach log |
| `src/app/m/messages/page.tsx` | 137 | Thread list (`ThreadRow`), unread count, mark-all-read, and a `MobileThreadSheet` reader |
| `src/app/m/reviews/page.tsx` | 34 | Wraps the desktop `ReviewsFocusFlow` (`:7,31`) |
| `src/components/mobile/MobileShell.tsx` | 21 | `<main id="main-content">`, `max-w-md`, safe-area padding; renders `ViewFullSiteLink` |
| `src/components/mobile/MobileTabBar.tsx` | 108 | 3 tabs (Overview / Reviews / Messages) with badges and a `layoutId` pill. The messages badge is the constant `MOCK_UNREAD_MESSAGES` (`:49`) |
| `src/components/mobile/MobileAppBar.tsx` | 31 | Back chevron + title |
| `src/components/mobile/MobilePageTransition.tsx` | 29 | Pathname-keyed fade/slide; replaces the old `template.tsx` |
| `src/components/mobile/MobileSheet.tsx` | 113 | Bottom sheet: drag-dismiss, Escape, backdrop, `useFocusTrap`, `aria-labelledby`, body-scroll lock |
| `src/components/mobile/MobileThreadSheet.tsx` | 96 | Thread reader built on `MobileSheet` + `MarkdownReport` + `PersonaAvatar` |
| `src/components/mobile/MobileStatCard.tsx` | 70 | Accent stat tile |
| `src/components/mobile/ViewFullSiteLink.tsx` | 42 | Sets the `prefer-full=1` cookie (`:20`), then hard-navigates to `/dashboard` (`:27`) |

### How it is built

- **Approach.** "Approach B" (`layout.tsx:11-14`): a separate route tree that reuses the dashboard's auth, Zustand stores and mock fixtures.
- **Data is demo-only:**
  - Stores: `useExecutionStore`, `usePersonaStore`, `useReviewStore`, `useAuthStore` (`overview/page.tsx:19-23`).
  - Fixtures, imported directly: `MOCK_HEALTH_ISSUES`, `MOCK_AUDIT_INCIDENTS`, `MOCK_HEALTH_CHECKS`, `MOCK_SLA_BREACHES` (`alerts/page.tsx:21-26`), `MOCK_MESSAGE_THREADS` (`messages/page.tsx:9`).
  - Because the fixtures are imported directly, these views stay on mock data even in a live session.
- **i18n is clean.** Every string comes from existing dashboard namespaces (`t.dashboard.*`, `t.incidentsPage`, `t.healthPage`, `t.slaPage`, `t.messagesPage`, `t.observabilityPage`, `t.common`). The only /m-specific key is `t.common.viewFullSite` (`en.ts:123,3287`). There is one smell: `t.messagesPage.unread.toLowerCase()` (`messages/page.tsx:107`).
- **Style debt:**
  - Raw palette classes (`text-cyan-300`, `bg-rose-500/[0.06]`, `bg-[rgba(8,11,20,0.6)]` at `MobileSheet.tsx:59`).
  - `MobileStatCard` and `MobileTabBar` use framer's `useReducedMotion` (`MobileStatCard.tsx:36`, `MobileTabBar.tsx:25`), not `useStillMotion`.
  - The whole tree is client-only; nothing is server-rendered.
- **Stale doc.** `docs/features/platform/mobile-app-shell.md` still describes `m/template.tsx`, and says `MobileSheet` has no focus trap or labelling. Both claims are out of date.

### What breaks or goes stale if /m files are deleted

| Dependent | Anchor | Effect |
|---|---|---|
| `src/proxy.ts` | whole file | Phones keep being redirected to `/m/*`, which would 404 (see section 2) |
| Review-ledger unit test | `src/lib/review-ledger.test.ts:171` walks `src/app/m/reviews` | `readdirSync` throws, so **vitest fails** |
| Review fixtures test | `src/lib/reviewFixtures.test.ts:8,52` | Comments and test name mention `/m/overview`; no failure |
| e2e smoke | `e2e/smoke-routes.ts:94-99,106` (`MOBILE_ROUTES`), `e2e/smoke.spec.ts:173-200` | **Fails** |
| e2e demo | `e2e/dashboard-demo.spec.ts:23-35` (asserts `a[href='/m/reviews']`) | **Fails** |
| Bundle budget | `bundle-budget.json:36-40` (5 `/m*` entries) | `check:bundle` only reports "no longer built" (`scripts/check-bundle-budget.mjs:108,124`); not a failure |
| Storage register | `src/data/storage-register.ts:17,58` | Over-declares `prefer-full`; the test (`storage-register.test.ts`) is one-directional and won't fail. The register's own rule is to update it and bump `POLICY_META.cookies` |
| Cookie-policy copy | `policy-changelog.ts:30`; `en.ts:4339` (intro: "one cookie... prefer-full"); `en.ts:4380` (`cookiePolicy.purposes.fullSite`) | False disclosure; mirrored in 14 locales |
| `t.common.viewFullSite` | `en.ts:123,3287` x14 locales | Orphan key; the only user is `ViewFullSiteLink.tsx:38` |
| Auth | `AuthProvider.tsx:13` (`pathname.startsWith("/m")`) | Harmless; `/m` is gated alongside `/dashboard` |
| robots | `src/app/robots.ts:13` disallows `/m/` | Harmless. Note it if the new /m holds public landing content: it is uncrawlable today |
| Sitemap / metadata | `/m` is not in `sitemap.ts` and has no `metadata` | Nothing to break. A new public /m landing would need a server layout with metadata (CLAUDE.md rule 8) if it is added to the sitemap |
| Context map | `context-map.json:1535-1556` "Mobile App Shell & Views"; `.ai/registry-map.json:6671+` | Update the file lists |
| Docs | `docs/features/platform/mobile-app-shell.md`; `INDEX.md:151`; mentions in `infrastructure/authentication-session.md:2,8,40`, `content/legal.md:41`, `dashboard/shell-chrome.md:66`, `infrastructure/seo-metadata.md:48`, `dashboard/reviews.md`, `dashboard/observability.md`, `infrastructure/orchestrator-client-mocks.md` | Need rewrites |
| Prior concept work | `docs/concepts/moonshots-2026-10-05/8-platform-i18n.md:14-80` | Cards 8.1A (/m as the desktop "remote control" via `pending_commands`) and 8.1B (installable /m + Web Push approvals); relevant direction for the mobile dashboard |

Nothing on the desktop site imports `src/components/mobile/*`. There are also no links from the landing page or navbar to `/m`.

---

## 2. The redirect: `src/proxy.ts` (45 LOC, live)

- **Scope.** Next 16 renamed Middleware to Proxy, so `src/proxy.ts` exporting `proxy()` runs.
- **Matcher:** `["/dashboard", "/dashboard/:path*"]` only (`:43-45`). **The landing page `/` and every marketing route are never redirected.** A phone on `/` gets the desktop landing in normal flow.
- **Cookie check.** `prefer-full=1` short-circuits to `next()` (`:27-29`). It is set only by `ViewFullSiteLink`. Nothing on desktop clears it.
- **UA detection.** `MOBILE_UA = /Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini|Mobile Safari/i` (`:6`). iPadOS reports a Mac UA, so tablets stay on desktop. Android tablets do match "Android".
- **Deep-link map** (`:13-24`). First match wins; the query string is kept (`:35-37`).
  - `/dashboard/messages*` → `/m/messages`
  - `/dashboard/reviews*` → `/m/reviews`
  - `/dashboard/(incidents|health|sla|observability)*` → `/m/alerts`
  - everything else → `/m/overview`
- **Example.** `/dashboard/reviews?id=x` on a phone becomes `/m/reviews?id=x`. Nothing on `/m/reviews` reads `id`.
- **`/demo` on a phone.**
  - `/demo` is not matched, so it renders.
  - It calls `enterDemo()`, then `router.replace("/dashboard/home")` (`src/app/demo/page.tsx:34-35`).
  - That client navigation fetches RSC through the proxy, so the phone should be bounced to `/m/overview`. Expected, not verified in a browser.
- **B-12 history:**
  - `docs/features/FINDINGS.md:86`: B-12 decided "leave dormant until /m is ship-ready" on the false premise that `proxy.ts` never loads. A 2026-10-05 correction notes it **is live**, so the dormant decision never took effect.
  - `FINDINGS.md:217` lists it under Wave 6.
  - `docs/concepts/moonshots-2026-10-05/README.md:295` (N5) records it as an open **owner decision**.
- **On `dashboard/spa`.** `proxy.ts` is unchanged, but the branch retires `/dashboard/agents` and `/dashboard/playground` (307 to `/dashboard/personas` in `next.config.ts`) and makes `personas` the default view. All of these fall through to `/m/overview` on a phone. Personas is documented as desktop-only (min-height 700px, `docs/features/dashboard/personas.md:55` on the branch).

---

## 3. Landing page today (`src/app/page.tsx`)

### Structure

- **Order:** `Navbar` → `LandingHashArrival` → 3 JSON-LD scripts → `PageShell` (ScrollMap) → `#hero` `HiveHero` → 10 `StageSection`s (`page.tsx:44-55`) → `Footer`.
- **Wrapping.** Gated sections sit in `<LazyMount stage minHeight={640}>` (`:96-99`).
- **Weight.** No section uses canvas, three/ogl, d3 or `requestAnimationFrame`. The weight is framer-motion, SVG and CSS 3D.

### Sections (all under `src/components/sections/`)

| # | Section (anchor) | Entry | Message | LOC | Weight | At 375px today | Phone verdict |
|---|---|---|---|---|---|---|---|
| 0 | Hero (`hero`) | `hero-hive/index.tsx` (eager) | "One event in. A whole team on it." A hive of agents on your machine | 551 | CSS 3D honeycomb floor (`hive.module.css:15-25`, 260svh, perspective), 2 SVGs, pointer tilt | Each headline line is `whitespace-nowrap` with a 2.5rem floor (`index.tsx:53-56`). Line 2 is about 420px against roughly 327px, so it likely clips inside the overflow-hidden `HeroShell`; min-h-screen fallback (`hero-hive/shared/HeroShell.tsx:31`) | Portable once the headline is fixed |
| 1 | UseCases (`personas`/`#tools`) | `use-cases/index.tsx` (lazy, ssr:false) | One persona, many capabilities: slot reels deal tools | 845 | framer, about 10 motion sites | 2.5:1 cqw box (`shared/CaseStage.tsx:44`), about 327x131px. Reel labels are nowrap with a 12px floor (`Reel.tsx:83`) and collide | **Needs a phone variant** |
| 2 | PlaygroundSplit (`concepts`/`#playground`) | `playground-split/index.tsx` | "The Agent Mind": parse, plan, execute, with a framer camera rig | 1133 | 19 motion sites, world SVG | Stacks below `lg` (`index.tsx:34`). Stage `min-h-[420px]` (`CameraStage.tsx:47`); 220px nodes with 22px nowrap labels (`WorldNode.tsx:34,66`) | Mostly portable, needs tuning; heavy |
| 3 | GetStarted (`get-started`) | `get-started/index.tsx` | Download to running agents on your Claude plan: 24h day dial | 708 | 1200x640 SVG (`dialGeometry.ts:9-10`), 24 motion sites | Only 1 `md:` class. Text sized by % with px floors overlaps at about 0.27 scale (`shared/ArtBox.tsx:56`). The old `LifecyclePhone` phone version was removed (`docs/features/marketing/get-started.md:76`) | **Needs a phone variant** |
| 4 | OrchestrationHub (`triggers`/`#pipelines`) | `orchestration-hub/index.tsx` | 10 trigger types into one persona hub | 1612 (heaviest) | 66 motion sites, 31 SVG paths | 1 column below `lg` (`index.tsx:46`). Ring `aspect-square max-w-[560px]`; labels `clamp(0.75rem,2.7cqw,…)` (`RingNodes.tsx:69`), crowded | Portable but crowded; simplify |
| 5 | TeamCanvas (`team-canvas`) | `team-canvas/variants/AssemblyLine.tsx` | Goal fans out to personas, returns as one release | 484 | framer | Fixed row: 160px + 4 cols + 160px in `h-[420px]` (`AssemblyLine.tsx:48-121`). Overflows | **Needs a phone variant** |
| 6 | Companion (`companion`) | `companion/index.tsx` | "Meet Athena": always-on orb that remembers | 336 | 1 SVG orb, light | Stacks below `lg` (`:51`); orb `max-w-[360px]` | Portable as is |
| 7 | Vision (`private`/`#vision`) | `vision-grid/index.tsx` (SSR) | Six platform layers under every agent | 760 | fixed-px stack | Already phone-tuned: `h-[570px] [--s:96px]` below `sm` (`index.tsx:82`); labels tight | Portable |
| 8 | Pricing (`pricing`) | `pricing/index.tsx` (SSR) | Free (MIT); only bill is your Claude plan | 405 | SVG bill, 28 motion sites | Real phone art: WIDE from `md:`, TALL below (`index.tsx:47-48`, `billGeometry.ts:5-6,69`) | Portable as is |
| 9 | FAQ (`faq`) | `FAQ.tsx` + `faq/` (SSR) | FAQ + Discord | 249 | accordion | 2 cols from `md:` (`FAQ.tsx:148`). The only `useIsMobile` user (`:89,114`) | Portable as is |
| 10 | DownloadCTA (`download`) | `DownloadCTA.tsx` + `download-cta/` | "Ready to build your agent?" | 357 | light | Stacks below `sm` (`DownloadCTA.tsx:99`). Offers a desktop installer to phones | Layout portable; the call to action needs a phone version (e.g. "send to desktop") |

### Stage-fit and narrow widths

- **Gate.** All one-section-per-viewport logic is in `src/styles/stage.css` behind `@media (min-width:64rem) and (min-height:37.5rem)` (`stage.css:44`). Tailwind gets a matching `stage:` variant (`globals.css:15`).
- **Snap.** `scroll-snap-type: y proximity` (`stage.css:49`) is **desktop-only**. Phones get normal flow with `SectionWrapper` padding `px-4 py-20 sm:px-6 sm:py-28 md:py-36` (`SectionWrapper.tsx:56`).
- **LazyMount.** Off-stage, `LazyMount` reserves only `minHeight=640`, so the page can jump as sections mount.
- **ScrollMap.** `hidden lg:flex` (`ScrollMap.tsx:43`). The landing has **no in-page navigation on phones**: `MobilePageTOC` is only used by `InfoPageLayout.tsx:44`.
- **Navbar and Footer** already work on phones:
  - Navbar slide-in panel: `navbar/MobilePanel.tsx:53`.
  - Footer accordion columns: `sections/Footer.tsx:17-19`.
- **Mobile hook.** The only one is `useIsMobile` (`src/hooks/useIsMobile.ts`, <768px, server snapshot `false`).
- **e2e.** `e2e/tour.spec.ts:204-205` already runs the homepage tour at 375x667.

---

## 4. Shared design system to reuse

### Tokens

- **Source.** `src/styles/tokens.css` is the single source shared with personas-desktop ("do NOT define token values inline", `tokens.css:1-11`).
- **Tailwind bridge** (`globals.css:19-58`): `background`, `foreground`, `surface`, `muted`, `muted-dark`, `brand-{cyan,purple,emerald,amber,rose}`, `glass`, `glass-hover`, `glass-strong`, `status-*`, plus a 4px spacing scale.
- **Contrast.** Muted text tokens are contrast-graded per theme (`tokens.css:20-29`).
- **Utilities:**
  - `.safe-bottom` / `.pb-safe` (`globals.css:97-103`)
  - `.focus-ring` (`globals.css:755`)

### Themes

- 11 themes via `html[data-theme]` (`src/styles/themes.css`): 8 dark and 3 light (`light`, `light-ice`, `light-news`).
- A **random theme on first visit** is picked by the pre-paint script in `src/app/layout.tsx:100-104`.
- A light-theme override layer rewrites `bg-white/N` (`themes.css:316+`).
- **Mobile work must look right in all 11.**

### Typography

- Landing headings: `SectionHeading.tsx:4-5` (`h1 clamp(2.75rem,11vw,5.5rem)`, `h2 clamp(2.25rem,8vw,4.5rem)`), plus stage display sizes `--display-1/2` (`stage.css`).
- `HEADLINE` / `SUBLINE` / `ANNOTATION` / `PANEL` / `SPRING_POP` live in `src/components/athena/stage/athena-tokens.ts:15-40` and are **only imported by /athena**.
- Per-script fonts and line-heights: `src/styles/typography.css`.

### Brand primitives

- `GradientText`, `GlowCard`, `PrimaryCTA`, `HoneycombMark`, `SectionWrapper`, `SectionHeading` (all in `src/components/`).
- `BRAND_COLORS` / `StageColor` in `src/lib/colors.ts`.
- Ease and variants: `EASE_CURVE`, `fadeUp`, `staggerContainer`, `TRANSITION_*` in `src/lib/animations.ts:60-126`.

### Motion gates

- **`useStillMotion`** (`src/hooks/useStillMotion.ts`): SSR-safe and live. Preferred over framer's `useReducedMotion`.
- **`usePageVisibility`** (`src/hooks/usePageVisibility.ts:48`).
- **`useIsVisible`** (`src/hooks/useIsVisible.ts:20`): in-view plus tab visibility.
- **`useLoopGate`** (`src/hooks/useLoopGate.ts:37`): `run` / `tick` / `still` for ambient loops.
- **`QualityProvider`** (`src/contexts/QualityContext.tsx`): adaptive quality tier measured from frame time, mounted in the root layout. Useful for downgrading on low-end phones.
- Lint rule `custom-animation/require-animation-gating`.

### Dashboard design reference

- `.claude/design.md`: semantic tokens (§1), severity palette (§2), typography and page header (§3), card densities `rounded-2xl … p-5` / `rounded-xl … p-3` (§4), pill-switcher (§6).
- Caveat: its §7 still says "use framer `useReducedMotion`" for canvas, which contradicts the newer `useStillMotion` rule in CLAUDE.md.

### Live locales

- Production is **English-only**: `LANGUAGE_SWITCHER_ENABLED` (`src/stores/i18nStore.ts:37-41,104-117`), and the `LanguageSwitcher` renders null in production.
- The rule is still 14 locales hand-translated (CLAUDE.md rule 1, memory). The stage-fit revamp had an owner override: English-only keys go in a named "pending" namespace.

---

## 5. Dashboard today

### Routes on this tree

`src/app/dashboard/*`, page LOC. ★ = mobile-relevant.

| Route | LOC | Data source |
|---|---|---|
| `home` ★ | 213 | Cockpit: vitals console, instruments bay, triage, ticker, `RecentActivityCard`. Stores: auth, execution, persona, review, system |
| `reviews` ★ | 66 | `reviewStore` (`reviews/page.tsx:21`); `ReviewsFocusFlow` |
| `messages` ★ | 220 | `useMessagesData` → `supabaseApi` / `mock-dashboard-data` |
| `incidents` ★ | 118 | `useAuditIncidents` → `mockApi` |
| `health` ★ | 115 | `useSystemHealth` |
| `sla` ★ | 99 | `useSlaData` |
| `observability` ★ | 53 | `lib/api`, `mockApi`, mock data |
| agents | 190 | |
| director | 128 | |
| events | 93 | |
| executions | 181 | |
| knowledge | 168 | |
| leaderboard | 150 | |
| playground | 5 | |
| settings | 157 | |

### Demo and auth gate

- `AuthProvider.tsx:12-19` initialises auth only on `/dashboard` and `/m`.
- `AuthGuard.tsx:37-39` shows a skeleton, an error screen or `SignInPrompt` (with "Try Demo").
- `authStore.ts:70` holds `isDemo`. `enterDemo` is at `:201-208`.
- `lib/api.ts:357-358` routes calls to `mockApi` when `isDemo` is set.
- **Demo is in memory only** (no persist). Any hard navigation drops it, and the user sees the sign-in prompt again. The e2e specs work around this (`smoke.spec.ts:186-193`).

### Existing mobile handling in /dashboard

- Visible only with `prefer-full` set or in a narrow desktop window.
- `DesktopSidebar` is `hidden md:flex` (`DesktopSidebar.tsx:26`).
- `MobileBottomNav` (`md:hidden`, fixed, z-50, `MobileBottomNav.tsx:22`) shows the first 5 of `navItemDefs` plus a "More" menu.
- `main` gets `pb-20`.
- There is no `useMediaQuery` in the dashboard (`docs/features/dashboard/shell-chrome.md:26,69`).

### Branch `dashboard/spa` (2 commits on top of this tree's base)

**`cee0ab7`**:
- One route `src/app/dashboard/[view]/page.tsx` with `generateStaticParams` for 14 views.
- Navigation pieces: `spa/ViewOutlet.tsx`, `spa/navigate.tsx` (pushState), `spa/viewRegistry.tsx` (lazy).
- `<Activity>` keep-alive for the last 4 views. Memory note: never key anything above `ViewOutlet` on the pathname.
- Moves views into `src/components/dashboard/views/<view>/`.
- Adds a two-level `navRegistry.ts` (rail: Personas / Overview / Messages / Director / Settings; Overview grouped Mission / Monitoring / Reliability / Memory).
- Default view is **personas**. Agents is removed. `/dashboard/agents` and `/dashboard/playground` 307 to `/dashboard/personas`.

**`93c322d`**:
- `/dashboard/home` becomes an 8-cell "Mission Control" annunciator wall (`views/home/mission/*`, `?dim=`, responsive grid at `views/home/index.tsx:82`).
- Removes `VitalsConsole`, `InstrumentsBay`, `DashboardGreetingHeader` and others.

**Mobile and open items on the branch:**
- No new mobile work. `MobileBottomNav`'s first 5 become Personas, Mission Control, Reviews, Executions, Events.
- `ReviewsFocusFlow` moves to `src/components/dashboard/views/reviews/ReviewsFocusFlow.tsx`. The `/m/reviews` import is updated on the branch.
- `RecentActivityCard`, `HealthIssueRow`, `ThreadRow`, `MarkdownReport`, `PersonaAvatar` are unchanged. `MOCK_HEALTH_ISSUES` and `MOCK_UNREAD_MESSAGES` survive.
- Still open: budget re-baseline, tour narration re-record, and the e2e run (not listed as verified).

---

## 6. Constraints and risks

- **Route paths.** CLAUDE.md "Out of scope" forbids changing `src/app/` route paths without confirmation. `/m`, `/m/overview`, `/m/reviews`, `/m/messages` and `/m/alerts` are live redirect targets, so phones are sent there today, and the proxy forwards deep links with their query strings. Renaming or removing any of them is a path change.
- **Bundle budget.** `bundle-budget.json:36-40`: `/m` 1301, `/m/alerts` 1318, `/m/messages` 1317, `/m/overview` 1316, `/m/reviews` 1324 KB. The `/` budget is 1067 KB, so the current /m pages carry about 250 KB more than the landing because of the dashboard stores and framer. Any new route needs `check:bundle -- --update` with a reason. A build is required first.
- **Lint ratchet.** `eslint --max-warnings 10` (`package.json:24`).
- **Copy gate.** `copy:check` (native-copy) runs on pre-push. It was red at HEAD from `fd3853a` (`moonshots README:283-285`).
- **e2e.** `smoke.spec.ts:173-200` and `dashboard-demo.spec.ts:23-35` walk /m at 390x844. `scripts/check-route-coverage.mjs` meters coverage from `smoke-routes.ts` paths and `page.goto` targets; it is a meter, not a gate (always exits 0).
- **i18n x14.**
  - All new keys must go into `en.ts` plus 13 locales, hand-translated (CLAUDE.md rule 1; memory "full hand-translation").
  - Locale files have known mojibake. `check:i18n-encoding` guards it; anchor edits on ASCII.
  - `check:i18n-coverage` exists.
  - Precedent: the revamp's owner override allowed English-only keys in a pending namespace.
- **Verification.**
  - The Chrome window on this machine is minimized and `resize_window` does nothing, so **375px can't be checked by hand** (memory: athena preview verification). In a backgrounded tab, framer animation state is unreliable; geometry is trustworthy.
  - `playwright.config.ts` has **only a desktop `chromium` project** (`:35-37`). There is no `devices[...]` mobile project.
  - Specs call `page.setViewportSize` (`smoke.spec.ts:177`, `dashboard-demo.spec.ts:24`, `tour.spec.ts:205`, `stage-fit.spec.ts:49` for desktop sizes only). That sets no mobile UA and no touch, so **`proxy.ts` never fires in e2e**.
  - Testing the redirect needs a project or context using `devices['iPhone 13']` (UA, `isMobile`, `hasTouch`).
- **Dev servers.**
  - Playwright `webServer` uses port 3002, which other projects use; set `PLAYWRIGHT_PORT`.
  - Turbopack fails inside worktrees: use `next dev --webpack` (memory note).
  - On Windows, launch dev servers detached via `Start-Process`.
- **Concurrent sessions.** Sessions share one working tree; commit with `git commit --only -- <paths>`.

---

## Facts that should shape the plan

1. **The proxy never touches `/`.** It matches only `/dashboard*` (`src/proxy.ts:43-45`). A mobile landing at `/m` gets no traffic unless someone links to it or extends the matcher to `/`, and changing the matcher changes what every phone visitor sees. B-12/N5 is still an open owner decision.
2. **/m is live.** Deleting it 404s every phone user who opens a dashboard link. It also breaks `review-ledger.test.ts:171` and two e2e specs, and leaves `prefer-full` and the cookie-policy copy (x14 locales) stale.
3. **The current /m is the dashboard companion.** It is behind `AuthGuard`, client-only, and on in-memory demo data. A public mobile landing under `/m` has different needs: server rendering, metadata, and robots (`/m/` is disallowed today).
4. **Half the landing works on a phone as is.** Companion, Vision, Pricing, FAQ, DownloadCTA and Navbar/Footer already lay out at 375px. UseCases, GetStarted and TeamCanvas need phone versions, the hero headline clips, and OrchestrationHub and PlaygroundSplit are heavy and crowded.
5. **Stage-fit and snap are desktop-only by design.** The `stage:` variant is 64rem by 37.5rem. Phones get normal flow and no in-page navigation.
6. **The mobile dashboard should follow `dashboard/spa`.** Personas becomes the default (desktop-only) view, Mission Control replaces home, and the agents/playground URLs are retired. The proxy's deep-link map (`:13-17`) will need the new view ids. Moonshot cards 8.1A and 8.1B (phone as approval and remote control) are already scoped.
7. **Reuse, don't restate.** Use the tokens from `tokens.css` across all 11 themes, `useStillMotion` / `useLoopGate` / `QualityProvider` for motion, and `MobileSheet` (a sound bottom-sheet primitive worth keeping or porting). The `athena-tokens` type scale is the only shared HEADLINE/SUBLINE vocabulary.
8. **Phone checks have to be built.** By-hand 375px checks are impossible on this machine. Playwright has no mobile device project and never sends a mobile UA, so phone checks need a `devices[...]` project or context added under the existing e2e runner (not a new runner).
