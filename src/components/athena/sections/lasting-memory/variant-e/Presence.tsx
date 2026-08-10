"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import { nightX, talkCenterX, type FieldLayout } from "./layout";
import { BREATH } from "./parts";

/**
 * Athena, living the stretch with you.
 *
 * She travels on one axis, one column at a time, and she never goes back — the
 * days run forward and so does she. The only other move she makes is the one
 * this whole section is about: at the end of a day that had enough in it she
 * DESCENDS, into the gap between that day and the next, and sits there for a
 * single beat while what she keeps drops onto the shelf. Then she comes back
 * up for the next day.
 *
 * On the quiet day she does not descend at all. Her track simply carries on
 * over the gap at working height, and the night mark under her stays unlit.
 * That absence is the most honest beat in the section, and it is made of
 * nothing — no new element, no label, just a move she doesn't make.
 *
 * All of it is transforms on a track exactly as wide as the stretch, so her
 * position along it and a day's position within it are the same number.
 * Nothing here animates `left` or `top`, and nothing needs to.
 */

/** One column's worth of travel, and the descent, are the same length of
 *  gesture — a day passing and a night starting should feel like one hand. */
const GLIDE = { duration: 0.85, ease: "easeInOut" } as const;

export default function Presence({
  layout,
  day,
  atNight,
  dipped,
  here,
  sleeping,
  holding,
  reduced,
}: {
  layout: FieldLayout;
  day: number;
  atNight: boolean;
  dipped: boolean;
  here: boolean;
  sleeping: boolean;
  holding: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);
  const raw = day < 0 ? 0 : atNight ? nightX(layout, day) : talkCenterX(layout, day);
  const at = Math.min(Math.max(raw, layout.readerPad), 100 - layout.readerPad);
  const frac = (at - layout.band.x) / layout.band.w;
  const dive = dipped ? layout.readerNightY - layout.readerDayY : 0;
  const beamHeight = layout.railY - layout.readerDayY;

  return (
    <div
      className="pointer-events-none absolute top-0 h-full"
      style={{ left: `${layout.band.x}%`, width: `${layout.band.w}%` }}
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
          animate={{ y: `${dive}%` }}
          transition={reduced ? { duration: 0 } : GLIDE}
        >
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: here ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : 0.55, ease: "easeInOut" }}
          >
            {/* Her attention, spilling down onto the day she is working */}
            <motion.span
              className="absolute w-10 -translate-x-1/2 rounded-full blur-lg sm:w-14"
              style={{
                left: 0,
                top: `${layout.readerDayY}%`,
                height: `${beamHeight}%`,
                background: `linear-gradient(180deg, transparent, ${tint("cyan", 24)})`,
              }}
              initial={false}
              animate={{ opacity: dipped ? 0 : 1 }}
              transition={{ duration: reduced ? 0 : 0.6, ease: "easeInOut" }}
            />

            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: 0, top: `${layout.readerDayY}%` }}
            >
              <motion.div
                className="absolute -inset-4 rounded-full blur-2xl"
                style={{ backgroundColor: tint("cyan", 30) }}
                initial={false}
                animate={
                  reduced
                    ? { opacity: 0.7 }
                    : sleeping
                      ? { opacity: [0.55, 1, 0.55], scale: [1, 1.16, 1] }
                      : { opacity: holding ? [0.8, 0.5, 0.8] : 0.6, scale: 1 }
                }
                transition={
                  reduced
                    ? { duration: 0 }
                    : sleeping
                      ? { duration: 0.9, ease: "easeInOut" }
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
      </motion.div>
    </div>
  );
}
