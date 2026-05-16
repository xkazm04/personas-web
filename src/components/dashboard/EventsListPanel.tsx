"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Inbox, Radio } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import { fadeUp } from "@/lib/animations";
import type { PersonaEvent } from "@/lib/types";
import { useEventStream } from "@/hooks/useEventStream";
import { useEventTopology } from "@/hooks/useEventTopology";
import { useTranslation } from "@/i18n/useTranslation";
import { useEventStore } from "@/stores/eventStore";
import { usePersonaStore } from "@/stores/personaStore";
import { EventExpandedContent } from "./events-list-panel/EventExpandedContent";
import { EventsBulkRetryBar } from "./events-list-panel/EventsBulkRetryBar";
import { EventsFiltersToolbar } from "./events-list-panel/EventsFiltersToolbar";
import { DataTable, buildEventColumns } from "./events-list-panel/EventsListColumns";
import type { EventPanelLabels } from "./events-list-panel/eventPanelTypes";

const INITIAL_VISIBLE_EVENTS = 200;
const EVENTS_LOAD_STEP = 200;

export default function EventsListPanel() {
  const { t } = useTranslation();
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
  const [activeChain, setActiveChain] = useState<Set<string> | null>(null);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);
  useEventStream();

  const personaMap = useMemo(() => new Map(personas.map((persona) => [persona.id, persona])), [personas]);
  const uniqueSourceTypes = useMemo(() => [...new Set(events.map((event) => event.sourceType))].sort(), [events]);
  const uniqueEventTypes = useMemo(() => [...new Set(events.map((event) => event.eventType))].sort(), [events]);
  const hasActiveFilters = query !== "" || eventTypeFilter !== "" || sourceTypeFilter !== "";
  const searchIndex = useMemo(() => new Map(events.map((event) => [event.id, [event.eventType, event.sourceType, event.sourceId ?? "", event.payload ?? "", event.errorMessage ?? ""].join(" ").toLowerCase()])), [events]);
  const filtered = useMemo(() => {
    const q = deferredQuery.toLowerCase().trim();
    return events.filter((event) => {
      if (filter === "dead_letter") {
        if (event.status !== "failed" || !event.errorMessage) return false;
      } else if (filter !== "all" && event.status !== filter) return false;
      if (eventTypeFilter && event.eventType !== eventTypeFilter) return false;
      if (sourceTypeFilter && event.sourceType !== sourceTypeFilter) return false;
      return !(q && !searchIndex.get(event.id)!.includes(q));
    });
  }, [events, filter, eventTypeFilter, sourceTypeFilter, deferredQuery, searchIndex]);
  const visibleEvents = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const chainMap = useEventTopology(visibleEvents);
  const counts = useEventCounts(events);

  const handleReplay = useCallback((event: PersonaEvent) => void replayEvent(event), [replayEvent]);
  const toggleSelectEvent = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const handleBulkRetry = useCallback(async () => {
    const selected = events.filter((event) => selectedIds.has(event.id) && event.status === "failed");
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
    () => buildEventColumns(t, personaMap, chainMap, activeChain, setActiveChain, replayingIds, retryCounts, handleReplay, selectedIds, toggleSelectEvent),
    [t, personaMap, chainMap, activeChain, replayingIds, retryCounts, handleReplay, selectedIds, toggleSelectEvent],
  );
  const rowClassName = useCallback(
    (event: PersonaEvent) => [activeChain?.has(event.id) ? "bg-brand-cyan/[0.04]" : "", activeChain !== null && !activeChain.has(event.id) ? "opacity-30" : ""].filter(Boolean).join(" "),
    [activeChain],
  );

  return (
    <>
      <EventsFiltersToolbar
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        counts={counts}
        eventTypeFilter={eventTypeFilter}
        setEventTypeFilter={setEventTypeFilter}
        sourceTypeFilter={sourceTypeFilter}
        setSourceTypeFilter={setSourceTypeFilter}
        uniqueEventTypes={uniqueEventTypes}
        uniqueSourceTypes={uniqueSourceTypes}
        hasActiveFilters={hasActiveFilters}
        activeChain={activeChain}
        clearActiveChain={() => setActiveChain(null)}
        filteredCount={filtered.length}
        eventsLoading={eventsLoading}
        labels={t}
      />
      <motion.div variants={fadeUp}>
        <DataTable<PersonaEvent> columns={columns} data={visibleEvents} keyExtractor={(event) => event.id} expandable={(event) => <EventExpandedContent event={event} />} rowClassName={rowClassName} emptyState={<EventsEmptyState filter={filter} hasActiveFilters={hasActiveFilters} labels={t} />} />
      </motion.div>
      {filtered.length > visibleEvents.length && (
        <motion.div variants={fadeUp} className="mt-3 flex items-center justify-center">
          <button type="button" onClick={() => setVisibleCount((prev) => Math.min(filtered.length, prev + EVENTS_LOAD_STEP))} className="rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm text-muted transition-colors hover:border-glass-strong hover:text-foreground">
            {t.eventsPage.loadMore} ({visibleEvents.length}/{filtered.length})
          </button>
        </motion.div>
      )}
      <EventsBulkRetryBar selectedIds={selectedIds} visibleEvents={visibleEvents} setSelectedIds={setSelectedIds} bulkRetrying={bulkRetrying} onBulkRetry={() => void handleBulkRetry()} labels={t} />
    </>
  );
}

function useEventCounts(events: PersonaEvent[]) {
  return useMemo(() => {
    const counts = { all: events.length, pending: 0, processed: 0, failed: 0, dead_letter: 0 };
    for (const event of events) {
      if (event.status === "pending") counts.pending++;
      else if (event.status === "processed") counts.processed++;
      else if (event.status === "failed") counts.failed++;
      if (event.status === "failed" && event.errorMessage) counts.dead_letter++;
    }
    return counts;
  }, [events]);
}

function EventsEmptyState({ filter, hasActiveFilters, labels }: { filter: string; hasActiveFilters: boolean; labels: EventPanelLabels }) {
  if (filter === "dead_letter") {
    return <EmptyState icon={Inbox} title={labels.eventsPage.noDeadLetters} description={labels.eventsPage.noDeadLettersDescription} />;
  }
  return (
    <EmptyState
      icon={Radio}
      title={hasActiveFilters ? labels.eventsPage.noMatchingEvents : labels.eventsPage.noEvents}
      description={hasActiveFilters ? labels.eventsPage.noMatchingEventsDescription : labels.eventsPage.noEventsDescription}
    />
  );
}
