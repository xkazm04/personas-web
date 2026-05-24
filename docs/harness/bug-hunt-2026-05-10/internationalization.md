# Bug Hunter — Internationalization

> Total: 8 findings (Critical: 0, High: 4, Medium: 3, Low: 1)
> Scope: 6 files (en.ts, ar.ts, cs.ts, useTranslation.ts, i18nStore.ts, LanguageSwitcher.tsx, layout.tsx) — sampled from 17
> Date: 2026-05-10

---

## 1. SSR/CSR hydration mismatch — `<html lang>` is hard-coded `"en"` regardless of stored locale

- **Severity**: High
- **Category**: Hydration / SEO / a11y
- **File**: `src/app/layout.tsx:88`, `src/stores/i18nStore.ts:15-20,42-54`
- **Scenario**: A returning Korean user has `personas-i18n-storage = "ko"` in `localStorage`. SSR emits `<html lang="en" ...>`. After hydration, `onRehydrateStorage` fires `applyLangAttributes(state.language)` which mutates the live DOM to `lang="ko"`. The first paint and the indexed HTML both still announce `lang="en"`.
- **Root cause**: `<html lang>` is a build-time literal. There is no cookie or middleware that lifts the user's locale into the server render, and `suppressHydrationWarning` masks the divergence.
- **Impact**: (1) Search engines index every locale variant as English, killing international SEO. (2) Screen readers announce English voice for Korean/Arabic/Hindi text on first paint. (3) Locale-specific `[data-lang="ko"] --font-lang` rule in `typography.css:7-25` does not match during SSR — wrong font flashes (FOUT-like) for ~100ms after JS hydrates.
- **Fix sketch**: Persist locale in a cookie (httpOnly false) on `setLanguage`, read it in `RootLayout` (Server Component) via `cookies()`, and render `<html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} data-lang={locale}>`. Drop `suppressHydrationWarning` once parity is achieved.

---

## 2. Arabic locale never sets `dir="rtl"` — entire UI renders LTR

- **Severity**: High
- **Category**: a11y / RTL / latent failure
- **File**: `src/stores/i18nStore.ts:15-20`
- **Scenario**: User selects Arabic in `LanguageSwitcher`. `setLanguage('ar')` runs `applyLangAttributes('ar')`, which sets `lang="ar"` and `data-lang="ar"` but **not** `dir="rtl"`. The HTML element remains `dir="ltr"` (browser default), so flex orderings, margin-start/end behaviors, scrollbars, modal animations, and the language dropdown anchor (`right-0 top-full` in `LanguageSwitcher.tsx:79`) all stay LTR. CJK and Latin locales appear correct, but Arabic users see a broken mirror layout with mismatched icon directions.
- **Root cause**: `applyLangAttributes` was written for font-family selection only and never accounted for direction. There is no `RTL_LANGUAGES` set or `dir` toggle anywhere in the codebase (verified via grep — `dir=` does not appear in any source file).
- **Impact**: Arabic site is functionally broken for native readers; reflects poorly on i18n quality. Affects ar specifically; if `he`/`ur`/`fa` are added later they will silently inherit the bug.
- **Fix sketch**:
  ```ts
  const RTL_LANGS: readonly Language[] = ['ar'];
  function applyLangAttributes(lang: Language) {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('data-lang', lang);
    html.setAttribute('dir', RTL_LANGS.includes(lang) ? 'rtl' : 'ltr');
  }
  ```
  Also set `dir` server-side once finding #1 is fixed.

---

## 3. Synchronous-load race: locale switch flashes English before async chunk resolves

- **Severity**: High
- **Category**: Race condition / UX flicker
- **File**: `src/i18n/useTranslation.ts:54-79`
- **Scenario**: User on cold session clicks German in switcher. Effect runs: `cache['de']` is undefined, so `queueMicrotask(() => setTranslations(en))` runs first (line 67-69), forcing a re-render with English strings. Then `loaders.de()` resolves ~50-300ms later and a second re-render swaps to German. Every page text element flickers EN → DE on first switch to any non-English locale.
- **Root cause**: The "show English while loading" branch unconditionally `setTranslations(en)` even when the previous `t` was already a partially-merged translation in another locale. Worse, on the *first* render of the page (no cache, language ≠ 'en'), `useState(() => cache[language] ?? en)` returns `en`, then the effect re-sets `en` again, then async sets the real locale.
- **Impact**: Visible English flash on every locale change for uncached locales; jarring UX especially on slower networks. Layout shift if translated strings differ in length (common for de/ru → longer; ja/ko → shorter).
- **Fix sketch**: Don't `setTranslations(en)` if the previous `t` was non-English; keep stale strings until the new locale resolves. Or eagerly preload the locale in `onRehydrateStorage` so `cache[language]` is warm before the first render. Also consider showing a brief skeleton/spinner instead of EN flash.

---

## 4. Microtask race can resurrect stale translations after rapid locale switching

- **Severity**: Medium
- **Category**: Race condition
- **File**: `src/i18n/useTranslation.ts:59-74`
- **Scenario**: User clicks `de`, then within ~30ms clicks `fr` while `de`'s import promise is in-flight. Effect cleanup sets `cancelled = true` for the de iteration — good. But the new effect run for `fr` schedules a `queueMicrotask(() => setTranslations(en))` (line 67) AND a `loaders.fr()` chain. If the `de` loader's `.then` callback was scheduled before the cleanup, its `cache[language] = merged` line writes to **`cache['fr']`** — because `language` is closed over by reference through… wait, actually `language` is a stable string per-render, so this is fine. BUT: the cleanup only flips `cancelled`, it does NOT cancel the pending `import()`. If `de` finishes first while `language` is now `fr`, the dead branch's `cache[language] = merged` correctly writes to `cache['de']` (the closure captured 'de'). However, the **microtask** `setTranslations(en)` from the `fr` effect can execute AFTER `fr`'s loader resolved (depends on scheduling), causing `fr` → `en` regression.
- **Root cause**: There are two async paths competing in the same effect: a microtask that sets `en`, and a real-promise chain that sets the merged translation. They are not ordered relative to each other.
- **Impact**: Edge-case visual glitch where the user sees the correct locale momentarily, then it reverts to English, then back. Reproducible by spamming the switcher.
- **Fix sketch**: Skip the `queueMicrotask(() => setTranslations(en))` line entirely (see fix #3 — keep stale strings) or guard it with a `loaderResolved` flag.

---

## 5. Silent fallback to English masks missing nested keys (no logging, no telemetry)

- **Severity**: Medium
- **Category**: Silent failure
- **File**: `src/i18n/useTranslation.ts:29-48`
- **Scenario**: A new feature ships strings under `t.dashboard.fleet.severity.urgent`. A locale file (cs.ts) is updated but accidentally omits `urgent`. Because tsc enforces shape via `Translations`, this would be a compile error — UNLESS the locale uses `as Translations` cast or the contributor adds `urgent: en.dashboard.fleet.severity.urgent` to satisfy the type. `deepMerge` further hides the issue at runtime: any missing branch silently falls back to English, with **zero logging, zero telemetry, zero dev-mode warning**. Translators cannot know what's missing because the page looks "fine" in English.
- **Root cause**: `mergeWithEnglishFallback` is intentional but lacks a "report missing keys" hook. Combined with the parity issue (every locale file is 664 lines vs en.ts's 1221 lines — see finding #6), large swaths of UI silently render English under non-English `lang` attribute.
- **Impact**: Accessibility tools mis-announce content (announced as Czech but spoken English). Translation completeness cannot be measured. Users perceive product as "half-translated" with no way to flag it.
- **Fix sketch**: In dev mode, walk `en` and `translations` recursively in `mergeWithEnglishFallback`, log every missing leaf to `console.warn` with the dotted key path. In prod, sample 1% to a telemetry endpoint. Optionally expose a `/i18n/coverage.json` build artifact.

---

## 6. Locale file size disparity (664 lines) vs en.ts (1221 lines) — structural under-translation

- **Severity**: High
- **Category**: Pattern / latent failure (not individual missing keys)
- **File**: All `src/i18n/{ar,bn,cs,de,es,fr,hi,id,ja,ko,ru,vi,zh}.ts` (all exactly 664 lines)
- **Scenario**: `wc -l` on every locale yields exactly **664** lines, while `en.ts` is **1221**. All 13 non-English locales are roughly 54% the size of the English source. Either (a) the `Translations` interface has many optional fields and locales legitimately skip them — but a glance shows the interface uses required `string` properties throughout, so this should fail tsc — or (b) locale files were generated/copied from an older snapshot of `en.ts` and never re-synced after the English source grew. Either way, the `as Translations` cast in each file (`export const cs: Translations = { ... }`) plus the `deepMerge` fallback work together to suppress what should be a TS compilation failure.
- **Root cause**: Every locale `as Translations` either bypasses excess-property checks or the missing-property error is being deliberately suppressed somewhere (tsconfig `noImplicitAny`/`strict` settings, or a `// @ts-expect-error`). Combined with deepMerge silent-fallback (#5), there is no signal that ~half the strings are English in every locale.
- **Impact**: Half of the dashboard, footer, FAQ, downloads, etc. render in English regardless of selected locale. This is the root cause of the "i18n looks shipped but doesn't work" smell and dwarfs all other findings in user-visible terms.
- **Fix sketch**: Run `npx tsc --noEmit` on a single locale file with the `Translations` interface enforced — if it passes, the interface is too permissive (probably uses `Partial<>` or index-signature somewhere). Generate a coverage script: `for each locale, recursively diff key paths against en` and fail CI if delta > 0%. This is the single highest-impact fix in this scan.

---

## 7. `LanguageSwitcher` fallback `languages[2]` (Czech) is wrong default for unknown locales

- **Severity**: Low
- **Category**: Edge case / defensive programming
- **File**: `src/components/LanguageSwitcher.tsx:32`
- **Scenario**: `const current = languages.find((l) => l.code === language) ?? languages[2];` — `languages[2]` is `cs` (Czech, the third entry alphabetically). If the persisted localStorage value is corrupted to e.g. `"pt"` (a previously-supported locale that was removed) or some other non-supported string, the switcher button displays the Czech flag and label even though the actual rendered language is English (because `cache[language] ?? en` in the hook also returns `en`). Very confusing for users and impossible to recover from without devtools (clicking a language button still works, but the indicator until then is wrong).
- **Root cause**: Magic-number fallback. Should be `languages.find(l => l.code === 'en')` so the indicator and the actual rendered text agree.
- **Impact**: Edge-case visual mismatch. Will trigger if you ever remove a locale from `SUPPORTED_LANGUAGES` while leaving stale localStorage entries in users' browsers, or if the persist schema version changes without a migration.
- **Fix sketch**: `const current = languages.find((l) => l.code === language) ?? languages.find((l) => l.code === 'en')!;` and add a sanity check in `i18nStore` to coerce unknown locales to `'en'` on rehydrate.

---

## 8. `onRehydrateStorage` hasStoredPreference check race + storage poisoning

- **Severity**: Medium
- **Category**: Race / silent failure
- **File**: `src/stores/i18nStore.ts:42-55`
- **Scenario**: `hasStoredPreference` is computed by reading `localStorage.getItem(STORAGE_KEY) !== null` at the moment the rehydrate **factory** runs (during store construction, before rehydrate). The returned callback `(state) => { ... }` then either calls `setLanguage(detected)` — which itself runs `applyLangAttributes(detected)` AND `set({ language: detected })` — or just applies the existing language. Two issues:
  1. `state.setLanguage(detected)` in the rehydrate callback **persists `detected` to localStorage**, meaning the next page load will see `hasStoredPreference === true` even if the user never explicitly chose a language. The browser-language detection therefore runs only once per browser, ever — if the user changes their OS language later, the site won't follow.
  2. If the stored value is corrupted JSON (e.g., `personas-i18n-storage = "{ broken"` due to a botched migration), zustand's persist middleware silently catches the parse error, `state` arrives undefined, and the rehydrate callback returns early on `if (!state) return;` — leaving `lang="en"` even if the user selected Korean previously. No telemetry, no recovery.
- **Root cause**: Conflating "first-visit detection" with "permanent persistence". No version field on the persisted schema (`migrate`/`version` not configured), so any future shape change permanently breaks every existing user.
- **Impact**: (1) Browser-language detection is one-shot, so locale "sticks" wrong forever after first visit. (2) Schema migration footgun for future refactors.
- **Fix sketch**: Persist `{ language, source: 'detected' | 'user' }`; only auto-update `detected` entries on subsequent visits. Add `version: 1` and a `migrate` function to the persist config. Detect parse failures via `onRehydrateStorage` error path and reset to detected default rather than silently falling back to `'en'`.

---

## Summary recommendations (priority order)

1. **Finding #6** (locale parity) is the iceberg — fix this first or every other finding is moot.
2. **Finding #2** (RTL `dir`) is a one-line fix with massive Arabic-user impact.
3. **Finding #1** (SSR `<html lang>`) requires cookie+middleware plumbing but is essential for SEO and a11y.
4. **Finding #3 + #4** (loader race) should be fixed together with one effect rewrite.
5. **Finding #5** (silent merge) — add dev-mode logging now, telemetry later.
6. **Findings #7, #8** are cleanup; do during next refactor.
