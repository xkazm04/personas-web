"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Athena as a floating orb — the same avatar the site tour uses
 * (AthenaCompanion's idle loop), shrunk to the desktop companion's minimized
 * orb: she breathes while idle and glides to whichever terminal needs her,
 * narrating each resolution in a caption beside her. While `reduced` (reduced
 * motion, off screen or a hidden tab) the same <video> holds its poster frame,
 * paused and not preloading: the markup never changes, only playback does
 * (the desktop's avatar resource discipline). Colours are theme tokens.
 */
export function AthenaOrb({
  x,
  y,
  resolving,
  caption,
  reduced,
}: {
  x: number;
  y: number;
  resolving: boolean;
  caption: string | null;
  reduced: boolean;
}) {
  const captionOnLeft = x > 55;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduced) video.pause();
    else video.play().catch(() => {});
  }, [reduced]);
  return (
    <motion.div
      className="pointer-events-none absolute z-10"
      initial={false}
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={reduced ? { duration: 0 } : { duration: 0.8, ease: "easeInOut" }}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        {/* Halo — swells while she works a terminal */}
        <motion.div
          className="absolute -inset-3 rounded-full bg-brand-cyan/30 blur-xl"
          initial={false}
          animate={
            reduced
              ? { opacity: resolving ? 0.9 : 0.5 }
              : resolving
                ? { opacity: [0.5, 0.95, 0.5], scale: [1, 1.18, 1] }
                : { opacity: 0.5, scale: 1 }
          }
          transition={
            resolving && !reduced ? { duration: 1.1, repeat: Infinity } : { duration: 0.4 }
          }
        />
        {/* Orb body — the tour avatar, gently breathing while idle */}
        <motion.div
          className="relative h-12 w-12 overflow-hidden rounded-full border border-brand-cyan/40 bg-brand-cyan/5 shadow-[0_0_24px_color-mix(in_srgb,var(--brand-cyan)_40%,transparent)]"
          initial={false}
          animate={reduced ? { scale: 1 } : { scale: [1, 1.05, 1] }}
          transition={reduced ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <video
            ref={videoRef}
            src="/athena/athena_idle_loop.mp4"
            poster="/athena/athena_baseline.jpg"
            muted
            loop
            playsInline
            preload={reduced ? "none" : "auto"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>
        {/* Caption — what she just handled, narrated beside her */}
        <AnimatePresence mode="wait">
          {caption && (
            <motion.div
              key={caption}
              initial={reduced ? false : { opacity: 0, x: captionOnLeft ? 4 : -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-brand-cyan/40 bg-background/90 px-3 py-1 font-mono text-[14px] text-foreground backdrop-blur-sm ${
                captionOnLeft ? "right-14" : "left-14"
              }`}
            >
              {caption}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
