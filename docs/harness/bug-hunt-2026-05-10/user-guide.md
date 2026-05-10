# Bug Hunter — User Guide

> Total: 7 findings (Critical: 0, High: 3, Medium: 3, Low: 1)
> Scope: 18 files (sampled from 39)
> Date: 2026-05-10

## 1. Custom block fence collisions: nested `:::` terminates outer block early

- **Severity**: High
- **Category**: Silent failure / latent failure
- **File**: `src/components/guide/GuideMarkdown.tsx:207`
- **Scenario**: Author writes a `:::compare` (or `:::usecases`, `:::feature`, etc.) block whose body contains an inner callout, e.g.
  ```
  :::compare
  **Option A**
  Cheap and fast.
  :::tip
  Use it for prototypes.
  :::
  ---
  **Option B**
  Costly but robust.
  :::
  ```
  The block parser closes the outer `:::compare` at the first line that `trimStart().startsWith(":::")` — which is the inner `:::tip`. Everything after `:::tip` (including option B and the real closing `:::`) ends up either lost or misparsed as new top-level blocks, with a stray closing `:::` rendered as a paragraph.
- **Root cause**: `parseBlocks` does not track a fence depth or the specific block type that opened. Any line beginning with `:::` is treated as the closing fence regardless of the opening type.
- **Impact**: Authors writing rich content silently lose paragraphs/items; the page still renders so QA may not notice. Affects every `:::*` block parser (steps, keys, compare, diagram, feature, checklist, usecases, code-compare, callouts).
- **Fix sketch**: Match the opening fence to its closing tag — accept either a bare `:::` or `:::<sameType>`, and require a matching count if you want to allow nesting. Equivalently, require that the closing fence be **exactly** `:::` (no trailing content) so `:::tip` cannot close an outer `:::compare`. Add a unit test that exercises a nested callout inside `:::compare`.

## 2. Stale results race in SearchCombobox `onFocus` re-open path

- **Severity**: High
- **Category**: Race condition / silent failure
- **File**: `src/components/guide/SearchCombobox.tsx:170` (with related state at 43-62)
- **Scenario**:
  1. User types "trig" — debounce starts (150 ms).
  2. Before 150 ms elapses, the user clicks outside; the outside-click effect sets `isOpen = false`.
  3. The debounce fires and writes new `results` for "trig" but the dropdown stays closed because the user is no longer focused (no setIsOpen path runs while blurred until next `setQuery` change).
  4. The user types another character "trigg" — `setQuery("trigg")` schedules another debounce. Before it fires (within 150 ms) the user re-focuses the input. `onFocus` reads `query.length >= 2 && results.length > 0` — both true, since `results` still holds the "trig" matches — and reopens the dropdown showing **stale "trig" matches under the live query "trigg"**. ARIA `aria-activedescendant` may also point into a result list that doesn't correspond to the visible query.
- **Root cause**: `onFocus` opens the dropdown without consulting `resultsForQueryRef.current === query`. The component already tracks staleness for Enter (line 107) but not for focus.
- **Impact**: Users see results for a previous query, click them, and land on a topic that does not match what they typed — confusing and feels broken.
- **Fix sketch**: In `onFocus`, gate the open on `resultsForQueryRef.current === query` (otherwise leave it closed and let the in-flight debounce handle it). Optionally clear `results` immediately whenever `query` changes so a focus event during pending debounce never paints lagging data.

## 3. `code-compare` after-header heuristic produces wrong split on common section names

- **Severity**: Medium
- **Category**: Edge case / silent failure
- **File**: `src/components/guide/GuideMarkdown.tsx:357-358`
- **Scenario**: Inside a `:::code-compare` block, the parser decides which side a header belongs to via `h.includes("after") || h.includes("new") || h.includes("improved")`. Substring matches are over-eager:
  - `### After thoughts` (intended as before-context) → goes to after.
  - `### Newcomer setup` (intended as before, "new" team member) → goes to after.
  - `### Hereafter` / `### Aftermath` → goes to after.
  - `### Renewed` / `### Improved-old` → goes to after.
  Conversely, `### Final` (intended as after) → goes to before because it contains none of the magic substrings.
- **Root cause**: Naive substring match instead of word-boundary or explicit token comparison.
- **Impact**: Code blocks render in the wrong column with wrong red/green framing, silently inverting the documented intent. Authors get no warning.
- **Fix sketch**: Match exact tokens (e.g. lowercase trim equal to one of `before|after|new|improved` or `before:`/`after:`). Or require the header to be exactly `### Before` / `### After` and treat anything else as a label that goes into the current section unchanged.

## 4. Cross-category-only filter in `getRelatedTopics` produces dead-end navigation

- **Severity**: Medium
- **Category**: Silent failure / dead-end navigation
- **File**: `src/lib/guide-utils.ts:43-53`
- **Scenario**: `getRelatedTopics` filters out topics in the same category and requires `score >= 2` (i.e. ≥2 shared tags). Looking at `topics.ts`, every topic's tag list begins with its own `categoryId` (e.g. all `agents-prompts` topics share the `"agents-prompts"` tag). Cross-category overlap by tag is therefore rare — most pairs share zero tags, the rest share one.
  Concrete check: topic `agent-not-responding` (tags: `troubleshooting, agent, not-responding, hung, stuck`) — no other topic in any other category has 2 of those tags. Same for `cloud-troubleshooting`, `genome-evolution-basics`, etc. Spot-check suggests the majority of the 102 topics yield zero related topics.
- **Root cause**: Tag taxonomy is mostly category-scoped, so the "must share ≥2 tags AND must be cross-category" rule produces empty sets. `RelatedTopics.tsx` returns `null` when empty (line 14), so the section just disappears with no fallback.
- **Impact**: A core navigation surface ("you might also like…") silently never appears on most pages, hurting discoverability.
- **Fix sketch**: Either (a) lower threshold to `score >= 1` and dedupe via score sort, (b) drop the cross-category exclusion (current "prev/next handles same category" assumption breaks once you're 4 topics away), or (c) add a fallback that surfaces N random siblings or category-peers when no high-score matches exist.

## 5. Highlight loss for `fuzzy-tag` and `description` match types

- **Severity**: Medium
- **Category**: Silent UX failure
- **File**: `src/lib/highlight-match.tsx:73-75` (called from `src/components/guide/SearchCombobox.tsx:219`)
- **Scenario**: User types "encrypt". `searchGuide` matches the topic via `description` (score 2) — the result row shows the topic title without any visual indicator of *why* the result was chosen, because `highlightMatch` short-circuits to `[text]` for any matchType other than `exact-title`/`fuzzy-title`. The combobox displays the badge `desc` (line 22) but the title itself is unhighlighted, so the user cannot tell whether `encrypt` is in the title at all (it's not). Same for `fuzzy-tag` matches — badge says `~tag` but no highlight.
- **Root cause**: Highlight function only handles two of the five match types. Description and tag matches are stripped of any inline indication.
- **Impact**: Search feels unreliable — users see results that "don't contain my query" and may abandon the search. Result ordering looks random when description matches sit alongside title matches with identical visual treatment minus a tiny badge.
- **Fix sketch**: For `description` matchType, render the *description* (not the title) below the title with the matched substring highlighted. For `fuzzy-tag`/`exact-tag`, render the matched tag pill next to the title (e.g. `[tag: encryption]`). Both increase the user's confidence that the match is real.

## 6. Sidebar search shows expanded category with empty topic region when only `cat.name` matches

- **Severity**: Low
- **Category**: Edge case / dead-end
- **File**: `src/components/guide/GuideSidebar.tsx:79, 113, 144`
- **Scenario**: User types a query that matches a category *name* but no topic title/tag inside it (e.g. "Security" matches `Credentials & Security` name but not all individual topic strings have "security"). Filter keeps the category with `topics.length === 0` (line 79: `cat.topics.length > 0 || cat.name.toLowerCase().includes(q)`). The header renders with the chevron forced to expanded (`isExpanded = ... || !!query.trim()`), but the AnimatePresence body is gated on `topics.length > 0` so nothing animates open. The user sees an "expanded" looking row with no children — a dead-end.
- **Root cause**: Inconsistent gating: the category-level filter accepts name-only matches, but the topic list rendering excludes empty topic groups.
- **Impact**: Confusing UX, looks like a bug. Minor because user can clear and try a different term.
- **Fix sketch**: When `topics.length === 0` but the category was kept by name, render an inline "no topics — all topics" link to `/guide/<cat.id>` instead of an empty animated region. Or remove the `cat.name.toLowerCase().includes(q)` clause and only keep categories that have at least one matching topic.

## 7. `extractSteps` HowTo JSON-LD: multi-block aggregation produces duplicate `position` semantics

- **Severity**: Low
- **Category**: SEO/structured-data correctness
- **File**: `src/app/guide/[category]/[topic]/page.tsx:11-23`
- **Scenario**: A topic's markdown has two `:::steps` blocks (e.g. "Initial setup" then later "Recovery steps"). `extractSteps` concatenates them into a single flat array and `buildHowToJsonLd` indexes positions 1..N across both. Google sees one `HowTo` with merged steps; the second block's "step 1" becomes step `len(first)+1`, losing semantic boundaries. Also, step body continuations on a separate markdown line are silently dropped (regex requires title and body on the same line).
- **Root cause**: Single flat steps array and same-line-only regex. No representation of multiple HowTos per topic in JSON-LD.
- **Impact**: HowTo rich result may render misleadingly (e.g. "Step 8: Re-launch app" without context). Step bodies that span lines are absent from structured data even if rendered visually.
- **Fix sketch**: Either (a) only emit HowTo JSON-LD when exactly one `:::steps` block is present, (b) emit multiple `HowTo` objects (one per block) with section names, or (c) extend `extractSteps` to support continuation lines via the same logic the visual `StepWizard` parser uses (`GuideMarkdown.tsx:219-221`). The visual and SEO step extractors should share one parser.
