# Guide Content Blocks & Markdown — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. TOC and rendered heading IDs are produced by two divergent, duplicated slug pipelines
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: duplicated-slug-logic-anchor-drift
- **File**: `src/components/guide/guide-markdown/extractHeadings.ts:57`
- **Scenario**: The TOC (extractHeadings) and the renderer (parseBlocks.tsx:63) each independently reimplement slugify + dedup + fallback. Their fallbacks disagree: extractHeadings emits `section-${fallbackKey++}` (a 0-based counter of unslugifiable headings) while parseBlocks emits `section-${key}` where `key` is the global emitted-element counter (could be 37 by the time the heading renders). Any heading whose text slugifies to empty (emoji-only, CJK, punctuation-only) gets different IDs in the TOC vs the DOM. The two scanners also skip content differently (extractHeadings toggles `inCodeFence` line-by-line even inside `:::` blocks; parseBlocks consumes fence/custom-block bodies structurally), so an unclosed fence or a ``` inside a custom block can desync which headings each side sees.
- **Root cause**: No single source of truth — the "same" slug/dedup/skip algorithm exists twice with no shared function, no test pinning them together, and no comment stating they must stay in lockstep.
- **Impact**: TOC links that scroll nowhere (broken `#anchor` navigation), and copy-link anchors that don't match the sidebar. Fails silently — nothing errors, the click just does nothing.
- **Fix sketch**: Extract one `computeHeadingIds(lines): {id, rawText, depth}[]` used by both extractHeadings and parseBlocks (parseBlocks consumes its output positionally). At minimum, unify the fallback to a shared deterministic counter and add a unit test asserting `extractHeadings(md).map(h=>h.id)` equals the ids rendered by `parseBlocks(md)`.

## 2. Table cells bypass parseInline — inline markdown renders as literal `**`/backtick syntax
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: table-cells-skip-inline-parsing
- **File**: `src/components/guide/guide-markdown/parseBlocks.tsx:190`
- **Scenario**: An author writes a pipe table with `` `persona.yaml` `` or `**required**` in a cell — extremely common in reference docs (every other block type in this renderer supports it). `emitTable` passes raw strings to `MarkdownTable`, which renders `{cell}` verbatim (MarkdownTable.tsx:37), so users see literal asterisks and backticks.
- **Root cause**: Inline formatting is applied to paragraphs, headings, blockquotes, both list types, tabs, callouts, and cards — but the table path was wired straight through as plain strings. `MarkdownTable`'s props are typed `string[][]`, which locks the omission in.
- **Impact**: Visibly broken formatting in the highest-density content surface (comparison/reference tables); authors either avoid tables or ship pages with raw markdown syntax showing.
- **Fix sketch**: Widen `MarkdownTableProps` to `ReactNode[][]` (or keep strings and call `parseInline` inside the component), and in `emitTable` map each cell through `parseInline(cell, key)`. One-line behavior change, no markup change for plain-text cells.

## 3. Nested lists emit `<ul>` as a direct child of `<ul>` — invalid HTML that breaks AT list semantics (plus a missing React key)
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: invalid-nested-list-markup
- **File**: `src/components/guide/guide-markdown/parseBlocks.tsx:183`
- **Scenario**: Any indented bullet list in guide markdown (`- item` / `  - sub-item`). `buildUnorderedList` does `children.push(sub.node)`, placing the nested `<ul>` as a sibling of `<li>` elements instead of inside the preceding `<li>`.
- **Root cause**: The recursive builder returns the sub-list node and appends it directly to the parent's children array; the HTML content model (only `<li>`/script-supporting elements allowed inside `<ul>`) was not considered. The returned `<ul>` also has no `key`, so every nested list triggers a React key warning.
- **Impact**: Screen readers announce wrong item counts and lose the parent-child relationship between a bullet and its sub-bullets; `list-inside` styling also renders the orphan sub-list's indentation inconsistently. Console key warnings add noise that masks real issues.
- **Fix sketch**: When `items[index].depth > depth`, append the recursive result into the previous `<li>`'s children (build `<li>{content}{subList}</li>`), and give the returned `<ul>` a `key` derived from `from`/`depth`. Verify with a nested-list fixture snapshot.

## 4. Every table row is keyboard-focusable (`tabIndex={0}`) with nothing to activate
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: focusable-non-interactive-rows
- **File**: `src/components/guide/blocks/MarkdownTable.tsx:31`
- **Scenario**: A keyboard user tabs through a guide page containing a 15-row table: each `<tr>` takes a tab stop, shows a focus ring, and responds to no key — 15 dead stops between the previous link and the next.
- **Root cause**: `tabIndex={0}` plus `focus-visible:ring` were added to rows (presumably for "polish"/hover parity) without an interactive behavior; static data rows are not operable widgets, so making them focusable violates the "focusable implies operable" expectation.
- **Impact**: Significantly degraded keyboard navigation on table-heavy guide pages; screen-reader virtual cursors already read tables without needing row focus, so this is pure cost.
- **Fix sketch**: Remove `tabIndex={0}` and the focus-ring classes from `<tr>`; keep the hover tint. If row-level keyboard scanning is genuinely wanted later, that's a grid pattern (`role="grid"` + arrow-key management), not tab stops.

## 5. Block-level a11y/UI strings are hardcoded English while the renderer explicitly threads i18n for one label
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: partial-i18n-hardcoded-strings
- **File**: `src/components/guide/blocks/Callout.tsx:16`
- **Scenario**: `GuideMarkdown` proves i18n is a requirement — it pulls `t.guide.copyAnchor` and threads `copyAnchorLabel` through `parseBlocks` into `HeadingAnchor`. Yet every other user-facing string in the block set is hardcoded English: Callout labels ("Tip"/"Warning"/"Note"/"Done"), CopyButton ("Copy", "Copied!", "Press Ctrl+C" — CopyButton.tsx:52,75), TabBlock `aria-label="Variant tabs"` (TabBlock.tsx:47), StepWizard `aria-label="Setup steps"` (StepWizard.tsx:19), ArchitectureDiagram's `"Architecture flow: …"` (ArchitectureDiagram.tsx:22), and parseInline's `alt="Illustration"`/`title="Opens in new tab"`.
- **Root cause**: No recorded decision on the i18n boundary for guide blocks — one label got the full plumbing treatment, the rest were left as literals, so the codebase carries a contradictory implicit policy.
- **Impact**: On any non-English locale, visible labels ("Copied!", "Warning") and screen-reader announcements stay English; worse, the mixed state means future contributors can't tell whether to thread translations or hardcode. The a11y strings are exactly the ones AT users hear.
- **Fix sketch**: Either (a) decide guide content is English-only and record it (then also drop the `copyAnchorLabel` plumbing for consistency), or (b) extend the existing `opts` object in `parseBlocks` to a small `labels` bag (or a React context provided by `GuideMarkdown`) sourced from `t.guide.*`, and consume it in Callout/CopyButton/TabBlock/StepWizard/ArchitectureDiagram. The context route avoids threading props through every parse function.
