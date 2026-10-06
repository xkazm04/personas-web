"use client";

import { tint } from "@/lib/brand-theme";
import ConnectorIcon from "@/components/sections/use-cases/components/ConnectorIcon";
import { useTranslation } from "@/i18n/useTranslation";
import { SCENE } from "../copy";
import type { Rect } from "../layout";
import { atStage, type ModuleStage } from "@/components/athena/stage/stages";
import { Dot } from "./primitives";
import { Part } from "./parts";
import { ModuleReveal } from "./shell";

/**
 * Recent-runs table — the payoff column's product texture, and the first half
 * of the payoff. It does not exist until the agent does, and when it does it
 * BUILDS: the panel and its title frame up on the commit beat, the three runs
 * walk in one after another behind it, and the "last 24h" hint settles a beat
 * later. The column header of the live version is gone: at one stage high the
 * rows themselves are the table. md+ only; the compact layout drops the rail.
 *
 * The first row is the agent she just helped create, so it wears the brand
 * wash: the new thing in the list, already working.
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
  const { t } = useTranslation();
  const c = t.athenaPage.onboarding.canvas;
  const body = atStage(stage, "body");
  const detail = atStage(stage, "detail");
  return (
    <ModuleReveal
      rect={rect}
      stage={stage}
      reduced={reduced}
      className="hidden flex-col justify-between overflow-hidden rounded-xl border border-glass px-3 py-2.5 md:flex"
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

      {c.runsRows.map((row, i) => (
        <Part
          key={row.name}
          show={body}
          i={i}
          lead={0.3}
          reduced={reduced}
          className={`flex items-center gap-2 ${i === 0 ? "-mx-1.5 rounded-md px-1.5 py-0.5" : ""}`}
          style={i === 0 ? { backgroundColor: tint("cyan", 9) } : undefined}
        >
          <span className="shrink-0">
            <ConnectorIcon src={SCENE.canvas.runsRows[i].glyph} size={16} />
          </span>
          <span className="min-w-0 flex-1 whitespace-nowrap text-base text-foreground/80">{row.name}</span>
          <Dot accent={SCENE.canvas.runsRows[i].ok ? "emerald" : "cyan"} className="h-1.5 w-1.5" />
          <span className="w-12 shrink-0 text-right font-mono text-base text-muted-dark">
            {row.took}
          </span>
        </Part>
      ))}
    </ModuleReveal>
  );
}
