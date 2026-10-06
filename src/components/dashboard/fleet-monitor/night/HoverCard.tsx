import type { ReactNode } from "react";
import { needsYou, type FleetAgent, type FleetTeam } from "../fleet-data";
import { hueText, SEVERITY_COLOR, stateColor, textTone } from "./palette";
import { cap, fill, fmtDur, reviewsLine, sevOf, stateWord, unreadLine, type CityCopy } from "./vocab";

export interface Anchor { x: number; y: number; w: number; h: number }

const CARD_W = 300;
const CARD_H = 210;

/**
 * A card floating beside whatever is under attention, overlaying the field
 * and never reserving space in it. Sits right of its anchor when there is
 * room, else left; always inside the field.
 */
export function HoverCard({ anchor, field, children }: { anchor: Anchor; field: { w: number; h: number }; children: ReactNode }) {
  const right = anchor.x + anchor.w + 14;
  const left = right + CARD_W > field.w - 8 ? Math.max(8, anchor.x - 14 - CARD_W) : right;
  const top = Math.max(8, Math.min(field.h - CARD_H - 8, anchor.y + anchor.h / 2 - CARD_H / 2));
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-20 rounded-xl border border-glass-hover p-3.5 shadow-2xl"
      style={{ left, top, width: CARD_W, background: "color-mix(in oklab, var(--background) 92%, transparent)", backdropFilter: "blur(6px)" }}
    >
      {children}
    </div>
  );
}

/** What a hovered agent card says: who, what state, what it is doing, what waits. */
export function AgentCardBody({ copy, a, team, simMs, hint }: { copy: CityCopy; a: FleetAgent; team: string; simMs: number; hint: string }) {
  const sev = sevOf(a);
  return (
    <>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl font-bold" style={{ color: hueText(a.hue) }}>{a.callsign}</span>
        <span className="truncate text-[13px] text-muted-dark">{team}</span>
      </div>
      <div className="truncate text-lg font-semibold text-foreground">{a.name}</div>
      <div className="mt-0.5 text-sm font-semibold" style={{ color: textTone(stateColor(a)) }}>{cap(stateWord(copy, a))}</div>
      {a.task && <div className="mt-1 line-clamp-2 text-base text-muted-dark">{a.task}</div>}
      {a.enabled && a.state === "running" && (
        <>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10">
            <i className="block h-full bg-brand-cyan" style={{ width: `${Math.round((a.progress ?? 0) * 100)}%`, transition: "width .8s" }} />
          </div>
          <div className="mt-1 text-[13px] text-muted-dark">{fill(copy.runningFor, { t: fmtDur(a.runningSinceMs ?? 0), n: a.liveToolCalls })}</div>
        </>
      )}
      {sev && <div className="mt-1 text-[13px]" style={{ color: textTone(SEVERITY_COLOR[sev]) }}>{reviewsLine(copy, a, simMs)}</div>}
      {a.unreadMessages.length > 0 && <div className="mt-0.5 text-[13px]" style={{ color: textTone("var(--ns-wire)") }}>{unreadLine(copy, a)}</div>}
      <div className="mt-2 text-xs text-muted-dark">{hint}</div>
    </>
  );
}

/** A hovered building or department: its name and its mix. */
export function TeamCardBody({ copy, team, members, hint }: { copy: CityCopy; team: FleetTeam; members: FleetAgent[]; hint: string }) {
  const ny = members.filter(needsYou).length;
  const run = members.filter((a) => a.enabled && a.state === "running").length;
  const runs = members.reduce((n, a) => n + a.runsToday, 0);
  return (
    <>
      <div className="text-2xl font-bold tracking-tight" style={{ color: hueText(team.hue) }}>{team.name}</div>
      <div className="mt-1 text-base text-muted-dark">{fill(copy.teamLine, { n: members.length, run, ny, runs })}</div>
      <div className="mt-2 text-xs text-muted-dark">{hint}</div>
    </>
  );
}
