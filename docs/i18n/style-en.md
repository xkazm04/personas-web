# English style - personas-web

`src/i18n/en.ts` is the source locale; the 13 others translate from it. This file is the
house delta on top of the registry's `localization/english` subject: it cites rule IDs and
never restates them. Declared mechanics live in [`copy-contract.json`](./copy-contract.json).

## Declared mechanics (counted 2026-09-14)

| Mechanic | Declared | Count at adoption | Rule |
| --- | --- | --- | --- |
| Variant | **US** (operator, fleet-wide, 2026-09-14) | US 255 forms, UK 5 (cancelling x2, cancelled x2, grey x1) | EN-SPELLING |
| Em dash | **banned** (operator, fleet-wide, 2026-09-14) | 1,098 em dashes, 13 en dashes, 54 spaced hyphens | EN-DASH |
| Quotes | straight `"` | straight 448, curly 12 | EN-QUOTES |
| Ellipsis | three dots `...` | dots 51, character 15 | EN-ELLIPSIS |
| Case | sentence case | see the title-case class below | EN-CASE |

The UK forms and every existing em dash are migration debt in `.ai/copy-baseline.json`,
drained separately. They are not swept by the gate.

**Dash ban.** Recast by sense: full stop, colon, comma, or parentheses (EN-DASH). Out of
scope: the standalone no-data placeholder glyph and code comments (the checker reads
neither).

**Title-case element class (house ruling, 2026-09-14).** Connector use-case titles in
`src/data/connectors.ts` (`useCases[].title`, 231 strings, e.g. "Deploy or Roll Back") and
blog post titles in `src/data/blog.ts` are Title Case by design. Everywhere else, including
every heading in `en.ts`, is sentence case. EN-CASE warns on the two classes and never
blocks.

## Sources the gate reads

`src/i18n/en.ts`, `src/lib/seo.ts`, `src/app/layout.tsx` metadata,
`src/components/sections/*/data.ts`, `src/data/*.ts` (blog, changelog, connectors, security,
tour, roadmap), `src/data/guide/content/*.ts`. Not read: other locales, tests, and
`sections/platform-command/data.ts`, which is simulated terminal output rather than prose.

A guide section and a blog post are each **one string** to the checker. Editing any word in
one re-gates the whole string, so its existing em dashes must go in the same edit.

## Copy gate

- `npm run copy:check` checks the whole catalog against the baseline. It exits 1 only on a
  new error-level finding. Warnings print and never block.
- It runs in `.git/hooks/pre-push`, written by `scripts/install-git-hooks.mjs` (`npm
  install` runs it through `prepare`). After pulling this change, run
  `node scripts/install-git-hooks.mjs` once to add the step to an existing hook.
- The checker is a gitignored link to ai-registry (`node scripts/link-registry.mjs
  --project personas-web` from the registry). Without it the hook prints `copy gate
  SKIPPED` and continues. CI does not run the gate.
- **Exceptions are visible, never bypassed.** A deliberate string goes into the baseline in
  its own commit whose message says why. A rule wrong for this catalog is turned `off` in
  the contract, with the reason recorded here. Never `--no-verify`.
