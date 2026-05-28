"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function SkeletonCard({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const [lineWidths] = useState(() =>
    Array.from({ length: lines }, () => 70 + Math.random() * 30),
  );
  const pulse = reducedMotion ? "" : "animate-pulse";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-glass bg-gradient-to-br from-white/[0.035] to-white/[0.008] p-5 ${className}`}
    >
      {/* Shimmer overlay — skipped under reduced motion */}
      {!reducedMotion && (
        <motion.div
          className="absolute inset-0 -translate-x-full"
          animate={{ translateX: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)",
            width: "100%",
          }}
        />
      )}

      {/* Icon placeholder */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`h-8 w-8 rounded-xl bg-white/[0.04] ${pulse}`} />
        <div className={`h-3 w-20 rounded bg-white/[0.06] ${pulse}`} />
      </div>

      {/* Value placeholder */}
      <div className={`h-7 w-24 rounded bg-white/[0.06] mb-3 ${pulse}`} />

      {/* Line placeholders */}
      {lineWidths.map((w, i) => (
        <div
          key={i}
          className={`h-2 rounded bg-white/[0.04] mb-2 ${pulse}`}
          style={{ width: `${w}%`, animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export function SkeletonChart({ className = "" }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  const [barHeights] = useState(() =>
    Array.from({ length: 14 }, (_, i) => 30 + Math.sin(i * 0.8) * 25 + Math.random() * 20),
  );
  const pulse = reducedMotion ? "" : "animate-pulse";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-glass bg-gradient-to-br from-white/[0.035] to-white/[0.008] p-5 ${className}`}
    >
      {/* Shimmer overlay — skipped under reduced motion */}
      {!reducedMotion && (
        <motion.div
          className="absolute inset-0"
          animate={{ translateX: ["-100%", "200%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)",
            width: "50%",
          }}
        />
      )}
      <div className="flex items-center gap-2 mb-4">
        <div className={`h-4 w-4 rounded bg-white/[0.06] ${pulse}`} />
        <div className={`h-3 w-28 rounded bg-white/[0.06] ${pulse}`} />
      </div>
      <div className="h-[200px] flex items-end gap-1 px-4">
        {barHeights.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t bg-white/[0.04] ${pulse}`}
            style={{
              height: `${h}%`,
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
