"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wrench } from "lucide-react";
import { healingStages } from "../data";

export default function StageDescription({
  activeStage,
}: {
  activeStage: number;
}) {
  const safeStage = activeStage >= 0 ? activeStage : 0;
  const stage = healingStages[safeStage];

  return (
    <div className="relative border-t border-foreground/6 bg-background/40 px-5 py-3 h-[92px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={safeStage}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: activeStage >= 0 ? 1 : 0.5, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 px-5 py-3 flex flex-col gap-1.5"
        >
          <div className="flex items-center gap-1.5">
            <Wrench
              className="h-3.5 w-3.5"
              style={{ color: stage.color }}
            />
            <span
              className="text-base font-mono font-semibold uppercase tracking-wider"
              style={{ color: stage.color }}
            >
              {stage.label}
            </span>
          </div>
          <p className="text-base text-foreground font-mono leading-relaxed line-clamp-2">
            {stage.desc}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
