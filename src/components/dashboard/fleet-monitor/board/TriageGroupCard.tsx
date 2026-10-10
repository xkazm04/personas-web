"use client";

import type { CSSProperties } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Severity } from "../fleet-data";
import { ATTENTION_COLOR, needsTone } from "../attention";
import { ReasonChip } from "./parts";
import { taskText, type BoardCopy } from "./copy";
import { fill, plural, type SimAgent } from "./model";
import type { TriageAction } from "./TriageCard";
import { groupPredicate, groupRetry, groupVerdicts, type TriageGroup } from "./triageGroups";
import { ctlBtn } from "./Controls";
import type { Operator } from "./operator";
import s from "./tiles.module.css";

/** The group with only its ticked members. */
export function included(g: TriageGroup, excluded: ReadonlySet<string>): TriageGroup {
  return { ...g, members: g.members.filter((m) => !excluded.has(m.key)) };
}

/**
 * The judgments a group offers, shared by its buttons and its keys: Approve
 * all only when the ticked members earn it (no critical one), Send back all
 * always, Retry for the members the rulebook admits, and W to walk the group
 * one at a time. `done` gets the keys a judgment decided.
 */
export function groupActions(
  g: TriageGroup,
  scope: readonly SimAgent[],
  op: Operator,
  c: BoardCopy,
  excluded: ReadonlySet<string>,
  done: (keys: string[]) => void,
  walk: () => void,
): TriageAction[] {
  const inc = included(g, excluded);
  const n = inc.members.length;
  const keys = inc.members.map((m) => m.key);
  const out: TriageAction[] = [];
  if (n && (g.kind === "review" || g.kind === "draft")) {
    const draft = g.kind === "draft";
    const verdicts = groupVerdicts(inc);
    if (verdicts.includes("approve")) {
      out.push({ key: "a", label: fill(draft ? c.triage.publishAll : c.triage.approveAll, { n }), tone: "primary", run: () => { if (op.verdictBatch(inc, true, scope)) done(keys); } });
    }
    if (verdicts.includes("sendback")) {
      out.push({ key: "b", label: fill(draft ? c.triage.reviseAll : c.triage.sendBackAll, { n }), run: () => { if (op.verdictBatch(inc, false, scope)) done(keys); } });
    }
  }
  if (n && g.kind === "failed") {
    const r = groupRetry(inc, scope);
    if (r.n) out.push({ key: "r", label: fill(c.triage.retryAll, { n: r.n }), tone: "warn", run: () => { const sent = op.retryBatch(inc, scope); if (sent.length) done(sent); } });
  }
  if (g.members.length > 1) out.push({ key: "w", label: c.triage.walk, run: walk });
  return out;
}

const toneStyle: Record<NonNullable<TriageAction["tone"]>, CSSProperties> = {
  primary: { background: "var(--brand-cyan)", color: "var(--background)" },
  warn: { background: "var(--st-input_required)", color: "color-mix(in oklab, var(--st-input_required) 18%, black)" },
};

interface TriageGroupCardProps {
  group: TriageGroup;
  scope: readonly SimAgent[];
  copy: BoardCopy;
  op: Operator;
  actions: TriageAction[];
  excluded: ReadonlySet<string>;
  onToggle: (key: string) => void;
  onConsole: (agentId: string) => void;
}

/** One question asked by several agents: the predicate, its members, one judgment. */
export default function TriageGroupCard({ group: g, scope, copy: c, op, actions, excluded, onToggle, onConsole }: TriageGroupCardProps) {
  const byId = new Map(scope.map((a) => [a.id, a]));
  const { n, severities } = groupPredicate(g);
  const inc = included(g, excluded);
  const first = byId.get(g.members[0].agentId);
  const top = (["critical", "warning", "info"] as const).find((s) => severities[s]);
  const headline =
    g.kind === "review" ? fill(c.triage.groupAsks, { n, title: g.title ?? "" })
    : g.kind === "failed" ? fill(c.triage.groupFailed, { n, task: first ? taskText(first, c) : "" })
    : fill(c.triage.groupDrafts, { n });
  const mix = (Object.entries(severities) as [Severity, number][]).map(([s, k]) => `${k} ${c.severity[s].toLowerCase()}`).join(" · ");
  const criticalHeld = g.kind === "review" && inc.members.length > 0 && !groupVerdicts(inc).includes("approve");
  const retry = g.kind === "failed" ? groupRetry(inc, scope) : null;

  return (
    <article aria-label={headline} className="rounded-3xl bg-[color-mix(in_oklab,var(--surface)_80%,transparent)] p-6 shadow-[inset_0_0_0_1px_var(--border-glass-strong)]">
      <header className="flex items-start gap-4">
        <p className="min-w-0 flex-1 text-2xl font-semibold leading-snug text-foreground">{headline}</p>
        <ReasonChip cls={top ?? (g.kind === "failed" ? "failed" : "draft_ready")} label={top ? c.severity[top] : c.triage.kinds[g.kind]} />
      </header>
      {mix && <p className="mt-1 text-sm tabular-nums text-muted-dark">{mix}</p>}
      <p className="mt-2 text-base text-muted-dark">{c.triage.groupNote}</p>

      <ul className="mt-4 divide-y divide-[var(--border-glass)] rounded-xl shadow-[inset_0_0_0_1px_var(--border-glass)]">
        {g.members.map((m) => {
          const a = byId.get(m.agentId);
          if (!a) return null;
          const on = !excluded.has(m.key);
          return (
            <li key={m.key} className="flex items-center gap-3 px-3 py-2 text-sm">
              <input
                type="checkbox"
                data-group-member
                checked={on}
                onChange={() => onToggle(m.key)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onConsole(a.id); } }}
                aria-label={fill(c.triage.include, { callsign: a.callsign })}
                className="h-4 w-4 shrink-0 accent-[var(--brand-cyan)]"
              />
              <i aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: ATTENTION_COLOR[needsTone(a)] }} />
              <span className={`font-mono text-xs font-semibold ${on ? "text-foreground" : "text-muted-dark line-through"}`}>{a.callsign}</span>
              <span className="min-w-0 flex-1 truncate text-muted-dark">{a.name}</span>
              {m.severity && <ReasonChip cls={m.severity} label={c.severity[m.severity]} />}
              <button type="button" onClick={() => onConsole(a.id)} className={`${ctlBtn} h-7 px-2 text-xs text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)]`}>{c.triage.open}</button>
            </li>
          );
        })}
      </ul>

      {criticalHeld && <p className="mt-3 text-sm text-muted-dark">{c.triage.criticalNote}</p>}
      {retry && retry.skipped > 0 && <p className="mt-3 text-sm text-muted-dark">{fill(plural(retry.skipped, c.triage.retrySkippedOne, c.triage.retrySkipped), { n: retry.skipped })}</p>}

      {actions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {actions.map((x, i) => (
            <button key={x.key} type="button" data-triage-act={i === 0 || undefined} disabled={op.offline && x.key !== "w"} onClick={x.run} className={`${ctlBtn} h-10 px-4 text-base ${x.tone ? "" : "text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)]"}`} style={x.tone ? toneStyle[x.tone] : undefined}>
              {x.label}
              <kbd className="rounded border border-current/30 px-1.5 font-mono text-xs opacity-80">{x.key.toUpperCase()}</kbd>
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

const ghost = `${ctlBtn} h-10 px-4 text-base text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)]`;

/** Triage's side list: the next decisions, or the next groups (n > 1 shows the count). */
export function UpNext({ rows, scope, copy: c }: { rows: { key: string; agentId: string; n: number; label: string }[]; scope: readonly SimAgent[]; copy: BoardCopy }) {
  return (
    <aside aria-label={c.triage.upNext} className="min-h-0 overflow-y-auto">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-dark">{c.triage.upNext}</h3>
      {rows.length ? (
        <ol className="mt-2 space-y-1">
          {rows.map((r) => {
            const a = scope.find((y) => y.id === r.agentId)!;
            return (
              <li key={r.key} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm">
                <i aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: ATTENTION_COLOR[needsTone(a)] }} />
                <span className="font-mono text-xs font-semibold tabular-nums text-foreground">{r.n > 1 ? `${r.n}×` : a.callsign}</span>
                <span className="truncate text-muted-dark">{r.label}</span>
              </li>
            );
          })}
        </ol>
      ) : <p className="mt-2 text-sm text-muted-dark">{c.triage.nothingNext}</p>}
    </aside>
  );
}

export function Done({ copy: c, decided, skipped, left, onAgain, onClose }: { copy: BoardCopy; decided: number; skipped: number; left: number; onAgain: () => void; onClose: () => void }) {
  return (
    <div className={`${s.pop} flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center`}>
      <CheckCircle2 aria-hidden className="h-16 w-16 text-[var(--status-success)]" strokeWidth={1.5} />
      <h3 className="text-2xl font-semibold text-foreground">{left ? c.triage.doneTitle : c.triage.allClear}</h3>
      <p className="text-base tabular-nums text-muted-dark">{fill(c.triage.doneStats, { d: decided, s: skipped })}</p>
      {left > 0 && <p className="max-w-md text-base text-muted-dark">{fill(c.triage.stillNeed, { n: left })}</p>}
      <div className="mt-3 flex gap-2">
        {left > 0 && <button type="button" data-triage-again onClick={onAgain} className={`${ctlBtn} h-10 bg-brand-cyan px-4 text-base text-background`}>{fill(c.triage.again, { n: left })}</button>}
        <button type="button" data-triage-again={left ? undefined : true} onClick={onClose} className={ghost}>{c.triage.backToBoard}</button>
      </div>
    </div>
  );
}
