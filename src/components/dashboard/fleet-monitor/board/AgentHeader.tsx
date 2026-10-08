"use client";

import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Emblem from "./Emblem";
import Controls from "./Controls";
import { StatePill } from "./parts";
import { stateText, type BoardCopy } from "./copy";
import { TEAM_BY_ID, pct, type SimAgent } from "./model";
import type { Command } from "./useCommands";
import type { Operator } from "./operator";
import b from "./board.module.css";

interface AgentHeaderProps {
  agent: SimAgent;
  copy: BoardCopy;
  live: boolean;
  op: Operator;
  pending?: Command;
  hostName: string;
  onStep: (delta: number) => void;
}

const stepBtn = "grid h-8 w-8 place-items-center rounded-lg text-muted-dark shadow-[inset_0_0_0_1px_var(--border-glass)] hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground";

/**
 * The console's top bar: who the agent is (emblem, callsign, name, team,
 * state, health), today's numbers, and its remote controls. Prev/next step
 * through the agents around it (J / K).
 */
export default function AgentHeader({ agent: a, copy: c, live, op, pending, hostName, onStep }: AgentHeaderProps) {
  const team = TEAM_BY_ID[a.team];
  const kpis: [string, string | number][] = [
    [c.stats.runsToday, a.runsToday],
    [c.stats.success, pct(a.successRate)],
    [c.stats.costToday, `$${a.costTodayUsd.toFixed(2)}`],
  ];

  return (
    <header className="flex items-center gap-4 border-b border-glass px-5 py-3">
      <div className={`${b.spotArt} h-16 w-16 shrink-0`} role="img" aria-label={c.agent.emblemCaption}>
        <Emblem agent={a} rich live={live} />
      </div>
      <div className="min-w-0">
        <h2 tabIndex={-1} data-agent-title className="flex min-w-0 items-baseline gap-3 outline-none focus-visible:outline-none!">
          <span className={`${b.teamInk} font-mono text-3xl font-bold leading-none tracking-tight`}>{a.callsign}</span>
          <span className="truncate text-xl font-semibold leading-tight text-foreground">{a.name}</span>
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`${b.teamInk} rounded-full border border-current px-2.5 py-0.5 text-xs`} style={{ "--h": team.hue } as CSSProperties}>{team.name}</span>
          <StatePill agent={a} text={stateText(a, c)} />
          <span className="text-xs text-muted-dark">{c.agent.health}: <span className="text-foreground">{c.health[a.health]}</span></span>
        </div>
      </div>

      <dl aria-label={c.console.kpis} className="ml-auto hidden shrink-0 gap-5 min-[1400px]:flex">
        {kpis.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-muted-dark">{k}</dt>
            <dd className="text-xl font-semibold tabular-nums leading-tight text-foreground">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="ml-auto flex shrink-0 items-start gap-4 border-l border-glass pl-4 min-[1400px]:ml-0">
        <Controls agent={a} copy={c} op={op} pending={pending} hostName={hostName} reserve />
        <div className="flex gap-1.5" title={c.console.stepHint}>
          <button type="button" className={stepBtn} aria-label={c.console.prev} onClick={() => onStep(-1)}>
            <ChevronLeft aria-hidden className="h-4 w-4" />
          </button>
          <button type="button" className={stepBtn} aria-label={c.console.next} onClick={() => onStep(1)}>
            <ChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
