"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import { COPY, type AthenaMode, type Point } from "./data";

/**
 * The two presences on the ground, and the difference between them.
 *
 * YOU are a small warm mark on the seam. Once the plan is confirmed you walk
 * off the field entirely — the mark travels out past the left edge and fades,
 * leaving a dashed outline where you were standing. Everything that happens
 * afterwards happens without you, and the empty outline is what says so.
 *
 * ATHENA does not leave. She holds the same spot for the whole loop: attentive
 * while you are here, quiet and steady all through the deep part of the night,
 * bright again the moment she has something to hand you. She is the constant
 * the section is actually about.
 *
 * Both move by TRANSFORM over a canvas-sized layer, never by `left`/`top` —
 * percentages resolve against the field's own box, so a walk-off costs the
 * compositor a matrix and the layout nothing.
 */

const WALK = { type: "spring", stiffness: 24, damping: 17, mass: 1 } as const;

/** Athena's halo per register — the whole night is told in these numbers. */
const HALO: Record<AthenaMode, { opacity: number; ring: number; glow: number }> = {
  attending: { opacity: 0.85, ring: 45, glow: 34 },
  keeping: { opacity: 0.42, ring: 26, glow: 18 },
  offering: { opacity: 0.9, ring: 50, glow: 38 },
};

/** You — here, then not, then here again. */
export function YouMark({
  at,
  home,
  gone,
  reduced,
}: {
  at: Point;
  home: Point;
  gone: boolean;
  reduced: boolean;
}) {
  return (
    <>
      {/* Where you were standing. Only visible once you are not. */}
      <div
        className="pointer-events-none absolute"
        style={{ left: `${home.x}%`, top: `${home.y}%` }}
        aria-hidden="true"
      >
        <motion.span
          className="absolute left-0 top-0 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed"
          style={{ borderColor: tint("amber", 32) }}
          initial={false}
          animate={{ opacity: gone ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.8 }}
        />
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={{ x: `${at.x}%`, y: `${at.y}%` }}
        transition={reduced ? { duration: 0 } : WALK}
        aria-hidden="true"
      >
        <motion.span
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
          initial={false}
          animate={{ opacity: gone ? 0 : 1 }}
          transition={{ duration: reduced ? 0 : 0.9 }}
        >
          <span
            className="block h-4 w-4 rounded-full border-2"
            style={{ borderColor: BRAND_VAR.amber, boxShadow: brandShadow("amber", 14, 45) }}
          />
          <span
            className={`absolute left-1/2 top-5 -translate-x-1/2 normal-case ${ANNOTATION_DIM}`}
          >
            {COPY.presence.you}
          </span>
        </motion.span>
      </motion.div>
    </>
  );
}

/** Athena — the one thing on this field that never goes anywhere. */
export function AthenaKeeper({
  at,
  mode,
  reduced,
}: {
  at: Point;
  mode: AthenaMode;
  reduced: boolean;
}) {
  const halo = HALO[mode];
  const avatarRef = useAvatarPlayback(!reduced);
  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: `${at.x}%`, top: `${at.y}%` }}
      aria-hidden="true"
    >
      <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="absolute -inset-4 rounded-full blur-xl transition-opacity duration-700"
          style={{ backgroundColor: tint("cyan", 34), opacity: halo.opacity }}
          initial={false}
          animate={reduced ? undefined : { scale: [1, 1.1, 1] }}
          transition={reduced ? undefined : { duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="relative h-12 w-12 overflow-hidden rounded-full border transition-[border-color,box-shadow] duration-700"
          style={{
            borderColor: tint("cyan", halo.ring),
            backgroundColor: tint("cyan", 6),
            boxShadow: brandShadow("cyan", 26, halo.glow),
          }}
          initial={false}
          animate={reduced ? undefined : { scale: [1, 1.04, 1] }}
          transition={reduced ? undefined : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {reduced ? (
            <Image
              src="/athena/athena_baseline.jpg"
              alt=""
              width={48}
              height={48}
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
    </div>
  );
}
