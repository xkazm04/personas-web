"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import type { Point } from "./layout";
import MemoryRing from "./MemoryRing";
import { BREATH } from "../shared/parts";

/**
 * Athena, at the centre of everything she is holding - and, new in this
 * version, the memory she holds it in: a ring of light around her that fills
 * one point per conversation as each thread lands (./MemoryRing). She stays
 * silent; her answer is the open conversation itself.
 *
 * Her size is a share of the art's height (cqh), so she is the same presence
 * on a laptop and on a 1440p monitor. All movement is scale and opacity.
 */

const SIZE = "clamp(4.25rem, min(17cqh, 9cqw), 9.5rem)";
const RINGS = [0, 0.7] as const;

export default function Presence({
  at,
  angles,
  motes,
  spin,
  reaching,
  working,
  chorus,
  together,
  reduced,
  running,
}: {
  at: Point;
  angles: readonly number[];
  motes: number;
  spin: number;
  reaching: boolean;
  working: boolean;
  chorus: boolean;
  together: boolean;
  reduced: boolean;
  running: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);

  return (
    <div
      className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${at.x}%`, top: `${at.y}%`, width: SIZE, height: SIZE }}
      aria-hidden="true"
    >
      {reaching &&
        !reduced &&
        RINGS.map((delay) => (
          <motion.span
            key={delay}
            className="absolute left-1/2 top-1/2 aspect-square w-[460%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{ borderColor: tint("cyan", 30), boxShadow: brandShadow("cyan", 26, 12) }}
            initial={{ scale: 0.06, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 0.85, 0] }}
            transition={{ duration: 2.8, delay, ease: "easeOut" }}
          />
        ))}

      {chorus && !reduced && (
        <motion.span
          className="absolute left-1/2 top-1/2 aspect-square w-[700%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ borderColor: tint("cyan", 44) }}
          initial={{ scale: 0.05, opacity: 0 }}
          animate={{ scale: 1, opacity: [0, 0.9, 0] }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
      )}

      <MemoryRing angles={angles} motes={motes} spin={spin} together={together} running={running} reduced={reduced} />

      <motion.div
        className="relative h-full w-full"
        initial={false}
        animate={{ scale: working && running ? 1.05 : 1 }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 50, damping: 14 }}
      >
        <motion.div
          className="absolute -inset-[30%] rounded-full blur-2xl"
          style={{ backgroundColor: tint("cyan", 28) }}
          initial={false}
          animate={
            !running
              ? { opacity: 0.75, scale: 1 }
              : working
                ? { opacity: [0.6, 1, 0.6], scale: [1, 1.14, 1] }
                : { opacity: together ? [0.85, 0.55, 0.85] : 0.7, scale: 1 }
          }
          transition={
            !running
              ? { duration: 0.4 }
              : working
                ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                : together
                  ? BREATH
                  : { duration: 0.6 }
          }
        />
        <div
          className="relative h-full w-full overflow-hidden rounded-full border"
          style={{
            borderColor: tint("cyan", 45),
            backgroundColor: tint("cyan", 5),
            boxShadow: brandShadow("cyan", 34, 40),
          }}
        >
          {reduced ? (
            <Image
              src="/athena/athena_baseline_640.webp"
              alt=""
              fill
              sizes="160px"
              className="object-cover"
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
        </div>
      </motion.div>
    </div>
  );
}
