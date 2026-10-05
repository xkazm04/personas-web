"use client";

import type { ReactNode } from "react";
import type { AgentState } from "../fleet-data";
import { COMP_ORDER, counts, fill, type ReasonClass, type SimAgent } from "./model";
import type { BoardCopy } from "./copy";
import b from "./board.module.css";

/** A progress (or success-rate) ring with its value in the middle. */
export function Ring({ frac, size, stroke, running, label, valueClass = "text-3xl", className }: {
  frac: number; size: number; stroke: number; running: boolean; label: string; valueClass?: string;
  /** CSS sizing instead of a fixed `size` px box (the SVG scales with it). */
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const col = running ? "var(--st-running)" : "var(--muted-foreground)";
  return (
    <div className={`relative shrink-0 ${className ?? ""}`} style={className ? undefined : { width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} style={{ stroke: "color-mix(in oklab, var(--foreground) 9%, transparent)" }} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={C.toFixed(1)} strokeDashoffset={(C * (1 - frac)).toFixed(1)}
          style={{ stroke: col, filter: `drop-shadow(0 0 6px ${col})`, transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${valueClass} font-bold tabular-nums leading-none text-foreground`}>{Math.round(frac * 100)}%</span>
        <span className="mt-1 text-xs text-muted-dark">{label}</span>
      </div>
    </div>
  );
}

/** The last 12 runs, newest first. */
export function Beads({ agent, copy }: { agent: SimAgent; copy: BoardCopy }) {
  const failed = agent.recentStatuses.filter((x) => x === "failed").length;
  return (
    <div className="mt-2 flex gap-1.5" role="img" aria-label={fill(copy.spot.last12Aria, { n: failed })}>
      {agent.recentStatuses.map((st, i) => (
        <i
          key={i}
          className={`h-3 w-3 rounded-full ${i === 0 ? "outline-2 outline-offset-2 outline-[color-mix(in_oklab,var(--foreground)_50%,transparent)]" : ""}`}
          style={{ background: st === "failed" ? "var(--st-failed)" : "color-mix(in oklab, var(--st-ok) 75%, transparent)" }}
        />
      ))}
    </div>
  );
}

/** Runs per hour, last 24 hours. */
export function Bars({ agent, height = 48 }: { agent: SimAgent; height?: number }) {
  const m = Math.max(1, ...agent.spark24h);
  return (
    <div className="mt-2 flex items-end gap-[3px]" style={{ height }} aria-hidden="true">
      {agent.spark24h.map((v, i) => (
        <i
          key={i}
          className="min-h-[2px] flex-1 rounded-t-sm"
          style={{
            height: `${Math.max(4, (v / m) * 100).toFixed(0)}%`,
            background: "linear-gradient(180deg, color-mix(in oklab, var(--st-running) 85%, transparent), color-mix(in oklab, var(--st-running) 25%, transparent))",
          }}
        />
      ))}
    </div>
  );
}

/** The fleet's composition by state, with a legend. */
export function CompBar({ list, copy }: { list: SimAgent[]; copy: BoardCopy }) {
  const c = counts(list);
  const present = COMP_ORDER.filter((st) => c[st]);
  const op = (st: AgentState) => (st === "idle" ? 0.55 : st === "queued" ? 0.7 : 0.95);
  return (
    <>
      <div className={`${b.compbar} mt-3 flex h-2.5 gap-0.5 overflow-hidden rounded-md`} aria-hidden="true">
        {present.map((st) => (
          <i key={st} style={{ flexGrow: c[st], background: `var(--st-${st})`, opacity: op(st) }} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-muted-dark">
        {present.map((st) => (
          <span key={st} className="inline-flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: `var(--st-${st})` }} />
            {c[st]} {copy.states[st].toLowerCase()}
          </span>
        ))}
      </div>
    </>
  );
}

export function ReasonChip({ cls, label, className = "" }: { cls: ReasonClass; label: string; className?: string }) {
  return <span className={`${b.chip} ${b[`r-${cls}`]} rounded-md px-2 py-1 text-xs leading-none ${className}`}>{label}</span>;
}

export function StatePill({ agent, text }: { agent: SimAgent; text: string }) {
  const key = agent.enabled ? agent.state : "off";
  return (
    <span className={`${b.chip} ${b[`ink-${key}`]} rounded-full border-transparent px-3 py-1 text-sm font-semibold`}>{text}</span>
  );
}

export function Overline({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex items-center gap-2.5 text-xs uppercase tracking-[0.12em] text-muted-dark ${className}`}>{children}</div>;
}
