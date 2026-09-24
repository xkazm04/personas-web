"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import type { ManualReviewItem } from "@/lib/types";

/**
 * Selection + confirm dialog for the split pane's bulk toolbar. The commit
 * window, undo, progress and retry all live in the review store's decision
 * ledger (`decide` / `undoDecision` / `flushDecisions`, see
 * `src/lib/review-ledger.ts`); this hook only chooses WHICH ids to decide.
 */
export function useReviewBulkActions(filtered: ManualReviewItem[]) {
  const decide = useReviewStore((s) => s.decide);
  const commitProgress = useReviewStore((s) => s.commitProgress);
  const bulkResult = useReviewStore((s) => s.lastResult);
  const dismissBulkResult = useReviewStore((s) => s.dismissResult);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  // Shift-click anchor stored as the review id (string) so filter changes,
  // sorting, or new reviews arriving via polling can't make the cached
  // index point at a different row. Resolve to a fresh index at click time.
  const lastSelectedIdRef = useRef<string | null>(null);

  // A commit with failures reselects the failed rows (partial-failure-reselect).
  const [prevResult, setPrevResult] = useState(bulkResult);
  if (bulkResult !== prevResult) {
    setPrevResult(bulkResult);
    if (bulkResult) setSelectedIds(new Set(bulkResult.failedIds));
  }

  const pendingInFiltered = filtered.filter((r) => r.status === "pending");

  // Forget the anchor as soon as the anchor row is no longer present in the
  // current filtered view — otherwise the next shift-click would silently
  // fall back to the no-anchor branch with stale state lingering in the ref.
  useEffect(() => {
    if (
      lastSelectedIdRef.current !== null &&
      !filtered.some((r) => r.id === lastSelectedIdRef.current)
    ) {
      lastSelectedIdRef.current = null;
    }
  }, [filtered]);

  // Flush-on-teardown: leaving the split pane commits an open window, since
  // the undo toast that could reverse it is going away with the surface.
  useEffect(() => () => useReviewStore.getState().flushDecisions(), []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    lastSelectedIdRef.current = null;
  }, []);

  const toggleSelect = useCallback(
    (id: string, shiftKey: boolean) => {
      const currentIndex = filtered.findIndex((r) => r.id === id);
      const anchorId = lastSelectedIdRef.current;
      const anchorIndex =
        anchorId !== null ? filtered.findIndex((r) => r.id === anchorId) : -1;

      if (shiftKey && anchorIndex >= 0 && currentIndex >= 0) {
        const start = Math.min(anchorIndex, currentIndex);
        const end = Math.max(anchorIndex, currentIndex);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          for (let i = start; i <= end; i++) {
            if (filtered[i].status === "pending") {
              next.add(filtered[i].id);
            }
          }
          return next;
        });
      } else {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      }

      if (currentIndex >= 0) lastSelectedIdRef.current = id;
    },
    [filtered],
  );

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(pendingInFiltered.map((r) => r.id)));
  }, [pendingInFiltered]);

  const decideSelected = useCallback(
    (ids: string[], status: "approved" | "rejected") => {
      // The ledger is the guard: it flushes a disjoint open window and refuses
      // an overlapping one (the refusal shows on the open undo toast).
      if (decide(ids, status)) setSelectedIds(new Set());
    },
    [decide],
  );

  const handleBulkAction = useCallback(
    (status: "approved" | "rejected") => {
      if (status === "rejected") {
        setShowRejectConfirm(true);
        return;
      }
      decideSelected(Array.from(selectedIds), status);
    },
    [selectedIds, decideSelected],
  );

  const handleBulkRejectConfirm = useCallback(() => {
    setShowRejectConfirm(false);
    decideSelected(Array.from(selectedIds), "rejected");
  }, [selectedIds, decideSelected]);

  const retryFailed = useCallback(() => {
    if (!bulkResult) return;
    const { failedIds, status } = bulkResult;
    dismissBulkResult();
    decideSelected(failedIds, status);
  }, [bulkResult, dismissBulkResult, decideSelected]);

  return {
    selectedIds,
    clearSelection,
    toggleSelect,
    selectAll,
    bulkResolving: commitProgress !== null,
    bulkProgress: commitProgress,
    pendingInFiltered,
    handleBulkAction,
    showRejectConfirm,
    setShowRejectConfirm,
    handleBulkRejectConfirm,
    bulkResult,
    dismissBulkResult,
    retryFailed,
  };
}
