"use client";

import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, WEIGHTS } from "./copy";
import { segSpan, type FieldLayout } from "./layout";
import { Wash } from "./ink";
import { BREATH, Part, Slot } from "./parts";

/**
 * Everything you have said to her, laid end to end — oldest at the left,
 * newest at the right, one box per thing said.
 *
 * The two states a message can be in are the section's whole vocabulary, and
 * they are deliberately NOT "done" and "dropped": a message she has been
 * through is filled and lit, and one she has not reached yet is still solid,
 * still coloured, still there. Nothing here ever dims, empties or leaves. The
 * unread stretch is the largest thing on screen at the end of the loop, and it
 * is supposed to look like something waiting rather than something missed.
 *
 * Which is why the acknowledgement beat brightens the unread stretch instead
 * of fading it: the moment she admits what she did not reach, that stretch is
 * the thing that gets the light.
 */

/** Spacing of the arrival cascade. A wave of twelve still finishes inside its
 *  own 900ms tick, so the pile-up reads as one gesture. */
const ARRIVE_STEP = 0.055;
/** Spacing of the reading cascade — three messages a tick, paced to track her
 *  as she glides over them rather than lighting ahead of her. */
const READ_STEP = 0.24;

function Message({
  i,
  arrived,
  arriveDelay,
  read,
  readDelay,
  reduced,
}: {
  i: number;
  arrived: boolean;
  arriveDelay: number;
  read: boolean;
  readDelay: number;
  reduced: boolean;
}) {
  const span = segSpan(i);
  return (
    <motion.span
      className="absolute inset-y-0"
      style={{ left: `${span.left * 100}%`, width: `${span.width * 100}%` }}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: arrived ? 1 : 0, y: 0 }}
      transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: arriveDelay }}
      aria-hidden="true"
    >
      <span
        className="absolute inset-y-[3px] left-0 right-[12%] rounded-[3px] border duration-500 transition-[background-color,border-color,box-shadow]"
        style={{
          borderColor: tint("cyan", read ? 58 : 26),
          backgroundColor: tint("cyan", read ? 34 : 7),
          boxShadow: read ? brandShadow("cyan", 8, 34) : "none",
          transitionDelay: `${readDelay}s`,
        }}
      />
    </motion.span>
  );
}

export default function Seam({
  layout,
  stage,
  arrived,
  arrivedPrev,
  read,
  readPrev,
  readFrac,
  ack,
  settle,
  holding,
  reduced,
}: {
  layout: FieldLayout;
  stage: ModuleStage;
  arrived: number;
  arrivedPrev: number;
  read: number;
  readPrev: number;
  readFrac: number;
  ack: boolean;
  settle: boolean;
  holding: boolean;
  reduced: boolean;
}) {
  const solid = atStage(stage, "shell");
  const labelled = atStage(stage, "detail");
  const marked = atStage(stage, "chosen");
  const rightGutter = 100 - (layout.seam.x + layout.seam.w);

  return (
    <>
      <Slot
        rect={layout.seam}
        solid={solid}
        waiting
        reduced={reduced}
        className="overflow-hidden"
        style={{
          borderColor: tint("cyan", marked ? 40 : 24),
          backgroundColor: tint("cyan", 4),
        }}
      >
        <Wash on={settle} reduced={reduced} />
        <span className="relative block h-full w-full">
          {/* The stretch she has been through, as light under the messages */}
          <motion.span
            className="absolute inset-y-1 left-0 w-full origin-left rounded-full blur-md"
            style={{ backgroundColor: tint("cyan", 20) }}
            initial={false}
            animate={{
              scaleX: readFrac,
              opacity: reduced ? 1 : holding ? [1, 0.65, 1] : 1,
            }}
            transition={
              reduced
                ? { duration: 0 }
                : holding
                  ? { scaleX: { duration: 0.6 }, opacity: BREATH }
                  : { duration: 0.9, ease: "easeInOut" }
            }
            aria-hidden="true"
          />

          {WEIGHTS.map((_, i) => (
            <Message
              key={i}
              i={i}
              arrived={i < arrived}
              arriveDelay={i < arrived && i >= arrivedPrev ? (i - arrivedPrev) * ARRIVE_STEP : 0}
              read={i < read}
              readDelay={i < read && i >= readPrev ? (i - readPrev) * READ_STEP : 0}
              reduced={reduced}
            />
          ))}

          {/* The admission, made of light: what she did not reach brightens */}
          {ack && !reduced && (
            <motion.span
              className="absolute inset-y-0 rounded-md"
              style={{ left: `${readFrac * 100}%`, right: 0, backgroundColor: tint("cyan", 24) }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.95, 0] }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              aria-hidden="true"
            />
          )}
        </span>
      </Slot>

      {/* The two ends. She always comes in at the left one. */}
      <Part
        show={labelled}
        reduced={reduced}
        className={`absolute ${ANNOTATION_DIM}`}
        style={{ left: `${layout.seam.x}%`, top: `${layout.endsY}%` }}
      >
        {COPY.seam.oldest}
      </Part>
      <Part
        show={labelled}
        i={1}
        reduced={reduced}
        className={`absolute ${ANNOTATION_DIM}`}
        style={{ right: `${rightGutter}%`, top: `${layout.endsY}%` }}
      >
        {COPY.seam.newest}
      </Part>
    </>
  );
}
