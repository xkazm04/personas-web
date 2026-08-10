"use client";

import { motion } from "framer-motion";
import ConnectorIcon from "@/components/sections/use-cases/components/ConnectorIcon";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { COPY, HEALTH_BARS } from "../data";
import { AvatarStack, MiniBars, StatePill } from "./primitives";

/**
 * A template card with the anatomy the real dashboard uses: brand glyph tile,
 * name + state pill, what it does, then a signal row (schedule chip, the
 * agents that run it, lifetime run count) over a per-day health strip.
 *
 * Two of these sit side by side as equals until the first choice commits —
 * then the chosen one takes a check and the other dims to "not this one".
 * That contrast IS the choice; without it the pair is just decoration.
 *
 * The glyph is the genuine product SVG from `public/icons/connectors`, drawn
 * through ConnectorIcon so it flattens to one theme-aware tone.
 */

type Card = typeof COPY.canvas.template | typeof COPY.canvas.templateAlt;

export function TemplateCard({
  card,
  dim,
  selected,
  reduced,
}: {
  card: Card;
  dim?: boolean;
  selected?: boolean;
  reduced?: boolean;
}) {
  const Clock = COPY.canvas.triggerIcon;
  const CheckMark = COPY.canvas.chosenIcon;
  return (
    <>
      <span className="flex min-w-0 shrink-0 items-center gap-2.5">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${dim ? "opacity-70" : ""}`}
          style={{ backgroundColor: tint("cyan", dim ? 9 : 15) }}
        >
          <ConnectorIcon src={card.glyph} size={18} />
        </span>
        <span
          className={`truncate text-base font-semibold ${dim ? "text-foreground/70" : "text-foreground"}`}
        >
          {card.title}
        </span>
        {selected && (
          <motion.span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: BRAND_VAR.cyan }}
            initial={reduced ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={reduced ? { duration: 0 } : SPRING_POP}
            aria-hidden="true"
          >
            <CheckMark className="h-3.5 w-3.5 text-background" />
          </motion.span>
        )}
        <span className="ml-auto hidden lg:block">
          <StatePill tone="muted" label={card.pill} />
        </span>
      </span>

      {/* shrink-0: `truncate` sets overflow:hidden, which lets a tight flex
          column silently collapse this line to zero height */}
      <span className="shrink-0 truncate text-base text-muted-dark">{card.meta}</span>

      <span className="flex min-w-0 shrink-0 items-center gap-2">
        <span className="flex min-w-0 shrink items-center gap-1.5 rounded-full border border-glass px-2 py-0.5 text-base text-muted-dark">
          <Clock className="h-4 w-4 shrink-0 text-brand-cyan" aria-hidden="true" />
          <span className="truncate">{card.schedule}</span>
        </span>
        <AvatarStack />
        <span className={`ml-auto shrink-0 truncate normal-case ${ANNOTATION_DIM}`}>
          {card.runs}
        </span>
      </span>

      <span className="hidden min-w-0 shrink-0 items-end gap-2 md:flex">
        <MiniBars points={HEALTH_BARS} className="h-5 flex-1" accentLast={!dim} />
        <span className="shrink-0 text-base text-brand-cyan">{card.health}</span>
      </span>
    </>
  );
}
