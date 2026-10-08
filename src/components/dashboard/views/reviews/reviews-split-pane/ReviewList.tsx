import { useTranslation } from "@/i18n/useTranslation";
import type { ManualReviewItem } from "@/lib/types";
import { ReviewRow } from "./ReviewRow";

/** First-load ghost rows (stable keys; never real data). */
const GHOST_ROWS = ["a", "b", "c", "d", "e", "f"] as const;

export function ReviewList({
  listRef,
  now,
  waiting = false,
  filtered,
  selectedId,
  selectedIds,
  toggleSelect,
  setSelectedId,
}: {
  listRef: React.RefObject<HTMLDivElement | null>;
  now: number;
  /** The first fetch has not settled and nothing is held: ghost, don't claim "empty". */
  waiting?: boolean;
  filtered: ManualReviewItem[];
  selectedId: string | null;
  selectedIds: Set<string>;
  toggleSelect: (id: string, shiftKey: boolean) => void;
  setSelectedId: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {waiting ? (
        // Rows shaped like ReviewRow (one line, py-2), drawn only after the ghost delay.
        <div role="status" aria-busy="true">
          <span className="sr-only">{t.common.loading}</span>
          <div aria-hidden className="dash-ghost divide-y divide-white/[0.04]">
            {GHOST_ROWS.map((key) => (
              <div key={key} className="flex h-9 items-center gap-2 px-3">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/10" />
                <span className="h-3 w-20 flex-shrink-0 rounded bg-white/[0.06]" />
                <span className="h-3 flex-1 rounded bg-white/[0.04]" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-dark/60">
          {t.dashboardUi.noReviewsInFilter}
        </div>
      ) : (
        filtered.map((review) => (
          <div key={review.id} data-review-row>
            <ReviewRow
              review={review}
              now={now}
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
