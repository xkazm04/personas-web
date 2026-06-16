"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Undo2 } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";

export default function UndoToast({
  message,
  durationMs,
  onUndo,
  onExpire,
}: {
  message: string;
  durationMs: number;
  onUndo: () => void;
  onExpire: () => void;
}) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const totalSeconds = Math.ceil(durationMs / 1000);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [prevTotal, setPrevTotal] = useState(totalSeconds);

  if (totalSeconds !== prevTotal) {
    setPrevTotal(totalSeconds);
    setSecondsLeft(totalSeconds);
  }

  useEffect(() => {
    const timer = setTimeout(onExpire, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onExpire]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 1 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-20 left-1/2 z-[70] -translate-x-1/2"
    >
      <div className="flex w-[min(calc(100vw-2rem),24rem)] flex-col gap-2 rounded-xl border border-glass-hover bg-surface/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground">{message}</span>
          {/* aria-hidden: the live region announces once on appearance; the
              per-second tick would otherwise re-announce every second. */}
          <span aria-hidden="true" className="ml-auto text-xs tabular-nums text-muted-dark">
            {secondsLeft}s
          </span>
          <button
            onClick={onUndo}
            className="flex items-center gap-1 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 text-sm font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20"
          >
            <Undo2 className="h-3 w-3" />
            {t.dashboardUi.undo}
          </button>
        </div>
        <div aria-hidden="true" className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-brand-cyan/50"
            style={
              reducedMotion
                ? { width: `${(secondsLeft / totalSeconds) * 100}%` }
                : {
                    width: "100%",
                    animation: `undo-shrink ${durationMs}ms linear forwards`,
                  }
            }
          />
        </div>
      </div>
    </motion.div>
  );
}
