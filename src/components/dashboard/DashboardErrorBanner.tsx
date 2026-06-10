"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";

/**
 * Amber inline banner for non-fatal data-fetch failures on dashboard pages.
 * The page keeps rendering whatever data it has; this strip explains why the
 * rest is missing. Pairs with the hooks that expose `error: string | null`.
 */
export default function DashboardErrorBanner({ message }: { message: string }) {
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
      <p className="text-base text-amber-300">
        {t.waitlist.errorGeneric}{" "}
        <span className="text-amber-300/80">{message}</span>
      </p>
    </motion.div>
  );
}
