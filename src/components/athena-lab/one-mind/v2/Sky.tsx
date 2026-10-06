"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { Point } from "../shared/types";
import { LABEL, MONO } from "../shared/type";
import { ACCENTS } from "./Moment";

/**
 * The day, as light: one arc over the three moments and a light that travels
 * it - amber over the morning, green at midday, violet in the evening. Under
 * it, over each moment, the hour and the place.
 *
 * The light moves by TRANSFORM only: it lives on a full-size layer that is
 * translated by percentages of the field, so "the next stop" is one tween and
 * nothing in the layout ever moves. It changes stop on the same beat the
 * token rides the line, so the day and what you said travel together.
 */

export default function Sky({
  path,
  points,
  sun,
  captions,
  lit,
  reduced,
}: {
  path: string;
  points: readonly Point[];
  sun: number;
  captions: readonly string[];
  /** Which captions have happened yet. */
  lit: readonly boolean[];
  reduced: boolean;
}) {
  const at = points[sun];
  const glow = ACCENTS[sun];

  return (
    <>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={path} fill="none" stroke={tint("cyan", 34)} strokeWidth="0.3" strokeDasharray="0.5 1" />
      </svg>

      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={{ x: `${at.x}%`, y: `${at.y}%` }}
        transition={reduced ? { duration: 0 } : { duration: 1.7, ease: "easeInOut" }}
        aria-hidden="true"
      >
        {/* The hour's light, washed wide and soft over the day */}
        <motion.span
          className="absolute left-0 top-0 h-[60cqh] w-[60cqh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          initial={false}
          animate={{ backgroundColor: tint(glow, 9) }}
          transition={{ duration: reduced ? 0 : 1.2 }}
        />
        <motion.span
          className="absolute left-0 top-0 h-[3.2cqh] w-[3.2cqh] -translate-x-1/2 -translate-y-1/2 rounded-full"
          initial={false}
          animate={{
            backgroundColor: BRAND_VAR[glow],
            boxShadow: `0 0 28px 8px ${tint(glow, 45)}`,
          }}
          transition={{ duration: reduced ? 0 : 1.2 }}
        />
      </motion.div>

      {points.map((p, i) => (
        <span
          key={i}
          className={`pointer-events-none absolute -translate-x-1/2 whitespace-nowrap transition-opacity duration-500 ${MONO}`}
          style={{
            ...LABEL,
            left: `${p.x}%`,
            top: "12.2%",
            color: BRAND_VAR[ACCENTS[i]],
            opacity: lit[i] ? 1 : 0.6,
          }}
        >
          {captions[i]}
        </span>
      ))}
    </>
  );
}
