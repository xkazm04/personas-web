"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";

/**
 * Athena's face in a lit orb — the same idle clip the hero and the live
 * walkthrough use. Reduced motion mounts the still poster instead of the
 * video; when the video does mount, `useAvatarPlayback` keeps it paused while
 * off screen or while the tab is in the background.
 *
 * `busy` swells the halo (she is doing something); the size comes from the
 * caller's class so each variant can scale her with its art.
 */
export function AthenaOrb({
  busy,
  reduced,
  className = "h-11 w-11",
}: {
  busy: boolean;
  reduced: boolean;
  className?: string;
}) {
  const avatarRef = useAvatarPlayback(!reduced);
  return (
    <span className={`relative block ${className}`} aria-hidden="true">
      <motion.span
        className="absolute -inset-[30%] rounded-full blur-xl"
        style={{ backgroundColor: tint("cyan", 32) }}
        initial={false}
        animate={
          reduced
            ? { opacity: busy ? 0.9 : 0.55 }
            : busy
              ? { opacity: [0.55, 0.95, 0.55], scale: [1, 1.15, 1] }
              : { opacity: 0.55, scale: 1 }
        }
        transition={busy && !reduced ? { duration: 1.2, repeat: Infinity } : { duration: 0.4 }}
      />
      <span
        className="absolute inset-0 overflow-hidden rounded-full border border-brand-cyan/40"
        style={{ backgroundColor: tint("cyan", 5), boxShadow: brandShadow("cyan", 24, 40) }}
      >
        {reduced ? (
          <Image src="/athena/athena_baseline_640.webp" alt="" fill sizes="80px" className="object-cover" />
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
      </span>
    </span>
  );
}
