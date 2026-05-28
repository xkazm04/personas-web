"use client";

import { motion } from "framer-motion";
import {
  SWIMLANE_WINDOW_MS,
  type SwarmNode,
  type SwimlaneEvent,
} from "@/lib/mock-dashboard-data";

export const statusColor: Record<SwimlaneEvent["status"], string> = {
  success: "#34d399",
  failure: "#f43f5e",
  processing: "#fbbf24",
};

interface SwimlaneLaneProps {
  persona: SwarmNode;
  events: SwimlaneEvent[];
  windowStart: number;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}

/** A single persona row: a dot per event positioned by time, plus a clamped hover tooltip. */
export default function SwimlaneLane({
  persona,
  events,
  windowStart,
  hoveredId,
  onHover,
}: SwimlaneLaneProps) {
  return (
    <div className="grid grid-cols-[8rem_1fr] items-center gap-3">
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
            ((ev.timestamp - windowStart) / SWIMLANE_WINDOW_MS) * 100;
          const isHovered = ev.id === hoveredId;
          return (
            <motion.button
              key={ev.id}
              type="button"
              onMouseEnter={() => onHover(ev.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(ev.id)}
              onBlur={() => onHover(null)}
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
            ((ev.timestamp - windowStart) / SWIMLANE_WINDOW_MS) * 100;
          // Slide the tooltip's anchor from left-aligned (pct 0) to
          // right-aligned (pct 100) so it never overflows the lane edges.
          return (
            <div
              className="pointer-events-none absolute -top-8 z-10 whitespace-nowrap rounded-md border border-glass bg-[#0a0f1a]/95 px-2 py-0.5 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm"
              style={{
                left: `${pct}%`,
                transform: `translateX(-${pct}%)`,
              }}
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
}
