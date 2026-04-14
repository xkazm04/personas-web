"use client";

import { motion } from "framer-motion";
import { GitCompareArrows } from "lucide-react";

export default function CompareToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={`
        flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium
        transition-all duration-200 cursor-pointer
        ${
          enabled
            ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            : "border-white/[0.08] bg-white/[0.03] text-muted-dark hover:border-white/[0.15] hover:text-muted"
        }
      `}
    >
      <GitCompareArrows className="h-3 w-3" />
      Compare
    </motion.button>
  );
}
