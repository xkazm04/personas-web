"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { COPY } from "./data";
import { SIZE, C, GLOW_R, GUIDE_R, ORB_PCT, DOTS, dotTrackPath, spinOrigin } from "./presence-geometry";

/**
 * Athena hero — variant A, "Presence".
 *
 * Cinematic, intimate, orb-first: a commanding dark stage where the real
 * Athena avatar is the undisputed centerpiece at large scale. The art IS
 * the component — the breathing glow (her voice), the 5-dot task arc on
 * the orb perimeter, and a quiet stat whisper carry the story. Typography
 * lives in an owned scrim zone at the base that the art never fights.
 *
 * All continuous motion is gated on `prefers-reduced-motion`, which also
 * swaps the looping <video> for a static poster (no video mount at all).
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function AthenaPresenceHero() {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();
  const cyan = BRAND_VAR.cyan;

  /** Self-driven entrance (no inherited variants); a no-op under reduced motion. */
  const enter = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  return (
    <section className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      {/* Stage lighting — a single key light behind the orb, a low warm floor */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-[36%] h-[min(130vmin,940px)] w-[min(130vmin,940px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `radial-gradient(circle, ${tint("cyan", 8)} 0%, transparent 62%)` }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[44%]"
          style={{ background: `linear-gradient(to top, ${tint("purple", 5)}, transparent)` }}
        />
      </div>

      {/* The orb — Athena herself, at scale */}
      <div className="relative z-[1] flex flex-1 items-center justify-center px-6 pt-16 sm:pt-20">
        <motion.div
          {...(reduced
            ? {}
            : {
                initial: { opacity: 0, scale: 0.94 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 1.3, ease: EASE },
              })}
          className="relative aspect-square w-full max-w-[min(80vmin,560px)]"
        >
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <radialGradient id={`${uid}-glow`} cx="50%" cy="50%">
                <stop offset="0%" stopColor={cyan} stopOpacity="0.4" />
                <stop offset="100%" stopColor={cyan} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Breathing ambient glow — driven by her voice on desktop */}
            {reduced ? (
              <circle cx={C} cy={C} r={GLOW_R} fill={`url(#${uid}-glow)`} opacity={0.5} />
            ) : (
              <motion.circle
                cx={C}
                cy={C}
                r={GLOW_R}
                fill={`url(#${uid}-glow)`}
                animate={{ opacity: [0.35, 0.62, 0.35], scale: [1, 1.05, 1] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                style={spinOrigin}
              />
            )}

            {/* Slowly rotating dashed guide ring */}
            {reduced ? (
              <circle cx={C} cy={C} r={GUIDE_R} fill="none" stroke="rgba(var(--surface-overlay), 0.08)" strokeWidth="1" strokeDasharray="3 8" />
            ) : (
              <motion.circle
                cx={C}
                cy={C}
                r={GUIDE_R}
                fill="none"
                stroke="rgba(var(--surface-overlay), 0.08)"
                strokeWidth="1"
                strokeDasharray="3 8"
                animate={{ rotate: 360 }}
                transition={{ duration: 110, repeat: Infinity, ease: "linear" }}
                style={spinOrigin}
              />
            )}

            {/* Task-progress arc — up to 5 dots riding the orb perimeter */}
            <path d={dotTrackPath} fill="none" stroke={tint("cyan", 14)} strokeWidth="1" />
            {DOTS.map((d, i) =>
              reduced ? (
                <circle key={i} cx={d.x} cy={d.y} r={5} fill={cyan} opacity={0.5} />
              ) : (
                <motion.circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r={5}
                  fill={cyan}
                  animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1.25, 0.85] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.22 }}
                  style={{ transformBox: "view-box", transformOrigin: `${d.x}px ${d.y}px` }}
                />
              ),
            )}
          </svg>

          {/* The real Athena avatar — looping clip, or poster under reduced motion */}
          <div
            className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
            style={{ width: ORB_PCT, boxShadow: brandShadow("cyan", 72, 26), outline: `2px solid ${tint("cyan", 50)}`, outlineOffset: "-1px" }}
          >
            {reduced ? (
              // eslint-disable-next-line @next/next/no-img-element -- static poster fallback; next/image adds no value for a fixed local asset
              <img src="/athena/athena_baseline.jpg" alt={COPY.avatarAlt} className="h-full w-full object-cover" />
            ) : (
              <video
                src="/athena/athena_idle_loop.mp4"
                poster="/athena/athena_baseline.jpg"
                muted
                loop
                autoPlay
                playsInline
                preload="auto"
                aria-label={COPY.avatarAlt}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Scrim zone — typography owns this band; the art fades into it */}
      <div className="relative z-[2] px-6 pb-12 pt-10 sm:pb-16">
        <div className="pointer-events-none absolute inset-x-0 -top-44 bottom-0 bg-gradient-to-t from-background via-background/85 to-transparent" aria-hidden="true" />
        <div className="relative mx-auto max-w-2xl text-center">
          <motion.p {...enter(0.4)} className="font-mono text-xs uppercase tracking-[0.3em] text-muted-dark">
            {COPY.eyebrow}
          </motion.p>
          <motion.h1 {...enter(0.55)} className="mt-4 text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
            {COPY.headline}
          </motion.h1>
          <motion.p {...enter(0.7)} className="mt-4 text-xl text-foreground/80 sm:text-2xl">
            {COPY.tagline}
          </motion.p>
          <motion.p {...enter(0.85)} className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-dark">
            {COPY.persona}
          </motion.p>

          <motion.div {...enter(1)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#"
              className="rounded-full px-6 py-3 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
              style={{ backgroundColor: cyan, boxShadow: brandShadow("cyan", 36, 30) }}
            >
              {COPY.ctaPrimary}
            </a>
            <a
              href="#"
              className="rounded-full border border-glass px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-glass-hover"
            >
              {COPY.ctaSecondary}
            </a>
          </motion.div>

          <motion.p {...enter(1.15)} className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-dark">
            <span>{COPY.hotkeyLabel}</span>
            <kbd className="rounded-md border border-glass bg-surface px-2 py-0.5 font-mono text-[11px] text-muted-dark">{COPY.hotkey}</kbd>
          </motion.p>
          <motion.p {...enter(1.3)} className="mt-5 font-mono text-[11px] tracking-wide text-muted-dark">
            {COPY.statWhisper}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
