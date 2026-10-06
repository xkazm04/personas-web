"use client";

import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { useTranslation } from "@/i18n/useTranslation";
import { requestFrom } from "./shared/cast";
import SentenceText from "./shared/SentenceText";
import { box, type Rect } from "./layout";

/**
 * What you said - and the key to the dial. Each phrase that becomes work
 * lights in its teammate's colour the moment that teammate joins, so the
 * sentence doubles as the legend: purple words, purple ring. The last phrase,
 * the one that becomes the answer, lights last and in the page's own ink.
 *
 * Highlights bleed outside their run (`-mx-1` + `px-1`) and carry their
 * padding unlit, so lighting a phrase can never re-wrap the sentence.
 */

export default function Sentence({
  rect,
  stage,
  clauses,
  lit,
  compact = false,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  clauses: number;
  lit: boolean[];
  /** Phones: one step smaller, so a long locale still fits five lines. */
  compact?: boolean;
  reduced: boolean;
}) {
  const { t } = useTranslation();
  const c = t.athenaPage.fleet.request;
  const request = requestFrom(c.clauses);
  const shell = atStage(stage, "shell");
  const sent = atStage(stage, "chosen");
  return (
    <div
      className="absolute flex flex-col gap-3 rounded-2xl border px-5 py-4 backdrop-blur-md transition-[border-color,box-shadow] duration-500"
      style={{
        ...box(rect),
        borderColor: sent ? tint("cyan", 40) : shell ? tint("cyan", 22) : tint("cyan", 10),
        backgroundColor: tint("cyan", sent ? 6 : 3),
        boxShadow: sent ? brandShadow("cyan", 30, 14) : undefined,
      }}
    >
      <p className={`min-h-0 flex-1 leading-[1.45] text-foreground ${compact ? "text-lg" : "text-xl"}`}>
        {clauses === 0 ? (
          <span className="text-muted-dark">{c.placeholder}</span>
        ) : (
          <SentenceText request={request} clauses={clauses} lit={lit} reduced={reduced} />
        )}
        {!sent && (
          <motion.span
            className="ml-0.5 inline-block h-[0.95em] w-[2px] translate-y-[0.1em] rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            animate={reduced ? undefined : { opacity: [1, 0.1, 1] }}
            transition={reduced ? undefined : { duration: 1.05, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
        )}
      </p>
      <span className="flex shrink-0 items-center gap-2.5">
        <Mic className="h-4 w-4 text-brand-cyan" aria-hidden="true" />
        <span className={`normal-case ${ANNOTATION_DIM}`}>{sent ? c.sent : c.voice}</span>
      </span>
    </div>
  );
}
