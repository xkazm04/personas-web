"use client";

import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY, type Task } from "./copy";
import type { Rect } from "./layout";
import { DrawCheck, Part, Sheen, Slot } from "./parts";

/**
 * One piece of work, derived from one phrase.
 *
 * The card composes in the same four layers as everything else, but here each
 * layer is a different claim: the SHELL is the plan (a title and the narrowing
 * Athena proposed — still just words), the BODY is a worker arriving and the
 * work actually starting, the DETAIL is it running, and CHOSEN is what it came
 * back with. Nothing about the card says "running" until you have started it.
 *
 * The mark on the left is the worker: an empty dashed ring while this is only
 * a proposal, a lit disc with a live ring once someone is on it, a drawn check
 * when it lands. The rail underneath tweens between ticks so four tasks
 * finishing at four different moments reads as four different amounts of work.
 */

const RAIL_MS = 900;

/** The worker: nobody, then somebody, then done. */
function Mark({ running, done, reduced }: { running: boolean; done: boolean; reduced: boolean }) {
  if (done) {
    return (
      <span className="mt-0.5 flex h-4 w-4 shrink-0 text-brand-cyan">
        <DrawCheck reduced={reduced} className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="relative mt-1 flex h-3 w-3 shrink-0">
      {running && !reduced && (
        <motion.span
          className="absolute -inset-1 rounded-full border"
          style={{ borderColor: tint("cyan", 45) }}
          animate={{ opacity: [0.8, 0, 0.8], scale: [0.8, 1.5, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span
        className={`h-3 w-3 rounded-full border duration-500 transition-[background-color,border-color] ${running ? "" : "border-dashed"}`}
        style={{
          borderColor: tint("cyan", running ? 60 : 28),
          backgroundColor: running ? tint("cyan", 55) : "transparent",
        }}
      />
    </span>
  );
}

export default function TaskCard({
  rect,
  tilt,
  task,
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
  stage: ModuleStage;
  progress: number;
  waiting: boolean;
  editable: boolean;
  edited: boolean;
  reduced: boolean;
}) {
  const shell = atStage(stage, "shell");
  const running = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  const done = atStage(stage, "chosen");
  const scope = edited && task.scopeEdited ? task.scopeEdited : task.scope;
  return (
    <Slot
      rect={rect}
      solid={shell}
      waiting={waiting}
      reduced={reduced}
      tilt={tilt}
      className="flex flex-col gap-1 overflow-hidden px-3 py-2 backdrop-blur-sm md:py-2.5"
      style={{
        borderColor: done ? tint("cyan", 48) : running ? tint("cyan", 30) : undefined,
        backgroundColor: tint("cyan", done ? 8 : running ? 6 : 3),
        boxShadow: done ? brandShadow("cyan", 26, 20) : undefined,
      }}
    >
      {/* Work starting is a moment, not a flag flip */}
      <Sheen on={running && !detail} reduced={reduced} />

      <span className="flex items-start gap-2">
        <Part show i={0} reduced={reduced} className="flex shrink-0">
          <Mark running={running} done={done} reduced={reduced} />
        </Part>
        <Part
          show
          i={1}
          reduced={reduced}
          className="line-clamp-1 min-w-0 flex-1 text-base leading-snug text-foreground md:line-clamp-2"
        >
          {task.title}
        </Part>
      </span>

      {/* The narrowing she proposed — and, on one card, the one you changed */}
      <span className="hidden items-center gap-1.5 md:flex">
        <Part
          show
          i={2}
          reduced={reduced}
          className="truncate rounded-md border border-glass px-2 py-0.5 font-mono text-base text-muted-dark"
          style={{
            borderColor: edited && task.scopeEdited ? tint("cyan", 40) : undefined,
            color: edited && task.scopeEdited ? BRAND_VAR.cyan : undefined,
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
        </Part>
        {editable && task.scopeEdited && !edited && (
          <Part show reduced={reduced} className="flex shrink-0">
            <Pencil className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
          </Part>
        )}
      </span>

      <span className="mt-auto flex flex-col gap-1.5">
        <span
          className="h-1 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: tint("cyan", 12) }}
          aria-hidden="true"
        >
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
        {/* What it came back with, and where it got to. Both step aside on
            narrow viewports — the mark and the rail carry state there, so
            density comes down and type never does. */}
        <span className="hidden items-center gap-2 md:flex">
          <Part show={detail} reduced={reduced} className="min-w-0 flex-1 truncate text-base text-muted-dark">
            {task.found}
          </Part>
          {running && (
            <Part show reduced={reduced} className="ml-auto shrink-0">
              <span
                className="flex items-center rounded-full border px-2 py-0.5 text-base"
                style={{
                  borderColor: tint("cyan", done ? 45 : 30),
                  backgroundColor: tint("cyan", 10),
                  color: BRAND_VAR.cyan,
                }}
              >
                {done ? COPY.task.finished : COPY.task.working}
              </span>
            </Part>
          )}
        </span>
      </span>
    </Slot>
  );
}
