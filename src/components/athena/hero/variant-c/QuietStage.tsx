"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { COPY, NOISE_LABELS } from "./data";
import {
  NOISE_SPOTS,
  DEST_POINT,
  ORB_POS,
  CHAT_BOX,
  FLIGHT_DURATION,
  SILENCE_AT,
} from "./geometry";

/**
 * The art: a field of UI noise silencing itself into exactly two surfaces.
 * Reduced motion renders the end-state only — two quiet surfaces, no noise.
 */
export default function QuietStage() {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();
  const cyan = BRAND_VAR.cyan;
  const settle = (delay: number) =>
    reduced ? { duration: 0 } : { delay, duration: 0.6, ease: "easeOut" as const };

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[560px]">
      {/* Noise cards — the "before". Purely decorative; absent under reduced motion. */}
      {!reduced &&
        NOISE_LABELS.map((label, i) => {
          const s = NOISE_SPOTS[i];
          const d = DEST_POINT[s.dest];
          const total = s.delay + FLIGHT_DURATION;
          const times = [0, Math.min(0.35 / total, 0.3), s.delay / total, 1];
          return (
            <motion.div
              key={label}
              aria-hidden="true"
              className="absolute rounded-lg border border-glass bg-surface px-3 py-2 text-xs text-foreground/70 shadow-lg"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                left: [`${s.x}%`, `${s.x}%`, `${s.x}%`, `${d.x}%`],
                top: [`${s.y}%`, `${s.y}%`, `${s.y}%`, `${d.y}%`],
                rotate: [s.rot, s.rot, s.rot, 0],
                scale: [0.9, 1, 1, 0.1],
              }}
              transition={{ duration: total, times, ease: "easeInOut" }}
            >
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle bg-foreground/30" />
              {label}
            </motion.div>
          );
        })}

      {/* Surface one — the orb */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${ORB_POS.x}%`, top: `${ORB_POS.y}%` }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
          <defs>
            <radialGradient id={`${uid}-orb`} cx="50%" cy="50%">
              <stop offset="0%" stopColor={cyan} stopOpacity="0.9" />
              <stop offset="45%" stopColor={cyan} stopOpacity="0.35" />
              <stop offset="100%" stopColor={cyan} stopOpacity="0" />
            </radialGradient>
          </defs>
          {reduced ? (
            <circle cx="60" cy="60" r="44" fill={`url(#${uid}-orb)`} opacity={0.7} />
          ) : (
            <motion.circle
              cx="60"
              cy="60"
              r="44"
              fill={`url(#${uid}-orb)`}
              animate={{ opacity: [0.45, 0.85, 0.55], scale: [1, 1.12, 1] }}
              transition={{
                duration: 4.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: SILENCE_AT,
              }}
              style={{ transformBox: "view-box", transformOrigin: "60px 60px" }}
            />
          )}
          <circle
            cx="60"
            cy="60"
            r="11"
            fill={cyan}
            style={{ filter: `drop-shadow(0 0 10px ${tint("cyan", 60)})` }}
          />
        </svg>
        <motion.p
          className="mt-1 whitespace-nowrap text-center text-xs text-muted-dark"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={settle(SILENCE_AT + 0.2)}
        >
          {COPY.orbCaption}
        </motion.p>
      </div>

      {/* Surface two — the chat */}
      <div
        className="absolute"
        style={{
          left: `${CHAT_BOX.x}%`,
          top: `${CHAT_BOX.y}%`,
          width: `${CHAT_BOX.w}%`,
        }}
      >
        <div
          className="rounded-2xl border border-glass bg-surface/80 p-4 backdrop-blur-sm"
          style={{ boxShadow: brandShadow("cyan", 40, 10) }}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: cyan }}
            />
            <span className="text-xs font-medium text-foreground/80">
              {COPY.chatName}
            </span>
          </div>
          <div className="mt-3 space-y-2" aria-hidden="true">
            <div className="h-2 w-4/5 rounded-full bg-foreground/10" />
            <div className="h-2 w-3/5 rounded-full bg-foreground/10" />
            <motion.div
              className="h-2 w-2/3 rounded-full"
              style={{ backgroundColor: tint("cyan", 35) }}
              initial={reduced ? false : { opacity: 0, scaleX: 0.3 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={settle(SILENCE_AT)}
            />
          </div>
          <div className="mt-4 rounded-lg border border-glass px-3 py-2 text-xs text-muted-dark">
            {COPY.chatPlaceholder}
          </div>
        </div>
        <motion.p
          className="mt-2 text-center text-xs text-muted-dark"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={settle(SILENCE_AT + 0.35)}
        >
          {COPY.chatCaption}
        </motion.p>
      </div>
    </div>
  );
}
