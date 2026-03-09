"use client";

import { motion } from "framer-motion";

export default function SkeletonCard({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.035] to-white/[0.008] p-5 ${className}`}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{ translateX: ["−100%", "200%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)",
          width: "100%",
        }}
      />

      {/* Icon placeholder */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-xl bg-white/[0.04] animate-pulse" />
        <div className="h-3 w-20 rounded bg-white/[0.06] animate-pulse" />
      </div>

      {/* Value placeholder */}
      <div className="h-7 w-24 rounded bg-white/[0.06] animate-pulse mb-3" />

      {/* Line placeholders */}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-2 rounded bg-white/[0.04] animate-pulse mb-2"
          style={{ width: `${70 + Math.random() * 30}%`, animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export function SkeletonChart({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.035] to-white/[0.008] p-5 ${className}`}
    >
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
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-4 rounded bg-white/[0.06] animate-pulse" />
        <div className="h-3 w-28 rounded bg-white/[0.06] animate-pulse" />
      </div>
      <div className="h-[200px] flex items-end gap-1 px-4">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-white/[0.04] animate-pulse"
            style={{
              height: `${30 + Math.sin(i * 0.8) * 25 + Math.random() * 20}%`,
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
