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
  output in `.prose-custom` and calls `parseBlocks(content.split("
"), { copyAnchorLabel })`,
  which is `renderGuideDoc(parseGuide(lines).doc)` plus development warnings for each
  diagnostic (`parseBlocks.tsx`).
- **One grammar.** `parseGuide` (`src/components/guide/guide-markdown/parseGuide.ts`) is
  the dialect's single authority: lines in, `{ doc: GuideNode[], diagnostics }` out. It
  walks the lines with a manual cursor and dispatches on the first line of each block:
  ` ``` ` fences -> `code`; `#`..`####` -> `heading` (with its anchor `id`); `---` -> `hr`;
  `> ` -> `blockquote`; `-`/`*` -> `ul`; `1.` -> `ol`; `:::name` -> a directive node;
  `|...|` -> `table` (a `|---|` separator row is dropped); otherwise `paragraph`. Every
  node carries its 1-based source `line`, so sections can be derived by slicing the flat
  `doc` at its heading nodes. The tree is plain data (JSON round-trips), with no React.
- **Directives.** `GRAMMAR` in `parseGuide.ts` holds one item grammar per directive:
  `steps`, `keys`, `compare`, `diagram`, `feature`, `checklist`, `usecases`,
  `code-compare`, `tabs`, `cli`, `callout-stack`, `cards`, and the four single callouts
  `tip`/`warning`/`info`/`success`. `KNOWN_DIRECTIVES` is derived from it. Each grammar
  turns its mini-DSL (e.g. `**Title** - body`, `Combo - desc`,
  `[available] Title | desc | image`) into a typed node. `code-compare` picks its side
  from structure (the `---` separator, or a second heading, starts the after panel), never
  from English words in the heading. Adding a block is one `GRAMMAR` row plus one case in
  `renderGuideDoc.tsx`, a total `switch` over node types (TypeScript fails on a missing case).
- **Diagnostics.** `parseGuide` reports unknown names, malformed openers (`::: tip`,
  `:::tip Title`), stray `:::` closers, unclosed blocks, an opener used as a closer (no
  nesting), a top-level `#` line that is not a heading (`#####`, `#tag`, an indented
  `# x`; it renders as paragraph text), and two payload kinds: `empty-block` (a known
  directive with no usable item; no node is emitted) and `ignored-line` (an item line its
  grammar cannot use). A nested or unclosed block gets no payload diagnostic on top.
  `npm run check:guide-content` imports `parseGuide.ts` with Node's built-in type
  stripping (Node >= 22.18) and fails on any diagnostic in any English or locale body;
  `lintDirectives` (`directiveLint.ts`) is the same list for TS callers. Keep
  `parseGuide.ts` dependency-free and erasable-syntax: type stripping cannot resolve
  extensionless relative imports, which is why the heading-id assigner and
  `slugifyHeading` live in it (`headingId.ts` and `slugify.ts` re-export them).
- **Inline.** `parseInline` (`parseInline.tsx:12`) is a single global regex over
  images, links, `***bi***`, `**b**`, `*i*`, `` `code` ``, and `==highlight==`,
  recursing into the captured text. Bare text runs through `typography()`
  (`parseInline.tsx:3`) for smart dashes/quotes-ish substitutions (`---`→em-dash,
  `(c)`→©, etc.).
- **Headings & TOC.** Content headings are shifted **down one level** at render time
  (`#`->`<h2>`) because the topic title is the page's single `<h1>` (`renderGuideDoc.tsx`).
  The TOC is a projection of the same tree: `headingsOf(doc)` (wrapped by
  `extractHeadings`) lists every heading node and attaches `:::tabs` labels to the heading
  above them as `tabLabels` chips. Heading ids are assigned once, in `parseGuide`, so TOC
  links and copy-link anchors always match. `page.tsx` parses once on the server and passes
  `headingsOf(doc)` to `TopicView`, and builds the HowTo JSON-LD from `stepsOf(doc)`, the
  same steps (continuation lines included) `StepWizard` renders.
- **Code highlighting.** `CodeFence` (`CodeFence.tsx:95`) lazy-loads a Shiki core
  highlighter (single shared promise, `CodeFence.tsx:35`) with a fixed lang allowlist
  and `github-dark-default` theme, then crossfades the highlighted HTML over the plain
  `<pre>` fallback. Fence info string supports `lang:line-numbers` (or `:ln`) modifiers
  and a `{hl=1,3-5}` highlight spec expanded by `expandLineRanges` (`expandLineRanges.ts:1`).

## Key files
| File | Role |
| --- | --- |
| `src/components/guide/GuideMarkdown.tsx` | Public entry; injects the i18n copy-anchor label and renders `parseBlocks`. |
| `src/components/guide/guide-markdown/parseGuide.ts` | The grammar: `parseGuide` -> typed tree + diagnostics; `GRAMMAR`, `KNOWN_DIRECTIVES`, heading ids, `headingsOf`/`stepsOf` projections. Node-loadable. |
| `src/components/guide/guide-markdown/renderGuideDoc.tsx` | Total switch from tree nodes to block components. |
| `src/components/guide/guide-markdown/parseBlocks.tsx` | `renderGuideDoc(parseGuide(lines).doc)` plus dev warnings. |
| `src/components/guide/guide-markdown/directiveLint.ts` | `lintDirectives` = `parseGuide(lines).diagnostics`, for TS callers. |
| `src/components/guide/guide-markdown/extractHeadings.ts` | `headingsOf(parseGuide(content).doc)`; `GuideHeading` type. |
| `src/components/guide/guide-markdown/headingId.ts`, `slugify.ts` | Re-exports of the id assigner and slugifier from `parseGuide.ts`. |
| `src/components/guide/guide-markdown/parseInline.tsx` | Inline regex pass (emphasis/links/images/code/highlight) + `typography()` smart-punctuation. |
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
  from the server-extracted headings). **API routes:** none. **Types:** `GuideNode`,
  `GuideDiagnostic`, `GuideHeading` (`parseGuide.ts`), `CardItem` (`blocks/CardsBlock.tsx:5`); block prop shapes are
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
- **Parser is line-based.** Blocks are recognized only at a line's start (after
  `trimStart`). A custom block whose body has no usable item emits no node, and
  `check:guide-content` fails on it (`empty-block`), as on an item line its grammar
  cannot use (`ignored-line`). A line that does not start a new `:::steps` item is a
  continuation of the step above it (e.g. `5. text **Bold**` folds into step 4).
- **No fenced-code guard inside directive bodies.** Only a top-level ` ``` ` fence hides
  `:::` and `#` lines; inside a directive the first line starting with `:::` closes it; a `#`/`|`/`:::` *inside* prose is fine, but unbalanced fences or `:::` markers
  could mis-slice. `:::` opener regex is strict (`^:::([\w-]+)$`) — no inline content or
  attributes on the opener line.
- **Heading-level shift mismatch.** `renderGuideDoc` renders content headings as `<h2>`–`<h4>`
  (depth+1, capped), but the tree and `headingsOf` record the *raw* depth `1..4`. The TOC's `depth` is therefore one less than the DOM
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
