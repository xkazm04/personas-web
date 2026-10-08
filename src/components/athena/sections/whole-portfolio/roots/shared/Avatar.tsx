"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";

/**
 * Athena's face, as every /athena scene draws her: the idle clip in a small
 * luminous disc with a soft halo. `busy` swells the halo (she is looking,
 * travelling, working); `live` gates every loop. Reduced motion never mounts
 * a <video> - the poster stands in (this tree is client-only, ssr:false).
 */
export default function Avatar({
  busy,
  live,
  reduced,
  size = "h-10 w-10 sm:h-11 sm:w-11",
}: {
  busy: boolean;
  live: boolean;
  reduced: boolean;
  size?: string;
}) {
  const ref = useAvatarPlayback(!reduced);
  return (
    <div className="relative" aria-hidden="true">
      <motion.div
        className="absolute -inset-3 rounded-full blur-xl"
        style={{ backgroundColor: tint("cyan", 30) }}
        initial={false}
        animate={
          live && busy ? { opacity: [0.55, 1, 0.55], scale: [1, 1.18, 1] } : { opacity: 0.65, scale: 1 }
        }
        transition={live && busy ? { duration: 1.6, repeat: Infinity } : { duration: reduced ? 0 : 0.5 }}
      />
      <div
        className={`relative overflow-hidden rounded-full border ${size}`}
        style={{
          borderColor: tint("cyan", 45),
          backgroundColor: tint("cyan", 5),
          boxShadow: brandShadow("cyan", 24, 40),
        }}
      >
        {reduced ? (
          <Image src="/athena/athena_baseline.jpg" alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <video
            ref={ref}
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
    </div>
  );
}
