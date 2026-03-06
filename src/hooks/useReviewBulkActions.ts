"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import type { ManualReviewItem } from "@/lib/types";

interface BulkProgress {
  done: number;
  total: number;
}

interface UndoState {
  ids: string[];
  status: "approved" | "rejected";
  message: string;
}

export function useReviewBulkActions(filtered: ManualReviewItem[]) {
  const resolveReview = useReviewStore((s) => s.resolveReview);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkResolving, setBulkResolving] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<BulkProgress | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const lastSelectedRef = useRef<number>(-1);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pendingInFiltered = filtered.filter((r) => r.status === "pending");

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    lastSelectedRef.current = -1;
  }, []);

  const toggleSelect = useCallback(
    (id: string, shiftKey: boolean) => {
      const currentIndex = filtered.findIndex((r) => r.id === id);

      if (shiftKey && lastSelectedRef.current >= 0 && currentIndex >= 0) {
        const start = Math.min(lastSelectedRef.current, currentIndex);
        const end = Math.max(lastSelectedRef.current, currentIndex);
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

      if (currentIndex >= 0) lastSelectedRef.current = currentIndex;
    },
    [filtered],
  );

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(pendingInFiltered.map((r) => r.id)));
  }, [pendingInFiltered]);

  const executeBulkAction = useCallback(
    async (ids: string[], status: "approved" | "rejected") => {
      setBulkResolving(true);
      setBulkProgress({ done: 0, total: ids.length });
      let done = 0;
      const results = await Promise.allSettled(
        ids.map((id) =>
          resolveReview(id, status).finally(() => {
            done++;
            setBulkProgress({ done, total: ids.length });
          }),
        ),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed === 0) setSelectedIds(new Set());
      setBulkResolving(false);
      setBulkProgress(null);
    },
    [resolveReview],
  );

  const startBulkWithUndo = useCallback(
    (ids: string[], status: "approved" | "rejected") => {
      const count = ids.length;

      // Optimistic UI: mark immediately
      useReviewStore.setState((s) => ({
        reviews: s.reviews.map((r) =>
          ids.includes(r.id) ? { ...r, status, resolvedAt: new Date().toISOString(), resolvedBy: "You" } : r,
        ),
        pendingReviewCount: s.reviews.filter(
          (r) => !ids.includes(r.id) && r.status === "pending",
        ).length,
      }));
      setSelectedIds(new Set());

      const label = status === "approved" ? "Approved" : "Rejected";
      setUndoState({
        ids,
        status,
        message: `${label} ${count} review${count !== 1 ? "s" : ""}`,
      });

      undoTimerRef.current = setTimeout(() => {
        setUndoState(null);
        undoTimerRef.current = null;
        void executeBulkAction(ids, status);
      }, 5000);
    },
    [executeBulkAction],
  );

  const handleBulkAction = useCallback(
    (status: "approved" | "rejected") => {
      if (status === "rejected") {
        setShowRejectConfirm(true);
        return;
      }
      startBulkWithUndo(Array.from(selectedIds), status);
    },
    [selectedIds, startBulkWithUndo],
  );

  const handleBulkRejectConfirm = useCallback(() => {
    setShowRejectConfirm(false);
    startBulkWithUndo(Array.from(selectedIds), "rejected");
  }, [selectedIds, startBulkWithUndo]);

  const handleUndo = useCallback(() => {
    if (!undoState) return;
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    const ids = undoState.ids;
    useReviewStore.setState((s) => ({
      reviews: s.reviews.map((r) =>
        ids.includes(r.id) ? { ...r, status: "pending" as const, resolvedAt: null, resolvedBy: null } : r,
      ),
      pendingReviewCount: s.reviews.filter(
        (r) => r.status === "pending" || ids.includes(r.id),
      ).length,
    }));
    setUndoState(null);
  }, [undoState]);

  const handleUndoExpire = useCallback(() => {
    setUndoState(null);
  }, []);

  // Cleanup undo timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  return {
    selectedIds,
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
  };
}
