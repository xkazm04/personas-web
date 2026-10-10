"use client";

import { useI18nStore, LANGUAGES, type Language } from "@/stores/i18nStore";
import { RELEASE, negotiateLocale, reachableLocales } from "@/i18n/localeRelease";
import { catalog } from "@/i18n/catalog";
import { useTranslation } from "@/i18n/useTranslation";

const REACHABLE = new Set<Language>(reachableLocales(RELEASE));
const OPTIONS = LANGUAGES.filter((l) => REACHABLE.has(l.id));

/**
 * Warm-on-intent: on focus / pointer-enter, start loading the locale this
 * visitor's browser asks for (the likeliest pick), so choosing it is not a cold
 * load. The catalog store dedupes, so repeat calls cost nothing.
 */
function warmLikelyTarget(current: Language) {
  if (typeof navigator === "undefined") return;
  const target = negotiateLocale(navigator.languages ?? [navigator.language], RELEASE);
  if (target && target !== current) void catalog.loadLocale(target).catch(() => {});
}

/**
 * Footer locale switcher. Lists only the REACHABLE locales (English plus the
 * per-locale release list in src/i18n/localeRelease.ts, or all 14 under the
 * preview override) and renders nothing when that is English alone - which is
 * production today, since the release list ships empty. A native `<select>`
 * keeps it fully keyboard / screen-reader accessible with minimal surface area.
 * Option labels are endonyms (each language's own name), which are not translated.
 */
export default function LanguageSwitcher() {
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);
  const { t } = useTranslation();

  if (OPTIONS.length < 2) return null;

  return (
    <select
      aria-label={t.accessibility.selectLanguage}
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      onFocus={() => warmLikelyTarget(language)}
      onPointerEnter={() => warmLikelyTarget(language)}
      className="rounded-md border border-glass bg-surface/60 px-2 py-1 text-base text-foreground outline-none transition-colors hover:border-glass-hover focus-visible:ring-2 focus-visible:ring-brand-cyan/50"
    >
      {OPTIONS.map((l) => (
        <option key={l.id} value={l.id}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
