import { ChevronLeft, ChevronRight } from "lucide-react";

import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";

export function MessagesPagination({
  arriveIndex,
  pageLabel,
  isFirstPage,
  isLastPage,
  labels,
  onPrevious,
  onNext,
}: {
  /** T1 cascade slot: after the rows it pages. */
  arriveIndex: number;
  pageLabel: string;
  isFirstPage: boolean;
  isLastPage: boolean;
  labels: { prev: string; next: string };
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div
      className={`${ARRIVE} mt-4 flex items-center justify-between`}
      style={arriveAt(arriveIndex)}
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstPage}
        className="flex items-center gap-1 rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-3 w-3" />
        {labels.prev}
      </button>
      <span className="text-sm text-muted-dark tabular-nums">{pageLabel}</span>
      <button
        type="button"
        onClick={onNext}
        disabled={isLastPage}
        className="flex items-center gap-1 rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {labels.next}
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}
