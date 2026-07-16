# Layout, Navigation & Page Shell — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Inline head theme script hardcodes the theme allowlist — an unknown persisted theme gets silently clobbered with a random one
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: duplicated-config-drift
- **File**: `src/app/layout.tsx:103`
- **Scenario**: The pre-paint `<head>` script embeds its own theme-ID array `T=['dark-midnight',...,'light-news']`, duplicating the canonical list that lives in the theme store (`personas-theme` zustand persist). A developer adds a new theme (e.g. `dark-ember`) to the store/theme registry but forgets this string-literal script. Any user who picks the new theme gets it rejected on next load (`T.indexOf(p.state.themeId)!==-1` fails), the script falls into the `!id` branch, picks a **random** theme, and **overwrites** the user's saved choice in localStorage — permanently destroying their preference, not just mis-rendering one paint.
- **Root cause**: The allowlist and the light-theme subset `L` exist in two places with no build-time link, no comment in the script pointing at the source of truth, and no test asserting parity. The destructive write-back on mismatch turns a cosmetic drift into data loss.
- **Impact**: Silent, hard-to-reproduce loss of user theme preference after any theme-catalog change; also FOUC-adjacent mismatch between the head script's choice and the hydrated ThemeInit store until the store re-persists.
- **Fix sketch**: Generate the script string from the canonical theme registry (import theme IDs into layout.tsx and interpolate `JSON.stringify(ids)` into the template literal — layout is a server component, so this is free), or add a unit test that parses the inline script's arrays and asserts equality with the store's theme list. Also make the mismatch branch non-destructive: fall back to `dark-midnight` for rendering without `localStorage.setItem` when a *present but unrecognized* id is found.

## 2. Navbar renders no logo or brand mark — two finished logo components are orphaned, and mobile has no home affordance in the header
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: dead-component-missing-brand-mark
- **File**: `src/components/Navbar.tsx:42`
- **Scenario**: The header renders only `DesktopNav` (route pills + dashboard/download cluster) and a hamburger. There is no logo/wordmark anywhere: `NavbarLogoGlyph.tsx` and `NavbarLogoWordmark.tsx` are fully-built "Variant A/B" components imported by **nothing** (grep confirms zero consumers). On mobile the collapsed header shows *only* a hamburger — no brand identity and no home link without opening the panel; on desktop "Home" is just one pill among three. The variant decision (A vs B vs neither) was evidently never made or never recorded.
- **Root cause**: A logo A/B exploration was abandoned mid-decision; the chosen state ("no logo") was never confirmed, and the losing variants were never deleted. Context-map drift compounds it: the map still lists `src/components/NavbarMobileMenu.tsx`, which no longer exists (replaced by `src/components/navbar/MobilePanel.tsx` + `useMobileMenu.ts`).
- **Impact**: A marketing site whose sticky header carries zero brand identity — weak recall, and the mobile header is a bare hamburger floating over content. Two dead components (~140 lines with framer-motion animations) mislead future readers into thinking a logo exists. Standard user expectation (logo = home link) is unmet.
- **Fix sketch**: Decide: wire one variant (Glyph reads best at `scrolled` state since it collapses to a monogram) into `Navbar.tsx` left slot for both breakpoints, and delete the other; or, if "no logo" is intentional, record why in a comment on Navbar and delete both variants. Update the context map to replace `NavbarMobileMenu.tsx` with the `navbar/` sub-files.

## 3. Cookie banner copy promises "No tracking" while the Accept All button exists specifically to enable analytics tracking
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: copy-behavior-contradiction
- **File**: `src/components/CookieConsent.tsx:109`
- **Scenario**: The banner reads "We use essential cookies to keep things running smoothly. No tracking, no ads." — yet directly beside it sit two buttons whose entire distinction is tracking: `accept("all")` calls `flushAnalyticsQueue()` (releasing queued analytics events), `accept("essential")` does not. A user who believes the copy has no basis for choosing between the buttons; a regulator reading it sees consent language that misdescribes what "all" consents to. Also note the banner is hardcoded English while sibling shell components (`not-found`, `error`, `MobilePageTOC`) use `useTranslation`.
- **Root cause**: Copy was written for an essential-cookies-only era and never updated when the queued-analytics + `flushAnalyticsQueue` consent gate was added. No recorded reasoning for what "all" covers.
- **Impact**: GDPR/ePrivacy consent must be *informed*; text that says "no tracking" while the choice gates analytics undermines the validity of the consent collected and confuses users into an arbitrary choice.
- **Fix sketch**: Reword to state the actual split, e.g. "Essential cookies keep the site working. Optional, privacy-friendly analytics help us improve — no ads, no third-party sale." Route the string through the i18n bundle like the rest of the shell. Keep the "close = essential" behavior (correct fail-closed default).

## 4. Shell chrome geometry is held together by unexplained magic offsets (60px / 96px / h-24) that all secretly encode "navbar height"
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: magic-number-layout-coupling
- **File**: `src/components/MobilePageTOC.tsx:52`
- **Scenario**: `MobilePageTOC` pins to `top-[60px]` and its scrim starts at `top-[96px]` (60 + its own h-9=36); `SectionBreadcrumb` independently pins to `top-[60px]` (`src/components/SectionBreadcrumb.tsx:30`); `InfoPageLayout` reserves navbar space with a bare `<div className="h-24" />` (`src/components/InfoPageLayout.tsx:46`); `PageShell` uses `scroll-mt-24`. None of these cite each other or the source of the 60px figure — which is *derived*, not declared: Navbar is `py-4` (32px) + content row height. Changing navbar padding, logo height (see finding 2), or the pill `min-h-11` silently desynchronizes four files: the breadcrumb/TOC bars overlap or gap against the navbar, and anchored-scroll headings land under the chrome.
- **Root cause**: No shared constant or CSS variable for header height; each component re-measured the rendered result and froze it as an arbitrary literal, with the TOC's 96px additionally compounding two of them.
- **Impact**: Any navbar restyle (a likely follow-up to finding 2) breaks sticky-chrome alignment in ways no type check or test catches; 60 vs 96 vs h-24 (96px) reads as unrelated numbers to the next editor.
- **Fix sketch**: Define `--nav-h` (and `--nav-h-with-toc`) once in `globals.css` or a `NAV_HEIGHT_PX` constant in `@/lib/constants`; use `top-[var(--nav-h)]`, `h-[var(--nav-h)]`... and derive the scrim offset by composition. One comment at the definition site explaining the derivation replaces four unexplained literals.

## 5. MobilePageTOC opens a scroll-locked overlay without dialog semantics, focus trap, or focus restoration — inconsistent with MobilePanel's correct pattern
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: inconsistent-overlay-a11y
- **File**: `src/components/MobilePageTOC.tsx:26`
- **Scenario**: Opening the "On this page" dropdown locks body scroll and renders a full-screen scrim, i.e. it behaves modally — but unlike the sibling `MobilePanel` (which has `role="dialog"`, `aria-modal`, a Tab focus trap, and reason-aware focus restoration via `useMobileMenu`), the TOC keeps focus untended: a keyboard user can Tab past the list into the page content *behind* the scrim while scrolling is locked, ending up focused on invisible elements they cannot scroll to. On close (Escape or scrim tap) focus is not returned to the toggle button. The scrim is also a `<motion.button>` that *is* reachable in the Tab order, unlike MobilePanel's `aria-hidden` backdrop div.
- **Root cause**: The overlay was built as a lightweight disclosure but grew modal behaviors (scroll lock + scrim) without adopting the modal a11y contract already implemented 30 lines away in `useMobileMenu.ts`; the shared hook takes a panel ref and could have been reused.
- **Impact**: Keyboard and screen-reader users get trapped in a scroll-locked page focused on obscured content — a WCAG 2.4.3/2.4.11 failure on every info page (the TOC ships via `InfoPageLayout` on all of them); two overlay components in the same shell teach contributors two different patterns.
- **Fix sketch**: Either (a) reuse/generalize `useMobileMenu` for the TOC panel (trap + Escape + restore-to-trigger, `role="dialog"` or at minimum contain focus within the nav while open), or (b) drop the modal behaviors — no scroll lock, no scrim — making it a plain disclosure where background Tab targets remain visible and scrollable. Pick one contract; don't keep the hybrid.
