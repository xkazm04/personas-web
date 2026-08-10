"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import TravelLayer from "./TravelLayer";

/**
 * Athena moving across the desk — the same face the hero and the walkthrough
 * use. Position glides on a soft spring (a little overshoot, then settle), she
 * swells while crossing and settles when the brackets lock, and a faint
 * two-dot trail drifts behind her. All of it gated off under reduced motion,
 * which mounts the static poster instead of the looping clip so nothing
 * decodes for a visitor who asked for stillness.
 *
 * Everything about her position is a percent coordinate over the app canvas —
 * the same numbers the modules and the brackets read.
 */

const GLIDE_SPRING = { type: "spring", stiffness: 55, damping: 12, mass: 0.9 } as const;
const TRAILS = [
  { stiffness: 34, damping: 14, size: "h-4 w-4", opacity: 0.35 },
  { stiffness: 22, damping: 15, size: "h-2.5 w-2.5", opacity: 0.2 },
] as const;

export function AthenaGuide({
  x,
  y,
  caption,
  captionSide,
  locked,
  traveling,
  reduced,
}: {
  x: number;
  y: number;
  caption: string | null;
  /** Which way the caption leans at sm+, so it never covers the live module. */
  captionSide: "left" | "right";
  locked: boolean;
  traveling: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);
  return (
    <>
      {/* Faint motion trail — lags her on softer springs */}
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

      <TravelLayer x={x} y={y} spring={reduced ? { duration: 0 } : GLIDE_SPRING} className="z-20">
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
              transition={
                locked && !reduced ? { duration: 1.1, repeat: Infinity } : { duration: 0.4 }
              }
            />
            {/* Her face, breathing while idle */}
            <motion.div
              className="relative h-11 w-11 overflow-hidden rounded-full border border-brand-cyan/40"
              style={{ backgroundColor: tint("cyan", 5), boxShadow: brandShadow("cyan", 24, 40) }}
              initial={false}
              animate={reduced ? undefined : { scale: [1, 1.05, 1] }}
              transition={
                reduced ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              }
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
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </motion.div>
            {/* Caption — the step, narrated in <= 5 words beside her */}
            <AnimatePresence mode="wait">
              {caption && (
                <motion.div
                  key={caption}
                  initial={
                    reduced ? false : { opacity: 0, scale: 0.9, x: captionSide === "left" ? 6 : -6 }
                  }
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={reduced ? { duration: 0 } : SPRING_POP}
                  className={`absolute whitespace-nowrap rounded-full border border-brand-cyan/30 bg-surface/90 px-3.5 py-1 font-mono text-base text-brand-cyan backdrop-blur-sm max-sm:left-1/2 max-sm:top-12 max-sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 ${
                    captionSide === "left" ? "sm:right-14" : "sm:left-14"
                  }`}
                >
                  {caption}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </TravelLayer>
    </>
  );
}
