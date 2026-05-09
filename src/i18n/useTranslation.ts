import { useEffect, useMemo, useState } from "react";
import { useI18nStore } from "@/stores/i18nStore";
import { en } from "./en";
import type { Translations } from "./en";
import type { Language } from "@/stores/i18nStore";

const cache: Partial<Record<Language, Translations>> = { en };

const loaders: Record<Exclude<Language, "en">, () => Promise<Translations>> = {
  zh: () => import("./zh").then((m) => m.zh),
  ar: () => import("./ar").then((m) => m.ar),
  hi: () => import("./hi").then((m) => m.hi),
  ru: () => import("./ru").then((m) => m.ru),
  id: () => import("./id").then((m) => m.id),
  es: () => import("./es").then((m) => m.es),
  fr: () => import("./fr").then((m) => m.fr),
  bn: () => import("./bn").then((m) => m.bn),
  ja: () => import("./ja").then((m) => m.ja),
  vi: () => import("./vi").then((m) => m.vi),
  de: () => import("./de").then((m) => m.de),
  ko: () => import("./ko").then((m) => m.ko),
  cs: () => import("./cs").then((m) => m.cs),
};

/**
 * Recursively merge `override` on top of `base`. Plain objects merge key by
 * key; primitives, arrays, and null replace wholesale.
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

function mergeWithEnglishFallback(translations: Translations): Translations {
  return deepMerge(en, translations) as Translations;
}

export function useTranslation() {
  const language = useI18nStore((s) => s.language);
  const [t, setTranslations] = useState<Translations>(() => cache[language] ?? en);

  useEffect(() => {
    let cancelled = false;
    const cached = cache[language];

    if (cached) {
      queueMicrotask(() => {
        if (!cancelled) setTranslations(cached);
      });
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      if (!cancelled) setTranslations(en);
    });
    loaders[language as Exclude<Language, "en">]?.().then((next) => {
      const merged = mergeWithEnglishFallback(next);
      cache[language] = merged;
      if (!cancelled) setTranslations(merged);
    });

    return () => {
      cancelled = true;
    };
  }, [language]);

  return useMemo(() => ({ t, language }), [t, language]);
}
