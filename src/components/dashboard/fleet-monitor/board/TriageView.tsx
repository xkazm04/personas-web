"use client";

import { motion } from "framer-motion";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { CheckCircle2 } from "lucide-react";
import { ATTENTION_COLOR, needsTone } from "../attention";
import TriageCard, { triageActions } from "./TriageCard";
import { fill, type BoardEvent, type SimAgent } from "./model";
import { triageItems, triageList } from "./triage";
import { ctlBtn } from "./Controls";
import type { BoardCopy } from "./copy";
import type { Operator } from "./operator";
import s from "./tiles.module.css";

interface TriageViewProps {
  scope: SimAgent[];
  simMs: number;
  events: BoardEvent[];
  copy: BoardCopy;
  op: Operator;
  hostName: string;
  still: boolean;
  onClose: () => void;
  onConsole: (agentId: string) => void;
}

const ghost = `${ctlBtn} h-10 px-4 text-base text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)]`;
const kbdCls = "rounded border border-glass-hover px-1.5 font-mono text-xs text-muted-dark";

/**
 * Triage: every decision waiting on you, one at a time, in a frozen order, by
 * keyboard (the keys are on the buttons; S or → skips, C opens the console,
 * 1-4 pick a quick answer, Esc leaves). Ends on what you did and what is
 * still waiting.
 */
export default function TriageView({ scope, simMs, events, copy: c, op, hostName, still, onClose, onConsole }: TriageViewProps) {
  const [snapshot, setSnapshot] = useState(() => triageItems(scope).map((i) => i.key));
  const [handled, setHandled] = useState<ReadonlyMap<string, "decided" | "skipped">>(() => new Map());
  const panelRef = useRef<HTMLElement>(null);
  useFocusTrap({ active: true, containerRef: panelRef });

  const list = triageList(snapshot, scope, new Set(handled.keys()));
  const item = list[0];
  const agent = item ? scope.find((a) => a.id === item.agentId) : undefined;
  const decided = [...handled.values()].filter((v) => v === "decided").length;
  const total = handled.size + list.length;
  const mark = (key: string, how: "decided" | "skipped") => setHandled((m) => new Map(m).set(key, how));
  const actions = item && agent ? triageActions(item, agent, op, c, () => mark(item.key, "decided")) : [];
  const skip = () => item && mark(item.key, "skipped");

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
    const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
    if (e.key === "Escape") {
      e.preventDefault();
      if (tag === "textarea" || tag === "input") (e.target as HTMLElement).blur();
      else onClose();
      return;
    }
    if (tag === "textarea" || tag === "input" || !item || !agent) return;
    const k = e.key.toLowerCase();
    const hit = actions.find((x) => x.key === k);
    if (hit) { e.preventDefault(); hit.run(); }
    else if (k === "s" || e.key === "ArrowRight") { e.preventDefault(); skip(); }
    else if (k === "c") { e.preventDefault(); onConsole(agent.id); }
    else if (item.kind === "input" && /^[1-4]$/.test(k)) {
      // A quick answer fills the field and focuses it, so Enter sends.
      e.preventDefault();
      panelRef.current?.querySelectorAll<HTMLElement>("[data-quick]")[Number(k) - 1]?.click();
    }
  });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  // Each new decision takes the focus: its first action, or its first quick
  // answer (never the field itself, which would swallow the S and C keys).
  const itemKey = item?.key;
  useEffect(() => {
    const el = panelRef.current?.querySelector<HTMLElement>("[data-triage-act], [data-quick], [data-triage-again]");
    el?.focus({ preventScroll: true });
  }, [itemKey]);

  return (
    <motion.section
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={c.triage.label}
      className="absolute inset-0 z-20 flex flex-col overflow-hidden rounded-3xl bg-[linear-gradient(180deg,color-mix(in_oklab,var(--surface)_97%,transparent),color-mix(in_oklab,var(--background)_97%,transparent))] shadow-[inset_0_0_0_1px_var(--border-glass-strong),0_40px_120px_rgb(0_0_0/0.35)]"
      initial={{ opacity: 0, scale: still ? 1 : 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: still ? 1 : 0.98 }}
      transition={{ duration: still ? 0.2 : 0.4, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <header className="flex items-center gap-5 border-b border-glass px-6 py-3">
        <h2 className="text-lg font-semibold text-foreground">{c.triage.title}</h2>
        {item && <span className="text-sm tabular-nums text-muted-dark">{fill(c.triage.progress, { i: handled.size + 1, n: total })}</span>}
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]" aria-hidden>
          <div className="h-full rounded-full bg-brand-cyan transition-[width] duration-500" style={{ width: `${total ? (handled.size / total) * 100 : 100}%` }} />
        </div>
        <span className="text-sm tabular-nums text-muted-dark">{fill(c.triage.decided, { n: decided })} · {fill(c.triage.skipped, { n: handled.size - decided })}</span>
        <button type="button" onClick={onClose} className={`${ctlBtn} text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)]`}>
          {c.triage.exit} <kbd className={kbdCls}>Esc</kbd>
        </button>
      </header>
      {op.offline && <p role="status" className="border-b border-glass px-6 py-1.5 text-sm text-muted-dark">{fill(c.triage.offline, { host: hostName })}</p>}

      {item && agent ? (
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(220px,280px)] gap-6 p-6">
          <div className="flex min-h-0 justify-center overflow-y-auto">
            <div key={item.key} className={`${s.pop} w-full max-w-3xl`}>
              <TriageCard agent={agent} item={item} more={list.filter((x) => x.agentId === agent.id).length - 1} simMs={simMs} events={events} copy={c} op={op} actions={actions} onAnswered={() => mark(item.key, "decided")} />
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={skip} className={ghost}>{c.triage.skip} <kbd className={kbdCls}>S</kbd></button>
                <button type="button" onClick={() => onConsole(agent.id)} className={ghost}>{c.triage.console} <kbd className={kbdCls}>C</kbd></button>
              </div>
            </div>
          </div>
          <aside aria-label={c.triage.upNext} className="min-h-0 overflow-y-auto">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-dark">{c.triage.upNext}</h3>
            {list.length > 1 ? (
              <ol className="mt-2 space-y-1">
                {list.slice(1, 12).map((x) => {
                  const a = scope.find((y) => y.id === x.agentId)!;
                  return (
                    <li key={x.key} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm">
                      <i aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: ATTENTION_COLOR[needsTone(a)] }} />
                      <span className="font-mono text-xs font-semibold text-foreground">{a.callsign}</span>
                      <span className="truncate text-muted-dark">{c.triage.kinds[x.kind]}</span>
                    </li>
                  );
                })}
              </ol>
            ) : <p className="mt-2 text-sm text-muted-dark">{c.triage.nothingNext}</p>}
          </aside>
        </div>
      ) : (
        <Done copy={c} decided={decided} skipped={handled.size - decided} left={triageItems(scope).length} onAgain={() => { setSnapshot(triageItems(scope).map((i) => i.key)); setHandled(new Map()); }} onClose={onClose} />
      )}
    </motion.section>
  );
}

function Done({ copy: c, decided, skipped, left, onAgain, onClose }: { copy: BoardCopy; decided: number; skipped: number; left: number; onAgain: () => void; onClose: () => void }) {
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
