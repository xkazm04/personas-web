"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { COPY } from "../data";

/**
 * The second surface — a miniature of Athena's floating orb, reusing the
 * hero's avatar idiom at small scale: real baseline still, cyan seam
 * outline, breathing radial glow, slow dashed guide ring. Continuous
 * motion gates on `prefers-reduced-motion` at the `animate` props only.
 */
export default function OrbSurface() {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();
  const cyan = BRAND_VAR.cyan;

  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 160 160" className="absolute -inset-8" aria-hidden="true">
        <defs>
          <radialGradient id={`${uid}-orb-glow`} cx="50%" cy="50%">
            <stop offset="0%" stopColor={cyan} stopOpacity="0.35" />
            <stop offset="100%" stopColor={cyan} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Breathing ambient glow — presence, idling (hero vocabulary) */}
        <motion.circle
          cx={80} cy={80} r={78}
          fill={`url(#${uid}-orb-glow)`}
          opacity={reduced ? 0.5 : undefined}
          animate={reduced ? undefined : { opacity: [0.35, 0.65, 0.35], scale: [1, 1.06, 1] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformBox: "view-box", transformOrigin: "80px 80px" }}
        />

        {/* Slowly rotating dashed guide ring */}
        <motion.circle
          cx={80} cy={80} r={58}
          fill="none" stroke="rgba(var(--surface-overlay), 0.1)" strokeWidth="1" strokeDasharray="3 8"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          style={{ transformBox: "view-box", transformOrigin: "80px 80px" }}
        />
      </svg>

      {/* eslint-disable-next-line @next/next/no-img-element -- fixed local asset in a miniature; next/image adds no value */}
      <img
        src="/athena/athena_baseline.jpg"
        alt={COPY.orbAlt}
        className="relative h-full w-full rounded-full object-cover"
        style={{
          boxShadow: brandShadow("cyan", 48, 26),
          outline: `2px solid ${tint("cyan", 50)}`,
          outlineOffset: "-1px",
        }}
      />
    </div>
  );
}
