/**
 * Locale-aware lookup for guide topic title, description, and body.
 *
 * Mirrors the dormant-infrastructure shape used by src/i18n/<lang>.ts:
 * the project ships locale data for all 14 languages but the i18nStore
 * currently locks the UI to English (setLanguage is a no-op). When the
 * locale switcher is eventually activated, this helper becomes the
 * single resolution point for guide content.
 *
 * Resolution order per field:
 *   1. locales/<lang>/topics.ts   for title + description
 *   2. locales/<lang>/content/<category>.ts   for body
 *   3. English source as fallback
 *
 * Fields fall back independently — a topic whose title is translated
 * but whose body isn't yet still renders the translated title with the
 * English body, rather than mixed-English-title-with-missing-body.
 */
import type { Language } from "@/stores/i18nStore";
import { GUIDE_TOPICS } from "./topics";
import { GUIDE_CATEGORIES } from "./categories";

export type LocalizedTopicFields = {
  title: string;
  description: string;
  body: string;
};

type LocaleTopicsModule = {
  topics: Record<string, { title?: string; description?: string }>;
};

type LocaleContentModule = {
  content: Record<string, string>;
};

// Per-locale module memo caches. Each key resolves to a thunk that returns
// the already-loaded module, so a given locale/category file is imported
// (and its promise settled) at most once across the process.
const localeTopicsModules: Record<string, () => Promise<LocaleTopicsModule>> = {};
const localeContentModules: Record<string, () => Promise<LocaleContentModule>> = {};

// Load a locale's topics.ts via a plain template-literal dynamic import.
// The path is statically analyzable enough for Turbopack to emit one chunk
// per locale directory; a missing/failed import (locale not yet translated)
// is swallowed and the caller falls back to English. The resolved module is
// memoized into localeTopicsModules so repeat lookups skip the import.
async function loadLocaleTopics(lang: Language): Promise<LocaleTopicsModule | null> {
  if (lang === "en") return null;
  if (!localeTopicsModules[lang]) {
    try {
      const mod = (await import(`./locales/${lang}/topics`)) as LocaleTopicsModule;
      localeTopicsModules[lang] = async () => mod;
      return mod;
    } catch {
      return null;
    }
  }
  return localeTopicsModules[lang]();
}

async function loadLocaleContent(
  lang: Language,
  categoryId: string,
): Promise<LocaleContentModule | null> {
  if (lang === "en") return null;
  const key = `${lang}::${categoryId}`;
  if (!localeContentModules[key]) {
    try {
      const mod = (await import(`./locales/${lang}/content/${categoryId}`)) as LocaleContentModule;
      localeContentModules[key] = async () => mod;
      return mod;
    } catch {
      return null;
    }
  }
  return localeContentModules[key]();
}

/**
 * Resolve title, description, and body for a topic in the given locale,
 * with independent per-field fallback to English.
 *
 * `englishBody` is required because the body lives in lazy-loaded category
 * files on the English side too; the caller (the topic page) already has
 * it loaded and passes it in to avoid a double-fetch.
 */
export async function getLocalizedTopic(
  lang: Language,
  topicId: string,
  englishBody: string,
): Promise<LocalizedTopicFields> {
  const englishTopic = GUIDE_TOPICS.find((t) => t.id === topicId);
  if (!englishTopic) {
    // Caller's notFound() path should have caught this; defensive return.
    return { title: "", description: "", body: englishBody };
  }

  if (lang === "en") {
    return {
      title: englishTopic.title,
      description: englishTopic.description,
      body: englishBody,
    };
  }

  const [topicsModule, contentModule] = await Promise.all([
    loadLocaleTopics(lang),
    loadLocaleContent(lang, englishTopic.categoryId),
  ]);

  const localizedTitleDesc = topicsModule?.topics?.[topicId];
  const localizedBody = contentModule?.content?.[topicId];

  return {
    title: localizedTitleDesc?.title ?? englishTopic.title,
    description: localizedTitleDesc?.description ?? englishTopic.description,
    body: localizedBody ?? englishBody,
  };
}

/**
 * Resolve category name + description for the given locale, with fallback
 * to the English values in GUIDE_CATEGORIES. Category strings live in the
 * existing src/i18n/<lang>.ts files (under `guide.categories` and
 * `guide.categoryDescriptions`) — this helper exists so a single
 * locale-resolution API is available to the guide pages.
 */
export function getLocalizedCategoryFromI18n(
  categoryId: string,
  i18nCategories?: Partial<Record<string, string>>,
  i18nDescriptions?: Partial<Record<string, string>>,
): { name: string; description: string } {
  const cat = GUIDE_CATEGORIES.find((c) => c.id === categoryId);
  return {
    name: i18nCategories?.[categoryId] ?? cat?.name ?? categoryId,
    description: i18nDescriptions?.[categoryId] ?? cat?.description ?? "",
  };
}
