# Internationalization (14 locales) — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. "100% coverage" gate certifies locales that are 11–17% untranslated English
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: coverage-gate-measures-shape-not-translation
- **File**: `scripts/check-i18n-coverage.mjs:58`
- **Scenario**: `check-i18n-coverage.mjs` prints `cs: 100%` and "I18n coverage is 100% across 13 locales" today, yet a per-key diff against `en.ts` finds 163–254 strings per locale that are byte-identical to English (fr: 254, de: 242, cs: 211, es: 210 — including plainly translatable UI text like `cs.nav.home`, `de.nav.roadmap`, `fr.pricing.local`, not just brand names). The script also never checks `{placeholder}` token parity — it happens to be 0 mismatches right now, but nothing prevents a translator dropping `{count}` from a string and shipping a literal `{count}` or a broken `.replace()` no-op.
- **Root cause**: the gate compares only structural shape (key presence, type, non-empty string). "Coverage" was never defined — the script's success message claims translation completeness while measuring key parity, and no one recorded that ~200 identical strings/locale are known-accepted vs. pending work.
- **Impact**: the pre-push gate gives a false "done" signal; anyone enabling `NEXT_PUBLIC_SHOW_LANGUAGE_SWITCHER` trusts "100%" and ships mixed-language pages. Placeholder regressions are invisible until a user sees `{n}` on screen.
- **Fix sketch**: add two checks to `compareShape`: (a) placeholder-set parity (`/\{[a-zA-Z]+\}/g` extracted from en vs. locale, fail on mismatch); (b) identical-to-English ratchet with an allowlist file for legitimately identical strings (endonyms, "OK", product names), mirroring the existing encoding-baseline pattern. Rename the success message to what it measures.

## 2. Nine locale bundles carry ~16,300 known mojibake sequences with no recorded repair plan
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: known-corruption-debt-without-owner-or-plan
- **File**: `scripts/i18n-encoding-baseline.json:1`
- **Scenario**: the encoding ratchet reports "OK — no new corruption" while the baseline tracks 16,319 mojibake sequences: bn=3855, ru=2805, hi=2783, ar=2399, ko=1236 — those five locales are effectively unreadable (Cyrillic rendered as `Đ¾Đ´...`, etc.). Because of this, the entire 14-locale feature is hard-gated off in production (`i18nStore.ts:41`), meaning ~19,000 lines of locale files and the whole switcher/RTL/loader machinery ship dead.
- **Root cause**: repeated cp1250/cp1252 re-encoding accidents (documented in `check-i18n-encoding.mjs` header — commit 5a57d9b even re-corrupted repaired files). The ratchet stops the bleeding but no artifact records who repairs, how (re-translate vs. mechanical ftfy-style decode), or in what order — "until the repair pass lands" is the only plan on record.
- **Impact**: indefinite limbo: the debt doesn't shrink (baseline counts unchanged), the switcher can never be enabled, and every locale edit risks tripping the ratchet with no documented repair procedure to follow.
- **Fix sketch**: mojibake of this shape is mechanically reversible (encode as cp1252/cp1250 → decode as UTF-8, iterate; verify round-trip). Write a one-shot `scripts/repair-i18n-encoding.mjs`, run per-file, tighten baseline to zero, then flip the ratchet to "must be 0 everywhere" like en.ts. Record the per-locale decision (mechanical repair vs. re-translate) in the script header.

## 3. `dir="rtl"` is applied for Arabic but the codebase has zero RTL-safe styling
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: rtl-declared-but-not-implemented
- **File**: `src/stores/i18nStore.ts:60`
- **Scenario**: selecting Arabic (QA/preview builds with the switcher enabled) sets `<html dir="rtl">`, flipping the whole document. But the component layer uses ~90 physical margin/padding utilities (`ml-`/`mr-`/`pl-`/`pr-`), ~60 `text-left`/`text-right`, only 2 logical (`ms-`/`me-`) utilities, and zero `rtl:` variants — so icons, chevrons, nav spacing, and text alignment all break or double-flip in Arabic.
- **Root cause**: RTL support was implemented at the store/DOM level (`rtl: true` on `ar`, `applyLangToDOM`) without the corresponding CSS pass; the two halves were never reconciled and nothing documents that `dir=rtl` is currently aspirational.
- **Impact**: Arabic QA sessions evaluate a broken layout, not broken translations — reviewers can't tell translation defects from layout defects, and the `rtl` flag implies a support level that doesn't exist.
- **Fix sketch**: either (a) do the mechanical sweep to logical properties (`ml-→ms-`, `text-left→text-start`, `rtl:rotate-180` on directional icons) — Tailwind supports all of these natively — or (b) until then, drop `rtl: true` from `LANGUAGES` / skip `dir=rtl` with a comment, so Arabic QA renders LTR-known-limitation instead of half-mirrored.

## 4. Dates and numbers are hardcoded to `en-US`/browser locale, never the active language
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: locale-unaware-formatting
- **File**: `src/lib/format-date.ts:15`
- **Scenario**: with any non-en locale active, all dates still render American-style: `format-date.ts` (twice), `format.ts:58`, and `slaFormat.ts:66` pin `toLocaleDateString("en-US")`, while other surfaces (`EventDrawerMetadata.tsx:23`, `ExecutionHeatmapCard.tsx:39`, many `toLocaleString()` number calls) pass `undefined` and follow the *browser* locale — so a Czech-browser user on the English site already sees mixed `Jan 5, 2026` and `5. 1. 2026` on one dashboard.
- **Root cause**: no formatting layer is connected to `useI18nStore.language`; each call site chose its own convention and the en-US pins vs. browser-default split was never a recorded decision.
- **Impact**: inconsistent formatting today (even English-only prod), and guaranteed wrong-locale dates/numbers for all 13 locales the moment the switcher ships — untranslated in a way no i18n script detects.
- **Fix sketch**: add `formatDate`/`formatNumber` helpers that take the active `Language` (map to a BCP-47 tag) and route the ~20 call sites through them; pick one policy (follow app language, not browser) and note it in `format-date.ts`.

## 5. Interpolation is an undocumented convention: first-match `String.replace` at 55 call sites, with a runtime fallback that masks what the gate checks
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: implicit-interpolation-contract
- **File**: `src/i18n/useTranslation.ts:46`
- **Scenario**: there is no `t(key, params)` — 55 call sites hand-roll `t.x.y.replace("{name}", ...)`. `String.replace` with a string pattern substitutes only the first occurrence, so any translation that (correctly for its grammar) repeats a placeholder renders the second one literally; nothing in `en.ts` or the hook documents that placeholders must be unique per string, appear exactly once, or use the `{camelCase}` spelling. Separately, `mergeWithEnglishFallback` deep-merges `en` under every loaded locale at runtime even though `check-i18n-coverage.mjs` already fails the push on any missing key — two overlapping mechanisms with no note on which is authoritative (and the merge silently hides gaps in dev, where the script may not have run).
- **Root cause**: the interpolation and fallback contracts live only in call-site habit; the hook exposes raw strings and each of the two safety nets was added without referencing the other.
- **Impact**: a translator repeating `{n}` ships a visible `{n}`; contributors can't know the rules without reverse-engineering 55 call sites; dev-time missing keys are invisible (English quietly appears), so gaps surface only at push time.
- **Fix sketch**: add a tiny `interpolate(str, params)` (global-regex replace) exported next to `useTranslation`, migrate call sites mechanically, and put a 5-line contract comment on `Translations` in `en.ts` (placeholder syntax, uniqueness not required once interpolate lands, fallback = dev-only nicety / coverage script = the gate).
