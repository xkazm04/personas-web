"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";

/**
 * Bottom-anchored confirmation toast for manual persona executions. Mirrors the
 * AuthToast / BulkResultToast pattern (fixed, role=alert, auto-dismiss). The
 * parent owns the message text — it interpolates the persona name — and keys
 * each toast so a fresh one restarts the dismiss timer.
 */
export default function ExecuteToast({
  status,
  message,
  onDismiss,
}: {
  status: "success" | "error";
  message: string;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const isError = status === "error";

  useEffect(() => {
    // Errors linger a little longer so they're not missed.
    const timer = setTimeout(onDismiss, isError ? 7000 : 4000);
    return () => clearTimeout(timer);
  }, [onDismiss, isError]);

  const Icon = isError ? AlertTriangle : CheckCircle2;

  return (
    <motion.div
      role="alert"
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-20 left-1/2 z-[70] -translate-x-1/2"
    >
      <div
        className={`flex w-[min(calc(100vw-2rem),24rem)] items-center gap-3 rounded-xl border bg-surface/95 px-4 py-3 shadow-2xl backdrop-blur-xl ${
          isError ? "border-red-500/30" : "border-emerald-500/30"
        }`}
      >
        <Icon
          className={`h-4 w-4 flex-shrink-0 ${isError ? "text-red-400" : "text-emerald-400"}`}
          aria-hidden="true"
        />
        <span className="min-w-0 text-sm text-foreground">{message}</span>
        <button
          onClick={onDismiss}
          aria-label={t.common.close}
          className="ml-auto flex-shrink-0 rounded-lg p-1.5 text-muted-dark transition-colors hover:text-foreground focus-ring focus-visible:ring-offset-0"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}
