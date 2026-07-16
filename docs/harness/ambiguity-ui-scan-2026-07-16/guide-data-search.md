# Guide Data, Content & Search Index — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Fixed fuzzy-match distance of 2 floods short queries with false positives
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: fuzzy-match-threshold-unscaled
- **File**: `src/lib/guide-search.ts:54`
- **Scenario**: A user types a 2–3 character query (the minimum is `q.length >= 2` at `guide-search.ts:66`). `fuzzyWordMatch` accepts any word within Levenshtein distance 2 regardless of word length, so a 2-char query like "ai" is within 2 edits of *every* 2-char word and most 3–4 char words ("run", "app", "tag"…). Tiers 3 and 4 (fuzzy-title, fuzzy-tag) then match nearly every topic, burying real hits under noise until the user types a 4th character.
- **Root cause**: `maxDist = 2` is a magic number applied uniformly; standard practice scales the edit budget to token length (0 for <4 chars, 1 for <7, 2 above). No comment records why a flat 2 was chosen against a 2-char minimum query length. Relatedly, tier 2 at `guide-search.ts:87` uses `tag.includes(q)` but labels it `"exact-tag"` — a substring match ("api" hits the "api-key" tag but also any tag containing "api"), so the matchType name overstates precision.
- **Impact**: Short queries return an alphabetical wall of ~everything at score 5/4, making the first Enter-to-navigate result (`useGuideSearch.ts:143` navigates to `liveResults[0]`) effectively arbitrary. Search quality degrades exactly where users need forgiveness most — the first few keystrokes.
- **Fix sketch**: In `fuzzyWordMatch`, derive the budget from length: `const dist = Math.min(maxDist, target.length < 4 || query.length < 4 ? 0 : target.length < 7 ? 1 : 2)` and skip the levenshtein call when the budget is 0 (substring check already ran). Rename tier 2's matchType to `"tag-substring"` or make it a true equality check with substring demoted a point.

## 2. Companion category is the only one of 11 with no illustration — visibly broken card grid
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: missing-category-illustration
- **File**: `src/data/guide/illustrations.ts:4`
- **Scenario**: On `/guide`, `GuideCategoryGrid.tsx:35,50` looks up `GUIDE_ILLUSTRATIONS[category.id]` and renders the whole `aspect-video` image block conditionally. `companion` (second category in `categories.ts:12` — the flagship Athena feature) has no entry, and no `companion-*.png` exists in `public/imgs/guide/`. Its card renders text-only, roughly half the height of the 10 illustrated cards beside it in the 2/3-column grid. The same gap hits the category detail page (`src/app/guide/[category]/page.tsx:39`).
- **Root cause**: The companion category and its 8 topics were added later (note: `content/companion.ts` exists and is imported by `content/index.ts:2` but is absent from this context's file list — the context map has the same drift) without updating the illustrations registry, and nothing checks that every category id has an illustration entry, unlike the orphan-category invariant in `guide-utils.ts:73`.
- **Impact**: A visibly inconsistent, shorter card for the product's headline feature on the main guide landing page — reads as unfinished, and the ragged grid row misaligns the two cards next to it.
- **Fix sketch**: Add `companion-dark.png` / `companion-light.png` (pink `#ec4899` theme to match the category color) and register them. Cheap guard: extend the module-load invariant in `guide-utils.ts` (or a unit test) asserting `GUIDE_CATEGORIES.every(c => GUIDE_ILLUSTRATIONS[c.id])`; until the asset exists, render a color-tinted placeholder block instead of omitting the image section so card heights stay uniform.

## 3. Search ignores the Simple/Power mode filter that gates browsing
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: mode-filter-search-bypass
- **File**: `src/lib/guide-search.ts:72`
- **Scenario**: The guide landing page filters topics and whole categories by mode (`src/app/guide/page.tsx:27` via `isTopicVisibleForMode`), so a Simple-mode reader never sees power-only categories like Pipelines or Testing while browsing. But `searchGuide` and `searchBodyIndex` filter only on `isTopicVisible` (devOnly); neither accepts a mode filter, and `useGuideSearch` never passes one. Searching "pipeline" in Simple mode surfaces topics the rest of the UI deliberately hides.
- **Root cause**: The two visibility axes are handled asymmetrically with no recorded decision: `devOnly` gating is documented as covering "search results and direct URL access" (`guide-utils.ts:29`), but `mode` gating has no equivalent statement — it's unclear whether search bypassing the mode filter is intentional ("search is the escape hatch") or an omission.
- **Impact**: Inconsistent information architecture: a Simple-mode user lands from search on a topic whose category tile doesn't exist for them, with no breadcrumb path back — undermining the point of the curated Simple view. If intentional, the intent is invisible to the next maintainer, who may "fix" it either way.
- **Fix sketch**: Decide and encode: either add an optional `modeFilter` parameter to `searchGuide`/`searchBodyIndex` (default null = search all) and pass the active mode from the combobox, or add one comment line beside `isTopicVisible` in both loops stating that mode-gated topics are intentionally searchable in all modes.

## 4. TOPIC_MODULE_MAP paths are freehand strings with no validation against DESKTOP_MODULES
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: module-map-unvalidated-drift
- **File**: `src/data/guide/desktop-modules.ts:174`
- **Scenario**: Every "Find in App: X → Y → Z" badge is driven by hand-typed `path` arrays that nothing checks against the `DESKTOP_MODULES` hierarchy. Drift already exists: `github-actions-integration` (line 623) points at `["Deployment", "GitLab Panel"]` — a GitHub topic directing users to the GitLab panel with no comment saying that panel hosts both integrations; many paths insert an `"Editor"` segment (e.g. `["Agents", "Editor", "Prompt"]`) that has no corresponding node — the `agents` module's children are flat `editor-*` ids; and `["Overview", "Activity", "History"]` names a third level the registry doesn't model at all.
- **Root cause**: Two parallel representations of the desktop app's navigation (structured `DESKTOP_MODULES` vs. stringly `path` arrays) with no invariant tying them together — in contrast to the orphan-categoryId check that guards topics (`guide-utils.ts:73-83`). Only `moduleId` could be validated today, and even that isn't.
- **Impact**: As the desktop app's sidebar evolves (this file exists precisely because it drifts — see `TopicCoverage.watchedFiles`), the guide silently ships wrong in-app directions; the GitHub→GitLab-panel mapping is either already wrong or correct-for-unstated-reasons, and no reviewer can tell which.
- **Fix sketch**: Add a module-load (or unit-test) invariant: every `TOPIC_MODULE_MAP` value's `moduleId` exists in `DESKTOP_MODULES`, `path[0]` equals that module's label, and `path[1]`, when present and not a documented virtual segment, matches a child label. Whitelist virtual segments like "Editor"/"History" in one commented list, and add a one-line comment on the GitHub Actions entry recording why it lives in the GitLab panel.

## 5. Failed locale imports are never memoized and all failure modes are silently swallowed
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: locale-fallback-swallows-errors
- **File**: `src/data/guide/getLocalized.ts:48`
- **Scenario**: `loadLocaleTopics`/`loadLocaleContent` cache the module thunk only on success; a failed `import()` returns null without populating the cache, so every subsequent lookup for an untranslated locale re-attempts the dynamic import (and, in a browser context, potentially a network fetch per topic view). Worse, the bare `catch {}` treats "locale not translated yet" (expected) identically to "translated file has a syntax/shape error" (a real bug) — both silently fall back to English.
- **Root cause**: The happy path (translation exists) and the expected-miss path were designed for, but the failure path was not differentiated; the comment at line 44-47 documents only the missing-locale case. Negative results were deliberately not cached to allow retries, but that reasoning is unrecorded and the retry has no backoff or once-only semantics.
- **Impact**: When the dormant locale switcher activates (the stated purpose of this file), a broken translation file degrades to English with zero signal — translators and maintainers can't tell a missing translation from a crashed one — and untranslated locales pay a failed import on every topic navigation.
- **Fix sketch**: Memoize failures too (`localeTopicsModules[lang] = async () => null` in the catch), and log once per key in development (`if (process.env.NODE_ENV !== "production") console.warn(...)`) so real module errors surface while production keeps the silent English fallback.
