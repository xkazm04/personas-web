# Guide i18n batch 2 — translate the 16 new guide topics into your locale

You are translating **16 new guide topics** (English source already in the repo) into ONE
assigned locale. These topics exist in English but are missing from every non-en locale.
Your job: hand-translate all 16 (title + description + body) and write them into your locale's
files. The same gap exists in all 13 locales; you own exactly one.

## The 16 topics, grouped by the file their BODY belongs in

**A. Companion / Athena** — category `companion`. Bodies live in a NEW file
`src/data/guide/content/companion.ts` (English source to translate from):
1. `meet-athena`
2. `chatting-with-athena`
3. `voice-and-hold-to-talk`
4. `athenas-long-term-memory`
5. `proactive-check-ins`
6. `guided-walkthroughs`
7. `the-decision-hub`
8. `operating-by-chat`

**B. Getting Started additions** — category `getting-started`. Bodies live in
`src/data/guide/content/getting-started.ts` (find these keys for the English source):
9. `browsing-templates`
10. `adopting-a-template`
11. `recipes`
12. `interface-modes`

**C. Monitoring additions** — category `monitoring`. Bodies live in
`src/data/guide/content/monitoring.ts` (find these keys):
13. `tracking-goals`
14. `measuring-outcomes-with-kpis`
15. `director-verdicts-and-categories`
16. `director-momentum-and-stale-sweep`

All 16 titles + descriptions are in `src/data/guide/topics.ts` (grep each id).

## What to write in YOUR locale (`src/data/guide/locales/<lang>/`)

1. **`content/companion.ts`** — CREATE this file. Mirror the English file's shape exactly:
   start with `export const content: Record<string, string> = {` … `};`. Put the 8 translated
   Companion bodies in it (keys 1–8 above). (A short header comment is fine but optional.)
2. **`content/getting-started.ts`** — APPEND the 4 translated bodies (keys 9–12) before the
   final `};`. Keep all existing entries intact.
3. **`content/monitoring.ts`** — APPEND the 4 translated bodies (keys 13–16) before the final
   `};`. Keep all existing entries intact.
4. **`topics.ts`** — APPEND all 16 translated `{ title, description }` entries (keyed by id)
   before the final `}`. Keep existing entries intact.

Do NOT touch `src/i18n/*` (the category-name chrome is handled separately), English source
files, or any other locale.

## Hard rules (same discipline as the last batch)

1. **Hand-translate, native quality. No English placeholders, no machine-translation feel.**
2. **Match your locale's existing conventions.** BEFORE translating, read 2–3 existing entries
   in your locale's own `topics.ts`, `content/getting-started.ts`, and `content/monitoring.ts`
   to copy the register/form of address and the established terminology for product nouns
   (`agent`, `pipeline`, `team`, `goal`, `template`, `connector`, `vault`, `memory`, `trigger`).
3. **Product / proper nouns:** keep **Personas**, **Athena**, **Obsidian Brain**, and connector
   names as-is. For **Director**, **vault**, **team/pipeline**, follow how existing entries in
   your locale already render them — be consistent.
4. **Preserve markdown structure EXACTLY.** Translate prose only. Do not translate/alter:
   - block fences `:::steps` `:::checklist` `:::compare` `:::tip` `:::info` and their closing `:::`,
   - the `---` separators inside `:::compare`,
   - the `[recommended]` tag in compare titles (leave it literally `[recommended]`),
   - heading levels (`##`, `###`), list markers (`-`, `1.`), bold `**…**`, links `[text](url)`.
   Keep the same number of bullets/steps and the `**Bold label** — text` shape in lists.
5. **Template-literal safety.** Bodies are JS backtick literals. Keep inline-code backticks
   escaped (`` \` ``) exactly as the English source does. Never introduce a raw unescaped
   backtick or a `${` sequence in translated text.
6. **UTF-8 clean.** Write native characters directly (this `locales/**` tree is clean UTF-8,
   NOT the mojibake `src/i18n` tree). No BOM, no `\uXXXX` escapes.
7. Match the existing 2-space indentation and the per-entry whitespace pattern (newline after
   the opening backtick; a line with just two spaces before the closing backtick).

## Self-check before finishing
- All 16 ids present: 8 in `content/companion.ts`, 4 in `content/getting-started.ts`, 4 in
  `content/monitoring.ts`, and all 16 in `topics.ts`.
- Each file still parses: balanced backticks, every `:::` block closed, trailing commas correct,
  objects close with `}`/`};`.
- No English prose left in your additions. Backtick escapes preserved.
