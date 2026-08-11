"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import Bench from "./Bench";
import { COPY, HANDED_OVER, HANDS } from "./copy";
import type { FieldLayout } from "./layout";
import { CREEP_MS, DrawCheck, Part } from "./parts";

/**
 * The bench she has her hands on — several pieces of work, all live, all
 * moving at once.
 *
 * Its form is the argument: FILLED LANES. Each piece of work is a row that
 * fills across as it goes, and the four of them fill at four unrelated rates,
 * so the bench never reads as a progress bar with four copies. One of them is
 * short enough to land while you are watching; the rest are simply still going,
 * which is what a real bench looks like.
 *
 * The fourth lane is mounted empty from the start and stays empty until you
 * hand something over from the queue. Nothing about the bench moves when it
 * arrives — the room was already there, and the work lands INTO it.
 */

const RING = { duration: 1.8, repeat: Infinity, ease: "easeOut" } as const;
const CARET = { duration: 1.1, repeat: Infinity, ease: "easeInOut" } as const;

/** Whose hands are on it: nobody yet, somebody now, or finished. */
function Mark({ live, done, reduced }: { live: boolean; done: boolean; reduced: boolean }) {
  if (done) {
    return (
      <span className="flex h-4 w-4 shrink-0 text-brand-cyan">
        <DrawCheck reduced={reduced} className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      {live && !reduced && (
        <motion.span
          className="absolute -inset-1 rounded-full border"
          style={{ borderColor: tint("cyan", 45) }}
          animate={{ opacity: [0.8, 0, 0.8], scale: [0.8, 1.5, 0.8] }}
          transition={RING}
        />
      )}
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: tint("cyan", live ? 60 : 20) }}
      />
    </span>
  );
}

function Lane({
  title,
  progress,
  done,
  filled,
  reduced,
}: {
  title: string;
  progress: number;
  done: boolean;
  /** An empty lane is a real slot on the bench, waiting, not a missing row. */
  filled: boolean;
  reduced: boolean;
}) {
  return (
    <span
      className={`relative flex min-h-0 flex-1 items-center overflow-hidden rounded-md border px-2 ${filled ? "" : "border-dashed"}`}
      style={{
        borderColor: tint("cyan", filled ? (done ? 44 : 26) : 16),
        backgroundColor: tint("cyan", filled ? 5 : 2),
        boxShadow: done ? brandShadow("cyan", 16, 18) : undefined,
      }}
    >
      <span
        className={`absolute inset-y-0 left-0 ${reduced ? "" : "transition-[width] ease-linear"}`}
        style={{
          width: `${Math.round(progress * 100)}%`,
          backgroundColor: tint("cyan", done ? 20 : 13),
          transitionDuration: `${CREEP_MS}ms`,
        }}
        aria-hidden="true"
      />
      {filled && (
        <span className="relative flex min-w-0 items-center gap-2">
          <Mark live={!done} done={done} reduced={reduced} />
          <span className="truncate text-base leading-none text-foreground">{title}</span>
          {done ? (
            <span className="shrink-0 text-base leading-none text-brand-cyan">
              {COPY.hands.done}
            </span>
          ) : (
            <motion.span
              className="h-3.5 w-[2px] shrink-0 rounded-full"
              style={{ backgroundColor: BRAND_VAR.cyan }}
              animate={reduced ? undefined : { opacity: [1, 0.1, 1] }}
              transition={reduced ? undefined : CARET}
              aria-hidden="true"
            />
          )}
        </span>
      )}
    </span>
  );
}

export default function HandsOn({
  layout,
  stage,
  lanes,
  handedOver,
  waiting,
  reduced,
}: {
  layout: FieldLayout;
  stage: ModuleStage;
  lanes: number[];
  handedOver: boolean;
  waiting: boolean;
  reduced: boolean;
}) {
  const body = atStage(stage, "body");
  const running = atStage(stage, "detail");
  const landed = atStage(stage, "chosen");
  return (
    <Bench
      rect={layout.panels.hands}
      stage={stage}
      label={COPY.bench.hands}
      waiting={waiting}
      reduced={reduced}
    >
      <span className="flex min-h-0 flex-1 flex-col gap-1">
        {Array.from({ length: layout.lanes }, (_, i) => {
          const handover = i === HANDS.length;
          return (
            <Part
              key={i}
              show={body}
              i={i}
              reduced={reduced}
              className="flex min-h-0 flex-1 flex-col"
            >
              <Lane
                title={handover ? HANDED_OVER : HANDS[i]}
                progress={running || handover ? lanes[i] : 0}
                done={i === 0 && landed}
                filled={handover ? handedOver : true}
                reduced={reduced}
              />
            </Part>
          );
        })}
      </span>
    </Bench>
  );
}
