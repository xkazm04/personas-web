"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { PASS_DAYS, RECALL_INTO } from "./data";
import { chipRect, talkCenterX, type FieldLayout } from "./layout";
import { Rule } from "./ink";
import { SKIN } from "./parts";

/**
 * The payoff: the first thing she ever kept, on its way back into a day being
 * worked several days later - the only thing in the frame that runs UPWARD.
 *
 * The route draws as three legs in sequence (out of the card, along a rail
 * under the night, up into today's talk), and this pass adds the thing the
 * eye actually follows: a SPARK that rides the route a beat behind the ink and
 * flares where it lands. Then the trace cools and stays, because a thing that
 * paid off once did not stop being true.
 */

/** Leg start times, seconds. The whole run is a little over one tick. */
const LEG = [0, 0.34, 0.72] as const;
const RUN = 1.1;

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
  const ink = tint("cyan", recall === 1 ? 80 : 30);

  return (
    <>
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
        width="2px"
        height={`${from.y - layout.recallY}%`}
      />
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
        height="2px"
      />
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
        width="2px"
        height={`${layout.recallY - layout.recallTopY}%`}
      />

      {/* The spark that rides the route. A full-field track, so its x/y are
          percents of the field and the ride is pure transform. */}
      {recall === 1 && !reduced && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ x: `${fromX}%`, y: `${from.y}%` }}
          animate={{
            x: [`${fromX}%`, `${fromX}%`, `${toX}%`, `${toX}%`],
            y: [`${from.y}%`, `${layout.recallY}%`, `${layout.recallY}%`, `${layout.recallTopY}%`],
          }}
          transition={{ duration: RUN, times: [0, 0.3, 0.68, 1], ease: "easeInOut" }}
          aria-hidden="true"
        >
          <span
            className="absolute left-0 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: brandShadow("cyan", 16, 80) }}
          />
        </motion.div>
      )}

      {/* It arrives: one flare in today's talk, where it is now being used. */}
      {landing && !reduced && (
        <motion.span
          className="pointer-events-none absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
          style={{ left: `${toX}%`, top: `${layout.recallTopY}%`, backgroundColor: tint("cyan", 60) }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.8, 2.6] }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
