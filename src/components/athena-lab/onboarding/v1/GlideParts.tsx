"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import TravelLayer from "./TravelLayer";
import type { Rect } from "./data";

/**
 * The moving pieces of "The Glide": Athena's avatar-orb (the same face the
 * fleet grid and site tour use), the four corner brackets that snap onto a
 * target with spring micro-physics, the caption she narrates beside her,
 * and the segmented progress rail. All positions are percent coordinates
 * over the app canvas — the same rects the targets render from.
 *
 * Orb journey: position glides on a soft spring (slight overshoot + settle),
 * the orb swells ~10% while traveling and settles when brackets lock, and a
 * faint two-dot trail drifts behind her — all gated off under reduced motion.
 */

/** Where the caption opens relative to her (sm+). */
const CAPTION_AT = {
  left: "sm:right-14 sm:top-1/2 sm:-translate-y-1/2",
  right: "sm:left-14 sm:top-1/2 sm:-translate-y-1/2",
  up: "sm:bottom-14 sm:left-1/2 sm:-translate-x-1/2",
} as const;

const GLIDE_SPRING = { type: "spring", stiffness: 55, damping: 12, mass: 0.9 } as const;
const TRAILS = [
  { stiffness: 34, damping: 14, size: "h-4 w-4", opacity: 0.35 },
  { stiffness: 22, damping: 15, size: "h-2.5 w-2.5", opacity: 0.2 },
] as const;


/** Athena's avatar-orb gliding across the app. Reduced motion mounts the
 *  static poster instead of the idle-loop video (resource discipline), and
 *  when the video does mount `useAvatarPlayback` keeps it paused until this
 *  section is on screen — the hero orb runs the same clip, and only one of
 *  the two ever decodes. */
export function GuideOrb({
  x,
  y,
  caption,
  step,
  side,
  locked,
  traveling,
  reduced,
}: {
  x: number;
  y: number;
  caption: string | null;
  /** 1-based stop number, set in the caption's quieter numeral voice. */
  step: number;
  side: "left" | "right" | "up";
  locked: boolean;
  traveling: boolean;
  reduced: boolean;
}) {
  const captionOnLeft = side === "left";
  const avatarRef = useAvatarPlayback(!reduced);
  return (
    <>
      {/* Faint motion trail — lags the orb on softer springs */}
      {!reduced &&
        TRAILS.map((t) => (
          <TravelLayer
            key={t.stiffness}
            x={x}
            y={y}
            spring={{ type: "spring", stiffness: t.stiffness, damping: t.damping }}
            className="z-10"
          >
            <span
              className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[3px] ${t.size}`}
              style={{ backgroundColor: tint("cyan", 55), opacity: t.opacity }}
            />
          </TravelLayer>
        ))}
      <TravelLayer
        x={x}
        y={y}
        spring={reduced ? { duration: 0 } : GLIDE_SPRING}
        className="z-20"
      >
        <motion.div
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
          initial={false}
          animate={{ scale: traveling && !reduced ? 1.12 : 1 }}
          transition={reduced ? { duration: 0 } : GLIDE_SPRING}
        >
          <div className="relative">
          {/* Halo — swells while she narrates a stop */}
          <motion.div
            className="absolute -inset-3 rounded-full blur-xl"
            style={{ backgroundColor: tint("cyan", 30) }}
            initial={false}
            animate={
              reduced
                ? { opacity: locked ? 0.9 : 0.5 }
                : locked
                  ? { opacity: [0.5, 0.95, 0.5], scale: [1, 1.16, 1] }
                  : { opacity: traveling ? 0.75 : 0.5, scale: 1 }
            }
            transition={locked && !reduced ? { duration: 1.1, repeat: Infinity } : { duration: 0.4 }}
          />
          {/* Orb body — the tour avatar, breathing while idle */}
          <motion.div
            className="relative h-11 w-11 overflow-hidden rounded-full border border-brand-cyan/40"
            style={{ backgroundColor: tint("cyan", 5), boxShadow: brandShadow("cyan", 24, 40) }}
            initial={false}
            animate={reduced ? undefined : { scale: [1, 1.05, 1] }}
            transition={reduced ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          >
            {reduced ? (
              <Image
                src="/athena/athena_baseline.jpg"
                alt=""
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            ) : (
              <video
                ref={avatarRef}
                src="/athena/athena_idle_loop.mp4"
                poster="/athena/athena_baseline.jpg"
                muted loop playsInline preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </motion.div>
          {/* Caption — the step, narrated in ≤5 words beside her */}
          <AnimatePresence mode="wait">
            {caption && (
              <motion.div
                key={caption}
                initial={reduced ? false : { opacity: 0, scale: 0.9, x: side === "up" ? 0 : captionOnLeft ? 6 : -6, y: side === "up" ? 6 : 0 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                exit={{ opacity: 0 }}
                transition={reduced ? { duration: 0 } : SPRING_POP}
                className={`absolute flex items-center gap-2.5 whitespace-nowrap rounded-full border border-brand-cyan/30 bg-surface/90 py-1 pl-2 pr-3.5 text-base backdrop-blur-sm max-sm:left-1/2 max-sm:top-12 max-sm:-translate-x-1/2 ${CAPTION_AT[side]}`}
                style={{ boxShadow: `0 8px 24px -10px ${tint("cyan", 40)}` }}
              >
                <span
                  className="rounded-full px-1.5 font-mono text-base tabular-nums text-background"
                  style={{ backgroundColor: BRAND_VAR.cyan }}
                >
                  {String(step).padStart(2, "0")}
                </span>
                <span className="font-medium text-foreground">{caption}</span>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </motion.div>
      </TravelLayer>
    </>
  );
}

/** Soft glowing ring + four crisp corner brackets snapping onto a target.
 *  Key the element by stop id so the snap replays at every stop. */
export function LockBrackets({ rect, reduced }: { rect: Rect; reduced: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute z-10"
      style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.w}%`, height: `${rect.h}%` }}
      initial={reduced ? false : { opacity: 0, scale: 1.18 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduced ? { duration: 0 } : SPRING_POP}
      aria-hidden="true"
    >
      {/* Soft glowing ring around the control */}
      <div
        className="absolute -inset-2 rounded-2xl border"
        style={{ borderColor: tint("cyan", 45), boxShadow: brandShadow("cyan", 28, 26) }}
      />
      {/* Four crisp corner brackets */}
      {(["-top-3 -left-3 border-t-2 border-l-2 rounded-tl", "-top-3 -right-3 border-t-2 border-r-2 rounded-tr", "-bottom-3 -left-3 border-b-2 border-l-2 rounded-bl", "-bottom-3 -right-3 border-b-2 border-r-2 rounded-br"] as const).map((pos) => (
        <span
          key={pos}
          className={`absolute h-4 w-4 ${pos}`}
          style={{ borderColor: BRAND_VAR.cyan, filter: `drop-shadow(0 0 4px ${tint("cyan", 60)})` }}
        />
      ))}
    </motion.div>
  );
}
