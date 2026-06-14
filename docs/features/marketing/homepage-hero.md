# Homepage & Hero
> The public homepage entry point: animated hero, SVG command-center illustration, live stat row, social proof, and lazy-loaded section orchestration · **Route:** `/` · **Status:** Live

## What it does
`/` is the marketing homepage. Above the fold it shows the **hero**: a headline + subhead built from gradient text, a brand badge, three "differentiator" pills, two CTAs (Download, View on GitHub) plus a guided-tour launcher, and a fine-print reassurance line. On desktop the right side carries a 3D-tilting glass card holding the **command-center illustration** — a 220×220 SVG roadmap-progress ring with a rotating radar sweep, breathing core, orbiting satellite, and the app version in the middle. A 3-up **stat row** (agents / connectors / templates) appears under the card on desktop and in a dedicated card under the CTAs on mobile.

Below the hero, the rest of the page is a sequence of marketing sections (use-cases, why-agents, playground, get-started, orchestration hub, vision, **social proof**, pricing, FAQ, download CTA), each separated by a colored `SectionDivider` and wrapped in a `StageSection` glow. Most are **lazy-loaded** and many are **deferred** until you scroll near them, so the initial bundle and first paint stay light. The page also injects three **JSON-LD** blocks (Organization, SoftwareApplication, FAQPage) for SEO.

## How it works
`src/app/page.tsx` (`Home`, a server component) is the composition root. It wraps everything in a `SectionObserverProvider` seeded with the scroll-map section ids (derived from `SCROLL_MAP_SECTIONS`), renders a decorative ambient `next/image` in the top-left, then `Navbar`, the three JSON-LD `<script>` tags, a `PageShell` (passing `scrollMapItems`), and `Footer`.

Inside `PageShell`: the hero (`<div id="hero"><Hero /></div>`) followed by a `sections` config array (`page.tsx:48`) mapped to `StageSection` + `SectionDivider` pairs. Each entry carries a `glow`, `fromColor`/`toColor` stage gradient, divider colors, an optional `wrapperId` (the scroll-target anchor), and an optional `gate` flag.

**Lazy + gated orchestration.** `lazy.tsx` exports `Lazy*` components built by `createLazySection()` (`LazySection.tsx:40`), a thin wrapper over `next/dynamic` with a `loading` skeleton and an `ssr` flag. The SSR decision tree is documented in `LazySection.tsx:25` — `ssr: true` for above/near-fold crawlable sections (Vision, Pricing, FAQ), `ssr: false` for browser-only / heavy framer-motion subtrees (UseCases, WhyAgents, PlaygroundSplit, GetStarted, OrchestrationHub, DownloadCTA). Separately, the `gate: true` flag in `page.tsx` wraps a section in `LazyMount minHeight={640}`, deferring its actual mount until ~1 viewport away so chunks load on scroll rather than all at once. Custom skeletons (`VisionSkeleton`, `PricingSkeleton`, `FAQSkeleton`) in `lazy.tsx` mirror their live layouts to avoid swap-jump; everything else falls back to `SectionSkeleton`.

**Hero.** `Hero.tsx` is a one-line server shim that renders `HeroClient` (`"use client"`). `HeroClient.tsx` reads copy via `useTranslation()` (`t.hero.*`), pulls counters from `useLiveStats()`, registers the section with `useAnimationPauseRegister` (so it pauses when offscreen via the `data-animate-when-visible` attribute), and drives a framer-motion `staggerContainer`/`fadeUp` entrance. The desktop card uses `useMotionValue`/`useSpring`/`useTransform` for a mouse-tracking 3D tilt; all mouse handlers and the spring style are short-circuited when `useReducedMotion()` is true. `heroStats` is a `useMemo` over `liveStats.totalAgents`, `connectors.length` (the literal `CONNECTOR_COUNT`), and `liveStats.totalTemplates` + "`+`".

**Command-center illustration.** `CommandCenterIllustration.tsx` renders the SVG; all geometry is precomputed in the JSX-free sibling `command-center-geometry.ts`. The ring has one arc segment per roadmap phase (`phases` derived from `completedCount`/`totalPhases` in `@/data/roadmap-phases`), completed segments lit via a gradient + glow filter. `useId()` namespaces all gradient/filter ids (SSR-stable, multi-mount-safe). The radar sweep is an annular sector path (`sweepPath`) rotated continuously; the breathing core, sweep, counter-rotating dashed ring, and orbiting satellite are all gated on `useReducedMotion()` — when reduced, static fallbacks render in their place. Continuous rotations use `spinOrigin` (`transform-box: view-box` + `transform-origin` at center) so rotation centers on the viewBox, not each element's bbox. App version comes from `NEXT_PUBLIC_APP_VERSION` (fallback `"0.1.0"`).

**Stat row.** `HeroStatRow.tsx` is a presentational 3-up row with `mobile`/`desktop` variants (same data, different weight); carries `data-testid="mock-stats"` for e2e.

**JSON-LD.** `homeJsonLd.ts` exports three static objects serialized through `safeJsonLd()` (from `@/lib/seo`) into `<script type="application/ld+json">` tags in `page.tsx:81`.

**Page transition.** `src/app/template.tsx` wraps every route in a framer-motion `pageTransition` (translate-Y enter/exit). It calls `useReducedMotion()` first and returns `children` unwrapped when motion is reduced, so the route tree mounts without the extra div or animation.

## Key files
| File | Role |
| --- | --- |
| `src/app/page.tsx` | Homepage composition root: ambient image, JSON-LD, hero, `sections` config → `StageSection`/`SectionDivider`/`LazyMount` map |
| `src/app/template.tsx` | Per-route framer-motion page transition, reduced-motion-gated |
| `src/app/homeJsonLd.ts` | Static Organization / SoftwareApplication / FAQPage JSON-LD objects |
| `src/components/sections/Hero.tsx` | Server shim rendering `HeroClient` |
| `src/components/sections/HeroClient.tsx` | Hero UI: heading, CTAs, differentiators, 3D-tilt card, stat row; reads `t.hero.*` + `useLiveStats` |
| `src/components/sections/hero/CommandCenterIllustration.tsx` | 220×220 SVG progress-ring diagram, reduced-motion-gated |
| `src/components/sections/hero/command-center-geometry.ts` | Pure geometry/layout constants + `sweepPath`/`polar`/`spinOrigin` for the illustration |
| `src/components/sections/hero/HeroStatRow.tsx` | Presentational 3-up stat row (mobile/desktop variants) |
| `src/components/sections/LazySection.tsx` | `createLazySection()` `next/dynamic` factory + `SectionSkeleton` + pulse constants |
| `src/components/sections/lazy.tsx` | `Lazy*` section exports with per-section SSR flags and custom skeletons |
| `src/components/sections/SocialProof.tsx` | Quote wall + usage stats + trust badges from `testimonials.ts` |
| `src/data/testimonials.ts` | `TESTIMONIALS` / `USAGE_STATS` / `TRUST_BADGES` data consumed by SocialProof |
| `src/components/sections/HeroTransition.tsx` | Pillar/value transition band — **orphaned, not rendered** (see gotchas) |

## Data & state
- **Source:** Hero stats are live-ish — `useLiveStats()` (`src/hooks/useLiveStats.ts`) fetches `/api/stats` once per session (module-level cache) and falls back to `FALLBACK_STATS` (228 users, 42 agents, 120 templates, etc.). `totalUsers` is real waitlist count; `totalAgents`/`totalTemplates` are marketing defaults overridable server-side. Connector count is the static length of `@/data/connectors`. Roadmap progress (`completedCount`/`totalPhases`) drives the ring segments. SocialProof data is fully static in `testimonials.ts`.
- **Stores:** None (Zustand) on the homepage hero path. `SectionObserverProvider` (`@/contexts/SectionObserverContext`) tracks which section is in view for the scroll-map. `useAnimationPause` toggles a `.animations-paused` class on the offscreen hero.
- **API routes:** `GET /api/stats` (via `useLiveStats`); `/api/download` is the Download CTA target when `NEXT_PUBLIC_DOWNLOAD_URL` is set (else `#download`).
- **Types:** `SectionConfig` (`page.tsx:35`), `StageColor` (`@/lib/colors`), `PlatformStatsResponse` (`@/app/api/stats/route`), `Testimonial`/`UsageStat`/`TrustBadge` (`testimonials.ts`).

## Integration points
- **`PageShell` / `Navbar` / `Footer`** — layout chrome wrapping the hero and sections; `scrollMapItems` (from `SCROLL_MAP_SECTIONS`) feed the scroll-map nav. See platform/layout-navigation.
- **`StageSection` + `SectionDivider`** — provide the per-section glow background and the colored gradient seams between sections; colors come from the `sections` config.
- **`LazyMount`** — defers mount of `gate: true` sections; pairs with `createLazySection`'s code-splitting.
- **`useTranslation()` / `@/i18n/en.ts`** — all hero/transition copy (`t.hero.*`, `t.heroTransition.*`); 14-locale lockstep.
- **`useReducedMotion` (framer-motion)** — gates the hero tilt, badge shimmer, scroll-hint, page transition, and every illustration loop.
- **`safeJsonLd` (`@/lib/seo`)** — escapes the JSON-LD payloads. SEO depends on these three blocks staying schema-valid.
- **`TourLauncher`** — guided-tour entry point in the hero CTA row (`tourId="home"`, bridges to `/features?tour=1`).
- **Env:** `NEXT_PUBLIC_DOWNLOAD_URL`, `NEXT_PUBLIC_GITHUB_URL` (fallback `https://github.com/personas-ai`), `NEXT_PUBLIC_APP_VERSION` (fallback `0.1.0`).

## Conventions & gotchas
- **Dead code: `HeroTransition.tsx` is orphaned.** It is fully built and fully translated (`t.heroTransition.*` exists in all locales), but nothing imports or renders it anywhere in `src/` (only docs/changelog/context-map reference it). The live hero→content seam is the `SectionDivider` between the hero and `LazyUseCases`, not this component. Either wire it in or delete it (and its `heroTransition` i18n namespace) — right now it is shipped translation/maintenance cost with zero render path.
- **Hardcoded English in a Live public section — `SocialProof.tsx`.** The heading ("Teams that ship with…"), subhead ("Real teams replacing brittle workflows…"), and all `TESTIMONIALS`/`USAGE_STATS`/`TRUST_BADGES` strings in `testimonials.ts` are raw English, not `useTranslation()` keys. This violates the i18n-lockstep convention for a user-facing section that renders on `/` (it ships as `LazySocialProof`). Non-en locales see English here.
- **Hardcoded English in `HeroClient.tsx`.** `PrimaryCTA … label="Download"` (`HeroClient.tsx:142`) and the fine-print line `No signup, no credit card. Runs on your machine. Zero telemetry.` (`HeroClient.tsx:160`) are literal English, while everything else in the hero correctly uses `t.hero.*`. `t.hero.cta` ("Get Started") and `t.hero.downloadForWindows` exist but aren't used for this button. Flag both for i18n.
- **Token violations (raw colors).** `SocialProof.tsx` / `testimonials.ts` carry inline hex colors (`#06b6d4`, `#a855f7`, …) via `style={{ color }}`, and `HeroClient.tsx` + `CommandCenterIllustration.tsx` use literal `rgba(...)` and `rgba(255,255,255,…)` strokes/shadows instead of semantic tokens. Some are unavoidable for SVG gradient stops, but the testimonial/stat/badge accent colors could live as semantic tokens. `bg-white/2`, `bg-white/3`, `bg-white/[0.02]` opacities are used heavily — fine for surfaces, but watch any text opacities below `/60`.
- **Animation gating is correctly applied** in `HeroClient.tsx`, `CommandCenterIllustration.tsx`, and `template.tsx` (all call `useReducedMotion` and short-circuit loops/transforms). `CommandCenterIllustration` additionally renders static fallbacks for every loop rather than just dropping them. Keep this pattern when extending the illustration.
- **React 19 purity.** No `Math.random`/`Date.now`/`new Date()` in the hero render path; `heroStats` is a proper `useMemo`. The illustration uses `useId()` (not a hardcoded id) for SVG defs to stay SSR-stable and multi-mount-safe — don't simplify it to a string.
- **`spinOrigin` quirk.** SVG continuous rotations require `transform-box: view-box` + a user-unit `transform-origin`; reuse the exported `spinOrigin` constant rather than re-deriving, or rotations will pivot off each element's own bbox.
- **`useLiveStats` is module-cached and warn-once.** It caches the `/api/stats` result at module scope and gates Sentry on a `warnedOnce` flag to avoid flooding under React 19 strict-mode double-effects. The hero renders fallback numbers until the fetch resolves; expect the SSR/first-paint values to be the `FALLBACK_STATS` defaults.
- **JSON-LD is hand-maintained.** `homeJsonLd.ts` hardcodes URLs (`https://personas.ai`), the feature list, and FAQ copy independently of the on-page FAQ section and i18n — keep it in sync manually when product facts change, and re-validate the schema after edits.

## Related docs
- [Why Agents](why-agents.md)
- [Layout, navigation & page shell](../platform/layout-navigation.md)
- [Feature index](../INDEX.md)
