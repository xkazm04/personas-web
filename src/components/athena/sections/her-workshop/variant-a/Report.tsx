"use client";

import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY } from "./copy";
import type { Rect } from "./layout";
import { railStripe } from "./look";
import { DrawCheck, Sheen } from "./ink";
import { Part, Slot } from "./parts";

/**
 * The one thing you hear.
 *
 * Three screens on the wall belong to a single job, and they finish minutes
 * apart — you watch them go quiet one at a time and nothing is said. This box
 * holds its place from the moment the first of them is out, and stays empty
 * until the LAST of them is out. Then it lands once, naming all three.
 *
 * That is the whole beat, and it is worth a whole box: the alternative — three
 * pieces of work, three interruptions — is what supervising a lot of things at
 * once normally costs you. It wears the same colour the three screens wear, so
 * nobody has to be told which announcement belongs to which work.
 */
export default function Report({
  rect,
  stage,
  waiting,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  waiting: boolean;
  reduced: boolean;
}) {
  const c = COPY.report;
  const shell = atStage(stage, "shell");
  const body = atStage(stage, "body");
  const settled = atStage(stage, "chosen");

  return (
    <Slot
      rect={rect}
      solid={shell}
      waiting={waiting}
      reduced={reduced}
      round="rounded-2xl"
      className="flex flex-col gap-1.5 overflow-hidden px-3 py-2.5 backdrop-blur-md sm:gap-2 sm:px-5 sm:py-3"
      style={{
        borderColor: tint("purple", settled ? 52 : 34),
        backgroundColor: tint("purple", settled ? 9 : 5),
        boxShadow: settled ? brandShadow("purple", 40, 22) : undefined,
      }}
    >
      <Sheen on={shell && !body} reduced={reduced} />

      {/* The same stitched rail the three screens wear. Nothing has to say
          which work this message is about. */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundImage: railStripe(false) }}
        aria-hidden="true"
      />

      <span className="flex shrink-0 items-center gap-2.5">
        <Part
          show
          i={0}
          reduced={reduced}
          className="min-w-0 flex-1 truncate text-lg font-medium text-foreground sm:text-xl"
        >
          {c.title}
        </Part>
        <Part show i={1} reduced={reduced} className={`hidden shrink-0 normal-case sm:block ${ANNOTATION_DIM}`}>
          {c.badge}
        </Part>
      </span>

      {/* The three pieces, named. They are the same three names that are on the
          wall — the announcement never invents a vocabulary of its own. */}
      <span className="flex min-h-0 flex-1 flex-col justify-center gap-1 sm:gap-1.5">
        {c.rows.map((row, i) => (
          <Part key={row} show={body} i={i} reduced={reduced} className="flex items-center gap-2.5">
            <span className="flex shrink-0" style={{ color: BRAND_VAR.emerald }}>
              <DrawCheck reduced={reduced} className="h-4 w-4" delay={0.14 + i * 0.1} />
            </span>
            <span className="min-w-0 flex-1 truncate font-mono text-base text-foreground">{row}</span>
          </Part>
        ))}
      </span>

      <Part show={body} lead={0.28} reduced={reduced} className={`shrink-0 truncate normal-case ${ANNOTATION_DIM}`}>
        {c.footer}
      </Part>
    </Slot>
  );
}
