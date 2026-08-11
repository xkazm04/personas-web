"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";

/**
 * Athena, at the end of the bench.
 *
 * She does not move in this section, and that is deliberate. Everything else on
 * this page has her travelling — through a sentence, along a stretch of days,
 * across a portfolio. Here the whole claim is that she does NOT have to walk
 * the wall: she stands in one place and takes all of it in at once, and a
 * figure pacing from screen to screen would argue the exact opposite.
 *
 * So the only thing she does is brighten, once, for the beat her pass crosses
 * the wall. The light that travels is over there, on the wall, in `Pass`; this
 * is where it comes from.
 *
 * Her glow settles into one slow breath during the hold, so the last frame of
 * the section is calm rather than merely stopped.
 */
export default function Presence({
  at,
  looking,
  holding,
  reduced,
}: {
  at: { x: number; y: number };
  looking: boolean;
  holding: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);

  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${at.x}%`, top: `${at.y}%` }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute -inset-5 rounded-full blur-2xl"
        style={{ backgroundColor: tint("cyan", 30) }}
        initial={false}
        animate={
          reduced
            ? { opacity: 0.7, scale: 1 }
            : looking
              ? { opacity: [0.5, 1, 0.6], scale: [1, 1.22, 1.04] }
              : { opacity: holding ? [0.75, 0.45, 0.75] : 0.55, scale: 1 }
        }
        transition={
          reduced
            ? { duration: 0 }
            : looking
              ? { duration: 0.85, ease: "easeOut" }
              : holding
                ? { duration: 4.6, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.6 }
        }
      />
      <motion.div
        className="relative h-14 w-14 overflow-hidden rounded-full border border-brand-cyan/40 sm:h-20 sm:w-20"
        style={{ backgroundColor: tint("cyan", 5), boxShadow: brandShadow("cyan", 30, 34) }}
        initial={false}
        animate={reduced ? undefined : { scale: looking ? [1, 1.06, 1] : [1, 1.03, 1] }}
        transition={
          reduced
            ? undefined
            : looking
              ? { duration: 0.85, ease: "easeInOut" }
              : { duration: 4.6, repeat: Infinity, ease: "easeInOut" }
        }
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
      </motion.div>
    </div>
  );
}
