import { motion } from "framer-motion";
import { Check, CheckSquare, MinusSquare, Square, X } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { ManualReviewItem } from "@/lib/types";

export function ReviewsBulkToolbar({
  bulkCount,
  pendingInFiltered,
  bulkResolving,
  clearSelection,
  selectAll,
  handleBulkAction,
}: {
  bulkCount: number;
  pendingInFiltered: ManualReviewItem[];
  bulkResolving: boolean;
  clearSelection: () => void;
  selectAll: () => void;
  handleBulkAction: (status: "approved" | "rejected") => void;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="flex-shrink-0 overflow-hidden border-b border-glass"
    >
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02]">
        <button
          onClick={() => {
            if (bulkCount === pendingInFiltered.length) clearSelection();
            else selectAll();
          }}
          aria-label={t.reviewsPage.selectAllPending}
          aria-pressed={bulkCount > 0 && bulkCount === pendingInFiltered.length}
          className="flex-shrink-0 rounded-sm text-muted-dark hover:text-brand-cyan transition-colors focus-ring focus-visible:ring-offset-0"
        >
          {bulkCount === 0 ? (
            <Square className="h-4 w-4" />
          ) : bulkCount === pendingInFiltered.length ? (
            <CheckSquare className="h-4 w-4 text-brand-cyan" />
          ) : (
            <MinusSquare className="h-4 w-4 text-brand-cyan" />
          )}
        </button>

        {bulkCount > 0 ? (
          <>
            <span className="text-xs text-muted-dark tabular-nums">
              {bulkCount} {t.dashboardUi.selected}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => handleBulkAction("approved")}
                disabled={bulkResolving}
                className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
              >
                <Check className="inline h-3 w-3 mr-1" />
                {t.reviewsPage.focus.approve}
              </button>
              <button
                onClick={() => handleBulkAction("rejected")}
                disabled={bulkResolving}
                className="rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
              >
                <X className="inline h-3 w-3 mr-1" />
                {t.reviewsPage.focus.reject}
              </button>
              <button onClick={clearSelection} className="rounded-md px-2 py-1 text-xs text-muted-dark hover:text-foreground transition-colors">
                {t.common.cancel}
              </button>
            </div>
          </>
        ) : (
          <span className="text-xs text-muted-dark">{t.dashboardUi.selectReviewsBulk}</span>
        )}
      </div>
    </motion.div>
  );
}
