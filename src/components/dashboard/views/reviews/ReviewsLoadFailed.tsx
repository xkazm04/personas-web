"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { useReviewStore } from "@/stores/reviewStore";

/**
 * The review list read failed and nothing is held: say it could not load, and
 * offer a retry, instead of the empty-filter copy that would read as "nothing
 * needs you". `stale` is the slim variant for a failed refresh over rows that
 * are still on screen.
 */
export function ReviewsLoadFailed({ stale = false }: { stale?: boolean }) {
  const { t } = useTranslation();
  const fetchReviews = useReviewStore((s) => s.fetchReviews);
  const retry = (
    <button
      type="button"
      onClick={() => void fetchReviews()}
      className="inline-flex items-center gap-1 rounded-lg border border-glass-hover px-2 py-1 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.04] focus-ring"
    >
      <RotateCw aria-hidden className="h-3 w-3" />
      {t.dashboardUi.retry}
    </button>
  );

  if (stale) {
    return (
      <div role="status" className="flex flex-shrink-0 items-center justify-center gap-2 border-t border-glass bg-white/[0.02] px-3 py-1.5 text-sm text-muted-dark">
        <AlertTriangle aria-hidden className="h-3 w-3 text-amber-400" />
        <span>{t.dashboardUi.reviewsRefreshFailed}</span>
        {retry}
      </div>
    );
  }
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <span className="flex items-center gap-2 text-sm text-foreground">
        <AlertTriangle aria-hidden className="h-4 w-4 text-amber-400" />
        {t.dashboardUi.reviewsLoadFailed}
      </span>
      {retry}
    </div>
  );
}
