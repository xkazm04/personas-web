"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  X,
  Loader2,
  ClipboardCheck,
  Terminal,
  Clock,
  ChevronRight,
  Bookmark,
  CheckSquare,
  Square,
  MinusSquare,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import FilterBar from "@/components/dashboard/FilterBar";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import UndoToast from "@/components/UndoToast";
import BulkProgressBar from "@/components/BulkProgressBar";
import BulkResultToast from "@/components/BulkResultToast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useReviewStore } from "@/stores/reviewStore";
import { usePolling } from "@/hooks/usePolling";
import { useReviewBulkActions } from "@/hooks/useReviewBulkActions";
import type { ManualReviewItem, ReviewSeverity } from "@/lib/types";
import { relativeTime } from "@/lib/format";

// ---------------------------------------------------------------------------
// Severity config
// ---------------------------------------------------------------------------

const severityConfig: Record<
  ReviewSeverity,
  { icon: React.ElementType; color: string; dotColor: string; accent: "cyan" | "amber" | "purple" }
> = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-400",
    dotColor: "bg-red-400",
    accent: "purple",
  },
  warning: {
    icon: AlertCircle,
    color: "text-amber-400",
    dotColor: "bg-amber-400",
    accent: "amber",
  },
  info: {
    icon: Info,
    color: "text-cyan-400",
    dotColor: "bg-cyan-400",
    accent: "cyan",
  },
};

// ---------------------------------------------------------------------------
// Status indicator dot
// ---------------------------------------------------------------------------

function StatusDot({ status }: { status: ManualReviewItem["status"] }) {
  if (status === "pending") {
    return (
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
      </span>
    );
  }
  if (status === "approved") {
    return (
      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/20 flex-shrink-0">
        <Check className="h-2 w-2 text-emerald-400" />
      </span>
    );
  }
  return (
    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500/20 flex-shrink-0">
      <X className="h-2 w-2 text-red-400" />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Left panel row
// ---------------------------------------------------------------------------

function ReviewRow({
  review,
  isActive,
  isSelected,
  onToggleSelect,
  onClick,
}: {
  review: ManualReviewItem;
  isActive: boolean;
  isSelected: boolean;
  onToggleSelect: (e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  const sev = severityConfig[review.severity];

  return (
    <div
      className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-all duration-150 border-l-2 cursor-pointer ${
        isActive
          ? "bg-brand-cyan/[0.08] border-l-brand-cyan"
          : "border-l-transparent hover:bg-white/[0.03]"
      }`}
      onClick={onClick}
    >
      {review.status === "pending" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(e);
          }}
          className="flex-shrink-0 text-muted-dark hover:text-brand-cyan transition-colors"
        >
          {isSelected ? (
            <CheckSquare className="h-4 w-4 text-brand-cyan" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </button>
      )}

      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${sev.dotColor}`} />
      <StatusDot status={review.status} />

      <span className="text-sm font-medium text-foreground truncate w-20 flex-shrink-0">
        {review.personaName ?? "Unknown"}
      </span>

      <span className="flex-1 min-w-0 text-sm text-muted truncate">
        {review.content.split("\n")[0]}
      </span>

      <span className="text-sm text-muted-dark flex-shrink-0 tabular-nums">
        {relativeTime(review.createdAt)}
      </span>

      {isActive && (
        <ChevronRight className="h-3 w-3 text-brand-cyan flex-shrink-0" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail panel
// ---------------------------------------------------------------------------

function DetailPanel({
  review,
  onResolve,
}: {
  review: ManualReviewItem | null;
  onResolve: (id: string, status: "approved" | "rejected", notes?: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const [resolving, setResolving] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Reset notes when review changes
  useEffect(() => {
    setNotes(review?.reviewerNotes ?? "");
    setResolving(false);
  }, [review?.id, review?.reviewerNotes]);

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-glass bg-white/[0.03]">
          <ClipboardCheck className="h-6 w-6 text-muted-dark" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">
          Select a review
        </h3>
        <p className="mt-1.5 text-sm text-muted-dark max-w-[200px]">
          Choose a review from the list to see details and take action
        </p>
        <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm text-muted-dark">
          <kbd className="rounded border border-glass-hover bg-white/[0.04] px-1.5 py-0.5">J</kbd>
          <span>/ </span>
          <kbd className="rounded border border-glass-hover bg-white/[0.04] px-1.5 py-0.5">K</kbd>
          <span>navigate</span>
          <kbd className="rounded border border-glass-hover bg-white/[0.04] px-1.5 py-0.5 ml-2">A</kbd>
          <span>approve</span>
          <kbd className="rounded border border-glass-hover bg-white/[0.04] px-1.5 py-0.5 ml-2">R</kbd>
          <span>reject</span>
        </div>
      </div>
    );
  }

  const sev = severityConfig[review.severity];
  const SevIcon = sev.icon;
  const isPending = review.status === "pending";

  const handleResolve = async (status: "approved" | "rejected") => {
    setResolving(true);
    try {
      onResolve(review.id, status, notes || undefined);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Detail header */}
      <div className="flex-shrink-0 border-b border-glass px-4 py-3">
        <div className="flex items-center gap-2">
          <PersonaAvatar
            icon={review.personaIcon}
            color={review.personaColor}
            name={review.personaName}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-foreground">
                {review.personaName ?? "Unknown Agent"}
              </span>
              <StatusBadge status={review.status} />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <SevIcon className={`h-3 w-3 ${sev.color}`} />
              <span className={`text-sm font-medium capitalize ${sev.color}`}>
                {review.severity}
              </span>
              <span className="text-sm text-muted-dark">
                {relativeTime(review.createdAt)}
              </span>
              {review.resolvedAt && (
                <span className="text-sm text-muted-dark">
                  Resolved {relativeTime(review.resolvedAt)}
                  {review.resolvedBy && ` by ${review.resolvedBy}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Content block */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Terminal className="h-3 w-3 text-muted-dark" />
            <span className="text-sm font-medium uppercase tracking-wider text-muted-dark">
              Content
            </span>
          </div>
          <div className="rounded-lg bg-black/40 border border-glass p-3 overflow-auto max-h-[40vh]">
            <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed text-slate-300">
              {review.content}
            </pre>
          </div>
        </div>

        {/* Execution context */}
        {review.executionId && (
          <div className="rounded-lg border border-glass bg-white/[0.02] p-2.5">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-muted-dark" />
              <span className="text-sm font-medium uppercase tracking-wider text-muted-dark">
                Execution
              </span>
              <span className="ml-auto font-mono text-sm text-muted-dark">
                {review.executionId.slice(0, 16)}
              </span>
            </div>
          </div>
        )}

        {/* Notes area */}
        {isPending && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Bookmark className="h-3 w-3 text-muted-dark" />
              <span className="text-sm font-medium uppercase tracking-wider text-muted-dark">
                Reviewer Notes
              </span>
            </div>
            <textarea
              ref={notesRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add optional notes before resolving..."
              rows={3}
              className="w-full rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-2 text-base text-foreground placeholder:text-muted-dark/60 focus:border-brand-cyan/30 focus:outline-none resize-none"
            />
          </div>
        )}

        {/* Existing reviewer notes (for resolved) */}
        {!isPending && review.reviewerNotes && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Bookmark className="h-3 w-3 text-muted-dark" />
              <span className="text-sm font-medium uppercase tracking-wider text-muted-dark">
                Reviewer Notes
              </span>
            </div>
            <div className="rounded-lg border border-glass bg-white/[0.02] px-3 py-2 text-sm text-muted">
              {review.reviewerNotes}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons fixed at bottom */}
      {isPending && (
        <div className="flex-shrink-0 border-t border-glass px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => void handleResolve("approved")}
            disabled={resolving}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
          >
            {resolving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Approve
            <kbd className="ml-1 rounded border border-emerald-500/20 bg-emerald-500/5 px-1 py-px text-sm">
              A
            </kbd>
          </button>
          <button
            onClick={() => void handleResolve("rejected")}
            disabled={resolving}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
          >
            {resolving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            Reject
            <kbd className="ml-1 rounded border border-red-500/20 bg-red-500/5 px-1 py-px text-sm">
              R
            </kbd>
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Split Pane Component
// ---------------------------------------------------------------------------

export default function ReviewsSplitPane() {
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
    let list = reviews;
    if (filter !== "all") {
      list = reviews.filter((r) => r.status === filter);
    }
    return [...list].sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reviews, filter]);

  const {
    selectedIds: bulkSelectedIds,
    clearSelection,
    toggleSelect,
    selectAll,
    bulkResolving,
    bulkProgress,
    pendingInFiltered,
    handleBulkAction,
    showRejectConfirm,
    setShowRejectConfirm,
    handleBulkRejectConfirm,
    undoState,
    handleUndo,
    handleUndoExpire,
    bulkResult,
    dismissBulkResult,
    retryFailed,
  } = useReviewBulkActions(filtered);

  const bulkCount = bulkSelectedIds.size;

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
    if (selectedIdRaw && filtered.find((r) => r.id === selectedIdRaw)) {
      return selectedIdRaw;
    }
    return filtered[0]?.id ?? null;
  }, [selectedIdRaw, filtered]);

  const selectedReview = useMemo(
    () => filtered.find((r) => r.id === selectedId) ?? null,
    [filtered, selectedId]
  );

  const selectedIndex = useMemo(
    () => filtered.findIndex((r) => r.id === selectedId),
    [filtered, selectedId]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "j") {
        e.preventDefault();
        const nextIdx = Math.min(selectedIndex + 1, filtered.length - 1);
        if (filtered[nextIdx]) setSelectedId(filtered[nextIdx].id);
      } else if (e.key === "k") {
        e.preventDefault();
        const prevIdx = Math.max(selectedIndex - 1, 0);
        if (filtered[prevIdx]) setSelectedId(filtered[prevIdx].id);
      } else if (e.key === "a" && selectedReview?.status === "pending") {
        e.preventDefault();
        void resolveReview(selectedReview.id, "approved");
      } else if (e.key === "r" && selectedReview?.status === "pending") {
        e.preventDefault();
        void resolveReview(selectedReview.id, "rejected");
      } else if (e.key === "Escape" && bulkCount > 0) {
        e.preventDefault();
        clearSelection();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedIndex, filtered, selectedReview, resolveReview, bulkCount, clearSelection]);

  const handleResolve = useCallback(
    (id: string, status: "approved" | "rejected", notes?: string) => {
      void resolveReview(id, status, notes);
    },
    [resolveReview]
  );

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!listRef.current || selectedIndex < 0) return;
    const rows = listRef.current.querySelectorAll("[data-review-row]");
    rows[selectedIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedIndex]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="flex flex-col h-[calc(100vh-10rem)]"
    >
      {/* Split pane container */}
      <motion.div
        variants={fadeUp}
        className="flex-1 min-h-0 flex rounded-xl border border-glass bg-white/[0.01] overflow-hidden"
      >
        {/* Left panel - list */}
        <div className="w-[40%] flex flex-col border-r border-glass">
          {/* Filter tabs */}
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

          {/* Bulk action toolbar */}
          <AnimatePresence>
            {pendingInFiltered.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex-shrink-0 overflow-hidden border-b border-glass"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02]">
                  <button
                    onClick={() => {
                      if (bulkCount === pendingInFiltered.length) clearSelection();
                      else selectAll();
                    }}
                    className="flex-shrink-0 text-muted-dark hover:text-brand-cyan transition-colors"
                  >
                    {bulkCount === 0 ? (
                      <Square className="h-4 w-4" />
                    ) : bulkCount === pendingInFiltered.length ? (
                      <CheckSquare className="h-4 w-4 text-brand-cyan" />
                    ) : (
                      <MinusSquare className="h-4 w-4 text-brand-cyan" />
                    )}
                  </button>
                  {bulkCount > 0 ? (
                    <>
                      <span className="text-xs text-muted-dark tabular-nums">
                        {bulkCount} selected
                      </span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <button
                          onClick={() => handleBulkAction("approved")}
                          disabled={bulkResolving}
                          className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          <Check className="inline h-3 w-3 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleBulkAction("rejected")}
                          disabled={bulkResolving}
                          className="rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <X className="inline h-3 w-3 mr-1" />
                          Reject
                        </button>
                        <button
                          onClick={clearSelection}
                          className="rounded-md px-2 py-1 text-xs text-muted-dark hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-muted-dark">
                      Select reviews for bulk actions
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Review list */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          >
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-dark/60">
                No reviews in this filter
              </div>
            ) : (
              filtered.map((review) => (
                <div key={review.id} data-review-row>
                  <ReviewRow
                    review={review}
                    isActive={review.id === selectedId}
                    isSelected={bulkSelectedIds.has(review.id)}
                    onToggleSelect={(e) => toggleSelect(review.id, e.shiftKey)}
                    onClick={() => setSelectedId(review.id)}
                  />
                </div>
              ))
            )}
          </div>

          {/* Loading indicator */}
          {reviewsLoading && (
            <div className="flex-shrink-0 flex items-center justify-center gap-1.5 py-1.5 border-t border-glass bg-white/[0.02]">
              <Loader2 className="h-3 w-3 animate-spin text-muted-dark" />
              <span className="text-sm text-muted-dark">Refreshing...</span>
            </div>
          )}
        </div>

        {/* Right panel - detail */}
        <div className="w-[60%] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedReview?.id ?? "empty"}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <DetailPanel
                review={selectedReview}
                onResolve={handleResolve}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Bulk action undo toast */}
      <AnimatePresence>
        {undoState && (
          <UndoToast
            message={undoState.message}
            durationMs={5000}
            onUndo={handleUndo}
            onExpire={handleUndoExpire}
          />
        )}
      </AnimatePresence>

      {/* Bulk progress toast */}
      <AnimatePresence>
        {bulkProgress && !undoState && (
          <BulkProgressBar
            done={bulkProgress.done}
            total={bulkProgress.total}
            failed={bulkProgress.failed}
            label={`Processing ${bulkProgress.total} review${bulkProgress.total !== 1 ? "s" : ""}`}
          />
        )}
      </AnimatePresence>

      {/* Partial failure result toast */}
      <AnimatePresence>
        {bulkResult && bulkResult.failedIds.length > 0 && (
          <BulkResultToast
            total={bulkResult.total}
            successCount={bulkResult.successCount}
            failedCount={bulkResult.failedIds.length}
            action={bulkResult.status}
            onDismiss={dismissBulkResult}
            onRetry={retryFailed}
          />
        )}
      </AnimatePresence>

      {/* Bulk reject confirmation */}
      <ConfirmDialog
        open={showRejectConfirm}
        title="Reject selected reviews?"
        confirmLabel={`Reject ${bulkCount} review${bulkCount !== 1 ? "s" : ""}`}
        onConfirm={handleBulkRejectConfirm}
        onCancel={() => setShowRejectConfirm(false)}
      >
        This will reject {bulkCount} selected review{bulkCount !== 1 ? "s" : ""}. You will have 5 seconds to undo this action.
      </ConfirmDialog>
    </motion.div>
  );
}
