"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { BRAND_VAR, tint } from "@/lib/brand-theme";

export default function EventBusLegend({ averageLatency }: { averageLatency: number }) {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-base text-muted"
    >
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-8 rounded-full ring-1 ring-white/8"
          style={{ backgroundImage: `linear-gradient(90deg, ${tint("cyan", 25)}, ${tint("purple", 25)})` }}
        />
        <span>Message queue</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: `0 0 4px ${tint("cyan", 40)}` }}
        />
        <span>Message being delivered</span>
      </div>
      <div className="flex items-center gap-2">
        <svg width="16" height="8" className="text-muted">
          <line x1="0" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        </svg>
        <span>Connection to hub</span>
      </div>
      <div className="rounded-full border border-white/8 bg-white/2 px-3 py-1.5 font-mono tracking-wide text-muted">
        Typical delivery time: {averageLatency}ms
      </div>
    </motion.div>
  );
}
