import { AlertCircle, Ban, Check, CheckCircle2, Clock, Inbox, Link2, Loader2, Radio, RotateCcw, Trash2 } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { relativeTime } from "@/lib/format";
import type { EventStatus, Persona, PersonaEvent } from "@/lib/types";
import { isEventDiscardable, isEventRetryable } from "@/lib/eventStatusFsm";
import type { EventPanelLabels } from "./eventPanelTypes";
import { EventTypeBadge } from "./EventTypeBadge";

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  processing: Loader2,
  processed: CheckCircle2,
  completed: CheckCircle2,
  failed: AlertCircle,
  dead_letter: Inbox,
  discarded: Ban,
};

const statusTones: Record<string, string> = {
  pending: "text-amber-400",
  processing: "text-cyan-400",
  failed: "text-red-400",
  dead_letter: "text-rose-400",
  discarded: "text-muted-dark",
};

export function buildEventColumns(
  labels: EventPanelLabels,
  personaMap: Map<string, Persona>,
  chainMap: Map<string, Set<string>>,
  activeChain: Set<string> | null,
  setActiveChain: (chain: Set<string> | null) => void,
  replayingIds: Set<string>,
  retryCounts: Record<string, number>,
  onReplay: (event: PersonaEvent) => void,
  selectedIds: Set<string>,
  onSelect: (id: string) => void,
  discardingIds: Set<string>,
  onDiscard: (event: PersonaEvent) => void,
): Column<PersonaEvent>[] {
  return [
    {
      key: "select",
      header: "",
      className: "w-6 flex-shrink-0",
      render: (event) => isEventRetryable(event.status) ? <FailedSelect event={event} labels={labels} selectedIds={selectedIds} onSelect={onSelect} /> : null,
    },
    {
      key: "status-icon",
      header: "",
      className: "w-8 flex-shrink-0",
      render: (event) => <EventStatusIcon status={event.status} />,
    },
    {
      key: "persona",
      header: "",
      className: "w-8 flex-shrink-0",
      render: (event) => <EventPersona event={event} personaMap={personaMap} />,
    },
    {
      key: "event-type",
      header: labels.eventsPage.event,
      className: "flex-1 min-w-0",
      render: (event) => <EventTypeCell event={event} labels={labels} chainMap={chainMap} activeChain={activeChain} setActiveChain={setActiveChain} />,
    },
    { key: "source", header: labels.eventsPage.source, className: "w-24 flex-shrink-0 hidden sm:block", render: (event) => <span className="text-sm text-muted-dark">{event.sourceType}</span> },
    { key: "status", header: labels.common.status, className: "w-28 flex-shrink-0 hidden sm:block", render: (event) => <StatusBadge status={event.status} /> },
    {
      key: "retries",
      header: "",
      className: "w-10 flex-shrink-0",
      render: (event) => <RetryCount count={retryCounts[event.id]} label={labels.eventsPage.retriedCount} />,
    },
    { key: "time", header: labels.eventsPage.time, className: "w-16 flex-shrink-0 text-right", render: (event) => <span className="text-sm text-muted-dark">{relativeTime(event.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      className: "w-16 flex-shrink-0",
      render: (event) => <EventRowActions event={event} labels={labels} replayingIds={replayingIds} onReplay={onReplay} discardingIds={discardingIds} onDiscard={onDiscard} />,
    },
  ];
}

export { DataTable };

function FailedSelect({ event, labels, selectedIds, onSelect }: { event: PersonaEvent; labels: EventPanelLabels; selectedIds: Set<string>; onSelect: (id: string) => void }) {
  const selected = selectedIds.has(event.id);
  return (
    <button role="checkbox" aria-checked={selected} aria-label={labels.eventsPage.selectForBulkRetry} onClick={(e) => { e.stopPropagation(); onSelect(event.id); }} className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${selected ? "border-brand-cyan bg-brand-cyan/20 text-brand-cyan" : "border-glass-strong hover:border-white/[0.3]"}`}>
      {selected && <Check className="h-2.5 w-2.5" />}
    </button>
  );
}

function EventStatusIcon({ status }: { status: EventStatus }) {
  const StatusIcon = statusIcons[status] ?? Clock;
  const tone = statusTones[status] ?? "text-emerald-400";
  return <StatusIcon className={`h-4 w-4 ${tone}`} />;
}

function EventPersona({ event, personaMap }: { event: PersonaEvent; personaMap: Map<string, Persona> }) {
  const persona = event.targetPersonaId ? personaMap.get(event.targetPersonaId) : undefined;
  return persona ? <PersonaAvatar icon={persona.icon} color={persona.color} name={persona.name} /> : <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04]"><Radio className="h-3.5 w-3.5 text-muted-dark" /></div>;
}

function EventTypeCell({ event, labels, chainMap, activeChain, setActiveChain }: { event: PersonaEvent; labels: EventPanelLabels; chainMap: Map<string, Set<string>>; activeChain: Set<string> | null; setActiveChain: (chain: Set<string> | null) => void }) {
  const chain = chainMap.get(event.id);
  const chainSize = chain ? chain.size : 0;
  const isInActiveChain = activeChain?.has(event.id) ?? false;
  return (
    <div className="flex items-center gap-2">
      <EventTypeBadge eventType={event.eventType} />
      {chainSize > 0 && (
        <button onClick={(e) => { e.stopPropagation(); setActiveChain(activeChain === chain ? null : chain ?? null); }} className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-sm font-mono transition-colors ${isInActiveChain ? "bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/25" : "text-muted-dark/60 hover:text-muted-dark hover:bg-white/[0.04]"}`} aria-label={labels.eventsPage.showRelatedEvents.replace("{count}", String(chainSize))}>
          <Link2 className="h-3 w-3" />
          <span>{chainSize}</span>
        </button>
      )}
    </div>
  );
}

function RetryCount({ count, label }: { count?: number; label: string }) {
  if (!count) return null;
  return <span className="flex items-center gap-0.5 text-sm font-mono text-amber-400/90" title={label.replace("{count}", String(count))}><RotateCcw className="h-2.5 w-2.5" />{count}</span>;
}

function EventRowActions({ event, labels, replayingIds, onReplay, discardingIds, onDiscard }: { event: PersonaEvent; labels: EventPanelLabels; replayingIds: Set<string>; onReplay: (event: PersonaEvent) => void; discardingIds: Set<string>; onDiscard: (event: PersonaEvent) => void }) {
  const canRetry = isEventRetryable(event.status);
  const canDiscard = isEventDiscardable(event.status);
  if (!canRetry && !canDiscard) return null;
  const isReplaying = replayingIds.has(event.id);
  const isDiscarding = discardingIds.has(event.id);
  const busy = isReplaying || isDiscarding;
  return (
    <div className="flex items-center gap-1">
      {canRetry && (
        <button onClick={(e) => { e.stopPropagation(); onReplay(event); }} disabled={busy} title={labels.eventsPage.retryEvent} aria-label={labels.eventsPage.retryEvent} className="flex items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 p-1 text-amber-400 transition-all hover:bg-amber-500/20 disabled:opacity-50">
          {isReplaying ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
        </button>
      )}
      {canDiscard && (
        <button onClick={(e) => { e.stopPropagation(); onDiscard(event); }} disabled={busy} title={labels.eventsPage.discardEvent} aria-label={labels.eventsPage.discardEvent} className="flex items-center justify-center rounded-md border border-glass-hover bg-white/[0.04] p-1 text-muted-dark transition-all hover:border-glass-strong hover:text-foreground disabled:opacity-50">
          {isDiscarding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        </button>
      )}
    </div>
  );
}
