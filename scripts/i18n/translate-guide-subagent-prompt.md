# Translate-guide subagent prompt template

This is the canonical prompt for a Claude subagent that translates the
personas-web user guide into a single target locale. The orchestrator
spawns one subagent per non-English locale (13 total) and substitutes the
placeholders below.

Companion scripts:
- `scripts/i18n/emit-source-hashes.mjs` — produces the per-topic source-hash
  manifest the subagent bakes into `_meta.json`.
- `scripts/i18n/check-guide-translations.mjs` — drift detector that
  compares current English hashes vs. each locale's stored hashes; used
  on later sessions to identify topics that need re-translation.

---

## Prompt template

```
You are translating the personas-web user guide into <LOCALE_NAME> (ISO code: <LOCALE_CODE>).

REPO ROOT: <WORKTREE_ABSOLUTE_PATH>

## What to read

English source content (8 files):
  <WORKTREE>/src/data/guide/content/getting-started.ts
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

## What to write

Topic titles + descriptions for this locale:
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/topics.ts

Topic bodies, one file per category:
  <WORKTREE>/src/data/guide/locales/<LOCALE_CODE>/content/getting-started.ts
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
  // ... one entry per topic id, all 102
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
    // ... all 102 topics that you translated
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
- Brand names: **Personas**, **Claude**, **Anthropic**, **Athena** (the
  cockpit chatbot), **Cockpit**, **Director**.
- Product names: OpenAI, Google, Gemini, Ollama, GitHub, GitLab, Slack,
  Discord, Microsoft Teams, n8n, Stripe, Sentry, Linear, HubSpot,
  Salesforce, Pipedrive, Twitter/X, LinkedIn, Facebook, Mastodon,
  Telegram, Twilio.
- Technical terms: API, CLI, JSON, HTTPS, HTTP, URL, REST, GraphQL, cron,
  webhook, OAuth, PAT, SQLite, Postgres, Snowflake, BigQuery, S3, DPAPI,
  Keychain, Vault, KMS, OIDC, SSO, TLS, Docker, Kubernetes, Helm, BYOI,
  KpiTile, AES-256-GCM, GCM, SHA, ONNX.
- Tier names: Starter, Team, Builder.
- Tool / capability names that are short technical labels (e.g.
  "Manual", "Schedule", "Webhook", "Clipboard", "File Watcher", "Chain",
  "Event-Based" when used as trigger-type labels — but DO translate them
  when they appear as natural prose, e.g. "schedule triggers run at
  configured times" should fully translate).

**Edge cases:**
- Topic IDs (kebab-case keys like `installing-personas`) — these are
  identifiers, never translate, never change.
- Tag arrays (`tags: ["getting-started", ...]`) — identifiers, do not
  translate, do not include in your output (they're not in your output
  scope).
- Locale-specific punctuation IS allowed: Japanese 「」 instead of "",
  Arabic comma ، etc. — use them where natural.

## Style guidance for the locale

- Tone: helpful, conversational, second-person ("you"). Match the source
  tone — concrete, direct, no marketing fluff.
- For RTL languages (ar, hi): preserve LTR markdown structures; translate
  prose RTL.
- For CJK languages (zh, ja, ko): no spaces between CJK characters; spaces
  only between CJK and Latin / numbers / code spans as conventional.
- Sentence length: feel free to restructure to match locale grammar; do
  not preserve English sentence boundaries dogmatically.
- Numeric formats and dates: keep as English numerals; the source uses
  ISO-style dates and Arabic numerals universally.

## How to work

1. Read the source-hash manifest at `<SOURCE_HASHES_PATH>` once. You'll
   reference its hash values when writing `_meta.json`.
2. Read each of the 10 English content files in turn. Skip
   `content/index.ts` (it's just an aggregator).
3. Read `topics.ts` to get the title + description for each topic id.
4. For each category file, produce the translated `content/<category>.ts`
   in the locale directory. Write it as one complete file. Do NOT try to
   stream incrementally.
5. After all category files are done, produce `topics.ts` for the locale
   with translated titles + descriptions for all 102 topics.
6. Finally, produce `_meta.json` with the source hashes from step 1.

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

If any verification fails, fix the file and re-verify before returning.

## Done criteria

Return a one-paragraph summary naming:
- How many topics were translated (expected: 102)
- How many category files were written (expected: 10)
- Any topic where you intentionally left a field shorter than the English
  source because the locale doesn't need that much detail (rare; the
  defaults should be fine)
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
