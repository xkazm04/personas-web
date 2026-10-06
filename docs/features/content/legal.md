# Legal & Policy
> Single-page legal hub with a tabbed selector for privacy / terms / cookies, each carrying a TL;DR card, a "Last updated" date, and an expandable per-policy changelog with "New"/"Updated" badges driven by localStorage. · **Route:** `/legal` · **Status:** Live (static)

## What it does

Gives users one page for all of Personas' legal copy — **Privacy Policy**, **Terms of Service**, and **Cookie Policy** — without a full-page reload between them.

- A row of three pill tabs (Shield / FileText / Cookie icons) switches the visible policy. The active policy is reflected in the URL hash (`/legal#privacy`, `#terms`, `#cookies`) so a deep link or refresh lands on the same policy.
- Each policy opens with a cyan **TL;DR** card (3-4 plain-language bullets), a **"Last updated: April 2026"** line, then a collapsible **"What changed in this update"** changelog, then the full policy sections.
- The changelog returning visitors haven't seen yet is auto-expanded and flagged: a **"New"** pill inside the panel and an **"Updated"** badge on the tab. The flag clears once they view that tab. A first-time visitor sees no badges (nothing is "new" to them yet).
- A `mailto:legal@personas.ai` contact button sits below the card.

## How it works

`LegalPage` (`src/app/legal/page.tsx:20`) is a static server component (`dynamic = "force-static"`, `revalidate = 86400`) that renders `Navbar` + `<LegalContent />` + `Footer` and sets the page `metadata` (title "Privacy & Terms", canonical `${SITE_URL}/legal`).

`LegalContent` (`src/app/legal/LegalContent.tsx:45`) is the `"use client"` controller and owns all interactivity:

- **Tab selection.** `TABS` (`LegalContent.tsx:20`) is a static `[{id,label,icon}]` array; `TAB_CONTENT` (`:28`) maps each `PolicyId` to its policy component. `activeTab` drives which component renders inside an `AnimatePresence mode="wait"` block keyed on `activeTab` (`:157`), so policies cross-fade. `switchTab` (`:92`) sets state and calls `window.history.replaceState(null, "", "#"+id)` (no new history entry).
- **Hash sync (deep links).** SSR always renders `"privacy"` so the server and client first paint match; a mount effect (`:58`) then reads `getInitialTab()` (`:38`, parses `window.location.hash`) inside a `setTimeout(…, 0)` and switches the tab post-hydration — deliberately avoiding a hydration mismatch on `/legal#cookies`. A `hashchange` listener (`:76`) keeps the tab in sync with back/forward or manual hash edits.
- **"Seen" tracking.** On mount the effect computes which policies are unseen via `hasUnseenUpdate(pid, readLastSeen(pid))` for every tab, stores that set once in `initiallyUnseen` (stable for the session, drives the "New" pill + auto-expand) and a mutable copy in `pendingBadges` (drives the tab "Updated" badge, shrinks as tabs are visited). Activating any tab (mount, `switchTab`, or `hashchange`) calls `writeLastSeen(id, todayIso())` and removes it from `pendingBadges`.
- **Policy body.** Each policy component (`PrivacyPolicy` / `TermsOfService` / `CookiePolicy`) is a pure presentational component receiving a single `changelog` prop (a `<PolicyChangelog>` node) that it renders right after its "Last updated" line. The components are otherwise static JSX — TL;DR card + a series of `<section>`s.
- **Changelog disclosure.** `PolicyChangelog` (`src/app/legal/PolicyChangelog.tsx:13`) looks up `POLICY_META[policyId]`, seeds its `open` state from the `hasUnseenUpdate` prop (so unseen changelogs start expanded), and renders `meta.changes[]` as a bulleted list inside an `AnimatePresence` height/opacity collapse. The "New" pill shows only while `hasUnseenUpdate` is true.

## Key files

| File | Role |
| --- | --- |
| `src/app/legal/page.tsx` | Static route shell: `Navbar` + `LegalContent` + `Footer`, page `metadata`, `force-static` / 1-day `revalidate`. |
| `src/app/legal/LegalContent.tsx` | Client controller: tab state, hash sync (`getInitialTab`/`hashchange`), `todayIso`, seen-tracking effects, tab pills + "Updated" badges, contact button. |
| `src/app/legal/PolicyChangelog.tsx` | Collapsible "What changed in this update" disclosure; renders `POLICY_META[policyId].changes`, "New" pill, accessible expand/collapse. |
| `src/app/legal/policies/PrivacyPolicy.tsx` | Privacy policy body (TL;DR + sections). Receives `changelog` node as a prop. |
| `src/app/legal/policies/TermsOfService.tsx` | Terms of service body (TL;DR + sections). Receives `changelog` node. |
| `src/app/legal/policies/CookiePolicy.tsx` | Cookie policy body, **localized** (`t.cookiePolicy`, 14 locales). Renders the storage list from `STORAGE_REGISTER` grouped by category, plus the analytics note; formats "Last updated" from `POLICY_META.cookies.latestUpdateIso` with `Intl` in the reader's language. Receives `changelog` node. |
| `src/data/storage-register.ts` | `STORAGE_REGISTER`: every cookie and local storage key the site writes (names, mechanism, category, lifetime, purpose id) - the single source the Cookie Policy renders. Header lists each key's writer. |
| `src/data/storage-register.test.ts` | Scans `src/` modules that touch `localStorage`/`sessionStorage`/`document.cookie`/zustand `persist` and fails on any key missing from the register. |
| `src/data/policy-changelog.ts` | `PolicyId`/`PolicyMeta` types, `POLICY_META` (dates + change bullets per policy), localStorage helpers (`getStorageKey`/`readLastSeen`/`writeLastSeen`), `hasUnseenUpdate`. |

## Data & state
- **Source:** all policy prose and the changelog bullets are **hardcoded** — prose in the three `policies/*.tsx` files, change bullets + dates in `POLICY_META` (`src/data/policy-changelog.ts:9`). No CMS, no fetch. **Stores:** no Zustand; React `useState` only (`activeTab`, `initiallyUnseen`, `pendingBadges` in `LegalContent`; `open` in `PolicyChangelog`). **API routes:** none — fully static (`force-static`, `revalidate = 86400`). **Types:** `PolicyId = "privacy" | "terms" | "cookies"`, `PolicyMeta = { latestUpdateIso, formattedUpdate, changes[] }` (`policy-changelog.ts:1`); `TabId = PolicyId` and `PolicyComponentProps = { changelog?: ReactNode }` in `LegalContent`.
- **Storage register (2026-10-05).** The Cookie Policy used to claim "two essential cookies: sign-in session and theme". In fact the site sets one cookie of its own (`prefer-full`, `mobile/ViewFullSiteLink.tsx`, read in `proxy.ts`), the Supabase session and the theme live in localStorage, and ~17 more localStorage keys were undeclared (voter id, comment nickname, tour, language, dashboard prefs...). The list now renders from `src/data/storage-register.ts`; **adding/renaming/removing any cookie or storage key means updating the register (the unit test enforces it) and bumping `POLICY_META.cookies`.** Purpose/lifetime text lives in `t.cookiePolicy.purposes` / `.lifetimes`. The consent-gated website analytics (`src/lib/analytics.ts`, Sentry metrics) store nothing on the device.
- **Persistence:** per-policy "last seen" date in `localStorage` under `personas-legal-last-seen-<id>` (`STORAGE_KEY_PREFIX`, `policy-changelog.ts:39`). Reads/writes are `try/catch`-guarded for private mode / quota, and SSR-guarded (`typeof window === "undefined"`).
- **"Unseen" rule:** `hasUnseenUpdate` (`policy-changelog.ts:63`) returns `lastSeen < latestUpdateIso` via string comparison of ISO dates; returns `false` when `lastSeen === null` (first visit shows no badge by design).

## Integration points
- **Animations:** `fadeUp`, `TRANSITION_NORMAL` from `src/lib/animations.ts` (header + tab content cross-fade); `motion`/`AnimatePresence` from framer-motion in both `LegalContent` and `PolicyChangelog`.
- **Icons:** `lucide-react` — `Shield`, `FileText`, `Cookie`, `Mail` (tabs/contact), `ChevronDown`, `Sparkles` (changelog).
- **Layout chrome:** shared `@/components/Navbar` and `@/components/sections/Footer`. `<main id="main-content">` is the skip-link target.
- **SEO:** `SITE_URL` from `@/lib/seo` for the canonical URL.
- **Footer / nav links:** external and footer links point at `/legal` and the `#privacy` / `#terms` / `#cookies` hashes — route path is referenced externally, so do not rename it without confirmation (see CLAUDE.md "Out of scope").
- **Substance ↔ product:** the copy names real platform behavior — Supabase as auth/storage provider, AES-256-GCM keyring encryption, Sentry on this website and in the desktop app (anonymous error reports + usage signals; the Privacy Policy's "Desktop App Error Reports and Usage Signals" section, corrected 2026-10-05 - see `security.md` for the desktop anchors). Keep it consistent with the Security page and the actual platform.

## Conventions & gotchas
- **GOTCHA — legal copy is mostly hardcoded English, violating the i18n non-negotiable.** Exception: the Cookie Policy body is localized (`t.cookiePolicy`, since 2026-10-05); its changelog bullets (`POLICY_META`) are still English. The cookie banner (`CookieConsent.tsx`) is localized too (`t.cookieConsent`, since 2026-10-06), and each locale's policy quotes that locale's own button labels; keep the two in step when a label changes. For the rest: Every user-facing string here is raw JSX with no `useTranslation()`: the page heading/subtitle ("Privacy & Terms", "Your agents and keys stay on your device…", `LegalContent.tsx:115-121`), the tab `label`s (`:21-23`), the "Updated"/"New" badges (`:147`, `PolicyChangelog.tsx:31`), "What changed in this update" (`PolicyChangelog.tsx:28`), the entire body of all three `policies/*.tsx`, every "Last updated: April 2026" line, and the page `metadata` (`page.tsx:12`). None of this is in `src/i18n/en.ts`, so non-English users get an all-English legal hub. This is a known, large gap — migrating legal prose into 14 locales is a deliberate decision, not a casual edit; flag it, don't silently English-placeholder it (per CLAUDE.md + user memory).
- **"Last updated" reads `POLICY_META`.** Privacy and Terms render `POLICY_META[id].formattedUpdate`; the Cookie Policy formats `latestUpdateIso` with `Intl.DateTimeFormat(language, { month, year, timeZone: "UTC" })`. Bump `latestUpdateIso` (it drives the "Updated" badge) and `formattedUpdate` together.
- **Dates as of 2026-10-05:** privacy and cookies `2026-10-05` (telemetry + storage corrections), terms `2026-09-14`. The changelog is manual, so re-verify dates whenever copy changes.
- **`new Date()` is used but stays React-19-compliant.** `todayIso()` (`LegalContent.tsx:34`) calls `new Date()`, which would violate the "no impure calls in render" rule — but it is only ever invoked inside effects and event handlers (`writeLastSeen(...)`), never in render or a `useMemo` factory. Keep it out of render if you refactor.
- **Mount effect uses `setTimeout(…, 0)` + post-mount `setActiveTab` on purpose.** SSR renders `"privacy"`; the real hash and the `initiallyUnseen`/`pendingBadges` sets are applied after mount to dodge a hydration mismatch on deep links (`LegalContent.tsx:58-74`). Don't "simplify" this into a synchronous `useState` initializer that reads `window` — it will reintroduce the mismatch.
- **`initiallyUnseen` is intentionally captured once and frozen for the session** so the "New" pill / auto-expand persists even after `writeLastSeen` marks the policy seen in localStorage; `pendingBadges` is the mutable copy that clears the tab badge on view. Don't collapse the two into one set.
- **First visit shows no badges by design** — `hasUnseenUpdate` returns `false` when `lastSeen === null` (`policy-changelog.ts:65`), so the changelog stays collapsed for new users and only returning visitors who predate `latestUpdateIso` see the cue.
- **Date comparison is naive ISO string `<`.** This is correct only because both sides are zero-padded `YYYY-MM-DD`. Keep `latestUpdateIso` and the `writeLastSeen` value (`todayIso()`, also `YYYY-MM-DD`) in that exact format — any timezone suffix or different format breaks the comparison.
- **Animation gating not required.** Both motion components use framer-motion `variants` / `AnimatePresence` (opacity + small transforms, no `requestAnimationFrame` or canvas), so `custom-animation/require-animation-gating` does not apply and neither file imports `useReducedMotion`.
- **Semantic tokens throughout** (`text-foreground`, `text-muted-dark`, `border-glass`, `border-glass-hover`, `text-brand-cyan`, `bg-brand-cyan/10`). TL;DR bullets use `text-foreground/80` — above the `/60` WCAG-AA lint floor.
- **a11y is solid.** Tabs are real `<button>`s; the "Updated" badge has `aria-label="Updated since your last visit"`; the changelog disclosure wires `aria-expanded`/`aria-controls` to a matching `id="policy-changes-<id>"` and marks decorative icons `aria-hidden`. (The pill row is not wired as an ARIA `tablist`/`tab` pattern — it behaves as buttons + hash links, which is acceptable but note it if you add roving-tabindex semantics.)

## Related docs
- [Security & Compliance](security.md)
- [Cookie consent (platform)](../platform/layout-navigation.md)
- [Feature index](../INDEX.md)
