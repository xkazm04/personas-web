"use client";

import { ArrowLeft } from "lucide-react";
import type { CSSProperties } from "react";
import { formatClock } from "../fleet-data";
import { TEAM_BY_ID, fill, type SimAgent } from "./model";
import { simNow, type BoardCopy } from "./copy";
import type { BoardNav } from "./useBoardNav";
import b from "./board.module.css";

interface NavRowProps {
  scope: SimAgent[];
  teamCount: number;
  simMs: number;
  copy: BoardCopy;
  nav: BoardNav;
}

const crumbBtn = "border-b border-dashed border-glass-hover px-0.5 text-muted-dark hover:border-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground";

/** Way back at every level: a Back key, breadcrumbs, and the keyboard hint. */
export default function NavRow({ scope, teamCount, simMs, copy, nav }: NavRowProps) {
  const agent = nav.agentOpen ? scope.find((a) => a.id === nav.agentOpen) : undefined;
  const teamId = agent?.team ?? nav.teamOpen;
  const team = teamId ? TEAM_BY_ID[teamId] : null;
  const backLabel = agent && nav.teamOpen ? fill(copy.nav.backToTeam, { team: TEAM_BY_ID[nav.teamOpen].name }) : copy.nav.backToFleet;

  return (
    <div className="flex h-9 items-center gap-4 text-base">
      {team && (
        <button
          type="button"
          onClick={nav.back}
          aria-label={backLabel}
          className="inline-flex items-center gap-2 rounded-lg border border-glass-hover px-3 py-1 text-sm text-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] focus-visible:outline-2 focus-visible:outline-foreground"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {copy.nav.back}
        </button>
      )}
      <nav aria-label={copy.nav.breadcrumb} className="min-w-0">
        <ol className="flex items-center whitespace-nowrap">
          {!team ? (
            <li className="flex items-baseline gap-3">
              <span className="font-semibold text-foreground">{copy.nav.fleet}</span>
              <span className="text-sm text-muted-dark">{fill(copy.nav.fleetMeta, { agents: scope.length, teams: teamCount })}</span>
            </li>
          ) : (
            <>
              <li>
                <button type="button" className={crumbBtn} onClick={() => { nav.closeAgent(false); nav.closeTeam(true); }}>{copy.nav.fleet}</button>
              </li>
              <li className="flex items-center before:px-3 before:text-muted-dark before:content-['›']">
                {agent ? (
                  <button type="button" className={crumbBtn} onClick={() => (nav.teamOpen === team.id ? nav.closeAgent(true) : nav.openTeam(team.id))}>
                    {team.name}
                  </button>
                ) : (
                  <span aria-current="page" className={`${b.teamInk} font-semibold`} style={{ "--h": team.hue } as CSSProperties}>{team.name}</span>
                )}
              </li>
              {agent && (
                <li aria-current="page" className="flex items-center font-semibold text-foreground before:px-3 before:font-normal before:text-muted-dark before:content-['›']">
                  <span className="mr-2 font-mono text-brand-cyan">{agent.callsign}</span>
                  {agent.name}
                </li>
              )}
            </>
          )}
        </ol>
      </nav>
      <div className="ml-auto flex items-center gap-2 whitespace-nowrap text-xs text-muted-dark">
        <kbd className="rounded border border-glass-hover px-1.5 font-mono">N</kbd> {copy.nav.nextHint}
        <span aria-hidden="true">·</span>
        <kbd className="rounded border border-glass-hover px-1.5 font-mono">Esc</kbd> {copy.nav.escHint}
        <span className="ml-3 font-mono text-sm font-semibold text-foreground" aria-hidden="true">{formatClock(simNow(simMs))} UTC</span>
      </div>
    </div>
  );
}
