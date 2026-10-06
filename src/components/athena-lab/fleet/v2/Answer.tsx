"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { atStage, stepDelay, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import { ANSWER_TOOL } from "../shared/cast";
import ToolMark from "../shared/ToolMark";
import { box, type Rect } from "./layout";

/**
 * The one answer the four rings close into - the sentence's last phrase,
 * answered - and where it went. One box mounted all loop: a dashed ghost that
 * solidifies, then rows, then the hand-off to the team.
 */
export default function Answer({ rect, stage, ghost, reduced }: { rect: Rect; stage: ModuleStage; ghost: boolean; reduced: boolean }) {
  const { t } = useTranslation();
  const c = t.athenaPage.fleet.result;
  const shell = atStage(stage, "shell");
  const settled = atStage(stage, "chosen");
  const pop = (i: number) => (reduced ? { duration: 0 } : { ...SPRING_POP, delay: stepDelay(i) });
  return (
    <div
      className={`absolute flex flex-col gap-1.5 rounded-2xl border px-4 py-3 backdrop-blur-md transition-[border-color,background-color,box-shadow,opacity] duration-500 ${shell ? "" : "border-dashed"}`}
      style={{
        ...box(rect),
        opacity: ghost || shell ? 1 : 0,
        borderColor: tint("cyan", settled ? 55 : shell ? 30 : 14),
        backgroundColor: tint("cyan", settled ? 9 : shell ? 5 : 2),
        boxShadow: settled ? brandShadow("cyan", 40, 26) : undefined,
      }}
    >
      {shell && (
        <motion.span className="text-lg font-semibold leading-tight text-foreground" initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={pop(0)}>
          {c.title}
        </motion.span>
      )}
      <span className="flex min-h-0 flex-1 flex-col justify-center gap-1">
        {atStage(stage, "body") &&
          c.rows.map((row, i) => (
            <motion.span key={row.label} className="flex items-center gap-2.5" initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={pop(i)}>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: BRAND_VAR.cyan }} />
              <span className="min-w-0 flex-1 whitespace-nowrap text-base text-foreground">{row.label}</span>
              <span className="shrink-0 whitespace-nowrap text-sm text-muted-dark">{row.meta}</span>
            </motion.span>
          ))}
      </span>
      {atStage(stage, "detail") && (
        <motion.span className="flex items-center gap-2 font-mono text-sm text-muted-dark" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={pop(0)}>
          <ToolMark name={ANSWER_TOOL} className="h-3.5 w-3.5 text-foreground" />
          {c.footer}
        </motion.span>
      )}
    </div>
  );
}
