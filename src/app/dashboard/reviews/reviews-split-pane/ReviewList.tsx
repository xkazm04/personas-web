import { useTranslation } from "@/i18n/useTranslation";
import type { ManualReviewItem } from "@/lib/types";
import { ReviewRow } from "./ReviewRow";

export function ReviewList({
  listRef,
  filtered,
  selectedId,
  selectedIds,
  toggleSelect,
  setSelectedId,
}: {
  listRef: React.RefObject<HTMLDivElement | null>;
  filtered: ManualReviewItem[];
  selectedId: string | null;
  selectedIds: Set<string>;
  toggleSelect: (id: string, shiftKey: boolean) => void;
  setSelectedId: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-dark/60">
          {t.dashboardUi.noReviewsInFilter}
        </div>
      ) : (
        filtered.map((review) => (
          <div key={review.id} data-review-row>
            <ReviewRow
              review={review}
              isActive={review.id === selectedId}
              isSelected={selectedIds.has(review.id)}
              onToggleSelect={(e) => toggleSelect(review.id, e.shiftKey)}
              onClick={() => setSelectedId(review.id)}
            />
          </div>
        ))
      )}
    </div>
  );
}
