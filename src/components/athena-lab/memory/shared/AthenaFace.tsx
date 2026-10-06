"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";

/**
 * Athena's face, the same one every /athena section uses: the looping idle
 * clip in a lit round frame, or its still poster under reduced motion (the
 * hook never decodes off screen or in a background tab). `glow` lifts the
 * halo for a beat - the moment she does something.
 */
export default function AthenaFace({
  size,
  glow,
  reduced,
}: {
  /** Any CSS length - callers pass a `cqw` calc so she scales with the art. */
  size: string;
  glow: boolean;
  reduced: boolean;
}) {
  const ref = useAvatarPlayback(!reduced);
  return (
    <span className="relative block" style={{ width: size, height: size }} aria-hidden="true">
      <motion.span
        className="absolute -inset-[30%] rounded-full blur-2xl"
        style={{ backgroundColor: tint("cyan", 32) }}
        initial={false}
        animate={{ opacity: glow ? 1 : 0.55, scale: glow ? 1.12 : 1 }}
        transition={{ duration: reduced ? 0 : 0.7, ease: "easeInOut" }}
      />
      <span
        className="absolute inset-0 overflow-hidden rounded-full border"
        style={{
          borderColor: tint("cyan", 45),
          backgroundColor: tint("cyan", 5),
          boxShadow: brandShadow("cyan", 26, 34),
        }}
      >
        {reduced ? (
          <Image
            src="/athena/athena_baseline.jpg"
            alt=""
            width={120}
            height={120}
            className="h-full w-full object-cover"
          />
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
      </span>
    </span>
  );
}
