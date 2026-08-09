"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import type { Rect } from "./data";

/**
 * The moving pieces of "The Glide": Athena's avatar-orb (the same face the
 * fleet grid and site tour use), the four corner brackets that snap onto a
 * target with spring micro-physics, the caption she narrates beside her,
 * and the segmented progress rail. All positions are percent coordinates
 * over the app canvas — the same rects the targets render from.
 */

/** Athena's avatar-orb gliding across the app. Reduced motion mounts the
 *  static poster instead of the idle-loop video (resource discipline). */
export function GuideOrb({
  x,
  y,
  caption,
  locked,
  reduced,
}: {
  x: number;
  y: number;
  caption: string | null;
  locked: boolean;
  reduced: boolean;
}) {
  const captionOnLeft = x > 55;
  return (
    <motion.div
      className="pointer-events-none absolute z-20"
      initial={false}
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={reduced ? { duration: 0 } : { duration: 0.85, ease: "easeInOut" }}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
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
                : { opacity: 0.5, scale: 1 }
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
              src="/athena/athena_idle_loop.mp4"
              poster="/athena/athena_baseline.jpg"
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </motion.div>
        {/* Caption — the step, narrated in ≤5 words beside her */}
        <AnimatePresence mode="wait">
          {caption && (
            <motion.div
              key={caption}
              initial={reduced ? false : { opacity: 0, scale: 0.9, x: captionOnLeft ? 6 : -6 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0 } : SPRING_POP}
              className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-brand-cyan/30 bg-surface/90 px-3 py-1 font-mono text-sm text-brand-cyan backdrop-blur-sm ${
                captionOnLeft ? "right-14" : "left-14"
              }`}
            >
              {caption}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
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

/** Segmented progress rail — one segment per walkthrough stop.
 *  (CSS transitions, not framer springs — color-mix values don't tween.) */
export function ProgressRail({ rail, reduced }: { rail: boolean[]; reduced: boolean }) {
  return (
    <div className="flex flex-1 items-center gap-1.5" aria-hidden="true">
      {rail.map((filled, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full ${reduced ? "" : "transition-all duration-500"}`}
          style={{
            backgroundColor: filled ? BRAND_VAR.cyan : tint("cyan", 12),
            boxShadow: filled ? brandShadow("cyan", 10, 45) : undefined,
          }}
        />
      ))}
    </div>
  );
}
