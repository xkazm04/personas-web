import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'zh' | 'ar' | 'hi' | 'ru' | 'id' | 'es' | 'fr' | 'bn' | 'ja' | 'vi' | 'de' | 'ko' | 'cs';

export const SUPPORTED_LANGS: ReadonlySet<Language> = new Set<Language>([
  'en', 'zh', 'ar', 'hi', 'ru', 'id', 'es', 'fr', 'bn', 'ja', 'vi', 'de', 'ko', 'cs',
]);

export const DEFAULT_LANGUAGE: Language = 'en';

export const RTL_LANGS: ReadonlySet<Language> = new Set<Language>(['ar']);

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && SUPPORTED_LANGS.has(value as Language);
}

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

function applyLangAttributes(lang: Language) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.setAttribute('data-lang', lang);
  html.setAttribute('lang', lang);
  html.setAttribute('dir', RTL_LANGS.has(lang) ? 'rtl' : 'ltr');
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (lang) => {
        const language = isLanguage(lang) ? lang : DEFAULT_LANGUAGE;
        applyLangAttributes(language);
        set({ language });
      },
    }),
    {
      name: 'personas-i18n-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!isLanguage(state.language)) {
          state.language = DEFAULT_LANGUAGE;
        }
        applyLangAttributes(state.language);
      },
    }
  )
);
