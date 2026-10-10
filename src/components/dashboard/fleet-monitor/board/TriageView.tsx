"use client";

import { motion } from "framer-motion";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import TriageCard, { triageActions } from "./TriageCard";
import TriageGroupCard, { Done, UpNext, groupActions } from "./TriageGroupCard";
import { fill, type BoardEvent, type SimAgent } from "./model";
import { triageItems, triageList } from "./triage";
import { groupItems, markAll, reconcile, type TriageGroup } from "./triageGroups";
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
 *
 * G switches to by question: the decisions grouped as captured at that moment
 * (triageGroups.ts), one judgment per group, held as one Undo. A group only
 * loses members (decided here or elsewhere); what arrives later gets groups of
 * its own on request. W walks one group one at a time, then returns to the
 * groups; G back resumes at the first undecided item of the frozen order.
 */
export default function TriageView({ scope, simMs, events, copy: c, op, hostName, still, onClose, onConsole }: TriageViewProps) {
  const [snapshot, setSnapshot] = useState(() => triageItems(scope).map((i) => i.key));
  const [handled, setHandled] = useState<ReadonlyMap<string, "decided" | "skipped">>(() => new Map());
  const [mode, setMode] = useState<"one" | "groups">("one");
  const [groups, setGroups] = useState<TriageGroup[]>([]);
  const [excluded, setExcluded] = useState<ReadonlySet<string>>(() => new Set());
  const [walk, setWalk] = useState<ReadonlySet<string> | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  useFocusTrap({ active: true, containerRef: panelRef });

  const list = triageList(snapshot, scope, new Set(handled.keys()));
  // Walking a group: one at a time over its members, then back to the groups.
  const walking = walk && list.some((i) => walk.has(i.key)) ? walk : null;
  const view = mode === "groups" && !walking ? "groups" : "one";
  const focusList = walking ? list.filter((i) => walking.has(i.key)) : list;
  const captured = new Set(groups.flatMap((g) => g.members.map((m) => m.key)));
  const liveGroups = view === "groups" ? groups.map((g) => reconcile(g, list)).filter((g) => g.members.length) : [];
  const fresh = view === "groups" ? list.filter((i) => !captured.has(i.key)) : [];
  const group = liveGroups[0];
  // A one-member group is the ordinary card (an answer is always one of these).
  const item = view === "one" ? focusList[0] : group?.members.length === 1 ? group.members[0] : undefined;
  const agent = item ? scope.find((a) => a.id === item.agentId) : undefined;
  const decided = [...handled.values()].filter((v) => v === "decided").length;
  const total = handled.size + list.length;
  const mark = (key: string, how: "decided" | "skipped") => setHandled((m) => new Map(m).set(key, how));
  const markKeys = (keys: readonly string[], how: "decided" | "skipped") => setHandled((m) => markAll(m, keys, how));
  const toggle = (key: string) => setExcluded((x) => { const n = new Set(x); if (!n.delete(key)) n.add(key); return n; });
  const actions = item && agent
    ? triageActions(item, agent, op, c, () => mark(item.key, "decided"))
    : group ? groupActions(group, scope, op, c, excluded, (keys) => markKeys(keys, "decided"), () => setWalk(new Set(group.members.map((m) => m.key))))
    : [];
  const skip = () => {
    if (item) mark(item.key, "skipped");
    else if (group) markKeys(group.members.map((m) => m.key), "skipped");
  };
  const switchMode = () => {
    // G while walking a group goes back to the groups.
    if (walking) return setWalk(null);
    if (mode === "one") setGroups(groupItems(list, scope));
    setMode(mode === "one" ? "groups" : "one");
    setWalk(null);
  };
  const again = () => {
    const next = triageItems(scope);
    setSnapshot(next.map((i) => i.key));
    setHandled(new Map());
    setGroups(groupItems(next, scope));
    setWalk(null);
  };
  const addFresh = () => setGroups((gs) => [...gs, ...groupItems(fresh, scope).map((g) => ({ ...g, key: `${g.key}#${gs.length}` }))]);

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
    const el = e.target as HTMLElement | null;
    const tag = el?.tagName?.toLowerCase();
    // A member's checkbox is not a text field: the triage keys still work on it.
    const typing = tag === "textarea" || (tag === "input" && (el as HTMLInputElement).type !== "checkbox");
    if (e.key === "Escape") {
      e.preventDefault();
      if (typing) el!.blur();
      else onClose();
      return;
    }
    if (typing) return;
    const k = e.key.toLowerCase();
    if (k === "g") { e.preventDefault(); switchMode(); return; }
    if (!(item && agent) && !group) return;
    const hit = actions.find((x) => x.key === k);
    if (hit) { e.preventDefault(); hit.run(); }
    else if (k === "s" || e.key === "ArrowRight") { e.preventDefault(); skip(); }
    else if (k === "c" && agent) { e.preventDefault(); onConsole(agent.id); }
    else if (item?.kind === "input" && /^[1-4]$/.test(k)) {
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
  const itemKey = item?.key ?? (group ? `group:${group.key}` : view);
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
        {(item || group) && <span className="text-sm tabular-nums text-muted-dark">{fill(c.triage.progress, { i: handled.size + 1, n: total })}</span>}
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]" aria-hidden>
          <div className="h-full rounded-full bg-brand-cyan transition-[width] duration-500" style={{ width: `${total ? (handled.size / total) * 100 : 100}%` }} />
        </div>
        <span className="text-sm tabular-nums text-muted-dark">{fill(c.triage.decided, { n: decided })} · {fill(c.triage.skipped, { n: handled.size - decided })}</span>
        <button type="button" onClick={switchMode} className={`${ctlBtn} text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)]`}>
          {mode === "groups" ? c.triage.oneByOne : c.triage.byQuestion} <kbd className={kbdCls}>G</kbd>
        </button>
        <button type="button" onClick={onClose} className={`${ctlBtn} text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)]`}>
          {c.triage.exit} <kbd className={kbdCls}>Esc</kbd>
        </button>
      </header>
      {op.offline && <p role="status" className="border-b border-glass px-6 py-1.5 text-sm text-muted-dark">{fill(c.triage.offline, { host: hostName })}</p>}

      {view === "groups" && fresh.length > 0 && (
        <p role="status" className="flex items-center gap-3 border-b border-glass px-6 py-1.5 text-sm text-muted-dark">
          <span className="flex-1">{fill(c.triage.newSince, { n: fresh.length })}</span>
          <button type="button" data-triage-again={group ? undefined : true} onClick={addFresh} className={`${ctlBtn} text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)]`}>{c.triage.addNew}</button>
        </p>
      )}

      {(item && agent) || group ? (
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(220px,280px)] gap-6 p-6">
          <div className="flex min-h-0 justify-center overflow-y-auto">
            <div key={item?.key ?? group!.key} className={`${s.pop} w-full max-w-3xl`}>
              {item && agent ? (
                <TriageCard agent={agent} item={item} more={list.filter((x) => x.agentId === agent.id).length - 1} simMs={simMs} events={events} copy={c} op={op} actions={actions} onAnswered={() => mark(item.key, "decided")} />
              ) : (
                <TriageGroupCard group={group!} scope={scope} copy={c} op={op} actions={actions} excluded={excluded} onToggle={toggle} onConsole={onConsole} />
              )}
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={skip} className={ghost}>{c.triage.skip} <kbd className={kbdCls}>S</kbd></button>
                {agent && <button type="button" onClick={() => onConsole(agent.id)} className={ghost}>{c.triage.console} <kbd className={kbdCls}>C</kbd></button>}
              </div>
            </div>
          </div>
          <UpNext copy={c} scope={scope} rows={view === "groups"
            ? liveGroups.slice(1, 12).map((g) => ({ key: g.key, agentId: g.members[0].agentId, n: g.members.length, label: g.title ?? c.triage.kinds[g.kind] }))
            : focusList.slice(1, 12).map((x) => ({ key: x.key, agentId: x.agentId, n: 1, label: c.triage.kinds[x.kind] }))} />
        </div>
      ) : view === "groups" && fresh.length > 0 ? (
        <div className="flex-1" />
      ) : (
        <Done copy={c} decided={decided} skipped={handled.size - decided} left={triageItems(scope).length} onAgain={again} onClose={onClose} />
      )}
    </motion.section>
  );
}
