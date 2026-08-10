"use client";

import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, type Rect } from "./data";
import { DrawCheck, FieldBlock, Part, Sheen } from "./parts";

/**
 * What is waiting when you get back — the right-hand plate, and the answer to
 * the whole section.
 *
 * It is deliberately NOT a log, a feed, or a list of everything that happened.
 * Coming back should cost you nothing: three finished things in your own
 * words, a count for the quiet rest, and — last, and on its own — the single
 * thing that still wants you, in the same amber as the light that has been
 * patiently holding for it out in the field all night.
 *
 * Its ghost has been standing in this exact rect since the top of the loop:
 * the place the answer will be, held open while you are gone.
 */
export function SummaryPanel({
  rect,
  stage,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  reduced: boolean;
}) {
  const c = COPY.summary;
  const landed = atStage(stage, "body");
  const rest = atStage(stage, "detail");
  const wants = atStage(stage, "chosen");

  return (
    <FieldBlock
      rect={rect}
      stage={stage}
      reduced={reduced}
      className="flex flex-col gap-1.5 px-4 py-3"
    >
      <Sheen on={atStage(stage, "shell")} reduced={reduced} delay={0.1} />

      <span className="flex h-7 shrink-0 items-center">
        <Part show reduced={reduced} className="text-lg font-semibold text-foreground">
          {c.title}
        </Part>
      </span>

      {c.done.map((line, i) => (
        <span key={line} className="flex h-6 shrink-0 items-center">
          <Part show={landed} i={i} reduced={reduced} className="flex w-full items-center gap-2.5">
            <span className="text-brand-cyan">
              <DrawCheck reduced={reduced} delay={0.1 + i * 0.09} />
            </span>
            <span className="min-w-0 flex-1 truncate text-base text-foreground">{line}</span>
          </Part>
        </span>
      ))}

      <span className="flex h-6 shrink-0 items-center">
        <Part show={rest} reduced={reduced} className="pl-6.5 text-base text-muted-dark">
          {c.more}
        </Part>
      </span>

      {/* The one thing. Reserved from the first beat so it can arrive without
          nudging a single line above it. */}
      <span className="mt-auto flex h-14 shrink-0 flex-col justify-end gap-0.5">
        {wants && (
          <>
            <Part
              show
              reduced={reduced}
              className="flex items-center gap-2.5 text-base font-semibold"
              style={{ color: BRAND_VAR.amber }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: BRAND_VAR.amber, boxShadow: `0 0 10px ${tint("amber", 60)}` }}
                aria-hidden="true"
              />
              {c.wantsTitle}
            </Part>
            <Part show i={1} reduced={reduced} className="pl-4.5 text-base text-foreground">
              {c.wantsBody}
            </Part>
          </>
        )}
      </span>
    </FieldBlock>
  );
}
