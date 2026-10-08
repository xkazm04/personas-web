"use client";

import { ListChecks } from "lucide-react";
import NeedsYouRail, { type RailItem } from "../NeedsYouRail";
import HostCard from "./HostCard";
import type { BoardCopy } from "./copy";
import type { HostReading } from "./host";
import type { Command } from "./useCommands";
import type { BoardNav } from "./useBoardNav";
import { personasMonitorCopy } from "@/i18n/pending/personasMonitor";

interface BoardRailProps {
  host: HostReading;
  copy: BoardCopy;
  live: boolean;
  fleetPaused: number;
  pendingFleet?: Command;
  items: RailItem[];
  /** The unfiltered queue length while a search narrows the rail. */
  total?: number;
  nav: BoardNav;
  onPauseAll: () => void;
  onResumeAll: () => void;
  onTriage: () => void;
}

/** The Board's right rail: the machine first, then everyone who needs you,
 *  with the way into triage. */
export default function BoardRail({ host, copy, live, fleetPaused, pendingFleet, items, total, nav, onPauseAll, onResumeAll, onTriage }: BoardRailProps) {
  return (
    <>
      <HostCard host={host} copy={copy} live={live} fleetPaused={fleetPaused} pending={pendingFleet} onPauseAll={onPauseAll} onResumeAll={onResumeAll} />
      <NeedsYouRail
        items={items}
        total={total}
        emptyText={total != null ? personasMonitorCopy.rail.emptyFiltered : undefined}
        activeId={nav.att?.type === "agent" ? nav.att.id : null}
        onHover={(id) => (id ? nav.attend({ type: "agent", id }) : nav.unattend())}
        onSelect={(id) => nav.openAgent(id, document.activeElement as HTMLElement | null)}
        action={(total ?? items.length) > 0 && (
          <button
            type="button"
            onClick={onTriage}
            title={copy.triage.startHint}
            data-triage-start
            className="inline-flex items-center gap-1.5 rounded-lg bg-[color-mix(in_oklab,var(--status-warning)_16%,transparent)] px-2 py-1 text-xs font-semibold text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--status-warning)_40%,transparent)] hover:bg-[color-mix(in_oklab,var(--status-warning)_26%,transparent)] focus-visible:outline-2 focus-visible:outline-foreground"
          >
            <ListChecks aria-hidden className="h-3.5 w-3.5" />
            {copy.triage.start}
            <kbd className="rounded border border-glass-hover px-1 font-mono text-xs text-muted-dark">T</kbd>
          </button>
        )}
      />
    </>
  );
}
