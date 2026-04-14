"use client";

import { useEffect, useState, useMemo, useRef, useCallback, useDeferredValue } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Webhook,
  Bell,
  Hand,
  Check,
  Search,
  X,
  Link2,
  Zap,
  RotateCcw,
  Inbox,
} from "lucide-react";
import { fadeUp } from "@/lib/animations";
import DataTable from "@/components/dashboard/DataTable";
import type { Column } from "@/components/dashboard/DataTable";
import FilterBar from "@/components/dashboard/FilterBar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import EmptyState from "@/components/dashboard/EmptyState";
import JsonViewer from "@/components/dashboard/JsonViewer";
import { useEventStore } from "@/stores/eventStore";
import { usePersonaStore } from "@/stores/personaStore";
import { useEventStream } from "@/hooks/useEventStream";
import type { PersonaEvent, Persona } from "@/lib/types";
import { relativeTime } from "@/lib/format";
import { useEventTopology } from "@/hooks/useEventTopology";

const INITIAL_VISIBLE_EVENTS = 200;
const EVENTS_LOAD_STEP = 200;

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  processed: CheckCircle2,
  completed: CheckCircle2,
  failed: AlertCircle,
};

const eventTypeConfig: Record<string, { icon: React.ElementType; bg: string; border: string; text: string }> = {
  webhook_received:   { icon: Webhook, bg: "bg-cyan-500/10",   border: "border-cyan-500/25",   text: "text-cyan-400" },
  alert_triggered:    { icon: Bell,    bg: "bg-amber-500/10",  border: "border-amber-500/25",  text: "text-amber-400" },
  scheduled_trigger:  { icon: Clock,   bg: "bg-purple-500/10", border: "border-purple-500/25", text: "text-purple-400" },
  manual_review:      { icon: Hand,    bg: "bg-rose-500/10",   border: "border-rose-500/25",   text: "text-rose-400" },
};

const defaultEventType = { icon: Radio, bg: "bg-white/[0.04]", border: "border-white/[0.08]", text: "text-muted" };

function EventTypeBadge({ eventType }: { eventType: string }) {
  const config = eventTypeConfig[eventType] ?? defaultEventType;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${config.border} ${config.bg} px-2 py-0.5 text-sm font-mono ${config.text}`}>
      <Icon className="h-3 w-3" />
      {eventType}
    </span>
  );
}

function EventExpandedContent({ event }: { event: PersonaEvent }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-dark">
        <span>
          ID: <code className="text-muted">{event.id.slice(0, 12)}...</code>
        </span>
        {event.sourceId && (
          <span>
            Source: <code className="text-muted">{event.sourceId.slice(0, 12)}</code>
          </span>
        )}
        {event.processedAt && (
          <span>Processed: {relativeTime(event.processedAt)}</span>
        )}
      </div>

      <JsonViewer payload={event.payload} />

      {event.errorMessage && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-red-400">{event.errorMessage}</p>
            {event.status === "failed" && (
              <RetryButton event={event} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RetryButton({ event }: { event: PersonaEvent }) {
  const replayEvent = useEventStore((s) => s.replayEvent);
  const replayingIds = useEventStore((s) => s.replayingIds);
  const isReplaying = replayingIds.has(event.id);

  return (
    <button
      onClick={() => void replayEvent(event)}
      disabled={isReplaying}
      className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-400 transition-all hover:bg-amber-500/20 disabled:opacity-50 flex-shrink-0"
    >
      {isReplaying ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <RotateCcw className="h-3 w-3" />
      )}
      Retry
    </button>
  );
}

function DropdownFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="h-10 sm:h-8 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 sm:px-2 text-base sm:text-sm text-muted transition-colors hover:border-white/[0.12] focus:border-brand-cyan/30 focus:outline-none focus:ring-1 focus:ring-brand-cyan/20 appearance-none cursor-pointer"
    >
      <option value="">{label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function buildColumns(
  personaMap: Map<string, Persona>,
  chainMap: Map<string, Set<string>>,
  activeChain: Set<string> | null,
  setActiveChain: (chain: Set<string> | null) => void,
  replayingIds: Set<string>,
  retryCounts: Record<string, number>,
  onReplay: (event: PersonaEvent) => void,
  selectedIds: Set<string>,
  onSelect: (id: string) => void,
): Column<PersonaEvent>[] {
  return [
    {
      key: "select",
      header: "",
      className: "w-6 flex-shrink-0",
      render: (event) => {
        if (event.status !== "failed") return null;
        const selected = selectedIds.has(event.id);
        return (
          <button
            role="checkbox"
            aria-checked={selected}
            aria-label="Select for bulk retry"
            onClick={(e) => { e.stopPropagation(); onSelect(event.id); }}
            className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
              selected
                ? "border-brand-cyan bg-brand-cyan/20 text-brand-cyan"
                : "border-white/[0.15] hover:border-white/[0.3]"
            }`}
          >
            {selected && <Check className="h-2.5 w-2.5" />}
          </button>
        );
      },
    },
    {
      key: "status-icon",
      header: "",
      className: "w-8 flex-shrink-0",
      render: (event) => {
        const StatusIcon = statusIcons[event.status] ?? Clock;
        return (
          <StatusIcon
            className={`h-4 w-4 ${
              event.status === "failed"
                ? "text-red-400"
                : event.status === "pending"
                  ? "text-amber-400"
                  : "text-emerald-400"
            }`}
          />
        );
      },
    },
    {
      key: "persona",
      header: "",
      className: "w-8 flex-shrink-0",
      render: (event) => {
        const persona = event.targetPersonaId
          ? personaMap.get(event.targetPersonaId)
          : undefined;
        return persona ? (
          <PersonaAvatar icon={persona.icon} color={persona.color} name={persona.name} />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04]">
            <Radio className="h-3.5 w-3.5 text-muted-dark" />
          </div>
        );
      },
    },
    {
      key: "event-type",
      header: "Event",
      className: "flex-1 min-w-0",
      render: (event) => {
        const chain = chainMap.get(event.id);
        const chainSize = chain ? chain.size : 0;
        const isInActiveChain = activeChain?.has(event.id) ?? false;
        return (
          <div className="flex items-center gap-2">
            <EventTypeBadge eventType={event.eventType} />
            {chainSize > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeChain === chain) {
                    setActiveChain(null);
                  } else {
                    setActiveChain(chain ?? null);
                  }
                }}
                className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-sm font-mono transition-colors ${
                  isInActiveChain
                    ? "bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/25"
                    : "text-muted-dark/50 hover:text-muted-dark hover:bg-white/[0.04]"
                }`}
                aria-label={`Show ${chainSize} related events`}
              >
                <Link2 className="h-3 w-3" />
                <span>{chainSize}</span>
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: "source",
      header: "Source",
      className: "w-24 flex-shrink-0 hidden sm:block",
      render: (event) => (
        <span className="text-sm text-muted-dark">{event.sourceType}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-28 flex-shrink-0 hidden sm:block",
      render: (event) => <StatusBadge status={event.status} />,
    },
    {
      key: "retries",
      header: "",
      className: "w-10 flex-shrink-0",
      render: (event) => {
        const count = retryCounts[event.id];
        if (!count) return null;
        return (
          <span className="flex items-center gap-0.5 text-sm font-mono text-amber-400/70" title={`Retried ${count} time${count !== 1 ? "s" : ""}`}>
            <RotateCcw className="h-2.5 w-2.5" />
            {count}
          </span>
        );
      },
    },
    {
      key: "time",
      header: "Time",
      className: "w-16 flex-shrink-0 text-right",
      render: (event) => (
        <span className="text-sm text-muted-dark">{relativeTime(event.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-8 flex-shrink-0",
      render: (event) => {
        if (event.status !== "failed") return null;
        const isReplaying = replayingIds.has(event.id);
        return (
          <button
            onClick={(e) => { e.stopPropagation(); onReplay(event); }}
            disabled={isReplaying}
            title="Retry event"
            className="flex items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 p-1 text-amber-400 transition-all hover:bg-amber-500/20 disabled:opacity-50"
          >
            {isReplaying ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RotateCcw className="h-3 w-3" />
            )}
          </button>
        );
      },
    },
  ];
}

export default function EventsListPanel() {
  const events = useEventStore((s) => s.events);
  const eventsLoading = useEventStore((s) => s.eventsLoading);
  const fetchEvents = useEventStore((s) => s.fetchEvents);
  const replayEvent = useEventStore((s) => s.replayEvent);
  const replayEvents = useEventStore((s) => s.replayEvents);
  const replayingIds = useEventStore((s) => s.replayingIds);
  const retryCounts = useEventStore((s) => s.retryCounts);
  const personas = usePersonaStore((s) => s.personas);
  const [filter, setFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRetrying, setBulkRetrying] = useState(false);

  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [sourceTypeFilter, setSourceTypeFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_EVENTS);

  const uniqueSourceTypes = useMemo(
    () => [...new Set(events.map((e) => e.sourceType))].sort(),
    [events],
  );

  const hasActiveFilters = query !== "" || eventTypeFilter !== "" || sourceTypeFilter !== "";

  const [activeChain, setActiveChain] = useState<Set<string> | null>(null);

  const personaMap = useMemo(
    () => new Map(personas.map((p) => [p.id, p])),
    [personas],
  );

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  useEventStream();

  // Pre-compute search index: only rebuilds when events change, not on every keystroke
  const searchIndex = useMemo(() => {
    const index = new Map<string, string>();
    for (const e of events) {
      index.set(e.id, [
        e.eventType,
        e.sourceType,
        e.sourceId ?? "",
        e.payload ?? "",
        e.errorMessage ?? "",
      ].join(" ").toLowerCase());
    }
    return index;
  }, [events]);

  const filtered = useMemo(() => {
    const q = deferredQuery.toLowerCase().trim();
    return events.filter((e) => {
      if (filter === "dead_letter") {
        if (e.status !== "failed" || !e.errorMessage) return false;
      } else if (filter !== "all" && e.status !== filter) return false;
      if (eventTypeFilter && e.eventType !== eventTypeFilter) return false;
      if (sourceTypeFilter && e.sourceType !== sourceTypeFilter) return false;
      if (q && !searchIndex.get(e.id)!.includes(q)) return false;
      return true;
    });
  }, [events, filter, eventTypeFilter, sourceTypeFilter, deferredQuery, searchIndex]);

  const visibleEvents = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  const chainMap = useEventTopology(visibleEvents);

  const counts = useMemo(() => {
    const c = { all: events.length, pending: 0, processed: 0, failed: 0, dead_letter: 0 };
    for (const e of events) {
      if (e.status === "pending") c.pending++;
      else if (e.status === "processed") c.processed++;
      else if (e.status === "failed") c.failed++;
      if (e.status === "failed" && e.errorMessage) c.dead_letter++;
    }
    return c;
  }, [events]);

  const uniqueEventTypes = useMemo(
    () => [...new Set(events.map((e) => e.eventType))].sort(),
    [events],
  );

  const handleReplay = useCallback((event: PersonaEvent) => {
    void replayEvent(event);
  }, [replayEvent]);

  const toggleSelectEvent = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkRetry = useCallback(async () => {
    const selected = events.filter((e) => selectedIds.has(e.id) && e.status === "failed");
    if (selected.length === 0) return;
    setBulkRetrying(true);
    await replayEvents(selected);
    setSelectedIds(new Set());
    setBulkRetrying(false);
  }, [events, selectedIds, replayEvents]);

  useEffect(() => {
    queueMicrotask(() => setSelectedIds(new Set()));
  }, [filter]);

  useEffect(() => {
    queueMicrotask(() => setVisibleCount(INITIAL_VISIBLE_EVENTS));
  }, [filter, query, eventTypeFilter, sourceTypeFilter]);

  const columns = useMemo(
    () => buildColumns(personaMap, chainMap, activeChain, setActiveChain, replayingIds, retryCounts, handleReplay, selectedIds, toggleSelectEvent),
    [personaMap, chainMap, activeChain, replayingIds, retryCounts, handleReplay, selectedIds, toggleSelectEvent],
  );

  const expandableRenderer = useCallback(
    (event: PersonaEvent) => <EventExpandedContent event={event} />,
    [],
  );

  const rowClassName = useCallback(
    (event: PersonaEvent) => {
      const isInActiveChain = activeChain?.has(event.id) ?? false;
      const isDimmed = activeChain !== null && !isInActiveChain;
      return [
        isInActiveChain ? "bg-brand-cyan/[0.04]" : "",
        isDimmed ? "opacity-30" : "",
      ].filter(Boolean).join(" ");
    },
    [activeChain],
  );

  return (
    <>
      {/* Search bar */}
      <motion.div variants={fadeUp} className="mb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-dark/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search payloads, event types, sources, errors..."
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2 pl-9 pr-9 text-base text-foreground placeholder:text-muted-dark/40 transition-colors focus:border-brand-cyan/30 focus:outline-none focus:ring-1 focus:ring-brand-cyan/20"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-dark/50 transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <FilterBar
            options={[
              { key: "all", label: "All", count: counts.all },
              { key: "pending", label: "Pending", count: counts.pending },
              { key: "processed", label: "Processed", count: counts.processed },
              { key: "failed", label: "Failed", count: counts.failed },
              { key: "dead_letter", label: "Dead Letter", count: counts.dead_letter },
            ]}
            active={filter}
            onChange={setFilter}
          />
        </div>

        <DropdownFilter
          label="Event type"
          value={eventTypeFilter}
          options={uniqueEventTypes}
          onChange={setEventTypeFilter}
        />

        <DropdownFilter
          label="Source type"
          value={sourceTypeFilter}
          options={uniqueSourceTypes}
          onChange={setSourceTypeFilter}
        />

        {hasActiveFilters && (
          <button
            onClick={() => { setQuery(""); setEventTypeFilter(""); setSourceTypeFilter(""); setFilter("all"); }}
            className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-sm text-muted-dark transition-colors hover:border-white/[0.12] hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}

        {activeChain && (
          <button
            onClick={() => setActiveChain(null)}
            className="flex items-center gap-1 rounded-lg border border-brand-cyan/20 bg-brand-cyan/5 px-2.5 py-1.5 text-sm text-brand-cyan transition-colors hover:border-brand-cyan/30 hover:bg-brand-cyan/10"
          >
            <Link2 className="h-3 w-3" />
            Chain: {activeChain.size} events
            <X className="h-3 w-3 ml-0.5" />
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {hasActiveFilters && (
            <span className="text-sm text-muted-dark tabular-nums">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
          {eventsLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-dark" />
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <DataTable<PersonaEvent>
          columns={columns}
          data={visibleEvents}
          keyExtractor={(e) => e.id}
          expandable={expandableRenderer}
          rowClassName={rowClassName}
          emptyState={
            filter === "dead_letter" ? (
              <EmptyState
                icon={Inbox}
                title="No dead letters"
                description="Failed events with errors will appear here for retry"
              />
            ) : (
              <EmptyState
                icon={Radio}
                title={hasActiveFilters ? "No matching events" : "No events"}
                description={hasActiveFilters ? "Try adjusting your search or filters" : "Events will appear here as agents process triggers and subscriptions"}
              />
            )
          }
        />
      </motion.div>

      {filtered.length > visibleEvents.length && (
        <motion.div variants={fadeUp} className="mt-3 flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              setVisibleCount((prev) => Math.min(filtered.length, prev + EVENTS_LOAD_STEP));
            }}
            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-muted transition-colors hover:border-white/[0.14] hover:text-foreground"
          >
            Load more events ({visibleEvents.length}/{filtered.length})
          </button>
        </motion.div>
      )}

      {/* Bulk retry bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-background/95 backdrop-blur-xl pb-safe"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="text-base text-foreground">
                  {selectedIds.size} failed event{selectedIds.size !== 1 ? "s" : ""} selected
                </span>
                <button
                  onClick={() => {
                    const failedIds = new Set(visibleEvents.filter((e) => e.status === "failed").map((e) => e.id));
                    setSelectedIds(failedIds);
                  }}
                  className="text-sm text-brand-cyan hover:underline"
                >
                  Select all failed
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-sm text-muted-dark hover:text-muted"
                >
                  Clear
                </button>
              </div>
              <button
                onClick={() => void handleBulkRetry()}
                disabled={bulkRetrying}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition-all hover:bg-amber-500/20 disabled:opacity-50"
              >
                {bulkRetrying ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
                Retry All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
