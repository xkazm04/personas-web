"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import type { Point } from "./layout";

/**
 * Athena, on the lane.
 *
 * There is exactly ONE of her in this scene and she is never duplicated —
 * she travels. That is the whole claim of the section rendered as a body: the
 * assistant in the third conversation is not a copy that was handed a summary,
 * it is the same one who was in the first, who simply kept going.
 *
 * She goes quiet in the gaps rather than disappearing. Days are not an
 * absence; they are just time in which nobody asked her anything.
 *
 * All movement is transform-based: the layer is exactly the field, so
 * `x: "44%"` lands her 44% across it on the compositor, without ever touching
 * `left`/`top` — which is how a sibling section made her teleport (a
 * React-applied `style.left` alongside `animate` re-asserts the destination
 * every render and leaves the tween no distance to travel).
 */

/** Long and eased: the crossing is the only thing carrying elapsed time, and a
 *  spring would make her snap into the next day. */
const TRAVEL = { duration: 1.6, ease: [0.65, 0, 0.25, 1] } as const;
const TRAILS = [
  { lag: 0.28, size: "h-3.5 w-3.5", opacity: 0.3 },
  { lag: 0.46, size: "h-2 w-2", opacity: 0.18 },
] as const;

function Anchor({
  at,
  delay,
  className = "",
  reduced,
  children,
}: {
  at: Point;
  delay: number;
  className?: string;
  reduced: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 ${className}`}
      initial={false}
      animate={{ x: `${at.x}%`, y: `${at.y}%` }}
      transition={reduced ? { duration: 0 } : { ...TRAVEL, delay }}
      aria-hidden="true"
    >
      {children}
    </motion.div>
  );
}

export default function Presence({
  at,
  dark,
  reduced,
}: {
  at: Point;
  /** She is between conversations. */
  dark: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);

  return (
    <>
      {!reduced &&
        TRAILS.map((t) => (
          <Anchor key={t.lag} at={at} delay={t.lag} reduced={reduced} className="z-10">
            <span
              className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[3px] ${t.size}`}
              style={{ backgroundColor: tint("cyan", 55), opacity: dark ? t.opacity * 0.5 : t.opacity }}
            />
          </Anchor>
        ))}

      <Anchor at={at} delay={0} reduced={reduced} className="z-30">
        <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="absolute -inset-3 rounded-full blur-xl"
            style={{ backgroundColor: tint("cyan", 30) }}
            initial={false}
            animate={{ opacity: dark ? 0.18 : 0.66 }}
            transition={reduced ? { duration: 0 } : { duration: 1 }}
          />
          <motion.div
            className="relative h-9 w-9 overflow-hidden rounded-full border md:h-11 md:w-11"
            style={{ backgroundColor: tint("cyan", 5) }}
            initial={false}
            animate={{
              borderColor: dark ? tint("cyan", 18) : tint("cyan", 45),
              boxShadow: dark ? brandShadow("cyan", 10, 8) : brandShadow("cyan", 26, 40),
            }}
            transition={reduced ? { duration: 0 } : { duration: 1 }}
            aria-hidden="true"
          >
            {reduced ? (
              <Image
                src="/athena/athena_baseline.jpg"
                alt=""
                width={44}
                height={44}
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
      </Anchor>
    </>
  );
}
