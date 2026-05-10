import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'zh' | 'ar' | 'hi' | 'ru' | 'id' | 'es' | 'fr' | 'bn' | 'ja' | 'vi' | 'de' | 'ko' | 'cs';

const SUPPORTED_LANGUAGES: Language[] = ['en', 'zh', 'ar', 'hi', 'ru', 'id', 'es', 'fr', 'bn', 'ja', 'vi', 'de', 'ko', 'cs'];

const STORAGE_KEY = 'personas-i18n-storage';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

// Locales whose script flows right-to-left. The pre-paint inline script
// in layout.tsx mirrors this list — keep them in sync if more RTL
// languages are added to SUPPORTED_LANGUAGES.
const RTL_LANGUAGES: ReadonlySet<Language> = new Set<Language>(['ar']);

function applyLangAttributes(lang: Language) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.setAttribute('data-lang', lang);
  html.setAttribute('lang', lang);
  if (RTL_LANGUAGES.has(lang)) {
    html.setAttribute('dir', 'rtl');
  } else {
    html.removeAttribute('dir');
  }
}

function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';
  const primary = navigator.language.split('-')[0].toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(primary as Language)) {
    return primary as Language;
  }
  return 'en';
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => {
        applyLangAttributes(language);
        set({ language });
      },
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => {
        const hasStoredPreference = typeof localStorage !== 'undefined' &&
          localStorage.getItem(STORAGE_KEY) !== null;

        return (state) => {
          if (!state) return;
          if (!hasStoredPreference) {
            const detected = detectBrowserLanguage();
            state.setLanguage(detected);
          } else {
            applyLangAttributes(state.language);
          }
        };
      },
    }
  )
);
