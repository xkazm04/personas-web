# Guide Pages & Navigation — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 1, Medium: 4, Low: 0)

## 1. Prev/Next and Related links can point at hidden (devOnly) topics that 404 in production
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: visibility-filter-inconsistency
- **File**: `src/app/guide/[category]/[topic]/page.tsx:107`
- **Scenario**: In a production build (no `NEXT_PUBLIC_SHOW_DEV_GUIDE_TOPICS`), a category contains a `devOnly` topic. A visitor on the adjacent topic clicks "Next" — or a Related Topics card — and lands on a 404, because direct access to hidden topics is blocked (`if (!isTopicVisible(topic)) notFound()` at line 101).
- **Root cause**: `categoryTopics = GUIDE_TOPICS.filter((t) => t.categoryId === categoryId)` builds the prev/next chain without `isTopicVisible`, and `getRelatedTopics()` in `src/lib/guide-utils.ts:59` likewise never filters by visibility. Every other surface (sidebar, category page, category `generateMetadata` topic counts) does filter — the visibility rule was applied everywhere except the two in-article navigation sources.
- **Impact**: User-facing dead links to pages the site itself refuses to render; broken HowTo/Article link graph for crawlers; prev/next chain silently skips vs. 404s depending on which side of the hidden topic you are.
- **Fix sketch**: In `TopicPage`, filter with `.filter((t) => t.categoryId === categoryId && isTopicVisible(t))` before computing `currentIndex`; in `getRelatedTopics`, add `isTopicVisible(t)` to the candidate filter. One-line each, matches the documented contract in guide-utils ("hidden from the sidebar, category lists, search results, and direct URL access").

## 2. Sidebar never expands the active category after client-side navigation
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: stale-navigation-state
- **File**: `src/components/guide/GuideSidebar.tsx:26`
- **Scenario**: A visitor lands on `/guide`, uses the search combobox (or a category card, related-topic card, or prev/next link crossing categories) to jump to a topic. The desktop sidebar still shows every category collapsed — the current topic's highlighted entry is invisible, and there is no "you are here" cue.
- **Root cause**: `expanded` is initialized once from the pathname in the `useState` initializer; nothing reacts to subsequent `usePathname()` changes, so `activeCategory` updates but the expansion state does not follow.
- **Impact**: The sidebar's core wayfinding job (show where you are in 100+ topics) fails for every navigation that doesn't start from a manually expanded category; active-item styling (line 117 of `GuideSidebarContent.tsx`) is unreachable while its section is collapsed.
- **Fix sketch**: Derive expansion for the active category from the pathname, e.g. `const isExpanded = expanded[category.id] ?? category.id === activeCategory` (keeping the user's explicit toggles in state), or sync via the render-time prev-state pattern already used in `TopicView.tsx` when `activeCategory` changes.

## 3. ModuleBadge popover claims `aria-modal="true"` but is not modal; compact variant hides its content from keyboard/touch users
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: a11y-dialog-semantics
- **File**: `src/components/guide/ModuleBadge.tsx:74`
- **Scenario**: A screen-reader user activates the "In app" badge on a topic page. The popover announces as a modal dialog (`role="dialog" aria-modal="true"`), telling AT that the rest of the page is inert — but focus never moves into it, there is no focus trap, and Tab walks straight out into the "inert" page. On category cards, the compact variant (line 44) exposes the app path only via a `title` attribute, which never surfaces on touch or keyboard.
- **Root cause**: Dialog semantics were applied to what is behaviorally a non-modal disclosure popover; the compact variant relies on the hover-only `title` tooltip as the sole carrier of the `moduleRef.path` information.
- **Impact**: Contradictory AT experience (announced-modal that isn't) violates the `aria-modal` contract; the "Find in app" path — the badge's whole purpose — is unreachable for keyboard and touch users in compact mode.
- **Fix sketch**: Drop `aria-modal` and use the disclosure pattern (`aria-expanded` on the trigger is already correct), move initial focus to the popover or its close button on open and restore it on close; for compact mode, render the path as visually-hidden text or an `aria-label` (`aria-label={"Find in app: " + moduleRef.path.join(" → ")}`) instead of `title` only.

## 4. `?mode=` query param is cast unchecked and never written back to the URL
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: unvalidated-url-state
- **File**: `src/app/guide/page.tsx:34`
- **Scenario**: (a) A visitor follows `/guide?mode=easy` (typo or stale link): the string is cast via `searchParams.get("mode") as GuideMode | null` with no validation, so mode-specific topics vanish from counts and the grid while no toggle chip shows as active — the page looks arbitrarily thinner with zero explanation. (b) A visitor clicks "Power", curates a view, then copies the URL or presses Back: the selection is silently lost because `setModeFilter` never syncs to the URL that seeded it.
- **Root cause**: One-way, unvalidated coupling between URL and state: the param is trusted as a `GuideMode` on read and abandoned on write. No recorded decision on whether mode is shareable URL state or ephemeral UI state — the code half-implements both.
- **Impact**: Confusing filtered-but-unlabeled state on bad input; deep links to "Simple mode" (the obvious use for `?mode=` support) can't be created by users, and Back/refresh discards their choice.
- **Fix sketch**: Validate on read (`const m = searchParams.get("mode"); const initialMode = m === "simple" || m === "power" ? m : null;`) and mirror changes with `router.replace(mode ? `/guide?mode=${mode}` : "/guide", { scroll: false })` in `onModeChange`, making the URL the single source of truth.

## 5. Fixed-position offset constants (60px / 96px) disagree with the 64px navbar and each other
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: magic-layout-offsets
- **File**: `src/components/guide/MobileTopicTOC.tsx:60`
- **Scenario**: The guide layout reserves `pt-16` (64px) for the navbar (`src/app/guide/layout.tsx:15`), but `ReadingProgress.tsx:16` and the mobile TOC bar pin at `top-[60px]` — 4px inside the navbar — while the TOC scrim hardcodes `top-[96px]` (60 + the bar's `h-9`) and `useActiveHeading.ts:19` bakes a related `-96px` rootMargin. Anyone restyling the navbar height must find and update four unlabeled numbers in four files; today the bar/progress line already overlap the navbar's bottom 4px, visible whenever the navbar background is not fully opaque.
- **Root cause**: The navbar height exists only as scattered magic values (64 via `pt-16`, 60, 96) with no shared constant or comment recording why 60 ≠ 64 (intentional overlap under a blurred navbar, or drift after a navbar resize — the intent is unrecoverable from the code).
- **Impact**: Real 4px misalignment between the sticky chrome layers now, and a guaranteed silent breakage vector (mobile TOC floating mid-air or underlapping) on any future navbar change; scroll-spy highlighting can drift from what the sticky header actually obscures.
- **Fix sketch**: Introduce one source of truth (e.g. `--navbar-h` CSS variable or an exported `NAVBAR_HEIGHT` constant) consumed by the layout padding, both fixed bars (`top-[var(--navbar-h)]`), the scrim offset (`calc(var(--navbar-h) + 2.25rem)`), and the observer rootMargin; add a one-line comment if the 60px offset is deliberate.
