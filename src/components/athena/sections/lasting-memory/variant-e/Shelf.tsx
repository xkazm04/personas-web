"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import Chip from "./Chip";
import { useTranslation } from "@/i18n/useTranslation";
import { PASS_DAYS } from "./data";
import { chipRect, type FieldLayout } from "./layout";
import { Rule, Wash } from "./ink";
import { BREATH, BandLabel, Slot } from "./parts";

/**
 * The bottom band: the few things she keeps.
 *
 * This is the half of the scene that only ever GROWS. Nothing here fades with
 * age, nothing is ever taken off, and by the last frame the shelf holds more
 * than it did at the first — built out of nothing but ordinary days.
 *
 * Two rules are structural rather than decorative. A kept thing lands UNDER
 * the day it came out of and nowhere else, so the shelf fills left to right
 * for the same reason the days do, and the night that never ran leaves a hole
 * you can point at. And every one of them keeps a hairline running back up
 * through the night to the talk it came from — a thing with no source would
 * have no business being here, and the scene never draws one.
 */

export default function Shelf({
  layout,
  band,
  kept,
  landing,
  linked,
  recall,
  settle,
  holding,
  reduced,
}: {
  layout: FieldLayout;
  band: ModuleStage;
  kept: number;
  landing: number;
  linked: boolean[];
  recall: number;
  settle: boolean;
  holding: boolean;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const open = atStage(band, "shell");
  const last = kept > 0 ? chipRect(layout, PASS_DAYS[kept - 1], layout.chipsPerPass - 1) : null;
  const grown = last ? (last.x + last.w - layout.band.x) / layout.band.w : 0;

  return (
    <>
      <Slot
        rect={layout.shelf}
        solid={open}
        waiting
        reduced={reduced}
        round="rounded-2xl"
        style={{
          borderColor: tint("cyan", holding ? 30 : 20),
          backgroundColor: tint("cyan", 5),
        }}
      >
        <Wash on={settle} reduced={reduced} />
      </Slot>

      {/* How far the shelf has come. It has one direction and no other: the
          only line in the frame that never retreats. */}
      <motion.span
        className="pointer-events-none absolute origin-left rounded-full blur-[1px]"
        style={{
          left: `${layout.band.x}%`,
          top: `${layout.shelf.y + layout.shelf.h + 0.9}%`,
          width: `${layout.band.w}%`,
          height: "2px",
          backgroundColor: tint("cyan", 55),
        }}
        initial={false}
        // It never retreats inside the story, so it must not appear to at the
        // top of the loop either: with nothing kept it is simply not there.
        animate={{
          scaleX: grown,
          opacity: kept === 0 ? 0 : reduced ? 1 : holding ? [1, 0.6, 1] : 1,
        }}
        transition={
          reduced || kept === 0
            ? { duration: 0 }
            : holding
              ? { scaleX: { duration: 0.6 }, opacity: BREATH }
              : { duration: 0.7, ease: "easeOut" }
        }
        aria-hidden="true"
      />

      {PASS_DAYS.map((day, p) =>
        Array.from({ length: layout.chipsPerPass }, (_, k) => (
          <Chip
            key={`${day}-${k}`}
            layout={layout}
            day={day}
            k={k}
            shown={kept > p}
            falling={landing === p}
            hot={recall === 1 && p === 0 && k === 0}
            settle={settle}
            holding={holding}
            reduced={reduced}
          />
        )),
      )}

      {/* Back up through the night, to the day it came out of. */}
      {PASS_DAYS.map((day, p) =>
        Array.from({ length: layout.chipsPerPass }, (_, k) => {
          const c = chipRect(layout, day, k);
          return (
            <Rule
              key={`${day}-${k}`}
              origin="bottom"
              drawn={linked[p]}
              reduced={reduced}
              delay={k * 0.12}
              center
              color={tint("cyan", 26)}
              left={`${c.x + c.w / 2}%`}
              top={`${layout.baseY}%`}
              width="1px"
              height={`${layout.shelf.y - layout.baseY}%`}
            />
          );
        }),
      )}

      <BandLabel
        layout={layout}
        show={atStage(band, "body")}
        y={layout.labelShelfY}
        reduced={reduced}
      >
        {t.athenaPage.memory.shelf}
      </BandLabel>
    </>
  );
}
