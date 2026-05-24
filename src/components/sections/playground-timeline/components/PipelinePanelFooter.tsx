import { motion } from "framer-motion";
import { Clock, Hourglass } from "lucide-react";

export function PipelinePanelFooter({
  isRunning,
  phase,
  activeStageIdx,
  totalStages,
  elapsedMs,
  remainingMs,
  doneCount,
}: {
  isRunning: boolean;
  phase: string;
  activeStageIdx: number;
  totalStages: number;
  elapsedMs: number;
  remainingMs: number;
  doneCount: number;
}) {
  return (
    <>
      <div className="flex items-center gap-3 text-base font-mono tracking-wider uppercase text-muted-dark">
        <span>Pipeline View</span>
        {isRunning && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-brand-cyan/60">Stage {activeStageIdx + 1} of {totalStages}</motion.span>}
      </div>
      <div className="flex items-center gap-4">
        {(phase === "running" || phase === "done") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-muted-dark" />
              <span className={`text-base font-mono tabular-nums ${phase === "done" ? "text-brand-emerald/60" : "text-muted-dark"}`}>{(elapsedMs / 1000).toFixed(1)}s</span>
            </div>
            {isRunning && remainingMs > 0 && (
              <div className="flex items-center gap-1.5">
                <Hourglass className="h-3 w-3 text-brand-cyan/60" />
                <span className="text-base font-mono tabular-nums text-brand-cyan/60">~{(remainingMs / 1000).toFixed(1)}s</span>
              </div>
            )}
          </motion.div>
        )}
        {totalStages > 0 && <span className="text-base font-mono text-muted-dark">{doneCount}/{totalStages} stages</span>}
        {phase === "done" && (
          <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300 }} className="text-base font-mono tracking-wider uppercase text-brand-emerald/60">
            pipeline complete
          </motion.span>
        )}
      </div>
    </>
  );
}
