"use client";

import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";

/*
 * AthenaStage — the committed canvas every /athena section renders on
 * (kp/Spark lesson: the page owns one background wholesale; sections
 * inherit it rather than restyling their own).
 *
 * Three ambient layers, back to front:
 *   1. void base (bg-background) with a cyan key-light radial,
 *   2. a subtle circuit-dot grid (SVG pattern, near-invisible),
 *   3. a few drifting luminous motes (kp confetti lesson, low density).
 *
 * Reduced motion gates the `animate` props — elements are never dropped,
 * so markup stays identical whichever way the preference lands.
 */

const MOTES = [
  { left: "8%", top: "22%", size: 3, delay: 0 },
  { left: "16%", top: "72%", size: 2, delay: 1.4 },
  { left: "78%", top: "14%", size: 3, delay: 0.6 },
  { left: "88%", top: "62%", size: 2, delay: 2.1 },
  { left: "52%", top: "9%", size: 2, delay: 1.0 },
] as const;

export default function AthenaStage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();

  return (
    <div className={`relative overflow-hidden bg-background ${className}`}>
      {/* Key light — one cyan radial anchored high-center */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 45% at 50% 12%, ${tint("cyan", 8)}, transparent 70%)`,
        }}
      />

      {/* Circuit-dot grid, near-invisible */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <pattern id={`${uid}-grid`} width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="rgba(var(--surface-overlay), 0.05)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${uid}-grid)`} />
      </svg>

      {/* Drifting motes */}
      {MOTES.map((m, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            left: m.left,
            top: m.top,
            width: m.size,
            height: m.size,
            background: BRAND_VAR.cyan,
            opacity: 0.35,
          }}
          animate={reduced ? undefined : { y: [0, -18, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: m.delay }}
        />
      ))}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
