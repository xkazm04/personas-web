import { create } from 'zustand';

export type Language = 'en' | 'zh' | 'ar' | 'hi' | 'ru' | 'id' | 'es' | 'fr' | 'bn' | 'ja' | 'vi' | 'de' | 'ko' | 'cs';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

// English is currently the only fully-translated locale, so the UI is
// locked to 'en'. The store API is preserved (language + setLanguage)
// for compatibility with useTranslation, but setLanguage is a no-op.
export const useI18nStore = create<I18nState>()(() => ({
  language: 'en',
  setLanguage: () => {
    // intentionally no-op — UI is English-only
  },
}));
