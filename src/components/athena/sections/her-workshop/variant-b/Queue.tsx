"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import Bench from "./Bench";
import { COPY, QUEUED, STARTED_CARD } from "./copy";
import type { FieldLayout } from "./layout";
import { Flare, Part } from "./parts";

/**
 * The bench that does nothing until you say so.
 *
 * Its form is deliberately the stillest thing on the floor: square cards with a
 * spine down the left, no fill, no travel, nothing moving. Everywhere else in
 * this scene something is running; here, work sits and waits, and the only
 * motion in the whole bench is one button breathing.
 *
 * That stillness is a truth claim, not a style. Queued work is started
 * DELIBERATELY — it is the one place a machine deciding for itself would cost
 * you something — so the card at the top moves at exactly one moment, when the
 * button is pressed, and it leaves an empty slot behind it so you can see where
 * it went and that nothing filled in after it.
 */

const BREATHE = { duration: 1.6, repeat: Infinity, ease: "easeInOut" } as const;
const LEAVE = { duration: 0.65, ease: "easeIn" } as const;

function Start({ pressing, reduced }: { pressing: boolean; reduced: boolean }) {
  return (
    <span className="relative ml-auto flex shrink-0">
      <Flare on={pressing} reduced={reduced} />
      <motion.span
        className="relative flex items-center rounded-full border px-2.5 py-0.5 text-base leading-none"
        style={{
          borderColor: tint("cyan", 55),
          backgroundColor: tint("cyan", 16),
          color: BRAND_VAR.cyan,
          boxShadow: brandShadow("cyan", 16, 28),
        }}
        animate={
          reduced ? { scale: 1 } : pressing ? { scale: [1, 0.88, 1] } : { scale: [1, 1.05, 1] }
        }
        transition={reduced ? { duration: 0 } : pressing ? { duration: 0.4 } : BREATHE}
      >
        {COPY.queue.start}
      </motion.span>
    </span>
  );
}

function Card({
  title,
  first,
  pressing,
  showStart,
  reduced,
}: {
  title: string;
  first: boolean;
  pressing: boolean;
  showStart: boolean;
  reduced: boolean;
}) {
  return (
    <span
      className="flex h-full items-center gap-2 overflow-hidden rounded-sm border px-2"
      style={{
        borderColor: tint("cyan", first ? 32 : 20),
        backgroundColor: tint("cyan", first ? 6 : 3),
      }}
    >
      <span
        className="h-4 w-[3px] shrink-0 rounded-sm"
        style={{ backgroundColor: tint("cyan", first ? 55 : 30) }}
        aria-hidden="true"
      />
      <span className="truncate text-base leading-none text-foreground">{title}</span>
      {showStart && <Start pressing={pressing} reduced={reduced} />}
    </span>
  );
}

export default function Queue({
  layout,
  stage,
  starting,
  started,
  waiting,
  reduced,
}: {
  layout: FieldLayout;
  stage: ModuleStage;
  starting: boolean;
  started: boolean;
  waiting: boolean;
  reduced: boolean;
}) {
  const body = atStage(stage, "body");
  const ready = atStage(stage, "detail");
  return (
    <Bench
      rect={layout.panels.queue}
      stage={stage}
      label={COPY.bench.queue}
      waiting={waiting}
      reduced={reduced}
    >
      <span className="flex min-h-0 flex-1 flex-col gap-1">
        {Array.from({ length: layout.cards }, (_, i) => (
          <Part key={i} show={body} i={i} reduced={reduced} className="relative min-h-0 flex-1">
            {i === STARTED_CARD ? (
              <>
                {/* The card leaves, and the slot it leaves stays empty. Two
                    layers crossfading in one box: nothing below it moves. */}
                <motion.span
                  className="absolute inset-0 block"
                  initial={false}
                  animate={{ opacity: started ? 0 : 1, x: started ? "12%" : "0%" }}
                  transition={reduced ? { duration: 0 } : LEAVE}
                >
                  <Card
                    title={QUEUED[i]}
                    first
                    pressing={starting}
                    showStart={ready}
                    reduced={reduced}
                  />
                </motion.span>
                <motion.span
                  className="absolute inset-0 flex items-center rounded-sm border border-dashed px-2"
                  style={{ borderColor: tint("cyan", 18) }}
                  initial={false}
                  animate={{ opacity: started ? 1 : 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.35 }}
                >
                  <span className="truncate text-base leading-none text-muted-dark">
                    {COPY.queue.taken}
                  </span>
                </motion.span>
              </>
            ) : (
              <span className="absolute inset-0 block">
                <Card
                  title={QUEUED[i]}
                  first={false}
                  pressing={false}
                  showStart={false}
                  reduced={reduced}
                />
              </span>
            )}
          </Part>
        ))}
      </span>
    </Bench>
  );
}
