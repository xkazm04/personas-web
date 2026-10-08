"use client";

import { Pause, Play, Square, X } from "lucide-react";
import type { BoardCopy } from "./copy";
import { fill, type SimAgent } from "./model";
import { BULK_VERBS, eligible, type BulkVerb } from "./fleetTable";
import { ctlBtn } from "./Controls";
import s from "./tiles.module.css";

interface BulkBarProps {
  selected: readonly SimAgent[];
  copy: BoardCopy;
  offline: boolean;
  offlineReason: string;
  onBulk: (verb: BulkVerb) => void;
  onClear: () => void;
}

const ICON = { pause: Pause, resume: Play, run: Play, cancel: Square } as const;

/** What can be done to the selected agents, each verb counting only the
 *  agents it applies to (Pause 9, Resume 3...). */
export default function BulkBar({ selected, copy: c, offline, offlineReason, onBulk, onClear }: BulkBarProps) {
  return (
    <div role="toolbar" aria-label={c.list.bulkLabel} className={`${s.pop} absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-surface py-2 pl-4 pr-2 shadow-[inset_0_0_0_1px_var(--border-glass-strong),0_18px_50px_rgb(0_0_0/0.35)]`} title={offline ? offlineReason : undefined}>
      <span className="mr-1 whitespace-nowrap text-sm font-semibold tabular-nums text-foreground">{fill(c.list.selected, { n: selected.length })}</span>
      {BULK_VERBS.map((v) => {
        const n = selected.filter((a) => eligible(v, a)).length;
        const Icon = ICON[v];
        return (
          <button key={v} type="button" disabled={offline || n === 0} onClick={() => onBulk(v)} data-bulk={v} className={`${ctlBtn} whitespace-nowrap text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-hover)] hover:bg-[color-mix(in_oklab,var(--foreground)_7%,transparent)]`}>
            <Icon aria-hidden className="h-3.5 w-3.5" />
            {fill(c.list.bulk[v], { n })}
          </button>
        );
      })}
      <button type="button" onClick={onClear} aria-label={c.list.clearSel} title={c.list.clearSel} className="grid h-9 w-9 place-items-center rounded-lg text-muted-dark hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground">
        <X aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}
