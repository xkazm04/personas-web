"use client";

import type { CSSProperties } from "react";
import { FLEET } from "../fleet-data";
import { Bars, Beads, Overline, Ring } from "./parts";
import { ago, eventText, hm, stateText, taskText, type BoardCopy } from "./copy";
import { formatRunFor, hash, mulberry32, type BoardEvent, type SimAgent } from "./model";
import b from "./board.module.css";

const STEP_KEYS = ["plan", "gather", "tools", "check", "write", "handoff"] as const;

/** The run as six steps with tool-call ticks. Stylised: labelled as such. */
function Trace({ agent: a, copy, live }: { agent: SimAgent; copy: BoardCopy; live: boolean }) {
  const W = 520, n = STEP_KEYS.length, x0 = 34, x1 = W - 34, y = 50;
  const run = a.state === "running";
  const cur = run ? Math.min(n - 1, Math.floor((a.progress ?? 0) * n))
    : a.state === "failed" ? 2 : a.state === "input_required" ? 3 : a.state === "draft_ready" ? 4 : -1;
  const col = `var(--st-${a.state})`;
  const r = mulberry32(hash(a.id));
  const ticks = Array.from({ length: Math.min(60, Math.max(0, a.liveToolCalls)) }, () => {
    const x = x0 + r() * ((x1 - x0) * Math.max(0.05, cur / (n - 1)));
    return { x, y2: y + 18 + r() * 12 };
  });
  const sx = (i: number) => x0 + ((x1 - x0) * i) / (n - 1);
  return (
    <svg viewBox={`0 0 ${W} 96`} className="mt-2 block h-[clamp(52px,13cqh,96px)] w-full" aria-hidden="true">
      <line x1={x0} y1={y} x2={x1} y2={y} strokeWidth="3" strokeLinecap="round" style={{ stroke: "color-mix(in oklab, var(--foreground) 12%, transparent)" }} />
      {cur >= 0 && <line x1={x0} y1={y} x2={sx(cur)} y2={y} strokeWidth="3" strokeLinecap="round" style={{ stroke: col, filter: `drop-shadow(0 0 5px ${col})` }} />}
      {ticks.map((t, i) => <line key={i} x1={t.x} y1={y + 14} x2={t.x} y2={t.y2} style={{ stroke: col }} strokeOpacity=".45" />)}
      {STEP_KEYS.map((k, i) => {
        const done = i < cur, now = i === cur;
        return (
          <g key={k}>
            <circle cx={sx(i)} cy={y} r={now ? 11 : 8} strokeWidth="2.5" style={{ fill: done ? col : "var(--background)", stroke: done || now ? col : "color-mix(in oklab, var(--foreground) 28%, transparent)" }} />
            {now && run && live && (
              <circle cx={sx(i)} cy={y} r="11" fill="none" strokeWidth="2" style={{ stroke: col }}>
                <animate attributeName="r" values="11;22" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values=".9;0" dur="1.8s" repeatCount="indefinite" />
              </circle>
            )}
            {now && a.state === "failed" && <path d={`M${sx(i) - 5} ${y - 5} L${sx(i) + 5} ${y + 5} M${sx(i) + 5} ${y - 5} L${sx(i) - 5} ${y + 5}`} strokeWidth="2.5" style={{ stroke: "var(--foreground)" }} />}
            <text x={sx(i)} y={y - 22} textAnchor="middle" fontSize="16" fontWeight={now ? 600 : 500} style={{ fill: now ? "var(--foreground)" : "var(--muted-dark)" }}>
              {copy.agent.steps[k]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface RunCardProps {
  agent: SimAgent;
  simMs: number;
  events: BoardEvent[];
  copy: BoardCopy;
  live: boolean;
  onAct: (act: "retry" | "answer") => void;
}

/** The middle column of the agent scene: the current run, or how it rests. */
export default function RunCard({ agent: a, simMs, events, copy, live, onAct }: RunCardProps) {
  const run = a.state === "running";
  const traced = run || a.state === "failed" || a.state === "input_required";
  const frac = run ? a.progress ?? 0 : a.successRate;
  const runFor = simMs - (a.startSim ?? 0);
  const facts: [string, string | number][] = run
    ? [[copy.spot.runningFor, formatRunFor(runFor)], [copy.agent.liveToolCalls, a.liveToolCalls],
      [copy.agent.started, `${hm(FLEET.nowMs + simMs - runFor)} UTC`], [copy.agent.health, copy.health[a.health]]]
    : [[copy.agent.state, stateText(a, copy)], [copy.agent.health, copy.health[a.health]],
      [copy.agent.runsToday, a.runsToday], [copy.agent.lastResult, copy.agent.results[a.recentStatuses[0]]]];
  const recent = events.filter((e) => e.agentId === a.id || e.toAgentId === a.id).slice(0, 2);
  const btn = "inline-flex items-center rounded-xl px-4 py-2 text-base font-semibold transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
  const warnBtn = { background: "var(--st-input_required)", color: "color-mix(in oklab, var(--st-input_required) 18%, black)" } as CSSProperties;

  return (
    <div className="flex h-full flex-col rounded-2xl bg-[color-mix(in_oklab,var(--surface)_70%,transparent)] p-4 shadow-[inset_0_0_0_1px_var(--border-glass-strong)]">
      <Overline className="justify-between">
        <span>{run ? copy.agent.currentRun : copy.agent.runStatus}</span>
        {traced && <span className="normal-case tracking-normal">{copy.agent.traceCaption}</span>}
      </Overline>
      <p className="mt-1.5 line-clamp-2 text-[clamp(1.125rem,4.4cqh,1.5rem)] font-semibold leading-tight tracking-tight text-foreground">{taskText(a, copy, copy.tasks.resting)}</p>
      <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-5">
        <Ring frac={frac} size={150} stroke={run ? 12 : 6} running={run} label={run ? copy.spot.progress : copy.agent.successRate} valueClass="text-[clamp(1.5rem,6cqh,2.25rem)]" className="size-[clamp(88px,24cqh,150px)]" />
        <dl className="grid grid-cols-2 gap-x-5 gap-y-2">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-dark">{k}</dt>
              <dd className="text-xl font-semibold tabular-nums text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      {traced ? <Trace agent={a} copy={copy} live={live} /> : (
        <div className="mt-3">
          <Overline>{copy.agent.recentEvents}</Overline>
          {recent.length ? recent.map((e, i) => (
            <div key={i} className="flex gap-3 border-b border-glass py-2 text-base text-muted-dark">
              <span className="w-32 shrink-0 text-xs text-muted">{copy.kinds[e.kind]}</span>
              <span className="truncate">{eventText(e, copy)}</span>
              <span className="ml-auto whitespace-nowrap text-xs">{ago(FLEET.nowMs + simMs - e.tsMs, copy)}</span>
            </div>
          )) : <p className="py-2 text-base text-muted-dark">{copy.agent.nothingLogged}</p>}
        </div>
      )}
      <div className="mt-2 flex min-h-11 flex-wrap items-center gap-3">
        {a.state === "failed" && <><button type="button" data-agent-act className={btn} style={warnBtn} onClick={() => onAct("retry")}>{copy.agent.retry}</button><span className="text-base text-muted-dark">{copy.agent.retryNote}</span></>}
        {a.state === "input_required" && <><button type="button" data-agent-act className={btn} style={warnBtn} onClick={() => onAct("answer")}>{copy.agent.answer}</button><span className="text-base text-muted-dark">{copy.agent.answerNote}</span></>}
        {a.state === "queued" && <span className={`text-base ${b["ink-queued"]}`}>{copy.agent.queuedNote}</span>}
        {a.state === "draft_ready" && <span className={`text-base ${b["ink-draft_ready"]}`}>{copy.agent.draftNote}</span>}
      </div>
      <div className="mt-auto grid grid-cols-[auto_1fr] gap-6 pt-2">
        <div><Overline>{copy.spot.last12}</Overline><Beads agent={a} copy={copy} /></div>
        <div>
          <Overline className="justify-between"><span>{copy.spot.runs24h}</span><span className="tracking-normal">{a.spark24h.reduce((x, v) => x + v, 0)}</span></Overline>
          <Bars agent={a} height={34} />
        </div>
      </div>
    </div>
  );
}
