"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { COPY } from "./copy";
import type { Point } from "./layout";

/**
 * The one line a pass ends by writing.
 *
 * It is the last thing that happens and the shortest thing on the field, and
 * both of those are on purpose: after all that motion, what you are actually
 * handed is a sentence a person could have written. The rule underneath draws
 * left to right rather than fading in, so the line reads as written rather
 * than as displayed.
 *
 * It says what nothing else on the field can say — that the mass it came out
 * of is still down there, whole.
 */
export default function Account({
  at,
  shown,
  reduced,
}: {
  at: Point;
  shown: boolean;
  reduced: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${at.x}%`, top: `${at.y}%` }}
      aria-hidden="true"
    >
      <motion.span
        className="relative block whitespace-nowrap px-1 text-base text-foreground sm:text-lg"
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 6 }}
        transition={reduced ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }}
      >
        <span className="hidden sm:inline">{COPY.note.full}</span>
        <span className="sm:hidden">{COPY.note.short}</span>
        <motion.span
          className="absolute -bottom-1 left-0 h-px w-full origin-left"
          style={{
            background: `linear-gradient(to right, ${tint("cyan", 70)}, ${tint("cyan", 12)})`,
          }}
          initial={reduced ? false : { scaleX: 0 }}
          animate={{ scaleX: shown ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.65, delay: 0.15, ease: "easeOut" }}
        />
      </motion.span>
    </div>
  );
}
