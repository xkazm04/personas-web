"use client";

import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION, ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY } from "./copy";
import type { Rect } from "./layout";
import { HEAT, soft } from "./palette";
import { DrawCheck, Panel, Part, Sheen } from "./parts";

/**
 * What she actually found.
 *
 * The one place in the section with numbers on it — and it only exists for the
 * one project that needed it, which is the argument: she looks at everything
 * and hands you a page about the single thing that could not wait. So the frame
 * opens EMPTY on the beat she notices (something is being written), solidifies
 * as she carries the light forward, and then fills in the order a person would
 * say it: the finding, why you never felt it, and only then the two things that
 * are not fine. The four that are fine get one line, because four fine things
 * are not news.
 *
 * On the commit beat it does not merely change state — it hands its outcome to
 * the light it was about (that light picks up "Back to 98%" under its name) and
 * then leaves the field whole.
 *
 * Every state names its own `borderColor`; the frame carries the subject's
 * current temperature, so the report is visibly about a thing that was rotting.
 */
export default function FindingPanel({
  rect,
  stage,
  health,
  open,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  health: number;
  /** The report's whole life, frame included. */
  open: boolean;
  reduced: boolean;
}) {
  const c = COPY.finding;
  const shell = atStage(stage, "shell");
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  const settled = atStage(stage, "chosen");
  const color = HEAT[health];
  const heat = settled ? tint("cyan", 7) : soft(color, 6);

  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: open ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.7, ease: "easeOut" }}
    >
      <Panel
        rect={rect}
        solid={shell}
        waiting={open}
        reduced={reduced}
        className="flex flex-col gap-2 overflow-hidden bg-surface/90 px-5 py-3.5 backdrop-blur-md sm:gap-2.5 sm:px-6 sm:py-5"
        style={{
          borderColor: settled ? tint("cyan", 50) : soft(color, 46),
          // The heat rides as a background IMAGE over an almost-opaque surface:
          // the report opens on top of a field that is already blurred, and a
          // glass card over a blur turns the lights behind it into smears.
          backgroundImage: `linear-gradient(${heat}, ${heat})`,
          boxShadow: settled ? brandShadow("cyan", 40, 22) : `0 0 34px ${soft(color, 16)}`,
        }}
      >
        <Sheen on={settled} reduced={reduced} />

        <Part show i={0} reduced={reduced} className="flex flex-col gap-1">
          <span
            className={`hidden truncate md:block ${ANNOTATION}`}
            style={{ color: settled ? undefined : color }}
          >
            {c.eyebrow}
          </span>
          <span className="truncate text-lg font-medium text-foreground sm:text-2xl">
            {COPY.projects[2]}
          </span>
        </Part>

        <Part
          show={body}
          i={0}
          lead={0.05}
          reduced={reduced}
          className="text-base text-foreground sm:text-lg"
        >
          {c.lead}
        </Part>
        <Part show={body} i={1} lead={0.05} reduced={reduced} className="text-base text-muted-dark">
          {c.drift}
        </Part>

        {/* Packed from the top, never `mt-auto`: the footer mounts two beats
            after these rows, and a bottom-pinned group would shove them up. */}
        <span className="flex flex-col gap-1.5 sm:gap-2">
          {c.rows.map((row, i) => (
            <Part
              key={row.label}
              show={detail}
              i={i}
              reduced={reduced}
              className={`items-center gap-2.5 ${i === 0 ? "flex" : "hidden md:flex"}`}
            >
              <motion.span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: settled ? tint("cyan", 85) : soft(color, 85) }}
                animate={settled || reduced ? { opacity: 1 } : { opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.25 }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-base text-foreground">{row.label}</span>
              <span
                className="shrink-0 font-mono text-base"
                style={{ color: settled ? tint("cyan", 90) : color }}
              >
                {row.value}
              </span>
            </Part>
          ))}
          <Part
            show={detail}
            i={2}
            reduced={reduced}
            className="hidden truncate text-base text-muted-dark md:block"
          >
            {c.fine}
          </Part>
        </span>

        <Part
          show={settled}
          reduced={reduced}
          className="flex shrink-0 items-center gap-2 text-brand-cyan"
        >
          <DrawCheck reduced={reduced} className="h-4 w-4" delay={0.2} />
          <span className="truncate text-base">{c.resolved}</span>
          <span className={`ml-auto hidden truncate normal-case sm:block ${ANNOTATION_DIM}`}>
            {c.watching}
          </span>
        </Part>
      </Panel>
    </motion.div>
  );
}
