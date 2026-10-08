"use client";

import { X } from "lucide-react";
import { ATTENTION_COLOR, needsTone } from "../attention";
import type { BoardCopy } from "./copy";
import { reasonOf, type SimAgent } from "./model";
import s from "./tiles.module.css";

export interface JustInAlert {
  key: string;
  id: string;
}

interface JustInProps {
  alerts: readonly JustInAlert[];
  scope: SimAgent[];
  copy: BoardCopy;
  onOpen: (id: string) => void;
  onDismiss: (key: string) => void;
}

/** Agents that newly need you, as cards in the field's corner: the change you
 *  would otherwise miss while looking at another part of the board. */
export default function JustIn({ alerts, scope, copy: c, onOpen, onDismiss }: JustInProps) {
  const shown = alerts.map((al) => ({ al, a: scope.find((x) => x.id === al.id) })).filter((x): x is { al: JustInAlert; a: SimAgent } => !!x.a);
  if (!shown.length) return null;
  return (
    <ol aria-label={c.activity.justIn} aria-live="polite" className="pointer-events-none absolute bottom-3 right-3 z-[22] flex w-72 flex-col gap-2">
      {shown.map(({ al, a }) => {
        const r = reasonOf(a);
        return (
          <li key={al.key} className={`${s.pop} pointer-events-auto overflow-hidden rounded-xl bg-surface shadow-[inset_0_0_0_1px_var(--border-glass-strong),0_14px_40px_rgb(0_0_0/0.35)]`}>
            <div className="flex">
              <i aria-hidden className="w-1 shrink-0" style={{ background: ATTENTION_COLOR[needsTone(a)] }} />
              <div className="min-w-0 flex-1 px-3 py-2">
                <div className="text-xs uppercase tracking-wider text-muted-dark">{c.activity.justIn}</div>
                <div className="truncate text-sm text-foreground"><b className="mr-1.5 font-mono">{a.callsign}</b>{a.name}</div>
                <div className="truncate text-xs text-muted-dark">{c.reasons[r.cls]}{r.title ? ` · ${r.title}` : ""}</div>
              </div>
              <div className="flex flex-col items-end justify-between py-1.5 pr-1.5">
                <button type="button" onClick={() => onDismiss(al.key)} aria-label={c.activity.dismiss} className="grid h-6 w-6 place-items-center rounded-md text-muted-dark hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground">
                  <X aria-hidden className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => onOpen(a.id)} className="rounded-md px-2 py-0.5 text-xs font-semibold text-brand-cyan hover:bg-[color-mix(in_oklab,var(--brand-cyan)_12%,transparent)] focus-visible:outline-2 focus-visible:outline-foreground">
                  {c.activity.openAgent}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
