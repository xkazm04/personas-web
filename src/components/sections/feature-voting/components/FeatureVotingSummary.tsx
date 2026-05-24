import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

export function FeatureVotingSummary({
  totalVotes,
  commentsCount,
  totalBoosts,
  loaded,
}: {
  totalVotes: number;
  commentsCount: number;
  totalBoosts: number;
  loaded: boolean;
}) {
  return (
    <motion.div variants={fadeUp} className="mt-8 text-center">
      <p className="text-base font-mono text-muted-dark tracking-wide">
        {totalVotes.toLocaleString()} total votes&nbsp;&middot;&nbsp;{commentsCount} comment{commentsCount !== 1 ? "s" : ""}
        {totalBoosts > 0 && <>&nbsp;&middot;&nbsp;{totalBoosts} boost{totalBoosts !== 1 ? "s" : ""}</>}
        {loaded && <>&nbsp;&middot;&nbsp;Live</>}
      </p>
    </motion.div>
  );
}
