"use client";

import { useTranslation } from "@/i18n/useTranslation";
import type { Translations } from "@/i18n/en";

export type ClockCopy = Translations["mobileLanding2"];

/** The page's words: the English-only pending namespace `mobileLanding2` (decision M4). */
export function useClockCopy(): ClockCopy {
  return useTranslation().t.mobileLanding2;
}

/** Fill `{name}` placeholders. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
