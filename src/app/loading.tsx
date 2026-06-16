"use client";

import { useTranslation } from "@/i18n/useTranslation";

/**
 * Top-level route-segment loading fallback.
 *
 * Shown during navigation between server-rendered routes while the next
 * segment streams in. Intentionally minimal — most public routes are
 * pre-rendered so this rarely appears for long. Client component so the
 * label stays localized (falls back to English before the locale hydrates).
 */
export default function RouteLoading() {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-label={t.common.loading}
      className="flex min-h-[50vh] items-center justify-center"
    >
      <div className="flex items-center gap-3 text-muted-dark">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-glass-hover border-t-brand-cyan" />
        <span className="text-base font-mono uppercase tracking-wider">
          {t.common.loading}
        </span>
      </div>
    </div>
  );
}
