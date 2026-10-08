"use client";

import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { fg } from "./shared/frame";
import { TURNS } from "./copy";
import { pileRect, type FieldLayout } from "./layout";
import { SLOW_SKIN } from "./parts";

/**
 * One day's talk - turns stacked from the baseline up, oldest at the bottom,
 * in TWO VOICES: yours in plain ink on the left, hers in cyan on the right, so
 * the column reads as a conversation rather than a bar chart.
 *
 * A full day always holds the same number of turns as every other full day,
 * and a day behind her keeps every turn at a fill one step fainter per day
 * passed - the talk did not go anywhere, it stopped being the talk she works
 * from. On the night she sleeps on a day its OLDEST turns light up; on the day
 * the first kept thing comes back, the turn it lands in lights instead.
 */

/** Fill by voice while a day is today: yours, hers. */
const LIVE = [34, 50] as const;
const READING = 68;
/** One step fainter per day passed; never zero. */
const FADED = [18, 15, 13, 12] as const;
const HELD = 13;
const ARRIVE_STEP = 0.075;

function fillFor(age: number, holding: boolean, mine: boolean, lit: boolean): number {
  if (lit) return READING;
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
  echo,
  holding,
  reduced,
}: {
  layout: FieldLayout;
  day: number;
  rows: number;
  rowsPrev: number;
  age: number;
  reading: boolean;
  /** The day the first kept thing comes back into. */
  echo: boolean;
  holding: boolean;
  reduced: boolean;
}) {
  const total = layout.rowsPerStep * 3;
  const band = 100 / total;
  const rect = pileRect(layout, day);
  const echoRow = Math.floor(((layout.baseY - layout.recallTopY) / (layout.baseY - layout.railY)) * total);

  return (
    <div
      className="absolute"
      style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.w}%`, height: `${rect.h}%` }}
      aria-hidden="true"
    >
      {Array.from({ length: total }, (_, k) => {
        const shown = k < rows;
        const mine = k % 2 === 0;
        const lit = (reading && k < layout.rowsPerStep) || (echo && k === echoRow);
        const pct = fillFor(age, holding, mine, lit);
        return (
          <motion.span
            key={k}
            className="absolute"
            style={{
              left: mine ? "4%" : undefined,
              right: mine ? undefined : "4%",
              bottom: `${k * band + band * 0.13}%`,
              width: `${TURNS[(day * 5 + k) % TURNS.length] * 88}%`,
              height: `${band * 0.7}%`,
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
              className={`absolute inset-0 rounded-full ${SLOW_SKIN}`}
              style={{
                backgroundColor: mine && !lit ? fg(pct * 0.62) : tint("cyan", pct),
                boxShadow: lit ? brandShadow("cyan", 12, 50) : "none",
              }}
            />
          </motion.span>
        );
      })}
    </div>
  );
}
