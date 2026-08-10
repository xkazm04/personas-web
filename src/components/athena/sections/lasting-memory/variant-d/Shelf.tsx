"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, KEPT } from "./copy";
import { slotCount, slotRect, type FieldLayout } from "./layout";
import { BREATH, Part, Slot } from "./parts";

/**
 * What she kept — the only layer in the frame that grows.
 *
 * Every slot is mounted from the first frame as a dashed outline, filled or
 * not. That is what turns the section's claim into a measurement: the shelf is
 * a third full after one pass and two thirds full after the next, and the eye
 * can check that without being told a number.
 *
 * Each thing that lands carries a small filled mark — the link back to the
 * exact conversation it came from. Nothing reaches this shelf without one, and
 * the moment it lands the scrap it came from lights up on the surface above.
 *
 * One of them goes out of date on a later pass. It is NOT removed: it keeps
 * its slot, goes quiet, and says so, while its replacement lands two slots
 * along. That distinction is the whole reason this section can be trusted, so
 * the design spends a tag on it.
 */

export default function Shelf({
  layout,
  stage,
  kept,
  keptPrev,
  hushed,
  holding,
  reduced,
}: {
  layout: FieldLayout;
  stage: ModuleStage;
  kept: number;
  keptPrev: number;
  hushed: number | null;
  holding: boolean;
  reduced: boolean;
}) {
  const open = atStage(stage, "body");

  return (
    <>
      {Array.from({ length: slotCount(layout) }, (_, i) => {
        const filled = i < kept && i < KEPT.length;
        const landing = filled && i >= keptPrev;
        const quiet = hushed === i;
        return (
          <Slot
            key={i}
            rect={slotRect(layout, i)}
            solid={filled}
            waiting={open}
            reduced={reduced}
            round="rounded-xl"
            className="flex flex-col justify-center gap-1 overflow-hidden px-3 py-2 backdrop-blur-md sm:px-4"
            style={{
              borderColor: tint("cyan", quiet ? 16 : 38),
              backgroundColor: tint("cyan", quiet ? 3 : 8),
              boxShadow: quiet ? "none" : brandShadow("cyan", 26, 12),
            }}
          >
            <Part
              show
              i={landing ? i - keptPrev : 0}
              reduced={reduced}
              className="flex items-start gap-2.5"
            >
              {/* The link back, as a mark. A thing on this shelf without one
                  does not exist — the loop shows the alternative being turned
                  away rather than arriving unmarked. */}
              <motion.span
                className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full duration-500 transition-[background-color,box-shadow]"
                style={{
                  backgroundColor: quiet ? tint("cyan", 30) : BRAND_VAR.cyan,
                  boxShadow: quiet ? "none" : brandShadow("cyan", 7, 70),
                }}
                initial={false}
                animate={{ opacity: reduced || !holding || quiet ? 1 : [1, 0.55, 1] }}
                transition={reduced || !holding || quiet ? { duration: 0.3 } : BREATH}
                aria-hidden="true"
              />
              <span
                className={`min-w-0 text-base leading-snug transition-colors duration-500 sm:text-lg ${
                  quiet ? "text-muted-dark" : "text-foreground"
                }`}
              >
                {layout.short ? KEPT[i]?.short : KEPT[i]?.full}
              </span>
            </Part>

            {/* Lower case and in the chip's own voice rather than the console
                voice: it is a note ON a sentence, not a label on a zone. */}
            <Part
              show={quiet}
              i={1}
              reduced={reduced}
              className="pl-[1.4rem] text-base text-muted-dark"
            >
              {layout.short ? COPY.hushedShort : COPY.hushed}
            </Part>
          </Slot>
        );
      })}
    </>
  );
}
