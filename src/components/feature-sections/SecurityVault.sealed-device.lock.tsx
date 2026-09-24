"use client";

import { motion, useTransform, easeInOut, easeOut, type MotionValue } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import {
  KEY_FROM,
  KEY_LAND,
  KEY_TRAVEL,
  LOCK_SCALE,
  LOCK_X,
  LOCK_Y,
  useSeg,
} from "./SecurityVault.sealed-device.geometry";

function KeyGlyph() {
  // Pointing right, bow on the left, centred on (0, 0).
  return (
    <g stroke={BRAND_VAR.amber} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <circle cx={-9} cy={0} r={6.5} />
      <path d="M-2.5 0 H15 M10 0 V5 M14.5 0 V4" />
    </g>
  );
}

/**
 * One lock and its key, drawn around a local origin at the lock's centre and placed
 * by a static scaled group. The key drifts in from a loose spot inside the device,
 * lands on the lock face; the shackle drops shut and the body turns sealed-emerald.
 */
export default function SealedLock({ p, i }: { p: MotionValue<number>; i: number }) {
  const land = KEY_LAND[i];
  const from = KEY_FROM[i];
  const t0 = land - KEY_TRAVEL;

  const kx = useSeg(p, t0, land, from.dx, 0, easeInOut);
  const ky = useSeg(p, t0, land, from.dy, 0, easeInOut);
  const kr = useSeg(p, t0, land, from.rot, 0, easeOut);
  const ks = useSeg(p, land - 0.04, land, 1.3, 1, easeOut);
  const shackleY = useSeg(p, land, land + 0.05, -11, 0, easeOut);
  const sealed = useSeg(p, land - 0.01, land + 0.04, 0, 1, easeOut);
  const ringScale = useSeg(p, land, land + 0.12, 0.7, 1.6, easeOut);
  const ringOpacity = useTransform(p, [land, land + 0.02, land + 0.12], [0, 0.7, 0]);

  return (
    <g transform={`translate(${LOCK_X[i]} ${LOCK_Y}) scale(${LOCK_SCALE})`}>
      {/* snap ring */}
      <motion.g style={{ scale: ringScale, opacity: ringOpacity }}>
        <circle cx={0} cy={2} r={32} fill="none" stroke={BRAND_VAR.emerald} strokeWidth={1.6} />
      </motion.g>
      {/* shackle */}
      <motion.path
        d="M-14 -16 V-28 a14 14 0 0 1 28 0 V-16"
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.55}
        strokeWidth={5}
        strokeLinecap="round"
        style={{ y: shackleY }}
      />
      {/* body: open (neutral) under sealed (emerald) */}
      <rect
        x={-26}
        y={-20}
        width={52}
        height={44}
        rx={9}
        fill="currentColor"
        fillOpacity={0.05}
        stroke="currentColor"
        strokeOpacity={0.35}
        strokeWidth={1.5}
      />
      <motion.rect
        x={-26}
        y={-20}
        width={52}
        height={44}
        rx={9}
        fill={tint("emerald", 22)}
        stroke={BRAND_VAR.emerald}
        strokeWidth={2}
        style={{ opacity: sealed }}
      />
      {/* key: loose in the device, then seated in the lock face */}
      <g transform="translate(0 2)">
        <motion.g style={{ x: kx, y: ky, rotate: kr, scale: ks }}>
          <KeyGlyph />
        </motion.g>
      </g>
    </g>
  );
}
