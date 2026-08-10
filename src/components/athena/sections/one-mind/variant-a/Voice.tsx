"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { useAvatarPlayback } from "@/components/athena/stage/useAvatarPlayback";
import Anchor from "./Anchor";
import { voicePoint, type FieldLayout } from "./layout";

/**
 * Athena — and there is exactly one of her on this field, ever.
 *
 * That is the point of the whole layer. She does not appear in a conversation
 * and disappear from it; she TRAVELS, on one transform, from the seat every
 * conversation holds open for her to the next one, and back to what she knows
 * when she is in none of them. However many conversations are live at once —
 * and one of them keeps visibly working the entire time she is elsewhere —
 * you can only ever find her in one place, because there is only one of her.
 *
 * She rides the screen layer, so nothing scales her and nothing here animates
 * `left`/`top`. Every conversation reserves her seat whether she is in it or
 * not, so arriving can never cover a word.
 */

const TRAVEL = { type: "spring", stiffness: 46, damping: 15, mass: 1 } as const;

export default function Voice({
  layout,
  station,
  speaking,
  compact,
  reduced,
}: {
  layout: FieldLayout;
  /** Which conversation she is in; -1 when she is in none of them. */
  station: number;
  /** She is the one saying this beat's line. */
  speaking: boolean;
  compact: boolean;
  reduced: boolean;
}) {
  const avatarRef = useAvatarPlayback(!reduced);
  const at = station < 0 ? layout.home : voicePoint(layout, station);
  const size = compact ? "h-7 w-7" : "h-9 w-9";

  return (
    <Anchor at={at} transition={reduced ? { duration: 0 } : TRAVEL} className="z-30">
      <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <motion.span
            className="absolute -inset-2 rounded-full blur-lg"
            style={{ backgroundColor: tint("cyan", 34) }}
            initial={false}
            animate={
              reduced
                ? { opacity: 0.75 }
                : speaking
                  ? { opacity: [0.6, 1, 0.6], scale: [1, 1.2, 1] }
                  : { opacity: 0.55, scale: 1 }
            }
            transition={
              speaking && !reduced ? { duration: 1.4, repeat: Infinity } : { duration: 0.5 }
            }
            aria-hidden="true"
          />
          <motion.span
            className={`relative block overflow-hidden rounded-full border ${size}`}
            style={{
              borderColor: tint("cyan", 55),
              backgroundColor: tint("cyan", 6),
              boxShadow: brandShadow("cyan", 22, 40),
            }}
            initial={false}
            animate={reduced ? undefined : { scale: [1, 1.05, 1] }}
            transition={reduced ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          >
            {reduced ? (
              <Image
                src="/athena/athena_baseline.jpg"
                alt=""
                width={36}
                height={36}
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
    </Anchor>
  );
}
