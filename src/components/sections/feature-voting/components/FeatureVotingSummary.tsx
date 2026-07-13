import { motion, useReducedMotion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
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

  return (
    <motion.div variants={fadeUp} className={`mt-8 text-center ${degraded ? "opacity-70" : ""}`}>
      <p className="text-base font-mono text-muted-dark tracking-wide">
        {totalVotes.toLocaleString()} total votes&nbsp;&middot;&nbsp;{commentsCount} comment{commentsCount !== 1 ? "s" : ""}
        {totalBoosts > 0 && <>&nbsp;&middot;&nbsp;{totalBoosts} boost{totalBoosts !== 1 ? "s" : ""}</>}
        {!degraded && <>&nbsp;&middot;&nbsp;Live</>}
      </p>
    </motion.div>
  );
}
