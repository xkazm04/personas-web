# Internationalization (14 locales)
> A typed 14-locale UI translation bundle (`en.ts` is the source of truth) with a `useTranslation` hook and a Zustand locale store. · **Route:** n/a (lib) · **Status:** Live (bundle present; runtime switching dormant — store is hard-locked to `en`)

## What it does
Provides every user-facing string from a single typed bundle so the UI can be localized into 14 languages: `en` plus `ar, bn, cs, de, es, fr, hi, id, ja, ko, ru, vi, zh`. Components read strings through `useTranslation()` (`t.namespace.key`) instead of hardcoding English. English (`en.ts`) is the typed source of truth; the other 13 locales mirror its shape and are merged over English with per-field fallback. The full machinery — lazy per-locale loaders, English-fallback merge, persisted-store API — is shipped and working at the library level, **but runtime language switching is currently disabled**: the store always reports `en` and `setLanguage` is a no-op, so the 13 non-en bundles are dormant (loaded only if `language` were ever set to a non-`en` value, which nothing in `src/` does).

## How it works
- `useTranslation()` (`src/i18n/useTranslation.ts:50`) reads `language` from the Zustand store, holds the active `Translations` object in local state, and returns `{ t, language }`.
- For `en` it returns the static `en` import immediately (seeded in `cache` at `useTranslation.ts:7`). For any other locale it lazy-imports `./<lang>` via the `loaders` map (`useTranslation.ts:9`), merges it over English with `deepMerge` (`useTranslation.ts:29`) so untranslated keys fall back to English, caches the merged result, and swaps it in — keeping the prior locale visible during the network round-trip rather than flashing English (`useTranslation.ts:67`).
- Because `useI18nStore` (`src/stores/i18nStore.ts:13`) is created with `language: 'en'` and `setLanguage: () => {}` (an explicit no-op, `i18nStore.ts:15`), `language` is permanently `en`. The `useEffect` in `useTranslation` therefore always hits the cached-`en` branch and never invokes a loader. **No component in `src/` calls `setLanguage`, and there is no language-switcher UI** — so the 13 non-en loaders never run at runtime.
- Guide content has a parallel, equally-dormant resolution path: `getLocalizedTopic` (`src/data/guide/getLocalized.ts:87`) lazy-loads `src/data/guide/locales/<lang>/…` with independent per-field English fallback, gated on the same `language` value. See the related guide docs below.

## Key files
| File | Role |
| --- | --- |
| `src/i18n/en.ts` | Source of truth: `Translations` interface (`en.ts:1`, ~80 namespaces) + the `en` const (`en.ts:1014`). ~2189 lines. |
| `src/i18n/useTranslation.ts` | The `useTranslation()` hook: per-locale lazy loaders, `deepMerge` English-fallback, cache, anti-flicker swap. |
| `src/stores/i18nStore.ts` | Zustand store exposing `language` + `setLanguage`. Hard-locked to `en`; `setLanguage` is a documented no-op. |
| `src/i18n/<lang>.ts` (×13) | `ar, bn, cs, de, es, fr, hi, id, ja, ko, ru, vi, zh` — each exports a `Translations`-shaped const mirroring `en`. Dormant. |
| `src/data/guide/getLocalized.ts` | Parallel locale resolver for long-form guide topic/category content (also gated on `language`). |

## Data & state
- **Source:** `en.ts` (source of truth) + 13 mirrored locales merged over English via `deepMerge` (per-field fallback). **Stores:** `i18nStore` (Zustand; `language: Language`, `setLanguage` no-op — effectively a constant `en`). **API routes:** none (pure client lib; no fetch, no persistence layer — the store is in-memory and not `persist`-wrapped). **Types:** `Translations` interface in `en.ts` is the compile-time contract; `Language` union (`i18nStore.ts:3`) enumerates the 14 codes and is the key type for `loaders`/`cache`.

## Integration points
- ~118 `.tsx` files call `useTranslation()` and read `t.<namespace>.<key>`; `tsc` enforces that every accessed key exists on `Translations`.
- The `Language` union is imported by both `useTranslation.ts` and `getLocalized.ts`; adding a locale means extending that union, the `loaders` map, and shipping `src/i18n/<lang>.ts`.
- Translation completeness is a CLAUDE.md non-negotiable (#1): add/rename/delete keys in `en.ts` **and all 13 non-en locales in the same commit**; no English placeholders in non-en files.

## Conventions & gotchas
- **Runtime switching is dormant (confirmed in code).** `setLanguage` is an explicit no-op and the initial `language` is `en`; nothing calls `setLanguage` and no switcher UI exists. The UI is English-only at runtime today. The non-en bundles and both lazy-load paths are shipped infrastructure waiting on a switcher + a real `setLanguage`. Activating it = make `setLanguage` actually `set({ language })` (and likely wrap the store in `persist`) and add a picker component.
- **Non-en files are mojibake on disk.** Per project memory, `src/i18n/*.ts` for the 13 non-en locales are UTF-8+BOM with double-encoded existing values. Do **not** deep-read or byte-verify them; anchor any `Edit` on pure-ASCII keys, write correct UTF-8, and don't attempt to "fix" the corruption in passing. Describe the bundle from `en.ts` + the hook + the store (as this doc does).
- **`en.ts` is one large file, two halves.** Lines `1`–`1013` are the `Translations` interface (the contract); the `en` const literal starts at `en.ts:1014`. Edit both halves together — `tsc` will flag a key added to one but not the other.
- **English fallback is silent.** `deepMerge` overlays a locale onto `en`, so a missing/untranslated key renders English with no warning. This makes partial translations safe but also makes translation gaps invisible at runtime — completeness is enforced only by review + the CLAUDE.md rule, not by tooling.
- **Many sections bypass the bundle.** With ~582 component files but only ~118 using `useTranslation`, a large amount of UI text is hardcoded English in JSX/`aria-label`/`alt`/`metadata`. CLAUDE.md forbids new hardcoded strings, but substantial existing copy is not in the bundle and would not localize even if switching were enabled. Treat "everything is translatable" as aspirational, not current reality.
- **Anti-flicker behavior matters if you re-enable switching.** The loader path deliberately keeps the previous locale on screen until the new one resolves (`useTranslation.ts:67`) rather than flashing English; preserve this when wiring up a switcher.
- **No persistence.** The store is plain `create()` with no `persist` middleware, so even if `setLanguage` worked a chosen locale would reset on reload until persistence is added.

## Related docs
- [Localized Guide Content](../guide/localized-content.md)
- [Feature index](../INDEX.md)
