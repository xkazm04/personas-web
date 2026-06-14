# Guide Pages & Navigation
> The documentation guide hub — hub grid, category lists, topic articles, sidebar tree, reading progress, table-of-contents, related topics, and a fuzzy search combobox · **Route:** `/guide`, `/guide/[category]`, `/guide/[category]/[topic]` · **Status:** Live

## What it does
The User Guide is a 100+-topic documentation site nested under `/guide`. The hub (`/guide`) shows a hero, a global search box, a Simple/Power/All "mode" filter, and a grid of category cards with live topic counts. Each category page (`/guide/[category]`) lists that category's topics with an in-page filter input. Each topic page (`/guide/[category]/[topic]`) renders the Markdown article with a breadcrumb, "in app" module badge, tags, estimated reading time, a top-of-page reading-progress bar, a sticky on-this-page table of contents (collapsible on mobile), related topics, a download CTA, and prev/next navigation. A persistent left sidebar (collapsible category tree + its own search) wraps every guide route via the layout. Bad category/topic slugs render dedicated 404 pages.

## How it works
- **Layout** (`src/app/guide/layout.tsx`) renders `Navbar` + the always-present `GuideSidebar` + a `<main id="main-content">`; the sidebar is `sticky` on desktop and a slide-in `role="dialog"` drawer under `lg`.
- **Hub** (`page.tsx`) is a client component wrapped in `<Suspense>` (it calls `useSearchParams` to seed the mode filter from `?mode=`). It computes visible categories + per-category topic counts with `useMemo`, emits `CollectionPage` JSON-LD, and renders `SearchCombobox`, `GuideModeToggle`, `GuideCategoryGrid`, and `GuideDiscordCTA`.
- **Category page** (`[category]/page.tsx`) is a server component. `generateStaticParams()` pre-renders one route per `GUIDE_CATEGORIES` entry. It filters visible topics, emits `CollectionPage` + `BreadcrumbList` JSON-LD, renders the illustration banner + header, then the client `CategoryTopics` (local substring filter over title/description/tags).
- **Topic page** (`[category]/[topic]/page.tsx`) is a server component but is **dynamically rendered** (no `generateStaticParams` — comment notes the 102 pages exceed the SSG memory budget). It resolves category + topic, lazy-imports only that category's content module (template-literal dynamic import, statically analyzable by Turbopack → one chunk per `content/<id>.ts`), then `notFound()`s on any miss or hidden topic. It computes prev/next (by index within the category), related topics, `:::steps`→`HowTo` JSON-LD, plus `Article` + `BreadcrumbList` JSON-LD, and pre-extracts headings server-side, passing all of it to the client `TopicView`.
- **TopicView** owns the article shell: it derives reading time (~200 wpm), renders `ReadingProgress`, `MobileTopicTOC`, `GuideMarkdown`, `RelatedTopics`, prev/next, and the sticky desktop `TopicTOC`. It also holds the **dormant locale-swap** machinery (see gotchas).
- **Sidebar** (`GuideSidebar` → `GuideSidebarContent`) reads `usePathname()` to highlight the active category/topic, auto-expands the active category, and has its own client-side topic filter; expand/collapse animations are reduced-motion gated and announced via an `aria-live` region.
- **Table of contents**: `TopicTOC` (desktop, sticky) and `MobileTopicTOC` (collapsible top bar) both filter to depth-2/3 headings and share `useActiveHeading`, an `IntersectionObserver` (rootMargin `-96px 0px -65% 0px`) that tracks the topmost visible heading.
- **Search**: `SearchCombobox` debounces input 150 ms, calls `searchGuide()` (tiered exact/fuzzy Levenshtein matcher), groups by category in `SearchResultsPopover`, and supports full ARIA combobox keyboarding (Arrow/Enter/Escape/Tab), flushing the debounce on Enter so a keypress never sits in dead air.

## Key files
| File | Role |
| --- | --- |
| `src/app/guide/layout.tsx` | Shell: Navbar + persistent `GuideSidebar` + `<main>`; sets guide `metadata` |
| `src/app/guide/page.tsx` | Hub: Suspense client page, mode filter, counts, JSON-LD, composes hub sub-components |
| `src/app/guide/guide-page/GuideCategoryGrid.tsx` | Category cards (illustration, brand tint, count, learn-more) |
| `src/app/guide/guide-page/GuideModeToggle.tsx` | Simple/Power/All mode pills (`ThemedChip`) |
| `src/app/guide/guide-page/GuideDiscordCTA.tsx` | "Still have questions?" Discord CTA |
| `src/app/guide/guide-page/guidePageData.ts` | `MODE_OPTIONS` config for the toggle |
| `src/app/guide/[category]/page.tsx` | Category route: `generateStaticParams`, metadata, JSON-LD, header |
| `src/app/guide/[category]/CategoryTopics.tsx` | Client topic grid + in-category substring filter |
| `src/app/guide/[category]/not-found.tsx` | Unknown-category 404 |
| `src/app/guide/[category]/[topic]/page.tsx` | Topic route: dynamic render, content lazy-load, prev/next, all JSON-LD |
| `src/app/guide/[category]/[topic]/TopicView.tsx` | Article shell + locale-swap + focus management |
| `src/app/guide/[category]/[topic]/not-found.tsx` | Unknown-topic 404 |
| `src/components/guide/GuideSidebar.tsx` | Sidebar container: mobile drawer, expand state, sidebar search, a11y announcements |
| `src/components/guide/guide-sidebar/GuideSidebarContent.tsx` | Presentational category tree + active-link styling |
| `src/components/guide/SearchCombobox.tsx` | Global search input, debounce, keyboarding, routing |
| `src/components/guide/search-combobox/SearchResultsPopover.tsx` | Grouped result listbox with match-type badges + highlight |
| `src/components/guide/TopicTOC.tsx` | Desktop sticky on-this-page nav |
| `src/components/guide/MobileTopicTOC.tsx` | Mobile collapsible TOC bar + scrim |
| `src/components/guide/useActiveHeading.ts` | `IntersectionObserver` active-heading tracker |
| `src/components/guide/ReadingProgress.tsx` | Top scroll-progress bar (spring scaleX) |
| `src/components/guide/RelatedTopics.tsx` | Shared-tag related-topic cards |
| `src/components/guide/ModuleBadge.tsx` | "In app" desktop-location popover badge |
| `src/lib/guide-utils.ts` | Visibility/mode helpers, `getRelatedTopics`, orphan-topic build guard |
| `src/lib/guide-search.ts` | `searchGuide` (Levenshtein tiers) + `groupResultsByCategory` |
| `src/data/guide/getLocalized.ts` | `getLocalizedTopic` per-field locale fallback (dormant) |
| `src/components/guide/guide-markdown/extractHeadings.ts` | Markdown → `GuideHeading[]` (used both server + client) |

## Data & state
- **Source:** static content modules under `src/data/guide/` — `GUIDE_CATEGORIES`, `GUIDE_TOPICS`, `GUIDE_ILLUSTRATIONS`, `TOPIC_MODULE_MAP`, and per-category Markdown bodies in `src/data/guide/content/<id>.ts` (lazy-loaded, one chunk per category). No DB, no fetch. **Stores:** `useI18nStore` (Zustand) — read for `language` only; today hard-locked to `"en"` (`setLanguage` is a no-op). All navigation state is local `useState` (sidebar expand/query/mobile-open, search query/results/activeIndex, TOC open). **API routes:** none — entirely static/in-memory. **Types:** `GuideCategory`, `GuideTopic`, `GuideMode` (`src/data/guide/types`), `GuideHeading` (`extractHeadings.ts`), `RelatedTopic` (`guide-utils.ts`), `SearchResult`/`GroupedResults` (`guide-search.ts`), `TopicModuleRef` (`desktop-modules.ts`).

## Integration points
- **Static generation:** `generateStaticParams` exists only on `[category]/page.tsx`; topic pages render dynamically by design. A CI guard (`scripts/check-guide-content.mjs`) asserts every category has a matching `content/<id>.ts`; `guide-utils.ts` throws at module-load on any topic referencing an unknown `categoryId`.
- **Markdown:** `GuideMarkdown` renders bodies; `extractHeadings` (shared) feeds the TOCs; `:::steps`/`:::tabs` custom blocks are parsed both for `HowTo` JSON-LD and TOC tab-label chips. See [Guide Content Blocks & Markdown](content-blocks.md).
- **Localization:** `getLocalizedTopic` resolves title/description/body per-field with English fallback; wired into `TopicView` but dormant until the locale switcher ships. See [Localized Guide Content](localized-content.md).
- **Visibility flags:** `isTopicVisible` honors `devOnly` topics gated by `NEXT_PUBLIC_SHOW_DEV_GUIDE_TOPICS`; the mode filter uses `isTopicVisibleForMode` / `isCategoryVisibleForMode`. Dev-only topics get an amber sidebar treatment.
- **Shared UI / i18n:** `Navbar`, `Footer` (404s), `PrimaryCTA`, `GradientText`, `ThemedChip`, `DISCORD_INVITE_URL`, brand-theme helpers (`BRAND_VAR`/`tint`/`hexToBrand`/`brandShadow`), `safeJsonLd`/`SITE_URL`/`SITE_NAME` (seo), and `t.guide.*` / `t.pageNav.*` / `t.nav.guide` translation keys.

## Conventions & gotchas
- **Hardcoded English (lint/i18n violation):** despite the all-strings-in-`en.ts` rule, large parts of this surface ship literal English in JSX — e.g. `TopicView.tsx` ("Skip to content", "min read", "Ready to try this yourself?", "Download free", "Browse templates", "Previous"/"Next"/"Back to", breadcrumb "Guide"), `CategoryTopics.tsx` (`Filter N topics...`, "results found", empty state), `[category]/page.tsx` ("Back to Guide", `N topic(s)`), `RelatedTopics.tsx` ("Related Topics"), `ModuleBadge.tsx` ("In app", "Find in app", the instructional sentence), `GuideSidebarContent.tsx` ("Search topics...", dev-only `title`), `SearchResultsPopover.tsx` ("No topics found", "Searching…", "N results"), and both `not-found.tsx` pages (entirely hardcoded). Only `TopicView`'s TOC label (`t.pageNav.onThisPage`), the mobile TOC, and the hub use translations. Adding/changing copy here should migrate it into `en.ts` + all 13 locales.
- **`GuideModeToggle` "All modes" pill never highlights as active:** `MODE_OPTIONS` gives the All option `value: null` and the chip's `active` is `modeFilter === option.value`; since the initial/unfiltered state is also `null`, the All chip technically renders active at rest, but there is no visible distinction for "filter cleared via a different control" — minor, but worth noting the `null`-vs-`null` comparison if a future state can desync.
- **JSON-LD `numberOfItems` ignores visibility:** the hub's `CollectionPage` JSON-LD uses raw `GUIDE_TOPICS.length` / `GUIDE_CATEGORIES.length`, not the mode/dev-filtered counts shown on screen — intentional for SEO, but the structured-data total can exceed the visible total.
- **Animation gating:** `ReadingProgress` returns `null` under `useReducedMotion`; `GuideSidebar` swaps to zero-duration/opacity-free collapse variants. `MobileTopicTOC` and `SearchResultsPopover` animate via framer `motion`/`AnimatePresence` **without** importing `useReducedMotion` — the chevron rotate and popover fade are not gated (the custom lint rule keys on `requestAnimationFrame`, which these avoid, so it doesn't flag them, but per convention 3's spirit they're ungated motion).
- **Dormant locale infrastructure:** `TopicView`'s `language`-driven `useState` + `useEffect` swap and `getLocalizedTopic` are fully wired but inert because `i18nStore.setLanguage` is a no-op (locked to `en`). The reset-on-locale-change uses the React 19 prev-state pattern (not setState-in-effect) and reading time/headings are `useMemo`'d off `localized.body` so they recompute correctly once the swap is live.
- **Server/client heading parity:** `page.tsx` extracts headings server-side and passes `initialHeadings`; `TopicView` only re-parses (`extractHeadings`) when `localized.body` diverges from the original `content` (i.e. a locale swap), avoiding a redundant client parse on first load.
- **Focus management:** on client topic change (prev/next or search nav) `TopicView` moves focus to the article `<h1>` (skipping the initial mount) so SR/keyboard users land on the new title.
- **Search edge cases:** queries < 2 chars clear results via `queueMicrotask`; Enter flushes a still-pending or stale debounce by re-running `searchGuide` synchronously; `flatIndexMap` keeps option indices stable across grouped re-renders for `aria-activedescendant`.

## Related docs
- [Guide Data & Content](data-content.md)
- [Guide Content Blocks & Markdown](content-blocks.md)
- [Localized Guide Content](localized-content.md)
- [Feature index](../INDEX.md)
