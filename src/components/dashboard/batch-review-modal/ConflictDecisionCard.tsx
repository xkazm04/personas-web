import { Check, XCircle } from "lucide-react";

import type { MemoryItem } from "@/lib/mock-dashboard-data";
import type { BatchDecision } from "../BatchReviewModal";

export function ConflictDecisionCard({
  item,
  decision,
  labels,
  onSetDecision,
  onClearDecision,
}: {
  item: MemoryItem;
  decision?: BatchDecision;
  labels: { accept: string; reject: string };
  onSetDecision: (id: string, decision: BatchDecision) => void;
  onClearDecision: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-glass bg-white/[0.02] p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {item.title}
          </p>
          <p className="mt-0.5 text-sm text-muted-dark">
            {item.persona} - {item.type}
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
                ? onClearDecision(item.id)
                : onSetDecision(item.id, "accept")
            }
            aria-pressed={decision === "accept"}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-sm font-medium transition-all ${
              decision === "accept"
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                : "border-glass-hover bg-white/[0.03] text-muted hover:bg-white/[0.06]"
            }`}
          >
            <Check className="h-3 w-3" />
            {labels.accept}
          </button>
          <button
            type="button"
            onClick={() =>
              decision === "reject"
                ? onClearDecision(item.id)
                : onSetDecision(item.id, "reject")
            }
            aria-pressed={decision === "reject"}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-sm font-medium transition-all ${
              decision === "reject"
                ? "border-rose-500/30 bg-rose-500/15 text-rose-300"
                : "border-glass-hover bg-white/[0.03] text-muted hover:bg-white/[0.06]"
            }`}
          >
            <XCircle className="h-3 w-3" />
            {labels.reject}
          </button>
        </div>
      </div>
    </div>
  );
}
