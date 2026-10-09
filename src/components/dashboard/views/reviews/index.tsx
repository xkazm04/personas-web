"use client";

import { useMemo, useState } from "react";
import { AlarmClock, Focus } from "lucide-react";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import GradientText from "@/components/GradientText";
import { countOverdue } from "@/lib/review-sla";
import { useReviewStore } from "@/stores/reviewStore";
import ReviewsSplitPane from "./ReviewsSplitPane";
import ReviewsFocusFlow from "./ReviewsFocusFlow";
import { useReviewClock } from "./review-due";
import { useReviewGate } from "./useReviewGate";
import EscalationFailureNotice from "./EscalationFailureNotice";
import PhoneReviews from "./phone/PhoneReviews";
import ReachabilityNotice from "@/components/dashboard/views/personas/phone/ReachabilityNotice";
import DesktopUnsupportedNote from "@/components/dashboard/views/personas/phone/DesktopUnsupportedNote";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * `/dashboard/reviews`. At phone width it is the pending reviews as cards with
 * big Approve / Reject (PLAN M20, a phone layout of this view, not a new
 * route); from 768 px up it is the split pane / focus flow below. The view is
 * client-only (next/dynamic ssr:false), so choosing by media query cannot
 * mismatch a server render.
 */
export default function ReviewsView() {
  const phone = useIsMobile();
  return phone ? <PhoneReviews /> : <ReviewsPage />;
}

function ReviewsPage() {
  const { t } = useTranslation();
  // In live mode a verdict is a command to the desktop: off unless it is online and this browser paired.
  const gate = useReviewGate();
  const [mode, setMode] = useState<"split" | "focus">("split");
  // One clock for the page: the header count, the split pane's chips and the
  // focus card all read the same `now`.
  const now = useReviewClock();
  const reviews = useReviewStore((s) => s.reviews);
  const policy = useReviewStore((s) => s.escalationPolicy);
  // Desktop plane: the list is not served, so "no reviews" would be false; the note stands in for it.
  const unserved = useReviewStore((s) => s.listNotServed) && reviews.length === 0;
  const overdue = useMemo(() => countOverdue(reviews, policy, now), [reviews, policy, now]);

  return (
    // Tiers: the header is T0 (never animated); the notices and the pane
    // chrome are T1 and cascade in once (CSS, replay-guarded by ViewOutlet).
    <div>
      <header className="mb-4 flex items-start gap-3">
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
        {mode === "split" && !unserved && (
          <button
            type="button"
            onClick={() => setMode("focus")}
            className="flex items-center gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-2 text-sm font-medium text-cyan-300 transition-all hover:bg-brand-cyan/15"
          >
            <Focus className="h-3.5 w-3.5" />
            {t.reviewsPage.focus.enter}
          </button>
        )}
      </header>

      {(unserved || gate.blocked) && (
        <div className={`${ARRIVE} mb-4`} style={arriveAt(0)}>
          {unserved || gate.reach.desktopPlane ? <DesktopUnsupportedNote /> : <ReachabilityNotice reach={gate.reach} />}
        </div>
      )}
      <div className={`${ARRIVE} mb-4 empty:hidden`} style={arriveAt(0)}>
        <EscalationFailureNotice />
      </div>

      {/* Hidden, not unmounted: the split pane owns the poll that notices when the list becomes served. */}
      <div data-tour-diagram="dashboard-reviews" hidden={unserved} className={ARRIVE} style={arriveAt(1)}>
        {mode === "split" ? (
          <ReviewsSplitPane now={now} canDecide={gate.canDecide} />
        ) : (
          <ReviewsFocusFlow now={now} onExit={() => setMode("split")} canDecide={gate.canDecide} />
        )}
      </div>
    </div>
  );
}
