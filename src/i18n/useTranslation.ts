import { useEffect, useState } from 'react';
import { useI18nStore } from '@/stores/i18nStore';
import { en } from './en';
import type { Translations } from './en';
import type { Language } from '@/stores/i18nStore';

const cache: Partial<Record<Language, Translations>> = { en };

const loaders: Record<Exclude<Language, 'en'>, () => Promise<Translations>> = {
  zh: () => import('./zh').then((m) => m.zh),
  ar: () => import('./ar').then((m) => m.ar),
  hi: () => import('./hi').then((m) => m.hi),
  ru: () => import('./ru').then((m) => m.ru),
  id: () => import('./id').then((m) => m.id),
  es: () => import('./es').then((m) => m.es),
  fr: () => import('./fr').then((m) => m.fr),
  bn: () => import('./bn').then((m) => m.bn),
  ja: () => import('./ja').then((m) => m.ja),
  vi: () => import('./vi').then((m) => m.vi),
  de: () => import('./de').then((m) => m.de),
  ko: () => import('./ko').then((m) => m.ko),
  cs: () => import('./cs').then((m) => m.cs),
};

export function useTranslation() {
  const { language } = useI18nStore();
  const [t, setTranslations] = useState<Translations>(() => cache[language] ?? en);

  useEffect(() => {
    let cancelled = false;
    const cached = cache[language];

    if (cached) {
      queueMicrotask(() => {
        if (!cancelled) setTranslations(cached);
      });
      return;
    }

    queueMicrotask(() => {
      if (!cancelled) setTranslations(en);
    });
    loaders[language as Exclude<Language, 'en'>]?.().then((next: Translations) => {
      cache[language] = next;
      if (!cancelled) setTranslations(next);
    });

    return () => {
      cancelled = true;
    };
  }, [language]);

  return { t, language };
}
