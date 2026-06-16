"use client";

import {
  useI18nStore,
  LANGUAGES,
  LANGUAGE_SWITCHER_ENABLED,
  type Language,
} from "@/stores/i18nStore";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Dev/QA-only locale switcher. Renders nothing unless
 * `NEXT_PUBLIC_SHOW_LANGUAGE_SWITCHER=true` (see i18nStore) — it exists to
 * preview the non-en UI bundles while their translations are repaired, and is
 * never shipped to production users. A native `<select>` keeps it fully
 * keyboard / screen-reader accessible with minimal surface area. Option labels
 * are endonyms (each language's own name), which are not translated.
 */
export default function LanguageSwitcher() {
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);
  const { t } = useTranslation();

  if (!LANGUAGE_SWITCHER_ENABLED) return null;

  return (
    <select
      aria-label={t.accessibility.selectLanguage}
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className="rounded-md border border-glass bg-surface/60 px-2 py-1 text-base text-foreground outline-none transition-colors hover:border-glass-hover focus-visible:ring-2 focus-visible:ring-brand-cyan/50"
    >
      {LANGUAGES.map((l) => (
        <option key={l.id} value={l.id}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
