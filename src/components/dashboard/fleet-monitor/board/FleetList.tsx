"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import FleetRow from "./FleetRow";
import BulkBar from "./BulkBar";
import { fill, type SimAgent } from "./model";
import { DEFAULT_DIR, rangeIds, sortAgents, type SortDir, type SortKey } from "./fleetTable";
import { inFlightFor, type Command } from "./useCommands";
import type { BoardCopy } from "./copy";
import type { Operator } from "./operator";

interface FleetListProps {
  /** The agents in focus (search and pile filters already applied). */
  agents: SimAgent[];
  copy: BoardCopy;
  op: Operator;
  cmds: readonly Command[];
  hostName: string;
  onOpen: (id: string, el: HTMLElement) => void;
  onTeam: (teamName: string) => void;
}

type Col = { key: SortKey | null; label: string; num?: boolean; width?: string; sortLabel?: string };

/**
 * The fleet as a table: one row per agent, sortable by who needs you, name,
 * team or today's numbers, with checkboxes (shift-click selects a range) and
 * a bar of bulk actions for the selection.
 */
export default function FleetList({ agents, copy: c, op, cmds, hostName, onOpen, onTeam }: FleetListProps) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "attention", dir: "asc" });
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const anchor = useRef<string | null>(null);
  const allRef = useRef<HTMLInputElement>(null);
  const rows = sortAgents(agents, sort.key, sort.dir);
  const shown = rows.filter((a) => selected.has(a.id));
  const all = rows.length > 0 && shown.length === rows.length;
  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = shown.length > 0 && !all;
  }, [shown.length, all]);

  const cols: Col[] = [
    { key: "agent", label: c.list.cols.agent, width: "w-[21%]" },
    { key: "team", label: c.list.cols.team, width: "w-[12%]" },
    { key: "attention", label: c.list.cols.state, sortLabel: c.list.attentionSort, width: "w-[12%]" },
    { key: null, label: c.list.cols.now },
    { key: "runs", label: c.list.cols.runs, num: true, width: "w-[7.5rem]" },
    { key: "success", label: c.list.cols.success, num: true, width: "w-[5.5rem]" },
    { key: "cost", label: c.list.cols.cost, num: true, width: "w-[7rem]" },
    { key: null, label: c.list.cols.last12, num: true, width: "w-[8.5rem]" },
  ];
  const toggle = (id: string, shift: boolean) => {
    // Read the anchor now: the updater runs later, after it has moved on.
    const from = anchor.current;
    setSelected((cur) => {
      const next = new Set(cur);
      const ids = shift && from ? rangeIds(rows, from, id) : [id];
      const on = !cur.has(id);
      for (const x of ids) if (on) next.add(x); else next.delete(x);
      return next;
    });
    anchor.current = id;
  };

  return (
    <div className="absolute inset-0">
      <div className="h-full overflow-auto pb-20">
        <table aria-label={c.list.label} aria-multiselectable="true" className="w-full table-fixed border-separate border-spacing-0">
          <thead className="sticky top-0 z-[1] bg-[color-mix(in_oklab,var(--surface)_96%,var(--background))] text-xs text-muted-dark">
            <tr>
              <th className="h-9 w-10 border-b border-glass pl-4 text-left">
                <input ref={allRef} type="checkbox" checked={all} aria-label={fill(c.list.selectAll, { n: rows.length })} onChange={() => setSelected(all ? new Set() : new Set(rows.map((a) => a.id)))} className="h-4 w-4 cursor-pointer accent-[var(--brand-cyan)]" />
              </th>
              {cols.map((col) => {
                const on = col.key === sort.key;
                return (
                  <th key={col.label} scope="col" aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : undefined} className={`h-9 whitespace-nowrap border-b border-glass px-3 font-medium ${col.num ? "text-right" : "text-left"} ${col.width ?? ""} ${col.label === c.list.cols.last12 ? "pr-4" : ""}`}>
                    {col.key ? (
                      <button
                        type="button"
                        title={col.sortLabel ?? fill(c.list.sortBy, { col: col.label })}
                        onClick={() => setSort((cur) => (cur.key === col.key ? { key: cur.key, dir: cur.dir === "asc" ? "desc" : "asc" } : { key: col.key!, dir: DEFAULT_DIR[col.key!] }))}
                        className={`inline-flex items-center gap-1 rounded hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground ${on ? "text-foreground" : ""}`}
                      >
                        {col.label}
                        {on && (sort.dir === "asc" ? <ArrowUp aria-hidden className="h-3 w-3" /> : <ArrowDown aria-hidden className="h-3 w-3" />)}
                      </button>
                    ) : col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <FleetRow key={a.id} agent={a} copy={c} selected={selected.has(a.id)} pending={!!inFlightFor(cmds, a.id)} onToggle={(shift) => toggle(a.id, shift)} onOpen={(el) => onOpen(a.id, el)} onTeam={onTeam} />
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-4 py-10 text-center text-base text-muted-dark">{c.list.none}</p>}
      </div>
      {shown.length > 0 && (
        <BulkBar
          selected={shown}
          copy={c}
          offline={op.offline}
          offlineReason={fill(c.cmd.offline, { host: hostName })}
          onBulk={(v) => op.bulk(v, shown)}
          onClear={() => setSelected(new Set())}
        />
      )}
    </div>
  );
}
