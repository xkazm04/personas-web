import { AnimatePresence } from "framer-motion";
import BulkProgressBar from "@/components/BulkProgressBar";
import BulkResultToast from "@/components/BulkResultToast";
import ConfirmDialog from "@/components/ConfirmDialog";
import UndoToast from "@/components/UndoToast";
import { useTranslation } from "@/i18n/useTranslation";
import { useReviewStore } from "@/stores/reviewStore";

/** The decision ledger's open window, shown as an undo toast. Mounted by both
 *  the split pane and the focus flow (desktop and /m), so every verdict path
 *  shows the same 5 s undo. */
export function ReviewUndoToast() {
  const { t } = useTranslation();
  const open = useReviewStore((s) => s.ledger.window);
  const refusal = useReviewStore((s) => s.refusal);
  const undoDecision = useReviewStore((s) => s.undoDecision);
  const copy = t.reviewsPage.undo;
  return (
    <AnimatePresence>
      {open && (
        <UndoToast
          key={open.batchId}
          message={(open.verdict === "approved" ? copy.approved : copy.rejected).replace("{count}", String(open.ids.length))}
          deadline={open.deadline}
          onUndo={undoDecision}
          notice={refusal?.reason === "overlap" && refusal.batchId === open.batchId ? copy.refused : undefined}
        />
      )}
    </AnimatePresence>
  );
}

export function ReviewsSplitPaneToasts({
  bulkProgress,
  bulkResult,
  dismissBulkResult,
  retryFailed,
  showRejectConfirm,
  bulkCount,
  handleBulkRejectConfirm,
  setShowRejectConfirm,
  rejectTitle,
  rejectBody,
}: {
  bulkProgress: { done: number; total: number; failed: number } | null;
  bulkResult: { total: number; successCount: number; failedIds: string[]; status: "approved" | "rejected" } | null;
  dismissBulkResult: () => void;
  retryFailed: () => void;
  showRejectConfirm: boolean;
  bulkCount: number;
  handleBulkRejectConfirm: () => void;
  setShowRejectConfirm: (open: boolean) => void;
  rejectTitle: string;
  rejectBody: string;
}) {
  const windowOpen = useReviewStore((s) => s.ledger.window !== null);
  return (
    <>
      <ReviewUndoToast />
      <AnimatePresence>
        {bulkProgress && !windowOpen && (
          <BulkProgressBar
            done={bulkProgress.done}
            total={bulkProgress.total}
            failed={bulkProgress.failed}
            label={`Processing ${bulkProgress.total} review${bulkProgress.total !== 1 ? "s" : ""}`}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {bulkResult && bulkResult.failedIds.length > 0 && (
          <BulkResultToast
            total={bulkResult.total}
            successCount={bulkResult.successCount}
            failedCount={bulkResult.failedIds.length}
            action={bulkResult.status}
            onDismiss={dismissBulkResult}
            onRetry={retryFailed}
          />
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={showRejectConfirm}
        title={rejectTitle}
        confirmLabel={`Reject ${bulkCount} review${bulkCount !== 1 ? "s" : ""}`}
        onConfirm={handleBulkRejectConfirm}
        onCancel={() => setShowRejectConfirm(false)}
      >
        {rejectBody.replace("{count}", String(bulkCount)).replace("{plural}", bulkCount !== 1 ? "s" : "")}
      </ConfirmDialog>
    </>
  );
}
