"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import { FLEET, formatClock } from "../fleet-data";
import { ago, eventText, type BoardCopy } from "./copy";
import { fill, type BoardEvent, type BoardEventKind, type SimAgent } from "./model";
import { FLEET_EVENT_ID } from "./sim";
import { KIND_COLOR } from "./BottomStrip";
import type { Command } from "./useCommands";

export type ActivityFilter = "all" | "attention" | "decisions" | "messages" | "runs" | "commands";
const FILTERS: readonly ActivityFilter[] = ["all", "attention", "decisions", "messages", "runs", "commands"];
const KINDS: Record<Exclude<ActivityFilter, "all" | "commands">, readonly BoardEventKind[]> = {
  attention: ["run_failed", "review_requested"],
  decisions: ["decision"],
  messages: ["message", "handoff"],
  runs: ["run_completed", "self_heal"],
};

/** The events a filter shows (newest first, capped). */
export function filterEvents(events: readonly BoardEvent[], f: ActivityFilter, max = 200): BoardEvent[] {
  if (f === "commands") return [];
  const kinds = f === "all" ? null : KINDS[f];
  return events.filter((e) => !kinds || kinds.includes(e.kind)).slice(0, max);
}

interface ActivityDrawerProps {
  events: BoardEvent[];
  scope: SimAgent[];
  cmds: readonly Command[];
  simMs: number;
  copy: BoardCopy;
  hostName: string;
  still: boolean;
  onClose: () => void;
  onOpenAgent: (id: string) => void;
}

const STATUS_TONE: Record<Command["status"], string> = {
  held: "var(--status-warning)", sending: "var(--brand-cyan)", acked: "var(--brand-cyan)", done: "var(--status-success)", refused: "var(--status-error)", undone: "var(--muted-foreground)",
};

/**
 * The bottom strip, opened up: the whole log with filters, and the audit
 * trail of every command sent to the machine this session with where it is.
 */
export default function ActivityDrawer({ events, scope, cmds, simMs, copy: c, hostName, still, onClose, onOpenAgent }: ActivityDrawerProps) {
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const byId = new Map(scope.map((a) => [a.id, a]));
  const list = filterEvents(events, filter).filter((e) => byId.has(e.agentId) || e.agentId === FLEET_EVENT_ID);
  const now = FLEET.nowMs + simMs;
  const who = (id: string | null) => (id ? byId.get(id)?.callsign ?? id : c.cmd.fleetCallsign);

  return (
    <motion.section
      aria-label={c.activity.label}
      className="absolute inset-x-0 bottom-0 z-[25] flex h-[48%] min-h-[260px] flex-col rounded-t-2xl bg-surface shadow-[inset_0_1px_0_var(--border-glass-strong),0_-20px_60px_rgb(0_0_0/0.3)]"
      initial={{ opacity: 0, y: still ? 0 : 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: still ? 0 : 28 }}
      transition={{ duration: still ? 0.15 : 0.3, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <header className="flex items-center gap-4 border-b border-glass px-4 py-2">
        <h2 className="text-sm font-semibold text-foreground">{c.activity.label}</h2>
        <div role="radiogroup" aria-label={c.activity.filtersLabel} className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button key={f} type="button" role="radio" aria-checked={filter === f} onClick={() => setFilter(f)}
              className={`rounded-full px-2.5 py-0.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-foreground ${filter === f ? "bg-foreground/10 text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)]" : "text-muted-dark hover:text-foreground"}`}>
              {c.activity.filters[f]}{f === "commands" && cmds.length > 0 ? ` · ${cmds.length}` : ""}
            </button>
          ))}
        </div>
        {filter === "commands" && <span className="hidden text-xs text-muted-dark xl:inline">{fill(c.activity.commandsNote, { host: hostName })}</span>}
        <button type="button" onClick={onClose} aria-label={c.activity.close} title={c.activity.close} className="ml-auto grid h-7 w-7 place-items-center rounded-md text-muted-dark hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground">
          <X aria-hidden className="h-4 w-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1">
        {filter === "commands" ? (cmds.length ? (
          <ol>
            {cmds.map((cmd) => (
              <li key={cmd.id} className="grid grid-cols-[5rem_10rem_6rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-glass px-2 py-1.5 text-sm">
                <span className="font-mono text-xs tabular-nums text-muted-dark">{cmd.atSim != null ? formatClock(FLEET.nowMs + cmd.atSim) : ""}</span>
                <span className="truncate text-foreground">{c.cmd.doing[cmd.verb]}</span>
                <span className="truncate font-mono text-xs font-semibold text-foreground">{cmd.agentId ? who(cmd.agentId) : c.activity.fleetTarget}</span>
                <span className="truncate text-muted-dark">{cmd.reason ? fill(c.cmd.refusals[cmd.reason], { host: hostName }) : cmd.text ? `“${cmd.text}”` : ""}</span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs" style={{ color: `color-mix(in oklab, ${STATUS_TONE[cmd.status]} 80%, var(--foreground))` }}>
                  <i aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_TONE[cmd.status] }} />
                  {c.activity.cmdStatus[cmd.status]}
                </span>
              </li>
            ))}
          </ol>
        ) : <p className="p-3 text-sm text-muted-dark">{fill(c.activity.commandsEmpty, { host: hostName })}</p>) : list.length ? (
          <ol>
            {list.map((e, i) => {
              const a = byId.get(e.agentId);
              return (
                <li key={`${e.tsMs}-${e.agentId}-${i}`} className="grid grid-cols-[5rem_8.5rem_4.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-glass px-2 py-1.5 text-sm">
                  <span className="font-mono text-xs tabular-nums text-muted-dark">{formatClock(e.tsMs)}</span>
                  <span className="flex min-w-0 items-center gap-2 text-xs text-muted">
                    <i aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: KIND_COLOR[e.kind] }} />
                    <span className="truncate">{c.kinds[e.kind]}</span>
                  </span>
                  {a ? (
                    <button type="button" onClick={() => onOpenAgent(a.id)} className="truncate rounded text-left font-mono text-xs font-semibold text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-foreground">{a.callsign}</button>
                  ) : <span className="font-mono text-xs font-semibold text-foreground">{c.cmd.fleetCallsign}</span>}
                  <span className="truncate text-foreground">{eventText(e, c)}</span>
                  <span className="whitespace-nowrap text-xs text-muted-dark">{ago(now - e.tsMs, c)}</span>
                </li>
              );
            })}
          </ol>
        ) : <p className="p-3 text-sm text-muted-dark">{c.activity.empty}</p>}
      </div>
    </motion.section>
  );
}
