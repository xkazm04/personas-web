"use client";

import { motion } from "framer-motion";
import { GitCompareArrows } from "lucide-react";

export default function CompareToggle({
  enabled,
  onToggle,
  label = "Compare",
}: {
  enabled: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      aria-pressed={enabled}
      className={`
        flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium
        transition-all duration-200 cursor-pointer
        ${
          enabled
            ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            : "border-glass-hover bg-white/[0.03] text-muted-dark hover:border-glass-strong hover:text-muted"
        }
      `}
    >
      <GitCompareArrows className="h-3 w-3" />
      {label}
    </motion.button>
  );
}
