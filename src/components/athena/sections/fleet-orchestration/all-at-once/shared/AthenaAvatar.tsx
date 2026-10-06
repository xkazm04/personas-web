"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";

/**
 * Athena's face for the fleet-lab scenes: the page's own idle loop (paused off
 * screen and in a background tab by `useAvatarPlayback`), or the still poster
 * under reduced motion. Quiet and unlit until she has your sentence; a
 * breathing halo and a slow dashed ring while her team is out working.
 *
 * Fills its parent - the caller owns size and placement.
 */
export default function AthenaAvatar({
  awake,
  busy,
  reduced,
}: {
  awake: boolean;
  busy: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);
  return (
    <div className="relative h-full w-full" aria-hidden="true">
      <motion.span
        className="absolute -inset-[30%] rounded-full blur-xl"
        style={{ backgroundColor: tint("cyan", 30) }}
        initial={false}
        animate={
          busy && !reduced
            ? { opacity: [0.5, 0.95, 0.5], scale: [1, 1.12, 1] }
            : { opacity: awake ? 0.75 : 0.15, scale: 1 }
        }
        transition={busy && !reduced ? { duration: 1.8, repeat: Infinity } : { duration: 0.5 }}
      />
      <motion.span
        className="absolute -inset-[14%] rounded-full border border-dashed"
        style={{ borderColor: tint("cyan", awake ? 42 : 12) }}
        animate={busy && !reduced ? { rotate: 360 } : { rotate: 0 }}
        transition={busy && !reduced ? { duration: 26, repeat: Infinity, ease: "linear" } : { duration: 0.4 }}
      />
      <motion.span
        className="relative block h-full w-full overflow-hidden rounded-full border-2"
        style={{
          borderColor: tint("cyan", awake ? 60 : 20),
          boxShadow: awake ? brandShadow("cyan", 30, 40) : undefined,
        }}
        initial={false}
        animate={{ opacity: awake ? 1 : 0.5, scale: awake ? 1 : 0.92 }}
        transition={reduced ? { duration: 0 } : { duration: 0.55, ease: "easeOut" }}
      >
        {reduced ? (
          <Image src="/athena/athena_baseline.jpg" alt="" fill sizes="96px" className="object-cover" />
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
  );
}
