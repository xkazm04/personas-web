"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";

/**
 * The persona, drawn: a stylised agent bust (head, lit visor, ear ring,
 * shoulders) in the persona's purple with a cyan visor. `flashKey` changes
 * each time a capability lands; the halo then breathes out once. Markup is
 * the same with and without motion - only the halo's animation is gated.
 */
export default function PersonaBust({
  flashKey,
  moving,
  lit = 1,
  className = "",
}: {
  flashKey: number;
  moving: boolean;
  /** 0..1: how lit the visor is (rises with each capability). */
  lit?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const head = `${uid}-head`;
  const glow = `${uid}-glow`;

  return (
    <svg viewBox="0 0 200 230" className={className} aria-hidden="true" overflow="visible">
      <defs>
        <radialGradient id={head} cx="40%" cy="30%" r="80%">
          <stop offset="0%" style={{ stopColor: tint("purple", 42) }} />
          <stop offset="100%" style={{ stopColor: tint("purple", 10) }} />
        </radialGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <motion.circle
        key={flashKey}
        cx={100}
        cy={110}
        r={96}
        fill="none"
        strokeWidth={2}
        style={{ stroke: BRAND_VAR.cyan, transformBox: "fill-box", transformOrigin: "center" }}
        initial={false}
        animate={moving && flashKey > 0 ? { opacity: [0.75, 0], scale: [0.7, 1.25] } : { opacity: 0, scale: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />

      {/* shoulders and neck */}
      <path
        d="M14 230 C 18 186 50 166 78 160 L 122 160 C 150 166 182 186 186 230 Z"
        style={{ fill: tint("purple", 16), stroke: tint("purple", 55) }}
        strokeWidth={1.5}
      />
      <path d="M100 176 L 100 230" style={{ stroke: tint("purple", 35) }} strokeWidth={1.2} strokeDasharray="3 5" />
      <rect x={84} y={134} width={32} height={30} rx={8} style={{ fill: tint("purple", 22), stroke: tint("purple", 45) }} strokeWidth={1.2} />

      {/* head */}
      <ellipse cx={100} cy={86} rx={54} ry={62} style={{ fill: `url(#${head})`, stroke: tint("purple", 65) }} strokeWidth={1.8} />
      <path d="M58 58 C 72 30 128 30 142 58" fill="none" style={{ stroke: tint("purple", 40) }} strokeWidth={1.2} />

      {/* visor: glow underneath, crisp band on top */}
      <rect x={60} y={76} width={80} height={24} rx={12} filter={`url(#${glow})`} style={{ fill: BRAND_VAR.cyan, opacity: 0.25 + 0.45 * lit }} />
      <rect x={62} y={78} width={76} height={20} rx={10} style={{ fill: tint("cyan", 30 + 50 * lit), stroke: BRAND_VAR.cyan }} strokeWidth={1.2} />
      <circle cx={84} cy={88} r={3.2} style={{ fill: "var(--foreground)" }} />
      <circle cx={116} cy={88} r={3.2} style={{ fill: "var(--foreground)" }} />

      {/* ear ring */}
      <circle cx={46} cy={90} r={10} fill="none" style={{ stroke: BRAND_VAR.cyan }} strokeWidth={2} />
      <circle cx={46} cy={90} r={4} style={{ fill: tint("cyan", 60) }} />

      {/* chest mark */}
      <circle cx={100} cy={200} r={9} fill="none" style={{ stroke: tint("cyan", 70) }} strokeWidth={1.5} />
      <path d="M96 200 L 99 203 L 105 196" fill="none" style={{ stroke: BRAND_VAR.cyan }} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}
