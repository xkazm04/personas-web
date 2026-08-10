"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import Anchor from "./Anchor";
import type { Point } from "./layout";

/**
 * Athena, over the field.
 *
 * She rides the SCREEN layer, so the camera never scales her — she is the
 * one thing in the frame that is not terrain. That is also what lets her
 * LEAD: she reaches the project that needs you a beat before the camera
 * starts down, and the descent then reads as following her rather than as a
 * zoom that happens to have her in it.
 *
 * The survey is hers too: two rings leave her and cross the whole field, and
 * the plots resolve their health in the order the rings reach them. A slow
 * trail lags behind her on softer springs so a long travel has weight.
 *
 * All movement is transform-based (see `Anchor`) — animating `left`/`top`
 * across a moving camera is exactly how an earlier section made her
 * teleport.
 */

const FLIGHT = { type: "spring", stiffness: 42, damping: 14, mass: 1 } as const;
const TRAILS = [
  { stiffness: 26, damping: 15, size: "h-4 w-4", opacity: 0.35 },
  { stiffness: 17, damping: 16, size: "h-2.5 w-2.5", opacity: 0.2 },
] as const;
const RINGS = [0, 0.75] as const;

export default function Presence({
  at,
  caption,
  surveying,
  traveling,
  reduced,
}: {
  at: Point;
  caption: string | null;
  surveying: boolean;
  traveling: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);
  const captionOnLeft = at.x > 55;

  return (
    <>
      {!reduced &&
        TRAILS.map((t) => (
          <Anchor
            key={t.stiffness}
            at={at}
            spring={{ type: "spring", stiffness: t.stiffness, damping: t.damping }}
            className="z-10"
          >
            <span
              className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[3px] ${t.size}`}
              style={{ backgroundColor: tint("cyan", 55), opacity: t.opacity }}
            />
          </Anchor>
        ))}

      <Anchor at={at} spring={reduced ? { duration: 0 } : FLIGHT} className="z-30">
        {/* The survey: her look, crossing the whole field at once */}
        {surveying &&
          !reduced &&
          RINGS.map((delay) => (
            <motion.span
              key={delay}
              className="absolute left-0 top-0 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{ borderColor: tint("cyan", 34), boxShadow: brandShadow("cyan", 30, 14) }}
              initial={{ scale: 0.02, opacity: 0 }}
              animate={{ scale: 1, opacity: [0, 0.9, 0] }}
              transition={{ duration: 2.6, delay, ease: "easeOut" }}
            />
          ))}

        <motion.div
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
          initial={false}
          animate={{ scale: traveling && !reduced ? 1.12 : 1 }}
          transition={reduced ? { duration: 0 } : FLIGHT}
        >
          <div className="relative">
            <motion.div
              className="absolute -inset-3 rounded-full blur-xl"
              style={{ backgroundColor: tint("cyan", 30) }}
              initial={false}
              animate={
                reduced
                  ? { opacity: 0.8 }
                  : surveying || traveling
                    ? { opacity: [0.55, 1, 0.55], scale: [1, 1.16, 1] }
                    : { opacity: 0.6, scale: 1 }
              }
              transition={
                (surveying || traveling) && !reduced
                  ? { duration: 1.6, repeat: Infinity }
                  : { duration: 0.5 }
              }
            />
            <motion.div
              className="relative h-10 w-10 overflow-hidden rounded-full border border-brand-cyan/40 sm:h-11 sm:w-11"
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
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {caption && (
                <motion.div
                  key={caption}
                  initial={reduced ? false : { opacity: 0, scale: 0.9, x: captionOnLeft ? 6 : -6 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={reduced ? { duration: 0 } : SPRING_POP}
                  className={`absolute whitespace-nowrap rounded-full border border-brand-cyan/30 bg-surface/90 px-3.5 py-1 font-mono text-base text-brand-cyan backdrop-blur-sm max-sm:left-1/2 max-sm:top-11 max-sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 ${
                    captionOnLeft ? "sm:right-14" : "sm:left-14"
                  }`}
                >
                  {caption}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </Anchor>
    </>
  );
}
