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
}: {
  selectedIndex: number;
  filtered: ManualReviewItem[];
  selectedReview: ManualReviewItem | null;
  setSelectedId: (id: string) => void;
  resolveReview: (id: string, status: "approved" | "rejected", notes?: string) => Promise<void>;
  bulkCount: number;
  clearSelection: () => void;
}) {
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
  }, [selectedIndex, filtered, selectedReview, resolveReview, bulkCount, clearSelection, setSelectedId]);
}
