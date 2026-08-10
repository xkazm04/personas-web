"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import type { FieldLayout } from "./layout";
import { BREATH } from "./parts";

/**
 * Athena, working her way along everything you have said to her.
 *
 * She travels on ONE axis and in ONE direction: in at the oldest end, forward,
 * never back. That constraint is the section's honesty — a reader that started
 * at the newest end would leave the middle of a busy stretch with nothing ever
 * coming back for it, and no marker could make that promise true.
 *
 * All movement is a transform on a track exactly as wide as the seam, so her
 * percentage along that track and a message's percentage inside the seam are
 * the same number. Nothing here animates `left`, and nothing needs to.
 *
 * Two absences do the storytelling. Between the two sittings she is simply
 * GONE for two beats — hours pass, and the marker sits there without her — so
 * when she fades back in she is provably standing on the mark rather than
 * having slid to it. And at the end she stays, parked on the second marker,
 * quiet, with what she has not reached still ahead of her.
 */

/** Her x while she is away snaps rather than tweens: an invisible avatar
 *  sliding across the field would be motion nobody asked for. */
const GLIDE = { duration: 0.9, ease: "easeInOut" } as const;

export default function Reader({
  layout,
  frac,
  here,
  reading,
  holding,
  reduced,
}: {
  layout: FieldLayout;
  frac: number;
  here: boolean;
  reading: boolean;
  holding: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);
  const beamTop = layout.readerY;
  const beamHeight = layout.seam.y + layout.seam.h - layout.readerY;

  return (
    <div
      className="pointer-events-none absolute top-0 h-full"
      style={{ left: `${layout.seam.x}%`, width: `${layout.seam.w}%` }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ x: `${frac * 100}%` }}
        transition={reduced || !here ? { duration: 0 } : GLIDE}
      >
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: here ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.55, ease: "easeInOut" }}
        >
          {/* Her attention, spilling down onto the message she is on */}
          <motion.span
            className="absolute w-10 -translate-x-1/2 rounded-full blur-lg sm:w-14"
            style={{
              left: 0,
              top: `${beamTop}%`,
              height: `${beamHeight}%`,
              background: `linear-gradient(180deg, transparent, ${tint("cyan", 26)})`,
            }}
            initial={false}
            animate={{ opacity: reading ? 1 : 0.25 }}
            transition={{ duration: reduced ? 0 : 0.6, ease: "easeInOut" }}
          />

          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: 0, top: `${layout.readerY}%` }}
          >
            <motion.div
              className="absolute -inset-4 rounded-full blur-2xl"
              style={{ backgroundColor: tint("cyan", 30) }}
              initial={false}
              animate={
                reduced
                  ? { opacity: 0.7 }
                  : reading
                    ? { opacity: [0.6, 1, 0.6], scale: [1, 1.12, 1] }
                    : { opacity: holding ? [0.8, 0.5, 0.8] : 0.6, scale: 1 }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : reading
                    ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                    : holding
                      ? BREATH
                      : { duration: 0.6 }
              }
            />
            <motion.div
              className="relative h-14 w-14 overflow-hidden rounded-full border border-brand-cyan/40 sm:h-20 sm:w-20"
              style={{ backgroundColor: tint("cyan", 5), boxShadow: brandShadow("cyan", 30, 34) }}
              initial={false}
              animate={reduced ? undefined : { scale: [1, 1.03, 1] }}
              transition={
                reduced ? undefined : { duration: 4.6, repeat: Infinity, ease: "easeInOut" }
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
        </motion.div>
      </motion.div>
    </div>
  );
}
