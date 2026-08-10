"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import type { Point } from "./layout";

/**
 * Athena, at the point the sentence comes apart.
 *
 * This variant's motion language is the branching, not a travelling guide, so
 * she does not move: she is the fixed joint every thread leaves from and the
 * reason the sentence turns into work. Before you send anything she is quiet
 * and unlit; taking the sentence wakes her; while the work is out she keeps a
 * slow ring turning behind her.
 *
 * She is placed with a percent left/top plus a static centring translate —
 * nothing here animates layout, only opacity, scale and rotation.
 */
export default function BranchNode({
  at,
  awake,
  busy,
  reduced,
}: {
  at: Point;
  awake: boolean;
  busy: boolean;
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
        {/* Halo — it blooms the moment she takes the sentence */}
        <motion.span
          className="absolute -inset-4 rounded-full blur-xl"
          style={{ backgroundColor: tint("cyan", 32) }}
          initial={false}
          animate={
            reduced
              ? { opacity: awake ? 0.85 : 0.2 }
              : busy
                ? { opacity: [0.55, 1, 0.55], scale: [1, 1.14, 1] }
                : { opacity: awake ? 0.75 : 0.18, scale: 1 }
          }
          transition={busy && !reduced ? { duration: 1.6, repeat: Infinity } : { duration: 0.5 }}
        />
        {/* A slow dashed ring while the work is out */}
        <motion.span
          className="absolute -inset-2 rounded-full border border-dashed"
          style={{ borderColor: tint("cyan", awake ? 40 : 12) }}
          animate={busy && !reduced ? { rotate: 360 } : { rotate: 0 }}
          transition={
            busy && !reduced ? { duration: 26, repeat: Infinity, ease: "linear" } : { duration: 0.4 }
          }
        />
        <motion.span
          className="relative block h-12 w-12 overflow-hidden rounded-full border sm:h-14 sm:w-14"
          style={{
            borderColor: tint("cyan", awake ? 55 : 20),
            boxShadow: awake ? brandShadow("cyan", 30, 40) : undefined,
          }}
          initial={false}
          animate={{ opacity: awake ? 1 : 0.45, scale: awake ? 1 : 0.92 }}
          transition={reduced ? { duration: 0 } : { duration: 0.55, ease: "easeOut" }}
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
