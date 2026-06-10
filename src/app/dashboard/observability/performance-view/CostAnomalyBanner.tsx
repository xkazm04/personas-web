import { useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import type { CostAnomaly } from "./performanceViewTypes";

export function CostAnomalyBanner({
  anomalies,
  label,
  dismissLabel,
}: {
  anomalies: CostAnomaly[];
  label: string;
  dismissLabel: string;
}) {
  const reducedMotion = useReducedMotion();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = anomalies.filter((anomaly) => !dismissed.has(anomaly.date));
  const handleDismiss = useCallback((date: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(date);
      return next;
    });
  }, []);

  if (visible.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      <AnimatePresence mode="popLayout">
        {visible.map((anomaly) => (
          <motion.div
            key={anomaly.date}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/8 via-orange-500/5 to-amber-500/8 px-4 py-3"
          >
            <motion.div
              animate={reducedMotion ? undefined : { scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
            </motion.div>
            <p className="flex-1 text-base text-amber-300">
              {label} <span className="font-medium">{anomaly.date}</span>:{" "}
              <span className="font-semibold text-amber-200">${anomaly.cost.toFixed(2)}</span>{" "}
              <span className="text-amber-400/90">({"σ"} {anomaly.deviation.toFixed(1)})</span>
            </p>
            <button
              onClick={() => handleDismiss(anomaly.date)}
              aria-label={dismissLabel}
              className="rounded-lg p-1 text-amber-400/70 hover:bg-amber-500/10 hover:text-amber-400 transition-colors cursor-pointer focus-ring focus-visible:ring-offset-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
