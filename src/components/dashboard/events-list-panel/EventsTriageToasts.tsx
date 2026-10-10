"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ListChecks, X } from "lucide-react";
import UndoToast from "@/components/UndoToast";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import type { DeadLetterFailureReason } from "@/lib/deadLetterTriage";
import { useEventStore, type DeadLetterOutcome } from "@/stores/eventStore";

/**
 * The dead letter's verdict feedback: the commit window as an undo toast,
 * then, for a run that left rows unresolved, which ones and why, with one
 * click to select them again. Client state only (both start null), so the
 * server never renders either.
 */
export function EventsTriageToasts({ onReselect }: { onReselect: (ids: string[]) => void }) {
  const { t } = useTranslation();
  const open = useEventStore((s) => s.ledger.window);
  const refusal = useEventStore((s) => s.refusal);
  const lastOutcome = useEventStore((s) => s.lastOutcome);
  const undoDecision = useEventStore((s) => s.undoDecision);
  const dismissOutcome = useEventStore((s) => s.dismissOutcome);
  const copy = t.eventsPage.triage;
  return (
    <AnimatePresence>
      {open ? (
        <UndoToast
          key={`undo-${open.batchId}`}
          message={(open.verdict === "retry" ? copy.armedRetry : copy.armedDiscard).replace("{count}", String(open.ids.length))}
          deadline={open.deadline}
          onUndo={undoDecision}
          notice={refusal?.reason === "overlap" && refusal.batchId === open.batchId ? copy.refusedOverlap : undefined}
        />
      ) : lastOutcome ? (
        <OutcomeToast
          key={`outcome-${lastOutcome.batchId}`}
          outcome={lastOutcome}
          onReselect={() => {
            onReselect(lastOutcome.reselect);
            dismissOutcome();
          }}
          onDismiss={dismissOutcome}
        />
      ) : null}
    </AnimatePresence>
  );
}

function OutcomeToast({ outcome, onReselect, onDismiss }: { outcome: DeadLetterOutcome; onReselect: () => void; onDismiss: () => void }) {
  const { t, language } = useTranslation();
  const still = useStillMotion();
  const copy = t.eventsPage.triage;
  const failed = outcome.reselect.length;
  const reasons = useMemo(() => {
    const parts = (Object.entries(outcome.failedByReason) as [DeadLetterFailureReason, string[]][]).map(
      ([reason, ids]) => `${copy.reasons[reason]} (${ids.length})`,
    );
    return new Intl.ListFormat(language, { style: "narrow", type: "unit" }).format(parts);
  }, [outcome.failedByReason, copy.reasons, language]);
  const headline = (outcome.verb === "retry" ? copy.outcomeRetry : copy.outcomeDiscard)
    .replace("{ok}", String(outcome.ok))
    .replace("{failed}", String(failed));
  return (
    <motion.div
      role="alert"
      initial={still ? false : { y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={still ? { opacity: 0 } : { y: 80, opacity: 0 }}
      className="fixed bottom-20 left-1/2 z-[70] -translate-x-1/2"
    >
      <div className="flex w-[min(calc(100vw-2rem),26rem)] items-start gap-3 rounded-xl border border-rose-500/30 bg-surface/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{headline}</span>
          <span className="text-sm text-muted-dark">{reasons}</span>
        </div>
        <div className="ml-auto flex flex-shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onReselect}
            className="flex min-h-[44px] items-center gap-1 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 text-sm font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20 md:min-h-0"
          >
            <ListChecks aria-hidden="true" className="h-3 w-3" />
            {copy.reselect.replace("{count}", String(failed))}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t.common.close}
            className="rounded-lg p-1.5 text-muted-dark transition-colors hover:text-foreground"
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
