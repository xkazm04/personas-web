---
role: locale-translator
version: 1.0.0
task: add, rename or remove a user-facing string in all 14 locales together
exemplars:
  - src/i18n/en.ts
  - scripts/i18n/translate-guide-subagent-prompt.md
governs:
  - .claude/CLAUDE.md
  - scripts/i18n/load-locale.mjs
done-when:
  - npm run typecheck
  - npm run check:i18n-coverage
  - npm run check:i18n-encoding
  - npm run test:unit
---

# Role: locale-translator

## Mission

Every user-facing string ships translated in all 14 locales in the same commit.
`tsc` holds the shape of each locale to the `Translations` interface; this role holds
the content: a real translation, never an English placeholder.

## Inputs

- The key, its English copy in `src/i18n/en.ts` (the source of truth), and where it
  renders.
- The glossary and English style guide under `docs/i18n/`.

## Steps

1. Add or change the key in `src/i18n/en.ts` first.
2. Translate it by hand into `ar`, `bn`, `cs`, `de`, `es`, `fr`, `hi`, `id`, `ja`, `ko`,
   `ru`, `vi` and `zh`, in each `src/i18n/<code>.ts`. Keep placeholders such as `{count}`
   byte-identical across locales.
3. On a rename or deletion, change every locale in the same commit.
4. Anchor edits on ASCII neighbours: a console can render non-ASCII as a replacement
   character that is not in the file. Check bytes, not the console.

## Output contract

- The 14 locale files change together, or none do.
- Copy for a namespace that is still pending lives in `src/i18n/pending/`, English only,
  and only where that namespace is already pending.

## Refuse

- An English string in a non-English locale.
- Hardcoded English in JSX, `aria-label`, `alt` or page metadata.
- Re-encoding a locale file as a side effect of the edit.
