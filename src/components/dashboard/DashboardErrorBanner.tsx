"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";

/**
 * Amber inline banner for non-fatal data-fetch failures on dashboard pages.
 * The page keeps rendering whatever data it has; this strip explains why the
 * rest is missing. Pairs with the hooks that expose `error: string | null`.
 * Pass `onRetry` to offer an inline retry instead of forcing a full reload.
 */
export default function DashboardErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      role="alert"
      className="mb-4 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
    >
      <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
      <p className="flex-1 text-base text-amber-300">
        {t.waitlist.errorGeneric}{" "}
        <span className="text-amber-300/80">{message}</span>
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="group inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-200 transition-colors hover:border-amber-400/50 hover:bg-amber-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
        >
          <RefreshCcw className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-[-90deg]" />
          {t.dashboard.errorBoundary.retry}
        </button>
      )}
    </motion.div>
  );
}
