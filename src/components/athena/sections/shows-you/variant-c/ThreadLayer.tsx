"use client";

// PROTOTYPE COPY — extract to src/i18n at assembly
import { useId } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import type { Vec } from "./threadData";

/*
 * The luminous thread + its head. One layer per breakpoint layout (the
 * desktop zigzag and the mobile serpentine share phase state but carry
 * their own waypoint geometry), toggled with hidden/md:hidden classes.
 *
 * Three strokes, back to front: the faint dashed full route (where the
 * journey will go), a soft glow underlay, and the gradient thread whose
 * pathLength tween draws — and on retract, rewinds — the journey.
 */

export default function ThreadLayer({
  points,
  progress,
  orb,
  locked,
  reduced,
  className,
}: {
  points: Vec[];
  /** 0..1 fraction of the route drawn at the current phase. */
  progress: number;
  /** Waypoint the thread head is gliding toward. */
  orb: Vec;
  /** True while brackets are engaged on a panel — the halo swells. */
  locked: boolean;
  reduced: boolean;
  className?: string;
}) {
  const uid = useId();
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const draw = reduced ? { duration: 0 } : { duration: 1.5, ease: "easeInOut" as const };

  return (
    <div className={`pointer-events-none absolute inset-0 ${className ?? ""}`} aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${uid}-thread`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={BRAND_VAR.cyan} />
            <stop offset="1" stopColor={BRAND_VAR.purple} />
          </linearGradient>
        </defs>

        {/* Faint dashed full route — where the journey will go */}
        <path
          d={d}
          fill="none"
          stroke={tint("cyan", 20)}
          strokeWidth={1.25}
          strokeDasharray="0.7 2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Glow underlay for the drawn portion */}
        <motion.path
          d={d}
          fill="none"
          stroke={tint("cyan", 28)}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={false}
          animate={{ pathLength: progress }}
          transition={draw}
        />

        {/* The thread itself */}
        <motion.path
          d={d}
          fill="none"
          stroke={`url(#${uid}-thread)`}
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={false}
          animate={{ pathLength: progress }}
          transition={draw}
        />
      </svg>

      {/* Thread head — Athena's avatar orb gliding waypoint to waypoint */}
      <motion.div
        className="absolute z-20"
        initial={false}
        animate={{ left: `${orb.x}%`, top: `${orb.y}%` }}
        transition={reduced ? { duration: 0 } : { duration: 1.5, ease: "easeInOut" }}
        style={{ left: `${orb.x}%`, top: `${orb.y}%` }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          {/* Halo — swells while brackets are engaged */}
          <motion.div
            className="absolute -inset-2.5 rounded-full blur-lg"
            style={{ backgroundColor: tint("cyan", 32) }}
            initial={false}
            animate={
              reduced
                ? { opacity: locked ? 0.9 : 0.5 }
                : locked
                  ? { opacity: [0.5, 0.95, 0.5], scale: [1, 1.16, 1] }
                  : { opacity: 0.5, scale: 1 }
            }
            transition={locked && !reduced ? { duration: 1.1, repeat: Infinity } : { duration: 0.4 }}
          />
          <div
            className="relative h-10 w-10 overflow-hidden rounded-full border border-brand-cyan/40"
            style={{ boxShadow: brandShadow("cyan", 22, 40) }}
          >
            <Image
              src="/athena/athena_baseline.jpg"
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
