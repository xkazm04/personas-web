# Guide Data, Content & Search Index
> English source-of-truth for the in-app guide — category/topic registry, per-module Markdown bodies, plus search, link, and locale-resolution helpers. · **Route:** n/a (data layer) · **Status:** Source content

## What it does
Holds the canonical content that drives the `/guide/*` pages: the 11 categories, the 116 topics that hang off them, and the long-form Markdown body for each topic. The guide documents the Personas desktop app's modules (getting-started, companion/Athena, agents-prompts, credentials, deployment, memories, monitoring, pipelines, testing, triggers, troubleshooting). Alongside the data, this layer ships the utilities the pages consume — fuzzy search over titles/tags/descriptions, related-topic ranking, mode (simple/power) filtering, dev-only gating, desktop "Find in App" breadcrumbs, platform-aware link opening, and locale resolution with per-field English fallback.

It is **data, not UI**. Nothing here renders; the guide pages (`src/app/guide/**`) and components (`src/components/guide/**`) import from it. Marketing surfaces also reach in via `guideHref`/`openGuideLink` to deep-link into a topic.

## How it works
Content is modelled in three layers that must stay 1:1 keyed:

1. **Categories** (`categories.ts`) — 11 `GuideCategory` records: `id`, `name`, `description`, Lucide `icon` name, hex `color`, and an optional default `mode`. Categories flagged `mode: "power"` (triggers, pipelines, memories, monitoring, testing, deployment) only surface under the power-mode filter; `companion` (Athena) has no default mode, so it defaults to `both`.
2. **Topics** (`topics.ts`) — 116 `GuideTopic` records, each with `id`, `categoryId`, `title`, `description`, `tags[]`, optional `mode`/`devOnly`, and optional `coverage` metadata (screenshot recipe path, review timestamps, watched desktop files for the drift detector). Topics are the searchable/navigable index; they carry **no body**.
3. **Content** (`content/<category>.ts`) — one file per category exporting `content: Record<topicId, markdownString>`. `content/index.ts` spreads all eleven into a single `GUIDE_CONTENT` map. Bodies are template-literal Markdown with custom fenced directives the renderer interprets — the authoritative set is in `parseCustomBlock.tsx`: `:::steps`, `:::keys`, `:::compare`, `:::diagram`, `:::feature`, `:::checklist`, `:::usecases`, `:::code-compare`, `:::tabs`, `:::cli`, `:::callout-stack`, `:::cards`, and the callout family `:::tip` / `:::warning` / `:::info` / `:::success`. **`:::compare` column titles only accept `[recommended]` as a highlight tag** — any other bracketed tag (e.g. `[default]`) makes the title line parse as body text, so put such notes in the body, not the title.

The effective `mode` for a topic resolves topic-override → category-default → `"both"` (`guide-utils.ts:6`). Visibility is gated twice: `devOnly` topics are hidden everywhere (sidebar, lists, search, direct URL) unless `NEXT_PUBLIC_SHOW_DEV_GUIDE_TOPICS=true` (`guide-utils.ts:31`), and the topic page calls `notFound()` for hidden topics (`page.tsx:101`).

**Search** (`guide-search.ts`) is a synchronous in-memory scan over `GUIDE_TOPICS` (visible only). Each topic gets one best score from a fixed priority ladder: exact-title substring (10) > exact-tag substring (8) > fuzzy-title per-word ≤2 edits (5) > fuzzy-tag (4) > description substring (2). Fuzzy matching uses a hand-rolled Levenshtein with early-exit pruning. Results sort by score then title, slice to a limit (default 15), and `groupResultsByCategory` buckets them for the combobox.

**Localization** (`getLocalized.ts`) resolves title/description/body per locale with **independent per-field English fallback**. Bodies come from `locales/<lang>/content/<category>.ts`, titles/descriptions from `locales/<lang>/topics.ts`, both lazy-imported via dynamic `import()` wrapped in try/catch (a missing locale file silently falls back to English). The English caller (`page.tsx`) renders the English body server-side and passes it into `getLocalizedTopic(lang, topicId, englishBody)` so the body fallback needs no extra fetch.

**Desktop module map** (`desktop-modules.ts`) mirrors the desktop app's sidebar (`DESKTOP_MODULES`) and maps every topic id → `{ moduleId, path[], label }` in `TOPIC_MODULE_MAP`, powering the "Find in App: Agents → Editor → Prompt" badge.

## Key files
| File | Role |
| --- | --- |
| `src/data/guide/types.ts` | `GuideCategory`, `GuideTopic`, `GuideMode`, `TopicCoverage` interfaces |
| `src/data/guide/categories.ts` | 11 category records (id, name, icon, color, mode); includes `companion` (Athena) |
| `src/data/guide/topics.ts` | 116 topic records (the searchable/navigable index; no bodies) |
| `src/data/guide/content/index.ts` | Spreads 11 category files (incl. `companion.ts`) into the `GUIDE_CONTENT` topicId→Markdown map |
| `src/data/guide/content/<category>.ts` | Per-module Markdown bodies (e.g. `getting-started.ts`, `testing.ts`) |
| `src/data/guide/getLocalized.ts` | `getLocalizedTopic` / `getLocalizedCategoryFromI18n` — locale resolution with per-field EN fallback |
| `src/data/guide/locales/<lang>/` | Translated `topics.ts`, `content/*.ts`, `_meta.json` (13 non-en locales) |
| `src/data/guide/desktop-modules.ts` | `DESKTOP_MODULES` sidebar mirror + `TOPIC_MODULE_MAP` "Find in App" refs |
| `src/data/guide/illustrations.ts` | `GUIDE_ILLUSTRATIONS` — per-category dark/light hero image paths |
| `src/lib/guide-search.ts` | `searchGuide`, `groupResultsByCategory`, Levenshtein fuzzy matcher |
| `src/lib/guide-utils.ts` | Mode resolution, dev gating, `getRelatedTopics`, load-time orphan invariant |
| `src/lib/guide-link.ts` | `guideHref`, `openGuideLink` (desktop-aware), `isDesktopApp`, `GuideTopicRef` |

## Data & state
- **Source:** Static TS modules under `src/data/guide/` (English) + `src/data/guide/locales/<lang>/` (translations). No DB, no fetch — everything is bundled at build time and tree-evaluated. **Stores:** None of its own; reads `language` from `@/stores/i18nStore` for locale resolution (the store is currently hard-locked to `en` — `setLanguage` is a no-op, so locale swap is dormant infra). **API routes:** none. **Types:** `GuideCategory`, `GuideTopic`, `GuideMode`, `TopicCoverage` (`types.ts`); `DesktopModule`, `TopicModuleRef` (`desktop-modules.ts`); `SearchResult`, `GroupedResults` (`guide-search.ts`); `RelatedTopic` (`guide-utils.ts`); `LocalizedTopicFields` (`getLocalized.ts`); `GuideTopicRef` (`guide-link.ts`).

## Integration points
- **Topic page** `src/app/guide/[category]/[topic]/page.tsx` — server component loads `GUIDE_CONTENT` for the category, looks up the topic body, `notFound()`s on missing/hidden, extracts headings, and renders. `TopicView.tsx` (client) re-resolves via `getLocalizedTopic` on language change (`TopicView.tsx:80`) with the prev-state reset pattern to satisfy React 19's no-setState-in-effect rule.
- **Category page** `src/app/guide/[category]/` — `CategoryTopics.tsx` / `page.tsx` list topics filtered by mode/visibility; `GUIDE_ILLUSTRATIONS` supplies the hero art.
- **Search UI** `src/components/guide/SearchCombobox.tsx` → `searchGuide` + `groupResultsByCategory`.
- **Marketing deep-links** — `src/components/sections/features/components/GuideLinks.tsx`, `pricing/FeatureGroupCard.tsx`, `vision-grid/.../PlatformCardPanel.tsx` build `GuideTopicRef`s and call `guideHref` + `openGuideLink`.
- **Tooling** — `coverage.screenshotRecipe`/`watchedFiles` are read by `tools/guide-screenshots` and `check-guide-coverage.mjs` (drift detection against the desktop app); not consumed by the web app at runtime.

## Conventions & gotchas
- **Three lists must stay in lockstep.** `topics.ts` (id), every `content/<cat>.ts` (key), and `TOPIC_MODULE_MAP` (key) are all keyed by `topicId`. `topics.ts` and `content` are a clean 116/116 match; **`TOPIC_MODULE_MAP` intentionally lags** — the 16 topics added for Companion/Athena, Templates, Goals & KPIs, interface modes, and the Director expansion have no module ref yet, so their "Find in App" badge is simply omitted (both consumers guard with `TOPIC_MODULE_MAP[topic.id] && …`, so this degrades gracefully). Mapping them needs `DESKTOP_MODULES` extended with `companion`/Teams (Goals/KPIs) entries it doesn't yet have — a follow-up that pairs with the desktop-sync stream. Only one drift case is guarded: `guide-utils.ts:73` throws at module load if a topic references an unknown `categoryId`. **A topic with no matching `content` key is *not* caught — it fails at runtime with `notFound()` (`page.tsx:105`), and an orphan `content` key is never surfaced.** Add/remove a topic in `topics.ts` + `content` together.
- **Section-header comments in `topics.ts` carry no counts.** The `// ─── Getting Started` dividers used to embed a hardcoded `(N)` topic count that drifted from reality (Credentials read 10 but had 7). Those numbers were removed — the dividers are now name-only, so there is no hardcoded per-category count anywhere to fall out of sync. The only topic counters that render are derived from `GUIDE_TOPICS` at request time in `guide/page.tsx` (`topicCountFor`, honoring mode + visibility filters), so they are always correct — count the records if you need a number.
- **Topic title ≠ topic id ≠ body H1.** Several testing topics were repurposed: id `arena-testing` → title "Measuring a version" → body H1 "Measuring a Version (Arena)"; `ab-testing-prompts` → "Comparing versions"; `matrix-testing` → "Improving with Athena"; `eval-testing` → "The ratings grid". The ids are frozen (they're URLs) while titles/bodies evolved. Don't assume the id describes the current content.
- **Locale fallback is per-field and silent.** A topic with a translated title but untranslated body renders translated-title + English-body — by design (`getLocalized.ts`), never a missing-body hole. A missing/throwing locale import is swallowed and falls back to English, so a broken translation file degrades quietly rather than erroring.
- **Locale infra is built but dormant.** `locales/<lang>/` is fully populated (13 languages, each with `topics.ts`, 10 `content/*.ts`, and a `_meta.json` carrying `translatedFromHash` per topic for staleness tracking), and `getLocalizedTopic` is wired into `TopicView`. But `i18nStore` is locked to `en`, so the non-en bodies never render today. Treat `_meta.json` hashes as the freshness signal when the switcher is eventually enabled.
- **`getLocalizedCategoryFromI18n` reads a *different* source than topics.** Category strings are expected to come from `src/i18n/<lang>.ts` (`guide.categories` / `guide.categoryDescriptions`), passed in by the caller — not from `locales/<lang>/`. Two separate localization channels; don't conflate them.
- **Category grid falls back to `categories.ts` for the name/description.** `GuideCategoryGrid` renders `labels.categories[id] ?? category.name` (and `… ?? category.description`), so a category with no `src/i18n` entry still shows its English name/description from `categories.ts`. That's why `companion` renders correctly today even though it has **no `guide.categories` key in any `src/i18n/*.ts` yet** — adding those keys (interface + all 14 locales) is part of the deferred translation batch. `i18n` keys, when present, still win.
- **Mojibake warning (repo-wide).** Non-en `src/i18n/*.ts` files are UTF-8+BOM with double-encoded values; anchor any edits on pure-ASCII and write correct UTF-8 rather than "fixing" the existing corruption.
- **`openGuideLink` is desktop-aware.** In the Tauri shell (`window.__PERSONAS_DESKTOP__`) it dispatches a `personas:open-external` CustomEvent for the host to intercept; on the web it's `window.open(_blank, noopener)`. Use it (not raw `<a>`) for any link that should escape the webview.
- **Search has no body index.** `searchGuide` only scans title/tags/description — Markdown bodies are never indexed. A term that appears only in a topic's body won't match. Tags are the lever for discoverability; keep them rich.
- **`getRelatedTopics` requires ≥2 shared tags and excludes same-category topics** (those are reached via prev/next nav). A topic with sparse/unique tags will show no related topics.

## Related docs
- [Guide Pages & Navigation](pages-navigation.md)
- [Localized Guide Content](localized-content.md)
- [Feature index](../INDEX.md)
