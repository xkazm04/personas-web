"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Cpu } from "lucide-react";
import { healingStages } from "../data";

export default function CircuitHeader({
  activeStage,
  cycleIndex,
}: {
  activeStage: number;
  cycleIndex: number;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/6 bg-background/40">
      <div className="flex items-center gap-2">
        <Cpu className="h-4 w-4 text-brand-cyan" />
        <span className="text-base font-mono text-foreground font-semibold tracking-wider uppercase">
          Circuit Board — Infrastructure
        </span>
      </div>
      <div className="flex items-center gap-3">
        <AnimatePresence>
          {activeStage >= 0 && activeStage < 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5"
              style={{
                borderColor: `${healingStages[activeStage].color}40`,
                backgroundColor: `${healingStages[activeStage].color}10`,
              }}
            >
              <motion.div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: healingStages[activeStage].color }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <span
                className="text-base font-mono uppercase tracking-wider"
                style={{ color: healingStages[activeStage].color }}
              >
                {healingStages[activeStage].statusLabel}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <span className="text-base font-mono text-foreground/90 font-medium">
          Cycle #{cycleIndex + 1}
        </span>
      </div>
    </div>
  );
}
