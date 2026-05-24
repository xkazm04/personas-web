"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useTranslation } from "@/i18n/useTranslation";
import type { MemoryItem } from "@/lib/mock-dashboard-data";

import { BatchReviewDiscardDialog } from "./batch-review-modal/BatchReviewDiscardDialog";
import { BatchReviewHeader } from "./batch-review-modal/BatchReviewHeader";
import { ConflictDecisionCard } from "./batch-review-modal/ConflictDecisionCard";

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
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDecisions({});
      setShowDiscardConfirm(false);
    }
  }

  const pending = Object.keys(decisions).length;

  const requestClose = useCallback(() => {
    if (pending > 0) {
      setShowDiscardConfirm(true);
      return;
    }
    onClose();
  }, [pending, onClose]);

  const confirmDiscard = useCallback(() => {
    setShowDiscardConfirm(false);
    onClose();
  }, [onClose]);

  const cancelDiscard = useCallback(() => {
    setShowDiscardConfirm(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (showDiscardConfirm) {
        cancelDiscard();
        return;
      }
      requestClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, showDiscardConfirm, requestClose, cancelDiscard]);

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

  const modalTitle = t.memoriesPage.conflicts.modalTitle.replace(
    "{n}",
    String(conflicts.length),
  );
  const discardBody = t.memoriesPage.conflicts.discardBody.replace(
    "{n}",
    String(pending),
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={requestClose}
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
            <BatchReviewHeader
              title={modalTitle}
              subtitle={t.memoriesPage.conflicts.modalSubtitle}
              cancelLabel={t.memoriesPage.conflicts.cancel}
              onClose={requestClose}
            />

            <div className="flex-1 space-y-2 overflow-y-auto p-5">
              {conflicts.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-dark">
                  {t.memoriesPage.conflicts.allResolved}
                </p>
              ) : (
                conflicts.map((item) => (
                  <ConflictDecisionCard
                    key={item.id}
                    item={item}
                    decision={decisions[item.id]}
                    labels={{
                      accept: t.memoriesPage.conflicts.accept,
                      reject: t.memoriesPage.conflicts.reject,
                    }}
                    onSetDecision={setDecision}
                    onClearDecision={clearDecision}
                  />
                ))
              )}
            </div>

            <footer className="flex items-center justify-between gap-2 border-t border-glass px-5 py-3">
              <p className="text-sm text-muted-dark tabular-nums">
                {pending} / {conflicts.length}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={requestClose}
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

            <AnimatePresence>
              {showDiscardConfirm && (
                <BatchReviewDiscardDialog
                  title={t.memoriesPage.conflicts.discardTitle}
                  body={discardBody}
                  keepLabel={t.memoriesPage.conflicts.discardKeep}
                  confirmLabel={t.memoriesPage.conflicts.discardConfirm}
                  onCancel={cancelDiscard}
                  onConfirm={confirmDiscard}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
