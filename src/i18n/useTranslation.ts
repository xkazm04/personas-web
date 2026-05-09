import { useMemo } from "react";
import { useI18nStore } from "@/stores/i18nStore";
import { en } from "./en";
import { zh } from "./zh";
import { ar } from "./ar";
import { hi } from "./hi";
import { ru } from "./ru";
import { id } from "./id";
import { es } from "./es";
import { fr } from "./fr";
import { bn } from "./bn";
import { ja } from "./ja";
import { vi } from "./vi";
import { de } from "./de";
import { ko } from "./ko";
import { cs } from "./cs";
import type { Translations } from "./en";

const translations: Record<string, Translations> = { en, zh, ar, hi, ru, id, es, fr, bn, ja, vi, de, ko, cs };

/**
 * Recursively merge `override` on top of `base`. Plain objects merge key by
 * key; primitives, arrays, and null replace wholesale. Used to backfill
 * missing keys in non-en locales from the canonical English bundle so that
 * accessing `t.faqSection.questions` never crashes when the localized file
 * is partial.
 */
function deepMerge(base: unknown, override: unknown): unknown {
  if (override === undefined) return base;
  if (override === null) return override;
  if (Array.isArray(override) || Array.isArray(base)) return override;
  if (typeof base !== "object" || base === null) return override;
  if (typeof override !== "object") return override;
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(override as Record<string, unknown>)) {
    result[key] = deepMerge(
      (base as Record<string, unknown>)[key],
      (override as Record<string, unknown>)[key],
    );
  }
  return result;
}

const mergedCache = new Map<string, Translations>();

function getMergedTranslations(language: string): Translations {
  if (language === "en") return translations.en;
  const cached = mergedCache.get(language);
  if (cached) return cached;
  const localized = translations[language];
  const merged = (localized ? deepMerge(translations.en, localized) : translations.en) as Translations;
  mergedCache.set(language, merged);
  return merged;
}

/**
 * Subscribes only to `language` (a primitive selector) so unrelated store
 * updates don't re-render every translated subtree, and memoizes the
 * returned `{ t, language }` object so React.memo barriers downstream
 * stay effective.
 */
export function useTranslation() {
  const language = useI18nStore((s) => s.language);
  return useMemo(() => ({ t: getMergedTranslations(language), language }), [language]);
}
