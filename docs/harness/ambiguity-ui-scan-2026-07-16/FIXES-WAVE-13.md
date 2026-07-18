# Fix Wave 13 — Duplicated source-of-truth (T14) + guide/markdown correctness (T15)

> 5 commits, 7 findings closed (7 High). +7 unit tests (vitest 64 → 71).
> Baseline preserved: tsc 0 → 0 · vitest all-pass · 0 regressions. Branch `vibeman/t14-t15-fixes`.

## Commits

| # | Commit | Findings closed | File(s) |
|---|---|---|---|
| 1 | `d9a0220` | guide-blocks-markdown #2, #3, #4 | MarkdownTable.tsx, parseBlocks.tsx |
| 2 | `fb4e1c4` | guide-blocks-markdown #1 | headingId.ts (+test), extractHeadings.ts, parseBlocks.tsx |
| 3 | `a017799` | guide-data-search #1 | guide-search.ts (+test) |
| 4 | `ee82b56` | security-compliance #2 | data/security.ts, ArchitectureFlow.tsx |
| 5 | `ba35bd2` | split-pipeline-playground #1 | playground-split/data.ts, SyntaxPrompt.tsx (+test) |

## What was fixed

**T15 — guide/markdown correctness:**
1. **Table cells rendered literal markdown** — `code`/**bold**/links in a pipe-table cell showed as raw syntax (every other block parses inline). `emitTable` now runs cells through `parseInline`; `MarkdownTable` accepts `ReactNode` cells. Also removed the pointless `tabIndex={0}` on every row (#4).
2. **Nested lists = invalid HTML** — `buildUnorderedList` pushed a nested `<ul>` as a sibling of `<li>` (breaks AT list semantics, missing React key). The sub-list now renders inside the preceding `<li>` with a stable key.
3. **TOC vs renderer anchor drift** — the two independently reimplemented slug+dedup+fallback and their fallbacks disagreed, so emoji/CJK/punctuation-only headings got different ids in the TOC vs the DOM (links scrolled nowhere). Both now share `createHeadingIdAssigner`; `headingId.test.ts` pins their outputs equal.
4. **Fuzzy search flooded short queries** — a flat edit distance of 2 against a 2-char minimum query matched nearly every word. The budget now scales with token length (0/<4, 1/<7, else maxDist); test covers the invariant + a still-matching longer typo.

**T14 — duplicated source-of-truth:**
5. **Architecture layer detail keyed by display-name** — `LAYER_DETAILS` in the component keyed by the layer `name` from a different file, so a rename silently dropped the hover detail. Moved onto a `detail` field of `ArchitectureLayer`; omission is now a compile error.
6. **Syntax highlighter: `\b#` bug + 3 keyword copies** — a leading `\b` can't match before `#`, so #142/#engineering/#product never highlighted; the keyword list also existed in 3 drifting copies. Consolidated to one `SYNTAX_KEYWORDS` array; `SyntaxPrompt` derives the split pattern (boundary lookarounds, longest-first) + membership Set from it; test covers the regression.

## Verification

| | Before | After |
|---|---|---|
| tsc | 0 | 0 |
| vitest | 64/64 | 71/71 (+7) |

## Patterns established (catalogue items 23–24)

23. **Two functions that must agree need one shared function + a pinning test** — TOC/renderer slug logic, and a stringly-keyed lookup (`LAYER_DETAILS[name]`), both drift silently. Extract the shared algorithm; make the coupling a compile error (a typed `detail` field) or a test (`extractHeadings == parseBlocks ids`).
24. **`\b` can't anchor a `#`-prefixed token** — `#` is a non-word char, so `\b#…` after whitespace never matches. Use boundary lookarounds (`(?<![\w#-])…(?![\w-])`) and build the pattern from a single keyword source, longest-first, so multi-word and `#`-tokens both match.

## What remains

The Medium/Low tail and the deferred-with-cause decisions (roadmap wire-vs-delete, security deploy steps, tour pause, terminal no-stop, knowledge type-bucket+legends, small T5 tail, theme rehydrate DOM-write, stats writable-FS, i18n coverage-gate content hardening). Also skipped as cosmetic: the `exact-tag` → `tag-substring` matchType rename (name-only, ripples a shared union through 2 more files).
