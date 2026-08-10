"use client";

import { motion } from "framer-motion";
import ConnectorIcon from "@/components/sections/use-cases/components/ConnectorIcon";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { COPY, HEALTH_BARS } from "../data";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { AvatarStack, MiniBars, StatePill } from "./primitives";
import { DrawCheck, Part, Sheen } from "./parts";

/**
 * A template card with the anatomy the real dashboard uses, composed in the
 * order a person would draw it: glyph tile and name as she arrives (body),
 * then the signal row and the per-day health strip as the brackets lock
 * (detail). Nothing about the card ever arrives all at once.
 *
 * Two of these sit side by side as equals until the first choice commits.
 * That beat is choreographed rather than flipped: a check DRAWS itself into
 * the chosen card while an accent sweeps across it, and only a full beat
 * later does the runner-up dim to "not this one".
 */

type Card = typeof COPY.canvas.template | typeof COPY.canvas.templateAlt;

export function TemplateCard({
  card,
  stage,
  dim,
  selected,
  reduced,
}: {
  card: Card;
  stage: ModuleStage;
  dim?: boolean;
  selected?: boolean;
  reduced: boolean;
}) {
  const Clock = COPY.canvas.triggerIcon;
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  const fade = "duration-500 transition-[opacity,color,background-color]";
  return (
    <>
      <Sheen on={!!selected} reduced={reduced} />

      <Part show={body} i={0} reduced={reduced} className="flex min-w-0 shrink-0 items-center gap-2.5">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${fade} ${dim ? "opacity-70" : ""}`}
          style={{ backgroundColor: tint("cyan", dim ? 9 : 15) }}
        >
          <ConnectorIcon src={card.glyph} size={18} />
        </span>
        <span
          className={`truncate text-base font-semibold ${fade} ${dim ? "text-foreground/70" : "text-foreground"}`}
        >
          {card.title}
        </span>
        {selected && (
          <motion.span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-background"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            initial={reduced ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={reduced ? { duration: 0 } : SPRING_POP}
            aria-hidden="true"
          >
            <DrawCheck reduced={reduced} />
          </motion.span>
        )}
        <Part show={detail} lead={0.2} reduced={reduced} className="ml-auto hidden lg:block">
          <StatePill tone="muted" label={card.pill} />
        </Part>
      </Part>

      {/* shrink-0: `truncate` sets overflow:hidden, which lets a tight flex
          column silently collapse this line to zero height */}
      <Part show={body} i={1} reduced={reduced} className="shrink-0 truncate text-base text-muted-dark">
        {card.meta}
      </Part>

      <Part show={detail} i={0} reduced={reduced} className="flex min-w-0 shrink-0 items-center gap-2">
        <span className="flex min-w-0 shrink items-center gap-1.5 rounded-full border border-glass px-2 py-0.5 text-base text-muted-dark">
          <Clock className="h-4 w-4 shrink-0 text-brand-cyan" aria-hidden="true" />
          <span className="truncate">{card.schedule}</span>
        </span>
        <AvatarStack />
        <span className={`ml-auto shrink-0 truncate normal-case ${ANNOTATION_DIM}`}>
          {card.runs}
        </span>
      </Part>

      <Part
        show={detail}
        i={1}
        reduced={reduced}
        className="hidden min-w-0 shrink-0 items-end gap-2 md:flex"
      >
        <MiniBars
          points={HEALTH_BARS}
          className="h-5 flex-1"
          accentLast={!dim}
          reduced={reduced}
          lead={0.18}
        />
        <span className="shrink-0 text-base text-brand-cyan">{card.health}</span>
      </Part>
    </>
  );
}
