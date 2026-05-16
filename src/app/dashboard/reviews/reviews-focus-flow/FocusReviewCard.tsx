import { motion } from "framer-motion";
import {
  AlertOctagon,
  Check,
  ChevronsRight,
  SkipForward,
  Terminal,
  X,
} from "lucide-react";

import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { relativeTime } from "@/lib/format";
import type { ManualReviewItem } from "@/lib/types";

import { focusSeverityConfig } from "./focusSeverityConfig";

export function FocusReviewCard({
  review,
  labels,
  onApprove,
  onReject,
  onSkip,
}: {
  review: ManualReviewItem;
  labels: {
    parseErrorDetail: string;
    parseErrorLabel: string;
    content: string;
    approve: string;
    reject: string;
    skip: string;
    shortcuts: string;
  };
  onApprove: () => void;
  onReject: () => void;
  onSkip: () => void;
}) {
  const severity = focusSeverityConfig[review.severity];
  const SeverityIcon = severity.Icon;

  return (
    <motion.div
      key={review.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.16 }}
      className="rounded-2xl border border-glass bg-white/[0.02] p-5"
    >
      <div className="flex items-start gap-3">
        <PersonaAvatar
          icon={review.personaIcon}
          color={review.personaColor}
          name={review.personaName}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-foreground">
              {review.personaName ?? "Unknown Agent"}
            </span>
            <span
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm font-medium ${severity.pill}`}
            >
              <SeverityIcon className="h-3 w-3" />
              {review.severity}
            </span>
            {review.parseError && (
              <span
                className="flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-sm font-medium text-rose-300"
                title={labels.parseErrorDetail}
              >
                <AlertOctagon className="h-3 w-3" />
                {labels.parseErrorLabel}
              </span>
            )}
            <span className="text-sm text-muted-dark">
              {relativeTime(review.createdAt)}
            </span>
          </div>

          {review.parseError && (
            <p role="alert" className="mt-2 text-sm text-rose-200/90">
              {labels.parseErrorDetail}
            </p>
          )}

          <div className="mt-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Terminal className="h-3 w-3 text-muted-dark" />
              <span className="text-sm font-medium uppercase tracking-wider text-muted-dark">
                {labels.content}
              </span>
            </div>
            <div className="rounded-lg border border-glass bg-black/40 p-3 max-h-[38vh] overflow-auto">
              <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed text-slate-300">
                {review.content}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onApprove}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20"
        >
          <Check className="h-3.5 w-3.5" />
          {labels.approve}
          <kbd className="ml-1 rounded border border-emerald-500/20 bg-emerald-500/5 px-1 py-px text-sm">
            A
          </kbd>
        </button>
        <button
          type="button"
          onClick={onReject}
          className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 transition-all hover:bg-rose-500/20"
        >
          <X className="h-3.5 w-3.5" />
          {labels.reject}
          <kbd className="ml-1 rounded border border-rose-500/20 bg-rose-500/5 px-1 py-px text-sm">
            R
          </kbd>
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="flex items-center gap-1.5 rounded-lg border border-glass-hover bg-white/[0.03] px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <SkipForward className="h-3.5 w-3.5" />
          {labels.skip}
          <kbd className="ml-1 rounded border border-glass-hover bg-white/[0.04] px-1 py-px text-sm">
            S
          </kbd>
        </button>
        <span className="ml-auto flex items-center gap-1 text-sm text-muted-dark">
          <ChevronsRight className="h-3 w-3" />
          {labels.shortcuts}
        </span>
      </div>
    </motion.div>
  );
}
