"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import Bench from "./Bench";
import { COPY, PAIR_CODE } from "./copy";
import type { FieldLayout } from "./layout";
import { Part } from "./parts";

/**
 * The bench next door — and the most carefully drawn thing in this section.
 *
 * A second machine can be brought in beside the first: a six-digit code comes
 * up on both screens at the same instant, and from then on the two of them know
 * each other. That is the whole of what this bench does here, because that is
 * the whole of what is true. It is built, it is paired, it is lit, and no piece
 * of work has ever run on it.
 *
 * So the composition puts it at the FAR EDGE of the field, gives it the longest
 * and quietest cable in the scene, and gives it no lane, no card, no order, no
 * track and no commit beat (see `./data` — it is the one bench whose plan has
 * `chosen: null`). It shows a screen with a code on it and the word ready, and
 * it never shows a thing being made. Anything added here that looks like work
 * turns this section into a claim the product cannot back.
 */

/** Slow and even. It is idle, not asleep, and not busy either. */
const IDLE = { duration: 3.4, repeat: Infinity, ease: "easeInOut" } as const;

export default function NextDoor({
  layout,
  stage,
  paired,
  waiting,
  reduced,
}: {
  layout: FieldLayout;
  stage: ModuleStage;
  paired: boolean;
  waiting: boolean;
  reduced: boolean;
}) {
  const body = atStage(stage, "body");
  const upright = layout.upright;
  const clamp = upright ? "leading-snug" : "truncate";
  return (
    <Bench
      rect={layout.panels.next}
      stage={stage}
      label={COPY.bench.next}
      waiting={waiting}
      reduced={reduced}
      quiet
      wrap={upright}
    >
      <span
        className={`flex min-h-0 flex-1 ${upright ? "flex-col justify-center gap-2.5" : "flex-row items-center gap-3"}`}
      >
        {/* Its screen. The code is the only thing on it, and it arrives at the
            same instant as the one on hers. */}
        <Part show={body} i={0} reduced={reduced} className="flex shrink-0">
          <span
            className="flex items-center justify-center rounded-md border px-2 py-1.5"
            style={{ borderColor: tint("cyan", 28), backgroundColor: tint("cyan", 6) }}
          >
            <motion.span
              className="font-mono text-base leading-none tracking-[0.14em] text-brand-cyan"
              initial={false}
              animate={{ opacity: paired ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.7 }}
            >
              {PAIR_CODE}
            </motion.span>
          </span>
        </Part>

        <Part show={body} i={1} reduced={reduced} className="flex min-w-0 items-center gap-2">
          <motion.span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            animate={reduced ? { opacity: 0.9 } : { opacity: [0.5, 0.9, 0.5] }}
            transition={reduced ? { duration: 0 } : IDLE}
            aria-hidden="true"
          />
          <span className={`min-w-0 text-base leading-none text-foreground ${clamp}`}>
            {COPY.next.paired}
          </span>
        </Part>

        {/* The narrow field has one row here and it belongs to the pairing.
            The readiness is carried by the status line there instead — fewer
            words on a small screen, never smaller ones. */}
        <Part show={paired && upright} i={2} reduced={reduced} className="text-base leading-snug text-muted-dark">
          {COPY.next.ready}
        </Part>
      </span>
    </Bench>
  );
}
