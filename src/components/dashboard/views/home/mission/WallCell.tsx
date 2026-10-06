"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { fill, type DimensionView } from "./dimensions";
import { Lamp, VERDICT_TONE } from "./Lamp";
import { LIT_VERDICTS } from "./readings";

/**
 * One dimension on the wall: label and question, a status lamp and word, one
 * big figure, a trace, and one line of evidence. A cell that needs attention
 * is lit with its verdict's colour; a steady one stays quiet ink.
 */
export function WallCell({ dim, onOpen }: { dim: DimensionView; onOpen: () => void }) {
  const { t } = useTranslation();
  const tone = VERDICT_TONE[dim.verdict];
  const lit = LIT_VERDICTS.has(dim.verdict);

  return (
    <button
      type="button"
      onClick={onOpen}
      title={fill(t.dashboard.home.mission.openDimension, { label: dim.label })}
      data-mission-dim={dim.id}
      className={`group flex min-h-[17rem] w-full flex-col rounded-2xl border border-glass p-5 text-left transition-colors hover:border-glass-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan ${
        lit ? tone.lit : "bg-white/[0.02]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground">{dim.label}</h3>
          <p className="mt-0.5 text-sm text-muted-dark">{dim.question}</p>
        </div>
        <kbd className="flex-none rounded-md border border-glass px-1.5 py-0.5 font-mono text-xs text-muted-dark">
          {dim.key}
        </kbd>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Lamp verdict={dim.verdict} />
        <span className={`text-xs font-semibold uppercase tracking-[0.16em] ${tone.text}`}>{dim.state}</span>
      </div>

      <p className={`mt-2 text-4xl font-semibold tabular-nums tracking-tight ${lit ? "text-foreground" : "text-foreground/85"}`}>
        {dim.figure}
      </p>

      <div className="mt-auto pt-4">
        {dim.trace && <Trace values={dim.trace.values} max={dim.trace.max} toneClass={lit ? tone.text : "text-muted-dark"} />}
        <p className="mt-3 line-clamp-2 text-sm text-muted">{dim.evidence}</p>
      </div>
    </button>
  );
}

/** A row of bars, one per value, scaled to `max`. Decorative: the figure and evidence carry the reading. */
export function Trace({ values, max, toneClass }: { values: number[]; max: number; toneClass: string }) {
  if (values.length === 0) return null;
  const gap = 2;
  const width = 100;
  const barWidth = (width - gap * (values.length - 1)) / values.length;
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} 40`}
      preserveAspectRatio="none"
      className={`h-14 w-full ${toneClass}`}
    >
      {values.map((value, i) => {
        const height = Math.max(1.5, (Math.min(value, max) / max) * 40);
        return (
          <rect
            key={i}
            x={i * (barWidth + gap)}
            y={40 - height}
            width={barWidth}
            height={height}
            rx={0.8}
            className="fill-current"
            opacity={0.35 + 0.55 * (value / max)}
          />
        );
      })}
    </svg>
  );
}
