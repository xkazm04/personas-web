"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY } from "../data";
import type { Rect } from "../layout";
import { Flash, Part } from "./parts";
import { Chip } from "./primitives";
import { TargetPanel } from "./shell";

/**
 * One step of the plan, placed over the plan card at its own rect so the
 * brackets can frame exactly this one. It arrives with the card's content
 * cascade (`from="body"`, staggered by index), its texture — where the work
 * comes from, how it will be done, what it will take — fills on the lock, and
 * on the step she lands on, a correction LANDS.
 *
 * That correction is the point of the whole section, so it is played rather
 * than flipped: the edit affordance appears first (this is changeable), then
 * the chip's value rolls over to a different answer, a beat washes the row,
 * and the row keeps an "edited" mark for the rest of the loop. The plan came
 * from Athena; the last word did not.
 */

type Step = (typeof COPY.plan.steps)[number];

export function PlanStep({
  rect,
  step,
  index,
  stage,
  locked,
  editable,
  editHinted,
  edited,
  reduced,
}: {
  rect: Rect;
  step: Step;
  index: number;
  stage: ModuleStage;
  locked: boolean;
  /** True for the one step she lands on and corrects. */
  editable: boolean;
  editHinted: boolean;
  edited: boolean;
  reduced: boolean;
}) {
  const c = COPY.plan;
  const Pencil = c.editIcon;
  const Icon = step.icon;
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  const changed = editable && edited;
  const hinting = editable && editHinted && !edited;
  return (
    <TargetPanel
      rect={rect}
      stage={stage}
      from="body"
      ghost={false}
      lead={index * 0.14}
      locked={locked}
      marked={changed}
      reduced={reduced}
      className="flex-col justify-center gap-1 px-3 py-1.5"
    >
      <Flash on={changed} reduced={reduced} />

      <span className="flex min-h-6 min-w-0 shrink-0 items-center gap-2.5">
        <Part show={body} i={0} lead={index * 0.14} reduced={reduced} className="flex shrink-0">
          <StepBadge n={step.n} marked={changed} />
        </Part>
        <Part
          show={body}
          i={1}
          lead={index * 0.14}
          reduced={reduced}
          className="min-w-0 truncate text-base font-semibold text-foreground"
        >
          {step.title}
        </Part>
        {hinting && (
          <Part show reduced={reduced} className="ml-auto flex shrink-0 items-center gap-1.5 text-base text-brand-cyan">
            <Pencil className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{c.editHint}</span>
          </Part>
        )}
        {changed && (
          <Part show reduced={reduced} className="ml-auto flex shrink-0">
            <Chip accent>{c.editedPill}</Chip>
          </Part>
        )}
        <Part
          show={detail}
          i={2}
          lead={0.2}
          reduced={reduced}
          className={`shrink-0 truncate normal-case ${hinting || changed ? "" : "ml-auto"} ${ANNOTATION_DIM}`}
        >
          {step.effort}
        </Part>
      </span>

      {/* The chip row reserves its line box from the moment the step exists,
          so the texture landing a beat later cannot lift the title. */}
      <span className="hidden min-h-6 min-w-0 shrink-0 items-center gap-2 md:flex">
        <Part show={detail} i={0} lead={0.16} reduced={reduced} className="flex min-w-0">
          <Chip icon={<Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}>{step.source}</Chip>
        </Part>
        <Part show={detail} i={1} lead={0.16} reduced={reduced} className="flex min-w-0">
          <ApproachChip step={step} changed={changed} reduced={reduced} />
        </Part>
      </span>
    </TargetPanel>
  );
}

/** The step number, which picks up the accent once the step has been changed
 *  — the smallest possible reminder of whose plan it is now. */
function StepBadge({ n, marked }: { n: string; marked: boolean }) {
  return (
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-md border text-base duration-500 transition-[background-color,border-color,color] ${
        marked ? "text-brand-cyan" : "border-glass text-muted-dark"
      }`}
      style={marked ? { borderColor: tint("cyan", 45), backgroundColor: tint("cyan", 14) } : undefined}
      aria-hidden="true"
    >
      {n}
    </span>
  );
}

/** The chip that changes its mind. Keyed on the value, so the old answer is
 *  gone and the new one rolls up into its place in a single commit — the same
 *  idiom the rest of the page uses for a value that has been decided. */
function ApproachChip({
  step,
  changed,
  reduced,
}: {
  step: Step;
  changed: boolean;
  reduced: boolean;
}) {
  const edit = "approachEdited" in step ? step.approachEdited : undefined;
  const label = changed && edit ? edit : step.approach;
  return (
    <Chip accent={changed} className="overflow-hidden">
      <motion.span
        key={label}
        className="block whitespace-nowrap"
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0 } : SPRING_POP}
        style={changed ? { color: BRAND_VAR.cyan } : undefined}
      >
        {label}
      </motion.span>
    </Chip>
  );
}
