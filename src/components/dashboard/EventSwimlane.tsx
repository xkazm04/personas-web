"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import StalenessIndicator from "./StalenessIndicator";
import {
  MOCK_SWIMLANE_EVENTS,
  SWARM_PERSONAS,
  SWIMLANE_WINDOW_MS,
  type SwimlaneEvent,
} from "@/lib/mock-dashboard-data";
import { useTranslation } from "@/i18n/useTranslation";

const statusColor: Record<SwimlaneEvent["status"], string> = {
  success: "#34d399",
  failure: "#f43f5e",
  processing: "#fbbf24",
};

export default function EventSwimlane() {
  const { t } = useTranslation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [fetchedAt] = useState(() => Date.now());

  const windowStart = useMemo(
    () => fetchedAt - SWIMLANE_WINDOW_MS,
    [fetchedAt],
  );

  const eventsByPersona = useMemo(() => {
    const map = new Map<string, SwimlaneEvent[]>();
    for (const p of SWARM_PERSONAS) map.set(p.id, []);
    for (const ev of MOCK_SWIMLANE_EVENTS) {
      if (ev.timestamp < windowStart) continue;
      map.get(ev.personaId)?.push(ev);
    }
    return map;
  }, [windowStart]);

  const totalCount = Array.from(eventsByPersona.values()).reduce(
    (sum, evs) => sum + evs.length,
    0,
  );

  const axisTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="rounded-2xl border border-glass bg-white/[0.02] p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Activity className="h-4 w-4 text-brand-cyan" />
        <h2 className="text-base font-semibold text-foreground">
          {t.eventsPage.swimlane.title}
        </h2>
        <span className="text-sm text-muted-dark">
          · {t.eventsPage.swimlane.subtitle}
        </span>
        <StalenessIndicator fetchedAt={fetchedAt} className="ml-auto" />
      </div>

      {totalCount === 0 ? (
        <p className="py-8 text-center text-sm text-muted-dark">
          {t.eventsPage.swimlane.empty}
        </p>
      ) : (
        <div>
          {/* Axis */}
          <div className="mb-2 flex items-center gap-3 pl-32 text-sm text-muted-dark">
            {axisTicks.map((t) => {
              const mins = Math.round(
                ((1 - t) * SWIMLANE_WINDOW_MS) / 60_000,
              );
              return (
                <div
                  key={t}
                  className="flex-1 text-left first:text-left last:text-right"
                  style={{ flex: t === 1 ? "0 0 auto" : 1 }}
                >
                  {mins === 0 ? "now" : `-${mins}m`}
                </div>
              );
            })}
          </div>

          {/* Lanes */}
          <div className="space-y-2">
            {SWARM_PERSONAS.map((persona) => {
              const events = eventsByPersona.get(persona.id) ?? [];
              return (
                <div
                  key={persona.id}
                  className="grid grid-cols-[8rem_1fr] items-center gap-3"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <span
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: persona.color }}
                    />
                    <span className="truncate">{persona.label}</span>
                    <span className="ml-auto text-sm tabular-nums text-muted-dark">
                      {events.length}
                    </span>
                  </div>
                  <div
                    className="relative h-7 rounded-lg border border-glass bg-white/[0.02]"
                    role="list"
                  >
                    {events.map((ev) => {
                      const pct =
                        ((ev.timestamp - windowStart) / SWIMLANE_WINDOW_MS) *
                        100;
                      const isHovered = ev.id === hoveredId;
                      return (
                        <motion.button
                          key={ev.id}
                          type="button"
                          onMouseEnter={() => setHoveredId(ev.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onFocus={() => setHoveredId(ev.id)}
                          onBlur={() => setHoveredId(null)}
                          initial={{ opacity: 0, scale: 0.3 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.15 }}
                          aria-label={`${ev.eventType} at ${new Date(ev.timestamp).toLocaleTimeString()}`}
                          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-125 focus:scale-125 focus:outline-none"
                          style={{
                            left: `${pct}%`,
                            width: isHovered ? 10 : 7,
                            height: isHovered ? 10 : 7,
                            backgroundColor: statusColor[ev.status],
                            boxShadow: `0 0 4px ${statusColor[ev.status]}80`,
                          }}
                        />
                      );
                    })}
                    {hoveredId && events.some((e) => e.id === hoveredId) && (() => {
                      const ev = events.find((e) => e.id === hoveredId);
                      if (!ev) return null;
                      const pct =
                        ((ev.timestamp - windowStart) / SWIMLANE_WINDOW_MS) *
                        100;
                      return (
                        <div
                          className="pointer-events-none absolute -top-8 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-glass bg-[#0a0f1a]/95 px-2 py-0.5 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm"
                          style={{ left: `${pct}%` }}
                        >
                          {ev.eventType}
                          <span className="ml-1.5 text-muted-dark tabular-nums">
                            {new Date(ev.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-3 text-sm text-muted-dark">
            {(["success", "failure", "processing"] as SwimlaneEvent["status"][]).map(
              (s) => (
                <span key={s} className="flex items-center gap-1">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: statusColor[s] }}
                  />
                  {s}
                </span>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
