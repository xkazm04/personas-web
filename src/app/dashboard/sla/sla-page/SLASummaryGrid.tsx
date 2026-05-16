import { motion } from "framer-motion";

import { fadeUp } from "@/lib/animations";

import { complianceBand } from "./slaFormat";

export function SLASummaryGrid({
  overallCompliance,
  activeBreachCount,
  objectiveCount,
  labels,
}: {
  overallCompliance: number;
  activeBreachCount: number;
  objectiveCount: number;
  labels: { compliance: string; activeBreaches: string; objectives: string };
}) {
  const band = complianceBand(overallCompliance);

  return (
    <motion.div
      variants={fadeUp}
      className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      <div className="rounded-2xl border border-glass bg-white/[0.02] p-4">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-dark">
          {labels.compliance}
        </p>
        <p className={`mt-1 text-2xl font-bold tabular-nums ${band.text}`}>
          {(overallCompliance * 100).toFixed(2)}%
        </p>
      </div>
      <div className="rounded-2xl border border-glass bg-white/[0.02] p-4">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-dark">
          {labels.activeBreaches}
        </p>
        <p
          className={`mt-1 text-2xl font-bold tabular-nums ${
            activeBreachCount > 0 ? "text-rose-400" : "text-emerald-400"
          }`}
        >
          {activeBreachCount}
        </p>
      </div>
      <div className="rounded-2xl border border-glass bg-white/[0.02] p-4">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-dark">
          {labels.objectives}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
          {objectiveCount}
        </p>
      </div>
    </motion.div>
  );
}
