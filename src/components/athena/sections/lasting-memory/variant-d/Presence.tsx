"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import { BREATH } from "./parts";

/**
 * Athena herself, and the two rings that say what she is doing.
 *
 * The OUTER ring is how much has been said since the last time. It fills from
 * talking and from nothing else — a quiet stretch leaves it exactly where it
 * was, which is why it is a ring and not a clock face — and it empties the
 * moment a pass consumes it.
 *
 * The INNER rings only exist while the pass is running: they contract into
 * her, over and over, and they are the only motion left anywhere on the field
 * at that moment. That is the whole picture of the work happening inwardly.
 *
 * Resting is built as a STATE, not a pause: her clip stops playing, her light
 * drops to a slow low breath and her face dims. The page should honour the
 * resource discipline it is selling, and an avatar that keeps blinking while
 * it claims to be resting is a lie.
 */

/** Three rings, one gesture. */
const INWARD = [0, 0.5, 1] as const;

export default function Presence({
  shown,
  resting,
  distilling,
  pressure,
  holding,
  reduced,
}: {
  shown: boolean;
  resting: boolean;
  distilling: boolean;
  pressure: number;
  holding: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced && !resting);

  return (
    <motion.div
      className="relative h-14 w-14 md:h-20 md:w-20"
      initial={false}
      animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.85 }}
      transition={{ duration: reduced ? 0 : 0.6, ease: "easeOut" }}
    >
      <motion.span
        className="absolute -inset-5 rounded-full blur-2xl"
        style={{ backgroundColor: tint("cyan", 30) }}
        initial={false}
        animate={
          reduced
            ? { opacity: 0.7 }
            : resting
              ? { opacity: [0.35, 0.18, 0.35], scale: 1 }
              : distilling
                ? { opacity: [0.7, 1, 0.7], scale: [1, 1.1, 1] }
                : { opacity: holding ? [0.85, 0.55, 0.85] : 0.75, scale: 1 }
        }
        transition={reduced ? { duration: 0 } : resting || holding ? BREATH : { duration: 0.6 }}
      />

      {distilling &&
        !reduced &&
        INWARD.map((delay) => (
          <motion.span
            key={delay}
            className="absolute -inset-3 rounded-full border"
            style={{ borderColor: tint("cyan", 42) }}
            initial={{ scale: 1.55, opacity: 0 }}
            animate={{ scale: 0.55, opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.5, delay, repeat: Infinity, ease: "easeIn" }}
          />
        ))}

      <svg className="absolute -inset-2 md:-inset-3" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill="none" stroke={tint("cyan", 14)} strokeWidth="2.5" />
        <motion.circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={BRAND_VAR.cyan}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            rotate: -90,
            transformBox: "view-box",
            transformOrigin: "50px 50px",
            filter: `drop-shadow(0 0 3px ${tint("cyan", 60)})`,
          }}
          initial={false}
          animate={{ pathLength: shown ? pressure : 0, opacity: resting ? 0.35 : 1 }}
          transition={{ duration: reduced ? 0 : 0.7, ease: "easeInOut" }}
        />
      </svg>

      <motion.div
        className="relative h-full w-full overflow-hidden rounded-full border border-brand-cyan/40"
        style={{ backgroundColor: tint("cyan", 5), boxShadow: brandShadow("cyan", 30, 34) }}
        initial={false}
        animate={{ opacity: resting ? 0.55 : 1 }}
        transition={{ duration: reduced ? 0 : 0.7, ease: "easeInOut" }}
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
    </motion.div>
  );
}
