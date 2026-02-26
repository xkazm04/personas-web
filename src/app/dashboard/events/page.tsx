"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import FilterBar from "@/components/dashboard/FilterBar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import EmptyState from "@/components/dashboard/EmptyState";
import { useDashboardStore } from "@/stores/dashboardStore";
import { usePolling } from "@/hooks/usePolling";
import type { PersonaEvent } from "@/lib/types";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  processed: CheckCircle2,
  completed: CheckCircle2,
  failed: AlertCircle,
};

function formatPayload(payload: string | null): string {
  if (!payload) return "{}";
  try {
    return JSON.stringify(JSON.parse(payload), null, 2);
  } catch {
    return payload;
  }
}

function EventRow({
  event,
  isNew,
}: {
  event: PersonaEvent;
  isNew: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const personas = useDashboardStore((s) => s.personas);
  const persona = personas.find((p) => p.id === event.targetPersonaId);
  const StatusIcon = statusIcons[event.status] ?? Clock;

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, y: -12, scale: 0.97 } : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        isNew
          ? { type: "spring", damping: 20, stiffness: 300 }
          : { duration: 0.2 }
      }
      className="border-b border-white/[0.04] last:border-0"
    >
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
        onClick={() => setExpanded(!expanded)}
      >
        <StatusIcon
          className={`h-4 w-4 flex-shrink-0 ${
            event.status === "failed"
              ? "text-red-400"
              : event.status === "pending"
                ? "text-amber-400"
                : "text-emerald-400"
          }`}
        />

        {persona ? (
          <PersonaAvatar
            icon={persona.icon}
            color={persona.color}
            name={persona.name}
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04]">
            <Radio className="h-3.5 w-3.5 text-muted-dark" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] font-mono text-muted">
            {event.eventType}
          </span>
        </div>

        <span className="text-xs text-muted-dark">{event.sourceType}</span>
        <StatusBadge status={event.status} />
        <span className="w-16 text-right text-xs text-muted-dark">
          {relativeTime(event.createdAt)}
        </span>

        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-dark transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4">
              {/* Metadata */}
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-dark">
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

              {/* Payload */}
              <div className="max-h-60 overflow-auto rounded-xl bg-black/40 p-4">
                <pre className="font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap break-all">
                  {formatPayload(event.payload)}
                </pre>
              </div>

              {/* Error */}
              {event.errorMessage && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                  {event.errorMessage}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function EventsPage() {
  const events = useDashboardStore((s) => s.events);
  const eventsLoading = useDashboardStore((s) => s.eventsLoading);
  const fetchEvents = useDashboardStore((s) => s.fetchEvents);
  const [filter, setFilter] = useState("all");
  const [knownIds] = useState(() => new Set<string>());

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  // Poll every 10s
  usePolling(fetchEvents, 10_000, true);

  // Track new events for animation
  useEffect(() => {
    events.forEach((e) => knownIds.add(e.id));
  }, [events, knownIds]);

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.status === filter);
  }, [events, filter]);

  const counts = useMemo(() => {
    const c = { all: events.length, pending: 0, processed: 0, failed: 0 };
    for (const e of events) {
      if (e.status === "pending") c.pending++;
      else if (e.status === "processed" || e.status === "completed") c.processed++;
      else if (e.status === "failed") c.failed++;
    }
    return c;
  }, [events]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText>Events</GradientText>
        </h1>
        <p className="mt-1 text-sm text-muted-dark">
          Event bus activity across all agents
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="mb-4 flex items-center justify-between">
        <FilterBar
          options={[
            { key: "all", label: "All", count: counts.all },
            { key: "pending", label: "Pending", count: counts.pending },
            { key: "processed", label: "Processed", count: counts.processed },
            { key: "failed", label: "Failed", count: counts.failed },
          ]}
          active={filter}
          onChange={setFilter}
        />
        {eventsLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-dark" />
        )}
      </motion.div>

      <motion.div variants={fadeUp}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="No events"
            description="Events will appear here as agents process triggers and subscriptions"
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            {filtered.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                isNew={!knownIds.has(event.id)}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
