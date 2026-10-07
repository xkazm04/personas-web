"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Loader2 } from "lucide-react";
import ReachabilityNotice from "@/components/dashboard/views/personas/phone/ReachabilityNotice";
import DesktopUnsupportedNote from "@/components/dashboard/views/personas/phone/DesktopUnsupportedNote";
import CommandChip from "@/components/dashboard/views/personas/phone/CommandChip";
import { useTranslation } from "@/i18n/useTranslation";
import { mobileCopy } from "@/i18n/pending/mobile";
import { usePolling } from "@/hooks/usePolling";
import { orderByDue } from "@/lib/review-sla";
import { useAuthStore } from "@/stores/authStore";
import { useCommandStore } from "@/stores/commandStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useReviewStore } from "@/stores/reviewStore";
import { useReviewClock } from "../review-due";
import { ReviewUndoToast } from "../reviews-split-pane/ReviewsSplitPaneToasts";
import { useReviewGate } from "../useReviewGate";
import EscalationFailureNotice from "../EscalationFailureNotice";
import PhoneReviewCard, { splitReviewContent } from "./PhoneReviewCard";

/** How many of this visit's verdicts stay listed under "Decided here". */
const DECIDED_SHOWN = 8;

/**
 * `/dashboard/reviews` at phone width (PLAN M20, PHASE2-SPEC.md 1.6 + 6.2):
 * the pending reviews as cards, most overdue first, each with Approve /
 * Reject (48 px) and an optional note. A verdict opens the store's 5 s undo
 * window (the toast above the bottom nav); then, on a command plane, it is a
 * `review_decide` to the desktop, and the card moves under "Decided here"
 * with its chip (Sending... -> Working... -> Done). A verdict that fails comes
 * back pending with the failure on its chip. In live mode the buttons follow
 * the online gate of the review's desktop; the reachability notice says why
 * when they are off.
 */
export default function PhoneReviews() {
  const { t } = useTranslation();
  const copy = mobileCopy.reviews;
  const demo = useAuthStore((s) => s.isDemo);
  const { reach, canDecide, blocked } = useReviewGate();
  const reviews = useReviewStore((s) => s.reviews);
  const loading = useReviewStore((s) => s.reviewsLoading);
  const policy = useReviewStore((s) => s.escalationPolicy);
  const reviewCommands = useReviewStore((s) => s.reviewCommands);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);
  const inflight = useCommandStore((s) => s.inflight);
  const now = useReviewClock();
  // This visit's verdicts, newest first (set by the tap, never by an effect).
  const [decidedIds, setDecidedIds] = useState<readonly string[]>([]);
  // "Loading" only until the first fetch settles, so a later poll never flashes it.
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [prevLoading, setPrevLoading] = useState(loading);
  if (loading !== prevLoading) {
    setPrevLoading(loading);
    if (!loading) setFirstLoadDone(true);
  }

  useEffect(() => {
    void usePersonaStore.getState().fetchPersonas();
  }, []);
  usePolling(fetchReviews, 15_000, true);
  // Leaving the view commits an open window rather than dropping it.
  useEffect(() => () => useReviewStore.getState().flushDecisions(), []);

  const pending = useMemo(() => orderByDue(reviews.filter((r) => r.status === "pending"), policy, now), [reviews, policy, now]);
  const decided = useMemo(() => {
    const byId = new Map(reviews.map((r) => [r.id, r]));
    return decidedIds
      .map((id) => byId.get(id))
      .filter((r): r is NonNullable<typeof r> => r !== undefined && r.status !== "pending")
      .slice(0, DECIDED_SHOWN);
  }, [reviews, decidedIds]);

  const commandFor = (id: string) => {
    const commandId = reviewCommands[id];
    return commandId ? (inflight[commandId] ?? null) : null;
  };

  const onDecide = (id: string, verdict: "approved" | "rejected") => {
    if (!useReviewStore.getState().decide([id], verdict)) return;
    setDecidedIds((prev) => [id, ...prev.filter((x) => x !== id)]);
  };

  const waiting = !firstLoadDone && reviews.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-5 pb-28">
      <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
        <ClipboardCheck aria-hidden className="h-5 w-5 text-brand-cyan" />
        {t.dashboardUi.manualReviews}
      </h1>

      {reach.ready && reach.commandPlane && <ReachabilityNotice reach={reach} />}
      {blocked && reach.desktopPlane && <DesktopUnsupportedNote />}
      <EscalationFailureNotice />

      {waiting ? (
        <p className="flex items-center gap-2 text-sm text-muted-dark" aria-busy="true">
          <Loader2 aria-hidden className="h-4 w-4 motion-safe:animate-spin" />
          {copy.loading}
        </p>
      ) : pending.length === 0 ? (
        <p data-reviews-empty className="rounded-2xl border border-glass bg-white/[0.02] p-4 text-sm text-muted">
          {t.reviewsPage.focus.empty}
        </p>
      ) : (
        <ul aria-label={copy.pendingLabel} data-reviews-pending className="flex flex-col gap-3">
          {pending.map((review) => {
            const command = commandFor(review.id);
            return (
              <PhoneReviewCard
                key={review.id}
                review={review}
                now={now}
                canDecide={canDecide(review)}
                // A command shows here only once it came back without a verdict.
                command={command && command.status !== "completed" ? command : null}
                onDecide={onDecide}
              />
            );
          })}
        </ul>
      )}

      {decided.length > 0 && (
        <section aria-labelledby="reviews-decided-here" className="flex flex-col gap-2">
          <h2 id="reviews-decided-here" className="text-sm font-medium uppercase tracking-wider text-muted-dark">
            {copy.decidedTitle}
          </h2>
          <ul data-reviews-decided className="flex flex-col gap-2">
            {decided.map((review) => {
              const command = commandFor(review.id);
              return (
                <li
                  key={review.id}
                  data-decided-card={review.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-glass bg-white/[0.02] p-3"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">{splitReviewContent(review.content).title}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-sm font-medium ${
                      review.status === "approved"
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                    }`}
                  >
                    {review.status === "approved" ? t.dashboardUi.status.approved : t.dashboardUi.status.rejected}
                  </span>
                  {command && <CommandChip command={command} />}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {demo && <p className="text-sm text-muted-dark">{mobileCopy.personas.demoNote}</p>}

      <ReviewUndoToast />
    </div>
  );
}
