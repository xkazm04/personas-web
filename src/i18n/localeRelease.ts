/*
 * Per-locale release: the ONE predicate every language door derives from.
 *
 * A locale is reachable when it is English, when it is listed in
 * LOCALE_RELEASE, or when the preview override is on (preview deploys set
 * NEXT_PUBLIC_SHOW_LANGUAGE_SWITCHER=true to QA all 14). The doors:
 *   - the store's setter and its rehydration scrub (src/stores/i18nStore.ts),
 *   - the footer switcher, which lists reachableLocales(),
 *   - the browser-language offer (src/components/LocaleOffer.tsx),
 *   - a ?lang= deep link (readLangParam).
 * Releasing one locale no longer waits for the other twelve, and withdrawing
 * one is a one-line data edit that also scrubs every visitor stored on it.
 *
 * Pure TS, no React and no store import, so the store can import it without a
 * module cycle and vitest can run it in node (localeRelease.test.ts).
 * See docs/features/platform/internationalization.md, "Per-locale release".
 */

export type Language =
  | "en" | "zh" | "ar" | "hi" | "ru" | "id" | "es"
  | "fr" | "bn" | "ja" | "vi" | "de" | "ko" | "cs";

export interface LanguageMeta {
  id: Language;
  /** Endonym — the language's own name, shown in its own script (not translated). */
  label: string;
  /** Right-to-left script. */
  rtl?: boolean;
}

export const LANGUAGES: LanguageMeta[] = [
  { id: "en", label: "English" },
  { id: "de", label: "Deutsch" },
  { id: "es", label: "Español" },
  { id: "fr", label: "Français" },
  { id: "cs", label: "Čeština" },
  { id: "ru", label: "Русский" },
  { id: "vi", label: "Tiếng Việt" },
  { id: "id", label: "Bahasa Indonesia" },
  { id: "zh", label: "中文" },
  { id: "ja", label: "日本語" },
  { id: "ko", label: "한국어" },
  { id: "hi", label: "हिन्दी" },
  { id: "bn", label: "বাংলা" },
  { id: "ar", label: "العربية", rtl: true },
];

export interface LocaleReleaseEntry {
  id: Exclude<Language, "en">;
  /** ISO date the owner released it. */
  since: string;
}

/**
 * The release list. EMPTY BY DEFAULT: production stays English-only until the
 * owner adds a locale here, e.g. `{ id: "de", since: "2026-10-12" }`.
 * Releasing a locale today still leaves the owner-approved English-only pending
 * copy (src/i18n/pending/: /, /features, /how, /m, the phone dashboard) in
 * English on those routes.
 */
export const LOCALE_RELEASE: readonly LocaleReleaseEntry[] = [];

/** Preview override (dev / QA / preview deploys): every locale is reachable. */
export const LOCALE_PREVIEW = process.env.NEXT_PUBLIC_SHOW_LANGUAGE_SWITCHER === "true";

export interface ReleaseConfig {
  released: readonly Language[];
  preview?: boolean;
}

/** The app's live release config. */
export const RELEASE: ReleaseConfig = {
  released: LOCALE_RELEASE.map((r) => r.id),
  preview: LOCALE_PREVIEW,
};

const ALL = new Set<Language>(LANGUAGES.map((l) => l.id));

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && ALL.has(value as Language);
}

export function isReachable(lang: unknown, cfg: ReleaseConfig): lang is Language {
  if (!isLanguage(lang)) return false;
  return lang === "en" || cfg.preview === true || cfg.released.includes(lang);
}

/** English plus every reachable locale, in LANGUAGES order. */
export function reachableLocales(cfg: ReleaseConfig): Language[] {
  return LANGUAGES.map((l) => l.id).filter((id) => isReachable(id, cfg));
}

/** Rehydration scrub: a stored value that is unknown or no longer reachable reads as English. */
export function normalizePersisted(value: unknown, cfg: ReleaseConfig): Language {
  return isReachable(value, cfg) ? value : "en";
}

/**
 * The bundle a BCP-47 tag maps to, or null. Case-insensitive; region and
 * script subtags are dropped, except that Traditional Chinese (zh-Hant, or a
 * zh-TW / zh-HK / zh-MO region with no script) never maps to `zh`: zh.ts is
 * Simplified (its font is Noto Sans SC).
 */
export function bundleForTag(tag: string): Language | null {
  const parts = tag.trim().toLowerCase().replace(/_/g, "-").split("-").filter(Boolean);
  const primary = parts[0];
  if (!primary) return null;
  if (primary === "zh") {
    const script = parts.find((p) => p.length === 4);
    if (script === "hant") return null;
    if (!script && parts.some((p) => p === "tw" || p === "hk" || p === "mo")) return null;
  }
  return isLanguage(primary) ? primary : null;
}

/**
 * The locale to offer a visitor whose browser asks for `preferences`
 * (navigator.languages order), or null. Walks the list: English first means no
 * offer at all; a tag with no reachable bundle is skipped.
 */
export function negotiateLocale(preferences: readonly string[], cfg: ReleaseConfig): Language | null {
  for (const tag of preferences) {
    const lang = bundleForTag(tag);
    if (lang === "en") return null;
    if (lang && isReachable(lang, cfg)) return lang;
  }
  return null;
}

/** Offer only a negotiated locale the visitor is not already on and has not declined. */
export function shouldOffer({
  negotiated,
  current,
  declined,
}: {
  negotiated: Language | null;
  current: Language;
  declined: readonly Language[];
}): boolean {
  if (!negotiated || negotiated === "en") return false;
  if (current !== "en") return false;
  return !declined.includes(negotiated);
}

/** A reachable locale named by `?lang=` in `search`, or null. */
export function readLangParam(search: string, cfg: ReleaseConfig): Language | null {
  let raw: string | null = null;
  try {
    raw = new URLSearchParams(search).get("lang");
  } catch {
    return null;
  }
  if (!raw) return null;
  const lang = bundleForTag(raw);
  return lang && isReachable(lang, cfg) ? lang : null;
}
