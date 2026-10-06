"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import Chip from "./Chip";
import { PASS_DAYS } from "./data";
import { chipRect, type FieldLayout } from "./layout";
import { Rule } from "./ink";
import { BREATH, BandLabel, Slot } from "./parts";

/**
 * The bottom band: the few things she keeps - the half of the scene that only
 * ever GROWS. Now a physical ledge: a dim alcove behind, a lit lip in front
 * that brightens left to right as far as the shelf has filled (the one line in
 * the frame that never retreats), and every kept thing standing on it under
 * the day it came out of, with a hairline back up through the night to that
 * day. The night that never ran leaves a hole you can point at.
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
  const sentences = t.athenaPage.memory.kept;
  const cards = layout.notesMode === "cards";
  const open = atStage(band, "shell");
  const last = kept > 0 ? chipRect(layout, PASS_DAYS[kept - 1], layout.chipsPerPass - 1) : null;
  const grown = last ? (last.x + last.w - layout.band.x) / layout.band.w : 0;
  const lip = { left: `${layout.band.x}%`, width: `${layout.band.w}%`, top: `${layout.ledgeY}%` };

  return (
    <>
      <Slot
        rect={{ ...layout.shelf, h: layout.ledgeY - layout.shelf.y }}
        solid={open}
        waiting
        reduced={reduced}
        round="rounded-t-2xl"
        style={{
          borderColor: tint("cyan", 9),
          background: `linear-gradient(180deg, transparent, ${tint("cyan", holding ? 9 : 5)})`,
        }}
      />

      {/* The ledge's front face. */}
      <motion.span
        className="pointer-events-none absolute rounded-b-md"
        style={{
          ...lip,
          height: `${layout.ledgeH}%`,
          background: `linear-gradient(180deg, ${tint("cyan", 22)}, ${tint("cyan", 5)})`,
          boxShadow: `0 12px 26px -10px ${tint("cyan", 26)}`,
        }}
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.6 }}
        aria-hidden="true"
      />
      {/* Its lit lip: as far as the shelf has filled, and never back. */}
      <motion.span
        className="pointer-events-none absolute origin-left rounded-full"
        style={{
          ...lip,
          height: "2px",
          marginTop: "-1px",
          backgroundColor: tint("cyan", 80),
          boxShadow: `0 0 12px ${tint("cyan", 60)}`,
        }}
        initial={false}
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
              height={`${c.y - layout.baseY}%`}
            />
          );
        }),
      )}

      {PASS_DAYS.map((day, p) =>
        Array.from({ length: layout.chipsPerPass }, (_, k) => (
          <Chip
            key={`${day}-${k}`}
            layout={layout}
            day={day}
            k={k}
            text={cards ? sentences[p] : null}
            shown={kept > p}
            falling={landing === p}
            hot={recall === 1 && p === 0 && k === 0}
            warm={recall > 0 && p === 0}
            settle={settle}
            holding={holding}
            reduced={reduced}
          />
        )),
      )}

      <BandLabel layout={layout} show={atStage(band, "body")} y={layout.labelShelfY} reduced={reduced}>
        {t.athenaPage.memory.shelf}
      </BandLabel>
    </>
  );
}
