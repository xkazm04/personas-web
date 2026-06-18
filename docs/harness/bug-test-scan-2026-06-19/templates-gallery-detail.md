# Templates Gallery & Detail — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 2, Low: 0)

Scope: template gallery + id-based detail route, YAML highlighting, metadata/JSON-LD, query helpers. Verified against current code (prior bug-only scan 2026-05-10). Test runner is **Playwright e2e only — no vitest/jest harness exists** (no `vitest.config.ts`, no `tests/`, no `*.test.ts` in `src/`, no vitest binary in `node_modules/.bin`). The gallery/detail logic layer (queries, meta, highlighter) is therefore covered only through full-browser e2e, and several pure functions have zero coverage.

## 1. Detail-page e2e asserts text the UI never renders ("Design Highlights")
- **Severity**: High
- **Lens**: test-mastery
- **Category**: broken / stale test assertion
- **File**: e2e/templates.spec.ts:52 (vs src/app/templates/[id]/template-detail/TemplateHero.tsx:39 + src/i18n/en.ts:2297)
- **Scenario**: When `test:e2e` runs the "template detail page renders content" case, it does `await expect(page.locator("main")).toContainText("Design Highlights")`.
- **Root cause**: The hero section renders `t.templatesPage.keyBenefits` which is the literal string **"Key Benefits"** — the string "Design Highlights" does not exist anywhere in the rendered output (grep returns zero matches in `src/`). The assertion targets a label that was renamed/never shipped, so the only test that validates detail-page body content must time out and fail (or, if e2e is not gated in CI, it is a dead canary that gives false confidence the detail page is verified).
- **Impact**: false-confidence test / broken gate — the single assertion meant to prove the detail body rendered is unreachable.
- **Fix sketch**: Assert the shipped label instead: `toContainText("Key Benefits")` (or better, assert a known `designHighlights[0]` value like "Smart labeling" for `gmail-inbox-triage` so the test survives copy edits).

## 2. No unit harness for pure query/meta/highlight logic (queries, related, meta, YAML tokenizer)
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing test harness / risk-weighted coverage gap
- **File**: src/lib/template-queries.ts:21-39, src/lib/templates.ts:1909-1911, src/app/templates/[id]/YamlHighlighter.tsx:21-140
- **Scenario**: When `getTemplateById`/`getRelatedTemplates`/`getTemplateStaticParams`, the `templateList` derivation, or the YAML tokenizer regress, nothing fails until a human eyeballs a rendered page — these are deterministic pure functions but the project ships no unit runner, so they are exercised only by a handful of e2e clicks against `gmail-inbox-triage`.
- **Root cause**: Design assumption that Playwright e2e is sufficient coverage; in reality the highest-logic-density code (tokenizer state machine, related-template filtering, static-param generation, duplicate-id guard) has no fast deterministic tests and is the most LLM-generatable test target in this context.
- **Impact**: false-confidence / regressions ship silently — e.g. a bad `slice`/filter change in `getRelatedTemplates`, an off-by-one in the tokenizer, or a `templateList` that accidentally leaks `config` would pass every existing test.
- **Fix sketch**: Add vitest (jsdom not required for these — they are pure) + table-driven specs: `getTemplateById` hit/miss, `getRelatedTemplates` excludes self + caps at 3 + empty for unknown id, `getTemplateStaticParams` count == templates.length, `templateList` omits `config`, and `tokenizeLine` cases (kv, comment, quoted-hash, inline array, block-scalar bodies).

## 3. YAML highlighter mis-tokenizes block-scalar bodies (`system: |`) as YAML — untested
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: parser correctness (cosmetic) + zero coverage
- **File**: src/app/templates/[id]/YamlHighlighter.tsx:21-113
- **Scenario**: When a template config contains a literal block scalar — e.g. `system: |` followed by free-text lines (used by ~30 of the newer templates, src/lib/templates.ts:791+) — each body line is re-tokenized independently with no block-scalar awareness.
- **Root cause**: `tokenizeLine` is stateless per line and has no notion of being "inside" a `|`/`>` block. A body line that happens to contain a `key:`-shaped prefix (`Deduplicate across platforms.` is safe, but any sentence like `Note: ...` or a leading `-` bullet) is colored as a YAML key / list-punctuation, and an unquoted `#` mid-sentence would truncate the rest of the line into a "comment" color. Purely visual today because output is React text nodes (no XSS — confirmed: no `dangerouslySetInnerHTML` in the highlighter), but the rendered code block is misleading.
- **Impact**: UX degradation — config previews (the core CTA of this page) render with wrong syntax colors for any prose-bearing template; no test guards the tokenizer at all.
- **Fix sketch**: Track block-scalar state across `code.split("\n")` (detect trailing `|`/`>` and indent level, emit body lines as `plain` until dedent); add tokenizer unit tests including a `system: |` block fixture.

## 4. `getRelatedTemplates` always returns the first 3 in array order — no relevance, repeats across pages
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: logic / UX
- **File**: src/lib/template-queries.ts:29-39 (rendered by RelatedTemplates.tsx)
- **Scenario**: When viewing any DevOps detail page (DevOps has ~10 templates), "More DevOps Templates" shows the same first three same-category templates in `templates[]` declaration order every time, regardless of which template you are on.
- **Root cause**: `.filter(category match && id !== self).slice(0, limit)` takes a positional head with no shuffling, scoring, or rotation; the design assumes array order ≈ relevance, which it is not. Large categories surface a fixed trio; the current template's own neighbors are ignored. (Also fully unguarded by tests — the e2e only checks `count >= 2` and that "More" text appears.)
- **Impact**: UX degradation — "related" feels broken/repetitive on dense categories; weakens cross-discovery, the gallery's main internal-linking value.
- **Fix sketch**: Deterministically rotate or rank — e.g. order candidates by distance from the current template's index (or by shared `serviceFlow`/`difficulty`) before `slice`, and add a test asserting different ids appear for two different source templates in the same category.

## 5. "Open in Personas" deep-link: stacked timers/listeners + false fallback on slow app launch
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: race / event-listener handling
- **File**: src/app/templates/[id]/TemplateDetail.tsx:88-102
- **Scenario**: When a user clicks "Open in Personas" twice (or the installed app takes >1500ms to grab focus, common on cold start), each click registers a fresh `blur` listener + `setTimeout`; a click whose blur never arrives in time fires `setShowFallback(true)` even though the app did launch, and rapid double-clicks leave orphaned listeners until their own timers fire.
- **Root cause**: The handler is not idempotent and the 1500ms heuristic assumes the OS yanks focus within that window; there is no in-flight guard and no cleanup of a prior pending attempt before starting a new one. The whole deep-link/fallback path (the page's primary conversion action) has **zero test coverage** — e2e only asserts the button is visible, never that clicking it behaves.
- **Impact**: UX degradation — spurious "install Personas" modal for users who do have the app; minor listener accumulation on repeat clicks.
- **Fix sketch**: Guard with an in-flight ref (ignore re-entry while a probe is pending), clear any prior timer+listener at the start of `handleOpenInPersonas`, and lengthen/abort the probe on `visibilitychange` as well as `blur`; add an e2e/unit assertion that a click sets `window.location.href` and that the modal stays hidden when a blur fires.
