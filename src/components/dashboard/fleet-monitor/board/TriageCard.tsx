"use client";

import type { CSSProperties } from "react";
import { formatAge, formatClock } from "../fleet-data";
import Emblem from "./Emblem";
import AnswerBox from "./AnswerBox";
import { ReasonChip } from "./parts";
import { taskText, type BoardCopy } from "./copy";
import { TEAM_BY_ID, fill, needAgeMs, plural, reasonOf, type BoardEvent, type SimAgent } from "./model";
import { runLog } from "./agentLog";
import { itemReview, type TriageItem } from "./triage";
import { ctlBtn } from "./Controls";
import type { Operator } from "./operator";
import b from "./board.module.css";

export interface TriageAction {
  /** The key that runs it (lower case). */
  key: string;
  label: string;
  tone?: "primary" | "warn";
  run: () => void;
}

/** The decisions one triage item offers, shared by its buttons and its keys. */
export function triageActions(item: TriageItem, a: SimAgent, op: Operator, c: BoardCopy, done: () => void): TriageAction[] {
  const act = (fn: () => void) => () => {
    if (op.offline) return;
    fn();
    done();
  };
  if (item.kind === "failed") return [
    { key: "r", label: c.triage.retry, tone: "warn", run: act(() => op.retry(a)) },
    ...(a.enabled ? [{ key: "p", label: c.triage.pauseAgent, run: act(() => op.pause(a)) }] : []),
  ];
  if (item.kind === "draft") return [
    { key: "a", label: c.triage.publish, tone: "primary", run: act(() => op.draft(a, true)) },
    { key: "b", label: c.triage.revise, run: act(() => op.draft(a, false)) },
  ];
  if (item.kind === "review" && item.rid) {
    const rid = item.rid;
    return [
      { key: "a", label: c.triage.approve, tone: "primary", run: act(() => op.verdict(a, rid, true)) },
      { key: "b", label: c.triage.sendBack, run: act(() => op.verdict(a, rid, false)) },
    ];
  }
  return [];
}

const toneStyle: Record<NonNullable<TriageAction["tone"]>, CSSProperties> = {
  primary: { background: "var(--brand-cyan)", color: "var(--background)" },
  warn: { background: "var(--st-input_required)", color: "color-mix(in oklab, var(--st-input_required) 18%, black)" },
};

interface TriageCardProps {
  agent: SimAgent;
  item: TriageItem;
  /** Other decisions waiting on the same agent. */
  more: number;
  simMs: number;
  events: BoardEvent[];
  copy: BoardCopy;
  op: Operator;
  actions: TriageAction[];
  onAnswered: () => void;
}

/** One decision, with everything needed to make it and nothing else. */
export default function TriageCard({ agent: a, item, more, simMs, events, copy: c, op, actions, onAnswered }: TriageCardProps) {
  const team = TEAM_BY_ID[a.team];
  const review = itemReview(a, item);
  const age = review ? (review.ageMin + simMs / 60_000) * 60_000 : needAgeMs(a, simMs, events);
  const cls = item.kind === "review" && review ? review.severity : item.kind === "failed" ? "failed" : item.kind === "input" ? "input_required" : "draft_ready";
  const tail = item.kind === "failed" ? runLog(a, simMs).slice(-4) : [];

  return (
    <article aria-label={`${c.triage.kinds[item.kind]}: ${a.callsign} ${a.name}`} className="rounded-3xl bg-[color-mix(in_oklab,var(--surface)_80%,transparent)] p-6 shadow-[inset_0_0_0_1px_var(--border-glass-strong)]" style={{ "--h": a.hue } as CSSProperties}>
      <header className="flex items-center gap-4">
        <span className="h-14 w-14 shrink-0" aria-hidden><Emblem agent={a} rich /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2.5">
            <span className={`${b.teamInk} font-mono text-2xl font-bold leading-none`}>{a.callsign}</span>
            <span className="truncate text-lg font-semibold text-foreground">{a.name}</span>
          </div>
          <div className="mt-1 text-sm text-muted-dark">{team.name}{age != null && <> · {fill(c.triage.since, { age: formatAge(age) })}</>}</div>
        </div>
        <ReasonChip cls={cls} label={item.kind === "review" && review ? c.severity[review.severity] : c.triage.kinds[item.kind]} />
      </header>

      <div className="mt-6">
        {item.kind === "input" && (
          <AnswerBox agent={a} copy={c} question={reasonOf(a).title} disabled={op.offline} large onSend={(text) => { op.answer(a, text); onAnswered(); }} />
        )}
        {item.kind === "review" && review && (
          <>
            <p className="text-2xl font-semibold leading-snug text-foreground">{review.title}</p>
            <p className="mt-2 text-base text-muted-dark">{c.triage.reviewNote}</p>
          </>
        )}
        {item.kind === "draft" && (
          <>
            <p className="text-2xl font-semibold leading-snug text-foreground">{taskText(a, c, c.tasks.draftFallback)}</p>
            <p className="mt-2 text-base text-muted-dark">{c.triage.draftNote}</p>
          </>
        )}
        {item.kind === "failed" && (
          <>
            <p className="text-2xl font-semibold leading-snug text-foreground">{taskText(a, c)}</p>
            <div className="mt-4 text-xs uppercase tracking-[0.12em] text-muted-dark">{c.triage.failedLog}</div>
            <ol className="mt-1.5 rounded-xl bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] px-3 py-2 font-mono text-xs">
              {tail.map((l) => (
                <li key={l.key} className={`flex gap-3 py-0.5 ${l.end ? "text-[color-mix(in_oklab,var(--status-error)_80%,var(--foreground))]" : "text-muted-dark"}`}>
                  <span className="tabular-nums">{formatClock(l.tsMs)}</span>
                  <span className="truncate">{l.end ? `✕ ${l.tool} ${c.console.logFailed}` : `${l.tool} · ${l.detail}`}</span>
                </li>
              ))}
            </ol>
            <p className="mt-2 text-base text-muted-dark">{c.agent.retryNote}</p>
          </>
        )}
      </div>

      {actions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {actions.map((x, i) => (
            <button key={x.key} type="button" data-triage-act={i === 0 || undefined} disabled={op.offline} onClick={x.run} className={`${ctlBtn} h-10 px-4 text-base ${x.tone ? "" : "text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)]"}`} style={x.tone ? toneStyle[x.tone] : undefined}>
              {x.label}
              <kbd className="rounded border border-current/30 px-1.5 font-mono text-xs opacity-80">{x.key.toUpperCase()}</kbd>
            </button>
          ))}
        </div>
      )}
      {more > 0 && <p className="mt-4 text-sm text-muted-dark">{fill(plural(more, c.triage.agentNoteOne, c.triage.agentNote), { n: more })}</p>}
    </article>
  );
}
