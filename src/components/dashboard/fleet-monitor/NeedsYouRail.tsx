"use client";

import { memo, type ReactNode } from "react";
import { ATTENTION_COLOR, type AttentionTone } from "./attention";
import { fill } from "./board/model";
import { personasMonitorCopy } from "@/i18n/pending/personasMonitor";

export interface RailItem {
  id: string;
  callsign: string;
  name: string;
  /** Short reason, e.g. "run failed", "needs answer", "critical review". */
  reason: string;
  tone: AttentionTone;
  /** Pre-formatted age, e.g. "7h". */
  age?: string;
}

interface NeedsYouRailProps {
  /** Most urgent first. */
  items: readonly RailItem[];
  /** The agent currently under attention (hovered/focused anywhere in the view). */
  activeId?: string | null;
  onHover?: (id: string | null) => void;
  onSelect: (id: string) => void;
  /** Optional context under the queue (a hovered agent's card, team stats...). */
  footer?: ReactNode;
  /** While a search narrows the queue: the unfiltered count ("2 of 23") and the
   *  empty line, so a filtered-empty rail never reads as "nobody needs you". */
  total?: number;
  emptyText?: string;
  /** A control in the header, after the count (the Board's Triage button). */
  action?: ReactNode;
}

/**
 * The right rail of every prototype's L0: who is waiting on a human, ranked.
 * Rows are compact (one line of callsign + name, one line of reason) so ~20
 * fit on a 900px screen; the list scrolls past that. Hovering a row should
 * light the agent in the field; the view wires `onHover` to its own attention.
 */
function NeedsYouRail({ items, activeId, onHover, onSelect, footer, total, emptyText, action }: NeedsYouRailProps) {
  const copy = personasMonitorCopy.rail;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 px-3 pb-1.5 pt-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-dark">{copy.title}</h2>
        <span className="text-sm font-semibold tabular-nums" style={{ color: ATTENTION_COLOR.needs }}>
          {total != null && total !== items.length ? fill(copy.of, { n: items.length, total }) : items.length}
        </span>
        {action && <span className="ml-auto">{action}</span>}
      </div>
      {items.length === 0 ? (
        <p className="px-3 text-sm text-muted-dark">{emptyText ?? copy.empty}</p>
      ) : (
        <ol aria-label={copy.listLabel} className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2" onMouseLeave={() => onHover?.(null)}>
          {items.map((it) => (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => onSelect(it.id)}
                onMouseEnter={() => onHover?.(it.id)}
                onFocus={() => onHover?.(it.id)}
                onBlur={() => onHover?.(null)}
                className={`grid w-full grid-cols-[3px_1fr_auto] gap-x-2 rounded-md px-1.5 py-1 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand-cyan ${
                  activeId === it.id ? "bg-foreground/[0.07]" : "hover:bg-foreground/[0.04]"
                }`}
              >
                <span aria-hidden className="row-span-2 rounded-full" style={{ background: ATTENTION_COLOR[it.tone] }} />
                <span className="truncate text-sm text-foreground">
                  <span className="mr-1.5 font-mono text-xs font-semibold" style={{ color: `color-mix(in oklab, ${ATTENTION_COLOR[it.tone]} 70%, var(--foreground))` }}>
                    {it.callsign}
                  </span>
                  {it.name}
                </span>
                <span className="text-xs tabular-nums text-muted-dark">{it.age}</span>
                <span className="col-span-2 truncate text-xs text-muted-dark">{it.reason}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
      {footer && <div className="flex-none border-t border-glass">{footer}</div>}
    </div>
  );
}

const sameItem = (x: RailItem, y: RailItem) =>
  x.id === y.id && x.callsign === y.callsign && x.name === y.name && x.reason === y.reason && x.tone === y.tone && x.age === y.age;

/** The rows are rebuilt on every simulation tick, so compare them by value: the
 *  rail re-renders only when who needs you (or their reason or age) changes, or
 *  when the highlighted row moves. Hosts pass stable handlers. */
export default memo(NeedsYouRail, (p, n) =>
  p.activeId === n.activeId && p.onHover === n.onHover && p.onSelect === n.onSelect && p.footer === n.footer &&
  p.total === n.total && p.emptyText === n.emptyText && p.action === n.action &&
  p.items.length === n.items.length && p.items.every((it, i) => sameItem(it, n.items[i])),
);
