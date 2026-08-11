"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import type { Point } from "./layout";
import { BREATH } from "./parts";

/**
 * Athena, standing in the yard.
 *
 * She is inside the line from the moment she arrives and she never leaves it,
 * so her whole performance here is two gestures and their difference. While
 * work is going she lifts and her halo keeps time with it. When she reaches
 * past the boundary she lifts further — and then, at the stop, she comes back
 * down to rest on a spring, which is the only moment in the loop she gets
 * smaller. A withdrawal, animated as one.
 *
 * She never moves position, because moving her would make the section about
 * where she goes. All motion is scale and opacity on the compositor; nothing
 * here animates `left`/`top`, and nothing needs to.
 */
export default function Presence({
  at,
  arrived,
  working,
  reaching,
  stopped,
  calm,
  reduced,
}: {
  at: Point;
  arrived: boolean;
  working: boolean;
  reaching: boolean;
  stopped: boolean;
  calm: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);
  const leaning = reaching && !stopped;
  const busy = working && !leaning;

  return (
    <div
      className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${at.x}%`, top: `${at.y}%` }}
      aria-hidden="true"
    >
      <motion.div
        className="relative"
        initial={false}
        animate={{
          scale: reduced ? 1 : leaning ? 1.09 : busy ? 1.04 : 1,
          opacity: arrived ? 1 : 0,
        }}
        transition={
          reduced
            ? { duration: 0 }
            : { scale: { type: "spring", stiffness: 60, damping: 13 }, opacity: { duration: 0.6 } }
        }
      >
        <motion.span
          className="absolute -inset-4 rounded-full blur-2xl"
          style={{ backgroundColor: tint("cyan", 28) }}
          initial={false}
          animate={
            reduced
              ? { opacity: 0.7 }
              : leaning
                ? { opacity: 1, scale: 1.1 }
                : busy
                  ? { opacity: [0.55, 0.95, 0.55], scale: [1, 1.12, 1] }
                  : { opacity: calm ? [0.8, 0.5, 0.8] : 0.65, scale: 1 }
          }
          transition={
            reduced
              ? { duration: 0 }
              : busy
                ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                : calm && !leaning
                  ? BREATH
                  : { duration: 0.6 }
          }
        />
        <motion.span
          className="relative block h-16 w-16 overflow-hidden rounded-full border sm:h-20 sm:w-20"
          style={{
            borderColor: tint("cyan", arrived ? 50 : 20),
            backgroundColor: tint("cyan", 5),
            boxShadow: brandShadow("cyan", 30, 38),
          }}
          initial={false}
          animate={reduced ? { scale: 1 } : { scale: [1, 1.03, 1] }}
          transition={reduced ? { duration: 0 } : { duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {reduced ? (
            <Image
              src="/athena/athena_baseline.jpg"
              alt=""
              width={80}
              height={80}
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
      </motion.div>
    </div>
  );
}
