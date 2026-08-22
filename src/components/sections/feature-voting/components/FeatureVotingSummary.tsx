"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import type { LoadState } from "../local-types";

export function FeatureVotingSummary({
  seedVotes,
  liveVotes,
  commentsCount,
  totalBoosts,
  loadState,
}: {
  /** Hand-authored marketing seed folded into the displayed total (see `data.ts`). */
  seedVotes: number;
  /** Real votes counted by /api/votes. */
  liveVotes: number;
  commentsCount: number;
  totalBoosts: number;
  loadState: LoadState;
}) {
  const reduced = useReducedMotion() ?? false;
  const { t } = useTranslation();
  const s = t.featureVoting.summary;

  // Initial fetch in flight — mirror the card skeletons with a quiet
  // placeholder bar instead of a totals line built on unloaded state.
  if (loadState === "loading") {
    return (
      <motion.div variants={fadeUp} className="mt-8 flex justify-center" aria-hidden="true">
        <div
          className={`h-4 w-64 max-w-full rounded bg-white/[0.06] ${reduced ? "" : "animate-pulse"}`}
        />
      </motion.div>
    );
  }

  // When every source failed we still show seed totals, but we drop the
  // "Live" claim and dim the line so it never dresses dead data as live.
  const degraded = loadState === "degraded";

  // A resolved fetch is necessary but not sufficient for the "Live" badge:
  // if the API returned nothing at all, every number on this line is a typed
  // seed and the badge would be decorating hand-authored copy. Claim liveness
  // only when something real is actually on screen.
  const hasLiveData = liveVotes > 0 || commentsCount > 0 || totalBoosts > 0;

  // The vote figure is a hand-authored seed PLUS the live API count, so it is
  // not a measurement. Mark it with the locale-neutral "approximately" sign
  // whenever a seed is folded in, so the number can't be read as a count.
  const totalVotes = seedVotes + liveVotes;
  const votesLabel = s.totalVotes.replace(
    "{count}",
    `${seedVotes > 0 ? "≈" : ""}${totalVotes.toLocaleString()}`,
  );
  const commentsLabel = (commentsCount === 1 ? s.commentOne : s.commentOther).replace(
    "{count}",
    String(commentsCount),
  );
  const boostsLabel = (totalBoosts === 1 ? s.boostOne : s.boostOther).replace(
    "{count}",
    String(totalBoosts),
  );

  return (
    <motion.div variants={fadeUp} className={`mt-8 text-center ${degraded ? "opacity-70" : ""}`}>
      <p className="text-base font-mono text-muted-dark tracking-wide">
        {votesLabel}&nbsp;&middot;&nbsp;{commentsLabel}
        {totalBoosts > 0 && <>&nbsp;&middot;&nbsp;{boostsLabel}</>}
        {!degraded && hasLiveData && <>&nbsp;&middot;&nbsp;{s.live}</>}
      </p>
    </motion.div>
  );
}
