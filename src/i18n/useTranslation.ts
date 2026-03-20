import { useI18nStore } from '@/stores/i18nStore';
import { en } from './en';
import { zh } from './zh';
import { ar } from './ar';
import { hi } from './hi';
import { ru } from './ru';
import { id } from './id';
import type { Translations } from './en';

const translations: Record<string, Translations> = { en, zh, ar, hi, ru, id };

export function useTranslation() {
  const { language } = useI18nStore();
  return { t: translations[language] ?? translations.en, language };
}
