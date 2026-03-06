"use client";

import { useReducedMotion } from "framer-motion";
import { BRAND_COLORS, rgba } from "@/lib/colors";

export default function AmbientOrbs() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute left-[8%] top-[12%] h-140 w-140 rounded-full orb-pulse"
        style={{ background: `radial-gradient(circle, ${rgba(BRAND_COLORS.cyan, 0.04)} 0%, transparent 70%)` }}
      />
      <div
        className="absolute right-[8%] top-[36%] h-130 w-130 rounded-full orb-pulse-delayed"
        style={{ background: `radial-gradient(circle, ${rgba(BRAND_COLORS.purple, 0.035)} 0%, transparent 70%)` }}
      />
    </div>
  );
}
