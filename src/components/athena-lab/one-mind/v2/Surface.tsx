"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";

/**
 * What fills the top of a moment, so no surface is an empty window.
 *
 * `History`: a typed conversation is never only today's two lines - the
 * earlier exchange sits above them as faint bars, yours on the right in the
 * hour's colour, hers on the left in her cyan.
 *
 * `VoiceRings`: the walk has no screen at all. In its place, the shape of a
 * voice - three rings round a point that swell while someone is talking and
 * rest when no one is. The swell only runs while the scene clock does.
 */

const ROWS = [
  { side: "her", w: 62 },
  { side: "you", w: 44 },
  { side: "her", w: 70 },
] as const;

export function History({ accent }: { accent: BrandKey }) {
  return (
    <span className="flex flex-col gap-[0.45em] opacity-70" aria-hidden="true">
      {ROWS.map((r, i) => (
        <span
          key={i}
          className={`h-[0.9em] rounded-full ${r.side === "you" ? "ml-auto" : "ml-[2.4em]"}`}
          style={{
            width: `${r.w}%`,
            backgroundColor: r.side === "you" ? tint(accent, 16) : tint("cyan", 13),
          }}
        />
      ))}
    </span>
  );
}

const RINGS = [1, 0.7, 0.42] as const;

export function VoiceRings({ accent, talking }: { accent: BrandKey; talking: boolean }) {
  return (
    <span className="relative mx-auto block aspect-square h-full max-h-[9em]" aria-hidden="true">
      {RINGS.map((s, i) => (
        <motion.span
          key={s}
          className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            width: `${s * 100}%`,
            borderColor: tint(i === 2 ? "cyan" : accent, 30 + i * 12),
            backgroundColor: tint(i === 2 ? "cyan" : accent, 3 + i * 3),
          }}
          initial={false}
          animate={{ scale: talking ? [1, 1.08 + i * 0.03, 1] : 1 }}
          transition={
            talking
              ? { duration: 1.1 + i * 0.25, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.5 }
          }
        />
      ))}
      <span
        className="absolute left-1/2 top-1/2 h-[14%] w-[14%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: `0 0 18px ${tint("cyan", 70)}` }}
      />
    </span>
  );
}
