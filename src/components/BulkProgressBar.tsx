"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function BulkProgressBar({
  done,
  total,
  failed = 0,
  label,
}: {
  done: number;
  total: number;
  failed?: number;
  label: string;
}) {
  const successPct = total > 0 ? Math.round(((done - failed) / total) * 100) : 0;
  const failPct = total > 0 ? Math.round((failed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-20 left-1/2 z-[70] -translate-x-1/2"
    >
      <div className="flex flex-col gap-2 rounded-xl border border-glass-hover bg-surface/95 backdrop-blur-xl px-4 py-3 shadow-2xl min-w-[280px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-cyan" />
          <span className="text-sm text-foreground">{label}</span>
          <span className="ml-auto flex items-center gap-1.5 text-xs tabular-nums text-muted-dark">
            {done}/{total}
            {failed > 0 && (
              <span className="text-red-400">({failed} failed)</span>
            )}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] flex">
          <motion.div
            className="h-full bg-brand-cyan/60"
            style={{ borderRadius: failPct > 0 ? "9999px 0 0 9999px" : "9999px" }}
            initial={{ width: 0 }}
            animate={{ width: `${successPct}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
          {failPct > 0 && (
            <motion.div
              className="h-full bg-red-500/60"
              style={{ borderRadius: "0 9999px 9999px 0" }}
              initial={{ width: 0 }}
              animate={{ width: `${failPct}%` }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
