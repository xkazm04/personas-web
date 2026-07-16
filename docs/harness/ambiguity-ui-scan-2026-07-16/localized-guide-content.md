# Localized Guide Content (14 locales) — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 1, Medium: 3, Low: 1)

## 1. Translation drift ledger is desynced from the actual translations — detector reports 767 issues nobody can act on
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: translation-drift-ledger-desync
- **File**: `src/data/guide/locales/cs/_meta.json:1` (same in all 13 locales); detector: `scripts/i18n/check-guide-translations.mjs:134`
- **Scenario**: Run `node scripts/i18n/check-guide-translations.mjs`. Every locale reports 59 issues (19 "missing" + 40 "stale"), 767 total. But `scripts/guide-i18n-audit.mjs` shows all 13 locales at 116/116 titles and 116/116 bodies — the 19 "missing" topics (browsing-templates, adopting-a-template, recipes, interface-modes, team-assignments, …) ARE translated in every locale's `topics.ts`/`content/*.ts`; they were just never recorded in `_meta.json` (97 entries vs 116 topics). Meanwhile 40 topics per locale carry a `translatedFromHash` that no longer matches current English.
- **Root cause**: The batch that added the 19 newer topic translations skipped the `_meta.json` bookkeeping step, and English source has been edited since the single big-bang translation pass (every entry stamped `2026-05-16T16:00:00.000Z`). Nothing re-stamps the ledger.
- **Impact**: The drift detector — the only mechanism that can tell whether hand-translated content still matches its English source — is now all noise. The 40×13 potentially *genuinely stale* translations (users reading outdated instructions in their language once the switcher ships) are indistinguishable from the 19×13 bookkeeping gaps. The ledger's core promise ("size and scope the translation fan-out exactly", per its own header) is broken.
- **Fix sketch**: One-time reconciliation script: for the 19 unrecorded topics, add `_meta.json` entries hashed from *the English source at the translation commit* (or re-verify + stamp current hash); for the 40 stale entries, triage which English edits were substantive and queue re-translation, then re-stamp. Make the translation workflow (`scripts/i18n/translate-guide-subagent-prompt.md`) end by writing `_meta.json` — and fail `--strict` in CI (see finding 2) so the ledger can never silently rot again.

## 2. Guide parity/drift checks exist but nothing runs them — CI and the pre-push hook only cover UI-string i18n
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: unenforced-invariant-scripts
- **File**: `.github/workflows/ci.yml:29`; `package.json:28`; `scripts/install-git-hooks.mjs:17`
- **Scenario**: A contributor adds topic #117 to `src/data/guide/topics.ts` + `content/`. CI passes green: `ci.yml` runs only `check:i18n-coverage` and `check:i18n-encoding` (as does the auto-installed pre-push hook). Neither `check:guide-content` (topic↔content 404 invariant, has an npm script but no caller), nor `guide-i18n-audit.mjs` (13-locale parity, no npm script at all), nor `check-guide-translations.mjs --strict` (self-described "release gate", never invoked) executes anywhere.
- **Root cause**: Three purpose-built guardrail scripts were written across different work streams but the last mile — wiring them into `ci.yml`/pre-push — was never done; only the older UI-string checks got wired.
- **Impact**: The 143-file, 116-topic × 13-locale corpus holds parity today purely by discipline. This is exactly how finding 1's 767-item drift accumulated unnoticed. A new English topic silently ships English-only in all locales; a renamed topic id silently orphans 13 translations (the English-only `check:guide-content` would catch the 404 case — but it, too, never runs).
- **Fix sketch**: Add to `ci.yml`: `npm run check:guide-content` (cheap, zero-dep, exit-code ready today) and a `check:guide-i18n` script wrapping `guide-i18n-audit.mjs` with a non-zero exit on missing entries. Gate `check-guide-translations.mjs --strict` on releases only, after finding 1's reconciliation (it would fail every build today).

## 3. Arabic guide corpus is fully translated but there is no RTL rendering path anywhere
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: missing-rtl-support
- **File**: `src/app/layout.tsx:92`; `src/app/guide/[category]/[topic]/TopicView.tsx:165`
- **Scenario**: The `ar` locale is a complete, high-quality hand translation (verified: 116/116 bodies, real Arabic prose with `:::steps`/`:::info` blocks). But `<html lang="en">` is hardcoded, and no `dir=` attribute exists anywhere under `src/app` or `src/components/guide`. When the dormant locale switcher activates (the explicit design intent per `getLocalized.ts:5-8` — "no further change is needed here"), `getLocalizedTopic("ar", …)` swaps in Arabic text that renders left-aligned LTR: wrong bidi punctuation placement, numbered `:::steps` lists reading against text direction, TOC/breadcrumb misaligned.
- **Root cause**: The localization data layer was built locale-agnostic, and the "no further change needed" claim in `getLocalized.ts` was written from a data-resolution perspective — direction was never part of the contract. `Language` type and locale registries carry no `dir` metadata.
- **Impact**: The single most expensive locale investment (RTL hand-translation of ~116 articles) cannot actually ship without rework the activation plan doesn't know about; the recorded reasoning actively says the opposite. Latent today, but this is precisely the kind of undocumented assumption that turns "flip the switch" into a broken launch.
- **Fix sketch**: Add `dir: "rtl" | "ltr"` to a locale-metadata map (single source next to the `Language` type), set `dir={dir}` + `lang={lang}` on the `<article>` wrapper in TopicView (and eventually `<html>`), and audit directional Tailwind utilities in the guide layout (`text-right`, chevron transforms in prev/next nav) for logical-property equivalents (`text-start`, `rtl:rotate-180`). Correct the `getLocalized.ts` comment.

## 4. Reading-time estimate is a whitespace word count — CJK locales will always show "1 min read"
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: cjk-reading-time-heuristic
- **File**: `src/app/guide/[category]/[topic]/TopicView.tsx:73`
- **Scenario**: `localized.body.trim().split(/\s+/)` ÷ 200 wpm. Japanese and Chinese prose has no inter-word spaces: `locales/ja/content/pipelines.ts` has 831 whitespace tokens for content whose English source has 4,142 (measured). Per-topic that is ~70 "words" → `Math.max(1, round(70/200))` = every Japanese article, including the longest, shows "1 min read". Chinese is similarly crushed; Arabic/Thai-style scripts skew too.
- **Root cause**: The heuristic (and its two magic numbers, 200 wpm and the 1-minute floor) assumes space-delimited languages; the comment at line 70-71 documents the derivation but not the assumption, even though the same component performs the CJK locale swap five lines later.
- **Impact**: Once locales activate, a signature polish element becomes uniformly wrong for ja/zh readers — a "1 min" promise on a 10-minute article erodes trust in the whole guide, and the uniform value makes the badge useless for scanning. Dormant today (store locked to `en`), but shipped in the same component as the swap it breaks under.
- **Fix sketch**: Branch on script: for CJK locales estimate by character count (~500 cpm for ja/zh, a well-established convention), else words/200. Hoist both constants with a one-line comment each. Cheap: `const isCJK = ["ja","zh","ko"].includes(language)`.

## 5. Topic page chrome stays English when the body localizes — mixed-language page by construction
- **Severity**: Low
- **Agent**: ui_perfectionist
- **Category**: hardcoded-chrome-strings
- **File**: `src/app/guide/[category]/[topic]/TopicView.tsx:117` (also 106, 162, 175-186, 199, 210, 222)
- **Scenario**: On locale swap, title/description/body re-resolve via `getLocalizedTopic`, but everything around them is hardcoded English: breadcrumb category name (`category.name` from English `GUIDE_CATEGORIES`, line 117), "Skip to content" (106), "min read" (162), the entire "Ready to try this yourself?" CTA block (175-186), "Previous"/"Back to"/"Next" labels (199/210/222). Only the TOC label goes through `t.pageNav.onThisPage` (234).
- **Root cause**: Partial adoption of the i18n layer — `useTranslation()` is already imported and used once, and `getLocalizedCategoryFromI18n` was purpose-built for the breadcrumb case (`getLocalized.ts:129`) but has zero call sites outside its own module.
- **Impact**: A Czech reader would get a Czech article framed by an English breadcrumb, English reading-time, English navigation, and an English conversion CTA — the highest-intent element on the page. Undercuts the credibility of an otherwise fully hand-translated corpus. Low only because the switcher is dormant; it is the visible face of the same activation gap as findings 3-4.
- **Fix sketch**: Route the seven strings through the existing `t.` catalog (keys for guide chrome likely already have siblings in `src/i18n/<lang>.ts`), and wire `getLocalizedCategoryFromI18n` into the breadcrumb and "Back to" card. No new infrastructure needed.
