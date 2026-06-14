# Guide Content Blocks & Markdown
> A bespoke client-side markdown renderer with a `:::block` extension syntax that turns guide topic bodies into rich, interactive content (callouts, code-compare, step wizards, diagrams, keyboard grids, tabs, cards). · **Route:** n/a (rendering layer) · **Status:** Live

## What it does
Renders a guide topic's markdown `body` string into React. On top of a hand-rolled
subset of CommonMark (headings, lists, blockquotes, tables, fenced code, inline
emphasis/links/images/code/highlight), it adds a fenced custom-block syntax —
`:::type … :::` — that maps to a catalog of ~16 interactive components. It also
extracts a heading outline (with stable, deduped slugs) for the table-of-contents,
gives every heading a hover "copy link" anchor, and adds copy-to-clipboard buttons
to code/CLI/keyboard blocks. Everything runs on the client; the plain markdown
fallback is SSR-safe and renders without JS.

## How it works
- **Entry.** `GuideMarkdown` (`src/components/guide/GuideMarkdown.tsx:10`) wraps the
  output in `.prose-custom` and calls `parseBlocks(content.split("\n"), { copyAnchorLabel })`.
  Input is a string of lines; output is a `ReactNode[]`.
- **Block loop.** `parseBlocks` (`src/components/guide/guide-markdown/parseBlocks.tsx:24`)
  walks the line array with a manual cursor, dispatching on the first line of each
  block: ` ``` ` fences → `CodeFence`; `#`..`####` → `HeadingAnchor`; `---` → `<hr>`;
  `> ` → blockquote; `-`/`*` → nested `<ul>`; `1.` → `<ol>`; `:::name` → custom block;
  `|…|` → `MarkdownTable`; otherwise a paragraph. Each emitted node is re-keyed via
  `React.cloneElement` (`parseBlocks.tsx:29`).
- **Custom blocks.** A `:::name` opener collects lines until the closing `:::`
  (`parseBlocks.tsx:127`) and hands the body to `parseCustomBlock`
  (`parseCustomBlock.tsx:20`), a dispatch table: `steps`, `keys`, `compare`,
  `diagram`, `feature`, `checklist`, `usecases`, `code-compare`, `tabs`, `cli`,
  `callout-stack`, `cards`, and the four single callouts `tip`/`warning`/`info`/`success`.
  Each parser sub-function turns its mini-DSL (e.g. `**Title** — body`, `Combo — desc`,
  `[available] Title | desc | image`) into typed props and returns the component, or
  `null` if it parsed nothing (the block is then silently dropped).
- **Inline.** `parseInline` (`parseInline.tsx:12`) is a single global regex over
  images, links, `***bi***`, `**b**`, `*i*`, `` `code` ``, and `==highlight==`,
  recursing into the captured text. Bare text runs through `typography()`
  (`parseInline.tsx:3`) for smart dashes/quotes-ish substitutions (`---`→em-dash,
  `(c)`→©, etc.).
- **Headings & TOC.** Content headings are shifted **down one level** at render time
  (`#`→`<h2>`) because the topic title is the page's single `<h1>` (`parseBlocks.tsx:61`).
  `extractHeadings` (`extractHeadings.ts:10`) is a separate, lighter pass run by
  `TopicView` to build the TOC: it skips code fences and custom-block interiors, but
  for `:::tabs` it harvests `### tab` labels onto the parent heading as `tabLabels`
  chips. Both passes share `slugifyHeading` (`slugify.ts:1`) and the same
  collision-suffixing logic (`-2`, `-3`…) so anchor IDs match the TOC.
- **Code highlighting.** `CodeFence` (`CodeFence.tsx:95`) lazy-loads a Shiki core
  highlighter (single shared promise, `CodeFence.tsx:35`) with a fixed lang allowlist
  and `github-dark-default` theme, then crossfades the highlighted HTML over the plain
  `<pre>` fallback. Fence info string supports `lang:line-numbers` (or `:ln`) modifiers
  and a `{hl=1,3-5}` highlight spec expanded by `expandLineRanges` (`expandLineRanges.ts:1`).

## Key files
| File | Role |
| --- | --- |
| `src/components/guide/GuideMarkdown.tsx` | Public entry; injects the i18n copy-anchor label and renders `parseBlocks`. |
| `src/components/guide/guide-markdown/parseBlocks.tsx` | Core block tokenizer/dispatcher (headings, lists, quotes, tables, fences, custom blocks, paragraphs). |
| `src/components/guide/guide-markdown/parseCustomBlock.tsx` | `:::name` dispatch table + per-block mini-DSL parsers → block components. |
| `src/components/guide/guide-markdown/parseInline.tsx` | Inline regex pass (emphasis/links/images/code/highlight) + `typography()` smart-punctuation. |
| `src/components/guide/guide-markdown/parseCalloutStack.tsx` | Parses `:::callout-stack` (`[tip] …` lines) into `CalloutStack`. |
| `src/components/guide/guide-markdown/parseCards.tsx` | Parses `:::cards` (`[status] title \| desc \| image`) into `CardsBlock`. |
| `src/components/guide/guide-markdown/extractHeadings.ts` | TOC-only heading pass; same slug/dedupe rules, captures `:::tabs` labels. |
| `src/components/guide/guide-markdown/slugify.ts` | Strips markdown, NFKD-normalizes, lowercases → URL slug for anchors. |
| `src/components/guide/guide-markdown/HeadingAnchor.tsx` | Renders `<h2..h4 id>` with a hover/focus `#` copy-link affordance. |
| `src/components/guide/guide-markdown/expandLineRanges.ts` | Expands `1,3-5` highlight specs to a number array. |
| `src/components/guide/GuideBlocks.tsx` | Re-export shim; consumers import block components from here. |
| `src/components/guide/blocks/*` | The block component catalog (one file each, see below). |

**Block catalog** (`src/components/guide/blocks/`):
`CodeFence` (Shiki, line numbers, hl), `CliBlock` (`$`-prompt + colorized output),
`CodeCompare` (before/after panels), `Callout` + `CalloutStack` (tip/warning/info/success),
`StepWizard` (numbered timeline), `KeyboardGrid` (`<kbd>` combos), `MarkdownTable`,
`CompareBlock` (recommended option), `ArchitectureDiagram` (node → node flow),
`FeatureHighlight`, `Checklist` (localStorage-persisted), `UseCaseGrid`, `TabBlock`
(roving-tabindex tabs), `CardsBlock` (status + light/dark image), `CopyButton` (shared).

## Data & state
- **Source:** the topic `body` markdown string, passed from `TopicView`
  (`src/app/guide/[category]/[topic]/TopicView.tsx:165`) which also runs
  `extractHeadings` for the TOC (`TopicView.tsx:66`). **Stores:** none in the renderer
  (Zustand is upstream; `extractHeadings` re-runs only when the localized body differs
  from the server-extracted headings). **API routes:** none. **Types:** `GuideHeading`
  (`extractHeadings.ts:3`), `CardItem` (`blocks/CardsBlock.tsx:5`); block prop shapes are
  local interfaces per component.
- **Client persistence:** `Checklist` writes per-list progress to `localStorage` under
  a stable content hash (`blocks/Checklist.tsx:11`), hydrated post-mount to avoid SSR
  mismatch. `CopyButton`/`HeadingAnchor` use the Clipboard API with a legacy
  `execCommand` fallback (`blocks/CopyButton.tsx:13`).

## Integration points
- **`TopicView`** is the sole consumer — renders `GuideMarkdown` and feeds
  `extractHeadings` output into `TopicTOC` / `MobileTopicTOC` / `useActiveHeading`.
  Heading IDs from `slugifyHeading` are the scroll targets for TOC links and the
  `#anchor` deep-links the `HeadingAnchor` copies.
- **i18n:** only one renderer string is translated — `t.guide.copyAnchor`
  (`src/i18n/en.ts:2022`), passed in as the anchor `aria-label`/`title`. All other
  user-facing labels inside block components are **hardcoded English** (see gotchas).
- **Shiki** is an async dynamic import; nothing else in the renderer has external deps
  beyond `lucide-react` icons, `framer-motion` (CodeFence crossfade), and
  `@/lib/brand-theme` (`CompareBlock` color rotation).

## Conventions & gotchas
- **Parser is line-based and unforgiving.** Blocks are recognized only at a line's
  start (after `trimStart`); there is no lookahead/AST. A custom block whose body fails
  its mini-DSL returns `null` and **vanishes with no error or fallback** — e.g.
  `:::steps` items must match `1. **Title** — body` exactly, `:::keys` lines need a
  dash separator, `:::cards` rows need a `[status]` prefix and a title. Authoring typos
  silently drop content.
- **No fenced-code guard inside `parseBlocks` custom/table/quote scans.** `extractHeadings`
  tracks `inCodeFence`, but `parseBlocks` only special-cases the opening ` ``` ` of a
  fence; a `#`/`|`/`:::` *inside* prose is fine, but unbalanced fences or `:::` markers
  could mis-slice. `:::` opener regex is strict (`^:::([\w-]+)$`) — no inline content or
  attributes on the opener line.
- **Heading-level shift mismatch.** `parseBlocks` renders content headings as `<h2>`–`<h4>`
  (depth+1, capped, `parseBlocks.tsx:61`), but `extractHeadings` records the *raw* depth
  `1..4` (`extractHeadings.ts:55`). The TOC's `depth` is therefore one less than the DOM
  heading level — fine because both use the same `id`, but don't assume `depth===tagLevel`.
- **a11y — heading copy anchor:** `HeadingAnchor` (`HeadingAnchor.tsx:24`) is an `<a href="#id">`
  with `onClick` doing both navigation and clipboard write; the copied-state feedback is a
  CSS-only `data-copied` color flip with **no `aria-live` announcement**, so SR users get
  no confirmation. The `#` glyph is `opacity-0` until `group-hover`/`focus-visible`.
- **a11y — Checklist** uses `role="checkbox"` buttons but **no `aria-live` for the
  "{n} of {m} complete" counter** and the progress pips are decorative-only; state change
  is conveyed via `aria-checked` only.
- **a11y — Callout** sets `role="note"` for non-warning types (non-standard ARIA role;
  warnings correctly use `role="alert"`), and `ArchitectureDiagram` is a single
  `role="img"` with a generated `aria-label` (`ArchitectureDiagram.tsx:21`) — good, but the
  individual node labels are then redundant to AT.
- **CopyButton labels are hardcoded English** ("Copy", "Copied!", "Press Ctrl+C",
  `aria-label`s) — not run through i18n (`blocks/CopyButton.tsx:51`). Same for block
  labels like "Recommended", "All done!", "Before"/"After", and callout headers
  ("Tip"/"Warning"/"Note"/"Done"). This violates the repo's i18n convention for any
  non-en locale.
- **`<img>` in markdown** (`parseInline.tsx:27`) and `CardsBlock` images use raw `<img>`
  (lint-disabled `no-img-element`), not `next/image`. Inline image `alt` defaults to the
  literal `"Illustration"` when omitted; card images are intentionally `alt=""`/`aria-hidden`.
- **CodeFence is animation-gated** (`useReducedMotion`, `CodeFence.tsx:97`) per the repo
  rule; the Shiki highlighter is a process-wide singleton promise so the first fence pays
  the import cost. Only the allowlisted langs highlight; anything else stays plain.
- **`==highlight==`** renders a `<mark>` with `amber-200` text — verify contrast if reused.
  Inline `***text***` maps to `<strong><em>` styling but only a `<strong>` element.

## Related docs
- [Guide Data & Content](data-content.md)
- [Guide Pages & Navigation](pages-navigation.md)
- [Feature index](../INDEX.md)
