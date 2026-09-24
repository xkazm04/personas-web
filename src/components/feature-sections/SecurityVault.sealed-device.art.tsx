"use client";

import { motion, useTransform, easeOut, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import SealedLock from "./SecurityVault.sealed-device.lock";
import {
  CLOUD,
  EDGE_X,
  LEAK,
  LINE_Y,
  LOCK_X,
  SCREEN,
  TRAY,
  VIEW_H,
  VIEW_W,
  useSeg,
} from "./SecurityVault.sealed-device.geometry";

/**
 * The drawing for the "sealed-device" Security variant. Everything is driven by one
 * progress value `p` (0 = start of the play, 1 = resolved). The resting state (p = 1)
 * is what the server renders and what reduced motion keeps: three keys seated in
 * closed locks inside the device, a dashed line that stops broken at the device
 * edge, and a greyed, struck-out cloud outside it.
 *
 * Geometry lives in a 900 x 400 viewBox; the HTML labels in the parent are placed
 * against the same box in percentages (see LABELS there).
 */

export default function SealedDeviceArt({ p }: { p: MotionValue<number> }) {
  // The escape: a dashed line runs from the vault to the edge and breaks there.
  const leakScale = useSeg(p, LEAK.start, LEAK.hit, 0, 1);
  const fragOpacity = useTransform(p, [LEAK.hit - 0.005, LEAK.hit + 0.02, LEAK.hit + 0.14], [0, 0.9, 0.45]);
  const fragY = useSeg(p, LEAK.hit, LEAK.hit + 0.12, 0, 26, easeOut);
  const fragRot = useSeg(p, LEAK.hit, LEAK.hit + 0.12, 0, 32, easeOut);
  const sparkScale = useSeg(p, LEAK.hit, LEAK.hit + 0.05, 0.3, 1, easeOut);
  const sparkOpacity = useTransform(p, [LEAK.hit - 0.005, LEAK.hit + 0.02], [0, 1]);
  const wallPulse = useTransform(p, [LEAK.hit, LEAK.hit + 0.04, LEAK.hit + 0.16], [0, 0.75, 0]);
  // The cloud greys out and is struck through.
  const cloudOpacity = useSeg(p, CLOUD.grey[0], CLOUD.grey[1], 1, 0.35);
  const strike = useSeg(p, CLOUD.strike[0], CLOUD.strike[1], 0, 1, easeOut);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="absolute inset-0 h-full w-full text-foreground"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="sd-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={BRAND_VAR.cyan} stopOpacity={0.1} />
          <stop offset="100%" stopColor={BRAND_VAR.cyan} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* device: screen (the sealed boundary) and base */}
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={SCREEN.r} fill="url(#sd-glow)" />
      <rect
        x={SCREEN.x}
        y={SCREEN.y}
        width={SCREEN.w}
        height={SCREEN.h}
        rx={SCREEN.r}
        fill="currentColor"
        fillOpacity={0.02}
        stroke={BRAND_VAR.cyan}
        strokeWidth={3}
        style={{ filter: `drop-shadow(0 0 10px ${tint("cyan", 35)})` }}
      />
      <motion.rect
        x={SCREEN.x}
        y={SCREEN.y}
        width={SCREEN.w}
        height={SCREEN.h}
        rx={SCREEN.r}
        fill="none"
        stroke={BRAND_VAR.cyan}
        strokeWidth={9}
        style={{ opacity: wallPulse }}
      />
      <path
        d={`M86 330 H694 L716 348 Q718 356 708 356 H72 Q62 356 64 348 Z`}
        fill="currentColor"
        fillOpacity={0.04}
        stroke="currentColor"
        strokeOpacity={0.3}
        strokeWidth={1.5}
      />
      <rect x={350} y={330} width={80} height={6} rx={3} fill="currentColor" fillOpacity={0.18} />

      {/* OS vault tray */}
      <rect
        x={TRAY.x}
        y={TRAY.y}
        width={TRAY.w}
        height={TRAY.h}
        rx={TRAY.r}
        fill={tint("purple", 8)}
        stroke={BRAND_VAR.purple}
        strokeOpacity={0.7}
        strokeWidth={1.5}
      />

      {/* the escape attempt: inside run, the break at the wall, the fallen piece */}
      <motion.line
        x1={TRAY.x + TRAY.w}
        y1={LINE_Y}
        x2={EDGE_X - 4}
        y2={LINE_Y}
        stroke={BRAND_VAR.rose}
        strokeOpacity={0.8}
        strokeWidth={2.5}
        strokeDasharray="7 7"
        strokeLinecap="round"
        style={{ scaleX: leakScale, originX: 0 }}
      />
      <motion.g style={{ opacity: sparkOpacity }}>
        <motion.g style={{ scale: sparkScale }} stroke={BRAND_VAR.rose} strokeWidth={3} strokeLinecap="round">
          <line x1={EDGE_X - 9} y1={LINE_Y - 9} x2={EDGE_X + 9} y2={LINE_Y + 9} />
          <line x1={EDGE_X + 9} y1={LINE_Y - 9} x2={EDGE_X - 9} y2={LINE_Y + 9} />
        </motion.g>
      </motion.g>
      <motion.line
        x1={EDGE_X + 16}
        y1={LINE_Y}
        x2={EDGE_X + 52}
        y2={LINE_Y}
        stroke={BRAND_VAR.rose}
        strokeWidth={2.5}
        strokeDasharray="7 7"
        strokeLinecap="round"
        style={{ opacity: fragOpacity, y: fragY, rotate: fragRot, originX: 0 }}
      />

      {/* three locks, each receiving its key */}
      {LOCK_X.map((_, i) => (
        <SealedLock key={i} p={p} i={i} />
      ))}

      {/* the cloud outside, greyed and struck */}
      <motion.path
        d={`M${CLOUD.cx - 44} ${CLOUD.cy + 22} a22 22 0 0 1 4 -43 a30 30 0 0 1 56 -8 a24 24 0 0 1 32 26 a17 17 0 0 1 -6 25 Z`}
        fill="currentColor"
        fillOpacity={0.06}
        stroke="currentColor"
        strokeOpacity={0.7}
        strokeWidth={2.5}
        strokeLinejoin="round"
        style={{ opacity: cloudOpacity }}
      />
      <motion.line
        x1={CLOUD.cx - 48}
        y1={CLOUD.cy + 30}
        x2={CLOUD.cx + 50}
        y2={CLOUD.cy - 36}
        stroke={BRAND_VAR.rose}
        strokeWidth={3.5}
        strokeLinecap="round"
        style={{ scaleX: strike, scaleY: strike, originX: 0, originY: 1 }}
      />
    </svg>
  );
}
