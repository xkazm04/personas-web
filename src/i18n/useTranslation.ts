import { useI18nStore } from '@/stores/i18nStore';
import { en } from './en';
import { zh } from './zh';
import { ar } from './ar';
import { hi } from './hi';
import { ru } from './ru';
import { id } from './id';
import { es } from './es';
import { fr } from './fr';
import { bn } from './bn';
import { ja } from './ja';
import { vi } from './vi';
import { de } from './de';
import { ko } from './ko';
import { cs } from './cs';
import type { Translations } from './en';

const translations: Record<string, Translations> = { en, zh, ar, hi, ru, id, es, fr, bn, ja, vi, de, ko, cs };

export function useTranslation() {
  const { language } = useI18nStore();
  return { t: translations[language] ?? translations.en, language };
}
