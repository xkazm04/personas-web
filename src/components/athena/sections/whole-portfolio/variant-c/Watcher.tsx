"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import type { Point } from "./layout";

/**
 * Athena, at the foot of the field.
 *
 * She is the one thing in this scene that never moves and never goes out. No
 * sweep, no scan, no beam picking projects off one at a time — the two sibling
 * variants own the survey, and this one is about the fact that somebody was
 * simply awake the entire time you were not. So her only motion for twenty of
 * the twenty-five ticks is a slow breath.
 *
 * She lifts exactly once, on the beat she has something to say, and that lift
 * is the loudest thing that happens in the section — which is only possible
 * because she spent the preceding eight ticks doing nothing at all.
 *
 * Placed with a percent left/top plus a static centring translate: nothing here
 * animates layout, only opacity and scale.
 */
export default function Watcher({
  at,
  alert,
  reduced,
}: {
  at: Point;
  alert: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);
  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${at.x}%`, top: `${at.y}%` }}
      aria-hidden="true"
    >
      <div className="relative">
        {/* The halo she keeps burning the whole loop */}
        <motion.span
          className="absolute -inset-5 rounded-full blur-xl"
          style={{ backgroundColor: tint("cyan", 30) }}
          initial={false}
          animate={
            reduced
              ? { opacity: alert ? 0.9 : 0.45, scale: 1 }
              : alert
                ? { opacity: [0.7, 1, 0.7], scale: [1, 1.16, 1] }
                : { opacity: [0.34, 0.5, 0.34], scale: [1, 1.05, 1] }
          }
          transition={
            reduced
              ? { duration: 0 }
              : { duration: alert ? 1.7 : 5.4, repeat: Infinity, ease: "easeInOut" }
          }
        />
        {/* A steady ring — she has an outline even when nothing is happening */}
        <span
          className={`absolute -inset-2.5 rounded-full border ${reduced ? "" : "duration-700 transition-[border-color]"}`}
          style={{ borderColor: tint("cyan", alert ? 45 : 18) }}
        />
        <motion.span
          className={`relative block h-12 w-12 overflow-hidden rounded-full border sm:h-14 sm:w-14 ${
            reduced ? "" : "duration-700 transition-[border-color,box-shadow]"
          }`}
          style={{
            borderColor: tint("cyan", alert ? 60 : 32),
            boxShadow: brandShadow("cyan", alert ? 34 : 18, alert ? 45 : 26),
          }}
          initial={false}
          animate={{ scale: alert && !reduced ? 1.06 : 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
        >
          {reduced ? (
            <Image
              src="/athena/athena_baseline.jpg"
              alt=""
              width={56}
              height={56}
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
        </motion.span>
      </div>
    </div>
  );
}
