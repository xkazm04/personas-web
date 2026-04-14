"use client";

import { motion } from "framer-motion";

export default function ConnectionPillar({
  fromRgb,
  toRgb,
  progress,
}: {
  fromRgb: string;
  toRgb: string;
  progress: number;
}) {
  const opacity = Math.min(progress * 1.5, 1);
  return (
    <div className="absolute left-1/2 -translate-x-1/2 w-px pointer-events-none" style={{ height: "100%", top: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(${fromRgb},${0.3 * opacity}), rgba(${toRgb},${0.3 * opacity}))`,
          maskImage:
            "repeating-linear-gradient(180deg, white 0px, white 4px, transparent 4px, transparent 8px)",
          WebkitMaskImage:
            "repeating-linear-gradient(180deg, white 0px, white 4px, transparent 4px, transparent 8px)",
        }}
      />
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
        style={{
          background: `rgba(${toRgb}, 0.6)`,
          boxShadow: `0 0 8px rgba(${toRgb}, 0.4)`,
          opacity,
        }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
      />
    </div>
  );
}
