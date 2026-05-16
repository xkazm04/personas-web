import { motion } from "framer-motion";

import {
  EFFORT_STYLE,
  RISK_STYLE,
  type Goal,
} from "./devToolsLifecycleData";

export function GoalCard({ goal, delay }: { goal: Goal; delay: number }) {
  const effort = EFFORT_STYLE[goal.effort];
  const risk = RISK_STYLE[goal.risk];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.03] px-3 py-2.5 cursor-default"
    >
      <div className="text-base text-foreground/95 leading-snug mb-2 font-medium">
        {goal.title}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="rounded-full border px-2 py-0.5 text-base font-mono"
          style={{
            borderColor: `${effort.color}40`,
            backgroundColor: `${effort.color}12`,
            color: effort.color,
          }}
        >
          {effort.label}
        </span>
        <span
          className="rounded-full border px-2 py-0.5 text-base font-mono"
          style={{
            borderColor: `${risk.color}40`,
            backgroundColor: `${risk.color}12`,
            color: risk.color,
          }}
        >
          {risk.label}
        </span>
      </div>
    </motion.div>
  );
}
