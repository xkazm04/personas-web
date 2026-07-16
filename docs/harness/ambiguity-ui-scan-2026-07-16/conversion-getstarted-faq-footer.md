# Conversion: Get Started, FAQ & Footer — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. PrimaryCTA silently drops `onClick` when `href` is set — download analytics never fire
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: silent-prop-drop-analytics-loss
- **File**: `src/components/PrimaryCTA.tsx:68`
- **Scenario**: `DownloadCTA.tsx:76-82` renders `<PrimaryCTA href="/api/download" onClick={() => trackDownloadClick("windows")} ...>` when `NEXT_PUBLIC_DOWNLOAD_URL` is set. PrimaryCTA branches on `href` and renders an `<a>` with only `commonProps` (className only) — `onClick` is never attached to the anchor.
- **Root cause**: The component's contract is ambiguous (`href?` and `onClick?` both optional, no documented mutual exclusivity), and the anchor branch omits the click handler instead of forwarding it. TypeScript happily accepts both props.
- **Impact**: The single most important conversion metric on the site — the real download click — is never tracked in the exact configuration where downloads are live. The waitlist branch (no `href`) tracks fine, so the gap only appears in production-with-download, the state least likely to be inspected.
- **Fix sketch**: Attach `onClick={onClick}` to the `<a>` branch too (analytics-then-navigate works for same-origin `/api/download`), or make the API honest: `type Props = { href: string; onClick?: () => void } | { href?: undefined; onClick: () => void }` so passing both is either supported or a type error.

## 2. StepChip's accessible name collapses to a bare digit on mobile
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: a11y-accessible-name-mobile
- **File**: `src/components/sections/get-started/StepChip.tsx:44`
- **Scenario**: On viewports below `sm`, the step title is removed via `hidden sm:inline`, leaving the button's accessible name as just the step number (e.g. "1") — the icon has no text alternative and there is no `aria-label`. A screen-reader user on a phone hears five buttons named "1" through "5" with no hint of what each step is.
- **Root cause**: Responsive truncation was done with CSS display utilities on the only meaningful label, without preserving the name for assistive tech. Also, `aria-pressed` models these as independent toggles when they are a mutually exclusive selector (only one active); five buttons where one is "pressed" and pressing another un-presses it is tab semantics.
- **Impact**: WCAG 4.1.2 name/role failure on mobile for the primary onboarding walkthrough; SR users cannot distinguish steps, and the toggle semantics mis-announce the selection model at every width.
- **Fix sketch**: Keep the title in the accessible name — `<span className="sr-only sm:not-sr-only sm:inline">{step.title}</span>` (or `aria-label={`Step ${step.number}: ${step.title}`}`), and prefer `aria-current="true"` (or a proper `role="tablist"`/`tab` structure) over `aria-pressed` for the active step.

## 3. Bottom-of-funnel copy is half-hardcoded English while the rest of the section is i18n-driven
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: inconsistent-i18n-boundary
- **File**: `src/components/sections/DownloadCTA.tsx:80`
- **Scenario**: DownloadCTA pulls heading, subtitle, steps, pills, and trust signals from `t.downloadSection`, but the primary CTA label `"Download for Windows"` (lines 80/87) and the reassurance line `"No signup, no credit card. Runs on your machine. Zero telemetry."` (line 101) are hardcoded English. Same pattern in `get-started/index.tsx:36-38` where the SectionIntro heading/gradient/description are literals beside otherwise-translated sections.
- **Root cause**: No recorded decision on where the i18n boundary sits; strings were added directly during iteration and never migrated, so the codebase gives contradictory signals about whether new copy must go through `useTranslation`.
- **Impact**: When a second locale ships (the footer already mounts a `LanguageSwitcher`), the highest-converting strings on the page — the download button and the trust microcopy — stay English, and the mixed pattern invites more drift because contributors can't tell which convention is authoritative.
- **Fix sketch**: Move these literals into `t.downloadSection` / a new `t.getStarted` block (keys already exist for neighbours like `exploreFirst`), or record an explicit "English-only marketing strings" decision in the i18n module so the boundary is deliberate rather than accidental.

## 4. Footer "Privacy" and "Terms" both link to the same `/legal` route
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: duplicate-link-destination
- **File**: `src/components/sections/footer/footerColumns.ts:30-31`
- **Scenario**: The Legal column renders two visually distinct links, `t.footer.privacy → /legal` and `t.footer.terms → /legal`. A user clicking "Terms" lands on the same page top as "Privacy" with no indication of which document they'll get or where the terms section is.
- **Root cause**: Both documents live on one page but the links were never given fragment anchors (or the split into two labels was never justified) — the intent (one page vs two documents) is undocumented.
- **Impact**: Confusing navigation on a trust-critical surface (legal links are what skeptical bottom-of-funnel users check), plus two identical-href links with different accessible names is an SR anti-pattern; it also reads as an unfinished stub.
- **Fix sketch**: Point them at anchors (`/legal#privacy`, `/legal#terms`) with matching `id`s on the legal page, or collapse to a single "Privacy & Terms" link until the documents are separate pages.

## 5. Mobile footer column toggles are inert-but-focusable on desktop and expose no expanded state
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: a11y-disclosure-semantics
- **File**: `src/components/sections/footer/FooterLinkColumn.tsx:18`
- **Scenario**: Each column header is a `<button>` that collapses/expands links on mobile. It has no `aria-expanded`/`aria-controls`, so SR users get no state announcement for the disclosure. On `md+` it's neutralized with `md:pointer-events-none` only — keyboard users can still Tab to it and press Enter, which flips hidden state (the mobile panel is `md:hidden`) with zero visible effect, and the chevron is `md:hidden` so sighted keyboard users see a focus ring on something that appears non-interactive.
- **Root cause**: The desktop/mobile dual behavior was handled purely with pointer/display CSS instead of adjusting the element's semantics per breakpoint; disclosure ARIA was never added.
- **Impact**: WCAG 4.1.2 state failure for the mobile accordion, plus three phantom tab stops in the desktop footer that do nothing — small but real keyboard-UX degradation on every page.
- **Fix sketch**: Add `aria-expanded={open}` and `aria-controls` wired to the `<ul>` id; on `md+` either render a plain `<h4>` (use the existing `useIsMobile`-style hook or CSS `md:hidden` button + `hidden md:block` heading pair) or add `tabIndex={-1}` + `aria-hidden` alongside `pointer-events-none` so semantics match appearance.
