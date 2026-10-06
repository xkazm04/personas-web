import { useEffect } from "react";
import type { ManualReviewItem } from "@/lib/types";

export function useReviewKeyboardShortcuts({
  selectedIndex,
  filtered,
  selectedReview,
  setSelectedId,
  decide,
  bulkCount,
  clearSelection,
}: {
  selectedIndex: number;
  filtered: ManualReviewItem[];
  selectedReview: ManualReviewItem | null;
  setSelectedId: (id: string) => void;
  /** The review store's ledger door. It carries the row's draft notes and
   *  guards against racing an open or in-flight batch (flush or refuse). */
  decide: (ids: string[], verdict: "approved" | "rejected") => boolean;
  bulkCount: number;
  clearSelection: () => void;
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
      } else if (e.key === "a" && selectedReview?.status === "pending") {
        e.preventDefault();
        decide([selectedReview.id], "approved");
      } else if (e.key === "r" && selectedReview?.status === "pending") {
        e.preventDefault();
        decide([selectedReview.id], "rejected");
      } else if (e.key === "Escape" && bulkCount > 0) {
        e.preventDefault();
        clearSelection();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedIndex, filtered, selectedReview, decide, bulkCount, clearSelection, setSelectedId]);
}
