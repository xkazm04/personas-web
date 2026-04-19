"use client";

import { motion } from "framer-motion";
import { Circle, CheckCircle2 } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { BRAND_VAR, tint } from "@/lib/brand-theme";

export default function RoadmapProgress() {
  return (
    <motion.div variants={fadeUp} className="mt-10 mx-auto max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 text-base font-mono text-muted mb-4">
        <span className="font-medium tracking-wide">11 of 15 phases complete</span>
        <span
          className="font-bold text-base"
          style={{ color: BRAND_VAR.cyan, textShadow: `0 0 8px ${tint("cyan", 80)}` }}
        >
          73%
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-white/[0.06] shadow-inner">
        <motion.div
          className="relative h-full rounded-full overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(90deg, ${BRAND_VAR.cyan}, ${BRAND_VAR.blue}, ${BRAND_VAR.purple})`,
            boxShadow: `0 0 15px ${tint("purple", 50)}`,
          }}
          initial={{ width: 0 }}
          whileInView={{ width: "73%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
        >
          <div
            className="absolute inset-0 animate-progress-shimmer"
            style={{
              background: "linear-gradient(90deg, transparent 70%, rgba(255,255,255,0.15) 90%, transparent 100%)",
              backgroundSize: "200% 100%",
            }}
          />
        </motion.div>
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-1 w-1 rounded-full animate-progress-dot-breathe"
          style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: `0 0 6px ${tint("cyan", 80)}, 0 0 12px ${tint("cyan", 40)}` }}
          initial={{ left: "0%" }}
          whileInView={{ left: "73%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-base font-mono text-muted font-medium">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" style={{ color: BRAND_VAR.emerald, filter: `drop-shadow(0 0 5px ${tint("emerald", 60)})` }} />
          <span>Phases 1-11 done</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-muted" />
          <span>4 phases to go</span>
        </div>
      </div>
    </motion.div>
  );
}
