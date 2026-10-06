"use client";

import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import ToolMark from "../shared/ToolMark";
import type { Task } from "./copy";
import type { Rect } from "./layout";
import { DrawCheck, Part, Sheen, Slot } from "./parts";

/**
 * One piece of work, derived from one phrase - and now handed to someone.
 *
 * The four layers are four claims: the SHELL is the plan (a title and the
 * narrowing she proposed, still just words), the BODY is an agent arriving and
 * the work starting, the DETAIL is it running, CHOSEN is what it came back with.
 *
 * Evolved: the mark on the left is the agent itself, wearing the real tool it
 * works in (`tool`, a connector mark). An empty dashed ring while this is only
 * a proposal; the agent with a live ring once it is on it; the agent with a
 * drawn check when it lands. The rail tweens between ticks so four tasks
 * finishing at four moments read as four different amounts of work.
 */

const RAIL_MS = 900;

function Agent({ tool, running, done, reduced }: { tool: string; running: boolean; done: boolean; reduced: boolean }) {
  const on = running || done;
  return (
    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
      {running && !done && !reduced && (
        <motion.span
          className="absolute -inset-1 rounded-full border"
          style={{ borderColor: tint("cyan", 50) }}
          animate={{ opacity: [0.8, 0, 0.8], scale: [0.85, 1.35, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full border duration-500 transition-[background-color,border-color] ${on ? "" : "border-dashed"}`}
        style={{
          borderColor: tint("cyan", on ? 60 : 30),
          backgroundColor: on ? tint("cyan", 16) : "transparent",
        }}
      >
        <motion.span
          className="flex text-foreground"
          initial={false}
          animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.4 }}
          transition={reduced ? { duration: 0 } : { type: "spring", bounce: 0.4, duration: 0.6 }}
        >
          <ToolMark name={tool} className="h-3.5 w-3.5" />
        </motion.span>
      </span>
      {done && (
        <span
          className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border text-brand-cyan"
          style={{ backgroundColor: "var(--background)", borderColor: tint("cyan", 60) }}
        >
          <DrawCheck reduced={reduced} className="h-2.5 w-2.5" />
        </span>
      )}
    </span>
  );
}

export default function TaskCard({
  rect,
  tilt,
  task,
  tool,
  stage,
  progress,
  waiting,
  editable,
  edited,
  reduced,
}: {
  rect: Rect;
  tilt: number;
  task: Task;
  tool: string;
  stage: ModuleStage;
  progress: number;
  waiting: boolean;
  editable: boolean;
  edited: boolean;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const shell = atStage(stage, "shell");
  const running = atStage(stage, "body");
  const done = atStage(stage, "chosen");
  const changed = edited && !!task.scopeEdited;
  const scope = changed && task.scopeEdited ? task.scopeEdited : task.scope;
  return (
    <Slot
      rect={rect}
      solid={shell}
      waiting={waiting}
      reduced={reduced}
      tilt={tilt}
      className="flex flex-col justify-between overflow-hidden px-3 pb-2.5 pt-2.5 backdrop-blur-sm"
      style={{
        borderColor: done ? tint("cyan", 48) : running ? tint("cyan", 32) : undefined,
        backgroundColor: tint("cyan", done ? 9 : running ? 6 : 3),
        boxShadow: done ? brandShadow("cyan", 26, 22) : undefined,
      }}
    >
      {/* Work starting is a moment, not a flag flip */}
      <Sheen on={running && !atStage(stage, "detail")} reduced={reduced} />

      <span className="flex items-center gap-2">
        <Part show i={0} reduced={reduced} className="flex shrink-0">
          <Agent tool={tool} running={running} done={done} reduced={reduced} />
        </Part>
        <Part show i={1} reduced={reduced} className="min-w-0 flex-1 text-base font-medium leading-snug text-foreground">
          {task.title}
        </Part>
      </span>

      <span className="flex items-center gap-2">
        {/* The narrowing she proposed - and, on one card, the one you changed */}
        <Part
          show
          i={2}
          reduced={reduced}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-sm"
          style={{
            borderColor: changed ? tint("cyan", 45) : tint("cyan", 18),
            color: changed ? BRAND_VAR.cyan : "var(--muted-dark)",
          }}
        >
          <motion.span
            key={scope}
            className="inline-block"
            initial={reduced ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
          >
            {scope}
          </motion.span>
          {editable && task.scopeEdited && !edited && (
            <Pencil className="h-3.5 w-3.5 text-brand-cyan" aria-hidden="true" />
          )}
        </Part>
        {/* While it runs, it says so; when it lands, what it came back with */}
        {running && (
          <Part show reduced={reduced} className="ml-auto flex shrink-0 items-center">
            {done ? (
              <span className="whitespace-nowrap text-base font-semibold text-brand-cyan">{task.found}</span>
            ) : (
              <span
                className="rounded-full border px-2 py-0.5 text-sm"
                style={{ borderColor: tint("cyan", 30), backgroundColor: tint("cyan", 10), color: BRAND_VAR.cyan }}
              >
                {t.athenaPage.fleet.task.working}
              </span>
            )}
          </Part>
        )}
      </span>

      <span className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: tint("cyan", 12) }} aria-hidden="true">
        <span
          className={`block h-full rounded-full ${reduced ? "" : "transition-[width] ease-linear"}`}
          style={{
            width: `${Math.round(progress * 100)}%`,
            backgroundColor: BRAND_VAR.cyan,
            boxShadow: progress > 0 ? brandShadow("cyan", 8, 50) : undefined,
            transitionDuration: `${RAIL_MS}ms`,
          }}
        />
      </span>
    </Slot>
  );
}
