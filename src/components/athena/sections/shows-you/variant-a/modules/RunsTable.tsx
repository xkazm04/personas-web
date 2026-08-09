"use client";

import ConnectorIcon from "@/components/sections/use-cases/components/ConnectorIcon";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { COPY } from "../copy";
import type { Rect } from "../layout";
import { Dot, SkeletonRow, rectStyle } from "./primitives";

/**
 * Recent-runs table — the right rail's product texture: a titled panel, a
 * real column header, rows keyed by the tool that ran (genuine brand glyph),
 * a status dot, a duration, and a skeleton row so the list obviously
 * continues past the fold. md+ only; the compact layout drops the rail.
 */
export function RunsTable({ rect }: { rect: Rect }) {
  const c = COPY.canvas;
  return (
    <div
      className="absolute hidden flex-col gap-1.5 overflow-hidden rounded-xl border border-glass px-3 py-2.5 md:flex"
      style={rectStyle(rect)}
    >
      <span className="flex items-baseline gap-2">
        <span className="truncate text-base font-semibold text-foreground">{c.runsTitle}</span>
        <span className="ml-auto hidden shrink-0 text-base text-muted-dark lg:block">
          {c.runsHint}
        </span>
      </span>

      <span className={`flex items-center gap-2 border-b border-glass pb-1 ${ANNOTATION_DIM}`}>
        <span className="min-w-0 flex-1 truncate">{c.runsCols[0]}</span>
        <span className="hidden w-24 shrink-0 truncate lg:block">{c.runsCols[1]}</span>
        <span className="w-12 shrink-0 truncate text-right">{c.runsCols[2]}</span>
      </span>

      {c.runsRows.map((row) => (
        <span key={row.name} className="flex items-center gap-2">
          <span className="shrink-0">
            <ConnectorIcon src={row.glyph} size={16} />
          </span>
          <span className="min-w-0 flex-1 truncate text-base text-foreground/80">{row.name}</span>
          <span className="hidden w-24 shrink-0 items-center gap-1.5 text-base text-muted-dark lg:flex">
            <Dot accent={row.state === "ok" ? "emerald" : "cyan"} className="h-1.5 w-1.5" />
            <span className="truncate">{row.state}</span>
          </span>
          <span className="w-12 shrink-0 text-right font-mono text-base text-muted-dark">
            {row.took}
          </span>
        </span>
      ))}

      <SkeletonRow widths={[38, 22, 14]} />
    </div>
  );
}
