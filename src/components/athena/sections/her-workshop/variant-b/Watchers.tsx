"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import Bench from "./Bench";
import { COPY, TRIPPED_WATCHER, WATCH_PERIODS, WATCHERS } from "./copy";
import type { FieldLayout } from "./layout";
import { DrawCheck, Flare, Part } from "./parts";

/**
 * The bench nothing is scheduled on, where things keep happening anyway.
 *
 * Its form is a set of TRACKS with things arriving on them — a dashed run per
 * kind of thing that can start work, and small marks crossing them constantly
 * at three unrelated rates. Nothing here is on a beat and nothing lines up: the
 * dial next door keeps perfect time, and this bench is the opposite of it, so
 * the two of them together are what "several clocks at once" actually looks
 * like.
 *
 * Most of what crosses these tracks is just traffic. One of them reaches the
 * sensor while you are watching, and the track turns into the work it started —
 * with nobody in the room and nothing pressed.
 */

/** Mark size as a share of its track, and the self-relative transform that
 *  therefore carries it end to end. */
const MARK = 6;
const CROSS = ((100 - MARK) / MARK) * 100;

function Track({ period, reduced }: { period: number; reduced: boolean }) {
  return (
    <>
      <span
        className="absolute inset-x-0 top-1/2 border-t border-dashed"
        style={{ borderColor: tint("cyan", 24) }}
        aria-hidden="true"
      />
      {!reduced && (
        <motion.span
          className="absolute left-0 top-1/2 h-1.5 rounded-[1px]"
          style={{ width: `${MARK}%`, backgroundColor: BRAND_VAR.cyan, y: "-50%" }}
          animate={{ x: ["0%", `${CROSS}%`], opacity: [0, 1, 1, 0] }}
          transition={{ duration: period, repeat: Infinity, ease: "linear" }}
          aria-hidden="true"
        />
      )}
    </>
  );
}

function Sensor({ hot, flash, reduced }: { hot: boolean; flash: boolean; reduced: boolean }) {
  return (
    <span className="relative flex shrink-0">
      <Flare on={flash} reduced={reduced} />
      <span
        className="relative h-4 w-[3px] rounded-full duration-500 transition-[background-color]"
        style={{ backgroundColor: hot ? BRAND_VAR.cyan : tint("cyan", 30) }}
        aria-hidden="true"
      />
    </span>
  );
}

export default function Watchers({
  layout,
  stage,
  tripping,
  tripped,
  waiting,
  reduced,
}: {
  layout: FieldLayout;
  stage: ModuleStage;
  tripping: boolean;
  tripped: boolean;
  waiting: boolean;
  reduced: boolean;
}) {
  const body = atStage(stage, "body");
  const flowing = atStage(stage, "detail");
  return (
    <Bench
      rect={layout.panels.watch}
      stage={stage}
      label={COPY.bench.watch}
      waiting={waiting}
      reduced={reduced}
    >
      <span className="flex min-h-0 flex-1 flex-col justify-center gap-2">
        {Array.from({ length: layout.wires }, (_, i) => {
          const hit = tripped && i === TRIPPED_WATCHER;
          return (
            <Part
              key={WATCHERS[i]}
              show={body}
              i={i}
              reduced={reduced}
              className="flex min-w-0 items-center gap-2"
            >
              <span className="truncate text-base leading-none text-foreground">
                {WATCHERS[i]}
              </span>
              <span className="relative ml-auto flex h-4 w-[44%] shrink-0 items-center md:h-5">
                {/* The track and what it became: one box, two layers, so the
                    row cannot change height at the beat it matters. */}
                <motion.span
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: hit ? 0 : 1 }}
                  transition={{ duration: reduced ? 0 : 0.4 }}
                >
                  {flowing && <Track period={WATCH_PERIODS[i]} reduced={reduced} />}
                </motion.span>
                <motion.span
                  className="absolute inset-y-0 right-0 flex items-center gap-1.5 rounded-full border px-2"
                  style={{ borderColor: tint("cyan", 45), backgroundColor: tint("cyan", 12) }}
                  initial={false}
                  animate={{ opacity: hit ? 1 : 0 }}
                  transition={{ duration: reduced ? 0 : 0.45, delay: hit ? 0.25 : 0 }}
                >
                  <span className="flex text-brand-cyan">
                    <DrawCheck reduced={reduced} className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate text-base leading-none text-brand-cyan">
                    {COPY.watch.tripped}
                  </span>
                </motion.span>
              </span>
              <Sensor
                hot={hit}
                flash={tripping && i === TRIPPED_WATCHER}
                reduced={reduced}
              />
            </Part>
          );
        })}
      </span>
    </Bench>
  );
}
