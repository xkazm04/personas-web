"use client";

import { useId } from "react";
import { easeOut, motion, useTransform, type MotionValue } from "framer-motion";
import { KeyRound } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { Bolts, H, RINGS, Ring, W, rotateStyle } from "./nestedVaultParts";

/*
 * Geometry (viewBox 760 x 480, drawn around the vault centre at 0,0).
 *
 * Beats on one progress value p (0 -> 1):
 *   0.00-0.20  the key drops through the three aligned openings to the centre
 *   0.20-0.40  inner ring (AES-256-GCM) turns once, its notch meets the latch, click
 *   0.40-0.60  middle ring (OS keychain) turns the other way, click
 *   0.60-0.80  outer ring (Device) turns, click
 *   0.80-0.92  the door bolts shoot into the frame on both sides
 *   0.90-1.00  the key glows: sealed
 * p = 1 is the resting state (server render, reduced motion).
 */

export default function NestedVaultArt({ progress }: { progress: MotionValue<number> }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const keyY = useTransform(progress, [0, 0.2], [-290, 0], { ease: easeOut });
  const keyOpacity = useTransform(progress, [0, 0.05], [0, 1]);
  const keyScale = useTransform(progress, [0.9, 0.95, 1], [1, 1.14, 1]);
  const halo = useTransform(progress, [0.88, 0.97], [0.12, 0.7]);
  const labelOpacity = useTransform(progress, [0.9, 0.98], [0.5, 1]);

  return (
    <svg
      viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <radialGradient id={`nv-bg-${uid}`}>
          <stop offset="0%" style={{ stopColor: tint("purple", 16) }} />
          <stop offset="70%" style={{ stopColor: tint("purple", 4) }} />
          <stop offset="100%" style={{ stopColor: "transparent" }} />
        </radialGradient>
        <filter id="nv-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={6} />
        </filter>
      </defs>

      <circle r={250} fill={`url(#nv-bg-${uid})`} />
      {/* the door's outer bezel */}
      <circle r={232} fill="none" stroke="var(--foreground)" strokeOpacity={0.14} strokeWidth={1.5} strokeDasharray="2 9" />

      <Bolts progress={progress} side={1} />
      <Bolts progress={progress} side={-1} />

      {/* door face behind the rings, so the bolts slide out from under it */}
      <circle r={207} fill="var(--background)" fillOpacity={0.85} />

      {/* the secret at the centre */}
      <motion.circle r={62} fill={tint("amber", 22)} style={{ opacity: halo }} filter="url(#nv-soft)" />
      <circle r={78} fill={tint("amber", 5)} stroke={tint("amber", 18)} strokeWidth={1} />

      {RINGS.map((spec, i) => (
        <Ring key={spec.label} spec={spec} progress={progress} pathId={`nv-label-${uid}-${i}`} />
      ))}

      <motion.g style={{ y: keyY, opacity: keyOpacity }}>
        <motion.g style={{ ...rotateStyle, scale: keyScale }}>
          <KeyRound x={-22} y={-34} width={44} height={44} color={BRAND_VAR.amber} strokeWidth={2} />
        </motion.g>
      </motion.g>
      <motion.text
        y={36}
        textAnchor="middle"
        fill={BRAND_VAR.amber}
        fontSize={14}
        letterSpacing={1.2}
        className="font-mono"
        style={{ opacity: labelOpacity }}
      >
        Your keys
      </motion.text>
    </svg>
  );
}
