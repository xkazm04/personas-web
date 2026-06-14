# Layout, Navigation & Page Shell
> The global app frame — root layout providers, navbar, page/section shells, cookie consent, and the error/loading/not-found boundaries that wrap every route · **Route:** global (root layout) · **Status:** Live

## What it does
This is the chrome that surrounds **every** page on the marketing site. It provides:

- A **root HTML document** (`src/app/layout.tsx`) with site-wide `<head>` metadata (SEO, Open Graph, Twitter), the Geist fonts, a pre-paint theme/locale script, the Noto CJK/RTL/Indic web fonts, a "Skip to main content" link, and the always-mounted `CookieConsent` banner.
- A **sticky navbar** (`Navbar`) — Personas logo, a desktop pill tab bar of the three public routes (Home / Features / Roadmap), a dashboard link + Download CTA, and a slide-in mobile panel with backdrop, focus trap, scroll lock, and Escape-to-close.
- **Page shells** that content pages compose: `PageShell` (scroll-spy + particle/animation hosts + tour provider) and `InfoPageLayout` (navbar + `PageShell` + breadcrumb + mobile TOC + footer in one wrapper).
- **Section primitives** reused across pages: `SectionWrapper` (one-shot scroll reveal), `SectionHeading`, `SectionDivider`, `StageSection`, plus the sticky `SectionBreadcrumb` (desktop) and `MobilePageTOC` (mobile) in-page navigators.
- **Failure & transition chrome**: `error.tsx` (per-route crash, keeps the navbar), `global-error.tsx` (root crash, renders its own `<html>`), `loading.tsx` (route-segment spinner), and `not-found.tsx` (404 with popular-page grid).

## How it works
**Root layout** — `layout.tsx` renders `<html lang="en" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>`. An inline, import-free `<head>` script (`layout.tsx:98`) runs **before** body paint: it reads the persisted `personas-theme` from `localStorage`, picks a random theme if none is set, applies `data-theme` / the `dark` class, and sets `lang`/`data-lang` — preventing a flash of the wrong theme. The body wraps children in `QualityProvider` (with `PageViewTracker`), preceded by a `ThemeInit` client component (idempotent `initRandomTheme()` via a `useRef` guard) and the skip-link; `CookieConsent` is mounted last, outside the provider.

**Navbar** — `Navbar.tsx` is a `motion.header` that toggles a blurred-glass background once `scrollY > 40` (via `useScroll` + `useMotionValueEvent`). It delegates to `DesktopNav` (the `lg:flex` pill bar + dashboard/download cluster) and `MobilePanel` (the `lg:hidden` slide-in), sharing open/close state through `useMobileMenu`. The hamburger button toggles `mobileOpen` and exposes `aria-expanded`. A `DownloadModal` is opened by both navs.

**Routes** — `useRoutes()` returns the three public routes with i18n labels (`t.nav.home/features/roadmap`). Both `DesktopNav` and `MobilePanel` consume it and mark the active tab via `usePathname()` exact match. `DesktopNav` also preloads the `/how` hero image on hover.

**Mobile menu lifecycle** — `useMobileMenu(panelRef)` owns: Escape-to-close, a manual Tab focus trap (first/last focusable wrap), body scroll lock via the counted `lockBodyScroll`/`unlockBodyScroll`, route-change auto-close (`queueMicrotask` + `usePathname` effect), and focus restoration. It snapshots the focus owner on open, auto-focuses the first link, and on close restores focus to the trigger **only** for user-initiated closes (Escape/backdrop/X) — a `closeReasonRef` of `"route"` skips restoration so the freshly-mounted page keeps the cursor (WAI-ARIA dialog requirement).

**Page shells** — `PageShell` wraps page content in `SectionObserverProvider` (scroll-spy over the section ids derived from `scrollMapItems`) and `TourProvider`, mounting `AnimationPauseObserver`, `ParticleHost`, `ScrollMap`, and `TourOverlay` around a single `<main id="main-content">`. `InfoPageLayout` composes `Navbar` + `PageShell` + an optional `SectionBreadcrumb`, `MobilePageTOC`, a fixed-navbar spacer, an optional `TourLauncher`, and `Footer`.

**Section reveal** — `SectionWrapper` is a `motion.section` with `initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}` and the `staggerContainer` variants (`staggerChildren: 0.12`, `delayChildren: 0.1`). It registers itself with the animation-pause observer and merges a forwarded ref. `StageSection` is a non-animated wrapper that paints glow/top-line/gradient edges; `SectionDivider` draws a CSS scroll-timeline (`animation-timeline: view()`) SVG wave; `SectionHeading` is a server component with `clamp()` responsive type.

**In-page nav** — `SectionBreadcrumb` (`hidden md:block`, fixed at `top-[60px]`) shows the breadcrumb trail + a `scrollYProgress`-driven progress bar and reads the active section from `useActiveSectionId()`. `MobilePageTOC` (`md:hidden`) is the mobile equivalent: a collapsible "On this page" dropdown that smooth-scrolls to section ids, with its own Escape handler and scroll lock.

**Cookie consent** — `CookieConsent` reads `COOKIE_CONSENT_KEY` from `localStorage`; if unset it animates a bottom banner in (`queueMicrotask` to avoid a hydration-mismatch flash). Choosing "Accept All" persists `"all"` and calls `flushAnalyticsQueue()`; "Essential Only" / close persists `"essential"`. All storage access is try/caught — an unreadable store is treated as already-consented so a `SecurityError` (Safari Private, locked-down webviews) can't white-screen the app.

**Boundaries** — `error.tsx` (`"use client"`) catches per-route crashes, keeps `Navbar` + `Footer`, captures to Sentry via raw `Sentry.captureException`, shows `error.message` only in dev, and offers a copyable `digest` + Retry/Home. `global-error.tsx` catches root-layout crashes, renders its **own** `<html lang="en">` + `<body>` (no navbar), and routes through `captureExceptionScrubbed` (PII scrub) plus an optional "View status" link. `loading.tsx` is a minimal `role="status"` spinner shown during segment streaming. `not-found.tsx` renders the 404 with a popular-pages grid (navbar + footer).

## Key files
| File | Role |
| --- | --- |
| `src/app/layout.tsx` | Root HTML document — metadata/viewport, pre-paint theme+lang script, fonts, skip-link, providers, `CookieConsent` |
| `src/app/error.tsx` | Per-route error boundary — keeps navbar/footer, raw Sentry capture, dev-only message, copyable digest |
| `src/app/global-error.tsx` | Root error boundary — renders own `<html>`, scrubbed Sentry capture, status link |
| `src/app/loading.tsx` | Route-segment loading spinner (`role="status"`) |
| `src/app/not-found.tsx` | 404 page — popular-pages grid, navbar + footer |
| `src/components/Navbar.tsx` | Sticky header — scroll-glass, delegates to `DesktopNav`/`MobilePanel`, owns download modal state |
| `src/components/navbar/DesktopNav.tsx` | Desktop pill tab bar + dashboard link + Download CTA (`lg:flex`); `/how` hover preload |
| `src/components/navbar/MobilePanel.tsx` | Slide-in mobile panel (`role="dialog" aria-modal`), backdrop, route links, download |
| `src/components/navbar/useMobileMenu.ts` | Mobile menu logic — open state, Escape, focus trap, scroll lock, route auto-close, focus restore |
| `src/components/navbar/useRoutes.ts` | The three public routes (Home/Features/Roadmap) with i18n labels |
| `src/components/NavbarLogoGlyph.tsx` | Logo variant A — icon-forward, pulse ring, scroll-collapse to "P" |
| `src/components/NavbarLogoWordmark.tsx` | Logo variant B — animated SVG-style wordmark + scan line |
| `src/components/NavbarMobileMenu.tsx` | Alternate mobile menu (auth-aware: sign-in/dashboard); not wired into `Navbar` |
| `src/components/PageShell.tsx` | Scroll-spy + particle/animation hosts + tour providers around `<main>` |
| `src/components/InfoPageLayout.tsx` | Full info-page wrapper — navbar + `PageShell` + breadcrumb + TOC + footer |
| `src/components/SectionWrapper.tsx` | One-shot `whileInView` reveal section (`staggerContainer`), pause-observer registered |
| `src/components/StageSection.tsx` | Non-animated section with glow/top-line/gradient edges |
| `src/components/SectionDivider.tsx` | CSS scroll-timeline SVG wave divider |
| `src/components/SectionHeading.tsx` | Responsive `clamp()` h1/h2 (server component) |
| `src/components/SectionBreadcrumb.tsx` | Desktop sticky breadcrumb + scroll-progress bar (`hidden md:block`) |
| `src/components/MobilePageTOC.tsx` | Mobile "On this page" dropdown (`md:hidden`), smooth-scroll, scroll lock |
| `src/components/CookieConsent.tsx` | Bottom consent banner — `localStorage`-guarded, analytics flush on Accept All |
| `src/lib/bodyScrollLock.ts` | Counted body scroll lock (state on `globalThis` to survive HMR) |
| `src/components/ThemeInit.tsx` | Idempotent client theme init (`initRandomTheme()`) |

## Data & state
- **Source:** Static/client — no mock or live API. Route list is the hardcoded `useRoutes()` array; SEO constants come from `src/lib/seo.ts` (`SITE_URL`, `SITE_NAME`, `BG_NEAR_BLACK`, `SITE_STATUS_URL`, …). Consent + theme persist in `localStorage` (`COOKIE_CONSENT_KEY` from `src/lib/constants.ts`, `personas-theme` from the theme store).
- **Stores:** `QualityProvider` (`src/contexts/QualityContext`), `SectionObserverProvider` / `useActiveSectionId` (`src/contexts/SectionObserverContext`), `TourProvider` (`src/contexts/TourContext`), theme store (`src/stores/themeStore` → `initRandomTheme`). Navbar uses local `useState` only.
- **API routes:** None owned by this feature.
- **Types:** `ScrollMapItem` (`src/lib/types.ts`), `NavRoute` (`useRoutes.ts`), `BridgeKey`/`TourId` (tour modules), `BreadcrumbItem` (local to `SectionBreadcrumb`/`InfoPageLayout`), `StageColor` (`src/lib/colors.ts`), `Metadata`/`Viewport` (`next`).

## Integration points
- **Depends on:** `useTranslation()` for all nav labels; `framer-motion` (`useScroll`, `useMotionValueEvent`, `AnimatePresence`, `staggerContainer` from `src/lib/animations.ts`); `lockBodyScroll`/`unlockBodyScroll`; Sentry + `captureExceptionScrubbed` (`src/lib/sentry-pii.ts`); `src/lib/seo.ts`; `flushAnalyticsQueue` (`src/lib/analytics.ts`); the theme store; section-observer / tour / quality contexts.
- **Depended on by:** Every public page sits inside the root layout. Content pages compose `InfoPageLayout` or `PageShell` and fill them with `SectionWrapper`/`StageSection` sections, supplying `scrollMapItems` (drives both `SectionObserverProvider` ids and the breadcrumb/TOC). `Navbar` + `Footer` are also re-rendered standalone by `error.tsx` and `not-found.tsx`. `SectionWrapper`'s reveal is the contract every animated child sits inside (see gotcha below).

## Conventions & gotchas
- **`<html lang>` is hardcoded to `"en"`.** The static attribute in `layout.tsx:90`, the inline pre-paint script (`el.setAttribute('lang','en')`), **and** `global-error.tsx:42` all force `en`, despite the 14-locale i18n bundle. Screen readers announce every locale as English. The site is otherwise fully translated — this is a real a11y gap, not a no-translations situation. Changing it requires the active locale at render/SSR time (locale isn't a route segment here), so treat it as a known limitation, not a quick fix.
- **Two mobile-menu implementations exist; only one is wired up.** `Navbar` uses `MobilePanel` + `useMobileMenu` (the one with focus trap + scroll lock + focus restore). `NavbarMobileMenu.tsx` is a separate, auth-aware (`signInWithGoogle`, dashboard link) component that is **not** imported by `Navbar` — and it has **no focus trap and no scroll lock**. Don't assume edits to one affect the other; prefer the `MobilePanel`/`useMobileMenu` path.
- **Focus trap is manual and snapshot-based.** `useMobileMenu` recomputes the focusable list on every Tab and only wraps at the first/last element; elements that mount/unmount mid-open aren't re-snapshotted. Focus is restored to the trigger only for `"user"` closes — `"route"` closes intentionally skip it so the new page keeps the cursor.
- **Scroll lock is counted and shared.** `MobilePanel`/`useMobileMenu`, `MobilePageTOC`, and modals all call the same `lockBodyScroll`/`unlockBodyScroll`; state lives on `globalThis` so HMR doesn't freeze the page. Always pair every lock with an unlock in the effect cleanup — an orphaned lock leaves `body.style.overflow: hidden`.
- **`SectionWrapper` is a one-shot reveal — beware late-mounted children.** It uses `whileInView` + `viewport={{ once: true }}` and the `staggerContainer` variants. Children that subscribe to the parent's `hidden`/`visible` variant but mount **after** the one-shot reveal has already fired (e.g. lazy/conditional content, late-hydrating cards) stay stuck on `hidden` and never appear. The fix is to self-drive the child's own `whileInView` (the `AreaCardShell` pattern) rather than inheriting the parent variant. Don't add variant-driven children to an already-revealed `SectionWrapper`.
- **`StageSection` and `SectionHeading` are server components (no `"use client"`)** and intentionally un-animated — use them when a section shouldn't carry reveal motion. `SectionDivider` animates via a pure CSS `view()` scroll timeline (no JS, no rAF), so it needs no reduced-motion gating.
- **Boundary animations are not reduced-motion gated in JS** but rely on the global `prefers-reduced-motion` rule in `globals.css` (the breathing-glow/aura in `error.tsx`/`global-error.tsx` is suppressed there). The navbar header slide-in and logo pulses animate unconditionally — framer-only motion isn't caught by the `require-animation-gating` lint rule, so treat these as accessibility considerations, not lint-clean guarantees.
- **`error.tsx` vs `global-error.tsx` Sentry paths differ.** Per-route `error.tsx` calls raw `Sentry.captureException(error)`; `global-error.tsx` calls `captureExceptionScrubbed` (PII scrub) because top-level errors carry the leakiest payloads. Keep new boundary captures on the scrubbed path per the CLAUDE.md Sentry-PII rule. Both hide `error.message` outside dev to avoid leaking paths/env names.
- **Several boundary/404/consent strings are hardcoded English, not i18n.** `error.tsx`, `global-error.tsx`, `loading.tsx`, `not-found.tsx`, `NavbarMobileMenu.tsx`, and `CookieConsent.tsx` contain literal copy (and English `aria-label`s like "Close menu", "Copy error reference"). This violates the CLAUDE.md i18n mandate; flag before translating inline (boundaries render before/around the i18n provider, which is part of why they're hardcoded — `error`/`global-error` cannot assume the provider mounted).
- **Pre-paint theme script must stay import-free and in sync.** The inline `<head>` script duplicates the theme id list and lang logic from the theme store; it has no module imports by design (so it can run before hydration). Keep its theme array in lockstep with `themeStore`, and keep `global-error.tsx`'s `BG_NEAR_BLACK` matching the PWA manifest `background_color`.

## Related docs
- [Animation & Motion System](animation-motion.md)
- [Theme System](theme-system.md)
- [Feature index](../INDEX.md)
