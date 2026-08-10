"use client";

import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";

/**
 * One reading in the lattice — the smallest unit of "she is watching this".
 *
 * Calm is a STATE here, never an absence. A fine reading is a fully drawn,
 * fully themed mark that simply has nothing to say, and it has three of them:
 *
 *   unchecked  quiet, but present and coloured — this is a check she has, not
 *              a slot waiting to load
 *   checked    brighter, and permanently so, which is how the field visibly
 *              FILLS IN behind her instead of a progress number claiming it did
 *   flagged    amber, taller, and lit — the only readings that ever leave the
 *              plane, and the only ones that get to look different
 *
 * A flagged reading that has lifted keeps its cell as a hollow dashed ring, so
 * the short list on the other side of the field never loses its address.
 *
 * Two nested motion elements on purpose: the outer one owns the composing
 * cascade (which carries a delay measured in its row and column), the inner
 * one owns the flag. Sharing an element would make the flag inherit the
 * cascade's delay and land a beat late, on the one mark that must not.
 */

/** Skin tweens ride a scoped transition — the cascade owns transform/opacity
 *  and must not be fought by a `transition-all`. */
const SKIN = "duration-500 transition-[background-color,border-color,box-shadow]";

export default function Reading({
  tone,
  checked,
  flagged,
  gone,
  delay,
  reduced,
}: {
  /** 0…1 authored weight — texture across the field, no two neighbours alike. */
  tone: number;
  checked: boolean;
  flagged: boolean;
  gone: boolean;
  delay: number;
  reduced: boolean;
}) {
  const calm = (checked ? 17 : 6) + tone * (checked ? 13 : 7);
  return (
    <motion.span
      className="min-w-0 flex-1"
      initial={reduced ? false : { opacity: 0, scale: 0.35 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.42, delay, ease: "easeOut" }}
    >
      <motion.span
        className={`block h-2 rounded-full border sm:h-2.5 ${flagged ? "border-dashed" : ""} ${SKIN}`}
        style={{
          backgroundColor: gone ? "transparent" : flagged ? tint("amber", 78) : tint("cyan", calm),
          borderColor: flagged ? tint("amber", gone ? 65 : 85) : tint("cyan", calm + 8),
          boxShadow: flagged && !gone ? brandShadow("amber", 12, 55) : undefined,
        }}
        animate={{ scaleY: flagged ? 1.55 : 1 }}
        transition={{ duration: reduced ? 0 : 0.45, ease: "easeOut" }}
        aria-hidden="true"
      />
    </motion.span>
  );
}
