"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import { DAYS, nightX, type FieldLayout } from "./layout";
import { BandLabel, Slot } from "./parts";
import Pile from "./Pile";

/**
 * The top band: five days of talk, side by side, oldest at the left.
 *
 * This is the half of the scene that CHURNS. A day builds up turn by turn
 * until it reaches the line, she sleeps on it, and the next day builds up to
 * exactly the same height beside it — same volume, over and over, for as long
 * as you keep working together.
 *
 * The band itself is a box with a dashed top edge, and that edge is the whole
 * argument about WHEN she bothers: a day that fills the box has given her
 * enough to be worth a night, and a day that doesn't, hasn't. It is a line
 * being reached, never a number being hit, and one day in five deliberately
 * doesn't reach it.
 *
 * The boundaries between days are drawn from the first frame, before anything
 * has been said, so the stretch is visibly five days long from the start and
 * the scene fills it left to right rather than growing out of nothing.
 */

export default function Days({
  layout,
  band,
  days,
  steps,
  stepsPrev,
  today,
  resting,
  holding,
  reduced,
}: {
  layout: FieldLayout;
  band: ModuleStage;
  days: ModuleStage[];
  steps: number[];
  stepsPrev: number[];
  today: number;
  resting: number;
  holding: boolean;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const c = t.athenaPage.memory;
  const open = atStage(band, "shell");
  const named = atStage(band, "body");

  return (
    <>
      {/* The room a day has. It solidifies out of its own outline before the
          first day starts, so nothing a day does can move the line it is
          measured against. */}
      <Slot
        rect={{
          x: layout.band.x,
          y: layout.railY,
          w: layout.band.w,
          h: layout.baseY - layout.railY,
        }}
        solid={open}
        waiting
        reduced={reduced}
        style={{ borderColor: tint("cyan", 13), backgroundColor: tint("cyan", 2) }}
      />

      {/* Where one day ends and the next begins. */}
      {Array.from({ length: DAYS - 1 }, (_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute w-px -translate-x-1/2"
          style={{
            left: `${nightX(layout, i)}%`,
            top: `${layout.railY}%`,
            height: `${layout.baseY - layout.railY}%`,
            backgroundColor: tint("cyan", atStage(days[i + 1], "shell") ? 22 : 12),
          }}
          initial={false}
          animate={{ opacity: open ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5 }}
          aria-hidden="true"
        />
      ))}

      {/* The line "enough" means, drawn ON the band's top edge. */}
      <motion.span
        className="pointer-events-none absolute border-t border-dashed"
        style={{
          left: `${layout.band.x}%`,
          top: `${layout.railY}%`,
          width: `${layout.band.w}%`,
          borderColor: tint("cyan", 34),
        }}
        initial={false}
        animate={{ opacity: open ? 1 : 0, scaleX: open ? 1 : 0.25 }}
        transition={reduced ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
        aria-hidden="true"
      />

      {Array.from({ length: DAYS }, (_, i) => (
        <Pile
          key={i}
          layout={layout}
          day={i}
          rows={steps[i] * layout.rowsPerStep}
          rowsPrev={stepsPrev[i] * layout.rowsPerStep}
          age={today < 0 ? 0 : today - i}
          reading={resting === i}
          holding={holding}
          reduced={reduced}
        />
      ))}

      {layout.labelRailY !== null && (
        <BandLabel layout={layout} show={named} y={layout.labelRailY} reduced={reduced}>
          {c.rail}
        </BandLabel>
      )}
      <BandLabel layout={layout} show={named} y={layout.labelTalkY} i={1} reduced={reduced}>
        {c.talk}
      </BandLabel>
    </>
  );
}
