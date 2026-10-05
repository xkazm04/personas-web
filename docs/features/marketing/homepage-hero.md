# Homepage & Hero
> The public homepage entry point: the "Hive" hero (honeycomb floor of agents) and the lazy-loaded section orchestration beneath it · **Route:** `/` · **Status:** Live

## What it does
`/` is the marketing homepage. Above the fold is the **Hive** hero: a centred poster headline, "One event in. **A whole team on it.**", with a one-line subhead and three calls to action (Download, View on GitHub, and the guided-tour launcher). The lower half of the viewport is a honeycomb floor of AI agents seen in perspective, stretching to a lit horizon. Events ("Invoice in", "New lead", "Build failed") fall onto it as drops of light, ripple out, and hand off cell to cell along a team until the finished work rises as a light pillar ("Booked", "Qualified", "Fixed"). A slow light sweeps the floor, idle cells twinkle, and the pointer tilts the whole hive. There is no stat row, version badge or illustration card any more.

Below the hero, the rest of the page is a sequence of marketing sections (use-cases, playground, get-started, orchestration hub, team canvas, companion, vision, pricing, FAQ, download CTA), each wrapped in a `StageSection` glow whose from/to gradients carry the colour hand-off. On desktop every section is one viewport high (the stage system, `src/styles/stage.css`) and the page snaps between them with `scroll-snap-type: y proximity`. Most are **lazy-loaded** and many **deferred** until you scroll near them. The page also injects three **JSON-LD** blocks (Organization, SoftwareApplication, FAQPage) for SEO.

## How it works
`src/app/page.tsx` (`Home`, a server component) is the composition root: `Navbar`, `LandingHashArrival`, the three JSON-LD `<script>` tags (`page.tsx:79-87`), a `PageShell` (passing `scrollMapItems` from `SCROLL_MAP_SECTIONS`; `PageShell` mounts the one `SectionObserverProvider`, see the comment at `page.tsx:69`), and `Footer`. Inside `PageShell`: `<div id="hero"><HiveHero /></div>` (`page.tsx:90`), then the `sections` array (`page.tsx:44`) mapped to `StageSection` wrappers. Each entry carries `glow`, `fromColor`/`toColor`, an optional `wrapperId` (external anchor), an `anchorId` (emitted as `data-scroll-anchor` so the scroll map can reach a not-yet-mounted section) and an optional `gate`. A dev-only drift guard (`page.tsx:57`) warns when a scroll-map id has no anchor; `hero` is covered by the always-present `#hero` div.

**Lazy + gated orchestration.** `lazy.tsx` exports `Lazy*` components built by `createLazySection()` (`LazySection.tsx:40`), a thin `next/dynamic` wrapper with a skeleton and an `ssr` flag: `ssr: true` for crawlable sections (Vision, Pricing, FAQ), `ssr: false` for browser-only motion subtrees (UseCases, PlaygroundSplit, GetStarted, OrchestrationHub, TeamCanvas, Companion, DownloadCTA). `gate: true` wraps a section in `LazyMount stage minHeight={640}`, deferring its mount until ~1 viewport away. Skeletons and the `LazyMount` placeholder carry `data-lazy-placeholder`, so on the desktop stage they reserve one stage height (`stage.css`) and nothing shifts on mount.

**Hero (`src/components/sections/hero-hive/`).** `index.tsx` (`HiveHero`, `"use client"`) reads `t.landingSections.hero` (`line1`, `line2`, `sub`, `aria`, `events[]`, `done[]`) and wraps everything in `HeroShell`. `HeroShell` (`shared/HeroShell.tsx`) renders the `<section>` with `data-stage-hero` (exactly `100svh` under the navbar on the desktop stage, `stage.css:117`) and `data-animate-when-visible`, registered through `useAnimationPauseRegister`, so the pause registry toggles `.animations-paused` when it is off-screen; `suppressHydrationWarning` covers that post-hydration class change. The scene is a `role="img"` div (`aria-label` = `copy.aria`) holding `HiveFloor`; a gradient overlay adds the horizon glow and the fog that owns the headline's sky. Pointer movement sets a `--tilt` CSS variable on the scene (skipped when `useStillMotion()`); `usePageVisibility()` is called so the hidden-tab class toggle is loaded.

**The floor (`HiveFloor.tsx`, `hive-geometry.ts`, `hive.module.css`).** Pure CSS-driven; markup never depends on motion. `hive-geometry.ts` holds the plane's units (`VB_W` x `VB_H`, pointy-top hexes, odd-row offset), `LATTICE_PATH` (every outline as one static `<path>`), `SCENARIOS` (three teams: start offset, hue, six neighbouring cells; a 9s `CYCLE_S`, `STEP_S` 0.36s per hand-off) and `TWINKLES`. `HiveFloor` renders the lattice, a glow, a sweep track, the per-team cells/halos/link polyline (each with an `animationDelay` into the cycle), and HTML that stands up out of the plane: the falling `drop` + event chip at the first cell, the `beam` + done chip (with a `Check` icon) at the last. All loops are in `hive.module.css` on transform/opacity; the perspective (`.scene`, `--horizon: 47%`) lives there too. The floor is `aria-hidden` apart from the scene's `aria-label`.

**Reduced motion** is a composed still frame in `hive.module.css` (`@media (prefers-reduced-motion: reduce)`, line 234): loops off, all three teams caught mid-work with both chips visible.

**CTAs (`shared/HeroCtas.tsx`).** Download (`PrimaryCTA`, href `ctaHref(DOWNLOAD_PLAN)`, click reports `trackDownloadClick(DOWNLOAD_PLAN, "hero", detectPlatformKey())`), View on GitHub, and `<TourLauncher tourId="home" bridgeHref="/features?tour=1" intro />`. The home hero renders it `align="center" trust={false}` (the trust line, `t.hero.trustLine`, is off). Labels are `t.hero.downloadCta` / `t.hero.viewOnGithub`.

**JSON-LD.** `homeJsonLd.ts` exports three static objects serialized through `safeJsonLd()` (`@/lib/seo`).

## Key files
| File | Role |
| --- | --- |
| `src/app/page.tsx` | Composition root: JSON-LD, `#hero` + `HiveHero`, `sections` config to `StageSection`/`LazyMount` |
| `src/app/homeJsonLd.ts` | Static Organization / SoftwareApplication / FAQPage JSON-LD |
| `src/components/sections/hero-hive/index.tsx` | `HiveHero`: headline, subhead, CTAs, pointer tilt, scene wrapper |
| `src/components/sections/hero-hive/HiveFloor.tsx` | The honeycomb: lattice, team cells and links, falling events, rising work |
| `src/components/sections/hero-hive/hive-geometry.ts` | Plane units, `LATTICE_PATH`, `SCENARIOS`, `TWINKLES`, `cellCenter`/`hexPoints`/`pct` |
| `src/components/sections/hero-hive/hive.module.css` | Perspective, every keyframe loop, off-screen/hidden pausing, reduced-motion still |
| `src/components/sections/hero-hive/shared/HeroShell.tsx` | `data-stage-hero` section + pause-registry registration |
| `src/components/sections/hero-hive/shared/HeroCtas.tsx` | Download / GitHub / tour launcher (placement `"hero"`) |
| `src/styles/stage.css` | `[data-stage-hero]` and `[data-lazy-placeholder]` rules |
| `src/components/sections/LazySection.tsx`, `lazy.tsx` | `createLazySection()` factory, `Lazy*` exports, custom skeletons |

## Data & state
- **Copy:** `t.landingSections.hero.*` (headline, subhead, aria, event/done chips) plus `t.hero.downloadCta` / `viewOnGithub` / `trustLine`. `landingSections` is in `PENDING_TRANSLATION` (`src/i18n/en.ts`): English only, the 13 other locales fall back at runtime.
- **No data fetch, no stores.** The hero shows no live numbers. (The unused `/api/stats` route and `useLiveStats` hook were deleted on 2026-10-05; the waitlist count comes from `/api/waitlist` via `waitlistCounts.ts`.)
- **State:** `SectionObserverContext` tracks the section in view for the scroll map; the only hero state is the `--tilt` CSS variable.
- **Download CTA:** `ctaHref(DOWNLOAD_PLAN)` from `src/lib/release.ts`; tracked as `download_click` with `{ platform, placement: "hero", outcome }`.

## Integration points
- **`PageShell` / `Navbar` / `Footer`** and the scroll map (`SCROLL_MAP_SECTIONS` in `src/lib/constants.ts`, id `hero`). See platform/layout-navigation.
- **`StageSection` / stage fit** — `SectionWrapper fit` sets `data-stage`; `stage.css` sizes sections to `100svh - --nav-h`; `e2e/stage-fit.spec.ts` measures it.
- **`useAnimationPause` registry** — pauses the hero's CSS loops off-screen via `.animations-paused` (`globals.css:779`).
- **`TourLauncher`** — `tourId="home"`, bridges to `/features?tour=1`.
- **`HeroCtas` is mirrored** by `feature-sections/murmuration-hero/shared/HeroCtas.tsx` for `/features` (see features-overview); `release.test.ts` source-scans `hero-hive/shared/HeroCtas.tsx` so it cannot read `NEXT_PUBLIC_DOWNLOAD_URL` itself.
- **Env:** `NEXT_PUBLIC_GITHUB_URL` (fallback `https://github.com/personas-ai`) read in `HeroCtas`; the download URL only via `src/lib/release.ts`.

## Conventions & gotchas
- **Replaced on 2026-10-05** by the winner of the landing review ("Hive"). The previous hero (`HeroClient`, command-center illustration, stat row, ambient illustration, 3D-tilt card) is in git history.
- **`FloatingParticles.tsx` is now unreferenced** (nothing imports it); treat it as dead until reused.
- **Gate props, never markup.** The floor's DOM is constant; reduced motion is handled in CSS only. Keep `HeroShell`'s `suppressHydrationWarning` (the pause registry toggles a class after hydration). `e2e/reduced-motion-hydration.spec.ts` asserts `/` hydrates cleanly.
- **Loops are CSS**, so the pause registry (`.animations-paused`) and the hidden-tab class are what stop them; there is no JS rAF here.
- **English-only copy:** the hero strings are in `landingSections.hero`, untranslated until that namespace leaves `PENDING_TRANSLATION`.
- **JSON-LD is hand-maintained.** `homeJsonLd.ts` hardcodes URLs and FAQ copy independently of the on-page FAQ; keep in sync and re-validate after edits.

## Related docs
- [Why Agents](why-agents.md)
- [Features overview](features-overview.md)
- [Layout, navigation & page shell](../platform/layout-navigation.md)
- [Feature index](../INDEX.md)
