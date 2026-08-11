"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import type { Rect } from "./layout";
import { DrawCheck, Part, Sheen, Slot } from "./parts";

/**
 * The one thing that comes back.
 *
 * Four threads land here, and what settles is not four results — it is the
 * last clause of the sentence, answered. The heading is deliberately the same
 * words the request ended with, so the loop closes on the phrase it opened
 * with: you asked to be told what matters, and here is what matters.
 *
 * It assembles in the same layers as everything else — frame, then the lines,
 * then where it went — and commits with a drawn check rather than a flip.
 */
export default function ResultCard({
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
  const { t } = useTranslation();
  const c = t.athenaPage.fleet.result;
  const shell = atStage(stage, "shell");
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  const settled = atStage(stage, "chosen");
  return (
    <Slot
      rect={rect}
      solid={shell}
      waiting={waiting}
      reduced={reduced}
      round="rounded-2xl"
      className="flex flex-col gap-1.5 overflow-hidden px-4 py-2.5 backdrop-blur-md sm:gap-2 sm:px-5 sm:py-3"
      style={{
        borderColor: tint("cyan", settled ? 50 : 30),
        backgroundColor: tint("cyan", settled ? 8 : 4),
        boxShadow: settled ? brandShadow("cyan", 40, 20) : undefined,
      }}
    >
      <Sheen on={settled} reduced={reduced} />

      <span className="flex items-center gap-2">
        <Part
          show
          i={0}
          reduced={reduced}
          className="min-w-0 flex-1 truncate text-lg font-medium text-foreground sm:text-xl"
        >
          {c.title}
        </Part>
        {settled && (
          <Part show reduced={reduced} className="flex shrink-0 text-brand-cyan">
            <DrawCheck reduced={reduced} className="h-5 w-5" delay={0.2} />
          </Part>
        )}
      </span>

      <span className="flex min-h-0 flex-1 flex-col justify-center gap-1 sm:gap-1.5">
        {c.rows.map((row, i) => (
          <Part
            key={row.label}
            show={body}
            i={i}
            reduced={reduced}
            // The tail row is density, not payload — it steps aside on narrow
            // viewports rather than shrinking the answer's type.
            className={`items-center gap-2.5 ${i === c.rows.length - 1 ? "hidden md:flex" : "flex"}`}
          >
            <motion.span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: BRAND_VAR.cyan }}
              animate={settled || reduced ? { opacity: 1 } : { opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
            />
            <span className="min-w-0 flex-1 truncate text-base text-foreground">{row.label}</span>
            <span className="shrink-0 text-base text-muted-dark">{row.meta}</span>
          </Part>
        ))}
      </span>

      <Part
        show={detail}
        reduced={reduced}
        className={`hidden shrink-0 truncate normal-case sm:block ${ANNOTATION_DIM}`}
      >
        {c.footer}
      </Part>
    </Slot>
  );
}
