"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Undo2 } from "lucide-react";

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
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-20 left-1/2 z-[70] -translate-x-1/2"
    >
      <div className="flex flex-col gap-2 rounded-xl border border-glass-hover bg-surface/95 backdrop-blur-xl px-4 py-3 shadow-2xl min-w-[280px]">
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground">{message}</span>
          <span className="ml-auto text-xs tabular-nums text-muted-dark">
            {secondsLeft}s
          </span>
          <button
            onClick={onUndo}
            className="flex items-center gap-1 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 text-sm font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20"
          >
            <Undo2 className="h-3 w-3" />
            Undo
          </button>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-brand-cyan/50"
            style={{
              width: "100%",
              animation: `undo-shrink ${durationMs}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
