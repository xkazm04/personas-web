"use client";

import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { TURNS } from "./copy";
import { pileRect, type FieldLayout } from "./layout";
import { SLOW_SKIN } from "./parts";

/**
 * One day's talk — turns stacked from the baseline up, oldest at the bottom.
 *
 * Two things about it are load-bearing. A full day always holds exactly the
 * same NUMBER of turns as every other full day, so the top of the scene is a
 * height being reached over and over rather than a quantity going anywhere.
 * And a day that is behind her keeps every turn it ever had, at a fill one
 * step fainter for each day that has passed since — the talk did not go
 * anywhere, it simply stopped being the talk she is working from. That fading
 * is the only clock in the section.
 *
 * The one beat where a day gets brighter instead of fainter is the night she
 * sleeps on it: its OLDEST turns light up, because the oldest end is always
 * where she starts.
 */

/** Fill by side of the conversation, while a day is the one she is on. */
const LIVE = [30, 46] as const;
const READING = 68;
/** How faint a day goes, one step per day that has passed since. It never
 *  reaches zero: the talk is still there, it is just behind her. */
const FADED = [16, 14, 12, 11] as const;
/** During the hold every day drops to the same quiet floor, so the last thing
 *  with any weight in the frame is the shelf. */
const HELD = 12;

/** Spacing of the arrival cascade. A full step of turns still finishes well
 *  inside its own 900ms tick, so a tick of talk reads as one gesture. */
const ARRIVE_STEP = 0.075;

function fillFor(age: number, holding: boolean, mine: boolean, reading: boolean): number {
  if (reading) return READING;
  if (holding) return HELD;
  if (age > 0) return FADED[Math.min(age, FADED.length) - 1];
  return LIVE[mine ? 0 : 1];
}

export default function Pile({
  layout,
  day,
  rows,
  rowsPrev,
  age,
  reading,
  holding,
  reduced,
}: {
  layout: FieldLayout;
  day: number;
  rows: number;
  rowsPrev: number;
  age: number;
  reading: boolean;
  holding: boolean;
  reduced: boolean;
}) {
  const total = layout.rowsPerStep * 3;
  const band = 100 / total;
  const rect = pileRect(layout, day);

  return (
    <div
      className="absolute"
      style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.w}%`, height: `${rect.h}%` }}
      aria-hidden="true"
    >
      {Array.from({ length: total }, (_, k) => {
        const shown = k < rows;
        const mine = k % 2 === 0;
        const lit = reading && k < layout.rowsPerStep;
        return (
          <motion.span
            key={k}
            className="absolute"
            style={{
              left: mine ? 0 : undefined,
              right: mine ? undefined : 0,
              bottom: `${k * band}%`,
              width: `${TURNS[(day * 5 + k) % TURNS.length] * 100}%`,
              height: `${band * 0.74}%`,
            }}
            initial={reduced ? false : { opacity: 0, y: 7 }}
            animate={{ opacity: shown ? 1 : 0, y: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    duration: 0.45,
                    ease: "easeOut",
                    delay: shown ? Math.max(0, k - rowsPrev) * ARRIVE_STEP : 0,
                  }
            }
          >
            <span
              className={`absolute inset-0 rounded-[3px] ${SLOW_SKIN}`}
              style={{
                backgroundColor: tint("cyan", fillFor(age, holding, mine, lit)),
                boxShadow: lit ? brandShadow("cyan", 10, 40) : "none",
              }}
            />
          </motion.span>
        );
      })}
    </div>
  );
}
