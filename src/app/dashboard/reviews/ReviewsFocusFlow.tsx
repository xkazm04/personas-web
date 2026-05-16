"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { useTranslation } from "@/i18n/useTranslation";
import { useReviewStore } from "@/stores/reviewStore";

import { FocusEmptyState } from "./reviews-focus-flow/FocusEmptyState";
import { FocusProgressHeader } from "./reviews-focus-flow/FocusProgressHeader";
import { FocusReviewCard } from "./reviews-focus-flow/FocusReviewCard";

interface Props {
  onExit: () => void;
}

export default function ReviewsFocusFlow({ onExit }: Props) {
  const { t } = useTranslation();
  const reviews = useReviewStore((state) => state.reviews);
  const resolveReview = useReviewStore((state) => state.resolveReview);

  const pendingAll = useMemo(
    () => reviews.filter((review) => review.status === "pending"),
    [reviews],
  );

  const [queue, setQueue] = useState<string[]>(() =>
    pendingAll.map((review) => review.id),
  );
  const [processedCount, setProcessedCount] = useState(0);
  const [prevPendingKey, setPrevPendingKey] = useState(
    pendingAll.map((review) => review.id).join("|"),
  );

  const nextKey = pendingAll.map((review) => review.id).join("|");
  if (nextKey !== prevPendingKey) {
    setPrevPendingKey(nextKey);
    setQueue(pendingAll.map((review) => review.id));
    setProcessedCount(0);
  }

  const currentId = queue[0];
  const current = useMemo(
    () => reviews.find((review) => review.id === currentId) ?? null,
    [reviews, currentId],
  );
  const total = pendingAll.length + processedCount;
  const position = processedCount + 1;

  function advance() {
    setQueue((currentQueue) => currentQueue.slice(1));
    setProcessedCount((count) => count + 1);
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
    setQueue((currentQueue) => [...currentQueue.slice(1), currentQueue[0]].filter(Boolean));
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
      <FocusEmptyState
        emptyLabel={t.reviewsPage.focus.empty}
        exitLabel={t.reviewsPage.focus.exit}
        onExit={onExit}
      />
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
            shortcuts: t.reviewsPage.focus.shortcuts,
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onSkip={handleSkip}
        />
      </AnimatePresence>
    </div>
  );
}
