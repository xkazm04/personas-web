"use client";

import { useMemo } from "react";

import { scopeReviews } from "@/components/dashboard/scope/scopeProjections";
import { useDashboardScope } from "@/components/dashboard/scope/useDashboardScope";
import { scopeHidAll } from "@/lib/dashboardScope";
import { useReviewStore } from "@/stores/reviewStore";

/**
 * The review queue in the scope bar's persona + window (by the review's
 * persona and when it was raised). `all` is the loaded list: "not served" and
 * "still loading" are judged on it, never on the scoped slice.
 */
export function useScopedReviews() {
  const all = useReviewStore((s) => s.reviews);
  const scope = useDashboardScope();
  const reviews = useMemo(() => scopeReviews(all, scope), [all, scope]);
  return { all, reviews, scopeEmpty: scopeHidAll(all, reviews) };
}
