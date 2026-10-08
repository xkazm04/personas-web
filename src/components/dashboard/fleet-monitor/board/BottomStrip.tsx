"use client";

import { FLEET, formatAge } from "../fleet-data";
import { ATTENTION_COLOR } from "../attention";
import { ago, eventText, type BoardCopy } from "./copy";
import { fill, type BoardEvent, type SimAgent } from "./model";
import type { BoardNav } from "./useBoardNav";
import { FLEET_EVENT_ID } from "./sim";

interface BottomStripProps {
  scope: SimAgent[];
  simMs: number;
  events: BoardEvent[];
  copy: BoardCopy;
  nav: BoardNav;
  live: boolean;
  offline: boolean;
}

const KIND_COLOR: Record<BoardEvent["kind"], string> = {
  run_completed: "var(--status-success)", run_failed: ATTENTION_COLOR.critical, review_requested: ATTENTION_COLOR.warning,
  message: "var(--status-info)", handoff: "var(--status-info)", self_heal: "var(--status-success)", decision: "var(--foreground)",
};

/** L0's bottom edge, one line: the newest events, then app-level work. */
export default function BottomStrip({ scope, simMs, events, copy, nav, live, offline }: BottomStripProps) {
  const byId = new Map(scope.map((a) => [a.id, a]));
  const latest = events.filter((e) => byId.has(e.agentId) || e.agentId === FLEET_EVENT_ID).slice(0, 3);

  return (
    <>
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-dark">
        <i className={`h-1.5 w-1.5 rounded-full ${offline ? "shadow-[inset_0_0_0_1.5px_var(--muted-foreground)]" : "bg-[var(--status-success)]"} ${live ? "animate-pulse" : ""}`} aria-hidden="true" />
        {offline ? copy.host.offline : copy.band.live}
      </span>
      <ul className="flex min-w-0 flex-1 items-center gap-5 overflow-hidden" aria-label={copy.band.liveNote}>
        {latest.map((e) => {
          const a = byId.get(e.agentId);
          const callsign = a?.callsign ?? copy.cmd.fleetCallsign;
          return (
            <li key={`${e.tsMs}-${e.agentId}-${e.kind}`} className="min-w-0 shrink last:hidden xl:last:block">
              <button
                type="button"
                className="flex max-w-full items-center gap-2 rounded text-left text-sm text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground"
                aria-label={`${copy.kinds[e.kind]}, ${callsign}: ${eventText(e, copy)}`}
                disabled={!a}
                onClick={(ev) => a && nav.openAgent(a.id, ev.currentTarget)}
              >
                <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: KIND_COLOR[e.kind] }} aria-hidden="true" />
                <b className="shrink-0 font-mono text-xs text-foreground">{callsign}</b>
                <span className="truncate">{eventText(e, copy)}</span>
                <span className="shrink-0 text-xs text-muted-dark">{ago(FLEET.nowMs + simMs - e.tsMs, copy)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <ul className="flex shrink-0 items-center gap-4 border-l border-glass pl-4" aria-label={copy.band.system}>
        {FLEET.systemProcesses.map((p) => {
          const col = p.status === "running" ? ATTENTION_COLOR.working : p.status === "queued" ? ATTENTION_COLOR.resting : "var(--status-success)";
          const status = p.status === "running" ? fill(copy.band.procRunning, { time: formatAge(p.startedAgoMs + simMs) })
            : p.status === "completed" ? fill(copy.band.procDone, { ago: ago(p.startedAgoMs + simMs, copy) }) : copy.band.procQueued;
          return (
            <li key={p.label} className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-dark" title={`${p.label}: ${status}`}>
              <i className={`h-1.5 w-1.5 rounded-full ${p.status === "running" && live ? "animate-pulse" : ""}`} style={{ background: col }} aria-hidden="true" />
              <span className="max-w-40 truncate text-muted">{p.label}</span>
              <span className="sr-only 2xl:not-sr-only">{status}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
