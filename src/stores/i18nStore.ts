import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  LANGUAGES,
  LOCALE_PREVIEW,
  RELEASE,
  isLanguage,
  isReachable,
  normalizePersisted,
  type Language,
} from "@/i18n/localeRelease";

// The registry and the release predicate live in src/i18n/localeRelease.ts
// (pure, no store import); re-exported so existing readers keep their import.
export { LANGUAGES, type Language, type LanguageMeta } from "@/i18n/localeRelease";

/**
 * Preview override (NEXT_PUBLIC_SHOW_LANGUAGE_SWITCHER=true): every locale is
 * reachable. Production reachability is the per-locale release list
 * (LOCALE_RELEASE in src/i18n/localeRelease.ts), which ships empty.
 */
export const LANGUAGE_SWITCHER_ENABLED = LOCALE_PREVIEW;

export const LANGUAGE_STORAGE_KEY = "personas-language";

const RTL = new Set<Language>(LANGUAGES.filter((l) => l.rtl).map((l) => l.id));

/**
 * Apply the active locale to `<html lang/dir>` (client only). Mirrors the
 * theme system's DOM application; the pre-paint script in layout.tsx still
 * sets `lang=en` on first paint, so this runs post-hydration when a locale is
 * actually selected (dev/QA), leaving the production English path untouched.
 */
/**
 * Noto family per non-Latin locale (see styles/typography.css). The stylesheet
 * used to be a render-blocking <link> in the root layout, loading all six
 * families' CSS on every page - in production, where the site is English-only
 * and none of them is ever used. It is now fetched when a locale that needs it
 * is applied, one family at a time.
 */
const NOTO_FAMILY: Partial<Record<Language, string>> = {
  zh: "Noto+Sans+SC",
  ja: "Noto+Sans+JP",
  ko: "Noto+Sans+KR",
  ar: "Noto+Sans+Arabic",
  hi: "Noto+Sans+Devanagari",
  bn: "Noto+Sans+Bengali",
};

function ensureLocaleFont(lang: Language) {
  const family = NOTO_FAMILY[lang];
  if (!family) return;
  const id = `noto-font-${lang}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

function applyLangToDOM(lang: Language) {
  if (typeof document === "undefined") return;
  ensureLocaleFont(lang);
  const el = document.documentElement;
  el.setAttribute("lang", lang);
  el.setAttribute("data-lang", lang);
  if (RTL.has(lang)) el.setAttribute("dir", "rtl");
  else el.removeAttribute("dir");
}

interface I18nState {
  language: Language;
  /** Locales whose browser-language offer the visitor dismissed: never offered again. */
  declined: Language[];
  setLanguage: (lang: Language) => void;
  declineOffer: (lang: Language) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: "en",
      declined: [],
      setLanguage: (language) => {
        // One validation door: a no-op for any locale that is not released
        // (or previewed), whoever the caller is.
        if (!isReachable(language, RELEASE)) return;
        applyLangToDOM(language);
        set({ language });
      },
      declineOffer: (lang) =>
        set((s) => (s.declined.includes(lang) ? s : { declined: [...s.declined, lang] })),
    }),
    {
      name: LANGUAGE_STORAGE_KEY,
      partialize: (s) => ({ language: s.language, declined: s.declined }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // A persisted locale that is unknown or no longer released reads as
        // English: withdrawing a locale scrubs every visitor stored on it.
        state.language = normalizePersisted(state.language, RELEASE);
        state.declined = Array.isArray(state.declined) ? state.declined.filter(isLanguage) : [];
        applyLangToDOM(state.language);
      },
    },
  ),
);
