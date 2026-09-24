# Translate-guide subagent prompt template

This is the canonical prompt for a Claude subagent that translates the
personas-web user guide into a single target locale. The orchestrator
spawns one subagent per non-English locale (13 total) and substitutes the
placeholders below.

Companion scripts:
- `scripts/i18n/emit-source-hashes.mjs` — produces the per-topic source-hash
  manifest the subagent bakes into `_meta.json`.
- `scripts/i18n/check-guide-translations.mjs` — drift detector. It anchors
  each locale's stored hash to the English revision it was taken from and
  reports only real English changes as stale (line-ending and extractor
  churn is named and folded into fresh). `--work-order` prints, per topic,
  the locales to refresh and the English line diff since the translation:
  that output is `<WORK_ORDER_PATH>` for the refresh mode below.

Companion data:
- `docs/i18n/glossary.md` — do-not-translate terms and the UNRESOLVED tier
  names. The prompt points at it rather than copying it, so one edit reaches
  every run.

---

## Prompt template

```
You are translating the personas-web user guide into <LOCALE_NAME> (ISO code: <LOCALE_CODE>).

REPO ROOT: <WORKTREE_ABSOLUTE_PATH>

## Unit context

- Action: <ACTION>. `full` = translate every guide topic into this locale
  (the sections below as written). `refresh` = bring existing translations
  up to date with the English edits listed in the work order; follow
  "Refresh mode" below, which overrides "What to write" and "How to work".
- Surface: each topic body is Markdown rendered as a page of the public
  user guide on the website; titles and descriptions appear in the guide's
  navigation and search. Readers are users of the Personas desktop app.
- Units: a topic id (kebab-case key) with its title, description and body.
  Translate a category file as a whole so neighbouring topics stay
  consistent with each other.
- Counts: the authoritative topic count is the number of keys under
  `hashes` in the source-hash manifest (116 when this template was last
  verified, 2026-09-14). The English guide has 11 category files.

## What to read

English source content (11 files):
  <WORKTREE>/src/data/guide/content/getting-started.ts
  <WORKTREE>/src/data/guide/content/companion.ts
  <WORKTREE>/src/data/guide/content/agents-prompts.ts
  <WORKTREE>/src/data/guide/content/triggers.ts
  <WORKTREE>/src/data/guide/content/monitoring.ts
  <WORKTREE>/src/data/guide/content/credentials.ts
  <WORKTREE>/src/data/guide/content/testing.ts
  <WORKTREE>/src/data/guide/content/pipelines.ts
  <WORKTREE>/src/data/guide/content/deployment.ts
  <WORKTREE>/src/data/guide/content/memories.ts
  <WORKTREE>/src/data/guide/content/troubleshooting.ts

English topic metadata (titles + descriptions):
  <WORKTREE>/src/data/guide/topics.ts

Source-hash manifest (precomputed):
  <SOURCE_HASHES_PATH>

Glossary (do-not-translate terms, UNRESOLVED terms):
  <WORKTREE>/docs/i18n/glossary.md

## What to write

Topic titles + descriptions for this locale:
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/topics.ts

Topic bodies, one file per category:
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/content/getting-started.ts
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/content/companion.ts
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/content/agents-prompts.ts
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/content/triggers.ts
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/content/monitoring.ts
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/content/credentials.ts
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/content/testing.ts
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/content/pipelines.ts
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/content/deployment.ts
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/content/memories.ts
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/content/troubleshooting.ts

Provenance metadata:
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/_meta.json

## Output file shapes (EXACT — must compile)

### topics.ts (per locale)

```ts
export const topics: Record<string, { title: string; description: string }> = {
  "installing-personas": {
    title: "<TRANSLATED TITLE>",
    description: "<TRANSLATED DESCRIPTION>",
  },
  "creating-your-first-agent": { /* ... */ },
  // ... one entry per topic id in the manifest (116 at last verification)
};
```

### content/<category>.ts (per locale, per category — same shape as English)

```ts
export const content: Record<string, string> = {
  "installing-personas": `
## <TRANSLATED H2>

<TRANSLATED BODY — markdown preserved exactly per rules below>
  `,
  // ... one entry per topic id within this category
};
```

### _meta.json

```json
{
  "locale": "<LOCALE_CODE>",
  "localeName": "<LOCALE_NAME>",
  "translatedAt": "<ISO_TIMESTAMP>",
  "translator": "claude-opus-4-7",
  "topics": {
    "installing-personas": {
      "translatedFromHash": "<HASH from the source-hashes manifest>",
      "translatedAt": "<ISO_TIMESTAMP>"
    },
    "creating-your-first-agent": { /* ... */ },
    // ... every topic that you translated (all topics in the manifest)
  }
}
```

## Translation rules

### DO translate
- All English prose, including inside `:::compare:::`, `:::steps:::`,
  `:::tip:::`, `:::warning:::`, `:::info:::`, `:::usecases:::`,
  `:::checklist:::`, `:::feature:::`, `:::code-compare:::`, `:::diagram:::`,
  `:::keys:::` blocks.
- Headings (### …, ## …).
- Table cell contents (translate the prose; preserve `|` and `---` structure).
- Step labels, list items, callout titles.
- The H2 header of each topic body (usually the topic title).

### DO NOT translate

**Markdown structural markers (the meta-language of the renderer):**
- `:::compare:::`, `:::steps:::`, `:::tip:::`, `:::warning:::`, `:::info:::`,
  `:::usecases:::`, `:::checklist:::`, `:::feature:::`, `:::code-compare:::`,
  `:::diagram:::`, `:::keys:::`, `:::` (the closing fence).
- `---` separators inside `:::compare:::` and `:::usecases:::` blocks.
- `===` separators inside `:::usecases:::` blocks.
- `[recommended]` badge marker — keep as `[recommended]` verbatim.
- `color=#XXXXXX` attribute on `:::feature:::` blocks — keep verbatim.
- Markdown emphasis markers `**bold**` and `*italic*` — translate the text
  between them, keep the markers.
- Markdown links `[text](url)` — translate the link text, keep the URL.
- Numbered list markers (`1.`, `2.`, ...) — keep the numbering structure.
- Table pipe characters `|` and dash rows `|---|---|`.

**Code, identifiers, brand names:**
- Anything inside backticks `like-this` — keep verbatim. Includes file paths,
  shortcuts like `Ctrl+K`, code snippets, button labels in code-style.
- Brand names, product names, technical terms and trigger-type labels: the
  lists live in `docs/i18n/glossary.md` sections 1–4. Read it once before
  translating. For each unit, apply the entries that occur in that unit.
- Trigger-type labels ("Manual", "Schedule", "Webhook", ...) stay verbatim
  only when used as labels — DO translate them when they appear as natural
  prose, e.g. "schedule triggers run at configured times" should fully
  translate.
- Tier names are UNRESOLVED (glossary section 5): the English source uses
  three conflicting sets. Keep whichever tier name the English unit uses,
  verbatim, in that unit. Never normalize to another set, and never pick
  one. List every topic that carries a tier name in your summary.

**Edge cases:**
- Topic IDs (kebab-case keys like `installing-personas`) — these are
  identifiers, never translate, never change.
- Tag arrays (`tags: ["getting-started", ...]`) — identifiers, do not
  translate, do not include in your output (they're not in your output
  scope).
- Locale-specific punctuation IS allowed: Japanese 「」 instead of "",
  Arabic comma ، etc. — use them where natural.

## Plural forms

- This locale's CLDR plural categories: <PLURAL_CATEGORIES>.
- Guide bodies are static prose with no runtime counts, so nothing selects
  a form at runtime: write every number-plus-noun in the form this
  locale's grammar requires for that number, using the full category set
  above (for example cs and ru distinguish one / few / many).
- Known site limitation, out of scope here: the site's UI strings
  (`src/i18n/*.ts`) carry only `xOne` / `xOther` pairs selected with
  `n === 1`, so locales with more categories get a wrong form in the UI.
  Do not add plural keys or restructure anything to work around it.

## Style guidance for the locale

- Tone: helpful, conversational, second-person ("you"). Match the source
  tone — concrete, direct, no marketing fluff.
- Direction: only Arabic (ar) is right-to-left (the site marks only `ar`
  as RTL in `src/stores/i18nStore.ts`). For ar, preserve LTR markdown
  structures and translate prose RTL. Hindi (hi) and Bengali (bn) are
  left-to-right scripts; treat them like any LTR locale.
- For CJK languages (zh, ja, ko): no spaces between CJK characters; spaces
  only between CJK and Latin / numbers / code spans as conventional.
- Sentence length: feel free to restructure to match locale grammar; do
  not preserve English sentence boundaries dogmatically.
- Numeric formats and dates: keep as English numerals; the source uses
  ISO-style dates and Arabic numerals universally.

## How to work

1. Read the source-hash manifest at `<SOURCE_HASHES_PATH>` once. You'll
   reference its hash values when writing `_meta.json`, and its `hashes`
   key count is the number of topics you must translate.
2. Read `docs/i18n/glossary.md` once.
3. Read each of the 11 English content files in turn. Skip
   `content/index.ts` (it's just an aggregator).
4. Read `topics.ts` to get the title + description for each topic id.
5. For each category file, produce the translated `content/<category>.ts`
   in the locale directory. Write it as one complete file. Do NOT try to
   stream incrementally.
6. After all category files are done, produce `topics.ts` for the locale
   with translated titles + descriptions for every topic in the manifest.
7. Finally, produce `_meta.json` with the source hashes from step 1.

## Refresh mode (only when Action is `refresh`)

Work order (English deltas since each translation):
  <WORK_ORDER_PATH>

1. Read the work order. Act only on entries whose `locales` list includes
   <LOCALE_CODE>. Every entry names a topic id, the English revision the
   current translation was made from, and the English change since then:
   title and description as `"old" -> "new"`, body as a line diff (`-`
   removed, `+` added, ` ` unchanged context, `@@` elided unchanged text).
2. For each topic, open the EXISTING translation in
   `locales/<LOCALE_CODE>/content/<category>.ts` (and `topics.ts` when the
   title or description changed). Apply the delta: rewrite the passages
   the diff changes, add translations of added lines, delete the
   translation of removed lines. Leave unchanged passages as they are - do
   not re-translate or re-style them.
3. Read the full current English body once as well, so the refreshed
   passages fit it; the diff is the work order, not the whole context.
4. In `_meta.json`, set `translatedFromHash` (and `translatedAt`) to the
   CURRENT hash from the source-hash manifest - only for the topics you
   refreshed. Never re-pin a topic you did not change: a pin says "this
   translation reflects that English", and re-pinning without the edit
   hides staleness from the detector.
5. Entries marked `present-unpinned` have no `_meta.json` entry yet; after
   refreshing, add one with the current hash.
6. Topics not in the work order are out of scope: do not touch them, even
   if you notice something you would phrase differently.

The translation rules, style guidance and verification below apply to
every passage you write. In your summary, list each refreshed topic id
and the fields you changed.

## Verification before returning

Before you finish, verify your output:

1. Every category file you wrote starts with
   `export const content: Record<string, string> = {` and ends with `};\n`.
2. Your `topics.ts` starts with
   `export const topics: Record<string, { title: string; description: string }> = {`
   and ends with `};\n`.
3. Your `_meta.json` is valid JSON (no trailing commas, all strings quoted).
4. The topic-id keys in your output files match the English source byte-
   for-byte (kebab-case, English slug — NEVER translate the keys).
5. Every topic id from the English `topics.ts` appears in your locale
   `topics.ts`.
6. Every topic id from each English `content/<category>.ts` appears in the
   matching locale `content/<category>.ts`.
7. No title, description or body is shorter than its English source unless
   you flagged it (see Done criteria).

If any verification fails, fix the file and re-verify before returning.

## Done criteria

Return a one-paragraph summary naming:
- How many topics were translated (expected: the manifest's `hashes` key
  count; 116 at last verification)
- How many category files were written (expected: 11)
- FLAGGED SHORTER FIELDS: every title, description or body you wrote
  shorter than the English source, as `topic-id · field · reason`. A
  shorter field is never silently allowed; if you cannot give a reason,
  restore the omitted content instead.
- Every topic carrying a tier name (glossary section 5, UNRESOLVED)
- Any verification check that failed and how you resolved it
```

---

## Substitution map for the orchestrator

When spawning a subagent, replace these placeholders in the prompt above:

| Placeholder              | Example value                                              |
| ------------------------ | ---------------------------------------------------------- |
| `<LOCALE_NAME>`          | "Chinese (Simplified)" / "Arabic" / "Hindi" / etc.         |
| `<LOCALE_CODE>`          | `zh` / `ar` / `hi` / `ru` / `id` / `es` / `fr` / `bn` / `ja` / `vi` / `de` / `ko` / `cs` |
| `<WORKTREE>`             | absolute path to the personas-web worktree                 |
| `<WORKTREE_ABSOLUTE_PATH>` | same as `<WORKTREE>`                                     |
| `<SOURCE_HASHES_PATH>`   | path to the JSON manifest emitted by `emit-source-hashes.mjs` |
| `<ACTION>`               | `full` (bootstrap a locale) or `refresh` (apply a work order) |
| `<WORK_ORDER_PATH>`      | refresh only: file holding `node scripts/i18n/check-guide-translations.mjs --work-order` output |
| `<PLURAL_CATEGORIES>`    | derived, never hand-typed: `new Intl.PluralRules("<LOCALE_CODE>").resolvedOptions().pluralCategories.join(", ")` |

`<PLURAL_CATEGORIES>` as Node 24 resolves it (2026-09-14): ar zero, one, two,
few, many, other · bn one, other · cs one, few, many, other · de one, other ·
es one, many, other · fr one, many, other · hi one, other · id other ·
ja other · ko other · ru one, few, many, other · vi other · zh other.
