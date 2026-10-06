"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import { BIG, BODY, LABEL, MONO } from "../shared/type";
import { SOURCE_OF } from "./copy";
import { MediumIcon, VoiceBar } from "../shared/icons";
import { ROW_FRAC, type FieldLayout } from "./layout";
import { BREATH, Chorus, DrawCheck, Part, Slot } from "../shared/parts";

/**
 * The conversation you are standing in - and this time you are TALKING to
 * her. The question arrives the way speech does: a voice bar first, moving
 * while you talk, and then the words, set in the bubble as you finish. The
 * bubble is one box the whole time; only what it carries changes.
 *
 * Her answer comes down the single thread one line per beat, and each line
 * lands already joined to the conversation it came from: the chip names it,
 * the hairline (./Threads) draws to it on the same beat, and the card it
 * reaches lights up. Rows are placed at ROW_FRAC, the same fractions the
 * hairlines leave from, so the join is exact at every size.
 *
 * Type hierarchy, top to bottom: your question at the largest size (it is the
 * thing being answered), her lines at reading size, the chips and the console
 * label at label size.
 */

const GLASS = "color-mix(in srgb, color-mix(in srgb, var(--brand-cyan) 7%, var(--background)) 86%, transparent)";

const ROW = "absolute left-[1.1em] right-[1.1em] -translate-y-1/2";

export default function Answer({
  layout,
  stage,
  speaking,
  asked,
  rowsIn,
  chorus,
  together,
  reduced,
  running,
}: {
  layout: FieldLayout;
  stage: ModuleStage;
  speaking: boolean;
  asked: boolean;
  rowsIn: number;
  chorus: boolean;
  together: boolean;
  reduced: boolean;
  running: boolean;
}) {
  const { t } = useTranslation();
  const { conversations, open: c, rows } = t.athenaPage.oneMind;
  const shell = atStage(stage, "shell");
  const voiced = atStage(stage, "body");
  const settled = atStage(stage, "chosen");

  return (
    <Slot
      rect={layout.panel}
      solid={shell}
      waiting
      reduced={reduced}
      round="rounded-2xl"
      className="flex flex-col overflow-hidden px-[1.1em] py-[0.8em] backdrop-blur-md"
      style={{
        ...LABEL,
        borderColor: tint("cyan", settled ? 48 : 34),
        // Near-opaque glass: the gathers that pass behind it read as depth,
        // not as smudges on the answer.
        backgroundColor: GLASS,
        boxShadow: `${brandShadow("cyan", 48, settled ? 18 : 11)}, inset 0 1px 0 ${tint("cyan", 30)}`,
      }}
    >
      <Chorus on={chorus} reduced={reduced} />

      <span className={`flex shrink-0 items-center gap-2 whitespace-nowrap text-muted-dark ${MONO}`}>
        <Part show reduced={reduced}>
          {c.label}
        </Part>
        <motion.span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: BRAND_VAR.cyan }}
          initial={false}
          animate={{ opacity: !running ? 1 : together ? [0.9, 0.4, 0.9] : [1, 0.3, 1] }}
          transition={
            !running ? { duration: 0.3 } : together ? BREATH : { duration: 1.8, repeat: Infinity }
          }
          aria-hidden="true"
        />
      </span>

      {/* Your question: voice first, then the words */}
      <Part
        show={voiced}
        reduced={reduced}
        className="mt-[0.7em] flex shrink-0 items-center gap-[0.6em] self-end whitespace-nowrap rounded-2xl rounded-br-md border px-[0.8em] py-[0.35em] text-foreground"
        style={{ ...BIG, borderColor: tint("cyan", 34), backgroundColor: tint("cyan", 12) }}
      >
        <span className="flex items-center gap-[0.4em] text-brand-cyan">
          <MediumIcon medium="spoken" />
          <VoiceBar live={speaking && running} />
        </span>
        {asked && (
          <motion.span
            initial={reduced ? false : { opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: "easeOut" }}
          >
            {c.question}
          </motion.span>
        )}
      </Part>

      {rows.map((row, i) => (
        <span key={row.claim} className={ROW} style={{ top: `${ROW_FRAC[i] * 100}%` }}>
          <Part
            show={rowsIn > i}
            reduced={reduced}
            className={`flex items-center gap-[0.6em] whitespace-nowrap ${layout.sources[i].side === "right" ? "justify-end" : ""}`}
          >
            <span
              className="h-[0.45em] w-[0.45em] shrink-0 rounded-full"
              style={{ ...BODY, backgroundColor: BRAND_VAR.cyan, boxShadow: brandShadow("cyan", 8, 70) }}
            />
            <span className="text-foreground" style={BODY}>
              {row.short}
            </span>
            <span
              className="flex shrink-0 items-center gap-[0.35em] rounded-full border px-[0.7em] py-[0.15em]"
              style={{ borderColor: tint("cyan", 32), backgroundColor: tint("cyan", 6), color: BRAND_VAR.cyan }}
            >
              <span className="text-muted-dark">{c.from}</span>
              {conversations[SOURCE_OF[i]].name}
            </span>
          </Part>
        </span>
      ))}

      <span className="mt-auto flex shrink-0 items-center gap-2 whitespace-nowrap text-muted-dark" style={BODY}>
        {settled && (
          <>
            <DrawCheck reduced={reduced} className="h-[1em] w-[1em] text-brand-cyan" />
            <span>{c.footer}</span>
          </>
        )}
      </span>
    </Slot>
  );
}
