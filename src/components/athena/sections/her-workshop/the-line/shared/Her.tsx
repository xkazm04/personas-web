"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";

/**
 * Athena's face - the same looping clip the hero plays, in a lit ring.
 *
 * `mood` is the only thing a scene tells her: `rest` (a slow breath), `busy`
 * (her halo keeps time with the work), `lean` (she reaches - a little larger)
 * and `hold` (she has stopped at a line - settling back on a spring, the one
 * moment she gets smaller). Scale and opacity only; callers move her with a
 * transform on their own wrapper.
 *
 * Reduced motion renders the poster frame and never mounts a <video>.
 */
export type Mood = "rest" | "busy" | "lean" | "hold";

export default function Her({
  size,
  mood,
  shown = true,
  reduced,
}: {
  size: string;
  mood: Mood;
  shown?: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);
  const scale = reduced ? 1 : mood === "lean" ? 1.08 : mood === "busy" ? 1.03 : 1;

  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      initial={false}
      animate={{ scale, opacity: shown ? 1 : 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { scale: { type: "spring", stiffness: 60, damping: 13 }, opacity: { duration: 0.6 } }
      }
    >
      <motion.span
        className="absolute -inset-[30%] rounded-full blur-2xl"
        style={{ backgroundColor: tint("cyan", 30) }}
        initial={false}
        animate={
          reduced
            ? { opacity: 0.7 }
            : mood === "busy"
              ? { opacity: [0.5, 0.95, 0.5], scale: [1, 1.12, 1] }
              : mood === "lean"
                ? { opacity: 1, scale: 1.12 }
                : { opacity: [0.75, 0.5, 0.75], scale: 1 }
        }
        transition={
          reduced
            ? { duration: 0 }
            : mood === "lean"
              ? { duration: 0.6 }
              : { duration: mood === "busy" ? 1.8 : 4.4, repeat: Infinity, ease: "easeInOut" }
        }
        aria-hidden="true"
      />
      <span
        className="relative block h-full w-full overflow-hidden rounded-full border-2"
        style={{
          borderColor: tint("cyan", 55),
          backgroundColor: tint("cyan", 6),
          boxShadow: brandShadow("cyan", 34, 40),
        }}
      >
        {reduced ? (
          <Image
            src="/athena/athena_baseline.jpg"
            alt=""
            fill
            sizes="120px"
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
      </span>
    </motion.div>
  );
}
