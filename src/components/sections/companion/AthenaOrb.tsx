"use client";

import { useEffect, useId, useRef } from "react";
import { motion } from "framer-motion";
import { useLoopGate } from "@/hooks/useLoopGate";
import { BRAND_VAR, brandShadow, tint, type BrandKey } from "@/lib/brand-theme";
import { companionSectionCopy } from "@/i18n/pending/companionSection";

/**
 * AthenaOrb — the section's centerpiece "art". The real Athena avatar (the
 * actual desktop companion clip) sits inside a circular mask, wrapped by an
 * SVG ring that mirrors the desktop orb: a breathing ambient glow, a slowly
 * rotating dashed guide-ring, and a progress-dot arc across the top (the
 * desktop "task dots"). The accent recolors to the active capability.
 *
 * All continuous motion runs only while the orb is on screen, the tab is
 * visible and motion is allowed (useLoopGate); reduced motion also swaps the
 * looping <video> for a static poster (no decode while reduced), and the clip
 * is paused - not just hidden - whenever the loops are.
 */

const SIZE = 320;
const C = SIZE / 2;
const ORB_R = 92;
const DOT_COUNT = 5;

export default function AthenaOrb({ brand }: { brand: BrandKey }) {
  const avatarAlt = companionSectionCopy.avatarAlt;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { run, still: reduced } = useLoopGate(rootRef);

  // The clip used to autoplay with preload="auto" and loop for as long as the
  // page was open, on screen or not. It now loads only when first played.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (run) video.play().catch(() => {});
    else video.pause();
  }, [run]);
  const uid = useId();
  const accent = BRAND_VAR[brand];

  // Task dots arced across the top ~120° of the orb perimeter.
  const dotR = ORB_R + 16;
  const spread = Math.PI * 0.66;
  const dots = Array.from({ length: DOT_COUNT }, (_, i) => {
    const a = -Math.PI / 2 - spread / 2 + (spread * i) / (DOT_COUNT - 1);
    return { x: C + Math.cos(a) * dotR, y: C + Math.sin(a) * dotR };
  });

  return (
    // On the stage the orb is sized from the slot's height (a size container),
    // leaving room for the speech line under it.
    <div ref={rootRef} className="relative mx-auto aspect-square w-full max-w-[360px] stage:max-w-[min(34rem,calc(100cqh_-_5.5rem))]">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Breathing ambient glow */}
        {!run ? (
          <circle cx={C} cy={C} r={ORB_R + 38} fill={`url(#${uid}-glow)`} opacity={0.5} />
        ) : (
          <motion.circle
            cx={C}
            cy={C}
            r={ORB_R + 38}
            fill={`url(#${uid}-glow)`}
            animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.06, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformBox: "view-box", transformOrigin: `${C}px ${C}px` }}
          />
        )}

        {/* Slowly rotating dashed guide-ring */}
        {!run ? (
          <circle
            cx={C}
            cy={C}
            r={ORB_R + 22}
            fill="none"
            stroke="rgba(var(--surface-overlay), 0.08)"
            strokeWidth="1"
            strokeDasharray="3 7"
          />
        ) : (
          <motion.circle
            cx={C}
            cy={C}
            r={ORB_R + 22}
            fill="none"
            stroke="rgba(var(--surface-overlay), 0.08)"
            strokeWidth="1"
            strokeDasharray="3 7"
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            style={{ transformBox: "view-box", transformOrigin: `${C}px ${C}px` }}
          />
        )}

        {/* Progress-dot arc (mirrors the desktop orb's task dots) */}
        {dots.map((d, i) =>
          !run ? (
            <circle key={i} cx={d.x} cy={d.y} r={3} fill={accent} opacity={0.5} />
          ) : (
            <motion.circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={3}
              fill={accent}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.18,
              }}
              style={{ transformBox: "view-box", transformOrigin: `${d.x}px ${d.y}px` }}
            />
          ),
        )}
      </svg>

      {/* The real Athena avatar — looping clip when motion is allowed, poster otherwise */}
      <div
        className="absolute left-1/2 top-1/2 aspect-square w-[57%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
        style={{ boxShadow: brandShadow(brand, 48, 30), outline: `2px solid ${tint(brand, 55)}`, outlineOffset: "-1px" }}
      >
        {reduced ? (
          // eslint-disable-next-line @next/next/no-img-element -- static poster fallback; next/image adds no value for a fixed local asset
          <img
            src="/athena/athena_baseline_640.webp"
            alt={avatarAlt}
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            src="/athena/athena_idle_loop.mp4"
            // 640px WebP (40 KB) - the 1024px JPEG was 476 KB for a ~200px circle.
            poster="/athena/athena_baseline_640.webp"
            muted
            loop
            playsInline
            preload="none"
            aria-label={avatarAlt}
            className="h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
