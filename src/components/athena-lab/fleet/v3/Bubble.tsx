"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mic } from "lucide-react";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, stepDelay, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import { ANSWER_TOOL, requestFrom } from "../shared/cast";
import SentenceText from "../shared/SentenceText";
import ToolMark from "../shared/ToolMark";
import { box, type Rect } from "./layout";

/**
 * The bubble over her head - the loop's beginning and its end in ONE box. It
 * holds your sentence while you say it (its phrases lighting as each becomes a
 * job), and once the team is home it turns over and holds her answer instead:
 * same place, same frame, question in and answer out. The box is mounted the
 * whole loop and only its contents trade places, so nothing ever shifts.
 */
export default function Bubble({
  rect,
  stage,
  clauses,
  lit,
  answer,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  clauses: number;
  lit: boolean[];
  answer: ModuleStage;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const c = t.athenaPage.fleet.request;
  const r = t.athenaPage.fleet.result;
  const sent = atStage(stage, "chosen");
  const answered = atStage(answer, "shell");
  const settled = atStage(answer, "chosen");
  const swap = reduced ? { duration: 0 } : { duration: 0.45, ease: "easeOut" as const };
  const pop = (i: number) => (reduced ? { duration: 0 } : { duration: 0.35, delay: stepDelay(i, 0.15) });
  return (
    <div
      className="absolute rounded-3xl border px-6 py-4 backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-500"
      style={{
        ...box(rect),
        borderColor: tint("cyan", settled ? 55 : sent || answered ? 36 : atStage(stage, "shell") ? 22 : 10),
        backgroundColor: tint("cyan", answered ? 8 : 4),
        boxShadow: settled ? brandShadow("cyan", 44, 26) : sent ? brandShadow("cyan", 24, 12) : undefined,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!answered ? (
          <motion.div key="ask" className="flex h-full flex-col gap-2" exit={{ opacity: 0, rotateX: 70 }} transition={swap}>
            <p className="min-h-0 flex-1 text-lg leading-[1.45] text-foreground">
              {clauses === 0 ? (
                <span className="text-muted-dark">{c.placeholder}</span>
              ) : (
                <SentenceText request={requestFrom(c.clauses)} clauses={clauses} lit={lit} reduced={reduced} />
              )}
            </p>
            <span className="flex shrink-0 items-center gap-2.5">
              <Mic className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
              <span className={`normal-case ${ANNOTATION_DIM}`}>{sent ? c.sent : c.voice}</span>
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="answer"
            className="flex h-full flex-col gap-1.5"
            initial={reduced ? false : { opacity: 0, rotateX: -70 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={swap}
          >
            <span className="text-xl font-semibold leading-tight text-foreground">{r.title}</span>
            <span className="flex min-h-0 flex-1 flex-col justify-center gap-1">
              {atStage(answer, "body") &&
                r.rows.map((row, i) => (
                  <motion.span key={row.label} className="flex items-center gap-2.5" initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={pop(i)}>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: BRAND_VAR.cyan }} />
                    <span className="flex-1 whitespace-nowrap text-base text-foreground">{row.label}</span>
                    <span className="whitespace-nowrap text-sm text-muted-dark">{row.meta}</span>
                  </motion.span>
                ))}
            </span>
            {atStage(answer, "detail") && (
              <motion.span className="flex items-center gap-2 font-mono text-sm text-muted-dark" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={pop(0)}>
                <ToolMark name={ANSWER_TOOL} className="h-3.5 w-3.5 text-foreground" />
                {r.footer}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
