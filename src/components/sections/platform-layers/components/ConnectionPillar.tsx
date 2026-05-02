"use client";

import { motion } from "framer-motion";
import { tint, type BrandKey } from "@/lib/brand-theme";

export default function ConnectionPillar({
  from,
  to,
  progress,
}: {
  from: BrandKey;
  to: BrandKey;
  progress: number;
}) {
  const opacity = Math.min(progress * 1.5, 1);
  const fromAlpha = Math.round(30 * opacity);
  const toAlpha = Math.round(30 * opacity);
  return (
    <div className="absolute left-1/2 -translate-x-1/2 w-px pointer-events-none" style={{ height: "100%", top: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${tint(from, fromAlpha)}, ${tint(to, toAlpha)})`,
          maskImage:
            "repeating-linear-gradient(180deg, white 0px, white 4px, transparent 4px, transparent 8px)",
          WebkitMaskImage:
            "repeating-linear-gradient(180deg, white 0px, white 4px, transparent 4px, transparent 8px)",
        }}
      />
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
        style={{
          background: tint(to, 60),
          boxShadow: `0 0 8px ${tint(to, 40)}`,
          opacity,
        }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
      />
    </div>
  );
}
