"use client";

import { useRef, type ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { guideHref, openGuideLink } from "@/lib/guide-link";
import type { PlatformCard } from "./data";
import { COPY_FIXES } from "./VisionGrid.real-nouns.data";
import { useRevealPhase, type Phase } from "./VisionGrid.real-nouns.reveal";

/**
 * One layer card: index + name + catalogue count, the catalogue drawn as a
 * fixed-height art box, then the layer's copy at rest (no hover-only text).
 */
export function LayerCard({
  card,
  index,
  count,
  artLabel,
  children,
}: {
  card: PlatformCard;
  index: number;
  count: string;
  /** Accessible summary of what the art box shows. */
  artLabel: string;
  children: (phase: Phase) => ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const phase = useRevealPhase(ref);
  const color = BRAND_VAR[card.brand];
  const fix = COPY_FIXES[card.id];
  const description = fix?.description ?? card.description;
  const details = card.details.map((d, i) => fix?.details?.[i] ?? d);
  const titleId = `real-nouns-${card.id}`;

  return (
    <article
      ref={ref}
      aria-labelledby={titleId}
      className="relative flex flex-col overflow-hidden rounded-2xl border border-glass bg-white/[0.02] p-4 transition-colors duration-300 hover:border-glass-hover"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${tint(card.brand, 55)}, transparent)` }}
      />

      <header className="flex items-baseline justify-between gap-3">
        <h3 id={titleId} className="flex items-baseline gap-2 text-lg font-bold tracking-tight" style={{ color }}>
          <span className="font-mono text-xs font-medium text-muted-dark tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          {card.title}
        </h3>
        <span
          className="shrink-0 rounded-md border px-2 py-0.5 font-mono text-xs tabular-nums text-foreground/85"
          style={{ borderColor: tint(card.brand, 22), backgroundColor: tint(card.brand, 8) }}
        >
          {count}
        </span>
      </header>

      <div
        role="group"
        aria-label={artLabel}
        className="mt-3 h-[196px] overflow-hidden rounded-xl border border-glass bg-white/[0.015] p-3"
      >
        {children(phase)}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">{description}</p>
      <ul className="mt-3 space-y-1.5">
        {details.map((detail) => (
          <li key={detail} className="flex items-start gap-2 text-[13px] leading-snug text-foreground/75">
            <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            {detail}
          </li>
        ))}
      </ul>

      {card.guideTopics?.map((g) => (
        <button
          key={g.topic}
          type="button"
          onClick={() => openGuideLink(guideHref(g))}
          className="mt-auto inline-flex w-fit cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 pt-4 text-[13px] font-medium transition-opacity hover:opacity-80"
          style={{ color }}
        >
          <BookOpen aria-hidden className="h-3.5 w-3.5" />
          {g.label}
          <span aria-hidden>→</span>
        </button>
      ))}
    </article>
  );
}
