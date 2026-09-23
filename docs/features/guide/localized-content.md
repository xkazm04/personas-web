# Localized Guide Content (14 locales)
> Hand-translated guide topics + per-module articles for the 13 non-English locales, mirroring the English guide-data shape with independent per-field English fallback. · **Route:** n/a (data layer) · **Status:** Translations (13 non-en locales)

## What it does
The `/guide/*` section ships its long-form help content (topic titles, descriptions, and article bodies) in 14 languages. English is the source of truth under `src/data/guide/`; the 13 non-English locales (`ar`, `bn`, `cs`, `de`, `es`, `fr`, `hi`, `id`, `ja`, `ko`, `ru`, `vi`, `zh`) each carry a hand-translated mirror under `src/data/guide/locales/<lang>/`. A single resolver, `getLocalizedTopic`, looks up the translated `title`, `description`, and `body` for a topic in the active locale and falls back to English **per field** when a locale, file, or key is missing — so a partially translated topic never renders blank, only mixed.

This is currently **dormant infrastructure**: the `i18nStore` is hard-locked to `en` (`setLanguage` is a no-op), so the resolver always takes the `lang === "en"` early-return in practice. The translations exist and compile so that activating the locale switcher requires no change to the guide pages — the swap is already wired (`TopicView.tsx:36-86`).

## How it works
- The guide topic page renders English on the server (no locale signal in URL/cookie today), passing the English `content` body into `TopicView` as a prop.
- On the client, `TopicView` reads `language` from `useI18nStore`. When it is not `en`, a `useEffect` calls `getLocalizedTopic(language, topic.id, englishBody)` and swaps the resolved fields into local state (`TopicView.tsx:77-86`). A render-time prev-state reset (`TopicView.tsx:54-59`) restores the English fallback first on any locale/topic change, satisfying React 19's no-setState-in-effect rule.
- `getLocalizedTopic` (`getLocalized.ts:87`) resolves three fields independently:
  1. **title / description** ← `locales/<lang>/topics.ts` keyed by `topicId` (`getLocalized.ts:111`)
  2. **body** ← `locales/<lang>/content/<categoryId>.ts` keyed by `topicId` (`getLocalized.ts:112`)
  3. **English fallback** ← `GUIDE_TOPICS` for title/description, the passed-in `englishBody` for body (`getLocalized.ts:115-118`)
- Locale modules are loaded lazily via dynamic `import()` and memoized in module-level registries (`getLocalized.ts:47-77`). A failed import (missing locale dir or category file) is swallowed in a `try/catch` and returns `null`, which the `?? english` fall-through turns into an English render. `lang === "en"` short-circuits to `null` so English never hits the dynamic import.
- The two locale lookups run in parallel via `Promise.all` (`getLocalized.ts:106-109`). `englishBody` is passed in (not re-fetched) because the page already has it — avoids a double-load of the lazy category file.
- Category name/description are **not** in this folder; they live in `src/i18n/<lang>.ts` under `guide.categories` / `guide.categoryDescriptions` and are resolved by the synchronous `getLocalizedCategoryFromI18n` helper (`getLocalized.ts:128`).

## Key files
| File / pattern | Role |
| --- | --- |
| `src/data/guide/getLocalized.ts` | Resolver: per-field locale lookup + English fallback; lazy dynamic-import registries |
| `src/data/guide/locales/<lang>/topics.ts` | Per-locale `topics: Record<topicId, { title; description }>` (13 files, one per non-en locale; 116 keys each) |
| `src/data/guide/locales/<lang>/content/*.ts` | Per-locale article bodies, one file per category: `getting-started`, `companion`, `agents-prompts`, `credentials`, `triggers`, `pipelines`, `memories`, `monitoring`, `testing`, `deployment`, `troubleshooting` (11 files × 13 locales) |
| `src/data/guide/topics.ts` | English source: `GUIDE_TOPICS: GuideTopic[]` (116 topics, the fallback + key universe) |
| `src/data/guide/content/*.ts` + `content/index.ts` | English source bodies the locales mirror; `index.ts` merges them into `GUIDE_CONTENT` |
| `src/data/guide/categories.ts` | English `GUIDE_CATEGORIES` (category fallback) |
| `src/app/guide/[category]/[topic]/TopicView.tsx` | Only consumer; client-side locale swap with English-first fallback |
| `src/data/guide/locales/<lang>/_meta.json` | Per-locale translation pins: `topics[id].translatedFromHash` = hash of the English unit the translation was made from (97 pins x 13 locales, identical across locales) |
| `scripts/i18n/guide-source.mjs` | The pin definition (extraction + sha1) shared with the emitter, plus the named instrument variants (`extractBodiesLegacy`, `normaliseEol`) used only to verify old pins |
| `scripts/i18n/guide-drift.mjs` | History-anchored drift classifier: anchors each pin to an English git revision, names the cause of every difference, builds the work order |
| `scripts/i18n/check-guide-translations.mjs` | CLI over the classifier (`npm run check:guide-translations`; `--strict`, `--json`, `--work-order`, `--locale=`, `--topic=`) |
| `scripts/i18n/translate-guide-subagent-prompt.md` | Translator prompt; `full` bootstrap mode and `refresh` mode fed by `--work-order` |

Total locale payload: 13 locales × (1 `topics.ts` + 11 content files) = **156 files**. Key parity (every locale's topic-id set == English) is guarded by `scripts/guide-i18n-audit.mjs`, which currently reports 116/116 titles + bodies across all 13 locales.

## Translation freshness (drift detector)
Freshness is a tooling concern only: no runtime code reads `_meta.json` today. `check-guide-translations.mjs` (a thin CLI) runs `classifyGuide` from `scripts/i18n/guide-drift.mjs`:
- A pin byte-equal to today's hash is `fresh / exact` and needs no history.
- Any other pin is **anchored**: the classifier walks the English guide revisions (`src/data/guide/content`, `topics.ts`) committed at or before the pin's `translatedAt`, newest first (at most 16), and recomputes the pin at each under the closed variant set {scanner, legacy regex} x {CRLF, LF}. The first byte-equal match is the English the translator saw.
- It then compares the **normalised** unit (title, description, full body, LF) at the anchor with the working tree: equal -> `fresh / instrument:eol` or `instrument:extractor`; different -> `stale / content`, carrying both hashes, the anchor revision and a line diff. A pin no variant reproduces is `stale / unverified`, never fresh.
- A topic with no pin whose body the locale carries is `missing / present-unpinned`, anchored to the commit that added the key to the locale file; `missing / absent` means no body at all.
- `--strict` exits 1 on any stale or missing and 0 when the only differences are `instrument:*`. Missing history (shallow clone, no git) exits **3** with "history unavailable" and prints no numbers. Usage errors exit 2.
- `--work-order` groups content-stale topics (and present-unpinned topics whose English changed since they landed) across locales with the English diff. The translator prompt's `refresh` mode consumes it.
- Measured 2026-09-23: the old bare-hash comparison reported 871 issues (13 x (48 stale + 19 missing)). The classifier reports 559: per locale, 24 content-stale, 19 present-unpinned (1 of them with English changed since, `companion` category), 49 exact, and 24 instrument (16 EOL: `memories.ts` and `troubleshooting.ts` are LF on the Windows checkout; 8 from the 071c13d extractor fix) folded into fresh. All 97 pins verify at `5cfc87d`; 0 unverified.
- No pin is rewritten by any of this. The CRLF hash definition in `guide-source.mjs` stands, and so does CI's decision not to run the detector (CI clones are shallow; wiring it needs `fetch-depth: 0`).

## Data & state
- **Source:** static TS modules — `src/data/guide/locales/<lang>/{topics,content/*}.ts`, mirroring `src/data/guide/{topics,content/*}.ts`. Bodies are raw markdown-ish strings (custom `:::steps`, `:::info`, `:::tip`, `:::compare`, `:::cards`, `:::diagram`, `:::usecases` directives parsed by `GuideMarkdown`).
- **Stores:** `useI18nStore` (`@/stores/i18nStore`) supplies `language`; today pinned to `en`. No store owns the resolved content — it lives in `TopicView` local `useState`.
- **API routes:** none. Pure data layer resolved client-side via dynamic `import()`.
- **Types:** `LocalizedTopicFields { title; description; body }`, `LocaleTopicsModule { topics: Record<string, {title?; description?}> }`, `LocaleContentModule { content: Record<string, string> }` (`getLocalized.ts:23-35`); `Language` from `@/stores/i18nStore`; `GuideTopic` / `GuideCategory` from `@/data/guide/types`.

## Integration points
- **i18nStore** — gates the whole feature; `getLocalizedTopic` is a no-op while `language === "en"`. The translations are inert until the locale switcher is wired.
- **TopicView** (`src/app/guide/[category]/[topic]/TopicView.tsx`) — sole caller; also derives headings/reading-time from the resolved `body`, so a locale swap re-parses the TOC.
- **Category strings** flow through `src/i18n/<lang>.ts` (the UI bundle), not this folder — two parallel localization systems meet on the guide page.
- **GuideMarkdown** renders the resolved body; locale strings must use the same custom directive syntax as English or they render as literal text.
- **`GUIDE_TOPICS` is the key universe** — a topic added there with no matching locale key simply falls back to English; no error.

## Conventions & gotchas
- **Per-field fallback, not per-topic.** A topic with a translated title but a missing body key renders the translated title over the English body (`getLocalized.ts:114-118`). This is intentional but means a half-finished translation ships mixed-language rather than failing loudly.
- **No `_registry.ts` exists.** The resolver's header comment (`getLocalized.ts:44-46`) references a "per-locale subagent-produced `_registry.ts`" that the module imports lazily — that file was never created. The actual mechanism is the template-literal dynamic `import()` at `getLocalized.ts:51` and `:69`. Treat the comment as stale; the glob/registry described there is aspirational.
- **Bodies can be out of sync with English even though keys match.** Counts line up — each locale now has 116 topic keys and 12 `getting-started` content keys, matching English — but key parity does **not** imply prose freshness. Example: English `content/getting-started.ts` describes a **Windows-only** product with a **"Precondition: Install Claude Code"** section and a `:::cards` platform-availability block (`content/getting-started.ts:2-37`); the DE and JA `installing-personas` bodies still describe **Windows/macOS/Linux all available** with **no Claude Code precondition** (`locales/de/content/getting-started.ts:2-24`, `locales/ja/content/getting-started.ts:2-24`). So shape-sync (enforced by `tsc` / key parity) does **not** imply content-sync. Re-translating after English edits is still a manual step, but it is no longer unguided: `npm run check:guide-translations -- --work-order` lists every topic whose English changed since its translation (`installing-personas` among the 24), with the English diff, and `--strict` fails on it. Nothing wires the check into pre-push or CI yet.
- **Hand-translation is required.** Per project rules and MEMORY, every non-en string must be hand-translated — no English placeholders. The samples confirm this (DE/JA are fully localized, including the custom directive labels and Anthropic/Claude/OpenAI proper nouns left as brand names).
- **Locale files are mojibake on disk.** Non-en `src/i18n/*.ts` are UTF-8+BOM with double-encoded values; the same caution applies when editing these guide locale files — anchor edits on pure-ASCII keys (the topic IDs and directive markers), write correct UTF-8, and don't attempt to "fix" existing encoding.
- **`description?` and `title?` are optional in the topics type** (`getLocalized.ts:30`) so a locale may translate only one of the pair; each falls back independently.
- **Failed imports are silent.** A typo'd category filename or a missing locale dir yields `null` and an English render with no console warning — easy to miss a whole untranslated category.
- **Category set is 11** (`getting-started`, `companion`, `agents-prompts`, `credentials`, `triggers`, `pipelines`, `memories`, `monitoring`, `testing`, `deployment`, `troubleshooting`). All 13 locales are complete on file presence — every locale has `topics.ts` + all 11 content files (including the newest `content/companion.ts` for the Athena category). Note: the `companion` category **name/description** in the grid is not yet in `src/i18n/<lang>.ts` — it renders from the English `categories.ts` via the grid's fallback until that chrome string is translated (a small separate follow-up; the topic titles/descriptions/bodies *are* fully translated here).

## Related docs
- [Guide Data & Content](data-content.md)
- [Internationalization (UI bundle)](../platform/internationalization.md)
- [Feature index](../INDEX.md)
