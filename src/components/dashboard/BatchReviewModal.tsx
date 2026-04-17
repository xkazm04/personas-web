"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, X, XCircle } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { MemoryItem } from "@/lib/mock-dashboard-data";

export type BatchDecision = "accept" | "reject";

interface Props {
  open: boolean;
  conflicts: MemoryItem[];
  onClose: () => void;
  onApply: (decisions: Record<string, BatchDecision>) => void;
}

export default function BatchReviewModal({
  open,
  conflicts,
  onClose,
  onApply,
}: Props) {
  const { t } = useTranslation();
  const [decisions, setDecisions] = useState<Record<string, BatchDecision>>({});
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset local decisions whenever the modal transitions open. React 19
  // prev-state pattern — avoids setState-in-effect.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDecisions({});
  }

  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  const pending = Object.keys(decisions).length;
  const modalTitle = t.memoriesPage.conflicts.modalTitle.replace(
    "{n}",
    String(conflicts.length),
  );

  function setDecision(id: string, decision: BatchDecision) {
    setDecisions((prev) => ({ ...prev, [id]: decision }));
  }

  function clearDecision(id: string) {
    setDecisions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="batch-review-title"
            className="relative z-10 flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-glass bg-[#0a0f1a]/95 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-start gap-3 border-b border-glass px-5 py-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="batch-review-title"
                  className="text-base font-semibold text-foreground"
                >
                  {modalTitle}
                </h2>
                <p className="mt-0.5 text-sm text-muted-dark">
                  {t.memoriesPage.conflicts.modalSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.memoriesPage.conflicts.cancel}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-dark transition-colors hover:bg-white/[0.04] hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </header>

            <div className="flex-1 space-y-2 overflow-y-auto p-5">
              {conflicts.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-dark">
                  {t.memoriesPage.conflicts.allResolved}
                </p>
              ) : (
                conflicts.map((item) => {
                  const decision = decisions[item.id];
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-glass bg-white/[0.02] p-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-sm text-muted-dark">
                            {item.persona} · {item.type}
                          </p>
                          {item.conflictReason && (
                            <p className="mt-1.5 text-sm italic text-rose-300/90">
                              {item.conflictReason}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              decision === "accept"
                                ? clearDecision(item.id)
                                : setDecision(item.id, "accept")
                            }
                            aria-pressed={decision === "accept"}
                            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-sm font-medium transition-all ${
                              decision === "accept"
                                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                                : "border-glass-hover bg-white/[0.03] text-muted hover:bg-white/[0.06]"
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            {t.memoriesPage.conflicts.accept}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              decision === "reject"
                                ? clearDecision(item.id)
                                : setDecision(item.id, "reject")
                            }
                            aria-pressed={decision === "reject"}
                            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-sm font-medium transition-all ${
                              decision === "reject"
                                ? "border-rose-500/30 bg-rose-500/15 text-rose-300"
                                : "border-glass-hover bg-white/[0.03] text-muted hover:bg-white/[0.06]"
                            }`}
                          >
                            <XCircle className="h-3 w-3" />
                            {t.memoriesPage.conflicts.reject}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <footer className="flex items-center justify-between gap-2 border-t border-glass px-5 py-3">
              <p className="text-sm text-muted-dark tabular-nums">
                {pending} / {conflicts.length}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
                >
                  {t.memoriesPage.conflicts.cancel}
                </button>
                <button
                  type="button"
                  disabled={pending === 0}
                  onClick={() => onApply(decisions)}
                  className="rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-1.5 text-sm font-medium text-cyan-300 transition-all hover:bg-brand-cyan/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t.memoriesPage.conflicts.apply} ({pending})
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
