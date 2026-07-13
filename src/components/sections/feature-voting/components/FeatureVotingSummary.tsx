"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { useTranslation } from "@/i18n/useTranslation";
import type { LoadState } from "../local-types";

export function FeatureVotingSummary({
  totalVotes,
  commentsCount,
  totalBoosts,
  loadState,
}: {
  totalVotes: number;
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

  const votesLabel = s.totalVotes.replace("{count}", totalVotes.toLocaleString());
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
        {!degraded && <>&nbsp;&middot;&nbsp;{s.live}</>}
      </p>
    </motion.div>
  );
}
