"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import { BREATH } from "./parts";

/**
 * Athena, standing on the line between what she works from and what she
 * keeps.
 *
 * Her position is the staging: she is not above the archive looking down at
 * it, and she is not inside it — she is the surface, and everything that
 * "goes out of use" simply passes her going down. She never moves, at all,
 * for the whole loop. The one section on this page about things being left
 * alone should not have her walking about in it.
 *
 * She gets one gesture, and it is the announcement: a single ring that
 * crosses the whole frame at the beat she names what would go quiet first.
 * It is a look, not a hand — nothing it touches changes.
 *
 * Her caption is the only place in the section she speaks, and it lives on
 * the seam beside her rather than floating over the art, so it can never
 * land on a card and can never be mistaken for one.
 */

export default function Presence({
  caption,
  working,
  announcing,
  together,
  reduced,
}: {
  caption: string | null;
  working: boolean;
  announcing: boolean;
  together: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);

  return (
    <>
      <div className="relative shrink-0" aria-hidden="true">
        {/* The announcement, crossing the whole frame at once */}
        {announcing && !reduced && (
          <motion.span
            className="absolute left-1/2 top-1/2 aspect-square w-[3200%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ borderColor: tint("cyan", 34) }}
            initial={{ scale: 0.01, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 0.8, 0] }}
            transition={{ duration: 2.4, ease: "easeOut" }}
          />
        )}

        <motion.span
          className="absolute -inset-3 rounded-full blur-xl"
          style={{ backgroundColor: tint("cyan", 30) }}
          initial={false}
          animate={
            reduced
              ? { opacity: 0.75 }
              : working
                ? { opacity: [0.6, 1, 0.6], scale: [1, 1.12, 1] }
                : { opacity: together ? [0.85, 0.55, 0.85] : 0.65, scale: 1 }
          }
          transition={
            reduced
              ? { duration: 0 }
              : working
                ? { duration: 1.7, repeat: Infinity, ease: "easeInOut" }
                : together
                  ? BREATH
                  : { duration: 0.6 }
          }
        />

        <motion.span
          className="relative block h-12 w-12 overflow-hidden rounded-full border border-brand-cyan/40 sm:h-14 sm:w-14"
          style={{ backgroundColor: tint("cyan", 5), boxShadow: brandShadow("cyan", 30, 38) }}
          initial={false}
          animate={reduced ? undefined : { scale: [1, 1.035, 1] }}
          transition={reduced ? undefined : { duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
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

      <AnimatePresence mode="wait">
        {caption && (
          <motion.span
            key={caption}
            initial={reduced ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0 } : SPRING_POP}
            className="min-w-0 shrink truncate whitespace-nowrap rounded-full border border-brand-cyan/30 bg-surface/90 px-3.5 py-1 font-mono text-base text-brand-cyan backdrop-blur-sm"
          >
            {caption}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
}
