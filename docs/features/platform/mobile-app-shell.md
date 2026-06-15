# Mobile App Shell & Views
> Purpose-built touch UI for phone users — a 3-tab shell over the dashboard's data layer with no desktop chrome. · **Route:** `/m`, `/m/overview`, `/m/alerts`, `/m/messages`, `/m/reviews` · **Status:** Demo-only (mocks)

## What it does
Phone visitors to the demo dashboard get a dedicated native-feeling app instead of the cramped desktop layout. The middleware (`src/proxy.ts`) sniffs the user-agent on any `/dashboard*` request and redirects mobile browsers to `/m/overview`; everything under `/m` is then a self-contained app with a fixed bottom tab bar, slide-up page transitions, bottom sheets for detail, and compact stat tiles. Four views ship:

- **Overview** (`/m/overview`) — greeting, a 4-up stat grid (success rate, runs, agents, pending reviews), an alerts banner that drills into `/m/alerts`, and the shared `RecentActivityCard`.
- **Alerts** (`/m/alerts`) — a drill-in (back-chevron) page consolidating the fleet's attention items: open **incidents** (D-A2), a compact **system-health** section-status grid (D-A3), health issues, and SLA breaches. Reuses the desktop `incidentFormat` / `healthFormat` helpers and the `incidentsPage` / `healthPage` i18n (no mobile-specific strings).
- **Messages** (`/m/messages`) — thread list with unread badges, mark-all-read, and a bottom-sheet thread reader.
- **Reviews** (`/m/reviews`) — wraps the desktop `ReviewsFocusFlow` swipe/approve flow.

This is **Approach B** (per `src/app/m/layout.tsx:11`): reuse the dashboard's auth + Zustand stores + mock fixtures, but render a separate route tree and separate components rather than responsively reflowing the desktop pages.

## How it works
- **Routing.** `/m/page.tsx` is a pure `redirect("/m/overview")`. The middleware `matcher` only covers `/dashboard*` (`src/proxy.ts:25`), so the redirect to `/m` happens at the dashboard boundary, not inside `/m`.
- **Layout chrome.** `m/layout.tsx` wraps children in `AuthProvider` → `AuthGuard` → `MotionConfig reducedMotion="user"`, then renders `<MobileShell>{children}</MobileShell>` plus the fixed `<MobileTabBar/>`. The single `MotionConfig` makes every framer-motion animation under `/m` honor `prefers-reduced-motion` (transform/layout dropped, opacity kept) without per-component guards — though several components still self-guard via `useReducedMotion` (see gotchas).
- **Per-navigation transition.** `m/template.tsx` is a Next `template` (remounted on every nav), giving each tab a ~220ms slide-up + fade enter.
- **Tab vs. drill-in nav.** Three tabs (Overview / Reviews / Messages) live in `MobileTabBar`; `/m/alerts` is a drill-in from Overview and has no tab — it keeps the Overview tab highlighted via an explicit `pathname.startsWith("/m/alerts")` check (`MobileTabBar.tsx:63`) and shows a back chevron via `MobileAppBar` instead. The active tab uses a shared `layoutId="mobileTabActivePill"` so the highlight slides between tabs.
- **Sheets.** Detail views use `MobileSheet` (a bottom sheet) rather than centered modals. `MobileThreadSheet` composes it for message threads.

## Key files
| File | Role |
| --- | --- |
| `src/app/m/page.tsx` | `/m` index → `redirect("/m/overview")` |
| `src/app/m/layout.tsx` | Shell composition: auth guard, `MotionConfig`, `MobileShell` + `MobileTabBar` |
| `src/app/m/template.tsx` | Per-navigation slide-up enter transition |
| `src/app/m/overview/page.tsx` | Overview: greeting, stat grid, alerts banner, recent activity |
| `src/app/m/alerts/page.tsx` | Drill-in: open incidents + system-health status grid + health issues + SLA breach log |
| `src/app/m/messages/page.tsx` | Thread list, unread/mark-all-read, opens thread sheet |
| `src/app/m/reviews/page.tsx` | Wraps desktop `ReviewsFocusFlow`, exits to `/m/overview` |
| `src/components/mobile/MobileShell.tsx` | `max-w-md` scroll/padding container, safe-area insets, `#main-content` |
| `src/components/mobile/MobileTabBar.tsx` | Fixed bottom 3-tab nav with badges + active pill |
| `src/components/mobile/MobileAppBar.tsx` | Back-chevron + title for drill-in subpages |
| `src/components/mobile/MobileStatCard.tsx` | Compact accent-colored stat tile (optional drill-in) |
| `src/components/mobile/MobileSheet.tsx` | Generic bottom sheet (drag-to-dismiss, backdrop, Escape, body-scroll lock) |
| `src/components/mobile/MobileThreadSheet.tsx` | Message-thread reader composed on `MobileSheet` |
| `src/proxy.ts` | Middleware UA redirect `/dashboard*` → `/m/overview` |

## Data & state
- **Source:** Demo-only mocks. `MOCK_HEALTH_ISSUES`, `MOCK_SLA_BREACHES`, `MOCK_MESSAGE_THREADS`, `MOCK_UNREAD_MESSAGES` from `src/lib/mock-dashboard-data.ts`; executions/personas/reviews come from the shared stores' mock-backed fetchers.
- **Stores:** Same Zustand stores as the desktop dashboard — `useExecutionStore`/`useEnrichedExecutions`, `usePersonaStore`, `useReviewStore` (drives both the Overview reviews tile and the tab-bar badge), `useAuthStore`. Overview and Reviews call `fetchExecutions()`/`fetchReviews()` in a `useEffect`.
- **API routes:** None of its own. Real data (when wired) flows through the dashboard's orchestrator client (`NEXT_PUBLIC_ORCHESTRATOR_URL`); in this repo it's mocked.
- **Types:** `MessageThread`, `MessageStatus`, `FeedbackMessage` from `mock-dashboard-data`; `StatAccent` (local to `MobileStatCard.tsx`); `Tab` (local to `MobileTabBar.tsx`).
- **Local component state:** Messages keeps a per-message read-status `Map` override layered over the fixture (`messages/page.tsx:21`, mirrors the desktop messages page) and the open-thread id.

## Integration points
- **Desktop dashboard.** Separate route tree (`/m/*` vs `/dashboard/*`) and separate mobile-specific components, but **shared stores + shared mock fixtures**, so demo data stays consistent across both. Reused desktop pieces: `RecentActivityCard`, `HealthIssueRow`, `ThreadRow`, `ReviewsFocusFlow`, `MarkdownReport`, `PersonaAvatar`, and SLA formatters (`severityPill`, `metricKey`) from `dashboard/sla/sla-page/slaFormat`.
- **Auth.** `AuthProvider` treats `/m` as a protected surface alongside `/dashboard` (`src/components/AuthProvider.tsx:13`); `AuthGuard` is reused as-is.
- **Entry point.** Reached only via the middleware redirect — there is no in-app link from desktop to `/m` (see gotchas). `prefer-full` cookie = `"1"` is the escape hatch that keeps a phone on the full dashboard.
- **Animations.** `fadeUp` / `staggerContainer` variants from `src/lib/animations.ts`; `safe-bottom` and `focus-ring` utilities from `src/app/globals.css`.

## Conventions & gotchas
- **`/m` is reachable only by UA sniffing — no clickable entry from desktop.** A desktop user (or a phone with `prefer-full=1`) can only land on `/m` by typing the URL. The redirect is one-directional and lives entirely in `src/proxy.ts`; there's no "switch to mobile" link and no "switch to full site" link rendered inside `/m` to set/clear `prefer-full`. Worth flagging: a phone user who wants the desktop view has no UI to opt out.
- **iPad stays on desktop by design.** The UA regex deliberately omits iPad (iPadOS reports a Mac UA), so tablets get the full dashboard (`proxy.ts:3-6`). Not a bug, but non-obvious.
- **Double reduced-motion handling.** The layout sets `MotionConfig reducedMotion="user"`, yet `MobileTabBar`, `MobileStatCard` still call `useReducedMotion()` and branch manually (e.g. suppressing `whileTap` and the `layoutId` pill). Belt-and-suspenders, but means the gating logic isn't centralized — when touching motion here, check both the `MotionConfig` and the local guard.
- **Hardcoded raw color classes vs. semantic tokens.** These components lean heavily on raw Tailwind palette utilities (`text-cyan-300`, `bg-rose-500/[0.06]`, `text-emerald-400`, `bg-white/[0.02]`, `bg-[rgba(8,11,20,0.6)]`) rather than the project's semantic tokens (`text-brand-cyan`, `bg-surface`, `border-glass`). It's used inconsistently — some files mix `text-brand-cyan`/`border-glass` with raw palette colors in the same file (e.g. `overview/page.tsx`, `MobileTabBar.tsx`). New work should prefer the semantic tokens per CLAUDE.md convention 2.
- **i18n reuse, mostly clean.** Strings come from existing namespaces (`t.dashboard.*`, `t.slaPage.*`, `t.observabilityPage.*`, `t.messagesPage.*`, `t.common.*`) — no hardcoded English in JSX. One smell: `t.messagesPage.unread.toLowerCase()` (`messages/page.tsx:107`) lowercases a translated string in JS, which is locale-fragile (some locales don't case-fold the way English does, and casing may be semantically wrong). `displayName` is split from `full_name` (`overview/page.tsx:42`).
- **a11y — sheet labelling.** `MobileSheet` sets `role="dialog"` + `aria-modal="true"` and supports Escape / backdrop-tap / a visible close button (good — never swipe-only), but it does **not** wire `aria-labelledby`/`aria-describedby` to its title/subtitle, and there's no focus trap or focus-return-on-close. Drag-to-dismiss is mouse/touch only. The drag handle and the `·` separators are correctly `aria-hidden`.
- **a11y — alerts page has no app-bar back affordance parity.** `/m/alerts` uses `MobileAppBar` with an `aria-label`-ed back link (good). Tab links use `aria-current="page"` correctly.
- **Body-scroll lock leak risk.** `MobileSheet` saves/restores `document.body.style.overflow` in its effect; fine for a single sheet, but two simultaneous sheets would clobber the saved value. Only one is ever open per view today.
- **Performance.** Long lists use `content-visibility:auto` + `contain-intrinsic-size` to skip off-screen layout (`alerts/page.tsx`, `messages/page.tsx`). Keep the intrinsic-size estimates in sync with row height if you restyle rows.
- **`HealthIssueRow` gets `personaId: null` forced** on the mobile alerts page (`alerts/page.tsx:47`) so the shared desktop row renders without same-persona context.

## Related docs
- [Dashboard Shell, Chrome & Realtime](../dashboard/shell-chrome.md)
- [Feature index](../INDEX.md)
