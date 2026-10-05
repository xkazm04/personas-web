"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlarmClock, Focus } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import { countOverdue } from "@/lib/review-sla";
import { useReviewStore } from "@/stores/reviewStore";
import ReviewsSplitPane from "./ReviewsSplitPane";
import ReviewsFocusFlow from "./ReviewsFocusFlow";
import { useReviewClock } from "./review-due";
import { useTranslation } from "@/i18n/useTranslation";

export default function ReviewsPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"split" | "focus">("split");
  // One clock for the page: the header count, the split pane's chips and the
  // focus card all read the same `now`.
  const now = useReviewClock();
  const reviews = useReviewStore((s) => s.reviews);
  const policy = useReviewStore((s) => s.escalationPolicy);
  const overdue = useMemo(() => countOverdue(reviews, policy, now), [reviews, policy, now]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-4 flex items-start gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">{t.dashboardUi.manualReviews}</GradientText>
          </h1>
          <p className="mt-1 text-base text-muted-dark">
            {t.dashboardUi.manualReviewsSubtitle}
          </p>
        </div>
        {overdue > 0 && (
          <span
            role="status"
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/15 px-3 py-2 text-sm font-medium tabular-nums text-rose-300"
          >
            <AlarmClock className="h-3.5 w-3.5" aria-hidden />
            {t.reviewsPage.sla.overdueCount.replace("{n}", String(overdue))}
          </span>
        )}
        {mode === "split" && (
          <button
            type="button"
            onClick={() => setMode("focus")}
            className="flex items-center gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-2 text-sm font-medium text-cyan-300 transition-all hover:bg-brand-cyan/15"
          >
            <Focus className="h-3.5 w-3.5" />
            {t.reviewsPage.focus.enter}
          </button>
        )}
      </motion.div>

      <div data-tour-diagram="dashboard-reviews">
        {mode === "split" ? (
          <ReviewsSplitPane now={now} />
        ) : (
          <ReviewsFocusFlow now={now} onExit={() => setMode("split")} />
        )}
      </div>
    </motion.div>
  );
}
