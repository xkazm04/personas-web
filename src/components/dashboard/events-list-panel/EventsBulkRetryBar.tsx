import { AnimatePresence, motion } from "framer-motion";
import { Loader2, RotateCcw } from "lucide-react";
import type { PersonaEvent } from "@/lib/types";
import type { EventPanelLabels } from "./eventPanelTypes";

export function EventsBulkRetryBar({
  selectedIds,
  visibleEvents,
  setSelectedIds,
  bulkRetrying,
  onBulkRetry,
  labels,
}: {
  selectedIds: Set<string>;
  visibleEvents: PersonaEvent[];
  setSelectedIds: (ids: Set<string>) => void;
  bulkRetrying: boolean;
  onBulkRetry: () => void;
  labels: EventPanelLabels;
}) {
  return (
    <AnimatePresence>
      {selectedIds.size > 0 && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed inset-x-0 bottom-0 z-50 border-t border-glass-hover bg-background/95 backdrop-blur-xl pb-safe">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="text-base text-foreground">
                {selectedIds.size} {selectedIds.size === 1 ? labels.eventsPage.failedEventSelected : labels.eventsPage.failedEventsSelected}
              </span>
              <button onClick={() => setSelectedIds(new Set(visibleEvents.filter((event) => event.status === "failed").map((event) => event.id)))} className="text-sm text-brand-cyan hover:underline">
                {labels.eventsPage.selectAllFailed}
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="text-sm text-muted-dark hover:text-muted">
                {labels.eventsPage.clearFilters}
              </button>
            </div>
            <button onClick={onBulkRetry} disabled={bulkRetrying} className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition-all hover:bg-amber-500/20 disabled:opacity-50">
              {bulkRetrying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
              {labels.eventsPage.retryAll}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
