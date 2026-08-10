"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { CONVERSATIONS, COPY, SOURCE_OF } from "./copy";
import { ROW_FRAC, type FieldLayout } from "./layout";
import { BREATH, Chorus, DrawCheck, Part, Slot } from "./parts";

/**
 * The conversation you are standing in.
 *
 * It is an ordinary thread — the same glass as the six around it, only nearer
 * — and it opens with one question that none of its own history can answer.
 * Everything after that arrives down the single thread from her.
 *
 * Each line lands with the conversation it came from already attached, so the
 * receipt is never a second gesture: the claim and where she heard it are one
 * object, and the hairline drawn later (see ./Threads) only makes visible a
 * join that was stated the moment the line appeared.
 *
 * The rows are placed at ROW_FRAC rather than flowed, because those same
 * fractions are where the hairlines leave the panel. Type and art read one
 * number, so the join is exact at every viewport instead of nearly right at
 * the one it was tuned on.
 */

const ROW = "absolute left-3.5 right-3.5 -translate-y-1/2 sm:left-5 sm:right-5";

export default function Answer({
  layout,
  stage,
  rowsIn,
  chorus,
  together,
  reduced,
}: {
  layout: FieldLayout;
  stage: ModuleStage;
  rowsIn: number;
  chorus: boolean;
  together: boolean;
  reduced: boolean;
}) {
  const c = COPY.open;
  const shell = atStage(stage, "shell");
  const asked = atStage(stage, "body");
  const settled = atStage(stage, "chosen");

  return (
    <Slot
      rect={layout.panel}
      solid={shell}
      waiting
      reduced={reduced}
      round="rounded-2xl"
      className="flex flex-col overflow-hidden px-3.5 py-2.5 backdrop-blur-md sm:px-5 sm:py-3.5"
      style={{
        borderColor: tint("cyan", settled ? 46 : 32),
        backgroundColor: tint("cyan", 7),
        boxShadow: brandShadow("cyan", 44, settled ? 16 : 10),
      }}
    >
      <Chorus on={chorus} reduced={reduced} />

      <span className="flex shrink-0 items-center gap-2">
        <Part show reduced={reduced} className={`min-w-0 truncate ${ANNOTATION_DIM}`}>
          {c.label}
        </Part>
        <motion.span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: BRAND_VAR.cyan }}
          initial={false}
          animate={{ opacity: reduced ? 1 : together ? [0.9, 0.4, 0.9] : [1, 0.3, 1] }}
          transition={
            reduced ? { duration: 0.3 } : together ? BREATH : { duration: 1.8, repeat: Infinity }
          }
          aria-hidden="true"
        />
      </span>

      {/* What you asked. It sits for a beat before anything answers it — the
          question is the only thing on screen she has not already handled. */}
      <Part
        show={asked}
        reduced={reduced}
        className="mt-2 shrink-0 self-end rounded-2xl rounded-br-md border px-3.5 py-1.5 text-base text-foreground"
        style={{ borderColor: tint("cyan", 30), backgroundColor: tint("cyan", 12) }}
      >
        {c.question}
      </Part>

      {COPY.rows.map((row, i) => (
        <span key={row.claim} className={ROW} style={{ top: `${ROW_FRAC[i] * 100}%` }}>
          <Part show={rowsIn > i} reduced={reduced} className="flex items-center gap-2.5">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: brandShadow("cyan", 6, 70) }}
            />
            {/* Claim and receipt sit tight against each other rather than at
                opposite ends of the panel: they are one object, and a gap the
                width of the answer would turn them back into two columns. */}
            <span className="min-w-0 shrink truncate text-base text-foreground">
              <span className="hidden sm:inline">{row.claim}</span>
              <span className="sm:hidden">{row.short}</span>
            </span>
            <span
              className="shrink-0 rounded-full border px-2.5 py-0.5 text-base"
              style={{ borderColor: tint("cyan", 30), color: BRAND_VAR.cyan }}
            >
              <span className="text-muted-dark">{c.from} </span>
              <span className="hidden sm:inline">{CONVERSATIONS[SOURCE_OF[i]].name}</span>
              <span className="sm:hidden">{CONVERSATIONS[SOURCE_OF[i]].short}</span>
            </span>
          </Part>
        </span>
      ))}

      <span className="mt-auto flex shrink-0 items-center gap-2 text-base text-muted-dark">
        {settled && (
          <>
            <DrawCheck reduced={reduced} className="h-4 w-4 text-brand-cyan" />
            <span className="hidden truncate sm:inline">{c.footer}</span>
            <span className="truncate sm:hidden">{c.footerShort}</span>
          </>
        )}
      </span>
    </Slot>
  );
}
