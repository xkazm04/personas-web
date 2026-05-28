"use client";

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import StalenessIndicator from "./StalenessIndicator";
import SwimlaneLane, { statusColor } from "./SwimlaneLane";
import {
  MOCK_SWIMLANE_EVENTS,
  SWARM_PERSONAS,
  SWIMLANE_WINDOW_MS,
  type SwimlaneEvent,
} from "@/lib/mock-dashboard-data";
import { useTranslation } from "@/i18n/useTranslation";

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
          {/* Axis — ticks at exact percentage offsets matching the dot math */}
          <div className="mb-2 grid grid-cols-[8rem_1fr] gap-3">
            <div aria-hidden />
            <div className="relative h-5 text-sm text-muted-dark">
              {axisTicks.map((tick) => {
                const mins = Math.round(
                  ((1 - tick) * SWIMLANE_WINDOW_MS) / 60_000,
                );
                return (
                  <span
                    key={tick}
                    className="absolute top-0 whitespace-nowrap tabular-nums"
                    style={{
                      left: `${tick * 100}%`,
                      transform: `translateX(-${tick * 100}%)`,
                    }}
                  >
                    {mins === 0 ? "now" : `-${mins}m`}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Lanes with aligned vertical gridlines */}
          <div className="relative">
            {/* Faint full-height gridlines, one per axis tick, behind every lane */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 grid grid-cols-[8rem_1fr] gap-3"
            >
              <div />
              <div className="relative">
                {axisTicks.map((tick) => (
                  <div
                    key={tick}
                    className="absolute inset-y-0 w-px bg-white/[0.06]"
                    style={{ left: `${tick * 100}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="relative space-y-2">
              {SWARM_PERSONAS.map((persona) => (
                <SwimlaneLane
                  key={persona.id}
                  persona={persona}
                  events={eventsByPersona.get(persona.id) ?? []}
                  windowStart={windowStart}
                  hoveredId={hoveredId}
                  onHover={setHoveredId}
                />
              ))}
            </div>
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
