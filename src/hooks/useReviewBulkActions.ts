"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import type { ManualReviewItem } from "@/lib/types";

interface BulkProgress {
  done: number;
  total: number;
  failed: number;
}

interface UndoState {
  ids: string[];
  status: "approved" | "rejected";
  message: string;
}

export interface BulkResult {
  total: number;
  successCount: number;
  failedIds: string[];
  status: "approved" | "rejected";
}

export function useReviewBulkActions(filtered: ManualReviewItem[]) {
  const resolveReview = useReviewStore((s) => s.resolveReview);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkResolving, setBulkResolving] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<BulkProgress | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  // Shift-click anchor stored as the review id (string) so filter changes,
  // sorting, or new reviews arriving via polling can't make the cached
  // index point at a different row. Resolve to a fresh index at click time.
  const lastSelectedIdRef = useRef<string | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mirror of `undoState` so the unmount cleanup can read the latest pending
  // batch — React state is captured at mount-time in a `[]`-deps cleanup,
  // so the cleanup would otherwise see `null` and silently drop the action.
  const undoStateRef = useRef<UndoState | null>(null);

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

  const dismissBulkResult = useCallback(() => {
    setBulkResult(null);
    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }
  }, []);

  const executeBulkAction = useCallback(
    async (ids: string[], status: "approved" | "rejected") => {
      setBulkResolving(true);
      setBulkProgress({ done: 0, total: ids.length, failed: 0 });
      let doneCount = 0;
      let failCount = 0;

      // Cap concurrent PATCHes so a 100-item bulk approve doesn't thunder
      // against the orchestrator. Workers share a cursor so each id is
      // claimed exactly once; results stay index-aligned with ids so the
      // existing failedIds derivation still works.
      const CONCURRENCY = 6;
      const results: { status: "fulfilled" | "rejected" }[] = new Array(ids.length);
      let cursor = 0;

      const runWorker = async () => {
        while (cursor < ids.length) {
          const i = cursor++;
          try {
            await resolveReview(ids[i], status);
            results[i] = { status: "fulfilled" };
          } catch {
            failCount++;
            results[i] = { status: "rejected" };
          } finally {
            doneCount++;
            setBulkProgress({ done: doneCount, total: ids.length, failed: failCount });
          }
        }
      };

      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, ids.length) }, runWorker),
      );

      const failedIds = ids.filter((_, i) => results[i].status === "rejected");

      if (failedIds.length > 0) {
        useReviewStore.setState((s) => {
          const reviews = s.reviews.map((r) =>
            failedIds.includes(r.id)
              ? { ...r, status: "pending" as const, resolvedAt: null, resolvedBy: null }
              : r,
          );
          // Derive the count from the freshly-mapped array, not from the stale
          // pre-map `s.reviews` + failedIds union (which drifted from the real
          // count of status==="pending" rows until the next poll healed it).
          return {
            reviews,
            pendingReviewCount: reviews.filter((r) => r.status === "pending").length,
          };
        });
        setSelectedIds(new Set(failedIds));
        setBulkResult({
          total: ids.length,
          successCount: ids.length - failedIds.length,
          failedIds,
          status,
        });
        resultTimerRef.current = setTimeout(() => {
          setBulkResult(null);
          resultTimerRef.current = null;
        }, 10_000);
      } else {
        setSelectedIds(new Set());
      }

      setBulkResolving(false);
      setBulkProgress(null);
    },
    [resolveReview],
  );

  const startBulkWithUndo = useCallback(
    (ids: string[], status: "approved" | "rejected") => {
      // Defensive: a double-click on Approve / a Retry-while-undo-still-open
      // would otherwise overwrite undoTimerRef without clearing the prior
      // timer, leaving an orphaned timer that fires later and double-PATCHes
      // the original ids (duplicate audit-log rows + duplicate webhook
      // deliveries). Cancel any pending batch before queuing the next one.
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }

      const count = ids.length;

      useReviewStore.setState((s) => {
        const reviews = s.reviews.map((r) =>
          ids.includes(r.id) ? { ...r, status, resolvedAt: new Date().toISOString(), resolvedBy: "You" } : r,
        );
        return {
          reviews,
          pendingReviewCount: reviews.filter((r) => r.status === "pending").length,
        };
      });
      setSelectedIds(new Set());

      const label = status === "approved" ? "Approved" : "Rejected";
      const next: UndoState = {
        ids,
        status,
        message: `${label} ${count} review${count !== 1 ? "s" : ""}`,
      };
      setUndoState(next);
      undoStateRef.current = next;
      // Pause polling while the undo window is open so a 15s server poll
      // doesn't overwrite the optimistic rows mid-window.
      useReviewStore.getState().setPollPaused(true);

      undoTimerRef.current = setTimeout(() => {
        setUndoState(null);
        undoStateRef.current = null;
        undoTimerRef.current = null;
        useReviewStore.getState().setPollPaused(false);
        void executeBulkAction(ids, status);
      }, 5000);
    },
    [executeBulkAction],
  );

  const handleBulkAction = useCallback(
    (status: "approved" | "rejected") => {
      // Refuse to start a new batch while another one's undo window is
      // still open or its commit is in flight. The UI also disables the
      // buttons while undoState is set, but a double-click can fire two
      // events before React reconciles the disabled prop.
      if (undoState !== null || bulkResolving) return;
      if (status === "rejected") {
        setShowRejectConfirm(true);
        return;
      }
      startBulkWithUndo(Array.from(selectedIds), status);
    },
    [selectedIds, startBulkWithUndo, undoState, bulkResolving],
  );

  const handleBulkRejectConfirm = useCallback(() => {
    setShowRejectConfirm(false);
    if (undoState !== null || bulkResolving) return;
    startBulkWithUndo(Array.from(selectedIds), "rejected");
  }, [selectedIds, startBulkWithUndo, undoState, bulkResolving]);

  const handleUndo = useCallback(() => {
    if (!undoState) return;
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    const ids = undoState.ids;
    useReviewStore.setState((s) => {
      const reviews = s.reviews.map((r) =>
        ids.includes(r.id) ? { ...r, status: "pending" as const, resolvedAt: null, resolvedBy: null } : r,
      );
      return {
        reviews,
        pendingReviewCount: reviews.filter((r) => r.status === "pending").length,
      };
    });
    setUndoState(null);
    undoStateRef.current = null;
    useReviewStore.getState().setPollPaused(false);
  }, [undoState]);

  const handleUndoExpire = useCallback(() => {
    setUndoState(null);
    undoStateRef.current = null;
    useReviewStore.getState().setPollPaused(false);
  }, []);

  const retryFailed = useCallback(() => {
    if (!bulkResult) return;
    const { failedIds, status } = bulkResult;
    dismissBulkResult();
    startBulkWithUndo(failedIds, status);
  }, [bulkResult, dismissBulkResult, startBulkWithUndo]);

  useEffect(() => {
    return () => {
      // Critical: if the operator navigates away while an undo window is
      // open, commit the optimistic batch *before* clearing the timer.
      // Without this flush, clearTimeout silently abandons the 5-second-
      // pending PATCHes and the rows revert on the next poll — the
      // operator's audit decisions are dropped with no signal.
      const pending = undoStateRef.current;
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
        if (pending) {
          // Fire-and-forget — cleanup must be synchronous, but the network
          // round-trip can complete after unmount; the store mutations
          // inside executeBulkAction are safe against an unmounted consumer.
          void executeBulkAction(pending.ids, pending.status);
        }
      }
      undoStateRef.current = null;
      // Always release pollPaused on unmount — leaving it true would freeze
      // polling for the lifetime of the next mount until something cleared it.
      useReviewStore.getState().setPollPaused(false);
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    };
  }, [executeBulkAction]);

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
    bulkResult,
    dismissBulkResult,
    retryFailed,
  };
}
