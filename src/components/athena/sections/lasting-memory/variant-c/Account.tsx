"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import type { Account as AccountCopy } from "./copy";
import type { Rect } from "./layout";
import { Wash } from "./ink";
import { BREATH, Part, Slot } from "./parts";

/**
 * What she wrote down after a sitting — the section's emotional centre, and
 * the only place in the frame that uses whole sentences.
 *
 * It writes itself a line at a time rather than arriving as a block, because
 * the order of the three lines is the argument: how far she got, what is still
 * waiting, and where next time begins. The middle line is the one nobody else
 * would volunteer, so it is the one that gets the accent — a system that says
 * out loud what it did not reach is the entire promise, and the design should
 * treat that sentence as the good news it is rather than as a disclaimer.
 *
 * The two accounts on the field are near-identical on purpose. The second one
 * repeating the third line of the first is the promise being KEPT, and the
 * only number that moves between them is how much is still waiting.
 */

export default function Account({
  rect,
  copy,
  stage,
  waiting,
  lines,
  settle,
  holding,
  reduced,
}: {
  rect: Rect;
  copy: AccountCopy;
  stage: ModuleStage;
  waiting: boolean;
  lines: number;
  settle: boolean;
  holding: boolean;
  reduced: boolean;
}) {
  const open = atStage(stage, "shell");
  const finished = atStage(stage, "chosen");

  return (
    <Slot
      rect={rect}
      solid={open}
      waiting={waiting}
      reduced={reduced}
      round="rounded-2xl"
      className="flex flex-col gap-2 overflow-hidden px-3.5 py-3 backdrop-blur-md sm:px-5 sm:py-4"
      style={{
        borderColor: tint("cyan", finished ? 40 : 28),
        backgroundColor: tint("cyan", 6),
        boxShadow: brandShadow("cyan", 40, finished ? 14 : 8),
      }}
    >
      <Wash on={settle} reduced={reduced} />

      <span className="flex shrink-0 items-center gap-2">
        <motion.span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: BRAND_VAR.cyan }}
          initial={false}
          animate={{ opacity: reduced ? 1 : holding ? [0.9, 0.4, 0.9] : [1, 0.35, 1] }}
          transition={
            reduced
              ? { duration: 0.3 }
              : holding
                ? BREATH
                : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
          }
          aria-hidden="true"
        />
        <Part show reduced={reduced} className={`min-w-0 truncate ${ANNOTATION_DIM}`}>
          {copy.label}
        </Part>
      </span>

      <span className="flex min-h-0 flex-1 flex-col justify-center gap-3 sm:gap-4">
        {copy.lines.map((line, i) => {
          const admits = i === copy.admits;
          return (
            <Part
              key={line.full}
              show={lines > i}
              reduced={reduced}
              className="flex items-start gap-2.5 text-base leading-snug sm:text-lg"
              style={{ color: admits ? BRAND_VAR.cyan : undefined }}
            >
              <span
                className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: admits ? BRAND_VAR.cyan : tint("cyan", 45),
                  boxShadow: admits ? brandShadow("cyan", 7, 70) : undefined,
                }}
              />
              <span className={admits ? "min-w-0" : "min-w-0 text-foreground"}>
                <span className="hidden sm:inline">{line.full}</span>
                <span className="sm:hidden">{line.short}</span>
              </span>
            </Part>
          );
        })}
      </span>
    </Slot>
  );
}
