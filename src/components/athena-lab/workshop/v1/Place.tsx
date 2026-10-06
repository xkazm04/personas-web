"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { Cell, DrawCheck, Part, Slot } from "@/components/athena/sections/her-workshop/variant-c/parts";
import { useTranslation } from "@/i18n/useTranslation";
import type { Frame } from "../shared/art";
import type { Box } from "./layout";

/**
 * One place you opened to her, and the room inside it.
 *
 * Built from the live section's atoms (`Slot`, `Cell`, `Part`, `DrawCheck`):
 * every box is mounted the whole loop, an outline that morphs into the real
 * panel, so nothing in the yard ever shoves the line. What changed is depth
 * and hierarchy: places are glass with a lit top edge, the place's name leads
 * in display weight, each job's own word sits in the console voice, and the
 * whole of it is sized in art units so it grows with the stage.
 */

export interface JobView {
  title: string;
  stage: ModuleStage;
  progress: number;
}

function Mark({ running, done, reduced, size }: { running: boolean; done: boolean; reduced: boolean; size: string }) {
  if (done) {
    return (
      <span className="flex shrink-0 text-brand-cyan" style={{ width: size, height: size }}>
        <DrawCheck reduced={reduced} className="h-full w-full" />
      </span>
    );
  }
  return (
    <span className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <motion.span
        className="absolute inset-0 rounded-full border"
        style={{ borderColor: tint("cyan", 45) }}
        initial={false}
        animate={running && !reduced ? { opacity: [0.8, 0, 0.8], scale: [0.7, 1.4, 0.7] } : { opacity: 0, scale: 1 }}
        transition={running && !reduced ? { duration: 1.8, repeat: Infinity, ease: "easeOut" } : { duration: 0.3 }}
      />
      <span
        className={`h-3/4 w-3/4 rounded-full border duration-500 transition-[background-color,border-color] ${running ? "" : "border-dashed"}`}
        style={{ borderColor: tint("cyan", running ? 65 : 30), backgroundColor: running ? tint("cyan", 55) : "transparent" }}
      />
    </span>
  );
}

function Job({ job, waiting, stack, f, reduced }: { job: JobView; waiting: boolean; stack: boolean; f: Frame; reduced: boolean }) {
  const { t } = useTranslation();
  const shell = atStage(job.stage, "shell");
  const running = atStage(job.stage, "body");
  const lit = atStage(job.stage, "detail");
  const done = atStage(job.stage, "chosen");
  return (
    <Cell
      solid={shell}
      waiting={waiting}
      reduced={reduced}
      round="rounded-lg"
      className={`flex justify-center overflow-hidden ${stack ? "flex-row items-center" : "flex-col"}`}
      style={{
        gap: f.len(8, 4),
        paddingInline: f.len(14, 8),
        borderColor: done ? tint("cyan", 50) : running ? tint("cyan", 32) : undefined,
        backgroundColor: tint("cyan", done ? 9 : running ? 6 : 3),
        boxShadow: done ? `${brandShadow("cyan", 22, 22)}, inset 0 1px 0 ${tint("cyan", 30)}` : `inset 0 1px 0 ${tint("cyan", 14)}`,
      }}
    >
      <span className="flex min-w-0 items-center" style={{ gap: f.len(10, 6), flex: stack ? "1 1 0" : undefined }}>
        <Part show i={0} reduced={reduced} className="flex shrink-0">
          <Mark running={running} done={done} reduced={reduced} size={f.len(18, 14)} />
        </Part>
        <Part show i={1} reduced={reduced} className="min-w-0 flex-1 leading-tight text-foreground" style={f.fs(19, 16)}>
          {job.title}
        </Part>
      </span>
      <span className="flex shrink-0 items-center" style={{ gap: f.len(10, 6) }}>
        <span
          className="flex-1 overflow-hidden rounded-full"
          style={{ height: f.len(4, 3), minWidth: f.len(60, 36), backgroundColor: tint("cyan", 12) }}
          aria-hidden="true"
        >
          <span
            className={`block h-full rounded-full ${reduced ? "" : "transition-[width] duration-[900ms] ease-linear"}`}
            style={{ width: `${Math.round(job.progress * 100)}%`, backgroundColor: BRAND_VAR.cyan, boxShadow: job.progress > 0 ? brandShadow("cyan", 8, 50) : undefined }}
          />
        </span>
        {!stack && (
          <Part show={lit} i={2} reduced={reduced} className="shrink-0 font-mono uppercase tracking-[0.14em] @max-[60rem]:hidden" style={{ ...f.fs(13, 12), color: BRAND_VAR.cyan }}>
            {done ? t.athenaPage.workshop.job.done : t.athenaPage.workshop.job.working}
          </Part>
        )}
      </span>
    </Cell>
  );
}

export default function Place({
  rect,
  name,
  stage,
  jobs,
  stack,
  f,
  W,
  H,
  reduced,
}: {
  rect: Box;
  name: string;
  stage: ModuleStage;
  jobs: readonly JobView[];
  stack: boolean;
  f: Frame;
  W: number;
  H: number;
  reduced: boolean;
}) {
  const open = atStage(stage, "shell");
  const roomed = atStage(stage, "body");
  const live = atStage(stage, "detail");
  const done = atStage(stage, "chosen");
  const pct = { x: (rect.x / W) * 100, y: (rect.y / H) * 100, w: (rect.w / W) * 100, h: (rect.h / H) * 100 };

  return (
    <Slot
      rect={pct}
      solid={open}
      waiting
      reduced={reduced}
      className={`flex overflow-hidden backdrop-blur-sm ${stack ? "flex-col" : "flex-row items-stretch"}`}
      style={{
        gap: f.len(14, 6),
        padding: f.len(12, 8),
        borderColor: done ? tint("cyan", 44) : live ? tint("cyan", 30) : undefined,
        backgroundColor: tint("cyan", live ? 6 : 3),
        boxShadow: `inset 0 1px 0 ${tint("cyan", live ? 34 : 16)}, 0 18px 40px -24px ${tint("cyan", 30)}`,
      }}
    >
      <Part show i={0} reduced={reduced} className="flex shrink-0 items-center" style={{ gap: f.len(10, 8), width: stack ? undefined : f.len(192) }}>
        {done ? (
          <span className="flex shrink-0 text-brand-cyan" style={{ width: f.len(18, 14), height: f.len(18, 14) }}>
            <DrawCheck reduced={reduced} className="h-full w-full" />
          </span>
        ) : (
          <motion.span
            className="shrink-0 rounded-full duration-500 transition-[background-color,box-shadow]"
            style={{ width: f.len(9, 7), height: f.len(9, 7), backgroundColor: tint("cyan", live ? 80 : 26), boxShadow: live ? brandShadow("cyan", 10, 60) : undefined }}
            animate={live && !reduced ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
            transition={live && !reduced ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
            aria-hidden="true"
          />
        )}
        <span className="min-w-0 font-semibold leading-tight text-foreground" style={f.fs(21, 16)}>
          {name}
        </span>
      </Part>
      <span className={`flex min-h-0 min-w-0 flex-1 ${stack ? "flex-col" : "flex-row"}`} style={{ gap: f.len(10, 6) }}>
        {jobs.map((job) => (
          <Job key={job.title} job={job} waiting={roomed} stack={stack} f={f} reduced={reduced} />
        ))}
      </span>
    </Slot>
  );
}
