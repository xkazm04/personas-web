"use client";

import { brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, type Kept as KeptCopy } from "./copy";
import type { Rect } from "./layout";
import { Part, Sheen, Slot } from "./parts";

/**
 * One of the few things a pass left behind.
 *
 * It is written the way a colleague would say it, because that is what it is —
 * not a record of a conversation, but the one line of it still worth having
 * next week. Beside it is where she heard it, which is the other half of the
 * claim and the reason the thread underneath goes somewhere real: a thing that
 * cannot point back at where it came from is not kept at all.
 *
 * It arrives out of a dashed slot that was already holding this exact rect, so
 * four of them landing one per beat can never nudge the shelf under the
 * threads already drawn to it.
 *
 * The commit is a relaxation, not a flash: it lands lit and then settles to a
 * calm seam a beat later, which is what "come to rest" looks like.
 */
export default function Kept({
  rect,
  item,
  stage,
  waiting,
  reduced,
}: {
  rect: Rect;
  item: KeptCopy;
  stage: ModuleStage;
  waiting: boolean;
  reduced: boolean;
}) {
  const solid = atStage(stage, "shell");
  const resting = atStage(stage, "chosen");

  return (
    <Slot
      rect={rect}
      solid={solid}
      waiting={waiting}
      reduced={reduced}
      round="rounded-xl"
      className="flex flex-col items-start justify-center gap-0.5 overflow-hidden px-3 py-1 backdrop-blur-sm md:justify-between md:gap-2 md:px-4 md:py-3.5"
      style={{
        borderColor: tint("cyan", resting ? 30 : 52),
        backgroundColor: tint("cyan", 7),
        boxShadow: resting ? brandShadow("cyan", 18, 12) : brandShadow("cyan", 34, 26),
      }}
    >
      <Sheen on={solid} reduced={reduced} />

      <Part
        show
        i={0}
        reduced={reduced}
        className="w-full truncate text-base leading-snug text-foreground md:whitespace-normal md:text-lg"
      >
        {item.label}
      </Part>

      <Part
        show
        i={1}
        reduced={reduced}
        className={`flex w-full shrink-0 items-center gap-1.5 truncate normal-case ${ANNOTATION_DIM}`}
      >
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{
            backgroundColor: tint("cyan", 80),
            boxShadow: brandShadow("cyan", 6, 60),
          }}
        />
        {COPY.kept.from} {item.from}
      </Part>
    </Slot>
  );
}
