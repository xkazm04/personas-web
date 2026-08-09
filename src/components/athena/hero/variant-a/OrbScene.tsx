"use client";

import { useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStillMotion } from "@/components/athena/stage/useStillMotion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION } from "@/components/athena/stage/athena-tokens";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import { COPY } from "./data";
import {
  SIZE, C, GLOW_R, GUIDE_R, DOT_R, ACK_R, ORB_PCT, DOTS, dotTrackPath, spinOrigin,
} from "./presence-geometry";

/**
 * The orb — Athena herself, at scale, plus her one signature interaction:
 * hover / tap / Enter makes her "acknowledge" you — a one-shot ring pulse
 * and a single short line in the annotation voice. No hold mechanics here
 * (that gesture belongs to variant C).
 *
 * Continuous motion (glow breathing, guide-ring spin, dot pulses) gates on
 * `prefers-reduced-motion` at the `animate` prop, keeping markup identical.
 * Exception: the looping <video> never mounts under reduced motion — the
 * static poster renders instead. When it does mount, `useAvatarPlayback`
 * owns its decode: it plays only while on screen and while the tab is
 * foregrounded, so the hero orb and the walkthrough guide orb never decode
 * at the same time.
 */
export default function OrbScene() {
  const reduced = useStillMotion();
  const uid = useId();
  const cyan = BRAND_VAR.cyan;
  const avatarRef = useAvatarPlayback(!reduced);

  // One-shot acknowledge: each trigger bumps the tick (keys a fresh pulse);
  // `busy` throttles retriggers while a pulse is mid-flight.
  const [ackTick, setAckTick] = useState(0);
  const busy = useRef(false);
  const acknowledge = () => {
    if (busy.current) return;
    busy.current = true;
    setAckTick((t) => t + 1);
    window.setTimeout(() => { busy.current = false; }, 1400);
  };

  return (
    <div className="relative h-full w-full">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="50%">
            <stop offset="0%" stopColor={cyan} stopOpacity="0.4" />
            <stop offset="100%" stopColor={cyan} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Breathing ambient glow — her presence, idling */}
        <motion.circle
          cx={C} cy={C} r={GLOW_R}
          fill={`url(#${uid}-glow)`}
          opacity={reduced ? 0.5 : undefined}
          animate={reduced ? undefined : { opacity: [0.35, 0.62, 0.35], scale: [1, 1.05, 1] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          style={spinOrigin}
        />

        {/* Slowly rotating dashed guide ring */}
        <motion.circle
          cx={C} cy={C} r={GUIDE_R}
          fill="none" stroke="rgba(var(--surface-overlay), 0.08)" strokeWidth="1" strokeDasharray="3 8"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 110, repeat: Infinity, ease: "linear" }}
          style={spinOrigin}
        />

        {/* Task-progress arc — 5 dots riding the orb perimeter */}
        <path d={dotTrackPath} fill="none" stroke={tint("cyan", 14)} strokeWidth="1" />
        {DOTS.map((d, i) => (
          <motion.circle
            key={i} cx={d.x} cy={d.y} r={5} fill={cyan}
            opacity={reduced ? 0.5 : undefined}
            animate={reduced ? undefined : { opacity: [0.25, 1, 0.25], scale: [0.85, 1.25, 0.85] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.22 }}
            style={{ transformBox: "view-box", transformOrigin: `${d.x}px ${d.y}px` }}
          />
        ))}

        {/* One-shot acknowledge pulse — keyed so each trigger replays */}
        {ackTick > 0 && !reduced && (
          <motion.circle
            key={ackTick}
            cx={C} cy={C} r={ACK_R}
            fill="none" stroke={cyan} strokeWidth="1.5"
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{ opacity: 0, scale: 1.22 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            style={spinOrigin}
          />
        )}
      </svg>

      {/* The real Athena avatar, focusable — Enter/click/hover acknowledges */}
      <button
        type="button"
        aria-label={COPY.orbAria}
        onClick={acknowledge}
        onMouseEnter={acknowledge}
        className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 cursor-pointer overflow-hidden rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan"
        style={{ width: ORB_PCT, boxShadow: brandShadow("cyan", 72, 26), outline: `2px solid ${tint("cyan", 50)}`, outlineOffset: "-1px" }}
      >
        {reduced ? (
          // eslint-disable-next-line @next/next/no-img-element -- static poster fallback; next/image adds no value for a fixed local asset
          <img src="/athena/athena_baseline.jpg" alt={COPY.avatarAlt} className="h-full w-full object-cover" />
        ) : (
          <video
            ref={avatarRef}
            src="/athena/athena_idle_loop.mp4"
            poster="/athena/athena_baseline.jpg"
            muted loop playsInline preload="auto"
            aria-label={COPY.avatarAlt}
            className="h-full w-full object-cover"
          />
        )}
      </button>

      {/* Her single spoken line, once acknowledged — annotation voice */}
      <div
        aria-live="polite"
        className="pointer-events-none absolute inset-x-0 text-center"
        style={{ top: `${(((C + DOT_R + 34) / SIZE) * 100).toFixed(1)}%` }}
      >
        <AnimatePresence>
          {ackTick > 0 && (
            <motion.span
              className={ANNOTATION}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
            >
              {COPY.acknowledgeLine}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
