import { useEffect } from "react";
import type { ManualReviewItem } from "@/lib/types";

export function useReviewKeyboardShortcuts({
  selectedIndex,
  filtered,
  selectedReview,
  setSelectedId,
  resolveReview,
  bulkCount,
  clearSelection,
  resolveLocked = false,
}: {
  selectedIndex: number;
  filtered: ManualReviewItem[];
  selectedReview: ManualReviewItem | null;
  setSelectedId: (id: string) => void;
  resolveReview: (id: string, status: "approved" | "rejected", notes?: string) => Promise<void>;
  bulkCount: number;
  clearSelection: () => void;
  /** True while a bulk-undo window is open or a bulk commit is in flight. The
   *  single-item a/r resolve must be inert then, or it races the deferred bulk
   *  batch (double-commit / un-undoable audit decision). */
  resolveLocked?: boolean;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Never hijack browser/OS chords (Ctrl+R reload, Cmd+A, Alt+…). e.key is
      // still the bare letter when a modifier is held, so without this guard a
      // reload keystroke would preventDefault and fire a destructive resolve.
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) return;

      if (e.key === "j") {
        e.preventDefault();
        const nextIdx = Math.min(selectedIndex + 1, filtered.length - 1);
        if (filtered[nextIdx]) setSelectedId(filtered[nextIdx].id);
      } else if (e.key === "k") {
        e.preventDefault();
        const prevIdx = Math.max(selectedIndex - 1, 0);
        if (filtered[prevIdx]) setSelectedId(filtered[prevIdx].id);
      } else if (e.key === "a" && selectedReview?.status === "pending" && !resolveLocked) {
        e.preventDefault();
        void resolveReview(selectedReview.id, "approved");
      } else if (e.key === "r" && selectedReview?.status === "pending" && !resolveLocked) {
        e.preventDefault();
        void resolveReview(selectedReview.id, "rejected");
      } else if (e.key === "Escape" && bulkCount > 0) {
        e.preventDefault();
        clearSelection();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedIndex, filtered, selectedReview, resolveReview, bulkCount, clearSelection, setSelectedId, resolveLocked]);
}
