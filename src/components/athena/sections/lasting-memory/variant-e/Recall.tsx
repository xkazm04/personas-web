"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { PASS_DAYS, RECALL_INTO } from "./data";
import { chipRect, talkCenterX, type FieldLayout } from "./layout";
import { Rule } from "./ink";
import { SKIN } from "./parts";

/**
 * The payoff: the first thing she ever kept, on its way back into a day being
 * worked several days later.
 *
 * Every other join in this scene runs downward — talk, night, shelf. This one
 * is the only thing in the frame that runs the other way, and that is the
 * whole reason the section is worth building: growth that accumulates is a
 * chart, growth that comes back and does work is a colleague.
 *
 * It draws as a ROUTE rather than appearing: out of the kept thing, along a
 * rail under the shelf, and up into today's talk, three segments in sequence
 * so the eye can follow where it came from. Then it cools and stays. The last
 * frame of the loop still shows the trace, quietly, because a thing that paid
 * off once did not stop being true.
 */

/** Sequenced so the route reads as travel. The whole run is a little longer
 *  than one tick on purpose — it is a moment, not a state change. */
const LEG = [0, 0.34, 0.72] as const;

export default function Recall({
  layout,
  recall,
  landing,
  reduced,
}: {
  layout: FieldLayout;
  recall: number;
  landing: boolean;
  reduced: boolean;
}) {
  const from = chipRect(layout, PASS_DAYS[0], 0);
  const fromX = from.x + from.w / 2;
  const toX = talkCenterX(layout, RECALL_INTO);
  const drawn = recall > 0;
  const ink = tint("cyan", recall === 1 ? 78 : 30);

  return (
    <>
      {/* Out of the kept thing, up to the rail. */}
      <Rule
        origin="bottom"
        drawn={drawn}
        reduced={reduced}
        delay={LEG[0]}
        duration={0.3}
        center
        className={SKIN}
        color={ink}
        left={`${fromX}%`}
        top={`${layout.recallY}%`}
        width="1px"
        height={`${from.y - layout.recallY}%`}
      />

      {/* Across the days that have passed since. */}
      <Rule
        origin="left"
        drawn={drawn}
        reduced={reduced}
        delay={LEG[1]}
        duration={0.42}
        className={SKIN}
        color={ink}
        left={`${fromX}%`}
        top={`${layout.recallY}%`}
        width={`${toX - fromX}%`}
        height="1px"
      />

      {/* And up into what she is working on now. */}
      <Rule
        origin="bottom"
        drawn={drawn}
        reduced={reduced}
        delay={LEG[2]}
        duration={0.36}
        center
        className={SKIN}
        color={ink}
        left={`${toX}%`}
        top={`${layout.recallTopY}%`}
        width="1px"
        height={`${layout.recallY - layout.recallTopY}%`}
      />

      {/* It arrives. One beat, in today's talk, where it is now being used. */}
      {landing && !reduced && (
        <motion.span
          className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
          style={{
            left: `${toX}%`,
            top: `${layout.recallTopY}%`,
            backgroundColor: tint("cyan", 60),
          }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.8, 2.4] }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
