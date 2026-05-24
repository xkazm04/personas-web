import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { fadeUp } from "@/lib/animations";

export function MessagesPagination({
  pageLabel,
  isFirstPage,
  isLastPage,
  labels,
  onPrevious,
  onNext,
}: {
  pageLabel: string;
  isFirstPage: boolean;
  isLastPage: boolean;
  labels: { prev: string; next: string };
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-4 flex items-center justify-between"
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
    </motion.div>
  );
}
