"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import { Cell, DrawCheck, Part } from "./parts";

/**
 * One piece of work, and — before it is one — the room it will take.
 *
 * Every slot is on screen from the moment its place solidifies, as an empty
 * outline. That is the quiet half of the section's claim: how much can be in
 * motion at once is visible before anything is, so turning the dial up fills
 * the room rather than making more of it. When the last stop fills the last
 * outline, the yard is simply full, and no further turn of anything could add
 * a seventh.
 *
 * The layers are the ordinary ones: the outline morphs into a titled chip
 * (accepted), the mark lights and the rail starts to move (under way), the
 * word arrives, and it commits with a drawn check rather than a flag flip.
 */

const RAIL_MS = 900;

/** Nobody on it, then somebody, then done. */
function Mark({ running, done, reduced }: { running: boolean; done: boolean; reduced: boolean }) {
  if (done) {
    return (
      <span className="flex h-4 w-4 text-brand-cyan">
        <DrawCheck reduced={reduced} className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="relative flex h-3 w-3">
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

export default function JobSlot({
  title,
  stage,
  progress,
  waiting,
  reduced,
}: {
  title: string;
  stage: ModuleStage;
  progress: number;
  waiting: boolean;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const shell = atStage(stage, "shell");
  const running = atStage(stage, "body");
  const lit = atStage(stage, "detail");
  const done = atStage(stage, "chosen");

  return (
    <Cell
      solid={shell}
      waiting={waiting}
      reduced={reduced}
      round="rounded-lg"
      // A row on a narrow field and a stack on a wide one — the same three
      // pieces either way, arranged for whichever dimension is the scarce one.
      className="flex items-center gap-2.5 overflow-hidden px-2.5 md:flex-col md:items-stretch md:justify-center md:gap-1.5 md:px-3"
      style={{
        borderColor: done ? tint("cyan", 45) : running ? tint("cyan", 30) : undefined,
        backgroundColor: tint("cyan", done ? 8 : running ? 6 : 3),
        boxShadow: done ? brandShadow("cyan", 20, 18) : undefined,
      }}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2 md:w-full md:flex-none">
        <Part show i={0} reduced={reduced} className="flex shrink-0">
          <Mark running={running} done={done} reduced={reduced} />
        </Part>
        <Part
          show
          i={1}
          reduced={reduced}
          className="min-w-0 flex-1 truncate text-base leading-snug text-foreground"
        >
          {title}
        </Part>
        {/* Density, not payload — it steps aside on narrow viewports rather
            than shrinking the work's own name. */}
        <Part
          show={lit}
          i={2}
          reduced={reduced}
          className="hidden shrink-0 text-base lg:inline"
          style={{ color: BRAND_VAR.cyan }}
        >
          {done ? t.athenaPage.workshop.job.done : t.athenaPage.workshop.job.working}
        </Part>
      </span>

      <span
        className="h-1 w-14 shrink-0 overflow-hidden rounded-full md:w-full"
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
    </Cell>
  );
}
