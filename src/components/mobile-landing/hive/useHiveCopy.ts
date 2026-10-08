"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { mobileLandingCopy, type MobileLandingCopy } from "@/i18n/pending/mobileLanding";

/** The /m landing's own words (the English-only pending namespace `mobileLanding`). */
export type { MobileLandingCopy };

/** The page's words: `m` is the page's own namespace, `t` the translated site copy it reuses. */
export function useHiveCopy() {
  const { t } = useTranslation();
  return { t, m: mobileLandingCopy };
}

/** Fill `{name}` slots in a copy string. */
export function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (all, k: string) => (k in vars ? String(vars[k]) : all));
}
