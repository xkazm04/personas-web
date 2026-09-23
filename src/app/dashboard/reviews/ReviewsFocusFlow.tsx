"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { useTranslation } from "@/i18n/useTranslation";
import { useReviewStore } from "@/stores/reviewStore";

import { FocusEmptyState } from "./reviews-focus-flow/FocusEmptyState";
import { FocusProgressHeader } from "./reviews-focus-flow/FocusProgressHeader";
import { FocusReviewCard } from "./reviews-focus-flow/FocusReviewCard";
import { ReviewUndoToast } from "./reviews-split-pane/ReviewsSplitPaneToasts";

/** Keep the walk order for ids still pending; ids this session decided that
 *  came back (undo, failed write) go to the front, new arrivals to the back. */
function reconcileQueue(queue: string[], pendingIds: string[], decided: ReadonlySet<string>): string[] {
  const pending = new Set(pendingIds);
  const kept = queue.filter((id) => pending.has(id));
  const known = new Set(kept);
  const added = pendingIds.filter((id) => !known.has(id));
  return [...added.filter((id) => decided.has(id)), ...kept, ...added.filter((id) => !decided.has(id))];
}

interface Props {
  onExit: () => void;
}

export default function ReviewsFocusFlow({ onExit }: Props) {
  const { t } = useTranslation();
  const reviews = useReviewStore((state) => state.reviews);
  const decide = useReviewStore((state) => state.decide);

  const pendingAll = useMemo(
    () => reviews.filter((review) => review.status === "pending"),
    [reviews],
  );

  const [queue, setQueue] = useState<string[]>(() =>
    pendingAll.map((review) => review.id),
  );
  // Ids decided in this session; one that is pending again (undo / failed
  // write) stops counting as processed and returns to the front of the queue.
  const [decided, setDecided] = useState<ReadonlySet<string>>(() => new Set());
  const [prevPendingKey, setPrevPendingKey] = useState(
    pendingAll.map((review) => review.id).join("|"),
  );

  const nextKey = pendingAll.map((review) => review.id).join("|");
  if (nextKey !== prevPendingKey) {
    setPrevPendingKey(nextKey);
    setQueue((currentQueue) => reconcileQueue(currentQueue, pendingAll.map((review) => review.id), decided));
  }

  // Flush-on-teardown: leaving focus (Esc, route change, /m tab switch)
  // commits the open window instead of dropping it.
  useEffect(() => () => useReviewStore.getState().flushDecisions(), []);

  const currentId = queue[0];
  const current = useMemo(
    () => reviews.find((review) => review.id === currentId) ?? null,
    [reviews, currentId],
  );
  const processedCount = useMemo(
    () => reviews.filter((review) => decided.has(review.id) && review.status !== "pending").length,
    [reviews, decided],
  );
  const total = pendingAll.length + processedCount;
  const position = processedCount + 1;

  // The card leaves the queue because the ledger's overlay makes it
  // non-pending, and returns if the verdict is undone or its write fails.
  // A second verdict inside the 5 s window commits the first (flush-then-arm).
  function handleVerdict(verdict: "approved" | "rejected") {
    if (!current) return;
    const id = current.id;
    if (decide([id], verdict)) setDecided((prev) => new Set(prev).add(id));
  }
  const handleApprove = () => handleVerdict("approved");
  const handleReject = () => handleVerdict("rejected");

  function handleSkip() {
    setQueue((currentQueue) => [...currentQueue.slice(1), currentQueue[0]].filter(Boolean));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't hijack browser/OS chords (Ctrl+R, Cmd+A, …) into destructive
      // approve/reject actions — e.key is still the bare letter with a modifier.
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) return;
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
      <>
        <FocusEmptyState
          emptyLabel={t.reviewsPage.focus.empty}
          exitLabel={t.reviewsPage.focus.exit}
          onExit={onExit}
        />
        <ReviewUndoToast />
      </>
    );
  }

  const progressPct = total > 0 ? (processedCount / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-3">
      <FocusProgressHeader
        progressLabel={progressLabel}
        progressPct={progressPct}
        exitLabel={t.reviewsPage.focus.exit}
        onExit={onExit}
      />

      <AnimatePresence mode="wait">
        <FocusReviewCard
          key={current.id}
          review={current}
          labels={{
            parseErrorDetail: t.reviewsPage.parseError.detail,
            parseErrorLabel: t.reviewsPage.parseError.label,
            content: t.dashboardUi.content,
            approve: t.reviewsPage.focus.approve,
            reject: t.reviewsPage.focus.reject,
            skip: t.reviewsPage.focus.skip,
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onSkip={handleSkip}
        />
      </AnimatePresence>
      <ReviewUndoToast />
    </div>
  );
}
