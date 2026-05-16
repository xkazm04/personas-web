import { useRef, useState } from "react";
import { AlertOctagon, Bookmark, Check, ClipboardCheck, Clock, Loader2, Terminal, X } from "lucide-react";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useTranslation } from "@/i18n/useTranslation";
import { relativeTime } from "@/lib/format";
import type { ManualReviewItem } from "@/lib/types";
import { reviewSeverityConfig } from "./reviewSeverityConfig";

export function ReviewDetailPanel({
  review,
  onResolve,
}: {
  review: ManualReviewItem | null;
  onResolve: (id: string, status: "approved" | "rejected", notes?: string) => void;
}) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState(review?.reviewerNotes ?? "");
  const [resolving, setResolving] = useState(false);
  const [prevReviewKey, setPrevReviewKey] = useState(`${review?.id ?? ""}|${review?.reviewerNotes ?? ""}`);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const nextReviewKey = `${review?.id ?? ""}|${review?.reviewerNotes ?? ""}`;
  if (nextReviewKey !== prevReviewKey) {
    setPrevReviewKey(nextReviewKey);
    setNotes(review?.reviewerNotes ?? "");
    setResolving(false);
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-glass bg-white/[0.03]">
          <ClipboardCheck className="h-6 w-6 text-muted-dark" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">{t.dashboardUi.selectReview}</h3>
        <p className="mt-1.5 text-sm text-muted-dark max-w-[200px]">{t.dashboardUi.selectReviewDesc}</p>
        <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm text-muted-dark">
          <kbd className="rounded border border-glass-hover bg-white/[0.04] px-1.5 py-0.5">J</kbd>
          <span>/ </span>
          <kbd className="rounded border border-glass-hover bg-white/[0.04] px-1.5 py-0.5">K</kbd>
          <span>{t.dashboardUi.navigate}</span>
          <kbd className="rounded border border-glass-hover bg-white/[0.04] px-1.5 py-0.5 ml-2">A</kbd>
          <span>{t.reviewsPage.focus.approve.toLowerCase()}</span>
          <kbd className="rounded border border-glass-hover bg-white/[0.04] px-1.5 py-0.5 ml-2">R</kbd>
          <span>{t.reviewsPage.focus.reject.toLowerCase()}</span>
        </div>
      </div>
    );
  }

  const sev = reviewSeverityConfig[review.severity];
  const SevIcon = sev.icon;
  const isPending = review.status === "pending";

  const handleResolve = async (status: "approved" | "rejected") => {
    setResolving(true);
    try {
      onResolve(review.id, status, notes || undefined);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 border-b border-glass px-4 py-3">
        <div className="flex items-center gap-2">
          <PersonaAvatar icon={review.personaIcon} color={review.personaColor} name={review.personaName} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-foreground">{review.personaName ?? "Unknown Agent"}</span>
              <StatusBadge status={review.status} />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <SevIcon className={`h-3 w-3 ${sev.color}`} />
              <span className={`text-sm font-medium capitalize ${sev.color}`}>{review.severity}</span>
              <span className="text-sm text-muted-dark">{relativeTime(review.createdAt)}</span>
              {review.resolvedAt && (
                <span className="text-sm text-muted-dark">
                  {t.observabilityPage.resolved} {relativeTime(review.resolvedAt)}
                  {review.resolvedBy && ` by ${review.resolvedBy}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <ReviewDetailContent review={review} notes={notes} setNotes={setNotes} notesRef={notesRef} />
      {isPending && <ReviewResolveActions resolving={resolving} onResolve={handleResolve} />}
    </div>
  );
}

function ReviewDetailContent({
  review,
  notes,
  setNotes,
  notesRef,
}: {
  review: ManualReviewItem;
  notes: string;
  setNotes: (value: string) => void;
  notesRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const { t } = useTranslation();
  const isPending = review.status === "pending";

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {review.parseError && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          <AlertOctagon className="h-4 w-4 flex-shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-rose-300">{t.reviewsPage.parseError.label}</div>
            <div className="text-rose-200/80">{t.reviewsPage.parseError.detail}</div>
          </div>
        </div>
      )}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Terminal className="h-3 w-3 text-muted-dark" />
          <span className="text-sm font-medium uppercase tracking-wider text-muted-dark">{t.dashboardUi.content}</span>
        </div>
        <div className="rounded-lg bg-black/40 border border-glass p-3 overflow-auto max-h-[40vh]">
          <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed text-slate-300">{review.content}</pre>
        </div>
      </div>
      {review.executionId && (
        <div className="rounded-lg border border-glass bg-white/[0.02] p-2.5">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-muted-dark" />
            <span className="text-sm font-medium uppercase tracking-wider text-muted-dark">{t.dashboardUi.execution}</span>
            <span className="ml-auto font-mono text-sm text-muted-dark">{review.executionId.slice(0, 16)}</span>
          </div>
        </div>
      )}
      {isPending ? (
        <ReviewNotesEditor notes={notes} setNotes={setNotes} notesRef={notesRef} />
      ) : (
        review.reviewerNotes && <ReviewResolvedNotes notes={review.reviewerNotes} />
      )}
    </div>
  );
}

function ReviewNotesEditor({ notes, setNotes, notesRef }: { notes: string; setNotes: (value: string) => void; notesRef: React.RefObject<HTMLTextAreaElement | null> }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Bookmark className="h-3 w-3 text-muted-dark" />
        <span className="text-sm font-medium uppercase tracking-wider text-muted-dark">{t.dashboardUi.reviewerNotes}</span>
      </div>
      <textarea ref={notesRef} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.dashboardUi.notesPlaceholder} rows={3} className="w-full rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-2 text-base text-foreground placeholder:text-muted-dark/60 focus:border-brand-cyan/30 focus:outline-none resize-none" />
    </div>
  );
}

function ReviewResolvedNotes({ notes }: { notes: string }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Bookmark className="h-3 w-3 text-muted-dark" />
        <span className="text-sm font-medium uppercase tracking-wider text-muted-dark">{t.dashboardUi.reviewerNotes}</span>
      </div>
      <div className="rounded-lg border border-glass bg-white/[0.02] px-3 py-2 text-sm text-muted">{notes}</div>
    </div>
  );
}

function ReviewResolveActions({ resolving, onResolve }: { resolving: boolean; onResolve: (status: "approved" | "rejected") => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex-shrink-0 border-t border-glass px-4 py-3 flex items-center gap-2">
      <button onClick={() => void onResolve("approved")} disabled={resolving} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:opacity-50">
        {resolving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        {t.reviewsPage.focus.approve}
        <kbd className="ml-1 rounded border border-emerald-500/20 bg-emerald-500/5 px-1 py-px text-sm">A</kbd>
      </button>
      <button onClick={() => void onResolve("rejected")} disabled={resolving} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50">
        {resolving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
        {t.reviewsPage.focus.reject}
        <kbd className="ml-1 rounded border border-red-500/20 bg-red-500/5 px-1 py-px text-sm">R</kbd>
      </button>
    </div>
  );
}
