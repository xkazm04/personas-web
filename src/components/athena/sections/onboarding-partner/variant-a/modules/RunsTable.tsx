"use client";

import ConnectorIcon from "@/components/sections/use-cases/components/ConnectorIcon";
import { ANNOTATION_DIM } from "@/components/athena/stage/athena-tokens";
import { COPY } from "../copy";
import type { Rect } from "../layout";
import { atStage, type ModuleStage } from "../stages";
import { Dot, SkeletonRow } from "./primitives";
import { Part } from "./parts";
import { ModuleReveal } from "./shell";

/**
 * Recent-runs table — the right rail's product texture, and the first half of
 * the payoff. It does not exist until the agent does, and when it does it
 * BUILDS: the panel and its title frame up on the commit beat, the column
 * header and the three runs walk in one after another behind it, and the
 * "last 24h" hint plus the continues-past-the-fold skeleton settle a beat
 * later. md+ only; the compact layout drops the rail.
 *
 * Every row arrives whole — glyph, name, status, duration — because a run is
 * one fact. It is the LIST that assembles, not the row.
 */
export function RunsTable({
  rect,
  stage,
  reduced,
}: {
  rect: Rect;
  stage: ModuleStage;
  reduced: boolean;
}) {
  const c = COPY.canvas;
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  return (
    <ModuleReveal
      rect={rect}
      stage={stage}
      reduced={reduced}
      className="hidden flex-col gap-1.5 overflow-hidden rounded-xl border border-glass px-3 py-2.5 md:flex"
    >
      <span className="flex items-baseline gap-2">
        <Part show i={0} reduced={reduced} className="truncate text-base font-semibold text-foreground">
          {c.runsTitle}
        </Part>
        <Part
          show={detail}
          reduced={reduced}
          className="ml-auto hidden shrink-0 text-base text-muted-dark lg:block"
        >
          {c.runsHint}
        </Part>
      </span>

      <Part
        show={body}
        i={1}
        reduced={reduced}
        className={`flex items-center gap-2 border-b border-glass pb-1 ${ANNOTATION_DIM}`}
      >
        <span className="min-w-0 flex-1 truncate">{c.runsCols[0]}</span>
        <span className="hidden w-24 shrink-0 truncate lg:block">{c.runsCols[1]}</span>
        <span className="w-12 shrink-0 truncate text-right">{c.runsCols[2]}</span>
      </Part>

      {c.runsRows.map((row, i) => (
        <Part
          key={row.name}
          show={body}
          i={i}
          lead={0.3}
          reduced={reduced}
          className="flex items-center gap-2"
        >
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
        </Part>
      ))}

      <Part show={detail} lead={0.12} reduced={reduced} className="flex">
        <SkeletonRow widths={[38, 22, 14]} />
      </Part>
    </ModuleReveal>
  );
}
