"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import { RECALL_INTO } from "./data";
import { DAYS, nightX, pileRect, type FieldLayout } from "./layout";
import { BandLabel, Slot, rectStyle } from "./parts";
import Pile from "./Pile";

/**
 * The top band: five days of talk, side by side, oldest at the left - the
 * half of the scene that CHURNS. Same story as the live section; what is new
 * here is LIGHT: every day is a window lit from above by her attention while
 * it is the day being worked, and it dims one step for every day that has
 * passed since. Elapsed time is that light and nothing else - no clock, no
 * date, no counter.
 */

/** How lit a day's window is: future, today, then one step dimmer per day. */
function glowFor(age: number, holding: boolean): number {
  if (age < 0) return 0;
  if (holding) return 0.22;
  return age === 0 ? 1 : Math.max(0.16, 0.42 - age * 0.08);
}

export default function Days({
  layout,
  band,
  days,
  steps,
  stepsPrev,
  today,
  resting,
  recall,
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
  recall: number;
  holding: boolean;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const c = t.athenaPage.memory;
  const open = atStage(band, "shell");
  const named = atStage(band, "body");

  return (
    <>
      <Slot
        rect={{ x: layout.band.x, y: layout.railY, w: layout.band.w, h: layout.baseY - layout.railY }}
        solid={open}
        waiting
        reduced={reduced}
        style={{ borderColor: tint("cyan", 13), backgroundColor: tint("cyan", 2) }}
      />

      {/* Each day's window, lit from above while it is the day being worked. */}
      {Array.from({ length: DAYS }, (_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-lg"
          style={{
            ...rectStyle(pileRect(layout, i)),
            background: `linear-gradient(180deg, ${tint("cyan", 16)}, ${tint("cyan", 4)} 55%, transparent)`,
            boxShadow: `inset 0 1px 0 ${tint("cyan", 30)}`,
          }}
          initial={false}
          animate={{ opacity: glowFor(today < 0 ? -1 : today - i, holding) }}
          transition={{ duration: reduced ? 0 : 1.1, ease: "easeInOut" }}
          aria-hidden="true"
        />
      ))}

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
        className="pointer-events-none absolute origin-left border-t border-dashed"
        style={{
          left: `${layout.band.x}%`,
          top: `${layout.railY}%`,
          width: `${layout.band.w}%`,
          borderColor: tint("cyan", 40),
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
          echo={recall === 1 && i === RECALL_INTO}
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
