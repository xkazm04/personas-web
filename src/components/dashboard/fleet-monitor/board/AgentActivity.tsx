"use client";

import { memo, useState } from "react";
import { Check, X } from "lucide-react";
import { FLEET, formatClock } from "../fleet-data";
import { ago, eventText, hm, type BoardCopy } from "./copy";
import { fill, formatRunFor, type BoardEvent, type SimAgent } from "./model";
import { runHistory, runLog, type LogLine } from "./agentLog";
import s from "./tiles.module.css";

type Tab = "log" | "runs" | "events";
const TABS: readonly Tab[] = ["log", "runs", "events"];

interface AgentActivityProps {
  agent: SimAgent;
  simMs: number;
  events: BoardEvent[];
  copy: BoardCopy;
}

const hasRun = (a: SimAgent) => a.state === "running" || a.state === "failed" || a.state === "input_required" || a.state === "draft_ready";

/** The log is rebuilt every tick with the same lines plus new ones: compare
 *  a row by its line's values, so only the new rows render. */
const LogRow = memo(function LogRow({ line, copy: c, phase }: { line: LogLine; copy: BoardCopy; phase: boolean }) {
  const end = line.end;
  const tone = end === "failed" ? "text-[color-mix(in_oklab,var(--status-error)_80%,var(--foreground))]" : end === "paused" ? "text-[color-mix(in_oklab,var(--status-warning)_75%,var(--foreground))]" : "text-foreground";
  return (
    <li className={s.logIn}>
      {phase && (
        <div className="flex items-center gap-2 px-1 pb-1 pt-2.5 text-xs font-semibold uppercase tracking-wider text-muted-dark" aria-hidden>
          {c.agent.steps[line.step]}
          <i className="h-px flex-1 bg-[var(--border-glass-hover)]" />
        </div>
      )}
      <div className="grid grid-cols-[4.4rem_minmax(0,1fr)_auto] items-baseline gap-x-3 px-1 py-[3px] font-mono text-xs">
        <span className="tabular-nums text-muted-dark">{formatClock(line.tsMs)}</span>
        <span className={`truncate ${tone}`}>
          {end === "failed" ? "✕ " : end === "paused" ? "? " : ""}
          {line.tool}
          {end ? <span> {end === "failed" ? c.console.logFailed : c.console.logPaused}</span> : <span className="text-muted-dark"> · {line.detail}</span>}
        </span>
        <span className="text-right tabular-nums text-muted-dark">{end ? "" : `${line.latencyMs} ms`}</span>
      </div>
    </li>
  );
}, (p, n) =>
  p.phase === n.phase && p.copy === n.copy && p.line.key === n.line.key && p.line.tsMs === n.line.tsMs && p.line.tool === n.line.tool &&
  p.line.detail === n.line.detail && p.line.latencyMs === n.line.latencyMs && p.line.end === n.line.end && p.line.step === n.line.step,
);

/**
 * The console's middle column: what the agent is doing, as a live log of its
 * tool calls (stylised, newest at the bottom like a terminal), its last 12
 * runs, and the events that touched it.
 */
export default function AgentActivity({ agent: a, simMs, events, copy: c }: AgentActivityProps) {
  const initial: Tab = hasRun(a) ? "log" : "runs";
  const [tab, setTab] = useState<Tab>(initial);
  // A different agent opens on its own most useful tab.
  const [prevId, setPrevId] = useState(a.id);
  if (prevId !== a.id) {
    setPrevId(a.id);
    setTab(initial);
  }
  const log = tab === "log" ? runLog(a, simMs) : [];
  const runs = tab === "runs" ? runHistory(a, simMs) : [];
  const mine = tab === "events" ? events.filter((e) => e.agentId === a.id || e.toAgentId === a.id).slice(0, 30) : [];
  const move = (d: number) => {
    const next = TABS[(TABS.indexOf(tab) + d + TABS.length) % TABS.length];
    setTab(next);
    document.getElementById(`act-tab-${next}`)?.focus();
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl bg-[color-mix(in_oklab,var(--surface)_70%,transparent)] shadow-[inset_0_0_0_1px_var(--border-glass-strong)]">
      <div className="flex items-center justify-between gap-3 border-b border-glass px-3 pt-2">
        <div role="tablist" aria-label={c.console.tabsLabel} className="flex gap-1" onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
        }}>
          {TABS.map((t) => (
            <button
              key={t}
              id={`act-tab-${t}`}
              type="button"
              role="tab"
              aria-selected={tab === t}
              aria-controls="act-panel"
              tabIndex={tab === t ? 0 : -1}
              onClick={() => setTab(t)}
              className={`-mb-px whitespace-nowrap border-b-2 px-2.5 pb-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-cyan ${tab === t ? "border-brand-cyan text-foreground" : "border-transparent text-muted-dark hover:text-foreground"}`}
            >
              {c.console.tabs[t]}
            </button>
          ))}
        </div>
        <span className="hidden truncate pb-2 text-xs text-muted-dark min-[1500px]:inline">{tab === "log" ? c.console.logCaption : tab === "runs" ? c.console.runsCaption : ""}</span>
      </div>

      <div id="act-panel" role="tabpanel" aria-labelledby={`act-tab-${tab}`} className="min-h-0 flex-1 px-2 py-2">
        {tab === "log" && (log.length ? (
          <ol aria-label={c.console.logLabel} className="flex h-full flex-col-reverse overflow-y-auto">
            {log.map((l, i) => <LogRow key={l.key} line={l} copy={c} phase={i === 0 || log[i - 1].step !== l.step} />).reverse()}
          </ol>
        ) : <p className="p-2 text-base text-muted-dark">{c.console.logEmpty}</p>)}

        {tab === "runs" && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-dark">
                <th className="px-1.5 pb-1.5 font-medium">{c.console.cols.result}</th>
                <th className="px-1.5 pb-1.5 font-medium">{c.console.cols.ended}</th>
                <th className="px-1.5 pb-1.5 text-right font-medium">{c.console.cols.duration}</th>
                <th className="px-1.5 pb-1.5 text-right font-medium">{c.console.cols.cost}</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.key} className="border-t border-glass">
                  <td className="px-1.5 py-1.5">
                    <span className={`inline-flex items-center gap-1.5 font-medium ${r.result === "failed" ? "text-[color-mix(in_oklab,var(--status-error)_80%,var(--foreground))]" : "text-foreground"}`}>
                      {r.result === "failed" ? <X aria-hidden className="h-3.5 w-3.5" /> : <Check aria-hidden className="h-3.5 w-3.5 text-[var(--status-success)]" />}
                      {c.agent.results[r.result]}
                    </span>
                  </td>
                  <td className="px-1.5 py-1.5 tabular-nums text-muted-dark">{hm(r.endedMs)} · {ago(FLEET.nowMs + simMs - r.endedMs, c)}</td>
                  <td className="px-1.5 py-1.5 text-right tabular-nums text-foreground">{formatRunFor(r.durationMs)}</td>
                  <td className="px-1.5 py-1.5 text-right tabular-nums text-foreground">${r.costUsd.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "events" && (mine.length ? (
          <ul className="h-full overflow-y-auto">
            {mine.map((e, i) => (
              <li key={`${e.tsMs}-${i}`} className="flex gap-3 border-b border-glass px-1.5 py-2 text-sm text-muted-dark">
                <span className="w-28 shrink-0 text-xs text-muted">{c.kinds[e.kind]}</span>
                <span className="min-w-0 flex-1 truncate text-foreground">{eventText(e, c)}</span>
                <span className="whitespace-nowrap text-xs">{ago(FLEET.nowMs + simMs - e.tsMs, c)}</span>
              </li>
            ))}
          </ul>
        ) : <p className="p-2 text-base text-muted-dark">{c.console.eventsEmpty}</p>)}
      </div>
    </div>
  );
}

/** "Completed · took 6m 12s · $0.07 · 4m ago": the last run in one line. */
export function lastRunLine(a: SimAgent, simMs: number, c: BoardCopy): string | null {
  const r = runHistory(a, simMs)[0];
  if (!r) return null;
  return fill(c.console.lastRunLine, { result: c.agent.results[r.result], duration: formatRunFor(r.durationMs), cost: `$${r.costUsd.toFixed(2)}`, ago: ago(FLEET.nowMs + simMs - r.endedMs, c) });
}
