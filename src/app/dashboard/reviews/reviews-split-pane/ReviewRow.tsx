import { AlertOctagon, CheckSquare, ChevronRight, Square } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { relativeTime } from "@/lib/format";
import type { ManualReviewItem } from "@/lib/types";
import { reviewSeverityConfig } from "./reviewSeverityConfig";
import { ReviewStatusDot } from "./ReviewStatusDot";

export function ReviewRow({
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
  const { t } = useTranslation();
  const sev = reviewSeverityConfig[review.severity];

  return (
    <div
      className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-all duration-150 border-l-2 cursor-pointer ${
        isActive ? "bg-brand-cyan/[0.08] border-l-brand-cyan" : "border-l-transparent hover:bg-white/[0.03]"
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
          {isSelected ? <CheckSquare className="h-4 w-4 text-brand-cyan" /> : <Square className="h-4 w-4" />}
        </button>
      )}

      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${sev.dotColor}`} />
      <ReviewStatusDot status={review.status} />
      {review.parseError && (
        <span className="flex-shrink-0 text-rose-400" aria-label={t.reviewsPage.parseError.label} title={t.reviewsPage.parseError.detail}>
          <AlertOctagon className="h-3 w-3" />
        </span>
      )}
      <span className="text-sm font-medium text-foreground truncate w-20 flex-shrink-0">
        {review.personaName ?? "Unknown"}
      </span>
      <span className="flex-1 min-w-0 text-sm text-muted truncate">
        {review.content.split("\n")[0]}
      </span>
      <span className="text-sm text-muted-dark flex-shrink-0 tabular-nums">
        {relativeTime(review.createdAt)}
      </span>
      {isActive && <ChevronRight className="h-3 w-3 text-brand-cyan flex-shrink-0" />}
    </div>
  );
}
