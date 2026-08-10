"use client";

import { tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY } from "../data";
import type { Rect } from "../layout";
import { DrawCheck, Part, Sheen } from "./parts";
import { StatePill } from "./primitives";
import { ModuleReveal } from "./shell";

/**
 * What comes back. It does not exist until the work does, and when it does it
 * BUILDS across three beats rather than arriving finished: the card and its
 * title frame up as the last tile lands, the headline number and the biggest
 * finding fill a beat later, and the summary's opening lines draw themselves
 * in a beat after that.
 *
 * The lines are deliberately unreadable rules rather than fake prose: the
 * promise is that a summary is waiting, not that this particular sentence is
 * in it.
 */
export function ResultCard({
  rect,
  stage,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  reduced: boolean;
}) {
  const c = COPY.result;
  const shell = atStage(stage, "shell");
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  return (
    <ModuleReveal
      rect={rect}
      stage={stage}
      reduced={reduced}
      className="flex-col justify-center gap-1 overflow-hidden rounded-xl border px-3.5 py-1.5"
      style={{ borderColor: tint("cyan", 45), backgroundColor: tint("cyan", 6) }}
    >
      <Sheen on={shell} reduced={reduced} delay={0.15} />

      <span className="flex min-h-6 min-w-0 shrink-0 items-center gap-2">
        <Part show reduced={reduced} className="flex shrink-0 text-brand-cyan">
          <DrawCheck reduced={reduced} className="h-4.5 w-4.5" delay={0.14} />
        </Part>
        <Part
          show
          i={1}
          reduced={reduced}
          className="min-w-0 truncate text-base font-semibold text-foreground"
        >
          {c.title}
        </Part>
        <Part show={body} lead={0.12} reduced={reduced} className="ml-auto flex shrink-0">
          <StatePill tone="ok" label={c.pill} />
        </Part>
      </span>

      {/* Both remaining rows reserve their line box from the moment the card
          exists, so a beat landing later can never lift the title above it. */}
      <span className="flex min-h-6 min-w-0 shrink-0 items-center">
        <Part
          show={body}
          lead={0.12}
          reduced={reduced}
          className={`min-w-0 truncate normal-case ${ANNOTATION_DIM}`}
        >
          {c.meta}
        </Part>
      </span>

      <span className="flex min-h-6 min-w-0 shrink-0 items-baseline gap-2">
        <Part show={detail} reduced={reduced} className="shrink-0 text-base text-muted-dark">
          {c.topLabel}
        </Part>
        <Part
          show={detail}
          i={1}
          reduced={reduced}
          className="min-w-0 truncate text-base font-semibold text-brand-cyan"
        >
          {c.topValue}
        </Part>
      </span>
    </ModuleReveal>
  );
}
