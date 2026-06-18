# Guide Data, Content & Search Index — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 2, Medium: 3, Low: 0)

Scope: `src/data/guide/*` (categories, topics, types, desktop-modules, getLocalized, content/*) plus `src/lib/guide-search.ts`, `guide-utils.ts`, `guide-link.ts`. Verified against the current 116-topic / 11-category dataset, the 13 non-English locale dirs, the two CI guards (`check-guide-content.mjs`, `check-i18n-coverage.mjs`), and `e2e/guide.spec.ts`.

Verification notes (things checked and found CLEAN, so deliberately NOT reported):
- No duplicate topic ids (116 unique). No orphan `categoryId` (build-time invariant in `guide-utils.ts` lines 73-83 throws, and `guide-search.ts` imports it so the side-effect runs before any search).
- Content-key ↔ topic-id alignment is perfect across all 11 `content/*.ts` (0 missing, 0 orphan). `check-guide-content.mjs` enforces this in CI.
- All 13 locale `topics.ts` files have exactly the 116 keys — no locale key drift today.
- `searchGuide` is NOT vulnerable to long-query DoS (levenshtein length early-exit at line 22) and NOT vulnerable to regex injection (query only feeds `String.includes`/`split(/\s+/)`, never `new RegExp(userInput)`). Multi-word and special-char queries resolve correctly. These were the 2026-05-10 suspects — they are sound now.

---

## 1. No unit-test harness for guide search ranking, getLocalized fallback, and data-integrity invariants
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing quality gate / risk-weighted coverage
- **File**: src/lib/guide-search.ts:18-120, src/data/guide/getLocalized.ts:47-119, src/lib/guide-utils.ts:52-83
- **Scenario**: The three highest-logic, purest functions in this context — `searchGuide`/`levenshtein` ranking, `getLocalizedTopic` per-field English fallback, and `getRelatedTopics` scoring — have **zero** assertion-level tests. The only automation is two regex-based CI guards (which check id↔content↔category linkage) and Playwright e2e (which only smoke-tests that *a* result appears). The repo has no vitest/jest runner at all, so a ranking regression (e.g. tag match outranking exact-title, fuzzy threshold flipping, `getLocalizedTopic` returning a non-en field when the locale key is missing) ships invisibly.
- **Root cause**: Pure, deterministic, easily-unit-testable functions are guarded only by end-to-end UI assertions that can't express ranking/fallback invariants; there is no unit layer where "query `arena` returns `Measuring a version` as the top hit" or "missing locale body falls back to English body, not empty string" can be pinned.
- **Impact**: false-confidence test / silent ranking + localization regressions — a business-critical discovery path (guide search) and the entire dormant-but-shipping localization fallback have no meaningful test floor.
- **Fix sketch**: Add a lightweight unit runner (vitest, zero-config for TS) with an LLM-generatable batch asserting real invariants: known-query→expected-top-topic for ~10 queries; `levenshtein` symmetry + threshold; `getLocalizedTopic('de', id, enBody)` falls back field-by-field to English when a key is absent; `getRelatedTopics` excludes self + same-category and requires score≥2. Wire `vitest run` into the existing `check:*` CI step.

## 2. Stale e2e test targets a renamed/removed topic id (`keyboard-shortcuts-and-tips`) → always 404s
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: success-theater / broken test
- **File**: e2e/guide.spec.ts:178-185
- **Scenario**: The test `"guide topic renders keyboard grid"` navigates to `/guide/getting-started/keyboard-shortcuts-and-tips`. That topic id does not exist in `topics.ts` (the keyboard/shortcut content was folded into `understanding-the-interface`). `page.tsx` calls `notFound()` for the unknown id, so the page renders the 404 view; the test then asserts `article.locator("kbd")` count ≥ 6 against a page that has no `<article>`, so the test fails — or, if the suite is being run/triaged loosely, it masks the fact that nothing actually verifies the keyboard grid renders on the real topic.
- **Root cause**: e2e specs hard-code topic slugs as string literals with no link back to `GUIDE_TOPICS`, so a topic rename silently rots the test; nothing fails at type-check or content-guard time because the guard only validates topics.ts↔content, not test fixtures.
- **Impact**: false-confidence test (broken/red test in the guide suite; the keyboard-grid render path is effectively untested) and a latent signal that other hard-coded slugs in this spec could rot the same way.
- **Fix sketch**: Point the test at the real topic (`understanding-the-interface`) or restore the slug; better, derive at least one navigated slug from `GUIDE_TOPICS` so a rename breaks the test at the data layer. Add a tiny guard asserting every slug referenced in `e2e/guide.spec.ts` exists in `GUIDE_TOPICS`.

## 3. TOPIC_MODULE_MAP drift — 16 live topics have no "In app" badge and no CI guard catches it
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: data integrity / map drift
- **File**: src/data/guide/desktop-modules.ts:160-681 (consumed at src/app/guide/[category]/[topic]/TopicView.tsx:125-127)
- **Scenario**: `TOPIC_MODULE_MAP` has 100 keys but `GUIDE_TOPICS` has 116. The 16 newer topics — the entire `companion`/Athena category (`meet-athena`, `chatting-with-athena`, `voice-and-hold-to-talk`, `athenas-long-term-memory`, `proactive-check-ins`, `guided-walkthroughs`, `the-decision-hub`, `operating-by-chat`), the 4 new monitoring topics (`tracking-goals`, `measuring-outcomes-with-kpis`, `director-verdicts-and-categories`, `director-momentum-and-stale-sweep`), and 4 getting-started topics (`browsing-templates`, `adopting-a-template`, `recipes`, `interface-modes`) — are absent. `TopicView` guards with `TOPIC_MODULE_MAP[topic.id] && (...)`, so those pages silently render with **no** "Find in App" badge, inconsistent with every other topic.
- **Root cause**: The map is maintained by hand and `check-guide-content.mjs` only validates category/topic/content linkage — it never asserts `TOPIC_MODULE_MAP` covers `GUIDE_TOPICS`. Adding a topic does not force a map entry.
- **Impact**: UX degradation — a whole product category (Athena) and the newest features ship without the in-app cross-reference, and the omission is invisible until someone eyeballs each page.
- **Fix sketch**: Extend `check-guide-content.mjs` to assert `new Set(Object.keys(TOPIC_MODULE_MAP))` ⊇ every `GUIDE_TOPICS` id (allow an explicit opt-out list), failing CI on drift; then backfill the 16 missing entries.

## 4. `getLocalizedTopic` fallback path is untested and never negative-caches a failed locale import
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: coverage gap / minor perf
- **File**: src/data/guide/getLocalized.ts:47-77, 87-119
- **Scenario**: This helper is the single resolution point for all future localized guide content, with the explicit contract of *independent per-field* English fallback. It is dormant today (`i18nStore.setLanguage` is a hard no-op, locked to `en` — i18nStore.ts:73-79), so the entire non-en branch (lines 106-118) has never run in production and has no test. When the switcher is enabled, a partially-translated topic (title present, body missing) must yield translated-title + English-body. Separately, `loadLocaleTopics`/`loadLocaleContent` only cache *successful* imports; a `catch`-ed failure (missing locale file) returns `null` without memoizing, so every render of that topic re-attempts the dynamic import.
- **Root cause**: Fallback correctness lives in three independent `?? english` expressions that are only ever exercised in the `en` short-circuit (lines 98-104) today; no test pins the non-en field-merge, and the lazy registry has no negative-cache entry on import failure.
- **Impact**: false-confidence test (the localization fallback contract is asserted only in prose comments) and a latent redundant-fetch-per-render once locales activate.
- **Fix sketch**: Unit-test the merge (mock the dynamic imports): missing topics module → all-English; body-only-missing → translated title/desc + English body; unknown topicId → defensive `{title:"",description:"",body:englishBody}`. Negative-cache failed imports (`localeTopicsModules[lang] = async () => null`) so a missing locale resolves once.

## 5. DESKTOP_MODULES hierarchy is never validated against TOPIC_MODULE_MAP — moduleId/path can silently diverge
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: data integrity / dead registry
- **File**: src/data/guide/desktop-modules.ts:21-155 vs 160-681
- **Scenario**: Every `TOPIC_MODULE_MAP` entry carries a `moduleId` (e.g. `"agents"`, `"overview"`) plus a display `path` like `["Agents", "Editor", "Activity"]`. But `ModuleBadge` only reads `moduleRef.path`/`moduleRef.label` (ModuleBadge.tsx) — it never resolves `moduleId` against `DESKTOP_MODULES`, and the `path` segments ("Editor", "History", "Director", "Assignments") frequently do not correspond to any `DESKTOP_MODULES` child id/label. So `DESKTOP_MODULES` is an unreferenced registry: a typo'd `moduleId`, or a `path` pointing at a sidebar location that was renamed/removed in the desktop app, produces a confidently-rendered but wrong "Find in App" breadcrumb with nothing to catch it.
- **Root cause**: The `moduleId` field implies a referential link to `DESKTOP_MODULES`, but no code or guard ever dereferences it, and `path` is free-form display text rather than derived from the hierarchy — so the two structures drift independently.
- **Impact**: UX degradation / data integrity — users are pointed to non-existent or stale desktop-app locations, and the `DESKTOP_MODULES` registry gives a false impression of being the source of truth.
- **Fix sketch**: In `check-guide-content.mjs`, assert every `moduleRef.moduleId` exists in `DESKTOP_MODULES` and (optionally) that `path[0]` matches that module's label; or drop the unused `moduleId`/`DESKTOP_MODULES` if the breadcrumb is intentionally free-form, to remove the false source-of-truth.
