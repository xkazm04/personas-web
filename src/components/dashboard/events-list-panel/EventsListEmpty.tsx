"use client";

import { AlertTriangle, Inbox, Radio, RotateCw } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import DesktopUnsupportedNote from "@/components/dashboard/views/personas/phone/DesktopUnsupportedNote";
import ScopeEmpty from "@/components/dashboard/scope/ScopeEmpty";
import { useEventStore } from "@/stores/eventStore";
import type { EventPanelLabels } from "./eventPanelTypes";

/** Roughly the height of the EmptyState it stands in for, so arrival does not shift the page. */
const HELD_HEIGHT = "15rem";

/**
 * What the events table shows with no rows, in order: not served by this
 * plane; not read yet (a held block, no placeholder - the loading-tier rule);
 * the read failed (say so, offer a retry - never "no events"); the scope bar
 * emptied it; or a real empty bus / filter.
 */
export function EventsListEmpty({
  heldEvents,
  scopeEmpty,
  filter,
  hasActiveFilters,
  labels,
}: {
  /** Events the store holds before the scope bar narrows them. */
  heldEvents: number;
  scopeEmpty: boolean;
  filter: string;
  hasActiveFilters: boolean;
  labels: EventPanelLabels;
}) {
  const listNotServed = useEventStore((s) => s.listNotServed);
  const eventsSettled = useEventStore((s) => s.eventsSettled);
  const eventsError = useEventStore((s) => s.eventsError);
  const fetchEvents = useEventStore((s) => s.fetchEvents);

  if (listNotServed && heldEvents === 0) return <DesktopUnsupportedNote />;
  if (!eventsSettled && heldEvents === 0) {
    return (
      <div role="status" aria-busy="true" style={{ minHeight: HELD_HEIGHT }}>
        <span className="sr-only">{labels.common.loading}</span>
      </div>
    );
  }
  if (eventsError && heldEvents === 0) {
    return (
      <div role="alert">
        <EmptyState
          icon={AlertTriangle}
          title={labels.eventsPage.loadFailed}
          description={labels.eventsPage.loadFailedDescription}
          action={
            <button
              type="button"
              onClick={() => void fetchEvents()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-glass-hover px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.04] focus-ring"
            >
              <RotateCw aria-hidden className="h-3.5 w-3.5" />
              {labels.dashboardUi.retry}
            </button>
          }
        />
      </div>
    );
  }
  if (scopeEmpty) return <ScopeEmpty />;
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
