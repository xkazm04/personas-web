"use client";

import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import type { Rect } from "./layout";
import { Part, Slot } from "./parts";

/**
 * How much she does on her own — and whose hand it is under.
 *
 * The dial is the only control in the scene, and it stands OUTSIDE the line
 * on purpose: everything she may touch is inside the yard, and the thing that
 * decides how much she does is not. It is also the only surface here that is
 * not tinted like the yard, which is the same sentence said in colour.
 *
 * It travels in one direction across the loop, stop by stop, and it ends the
 * loop at its highest — the frame the section closes on is the permissive one.
 * That is the whole gamble of the argument: the calm last image is not of her
 * turned down, it is of her turned all the way up inside a line that held.
 *
 * The knob moves on `transform` (a translate of its own height, so each stop
 * is exact at any size) and the fill on `scale`, which keeps the one moving
 * control in the scene off the layout path entirely.
 */

const STOPS = 3;
const TRAVEL = { type: "spring", stiffness: 90, damping: 15 } as const;

function Track({
  level,
  vertical,
  topped,
  reduced,
}: {
  level: number;
  vertical: boolean;
  topped: boolean;
  reduced: boolean;
}) {
  const fill = (level + 1) / STOPS;
  const shift = `${(vertical ? STOPS - 1 - level : level) * 100}%`;
  const knob = vertical ? "inset-x-0 top-0 h-1/3" : "inset-y-0 left-0 w-1/3";
  return (
    <div className={`relative ${vertical ? "w-9 flex-1" : "h-5 w-full"}`}>
      <div
        className="absolute inset-0 overflow-hidden rounded-full border"
        style={{ borderColor: tint("cyan", 26), backgroundColor: tint("cyan", 5) }}
      >
        <motion.span
          className={`absolute rounded-full ${vertical ? "inset-x-0 bottom-0 top-0 origin-bottom" : "inset-y-0 left-0 right-0 origin-left"}`}
          style={{ backgroundColor: tint("cyan", 26) }}
          initial={false}
          animate={vertical ? { scaleY: fill } : { scaleX: fill }}
          transition={reduced ? { duration: 0 } : TRAVEL}
          aria-hidden="true"
        />
        <motion.span
          // Colour on a scoped CSS transition, never through framer: every
          // colour here is a `color-mix()`, which framer cannot interpolate.
          className={`absolute rounded-full border duration-500 transition-[background-color,border-color,box-shadow] ${knob}`}
          style={{
            borderColor: tint("cyan", topped ? 70 : 50),
            backgroundColor: tint("cyan", topped ? 40 : 28),
            boxShadow: brandShadow("cyan", topped ? 18 : 10, 45),
          }}
          initial={false}
          animate={vertical ? { y: shift } : { x: shift }}
          transition={reduced ? { duration: 0 } : TRAVEL}
          aria-hidden="true"
        />
      </div>
      {/* Topped out: one ring, once, at the beat it reaches the last stop. It
          lives outside the clipped track so it can leave the control. */}
      {topped && !reduced && (
        <motion.span
          className={`absolute rounded-full border-2 ${knob}`}
          style={{ borderColor: tint("cyan", 60) }}
          initial={vertical ? { y: shift, opacity: 0, scale: 1 } : { x: shift, opacity: 0, scale: 1 }}
          animate={{ opacity: [0, 0.9, 0], scale: 1.6 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default function Dial({
  rect,
  vertical,
  stage,
  level,
  reduced,
}: {
  rect: Rect;
  vertical: boolean;
  stage: ModuleStage;
  level: number;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const c = t.athenaPage.workshop.dial;
  const solid = atStage(stage, "shell");
  const topped = atStage(stage, "chosen");
  const at = Math.min(Math.max(level, 0), STOPS - 1);
  // The console voice minus its console tracking: this is a control someone
  // reads, not a status someone glances at.
  const label = "font-mono text-base leading-snug text-muted-dark";

  return (
    <Slot
      rect={rect}
      solid={solid}
      waiting
      reduced={reduced}
      round="rounded-2xl"
      className={`overflow-hidden bg-surface/70 backdrop-blur-md ${
        vertical
          ? "flex flex-col items-center gap-2.5 px-3 py-3"
          : "flex flex-col justify-center gap-1.5 px-3 py-1.5"
      }`}
      style={{ borderColor: tint("cyan", topped ? 34 : 22) }}
    >
      {vertical ? (
        <Part show i={0} reduced={reduced} className={`shrink-0 text-center ${label}`}>
          {c.label}
        </Part>
      ) : (
        <span className="flex shrink-0 items-center gap-2">
          <Part show i={0} reduced={reduced} className={`min-w-0 flex-1 truncate ${label}`}>
            {c.labelShort}
          </Part>
          <Part show i={1} reduced={reduced} className="shrink-0 text-base text-brand-cyan">
            {c.stopsShort[at]}
          </Part>
        </span>
      )}

      <Track level={at} vertical={vertical} topped={topped} reduced={reduced} />

      {vertical && (
        <motion.span
          key={at}
          className="shrink-0 text-center text-base text-brand-cyan"
          initial={reduced ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
        >
          {c.stops[at]}
        </motion.span>
      )}
    </Slot>
  );
}
