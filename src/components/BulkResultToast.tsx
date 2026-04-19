"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, X, RotateCw } from "lucide-react";

export default function BulkResultToast({
  total,
  successCount,
  failedCount,
  action,
  onDismiss,
  onRetry,
}: {
  total: number;
  successCount: number;
  failedCount: number;
  action: "approved" | "rejected";
  onDismiss: () => void;
  onRetry: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 10_000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const verb = action === "approved" ? "approve" : "reject";

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-20 left-1/2 z-[70] -translate-x-1/2"
    >
      <div className="flex flex-col gap-2 rounded-xl border border-red-500/30 bg-surface/95 backdrop-blur-xl px-4 py-3 shadow-2xl min-w-[300px]">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium text-foreground">
              {failedCount} of {total} failed to {verb}
            </span>
            {successCount > 0 && (
              <span className="text-xs text-muted-dark">
                {successCount} succeeded &middot; failed items re-selected
              </span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={onRetry}
              className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 transition-all hover:bg-amber-500/20"
            >
              <RotateCw className="h-3 w-3" />
              Retry
            </button>
            <button
              onClick={onDismiss}
              className="rounded-lg p-1.5 text-muted-dark hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
