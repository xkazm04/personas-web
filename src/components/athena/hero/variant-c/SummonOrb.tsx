"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { COPY } from "./data";
import { HOLD_THRESHOLD_MS, type GestureBind, type SummonPhase } from "./useSummonGesture";

/**
 * The summonable orb — the real Athena avatar inside a circular mask,
 * rendered as a focusable button carrying the whole hold-to-talk gesture.
 * While arming, a thin arc fills toward the 220 ms threshold; past it,
 * the glow blooms and a lit halo pulses ("listening"). Reduced motion
 * skips the theater (arc, breathing, video) but the gesture still works.
 */

const SIZE = 220;
const C = SIZE / 2;
const RING_R = 92;
const GLOW_R = 106;

export default function SummonOrb({ phase, bind }: { phase: SummonPhase; bind: GestureBind }) {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();
  const cyan = BRAND_VAR.cyan;
  const engaged = phase === "listening" || phase === "thinking";

  return (
    <motion.button
      type="button"
      aria-label={COPY.orbAria}
      aria-pressed={engaged}
      {...bind}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      className="relative aspect-square w-[min(58vmin,300px)] touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="50%">
            <stop offset="0%" stopColor={cyan} stopOpacity="0.42" />
            <stop offset="100%" stopColor={cyan} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient glow — breathes at rest, blooms while she listens */}
        {reduced ? (
          <circle cx={C} cy={C} r={GLOW_R} fill={`url(#${uid}-glow)`} opacity={engaged ? 0.85 : 0.45} />
        ) : (
          <motion.circle
            cx={C}
            cy={C}
            r={GLOW_R}
            fill={`url(#${uid}-glow)`}
            animate={
              engaged
                ? { opacity: 0.95, scale: 1.12 }
                : { opacity: [0.35, 0.55, 0.35], scale: [1, 1.045, 1] }
            }
            transition={
              engaged
                ? { duration: 0.4, ease: "easeOut" }
                : { duration: 4.6, repeat: Infinity, ease: "easeInOut" }
            }
            style={{ transformBox: "view-box", transformOrigin: `${C}px ${C}px` }}
          />
        )}

        {/* Resting guide ring */}
        <circle
          cx={C}
          cy={C}
          r={RING_R}
          fill="none"
          stroke="rgba(var(--surface-overlay), 0.1)"
          strokeWidth="1"
          strokeDasharray="3 7"
        />

        {/* Arming arc — fills toward the 220 ms threshold */}
        {phase === "arming" && !reduced && (
          <motion.circle
            cx={C}
            cy={C}
            r={RING_R}
            fill="none"
            stroke={cyan}
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: HOLD_THRESHOLD_MS / 1000, ease: "linear" }}
            style={{ transformBox: "view-box", transformOrigin: `${C}px ${C}px`, rotate: -90 }}
          />
        )}

        {/* Listening halo — the full ring, lit */}
        {engaged &&
          (reduced ? (
            <circle cx={C} cy={C} r={RING_R} fill="none" stroke={tint("cyan", 70)} strokeWidth="2" />
          ) : (
            <motion.circle
              cx={C}
              cy={C}
              r={RING_R}
              fill="none"
              stroke={tint("cyan", 75)}
              strokeWidth="2"
              animate={{ opacity: [0.65, 1, 0.65] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
      </svg>

      {/* The real Athena avatar — looping clip, poster-only under reduced motion */}
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 block aspect-square w-[68%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
        style={{
          boxShadow: brandShadow("cyan", engaged ? 64 : 40, engaged ? 34 : 24),
          outline: `2px solid ${tint("cyan", engaged ? 65 : 45)}`,
          outlineOffset: "-1px",
        }}
      >
        {reduced ? (
          // eslint-disable-next-line @next/next/no-img-element -- static poster fallback; next/image adds no value for a fixed local asset
          <img
            src="/athena/athena_baseline.jpg"
            alt=""
            draggable={false}
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            src="/athena/athena_idle_loop.mp4"
            poster="/athena/athena_baseline.jpg"
            muted
            loop
            autoPlay
            playsInline
            preload="auto"
            className="pointer-events-none h-full w-full object-cover"
          />
        )}
      </span>
    </motion.button>
  );
}
