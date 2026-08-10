"use client";

import ConnectorIcon from "@/components/sections/use-cases/components/ConnectorIcon";
import { tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { COPY, HEALTH_BARS } from "../data";
import { AvatarStack, MiniBars, StatePill } from "./primitives";

/**
 * A template card with the anatomy the real dashboard uses: brand glyph tile,
 * name + state pill, what it does, then a signal row (schedule chip, the
 * agents that run it, lifetime run count) over a per-day health strip.
 *
 * The glyph is the genuine product SVG from `public/icons/connectors`, drawn
 * through ConnectorIcon so it flattens to one theme-aware tone.
 */

type Card = typeof COPY.canvas.template | typeof COPY.canvas.templateAlt;

export function TemplateCard({ card, dim }: { card: Card; dim?: boolean }) {
  const Clock = COPY.canvas.triggerIcon;
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
