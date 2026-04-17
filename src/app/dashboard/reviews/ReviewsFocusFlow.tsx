"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronsRight,
  Info,
  SkipForward,
  Terminal,
  X,
} from "lucide-react";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { useReviewStore } from "@/stores/reviewStore";
import { relativeTime } from "@/lib/format";
import { useTranslation } from "@/i18n/useTranslation";
import type { ReviewSeverity } from "@/lib/types";

const severityConfig: Record<
  ReviewSeverity,
  { Icon: React.ElementType; tone: string; pill: string }
> = {
  critical: {
    Icon: AlertTriangle,
    tone: "text-rose-400",
    pill: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  },
  warning: {
    Icon: AlertCircle,
    tone: "text-amber-400",
    pill: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  info: {
    Icon: Info,
    tone: "text-cyan-400",
    pill: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
  },
};

interface Props {
  onExit: () => void;
}

export default function ReviewsFocusFlow({ onExit }: Props) {
  const { t } = useTranslation();
  const reviews = useReviewStore((s) => s.reviews);
  const resolveReview = useReviewStore((s) => s.resolveReview);

  const pendingAll = useMemo(
    () => reviews.filter((r) => r.status === "pending"),
    [reviews],
  );

  const [queue, setQueue] = useState<string[]>(() =>
    pendingAll.map((r) => r.id),
  );
  const [processedCount, setProcessedCount] = useState(0);
  const [prevPendingKey, setPrevPendingKey] = useState(
    pendingAll.map((r) => r.id).join("|"),
  );

  // Reset queue when pending list changes externally (render-phase pattern).
  const nextKey = pendingAll.map((r) => r.id).join("|");
  if (nextKey !== prevPendingKey) {
    setPrevPendingKey(nextKey);
    setQueue(pendingAll.map((r) => r.id));
    setProcessedCount(0);
  }

  const currentId = queue[0];
  const current = useMemo(
    () => reviews.find((r) => r.id === currentId) ?? null,
    [reviews, currentId],
  );
  const total = pendingAll.length + processedCount;
  const position = processedCount + 1;

  function advance() {
    setQueue((q) => q.slice(1));
    setProcessedCount((n) => n + 1);
  }

  function handleApprove() {
    if (!current) return;
    void resolveReview(current.id, "approved");
    advance();
  }

  function handleReject() {
    if (!current) return;
    void resolveReview(current.id, "rejected");
    advance();
  }

  function handleSkip() {
    setQueue((q) => [...q.slice(1), q[0]].filter(Boolean));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      } else if (e.key === "a" && current) {
        e.preventDefault();
        handleApprove();
      } else if (e.key === "r" && current) {
        e.preventDefault();
        handleReject();
      } else if (e.key === "s" && current) {
        e.preventDefault();
        handleSkip();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, onExit]);

  const progressLabel = t.reviewsPage.focus.progress
    .replace("{n}", String(position))
    .replace("{total}", String(total));

  if (!current) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-glass bg-white/[0.02] p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10">
          <Check className="h-6 w-6 text-emerald-400" />
        </div>
        <p className="mt-4 text-base font-semibold text-foreground">
          {t.reviewsPage.focus.empty}
        </p>
        <button
          type="button"
          onClick={onExit}
          className="mt-4 inline-flex items-center gap-1 rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          {t.reviewsPage.focus.exit}
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    );
  }

  const sev = severityConfig[current.severity];
  const SevIcon = sev.Icon;
  const progressPct = total > 0 ? (processedCount / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-glass-hover bg-white/[0.03] px-3 py-1 text-sm font-medium text-muted tabular-nums">
          {progressLabel}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-brand-cyan/60 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1 rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <X className="h-3 w-3" />
          {t.reviewsPage.focus.exit}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.16 }}
          className="rounded-2xl border border-glass bg-white/[0.02] p-5"
        >
          <div className="flex items-start gap-3">
            <PersonaAvatar
              icon={current.personaIcon}
              color={current.personaColor}
              name={current.personaName}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-foreground">
                  {current.personaName ?? "Unknown Agent"}
                </span>
                <span
                  className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm font-medium ${sev.pill}`}
                >
                  <SevIcon className="h-3 w-3" />
                  {current.severity}
                </span>
                <span className="text-sm text-muted-dark">
                  {relativeTime(current.createdAt)}
                </span>
              </div>

              <div className="mt-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Terminal className="h-3 w-3 text-muted-dark" />
                  <span className="text-sm font-medium uppercase tracking-wider text-muted-dark">
                    Content
                  </span>
                </div>
                <div className="rounded-lg border border-glass bg-black/40 p-3 max-h-[38vh] overflow-auto">
                  <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed text-slate-300">
                    {current.content}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleApprove}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/20"
            >
              <Check className="h-3.5 w-3.5" />
              {t.reviewsPage.focus.approve}
              <kbd className="ml-1 rounded border border-emerald-500/20 bg-emerald-500/5 px-1 py-px text-sm">
                A
              </kbd>
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 transition-all hover:bg-rose-500/20"
            >
              <X className="h-3.5 w-3.5" />
              {t.reviewsPage.focus.reject}
              <kbd className="ml-1 rounded border border-rose-500/20 bg-rose-500/5 px-1 py-px text-sm">
                R
              </kbd>
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="flex items-center gap-1.5 rounded-lg border border-glass-hover bg-white/[0.03] px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <SkipForward className="h-3.5 w-3.5" />
              {t.reviewsPage.focus.skip}
              <kbd className="ml-1 rounded border border-glass-hover bg-white/[0.04] px-1 py-px text-sm">
                S
              </kbd>
            </button>
            <span className="ml-auto flex items-center gap-1 text-sm text-muted-dark">
              <ChevronsRight className="h-3 w-3" />
              {t.reviewsPage.focus.shortcuts}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
