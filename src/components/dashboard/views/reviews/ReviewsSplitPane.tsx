"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import FilterBar from "@/components/dashboard/FilterBar";
import { EASE_CURVE } from "@/lib/animations";
import Deferred from "@/components/dashboard/arrival/Deferred";
import { useReviewBulkActions } from "@/hooks/useReviewBulkActions";
import { usePolling } from "@/hooks/usePolling";
import { useTranslation } from "@/i18n/useTranslation";
import { orderByDue } from "@/lib/review-sla";
import { useReviewStore } from "@/stores/reviewStore";
import { ReviewDetailPanel } from "./reviews-split-pane/ReviewDetailPanel";
import { ReviewList } from "./reviews-split-pane/ReviewList";
import { ReviewsBulkToolbar } from "./reviews-split-pane/ReviewsBulkToolbar";
import { ReviewsSplitPaneToasts } from "./reviews-split-pane/ReviewsSplitPaneToasts";
import { useReviewKeyboardShortcuts } from "./reviews-split-pane/useReviewKeyboardShortcuts";
import type { ReviewGate } from "./useReviewGate";

export default function ReviewsSplitPane({ now, canDecide }: { now: number; canDecide: ReviewGate["canDecide"] }) {
  const { t } = useTranslation();
  const reviews = useReviewStore((s) => s.reviews);
  const reviewsLoading = useReviewStore((s) => s.reviewsLoading);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);
  const decide = useReviewStore((s) => s.decide);
  const checkEscalations = useReviewStore((s) => s.checkEscalations);
  const escalationEnabled = useReviewStore((s) => s.escalationEnabled);
  const policy = useReviewStore((s) => s.escalationPolicy);
  const [filter, setFilter] = useState("all");
  const [selectedIdRaw, setSelectedId] = useState<string | null>(null);
  // "Waiting" only until the first fetch settles, so a later poll never shows
  // the first-load ghost and the empty filter never claims "no reviews" early.
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [prevLoading, setPrevLoading] = useState(reviewsLoading);
  if (reviewsLoading !== prevLoading) {
    setPrevLoading(reviewsLoading);
    if (!reviewsLoading) setFirstLoadDone(true);
  }
  const waiting = !firstLoadDone && reviews.length === 0;

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);
  usePolling(fetchReviews, 15_000, true);
  useEffect(() => {
    if (!escalationEnabled) return;
    const id = setInterval(checkEscalations, 30_000);
    checkEscalations();
    return () => clearInterval(id);
  }, [escalationEnabled, checkEscalations]);

  const filtered = useMemo(() => {
    const list = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);
    // Pending by SLA deadline (most overdue first), then decided newest-first.
    return orderByDue(list, policy, now);
  }, [reviews, filter, policy, now]);

  const bulk = useReviewBulkActions(filtered);
  const bulkCount = bulk.selectedIds.size;
  const counts = useMemo(() => {
    const c = { all: reviews.length, pending: 0, approved: 0, rejected: 0 };
    for (const r of reviews) {
      if (r.status === "pending") c.pending++;
      else if (r.status === "approved") c.approved++;
      else if (r.status === "rejected") c.rejected++;
    }
    return c;
  }, [reviews]);

  const selectedId = useMemo(() => {
    if (selectedIdRaw && filtered.find((r) => r.id === selectedIdRaw)) return selectedIdRaw;
    return filtered[0]?.id ?? null;
  }, [selectedIdRaw, filtered]);
  const selectedReview = useMemo(() => filtered.find((r) => r.id === selectedId) ?? null, [filtered, selectedId]);
  const selectedIndex = useMemo(() => filtered.findIndex((r) => r.id === selectedId), [filtered, selectedId]);
  // In live mode the selected review's desktop must be reachable (M20); bulk is judged on the newest desktop.
  const selectedAllowed = canDecide(selectedReview);
  const bulkAllowed = canDecide(null);
  const gatedDecide = useCallback(
    (ids: string[], verdict: "approved" | "rejected") => selectedAllowed && decide(ids, verdict),
    [selectedAllowed, decide],
  );

  useReviewKeyboardShortcuts({
    selectedIndex,
    filtered,
    selectedReview,
    setSelectedId,
    decide: gatedDecide,
    bulkCount,
    clearSelection: bulk.clearSelection,
  });

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!listRef.current || selectedIndex < 0) return;
    const rows = listRef.current.querySelectorAll("[data-review-row]");
    rows[selectedIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedIndex]);

  return (
    // The pane chrome (border, filter bar, list frame) is T1: its entrance is
    // the view's CSS cascade (reviews/index.tsx), so no framer entrance here.
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex-1 min-h-0 flex rounded-xl border border-glass bg-white/[0.01] overflow-hidden">
        <div className="w-[40%] flex flex-col border-r border-glass">
          <div className="flex-shrink-0 px-2 pt-2 pb-1 border-b border-glass">
            <FilterBar
              options={[
                { key: "all", label: t.executionsPage.all, count: counts.all },
                { key: "pending", label: t.dashboardUi.status.pending, count: counts.pending },
                { key: "approved", label: t.dashboardUi.status.approved, count: counts.approved },
                { key: "rejected", label: t.dashboardUi.status.rejected, count: counts.rejected },
              ]}
              active={filter}
              onChange={setFilter}
              compact
            />
          </div>
          <AnimatePresence>
            {bulk.pendingInFiltered.length > 0 && (
              <ReviewsBulkToolbar bulkCount={bulkCount} pendingInFiltered={bulk.pendingInFiltered} bulkResolving={bulk.bulkResolving} decideDisabled={!bulkAllowed} clearSelection={bulk.clearSelection} selectAll={bulk.selectAll} handleBulkAction={bulk.handleBulkAction} />
            )}
          </AnimatePresence>
          <ReviewList listRef={listRef} now={now} waiting={waiting} filtered={filtered} selectedId={selectedId} selectedIds={bulk.selectedIds} toggleSelect={bulk.toggleSelect} setSelectedId={setSelectedId} />
          {reviewsLoading && !waiting && (
            <div className="flex-shrink-0 flex items-center justify-center gap-1.5 py-1.5 border-t border-glass bg-white/[0.02]">
              <Loader2 className="h-3 w-3 animate-spin text-muted-dark" />
              <span className="text-sm text-muted-dark">{t.dashboardUi.refreshing}</span>
            </div>
          )}
        </div>
        <div className="w-[60%] flex flex-col">
          {/* T3: the rich detail body mounts on the view's first deep turn and
              fills the pane it reserves. The keyed framer swap below is the
              row-to-row transition, not a load entrance. */}
          <Deferred className="h-full" minHeight="100%" order={0}>
            <AnimatePresence mode="wait">
              <motion.div key={selectedReview?.id ?? "empty"} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15, ease: EASE_CURVE }} className="h-full">
                <ReviewDetailPanel review={selectedReview} now={now} canDecide={selectedAllowed} onResolve={(id, status) => gatedDecide([id], status)} />
              </motion.div>
            </AnimatePresence>
          </Deferred>
        </div>
      </div>
      <ReviewsSplitPaneToasts
        bulkProgress={bulk.bulkProgress}
        bulkResult={bulk.bulkResult}
        dismissBulkResult={bulk.dismissBulkResult}
        retryFailed={bulk.retryFailed}
        showRejectConfirm={bulk.showRejectConfirm}
        bulkCount={bulkCount}
        handleBulkRejectConfirm={bulk.handleBulkRejectConfirm}
        setShowRejectConfirm={bulk.setShowRejectConfirm}
        rejectTitle={t.dashboardUi.rejectSelectedTitle}
        rejectBody={t.dashboardUi.rejectSelectedBody}
      />
    </div>
  );
}
