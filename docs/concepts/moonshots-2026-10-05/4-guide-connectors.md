# Moonshot sweep 04: Guide + Connectors & Templates

Scout: read-only. Anchors are repo-relative to `personas-web` unless prefixed `../personas/`, which means the sibling desktop
checkout at `C:/Users/kazda/kiro/personas`. Every figure below was counted or run on 2026-10-05 against the working tree.

---

## Localized Guide Content (14 locales)
Today: 13 hand-translated mirrors of the 116-topic guide (topics + 11 content files per locale), served as whole units by `resolveTopicUnit`, with freshness from a generated status table. All of it stays switched off in production. files=149

### 4.1A · Self-healing translation loop: work order to re-pinned commit, run by agents
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** policy-loosen

#### Summary
The drift classifier already writes the work order and the translator prompt already exists. The bet is to close the loop, so that an English edit produces 13 re-translated, re-pinned, status-regenerated diffs ready for review, with no person doing the routing.

#### Description
The detection half is finished, and the repair half is still done by hand. `scripts/i18n/guide-drift.mjs` anchors every pin to the English revision it came from. `check-guide-translations.mjs --work-order` lists each stale topic with its English line diff. `scripts/i18n/translate-guide-subagent-prompt.md` already defines a `refresh` mode that reads that work order. `emit-guide-status.mjs` regenerates `src/data/guide/translation-status.ts`, and `getLocalized.test.ts` fails `test:unit` until someone does. Still, no step connects one tool to the next. The backlog today is **325 content-stale units (25 per locale) and 247 present-unpinned (19 per locale)**. Readers on those 25 topics get English with a notice. This caps the area: every English improvement makes all 13 locales worse.

The moonshot is a pipeline with the shape *work order → per-locale translator agent (existing prompt, refresh mode) → re-pin `_meta.json` `translatedFromHash` from `guide-source.mjs` → `emit-guide-status.mjs` → gates → one atomic commit per locale for owner review*. Personas sells multi-agent orchestration, so this pipeline is a natural candidate to run as a Personas team on the desktop. Its run log could be published as provenance ("translated from English rev X by agent Y, reviewed by Z"). It reuses everything above unchanged.

**Constraint bent:** the settled decision that translation drift "is checked from Windows, never CI" (challenge backlog, `guide-drift.mjs` follow-up). The pipeline needs full git history wherever it runs. The hand-translation rule is kept, because the canonical translator is already a Claude subagent and a human still approves every commit.

#### Flow
- Script `refresh-guide-locale.mjs --locale=de`: work order → prompt fill → write → re-pin → emit status → run gates. Prove it on de alone.
- Fan out to 13 locales in parallel worktrees, one commit per locale.
- Trigger: a post-commit hook on `src/data/guide/content/**`, or a desktop Personas team on a schedule.
- Publish a per-topic provenance line next to `TranslationNotice`.

#### Expected impact
Translation editors and future localized readers notice it. Stale units go from hundreds to roughly 0 within a day of an English edit, measured by the `check:guide-translations` totals. Risk: a bad refresh breaks directive syntax, so the translation renders as literal text (see the Blocks A guard).

#### Evaluation
Claim: quality - the time an English edit takes to reach 13 locales falls from "unbounded" to one review cycle
Before: 325 content-stale + 247 unpinned (run 2026-10-05). `installing-personas` has been stale since the Windows-only rewrite.
After: ≤13 stale units right after any English edit, and 0 after review
Method: simulation - walked `installing-personas` (de) and `athenas-long-term-memory` (unpinned → stale) through the work order → refresh → re-pin chain. The prediction is falsified if refreshed bodies fail `getLocalized.test.ts` digest parity, or if the reviewer rejects more than 20% of them.
Result: better
Gate: policy-loosen

#### First experiment
Run the existing refresh-mode prompt by hand on `de` for the 25 content-stale topics. Re-pin, emit status, and time it. If one locale takes under 1 hour with fewer than 3 manual fixes, the pipeline is worth building.

#### Evidence
- `scripts/i18n/translate-guide-subagent-prompt.md:1-16` - the canonical translator is a Claude subagent, with a refresh mode fed by `--work-order`
- `scripts/i18n/check-guide-translations.mjs` run output: "Total drift: 572 ... stale 325 (content 325), missing 247 (247 present-unpinned)"
- `docs/features/guide/localized-content.md:62-63` - any English edit fails `test:unit` until the status table is regenerated
- `src/data/guide/translation-status.ts:19-21` - the generated table and its input digest

### 4.1B · The guide ships localized first: SSR locale on /guide, with no route change
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 5/10  ·  **Gate:** policy-loosen

#### Summary
The guide is the cleanest localized asset in the repo, so let a non-English reader actually see it. This would be the first production surface to drop the language-switcher gate, server-rendered in the reader's language, with the whole-unit freshness policy as the trust contract.

#### Description
13 × 116 topic units exist, the encoding is clean (0 mojibake sequences in de/ru/ja/ar guide files, and `check:i18n-encoding` reports "all 14 locale files clean"), and the whole-unit no-splice policy is unit-tested. Production still serves English to everyone. `LANGUAGE_SWITCHER_ENABLED` is env-gated (`src/stores/i18nStore.ts:41-42`), the locale lives only in client `localStorage` (`:44`, `:111`), and `TopicView` swaps the body after hydration in a client effect (`TopicView.tsx:83`), so even QA sees an English flash and an English SSR body.

The moonshot reads a locale signal on the server for `/guide/**` only. The signal is a `personas-language` cookie mirrored from the store, with `Accept-Language` as a hint and an explicit picker. It resolves `resolveTopicUnit` in `page.tsx`, so the server HTML, `<article lang>`, the HowTo JSON-LD (`page.tsx:12`) and the TOC come out in-language. Topic pages are already rendered dynamically ("102 pages exceed SSG memory budget", `page.tsx:64`), so a cookie read costs no static output. Stale units still render English with the translated notice. This is a scoped version of the blocked hreflang item: no locale routing, no path change, one section.

**Constraints bent:** it lifts the switcher gate for one section (owner policy), and `<html lang="en">` (`src/app/layout.tsx:92`) stays English, so `lang` lives on `<article>`.

#### Flow
- Cookie mirror in `i18nStore`, plus a server `getGuideLocale()` that reads it.
- `page.tsx` resolves the unit on the server and passes it to `TopicView`. The client effect then only handles the `prefer` toggle.
- A guide-only locale picker, plus a waitlist "read in your language" metric.
- Owner flips the gate for `/guide` only.

#### Expected impact
Non-English visitors (13 languages, roughly 80% of topics fresh) read real docs with no flash. Measure by guide sessions with a non-en cookie and their dwell time. Risk: sidebar and category chrome come from `src/i18n` and carry 79 English-verbatim keys (ship-loop #17). A guide-namespace audit is needed first.

#### Evaluation
Claim: user - a non-en reader gets server-rendered localized docs
Before: 0 production readers can reach the 1,508 translated units. In QA the SSR body is English and is swapped after hydration.
After: 91 of 116 units per locale served translated in SSR HTML, and 25 as English plus notice
Method: simulation - walked `de` cookie → `installing-personas` (stale → English + notice), `memory-tiers-explained` (fresh → German SSR), and an unknown locale → English. The prediction is falsified if SSR resolution breaks the hydration match with the store.
Result: better
Gate: policy-loosen

#### First experiment
Behind `NEXT_PUBLIC_SHOW_LANGUAGE_SWITCHER`, read a cookie in `page.tsx` and server-resolve one category. Compare the SSR HTML and confirm there is no hydration warning.

#### Evidence
- `src/stores/i18nStore.ts:41-42` - the switcher gate
- `src/app/guide/[category]/[topic]/TopicView.tsx:40-47,83` - English SSR, client swap
- `src/app/guide/[category]/[topic]/page.tsx:64` - already dynamic
- `C:/Users/kazda/Documents/Obsidian/personas/ArchitectWeb/backlog.md:8-18` - the site-wide hreflang item is blocked. This card differs: it covers one section, needs no routing, and its content is ready.

---

## Guide Data, Content & Search Index
Today: the English source of truth (11 categories, 116 topics, per-category markdown bodies) plus search, link, mode/visibility and locale-resolution utilities. files=23

### 4.2A · Claim-anchored truth: guide sentences that fail when the desktop changes
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 8/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Replace the saturated directory-level drift alarm with typed, machine-checkable claims. A claim might be "Find in App: Agents → Editor → Design", a shortcut, a connector name or a setting label. Each claim resolves against the desktop's own registries, so drift names the false sentence, not the folder.

#### Description
The desktop-drift detector exists and has stopped carrying information. `node scripts/check-guide-coverage.mjs` reports **109/109 checked topics drifted** and 109 stale (114 days), because `watchedFiles` are "deliberately coarse desktop feature directories" (`src/data/guide/types.ts:43`; e.g. `topics.ts:15` watches all of `src/features/home/`). The desktop's `guide-sync` marker says the last sync was 2026-05-16, and the report counts 686 desktop commits since then. Real false sentences shipped anyway: the Artist plugin stayed in getting-started ×14 locales after the desktop removed it (challenge backlog). Meanwhile `TOPIC_MODULE_MAP.path` is free-form breadcrumb text that nothing verifies against the desktop sidebar (`desktop-modules.ts:1-9`, `data-content.md` gotcha).

The moonshot gives each topic a `claims[]` field of typed assertions: `{kind:"nav", path}`, `{kind:"label", key}`, `{kind:"shortcut"}`, `{kind:"connector", name}`, `{kind:"setting"}`. A resolver checks each one against desktop artifacts that already exist: `../personas/src/lib/navigation/registry.ts`, `sidebarData.ts`, the desktop's `src/i18n/en.ts`, and `scripts/connectors/builtin/*.json`. Drift output changes from "109 folders moved" to "topic X: label 'Check-Ins' no longer exists". It reuses the history-anchoring and reporting contract of `check-guide-coverage.mjs` ("a skip is never a pass") and the `desktop-modules.test.ts` style of guard. Registry subject: `docs-sync`, `public-claim-provenance`.

#### Flow
- Prove it on `TOPIC_MODULE_MAP`: resolve all 110 module refs against the desktop `sidebarData.ts`, and count the misses.
- Add `claims[]` to `GuideTopic`, and auto-extract `:::keys` and connector names from bodies.
- Make the resolver a mode of `check-guide-coverage.mjs`, keeping the advisory/fail thresholds.
- Feed the failures to `/guide-sync` as its work order.

#### Expected impact
Guide readers stop meeting UI that does not exist. The `guide-sync` operator gets a precise queue. Measure the count of unresolved claims over time. Risk: claim authoring effort. Extraction covers mechanical claims only, and prose claims stay manual.

#### Evaluation
Claim: quality - drift signal precision
Before: 109/109 topics flagged, so the signal is 0% discriminating
After: on the order of 10-25 topics flagged, each with named failing claims
Method: simulation - walked the Artist mention (connector/plugin claim → unresolved after desktop removal), the `the-director` breadcrumb ["Overview","Director"] (nav claim, resolvable), and a `:::keys` combo. The prediction is falsified if the nav resolution alone marks more than 50% of refs false-positive.
Result: better
Gate: architecture

#### First experiment
Write a 1-day script that resolves every `TOPIC_MODULE_MAP[*].path` label against the desktop `sidebarData.ts` and registry labels, and report hits and misses.

#### Evidence
- `scripts/check-guide-coverage.mjs` run: "Desktop drift ... 109/109 checked topics drifted ... (686 desktop commits since 2026-05-16)"
- `src/data/guide/types.ts:43` - coarse by design
- `../personas/.claude/guide-sync-marker.json` - `lastSyncDate: 2026-05-16`
- `src/data/guide/desktop-modules.ts:1-9,201` - the hand-mirrored map

### 4.2B · Agent-readable guide: llms.txt, raw markdown, and a Personas MCP resource
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** contract

#### Summary
Personas users live inside AI tools (Claude Code, Cursor, the desktop's own MCP server). The guide should be something their agents can read, not only a page for people: `/llms.txt`, per-topic raw markdown, and a `guide` resource on `personas-mcp`.

#### Description
The corpus is already plain data. `GUIDE_CONTENT` is a topicId → markdown map (`src/data/guide/content/index.ts`), `stripGuideMarkup` already flattens the custom dialect (`src/lib/guide-search.ts:156`), and topics carry ids, tags and descriptions. The English source is 246 KB, about 136 KB of bodies, which fits in a single model context. Even so, a user asking their assistant "how do Personas triggers chain?" gets a hallucination. The repo has no `llms.txt` and no raw route, and the desktop MCP server exposes tools only (no resources; `../personas/src-tauri/src/mcp_server/` has `tools.rs`, with no resource handler).

The moonshot publishes the guide as a machine contract. That means `/llms.txt` (an index with one-line descriptions), `/llms-full.txt`, and `/guide/<cat>/<topic>.md` generated from `GUIDE_CONTENT` with the directives flattened. Each carries the topic's freshness (Data A) and locale. The desktop's `personas-mcp` then serves `personas://guide/<topic>` resources from a bundled snapshot, so any MCP client can ground answers in current docs. A site "Ask the guide" box becomes a thin later consumer of the same contract. It reuses `stripGuideMarkup`, `buildBodyIndex` and `isTopicVisible`. **Constraint note:** this adds new route paths (it does not modify existing ones) and creates a public contract like `roadmap/v1.json`.

#### Flow
- `src/app/llms.txt/route.ts` plus `llms-full.txt`, statically generated and filtered by `isTopicVisible`.
- Per-topic `.md` route handler.
- A desktop MCP `resources/list` and `resources/read` over a bundled snapshot.
- Measure fetches by AI user-agents.

#### Expected impact
Developers asking agents about Personas get cited and correct answers. Measure llms.txt and .md hits by UA, plus MCP resource reads. Risk: stale docs get amplified into agents, so this pairs with Data A.

#### Evaluation
Claim: user - an AI assistant can answer Personas questions from the docs
Before: 0 machine endpoints. The 116 topics are reachable only as HTML rendered by a client parser.
After: 116 topics in 1 index plus 116 raw files plus N MCP resources
Method: simulation - walked "how do I add a cron trigger" (topic `schedule`-tagged → .md), a devOnly topic (must be excluded), and a stale-translated locale. The prediction is falsified if flattened bodies lose meaning, for example if `:::compare` tables become unreadable.
Result: unmeasurable
Gate: contract

#### First experiment
Emit `public/llms-full.txt` from `GUIDE_CONTENT` with a one-off script. Paste it into Claude with 10 real support questions and score the answers.

#### Evidence
- `src/lib/guide-search.ts:156,188` - flattening and indexing already exist
- `src/lib/guide-body-index.ts:1-11` - the corpus is about 136 KB, derived at runtime
- `ls public | grep llm` → nothing, and `../personas/src-tauri/src/mcp_bin.rs:1-9` - MCP binary, tool-only

---

## Guide Content Blocks & Markdown
Today: a hand-rolled, client-side parser for the guide's markdown dialect (16 `:::` directive types) and the block components it renders. files=28

### 4.3A · One guide AST: parse once, and every reader consumes the same tree
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 6/10  ·  **Risk:** 3/10  ·  **Gate:** architecture

#### Summary
Turn the dialect into a typed, validated document model, compiled on the server or at build time. The renderer, JSON-LD, the search index, the TOC, translation parity and the agent exports (Data B) would all read one AST instead of four regex readers.

#### Description
Four independent readers parse the same dialect today: `parseBlocks` for rendering (a `"use client"` module, `GuideMarkdown.tsx:1,14`), `extractSteps` with its own `:::steps` regex for HowTo JSON-LD (`page.tsx:12-24`), `stripGuideMarkup` for search (`guide-search.ts:156`), and `extractHeadings` for the TOC (`extractHeadings.ts:10`). They can disagree. Worse, failure is silent. An unknown or malformed directive returns `null` from `parseCustomBlock` (`parseCustomBlock.tsx:37`), and `parseBlocks` drops it (`parseBlocks.tsx:133-134`: `if (parsed) emit(parsed)`), so the content disappears without even appearing as literal text. The only test in `guide-markdown/` is `headingId.test.ts`. Translations multiply the risk. EN has 175 directives and each sampled locale (de/ja/ar) has 172, so parity is unchecked across 13 × 11 files.

The moonshot is `parseGuide(md) → GuideDoc` (a discriminated union of block nodes with source positions), run in the server component. Rendering becomes `GuideDoc → React`, so the parser no longer ships to the client. A validator becomes a vitest suite over all 14 locales: unknown directive, empty block, `[default]` tag in `:::compare`, and directive-sequence parity with English per topic. JSON-LD, search and TOC become projections of the same tree. Registry subject: `authoring-block-vocabulary`, `docs-content-model`.

#### Flow
- Write `parseGuide` plus a vitest that runs every EN and locale body and fails on dropped blocks. This milestone proves the bet.
- Port `extractSteps`, `extractHeadings` and `stripGuideMarkup` to the AST.
- Render from the AST on the server, and keep only the interactive blocks (tabs, checklist, copy) as client islands.
- Add the per-topic directive-parity check to the translation pipeline (Localized A).

#### Expected impact
Authors and translators get build-time errors instead of vanished paragraphs. Readers get less client JS on guide routes, measured by `check:bundle` for `/guide/[category]/[topic]`. Risk: a rendering regression in the 16 blocks, so snapshot the server HTML before the swap.

#### Evaluation
Claim: resilience - no guide content can silently disappear
Before: 4 parsers, 1 test. A dropped block is invisible. The EN/locale directive count differs by 3 with no guard.
After: 1 parser, a 14-locale validator, 0 silently dropped blocks
Method: simulation - walked `:::note` (unknown → dropped today → error after), `:::compare` with `[default]` (body-text misparse) and a locale missing one `:::cards`. The prediction is falsified if the validator finds 0 issues across 14 × 116 bodies, which would mean the risk is theoretical.
Result: better
Gate: architecture

#### First experiment
Write a 50-line vitest that runs `parseBlocks` over all 14 × 116 bodies and counts directive openers that produced no element.

#### Evidence
- `src/components/guide/guide-markdown/parseBlocks.tsx:125-135` - drop on null
- `src/components/guide/guide-markdown/parseCustomBlock.tsx:20-37` - 16 types, null fallback
- `src/app/guide/[category]/[topic]/page.tsx:12-24` - second steps parser
- grep: EN `^:::` = 175 (104 `tip`, 18 `steps`), de/ja/ar = 172 each

### 4.3B · Operable docs: `:::live` blocks that mount the real demo surfaces
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 5/10  ·  **Gate:** direction

#### Summary
A guide topic about the review queue should contain a working review queue. A `:::live reviews` directive would lazy-mount the existing mock-backed dashboard surface inside the article, so the docs show a running system instead of describing a screenshot.

#### Description
The block vocabulary is rich but static. 104 of 175 directives are `:::tip` callouts, and six types are used exactly once. Only 3 topics carry a screenshot recipe (106 are text-only per `check-guide-coverage`). Meanwhile the site already runs most of the product on mocks: `/dashboard/{reviews,agents,events,executions,health,incidents,knowledge,messages,sla,...}` render from `src/lib/mockApi.ts` behind `authStore.isDemo` (`src/stores/authStore.ts:45,198`). The guide documents exactly those modules (for example `agent-health-indicators`, `checking-system-health`, `event-based-triggers`, and memory topics `topics.ts:872-989`). The two halves never meet.

The moonshot adds a `:::live <surface> [preset]` directive. It mounts a named demo surface through `next/dynamic({ssr:false})` inside `LazyMount`, with a scoped demo context so the visitor never has to "Try demo" first. A preset puts the surface in the state the article describes (for example 3 pending reviews, one SLA-breaching). The reader then performs the step in place. **Cost:** the dashboard shell is 451 KB (ArchitectWeb backlog), so this must load only on interaction behind a still-frame poster. That keeps the bundle budget and makes motion gating trivial. The text in those surfaces still carries hardcoded English (ship-loop #29), which this card inherits.

#### Flow
- One surface, `reviews` in `managing-reviews`-style topics, behind click-to-load. Measure interaction.
- A preset API on `mockApi` (seed state per embed).
- 5 surfaces mapped from `TOPIC_MODULE_MAP` module ids.
- A "Continue in full demo" handoff that keeps the seeded state.

#### Expected impact
Evaluators learn by doing and reach "aha" without installing. Measure embed activations and the conversion of embed users to the waitlist. Risk: demo-shell weight on guide routes if deferral leaks into the static graph (CLAUDE.md §9).

#### Evaluation
Claim: user - docs become operable
Before: 0 operable blocks across 116 topics. 3 topics have screenshot recipes.
After: 5+ topics with a live, seeded surface, and 0 KB added to first load
Method: simulation - walked the review-queue topic → `:::live reviews preset=sla-breach`, a memory topic → knowledge surface, and a no-JS crawler (gets the poster and text). The prediction is falsified if `check:bundle` for the topic route grows, which would mean the split leaked.
Result: unmeasurable
Gate: direction

#### First experiment
Hard-code one dynamic import of the reviews split pane into one topic behind a button, and check `check:bundle` and reader clicks for a week.

#### Evidence
- `src/components/guide/guide-markdown/parseCustomBlock.tsx:20-37` - the vocabulary to extend
- `src/app/dashboard/reviews/ReviewsSplitPane.tsx` - the mock-backed surface exists
- `src/components/LazyMount.tsx` - the deferral primitive exists
- `scripts/check-guide-coverage.mjs` run: "Topics with no screenshot recipe: 106"

---

## Guide Pages & Navigation
Today: the guide hub, category and topic routes, sidebar, TOC, reading progress, related topics and the search combobox. files=29

### 4.4A · The guide as the desktop's contextual-help backend
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** contract

#### Summary
Invert `TOPIC_MODULE_MAP` into a published module → topics feed, and finish the half-built embed contract. The desktop then gets "Help for this screen" from the live guide, and the guide knows which screen the reader came from.

#### Description
The web side was built for embedding, and the desktop side never connected. `guide-link.ts:7-30` checks `window.__PERSONAS_DESKTOP__` and dispatches `personas:open-external` for a host to intercept. A grep of the desktop's `src` and `src-tauri/src` finds **0 references** to either. `DESKTOP_MODULES` (`desktop-modules.ts:28`), a full mirror of the desktop sidebar, has no UI consumer, only `src/data/desktop-plugins.test.ts:3`. `TOPIC_MODULE_MAP` (`:201`) maps 116 topics to module paths but is read in one direction only, for the "Find in App" badge. The desktop's Home → Learning hub (`../personas/src/features/home/sub_learning/`) shows guided tours and contains no link to the guide.

The moonshot publishes `/guide/modules/v1.json`, generated from `TOPIC_MODULE_MAP` inverted and filtered by `isTopicVisible`: per module and child id, a ranked list of topics with titles in all 14 locales. It is versioned the way `roadmap/v1.json` is. The desktop fetches it, or bundles a snapshot, to put a help affordance on each screen. Clicks open `/guide/<cat>/<topic>?from=<moduleId>` through the existing `openGuideLink` path, and the topic page shows "You're on: Agents → Editor". It reuses `desktop-modules.test.ts` (which already guarantees every topic maps) and `openGuideLink`. **Bends:** it adds a route (it modifies none), and it creates a cross-repo contract that needs desktop work.

#### Flow
- Generate `public/guide/modules/v1.json` at build, plus a schema test. This proves the shape.
- Desktop: one screen (Agents editor) renders the top 3 topics from the feed.
- Desktop sets `__PERSONAS_DESKTOP__` in its webview, or opens the system browser with `?from=`.
- Web: a `from` banner plus analytics on which screens generate help traffic.

#### Expected impact
Desktop users get help in context instead of searching a website. The guide team learns which screens confuse people. Measure guide visits carrying `from=`. Risk: feed and sidebar drift, which Data A's nav claims cover.

#### Evaluation
Claim: user - help reachable from the screen that needs it
Before: 0 desktop → guide links. The embed contract has 0 desktop references. `DESKTOP_MODULES` has 0 UI consumers.
After: every desktop module with ≥1 visible topic gets a help entry point
Method: simulation - walked the Agents editor → `writing-effective-prompts`, Companion → Athena topics, and a devOnly topic (excluded from the feed). The prediction is falsified if more than 30% of module ids in the feed do not exist in the desktop `sidebarData.ts`.
Result: better
Gate: contract

#### First experiment
Emit the inverted JSON with a 30-line script and count the modules with 0, 1-3 and more than 3 topics.

#### Evidence
- `src/lib/guide-link.ts:7-30` - the embed contract, web half only
- `src/data/guide/desktop-modules.ts:28,201` - mirror and map
- `src/data/desktop-plugins.test.ts:3` - the only `DESKTOP_MODULES` consumer
- grep `__PERSONAS_DESKTOP__|personas:open-external` in `../personas/src*` → 0

### 4.4B · Outcome paths: cross-category curricula with resumable progress
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 6/10  ·  **Risk:** 2/10  ·  **Gate:** direction

#### Summary
Readers come to the guide with a goal ("ship my first scheduled agent"), not a category. Add authored paths that thread topics across categories and remember progress, so the guide reads as a course instead of a reference shelf.

#### Description
Navigation today is shaped by categories only. Prev/next walks within one category (`page.tsx:109-114`). Related topics explicitly *exclude* the same category and need at least 2 shared tags (`guide-utils.ts:53-60`), so a reader finishing `creating-a-new-agent` never gets routed to the trigger, credential and monitoring topics that finish the job. The only reader-state persistence in the whole guide is the `:::checklist` block's localStorage (`blocks/Checklist.tsx:28,49`). `ReadingProgress` tracks scroll, not completion. The simple/power mode toggle (`guidePageData.ts`) filters topics but sequences nothing.

The moonshot adds `paths.ts`: 4-6 outcome paths, each an ordered list of topic ids with a goal and an estimated time. The time comes from the reading minutes `TopicView` already computes. The pieces are a path hub card on `/guide`, a "Path: step 3 of 7" rail on topic pages (the path's prev/next overrides the category's prev/next), and completion stored per viewer in localStorage. That is exactly the per-viewer convenience the repo allows it for. A path ends with a handoff: download, or `:::live` from Blocks B. Path validity is unit-tested against `GUIDE_TOPICS` and visibility, like `guide-refs.test.ts`. All path copy goes through i18n ×14.

#### Flow
- One path, "Your first automated agent" (install → create → credential → trigger → monitor). Measure completion rate.
- Path rail plus progress, persisted with try/catch.
- 4 more paths and a hub section.
- Optional: the desktop Learning hub links paths through Pages A.

#### Expected impact
New users finish setup instead of bouncing between categories. Measure path starts, completions and topic-to-topic continuation rate. Risk: authored paths go stale when topics move, which the unit test catches.

#### Evaluation
Claim: user - goal-directed reading
Before: 0 cross-category sequences. Related links exclude same-category topics. No completion state.
After: 5 paths spanning about 30 topics, with resumable progress
Method: simulation - walked a first-agent path across getting-started → agents-prompts → credentials → triggers → monitoring, a devOnly topic inside a path (the test must fail), and a reader returning after a week (resumes at step 4). The prediction is falsified if continuation rate does not beat the prev/next click-through.
Result: unmeasurable
Gate: direction

#### First experiment
Hard-code one path as a static callout block at the top of 5 topics, with "next in path" links, and compare click-through against category next.

#### Evidence
- `src/app/guide/[category]/[topic]/page.tsx:109-115` - category-bound prev/next
- `src/lib/guide-utils.ts:53-60` - related links exclude the same category
- `src/components/guide/blocks/Checklist.tsx:28,49` - the only persistence
- `src/lib/guide-refs.test.ts` - the existing pattern for validating refs

---

## Templates Gallery & Detail
Today: a hand-authored gallery of 57 agent templates with invented YAML configs, static detail pages, and an "Open in Personas" deep link. files=18

### 4.5A · Templates derived from the desktop's real catalog, with a deep link the app handles
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 8/10  ·  **Risk:** 6/10  ·  **Gate:** irreversible

#### Summary
Generate `/templates` from the desktop's shipped template catalog: persona, use cases, connectors and adoption questions. "Open in Personas" and "Copy configuration" then do something real. Today neither does.

#### Description
The web gallery and the desktop catalog have never shared a record. `src/lib/templates.ts` hand-authors 57 `AgentTemplate`s. Each `config` is a YAML dialect (`templates.ts:48-58`: `steps: - classify: ...`) that the desktop never reads. The desktop's catalog is 56 JSON templates under `../personas/scripts/templates/<category>/` (schema_version 3, 37 marked `is_published: true`), each with `payload.persona` (goal, identity, principles, tools, connectors), `use_cases`, and typed `adoption_questions`. **Id overlap between the two is 0.** The CTA fires `personas://template/<id>` (`TemplateDetail.tsx:89`), but the desktop's deep-link handler only knows `auth/callback`, `share`, `import/<slug>`, `ref/` and `pair` (`../personas/src-tauri/src/boot/deep_link.rs:19-61`). The click does nothing, and then the 1500 ms blur heuristic may wrongly show "app not found". The copied YAML cannot be imported either, because the importer expects a persona bundle (`import_export.rs:328-332`).

The moonshot is `scripts/generate-templates-web.mjs` (the `generate-connectors.mjs` pattern) that emits `templates.ts` from published desktop JSON. The detail page shows the real persona card, use cases, the connectors needed (linked to `/connections?connector=`), and the adoption questions as a preview of what you'll be asked. The CTA uses a link the desktop handles, either `personas://import/<slug>` through Templates B or a new desktop `template/<id>` arm. **Irreversible:** the current 57 ids are public URLs (`sitemap.ts:6`). Retiring them needs a redirect map to the nearest real template, and an owner call on CLAUDE.md's "no route-path changes". Template content is English data today and would stay so, which is an i18n deviation to record.

#### Flow
- Prove it: generate 5 desktop templates into the existing card/detail UI unchanged.
- Add the desktop `personas://template/<id>` arm, or route through import.
- Generate the full set with a redirect map for the 57 legacy ids, and run the duplicate-id guard (`template-queries.ts:16`).
- Add a CI drift check comparing the generator output with the committed file (Windows-side, like guide drift).

#### Expected impact
Visitors see what the product actually ships, and the CTA works. Measure deep-link success (blur) rate and adoption after visit. Risk: losing indexed URLs, so redirects must be exhaustive.

#### Evaluation
Claim: quality - the gallery is truthful and actionable
Before: 57 web templates, 0 match desktop ids, 0 handled deep links, 0 importable configs
After: about 37 published templates, 100% id parity, a working one-click open
Method: simulation - walked `gmail-inbox-triage` (legacy → redirect), `demo-recorder` (desktop → generated detail with 2 connectors), and the CTA → `deep_link.rs` arm. The prediction is falsified if fewer than about 30 desktop templates are publishable as-is.
Result: better
Gate: irreversible

#### First experiment
Map the 57 web ids to their nearest desktop templates by hand in a CSV. If more than 30% have no counterpart, the redirect plan needs owner input before any build.

#### Evidence
- `src/app/templates/[id]/TemplateDetail.tsx:89` - `personas://template/${id}`
- `../personas/src-tauri/src/boot/deep_link.rs:19-61` - no `template/` arm
- `src/lib/templates.ts:18-32,37` - hand-authored shape
- count: desktop 56 templates (37 published), web 57, id intersection 0

### 4.5B · Close the desktop's share loop: the public persona gallery it already calls
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 9/10  ·  **Risk:** 6/10  ·  **Gate:** contract

#### Summary
The desktop ships a "publish your agent → a friend imports it in one click" loop whose server is supposed to be personas-web, and that server does not exist. Build it: community personas at `/p/<slug>`, an import button that works, and install counts as social proof.

#### Description
`../personas/src-tauri/src/commands/core/gallery.rs` calls `POST {PERSONAS_WEB_URL|https://personas.ai}/api/personas/publish` (`:107`), `GET /api/personas/{slug}` that returns `{bundle}` (`:144`), and `POST /api/personas/{slug}` as an install counter (`:166`). Publishing returns a share URL `…/p/<slug>` (`:62-66`). The receiving end is wired: `personas://import/<slug>` is handled (`deep_link.rs:43-51`) and imported by `eventBridge.ts:1012`. On the web side, `src/app/api/` has no `personas/` route and `src/app/` has no `p/` route. The default host `https://personas.ai` is the same `SITE_URL` default (`src/lib/seo.ts:3-4`). Every share link a desktop user could generate would 404 today. (The publish TS wrapper has no `.tsx` caller yet, so the desktop UI is waiting too.)

The moonshot implements the three endpoints plus `/p/<slug>`. That page is a server-rendered persona card built from the bundle (name, description, use cases, connectors), with "Open in Personas" (`personas://import/<slug>`, which is handled), a download of the `.persona.json`, OG image and JSON-LD reused from template detail. `/templates` gains a "Community" shelf next to the curated set from Templates A. It reuses `safeJsonLd`, `TemplateFallbackModal`, the vote route's rate limiting and validation patterns, and `supabase-admin.ts` (server-only).

**Constraints bent:** it needs a new Supabase table plus RLS. That is a schema change outside the repo, and CLAUDE.md forbids it without the owner. It adds `/p/` and `/api/personas/` routes. It needs moderation and abuse policy (publisher is pseudonymous; `installId` is used for abuse attribution). The rate limiter is per-instance (ship-loop #13), so it needs the deploy-target decision.

#### Flow
- Read-only first: `GET /api/personas/{slug}` and `/p/<slug>` served from a static seed (curated bundles), with no DB. This proves import end to end.
- Supabase table plus publish with validation, size caps and a report button.
- Community shelf, install counts and OG cards.
- Desktop: wire the publish button.

#### Expected impact
Users become distribution, because every shared agent is a landing page with a working install. Measure publishes, `/p/` visits, imports, and K-factor from the install counter. Risk: hosting user-generated agent bundles (prompt-injection payloads, PII in memories), so publish-time scrubbing is mandatory.

#### Evaluation
Claim: user - a one-click share-to-install loop
Before: 3 endpoints the desktop calls, 0 implemented. Share URLs 404.
After: publish → `/p/<slug>` → import works, with installs counted
Method: simulation - walked desktop publish → 200 `{slug,url}`, a friend clicks `/p/x` → `personas://import/x` → `GET /api/personas/x` → `import_persona_from_value`, and a hostile bundle (oversize, script in description) rejected. The prediction is falsified if the desktop bundle carries data that cannot be published safely (secrets) and scrubbing guts it.
Result: better
Gate: contract

#### First experiment
Add a `GET /api/personas/[slug]` handler that returns one hand-exported bundle from `public/`. Run the desktop with `PERSONAS_WEB_URL=http://localhost:3001` and fire `personas://import/<slug>`.

#### Evidence
- `../personas/src-tauri/src/commands/core/gallery.rs:38-44,62-66,107,144,166` - the contract
- `../personas/src-tauri/src/boot/deep_link.rs:43-51` - the import arm is live
- `ls src/app/api` → download, events, executions, feature-*, orchestrator, roadmap, stats, votes, waitlist (no `personas`)

---

## Connector Detail Modal
Today: a per-connector overlay with a header, use-case list, setup CTA and a "Try it now" terminal that animates a scripted run. files=7

### 4.6A · The modal renders the desktop connector manifest: setup, credentials, and what it cannot do
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** architecture

#### Summary
Retire the scripted terminal and the placeholder use cases. Render what the desktop already knows about each connector: exact credential fields, the step-by-step setup guide, the docs link, and capability boundaries such as "outbound only".

#### Description
The modal teaches a product that does not exist. Every connector's "Try it now" streams the same script: "Found 24 results. Filtering... All done! 3 items updated. Finished in 3.4s" (`TerminalSimulator.tsx:8-25`), behind a `personas run "…"` command. The desktop ships no such CLI (its binaries are `personas-mcp`, `athena-bench-validate` and `personas-memory-sim`, per `../personas/src-tauri/Cargo.toml:501-520`). **88 of 125** connectors carry only generator placeholders built from 36 stock titles (`generate-connectors.mjs:181-185`). Meanwhile the desktop manifests hold the real thing, and the generator throws it away (`generate-connectors.mjs:270-290` keeps only label, color, category, summary and auth label): `fields` (196 credential fields across 135 connectors, with help text and placeholders), `metadata.setup_guide` (120/135), `docs_url` (123/135), `pricing_tier`, `outbound_only`, and `events` and `services`.

The moonshot extends `Connector` (`src/data/connectors.ts:7-18`) with `fields`, `setupGuide`, `docsUrl`, `limits` and `events`. The modal becomes a "What you'll need" section (field labels and types, never values), "Set it up in 4 steps" (the desktop's guide, rendered through the guide's `:::steps` StepWizard), "What it can't do" (from `outbound_only` and summaries), and "Templates that use it" (Templates A). The terminal goes, or is replaced by a recorded real run when one exists. This depends on the sync in Catalog A, or works off a one-shot regen. Setup guides are desktop English, which is an i18n gap to record or translate through the guide pipeline.

#### Flow
- Extend the generator for 3 fields (setup guide, docs URL, fields) and render them for 10 marquee connectors.
- Replace `TryItToggle` + `TerminalSimulator` with the credentials and setup sections.
- Add a "can't do" boundary line and a templates cross-link.
- Hand those strings to the translation pipeline.

#### Expected impact
Visitors judge setup effort honestly before installing, and support load drops. Measure modal dwell time and docs-link clicks. Risk: exposing a field list could read as complexity. Present it as "about 2 minutes".

#### Evaluation
Claim: quality - the modal content is true
Before: 125/125 terminals identical and fabricated. 88/125 placeholder use cases. 0 setup guides shown.
After: about 120 connectors with the real setup guide, 135 with real credential fields
Method: simulation - walked `slack_webhook` (1 password field, 4-step guide, outbound-only → "can't read messages"), a placeholder-only CRM connector, and `browser` (desktop-only, auth `builtin`). The prediction is falsified if setup guides contain internal-only notes that are not fit to publish.
Result: better
Gate: architecture

#### First experiment
Render `setup_guide` and `fields` for `slack_webhook` and 4 others from the desktop JSON in the modal. Show it to 3 people and ask "could you set this up?"

#### Evidence
- `src/components/sections/connector-modal/components/TerminalSimulator.tsx:16-24` - the scripted run
- `scripts/generate-connectors.mjs:182` - `personas run` invented
- `scripts/generate-connectors.mjs:270-290` - manifest fields dropped
- `../personas/scripts/connectors/builtin/slack-webhook.json` - fields, setup_guide, outbound_only

### 4.6B · Plan before you install: describe a job and get this connector's real dry-run plan
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 5/10  ·  **Gate:** direction

#### Summary
Replace "watch a fake terminal" with "type what you want". A server-side model plans the agent against this connector's real manifest and answers honestly: the steps, the credentials it would ask for, the matching template, and "this connector can't do that part, pair it with X".

#### Description
The modal's interactive moment is a fixed animation, identical for every connector (`TerminalSimulator.tsx:16-24`). The visitor's actual question, "can Personas do my thing with Slack?", has no answer anywhere on the site. The ingredients for an honest answer are all data the desktop ships: per-connector `fields`, `outbound_only`, `services` and `events` (11 and 5 connectors respectively), and 56 templates whose `payload.persona.connectors` declare slots with `category`, `role` and provider `options` (54/56 templates; 131 refs). An orchestration company can show planning directly on its website.

The moonshot is a "Plan it" input in the modal. A `/api/plan` route (server-only key, cached system prompt holding the connector manifest, the template slot index, and the relevant guide topics from Data B) returns structured output: steps, required credential fields, a recommended template id, unsupported parts with an alternative connector, and links into the guide. Nothing executes, and no visitor credentials are ever accepted. The answer comes back in the reader's locale. It reuses `connectors.ts` (enriched by Modal A), the template data from Templates A, and the guide corpus.

**Constraints bent:** this adds an LLM dependency, cost and an abuse surface to a static site. Rate limiting is per-instance today (ship-loop #13) and needs a durable store. It adds an API route. The model output is user-facing text outside `en.ts`, a deliberate exception to rule 1 that must be named.

#### Flow
- A static prototype: 20 pre-generated plans for 5 marquee connectors, shown as "Plan it" chips, with no live model. This proves interest.
- Live route with structured output and a cap per IP and day.
- Template handoff ("Adopt this plan" → `/templates/<id>`).
- Log the questions that have no plan as feedback for the connector roadmap.

#### Expected impact
Evaluators get a yes/no on their own use case in 10 seconds. Measure plans requested, plans → template clicks → download. Risk: a confident wrong plan, so ground every step in manifest fields and refuse beyond them.

#### Evaluation
Claim: user - a visitor's own job gets an answer before install
Before: 0 visitor-specific answers. 1 scripted animation reused 125 times.
After: a grounded plan per query, with explicit unsupported parts
Method: simulation - walked "post failed deploys to #ops" on `slack_webhook` (yes: outbound plus a GitHub Actions slot), "summarize #general daily" on `slack_webhook` (no: outbound-only, suggest the Slack bot connector), and a prompt-injection query (refused). The prediction is falsified if more than 20% of sampled plans cite fields that are not in the manifest.
Result: unmeasurable
Gate: direction

#### First experiment
Hand-write 10 plans with Claude from the real `slack_webhook` and `github` manifests. Show them as static chips in the modal and measure clicks against "Try it now".

#### Evidence
- `src/components/sections/connector-modal/components/TerminalSimulator.tsx:8-25` - a fixed script for every connector
- `../personas/scripts/connectors/builtin/*.json` - `outbound_only`, `fields`, `services` (11), `events` (5)
- desktop templates: 54/56 declare `persona.connectors` with `category`, `role` and `options`

---

## Connectors Catalog
Today: the `/connections` page, a 125-card catalog in 18 categories with URL-synced filters, backed by a one-shot snapshot of the desktop's connector JSON. files=10

### 4.7A · One live capability registry: desktop manifests to every web surface, with a drift gate
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 6/10  ·  **Risk:** 3/10  ·  **Gate:** architecture

#### Summary
Make `connectors.ts` a continuously regenerated projection of the desktop's builtin manifests, with a check that fails on divergence. Then make every web surface that names a tool resolve against it: the catalog, template service flows, the event-bus swarm and guide credential topics.

#### Description
The catalog is a snapshot that has drifted. `generate-connectors.mjs` reads an absolute Windows path (`:19`, `C:/Users/kazda/kiro/personas/scripts/connectors/builtin`), was run once on 2026-05-17, and is documented as "one-shot" (`:2`). Since then the desktop has 13 commits touching that folder, and its catalog has grown to **135 vs the web's 125**. Missing on the web are `anthropic-admin`, `browser`, `granola`, `helicone`, `huggingface`, `langfuse`, `langsmith`, `operations_database`, `tracklight` and a Google OAuth template, so the whole LLM-observability set the product would most want to show is absent. A second registry, `src/lib/tool-catalogue.ts:18` (37 entries, its own ids and colors), feeds the event-bus swarm (`event-bus-showcase/data.ts:2`) and already disagrees with the catalog (doc gotcha: GitHub `#8b5cf6` vs `#1F2937`). Template `serviceFlow` strings are free text. 3 of 13 (`AWS`, `Calendar`, `Web Search`) match no connector label.

The moonshot makes the generator path-configurable, deterministic and `--check`-able (the `emit-guide-status.mjs` contract: exit 1 when stale, exit 3 when the source is unavailable, never silent). It runs Windows-side next to the guide drift check. Every web reference to a tool becomes a typed `ConnectorName`: template slots, swarm entries (`tool-catalogue` becomes a projection with a `swarmFeatured` overlay), and guide credential topics. A vitest asserts that all of them resolve. Registry subject: `connector-catalog`.

#### Flow
- `generate-connectors.mjs --check` against the desktop. Today it reports +10 and exits 1, which proves the gate.
- Regenerate, so the 10 missing connectors appear (placeholder use cases are marked as such).
- `tool-catalogue` derived from `connectors.ts` plus an overlay, with a vitest on resolution.
- Template and guide references typed against `ConnectorName`.

#### Expected impact
The catalog stops under-selling the product, most of all its AI-ops integrations. Counts in metadata (`layout.tsx:11`) stay true. Measure drift count, which should be 0 at each release. Risk: the generator preserves hand-written use cases by regex over git HEAD (`:35-60`), which is fragile. Move those to a sidecar JSON.

#### Evaluation
Claim: quality - catalog parity with the product
Before: 125/135 (10 missing), 2 registries with conflicting colors, 3/13 unresolvable template services
After: 135/135, 1 registry, 0 unresolved references, a failing check on drift
Method: simulation - walked a new desktop connector landing (→ `--check` exit 1 → regen), GitHub's color (one value everywhere), and template `Calendar` (→ `google_calendar` typed). The prediction is falsified if the swarm visual needs ids that the catalog cannot carry.
Result: better
Gate: architecture

#### First experiment
Add `--check` to the generator (diff the generated text against `src/data/connectors.ts`) and run it. Confirm it names the 10 missing connectors.

#### Evidence
- `scripts/generate-connectors.mjs:2-19` - one-shot, hard-coded path
- `src/lib/tool-catalogue.ts:18` and `src/components/sections/event-bus-showcase/data.ts:2` - the second registry
- comm of desktop `name`s vs web `name`s: only-desktop = 10, only-web = 0
- `git log --since=2026-05-17 -- scripts/connectors/builtin` (desktop) = 13 commits

### 4.7B · Stack composer: pick the tools you use and see the agents you could run
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 8/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
Turn a catalog of logos into a buyer's answer. A visitor multi-selects their stack (Sentry, Slack, GitHub, Notion) and the page shows the ready-made agents and teams whose connector slots that stack fills, ranked, with "you'd also need X" for near-misses.

#### Description
Today the catalog answers "does Personas integrate with X?" one card at a time. Selection is single-category plus substring search (`connections-catalog/index.tsx:38-52`), and the open state is one connector (`?connector=`). The web templates touch only 13 services, so **about 115 of 125 connectors have no template pointing at them**. The visitor can't see what their tools add up to. The desktop data needed to answer that already exists. 54 of 56 desktop templates declare `payload.persona.connectors` slots. 69 of 131 refs name a builtin connector directly (14 distinct), and the rest are category or role slots with provider `options` (for example `monitoring` → `["sentry","datadog","betterstack",...]`). A slot matcher (exact name, else category and provider option) is a few dozen lines.

The moonshot adds a "My stack" mode to `/connections`: checkboxes on cards, with the selection in the URL (`?stack=slack,github,sentry`) via the existing single `replaceState` writeback (`page.tsx` URL-state pattern). A results rail shows "N agents you can run today" (all required slots filled), "M more with one connector" (with the missing one named), and team presets from `../personas/scripts/templates/_team_presets/`. Each result links to its template (Templates A) and Plan it (Modal B). A shareable stack URL makes a natural "send to my team" artifact. New copy goes through i18n ×14. The catalog's existing hardcoded English is a known deviation this card should not extend.

#### Flow
- Match engine plus a unit test over desktop template slots, with a static count of fillable templates for 5 common stacks.
- Stack selection in the URL, plus the results rail.
- Near-miss ranking and team presets.
- An "Email me this stack" capture to the waitlist.

#### Expected impact
Evaluators see concrete value for their own tools, and sales gets a shareable artifact. Measure stack selections → template views → download. Risk: thin results for long-tail stacks. Show near-misses rather than empty states.

#### Evaluation
Claim: user - the catalog answers "what can I do with my tools?"
Before: 1-connector view. About 115/125 connectors link to no template. No multi-tool reasoning.
After: any stack yields a ranked set of runnable and near-miss agents from about 56 templates
Method: simulation - walked {Slack, GitHub, Sentry} (fills the monitoring/devops slots → several devops templates), {Notion} only (near-misses that need messaging), and {Granola} (desktop-only today → needs Catalog A first). The prediction is falsified if the median stack fills fewer than 2 templates.
Result: better
Gate: direction

#### First experiment
Write a node script that takes 5 realistic stacks and counts fully and one-short fillable desktop templates. If the median is at least 3, build the UI.

#### Evidence
- `src/components/sections/connections-catalog/index.tsx:38-52` - single-category and substring filtering only
- desktop templates scan: `templatesWithConnectors 54, refs 131, resolveToBuiltin 69, distinctBuiltinUsed 14`
- `../personas/scripts/templates/devops/*.json` `payload.persona.connectors[0]` - `{category:"monitoring", options:[sentry,datadog,...]}`
- web templates: 13 distinct `serviceFlow` values (`src/lib/templates.ts`)
