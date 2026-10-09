import type { ReactNode } from "react";
import { needsYou, type FleetAgent, type FleetTeam } from "../fleet-data";
import { hueText } from "./palette";
import { fill, type CityCopy } from "./vocab";

export interface Anchor { x: number; y: number; w: number; h: number }

const CARD_W = 300;
const CARD_H = 210;

/**
 * A building's card floating beside it (a window gets the Board's agent card), overlaying the field
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
