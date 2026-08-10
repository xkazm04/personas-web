"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import Anchor from "./Anchor";
import type { Point } from "./layout";

/**
 * Athena, floating on the surface of the talk.
 *
 * Her position is not a decision anything makes — it is the level. She rises
 * as it collects and comes down as it settles, which is what turns an abstract
 * threshold into something with a body: by the time she is at the line, the
 * pressure is visible in where she is standing.
 *
 * The one moment she leaves the surface is the pass itself, when she holds the
 * depth it reached — and the long fall back down at the end is the level
 * dropping, with her on it.
 *
 * All movement is transform-based (see `Anchor`). A slow trail lags behind on
 * softer springs so the long descent has weight.
 */

const FLOAT = { type: "spring", stiffness: 44, damping: 15, mass: 1 } as const;
const TRAILS = [
  { stiffness: 26, damping: 15, size: "h-4 w-4", opacity: 0.35 },
  { stiffness: 17, damping: 16, size: "h-2.5 w-2.5", opacity: 0.2 },
] as const;
const RINGS = [0, 1.1] as const;

export default function Presence({
  at,
  caption,
  /** A pass is running. Not something she was asked to do. */
  working,
  reduced,
}: {
  at: Point;
  caption: string | null;
  working: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);

  return (
    <>
      {!reduced &&
        TRAILS.map((t) => (
          <Anchor
            key={t.stiffness}
            at={at}
            glide={{ type: "spring", stiffness: t.stiffness, damping: t.damping }}
            className="z-10"
          >
            <span
              className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[3px] ${t.size}`}
              style={{ backgroundColor: tint("cyan", 55), opacity: t.opacity }}
            />
          </Anchor>
        ))}

      <Anchor at={at} glide={reduced ? { duration: 0 } : FLOAT} className="z-30">
        {/* The pass, seen from outside: something is going on in there */}
        {working &&
          !reduced &&
          RINGS.map((delay) => (
            <motion.span
              key={delay}
              className="absolute left-0 top-0 aspect-square w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{ borderColor: tint("cyan", 30), boxShadow: brandShadow("cyan", 24, 12) }}
              initial={{ scale: 0.12, opacity: 0 }}
              animate={{ scale: 1, opacity: [0, 0.8, 0] }}
              transition={{ duration: 2.2, delay, repeat: Infinity, ease: "easeOut" }}
            />
          ))}

        <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <motion.div
              className="absolute -inset-3 rounded-full blur-xl"
              style={{ backgroundColor: tint("cyan", 30) }}
              initial={false}
              animate={
                reduced
                  ? { opacity: 0.8 }
                  : working
                    ? { opacity: [0.55, 1, 0.55], scale: [1, 1.18, 1] }
                    : { opacity: 0.55, scale: 1 }
              }
              transition={
                working && !reduced ? { duration: 1.8, repeat: Infinity } : { duration: 0.5 }
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
                  initial={reduced ? false : { opacity: 0, scale: 0.9, x: -6 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={reduced ? { duration: 0 } : SPRING_POP}
                  // Always to her right: both layouts station her in a left
                  // gutter, so this can never be the side the basin is on.
                  className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-brand-cyan/30 bg-surface/90 px-3.5 py-1 font-mono text-base text-brand-cyan backdrop-blur-sm"
                >
                  {caption}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Anchor>
    </>
  );
}
