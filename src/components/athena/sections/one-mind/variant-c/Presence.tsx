"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import type { Point } from "./layout";
import { BREATH } from "./parts";

/**
 * Athena, at the centre of everything she is holding.
 *
 * She is the one element in this section that never moves, and that is the
 * staging: four sections have shown her going somewhere, and the closing one
 * shows her already there. All movement is scale and opacity on the
 * compositor; nothing here animates `left`/`top`, and nothing needs to.
 *
 * She is also, deliberately, SILENT. Every other scene on this page gives her
 * a caption; here her answer is the open conversation itself, and a second
 * line of her words floating beside her would be exactly the thing the
 * section promises never happens — two of her talking at once.
 *
 * Two gestures, and they are opposites. `reaching` sends rings OUT, once, to
 * touch every conversation at the moment she goes looking. `chorus` sends one
 * slow ring out at the beat where everything answers together. After that she
 * settles onto the shared BREATH with no offset, so her glow and every panel
 * in the frame rise and fall as one thing.
 */

const RINGS = [0, 0.7] as const;

export default function Presence({
  at,
  reaching,
  working,
  chorus,
  together,
  reduced,
}: {
  at: Point;
  reaching: boolean;
  working: boolean;
  chorus: boolean;
  together: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);

  return (
    <div
      className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${at.x}%`, top: `${at.y}%` }}
      aria-hidden="true"
    >
      {/* Her look, crossing every conversation at once */}
      {reaching &&
        !reduced &&
        RINGS.map((delay) => (
          <motion.span
            key={delay}
            className="absolute left-1/2 top-1/2 aspect-square w-[420%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{ borderColor: tint("cyan", 30), boxShadow: brandShadow("cyan", 26, 12) }}
            initial={{ scale: 0.06, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 0.85, 0] }}
            transition={{ duration: 2.8, delay, ease: "easeOut" }}
          />
        ))}

      {/* One voice: a single slow ring at the beat everything answers together */}
      {chorus && !reduced && (
        <motion.span
          className="absolute left-1/2 top-1/2 aspect-square w-[640%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ borderColor: tint("cyan", 44) }}
          initial={{ scale: 0.05, opacity: 0 }}
          animate={{ scale: 1, opacity: [0, 0.9, 0] }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
      )}

      <motion.div
        className="relative"
        initial={false}
        animate={{ scale: working && !reduced ? 1.06 : 1 }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 50, damping: 14 }}
      >
        <motion.div
          className="absolute -inset-5 rounded-full blur-2xl"
          style={{ backgroundColor: tint("cyan", 30) }}
          initial={false}
          animate={
            reduced
              ? { opacity: 0.75 }
              : working
                ? { opacity: [0.6, 1, 0.6], scale: [1, 1.14, 1] }
                : { opacity: together ? [0.85, 0.55, 0.85] : 0.7, scale: 1 }
          }
          transition={
            reduced
              ? { duration: 0 }
              : working
                ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                : together
                  ? BREATH
                  : { duration: 0.6 }
          }
        />
        <motion.div
          // Larger than she is anywhere else on the page. Four sections have
          // shown her doing something; the last one is of her.
          className="relative h-16 w-16 overflow-hidden rounded-full border border-brand-cyan/40 sm:h-24 sm:w-24"
          style={{ backgroundColor: tint("cyan", 5), boxShadow: brandShadow("cyan", 34, 40) }}
          initial={false}
          animate={reduced ? undefined : { scale: [1, 1.035, 1] }}
          transition={reduced ? undefined : { duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {reduced ? (
            <Image
              src="/athena/athena_baseline.jpg"
              alt=""
              width={96}
              height={96}
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
      </motion.div>
    </div>
  );
}
