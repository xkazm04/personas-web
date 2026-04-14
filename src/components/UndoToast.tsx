"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    const timer = setTimeout(onExpire, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onExpire]);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-20 left-1/2 z-[70] -translate-x-1/2"
    >
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-surface/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
        <span className="text-sm text-foreground">{message}</span>
        <button
          onClick={onUndo}
          className="flex items-center gap-1 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 text-sm font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20"
        >
          <Undo2 className="h-3 w-3" />
          Undo
        </button>
        {/* Progress bar — CSS animation, no JS re-renders */}
        <div className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.06]">
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
