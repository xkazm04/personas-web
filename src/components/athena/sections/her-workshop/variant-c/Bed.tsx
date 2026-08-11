"use client";

import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import type { Bed as BedCopy } from "./copy";
import JobSlot from "./JobSlot";
import type { Rect } from "./layout";
import { DrawCheck, Part, Slot } from "./parts";

/**
 * One place you opened to her.
 *
 * It is named the way anyone names a project, and it is the only kind of
 * ground in this scene work is ever put down on. Nothing ever runs between the
 * places, or beside them, or in the space around them — every piece of work in
 * the whole loop starts inside one of these, and each one shows exactly how
 * much room it has before it holds anything at all.
 *
 * The lamp beside the name is the place's own state: unlit while it is only
 * open, lit while it holds work, a drawn check when everything in it has
 * landed. It is the smallest thing on screen and it carries the beat, so the
 * name never has to say "busy".
 */

/** The place's own lamp — open, holding work, finished. */
function Lamp({ live, done, reduced }: { live: boolean; done: boolean; reduced: boolean }) {
  if (done) {
    return (
      <span className="flex h-4 w-4 shrink-0 text-brand-cyan">
        <DrawCheck reduced={reduced} className="h-4 w-4" />
      </span>
    );
  }
  return (
    <motion.span
      className="h-2 w-2 shrink-0 rounded-full duration-500 transition-[background-color,box-shadow]"
      style={{
        backgroundColor: tint("cyan", live ? 75 : 24),
        boxShadow: live ? brandShadow("cyan", 8, 60) : undefined,
      }}
      animate={live && !reduced ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
      transition={live && !reduced ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
      aria-hidden="true"
    />
  );
}

export default function Bed({
  rect,
  bed,
  stage,
  jobs,
  reduced,
}: {
  rect: Rect;
  bed: BedCopy;
  stage: ModuleStage;
  jobs: readonly { title: string; stage: ModuleStage; progress: number }[];
  reduced: boolean;
}) {
  const open = atStage(stage, "shell");
  const roomed = atStage(stage, "body");
  const live = atStage(stage, "detail");
  const done = atStage(stage, "chosen");

  return (
    <Slot
      rect={rect}
      solid={open}
      waiting
      reduced={reduced}
      className="flex flex-col gap-1.5 overflow-hidden px-3 py-2 backdrop-blur-sm md:flex-row md:gap-4 md:px-4 md:py-2.5"
      style={{
        borderColor: done ? tint("cyan", 40) : live ? tint("cyan", 28) : undefined,
        backgroundColor: tint("cyan", live ? 5 : 3),
      }}
    >
      <Part show i={0} reduced={reduced} className="flex shrink-0 items-center gap-2 md:w-44">
        <Lamp live={live && !done} done={done} reduced={reduced} />
        <span className="min-w-0 truncate text-base leading-snug text-foreground">
          <span className="hidden sm:inline">{bed.name}</span>
          <span className="sm:hidden">{bed.short}</span>
        </span>
      </Part>

      {/* The room inside. Stretches rather than centres, so a slot's outline is
          the exact rect the work ends up occupying. It stacks on a narrow
          field: side by side there, the work's own name would have to be cut
          in half, and the type floor on this page is not negotiable. */}
      <span className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 md:flex-row md:gap-2">
        {jobs.map((job) => (
          <JobSlot
            key={job.title}
            title={job.title}
            stage={job.stage}
            progress={job.progress}
            waiting={roomed}
            reduced={reduced}
          />
        ))}
      </span>
    </Slot>
  );
}
