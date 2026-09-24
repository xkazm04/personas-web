"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Undo2 } from "lucide-react";

import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Display of a commit window's deadline. It owns no clock that decides
 * anything: the caller's store commits at `deadline`; this only counts down.
 * Remount it (via `key`) for each new window.
 */
export default function UndoToast({
  message,
  deadline,
  onUndo,
  notice,
}: {
  message: string;
  /** Epoch ms at which the window commits. */
  deadline: number;
  onUndo: () => void;
  /** Optional second line, e.g. why a newer action was refused. */
  notice?: string;
}) {
  const { t, language } = useTranslation();
  // "4s" / "4 s" / "4秒": the unit comes from Intl, not a locale string.
  const seconds = useMemo(
    () => new Intl.NumberFormat(language, { style: "unit", unit: "second", unitDisplay: "narrow" }),
    [language],
  );
  const still = useStillMotion();
  // Captured once at mount (lazy initializers may be impure).
  const [durationMs] = useState(() => Math.max(0, deadline - Date.now()));
  const totalSeconds = Math.max(1, Math.ceil(durationMs / 1000));
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

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
            {seconds.format(secondsLeft)}
          </span>
          <button
            onClick={onUndo}
            className="flex items-center gap-1 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 text-sm font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20"
          >
            <Undo2 className="h-3 w-3" />
            {t.dashboardUi.undo}
          </button>
        </div>
        {notice && <p className="text-sm text-amber-300">{notice}</p>}
        <div aria-hidden="true" className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-brand-cyan/50"
            style={
              still
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
