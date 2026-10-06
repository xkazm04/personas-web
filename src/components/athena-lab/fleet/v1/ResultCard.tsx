"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import ToolMark from "../shared/ToolMark";
import type { Rect } from "./layout";
import { DrawCheck, Part, Sheen, Slot } from "./parts";

/**
 * The one thing that comes back.
 *
 * Four threads land here, and what settles is not four results - it is the
 * last clause of the sentence, answered. The heading is the same words the
 * request ended with, so the loop closes on the phrase it opened with.
 *
 * Evolved: the answer is the brightest object in the scene once it settles (a
 * bloom behind it, its own key light), and where it went is shown with the
 * real place it went to - the team's Slack - rather than said.
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
    <>
      {/* Bloom - the answer lights the scene when it lands */}
      <motion.span
        className="pointer-events-none absolute rounded-full blur-3xl"
        style={{
          left: rect.x - 20,
          top: rect.y + rect.h * 0.15,
          width: rect.w + 40,
          height: rect.h * 0.7,
          backgroundColor: tint("cyan", 22),
        }}
        initial={false}
        animate={{ opacity: settled ? 1 : shell ? 0.35 : 0 }}
        transition={{ duration: reduced ? 0 : 0.9 }}
        aria-hidden="true"
      />
      <Slot
        rect={rect}
        solid={shell}
        waiting={waiting}
        reduced={reduced}
        round="rounded-2xl"
        className="flex flex-col gap-2 overflow-hidden px-4 py-3.5 backdrop-blur-md"
        style={{
          borderColor: tint("cyan", settled ? 55 : 30),
          backgroundColor: tint("cyan", settled ? 9 : 4),
          boxShadow: settled ? brandShadow("cyan", 40, 24) : undefined,
        }}
      >
        <Sheen on={settled} reduced={reduced} />

        <span className="flex items-start gap-2">
          <Part show i={0} reduced={reduced} className="min-w-0 flex-1 text-xl font-semibold leading-tight text-foreground">
            {c.title}
          </Part>
          {settled && (
            <Part show reduced={reduced} className="mt-0.5 flex shrink-0 text-brand-cyan">
              <DrawCheck reduced={reduced} className="h-5 w-5" delay={0.2} />
            </Part>
          )}
        </span>

        <span className="flex min-h-0 flex-1 flex-col justify-center gap-1.5">
          {c.rows.map((row, i) => (
            <Part key={row.label} show={body} i={i} reduced={reduced} className="flex items-center gap-2.5">
              <motion.span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: BRAND_VAR.cyan }}
                animate={settled || reduced ? { opacity: 1 } : { opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
              />
              <span className="min-w-0 flex-1 whitespace-nowrap text-base text-foreground">{row.label}</span>
              <span className="shrink-0 whitespace-nowrap text-sm text-muted-dark">{row.meta}</span>
            </Part>
          ))}
        </span>

        <Part
          show={detail}
          reduced={reduced}
          className="flex shrink-0 items-center gap-2 border-t pt-2 font-mono text-sm text-muted-dark"
          style={{ borderColor: tint("cyan", 16) }}
        >
          <ToolMark name="slack" className="h-3.5 w-3.5 text-foreground" />
          {c.footer}
        </Part>
      </Slot>
    </>
  );
}
