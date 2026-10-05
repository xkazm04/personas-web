"use client";

import { useRef } from "react";
import Emblem from "./Emblem";
import { ReasonChip } from "./parts";
import { ago, agentAria, type BoardCopy } from "./copy";
import { needAgeMs, queueOf, reasonOf, type BoardEvent, type SimAgent } from "./model";
import type { BoardNav } from "./useBoardNav";
import { useSize } from "./useBoardRuntime";
import b from "./board.module.css";

interface QueueProps {
  list: SimAgent[];
  simMs: number;
  events: BoardEvent[];
  copy: BoardCopy;
  nav: BoardNav;
  empty: string;
}

/** One queue row's height. The list shows whole rows only: its height is the
 *  largest multiple of this that fits, and scrolling snaps row by row. */
const ROW = 60;

/** The ranked needs-you queue: who, why, and for how long. */
export default function Queue({ list, simMs, events, copy, nav, empty }: QueueProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const { height } = useSize(boxRef);
  const q = queueOf(list);
  const fits = Math.max(1, Math.floor(height / ROW));
  // The box is always mounted, so its observer sees the queue fill up later.
  return (
    <div ref={boxRef} className="-mx-3 min-h-0 flex-1">
      {!q.length && <p className="px-3 py-2 text-base text-muted-dark">{empty}</p>}
      <ul hidden={!q.length}
        className={`${b.queue} snap-y snap-mandatory overflow-y-auto pr-1`}
        style={{ height: height ? fits * ROW : undefined }}
      >
      {q.map((a) => {
        const r = reasonOf(a);
        const label = copy.reasons[r.cls];
        const title = r.title ?? (r.cls === "draft_ready" ? copy.tasks.draftFallback : "");
        const age = needAgeMs(a, simMs, events);
        return (
          <li key={a.id} className="snap-start" style={{ height: ROW }}>
            <button
              type="button"
              aria-label={`${agentAria(a, copy)}. ${label}: ${title}`}
              className="grid h-full w-full grid-cols-[36px_1fr_auto] content-center items-center gap-x-3 gap-y-1 rounded-xl px-3 py-1.5 text-left transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] focus-visible:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] focus-visible:outline-2 focus-visible:outline-foreground"
              onClick={(e) => nav.openAgent(a.id, e.currentTarget)}
            >
              <span className="row-span-2 h-9 w-9"><Emblem agent={a} /></span>
              <span className="truncate text-base text-foreground">
                <span className="mr-2 font-mono text-sm text-muted-dark">{a.callsign}</span>
                {a.name}
              </span>
              <span className="whitespace-nowrap text-right text-xs text-muted-dark">{age != null ? ago(age, copy) : ""}</span>
              <span className="col-span-2 flex min-w-0 items-center gap-2">
                <ReasonChip cls={r.cls} label={label} />
                <span className="truncate text-xs text-muted-dark">{title}</span>
              </span>
            </button>
          </li>
        );
      })}
      </ul>
    </div>
  );
}
