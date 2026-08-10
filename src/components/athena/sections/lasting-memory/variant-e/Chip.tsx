"use client";

import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { chipRect, dropFrom, type FieldLayout } from "./layout";
import { Wash } from "./ink";
import { SKIN, rectStyle } from "./parts";

/**
 * One durable thing she keeps.
 *
 * It ARRIVES BY FALLING: it starts at the talk it was distilled out of and
 * drops into its slot on the shelf below, which is a pure transform down the
 * one column it belongs to. Nothing about it is a new element appearing — the
 * slot is mounted for the whole loop, so the shelf is holding the place before
 * there is anything in it and nothing on the field can move underneath it.
 *
 * Once down it never dims, never moves and never leaves. The one thing that
 * ever changes about it is that it can go WARM, days later, when it turns out
 * to be the thing she needs again.
 */

/** Settled, lit up because it is being used again, and the calm lift of the
 *  closing hold. Colour rides a scoped CSS transition, never framer: `tint()`
 *  returns a `color-mix()` and framer cannot interpolate one. */
const CALM = { ring: 44, fill: 26, glow: 14 };
const HOT = { ring: 85, fill: 55, glow: 24 };
const HELD = { ring: 54, fill: 33, glow: 18 };

export default function Chip({
  layout,
  day,
  k,
  shown,
  falling,
  hot,
  settle,
  holding,
  reduced,
}: {
  layout: FieldLayout;
  day: number;
  k: number;
  shown: boolean;
  falling: boolean;
  hot: boolean;
  settle: boolean;
  holding: boolean;
  reduced: boolean;
}) {
  const skin = hot ? HOT : holding ? HELD : CALM;
  const drop = dropFrom(layout);

  return (
    <motion.div
      className="absolute"
      style={rectStyle(chipRect(layout, day, k))}
      initial={reduced ? false : { opacity: 0, y: drop }}
      animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : drop }}
      transition={
        reduced || !shown ? { duration: 0 } : { ...SPRING_POP, delay: falling ? k * 0.16 : 0 }
      }
      aria-hidden="true"
    >
      <span
        className={`absolute inset-0 rounded-md border ${SKIN}`}
        style={{
          borderColor: tint("cyan", skin.ring),
          backgroundColor: tint("cyan", skin.fill),
          boxShadow: brandShadow("cyan", skin.glow, hot ? 55 : 30),
        }}
      />
      <Wash on={settle} reduced={reduced} />
    </motion.div>
  );
}
