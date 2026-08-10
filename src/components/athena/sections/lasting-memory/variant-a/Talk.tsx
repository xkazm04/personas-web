"use client";

import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { ROWS } from "./copy";
import { FULL, REACH, type SceneState } from "./data";
import { rowRect, rowShift, sinkY, slotTop, type FieldLayout } from "./layout";

/**
 * The talk itself — what you actually said, seen from far enough away to be
 * volume rather than words.
 *
 * A pill is placed once, at the slot it was AUTHORED into, and everything it
 * ever does afterwards is a transform: it presses down into the settled band
 * when a pass takes it, or it drops to a lower slot when the pass could not
 * reach it. Nothing here writes `top`, so the level can fall the height of the
 * basin without a single layout pass.
 *
 * The two sides are you and her. Alternating them is what makes a rising
 * volume read as conversation and not as a progress bar — which is the only
 * job this layer has, since it carries no type at all.
 *
 * The three pills a pass could not reach are the honest beat. They are marked
 * where they stand, they stay bright while the rest goes quiet, and then they
 * come down and become the bottom of the next tide.
 */

const SINK = { duration: 1.05, ease: "easeIn" } as const;
const DROP = { type: "spring", stiffness: 90, damping: 17 } as const;
const ARRIVE = { type: "spring", stiffness: 150, damping: 18 } as const;

/** Colour rides a scoped CSS transition, never framer's `animate`: the page's
 *  palette is `color-mix()` on a theme variable, which framer cannot
 *  interpolate — it logs and then snaps. CSS mixes it happily. Transforms and
 *  opacity stay with framer, where the springs are. */
const SKIN = "transition-[background-color,box-shadow] duration-500";

export default function Talk({
  layout: L,
  scene,
  reduced,
}: {
  layout: FieldLayout;
  scene: SceneState;
  reduced: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {ROWS.map((row, i) => {
        if (i >= scene.mounted) return null;

        // Rows that arrive AFTER the drop were authored straight into the slot
        // they belong in, so their resting place is already correct and they
        // never carry a shift of their own.
        const base = i < FULL ? i : i - REACH;
        const taken = scene.taken && i < REACH;
        const slot = scene.dropped && i >= REACH && i < FULL ? i - REACH : base;
        const rect = rowRect(L, base, row.side, row.w);

        const distance = taken
          ? sinkY(L, i) - (slotTop(L, base) + L.rowH / 2)
          : slotTop(L, slot) - slotTop(L, base);
        const y = `${rowShift(L, distance)}%`;

        const marked = scene.marked && !taken && i < REACH;
        const deferred = scene.marked && i >= REACH && i < FULL;
        const fill = taken
          ? tint("cyan", 26)
          : tint("cyan", row.side === 0 ? 34 : 20);

        return (
          <motion.span
            key={i}
            className={`absolute rounded-full ${reduced ? "" : SKIN}`}
            style={{
              left: `${rect.x}%`,
              top: `${rect.y}%`,
              width: `${rect.w}%`,
              height: `${rect.h}%`,
              backgroundColor: fill,
              boxShadow: deferred
                ? `0 0 0 1px ${tint("amber", 55)}, ${brandShadow("amber", 10, 30)}`
                : marked
                  ? brandShadow("cyan", 10, 45)
                  : undefined,
            }}
            initial={reduced ? false : { opacity: 0, y: "-180%", scaleX: 0.82 }}
            animate={{
              opacity: taken ? 0.34 : 1,
              y,
              scaleX: marked ? 1.03 : 1,
              scaleY: taken ? 0.16 : 1,
            }}
            transition={
              reduced
                ? { duration: 0 }
                : taken
                  ? { ...SINK, delay: i * 0.045 }
                  : scene.dropped && i >= REACH && i < FULL
                    ? DROP
                    : ARRIVE
            }
          />
        );
      })}
    </div>
  );
}
