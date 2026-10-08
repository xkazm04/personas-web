"use client";

import type { CSSProperties } from "react";
import { ATTENTION_COLOR, attentionOf, needsTone } from "../attention";
import { shortState, taskText, type BoardCopy } from "./copy";
import { TEAM_BY_ID, fill, pct, reasonOf, type SimAgent } from "./model";
import b from "./board.module.css";
import s from "./tiles.module.css";

interface FleetRowProps {
  agent: SimAgent;
  copy: BoardCopy;
  selected: boolean;
  /** A command to it is on its way. */
  pending: boolean;
  onToggle: (shift: boolean) => void;
  onOpen: (el: HTMLElement) => void;
  onTeam: (teamName: string) => void;
}

const num = "px-3 text-right tabular-nums";

/** One agent as a table row: who, state, what it is doing now, today's numbers, its last 12 runs. */
export default function FleetRow({ agent: a, copy: c, selected, pending, onToggle, onOpen, onTeam }: FleetRowProps) {
  const pile = attentionOf(a);
  const tone = pile === "needs" ? ATTENTION_COLOR[needsTone(a)] : ATTENTION_COLOR[pile];
  const team = TEAM_BY_ID[a.team];
  const reason = pile === "needs" ? reasonOf(a) : null;
  const now = reason ? `${c.reasons[reason.cls]}${reason.title ? ` · ${reason.title}` : ""}` : taskText(a, c, c.tasks.resting);

  return (
    <tr
      data-row={a.id}
      aria-selected={selected}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button, input")) return;
        onOpen(e.currentTarget);
      }}
      className={`h-11 cursor-pointer border-b border-glass text-sm transition-colors ${selected ? "bg-[color-mix(in_oklab,var(--brand-cyan)_9%,transparent)]" : "hover:bg-foreground/[0.04]"}`}
    >
      <td className="w-10 pl-4">
        <input
          type="checkbox"
          checked={selected}
          aria-label={fill(c.list.selectRow, { callsign: a.callsign })}
          onClick={(e) => { e.stopPropagation(); onToggle(e.shiftKey); }}
          onChange={() => {}}
          className="h-4 w-4 cursor-pointer accent-[var(--brand-cyan)]"
        />
      </td>
      <td className="max-w-0 px-3">
        <button type="button" onClick={(e) => onOpen(e.currentTarget)} className="flex min-w-0 max-w-full items-baseline gap-2 rounded text-left focus-visible:outline-2 focus-visible:outline-foreground">
          <span className={`${b.teamInk} font-mono text-sm font-semibold`} style={{ "--h": a.hue } as CSSProperties}>{a.callsign}</span>
          <span className="truncate text-foreground">{a.name}</span>
        </button>
      </td>
      <td className="max-w-0 truncate px-3">
        <button type="button" onClick={() => onTeam(team.name)} title={fill(c.list.teamFilter, { team: team.name })} className={`${b.teamInk} max-w-full truncate rounded text-sm hover:underline focus-visible:outline-2 focus-visible:outline-foreground`} style={{ "--h": team.hue } as CSSProperties}>
          {team.name}
        </button>
      </td>
      <td className="max-w-0 px-3">
        <span className="flex min-w-0 items-center gap-2 text-foreground">
          <i aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: tone }} />
          <span className="truncate">{shortState(a, c)}</span>
          {!a.enabled && pile !== "off" && <i className={s.pauseMark} aria-hidden />}
          {pending && <i className={`${s.pendingRing} text-brand-cyan`} aria-hidden />}
        </span>
      </td>
      <td className="max-w-0 px-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {a.state === "running" && (
            <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]" aria-label={pct(a.progress ?? 0)} role="img">
              <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: pct(a.progress ?? 0), background: ATTENTION_COLOR.working }} />
            </span>
          )}
          <span className={`truncate ${reason ? "text-foreground" : "text-muted-dark"}`}>{now}</span>
        </div>
      </td>
      <td className={`${num} text-foreground`}>{a.runsToday}</td>
      <td className={`${num} text-foreground`}>{pct(a.successRate)}</td>
      <td className={`${num} text-foreground`}>${a.costTodayUsd.toFixed(2)}</td>
      <td className="px-3 pr-4">
        <span className="flex justify-end gap-[3px]" role="img" aria-label={fill(c.stats.last12Aria, { n: a.recentStatuses.filter((x) => x === "failed").length })}>
          {[...a.recentStatuses].reverse().map((st, i) => (
            <i key={i} className="h-2.5 w-1.5 rounded-sm" style={{ background: st === "failed" ? "var(--status-error)" : "color-mix(in oklab, var(--status-success) 70%, transparent)" }} />
          ))}
        </span>
      </td>
    </tr>
  );
}
