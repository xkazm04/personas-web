"use client";

import { motion } from "framer-motion";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { COPY } from "../data";
import type { Rect } from "../layout";
import { Part } from "./parts";
import { Chip } from "./primitives";
import { PanelHeader, TargetPanel } from "./shell";

/**
 * The plan card — the answer to one sentence, laid out as something a person
 * can read and change BEFORE anything runs. The frame and its title solidify
 * while she is still crossing to it (shell); the steps land inside it as she
 * arrives (they place themselves, see `./PlanStep`); and the card completes on
 * its own beat: the estimate lands beside the guarantee that nothing here has
 * started yet.
 *
 * The steps and the start control are absolutely placed OVER this card rather
 * than flowed inside it, so the corner brackets can frame a single step, and
 * so nothing inside can ever push anything else around.
 */
export function PlanCard({
  rect,
  stage,
  locked,
  compact,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  locked: boolean;
  compact: boolean;
  reduced: boolean;
}) {
  const c = COPY.plan;
  const complete = atStage(stage, "chosen");
  return (
    <TargetPanel
      rect={rect}
      stage={stage}
      locked={locked}
      reduced={reduced}
      className="flex-col justify-between px-3.5 py-2.5"
    >
      <PanelHeader
        title={c.title}
        hint={compact ? c.hintCompact : c.hint}
        reduced={reduced}
      />

      {/* Footer: what it will take, and who starts it. Sits below the start
          control, which is placed over this card at its own rect. */}
      <span className="hidden min-h-6 min-w-0 shrink-0 items-center gap-2 md:flex">
        <Part show={complete} reduced={reduced} className="flex min-w-0">
          <Estimate label={c.total} reduced={reduced} />
        </Part>
        <Part show reduced={reduced} className={`ml-auto shrink-0 truncate normal-case ${ANNOTATION_DIM}`}>
          {COPY.confirm.note}
        </Part>
      </span>
    </TargetPanel>
  );
}

/** The time estimate, arriving with a soft brand wash — the last thing the
 *  card learns about itself before it is handed back to you. */
function Estimate({ label, reduced }: { label: string; reduced: boolean }) {
  return (
    <motion.span
      className="flex min-w-0"
      initial={reduced ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
    >
      <Chip accent>{label}</Chip>
    </motion.span>
  );
}
