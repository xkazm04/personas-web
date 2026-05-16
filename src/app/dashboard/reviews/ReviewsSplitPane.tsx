"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import FilterBar from "@/components/dashboard/FilterBar";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useReviewBulkActions } from "@/hooks/useReviewBulkActions";
import { usePolling } from "@/hooks/usePolling";
import { useTranslation } from "@/i18n/useTranslation";
import { useReviewStore } from "@/stores/reviewStore";
import { ReviewDetailPanel } from "./reviews-split-pane/ReviewDetailPanel";
import { ReviewList } from "./reviews-split-pane/ReviewList";
import { ReviewsBulkToolbar } from "./reviews-split-pane/ReviewsBulkToolbar";
import { ReviewsSplitPaneToasts } from "./reviews-split-pane/ReviewsSplitPaneToasts";
import { useReviewKeyboardShortcuts } from "./reviews-split-pane/useReviewKeyboardShortcuts";

export default function ReviewsSplitPane() {
  const { t } = useTranslation();
  const reviews = useReviewStore((s) => s.reviews);
  const reviewsLoading = useReviewStore((s) => s.reviewsLoading);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);
  const resolveReview = useReviewStore((s) => s.resolveReview);
  const checkEscalations = useReviewStore((s) => s.checkEscalations);
  const escalationEnabled = useReviewStore((s) => s.escalationEnabled);
  const [filter, setFilter] = useState("all");
  const [selectedIdRaw, setSelectedId] = useState<string | null>(null);

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
    return [...list].sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reviews, filter]);

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

  useReviewKeyboardShortcuts({
    selectedIndex,
    filtered,
    selectedReview,
    setSelectedId,
    resolveReview,
    bulkCount,
    clearSelection: bulk.clearSelection,
  });

  const handleResolve = useCallback(
    (id: string, status: "approved" | "rejected", notes?: string) => {
      void resolveReview(id, status, notes);
    },
    [resolveReview],
  );

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!listRef.current || selectedIndex < 0) return;
    const rows = listRef.current.querySelectorAll("[data-review-row]");
    rows[selectedIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedIndex]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col h-[calc(100vh-10rem)]">
      <motion.div variants={fadeUp} className="flex-1 min-h-0 flex rounded-xl border border-glass bg-white/[0.01] overflow-hidden">
        <div className="w-[40%] flex flex-col border-r border-glass">
          <div className="flex-shrink-0 px-2 pt-2 pb-1 border-b border-glass">
            <FilterBar
              options={[
                { key: "all", label: "All", count: counts.all },
                { key: "pending", label: "Pending", count: counts.pending },
                { key: "approved", label: "Approved", count: counts.approved },
                { key: "rejected", label: "Rejected", count: counts.rejected },
              ]}
              active={filter}
              onChange={setFilter}
              compact
            />
          </div>
          <AnimatePresence>
            {bulk.pendingInFiltered.length > 0 && (
              <ReviewsBulkToolbar bulkCount={bulkCount} pendingInFiltered={bulk.pendingInFiltered} bulkResolving={bulk.bulkResolving} clearSelection={bulk.clearSelection} selectAll={bulk.selectAll} handleBulkAction={bulk.handleBulkAction} />
            )}
          </AnimatePresence>
          <ReviewList listRef={listRef} filtered={filtered} selectedId={selectedId} selectedIds={bulk.selectedIds} toggleSelect={bulk.toggleSelect} setSelectedId={setSelectedId} />
          {reviewsLoading && (
            <div className="flex-shrink-0 flex items-center justify-center gap-1.5 py-1.5 border-t border-glass bg-white/[0.02]">
              <Loader2 className="h-3 w-3 animate-spin text-muted-dark" />
              <span className="text-sm text-muted-dark">{t.dashboardUi.refreshing}</span>
            </div>
          )}
        </div>
        <div className="w-[60%] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div key={selectedReview?.id ?? "empty"} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }} className="h-full">
              <ReviewDetailPanel review={selectedReview} onResolve={handleResolve} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
      <ReviewsSplitPaneToasts
        undoState={bulk.undoState}
        handleUndo={bulk.handleUndo}
        handleUndoExpire={bulk.handleUndoExpire}
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
    </motion.div>
  );
}
