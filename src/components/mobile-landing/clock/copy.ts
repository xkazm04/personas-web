"use client";

import { mobileLanding2Copy, type MobileLanding2Copy } from "@/i18n/pending/mobileLanding2";

export type ClockCopy = MobileLanding2Copy;

/** The page's words: the English-only pending namespace `mobileLanding2` (decision M4). */
export function useClockCopy(): ClockCopy {
  return mobileLanding2Copy;
}

/** Fill `{name}` placeholders. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
