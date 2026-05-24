import { AnimatePresence } from "framer-motion";
import BulkProgressBar from "@/components/BulkProgressBar";
import BulkResultToast from "@/components/BulkResultToast";
import ConfirmDialog from "@/components/ConfirmDialog";
import UndoToast from "@/components/UndoToast";

export function ReviewsSplitPaneToasts({
  undoState,
  handleUndo,
  handleUndoExpire,
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
  undoState: { message: string } | null;
  handleUndo: () => void;
  handleUndoExpire: () => void;
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
  return (
    <>
      <AnimatePresence>
        {undoState && <UndoToast message={undoState.message} durationMs={5000} onUndo={handleUndo} onExpire={handleUndoExpire} />}
      </AnimatePresence>
      <AnimatePresence>
        {bulkProgress && !undoState && (
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
