"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useStillMotion } from "@/hooks/useStillMotion";
import { useTranslation } from "@/i18n/useTranslation";
import { formatDue, slaState, type SlaPhase } from "@/lib/review-sla";
import type { ManualReviewItem } from "@/lib/types";
import { useReviewStore } from "@/stores/reviewStore";

const TICK_MS = 30_000;

/**
 * The review queue's one "now". Sampled lazily on mount, then every 30 s while
 * the tab is visible (an ambient loop: a hidden tab stops it, and the value is
 * re-sampled on return). Under reduced motion the countdown is static: sampled
 * on mount and on each return to the tab, never ticking in place.
 *
 * `enabled: false` samples once and never ticks, for a surface handed a `now`
 * by its parent (so the page runs a single clock).
 */
export function useReviewClock(enabled = true): number {
  const [now, setNow] = useState(() => Date.now());
  const hidden = usePageVisibility();
  const still = useStillMotion();
  const live = enabled && !hidden;
  useEffect(() => {
    if (!live) return;
    const tick = () => setNow(Date.now());
    const resample = setTimeout(tick, 0);
    const interval = still ? null : setInterval(tick, TICK_MS);
    return () => {
      clearTimeout(resample);
      if (interval) clearInterval(interval);
    };
  }, [live, still]);
  return now;
}

// design.md severity pill recipe: rose (/30, /15) for a breach, amber for due soon.
const PHASE_TONE: Record<SlaPhase, string> = {
  overdue: "border-rose-500/30 bg-rose-500/15 text-rose-300",
  "due-soon": "border-amber-500/25 bg-amber-500/10 text-amber-300",
  ok: "border-glass bg-white/[0.02] text-muted-dark",
};

/** SLA chip for a pending review; renders nothing for a decided one. */
export function DueChip({ review, now, compact = false }: { review: ManualReviewItem; now: number; compact?: boolean }) {
  const { t, language } = useTranslation();
  const policy = useReviewStore((s) => s.escalationPolicy);
  if (review.status !== "pending") return null;
  const sla = slaState(review, policy, now);
  const when = formatDue(sla.remainingMs, language, compact ? "short" : "long");
  const label = (sla.phase === "overdue" ? t.reviewsPage.sla.wasDue : t.reviewsPage.sla.due).replace("{when}", when);
  return (
    <span
      data-sla-phase={sla.phase}
      className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-sm font-medium tabular-nums whitespace-nowrap ${PHASE_TONE[sla.phase]}`}
    >
      <Clock className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}
