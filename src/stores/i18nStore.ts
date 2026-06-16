import { create } from "zustand";
import { persist } from "zustand/middleware";

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

/**
 * Dev/QA gate. Runtime language switching is OFF by default: the non-en UI
 * bundles are incomplete and partly corrupt (double-encoded), so the switcher
 * must never reach production users. Enable per environment with
 * `NEXT_PUBLIC_SHOW_LANGUAGE_SWITCHER=true` (e.g. preview deploys) to QA locales
 * as translations are repaired. When unset, the app stays English-only exactly
 * as before — `setLanguage` no-ops and any persisted locale is forced back to en.
 */
export const LANGUAGE_SWITCHER_ENABLED =
  process.env.NEXT_PUBLIC_SHOW_LANGUAGE_SWITCHER === "true";

export const LANGUAGE_STORAGE_KEY = "personas-language";

const VALID = new Set<Language>(LANGUAGES.map((l) => l.id));
const RTL = new Set<Language>(LANGUAGES.filter((l) => l.rtl).map((l) => l.id));

/**
 * Apply the active locale to `<html lang/dir>` (client only). Mirrors the
 * theme system's DOM application; the pre-paint script in layout.tsx still
 * sets `lang=en` on first paint, so this runs post-hydration when a locale is
 * actually selected (dev/QA), leaving the production English path untouched.
 */
function applyLangToDOM(lang: Language) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.setAttribute("lang", lang);
  el.setAttribute("data-lang", lang);
  if (RTL.has(lang)) el.setAttribute("dir", "rtl");
  else el.removeAttribute("dir");
}

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => {
        // Hard gate: a no-op unless switching is explicitly enabled, so the
        // app stays English-only in production regardless of any caller.
        if (!LANGUAGE_SWITCHER_ENABLED || !VALID.has(language)) return;
        applyLangToDOM(language);
        set({ language });
      },
    }),
    {
      name: LANGUAGE_STORAGE_KEY,
      partialize: (s) => ({ language: s.language }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Force English when the switcher is disabled (prod) or the persisted
        // value is unknown — a stale non-en value must never leak to users.
        if (!LANGUAGE_SWITCHER_ENABLED || !VALID.has(state.language)) {
          state.language = "en";
        }
        applyLangToDOM(state.language);
      },
    },
  ),
);
