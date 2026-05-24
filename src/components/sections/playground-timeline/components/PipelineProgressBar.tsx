import { motion } from "framer-motion";

export function PipelineProgressBar({
  phase,
  progressPercent,
  isRunning,
  reduced,
}: {
  phase: string;
  progressPercent: number;
  isRunning: boolean;
  reduced: boolean;
}) {
  if (phase === "idle") return null;

  return (
    <div className="relative h-1 bg-white/[0.03]" role="progressbar" aria-valuenow={Math.round(progressPercent)} aria-valuemin={0} aria-valuemax={100}>
      <div className="absolute inset-y-0 left-0" style={{ width: `${progressPercent}%`, background: "linear-gradient(90deg, #06b6d4, #a855f7, #34d399)", transition: reduced ? "none" : "width 0.1s linear" }} />
      {isRunning && !reduced && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-cyan"
          style={{ left: `${progressPercent}%`, boxShadow: "0 0 12px 4px rgba(6,182,212,0.5)", marginLeft: "-6px", transition: "left 0.1s linear" }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </div>
  );
}
