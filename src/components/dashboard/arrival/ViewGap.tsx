"use client";

import { useTranslation } from "@/i18n/useTranslation";

/**
 * What occupies the content area while a view's chunk downloads.
 *
 * Deliberately shapeless: views share no body geometry, so any silhouette
 * here would be a second, wrong skeleton in front of the view's own (the
 * registry's lazy-section-loading "placeholder is the section's shape, or
 * nothing"). It holds the height so the shell never collapses, announces
 * loading once to assistive tech, and shows a faint pulse line only after
 * the ghost delay — a warm chunk paints nothing at all.
 */
export default function ViewGap({ fill = false }: { fill?: boolean }) {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-busy="true"
      className={fill ? "flex h-full min-h-[24rem] items-start" : "min-h-[24rem]"}
    >
      <span className="sr-only">{t.common.loading}</span>
      <div aria-hidden className="dash-ghost mx-auto mt-24 h-px w-40 bg-gradient-to-r from-transparent via-glass-strong to-transparent" />
    </div>
  );
}
