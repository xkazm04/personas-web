"use client";

import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { SWARM_PERSONAS, type SwarmNode } from "@/lib/mock-dashboard-data";
import { busTopology } from "@/lib/busProjection";
import { useNow } from "@/hooks/useNow";
import { useEventStore } from "@/stores/eventStore";
import { useTranslation } from "@/i18n/useTranslation";
import { EventBusDefs } from "./event-bus-visualization/EventBusDefs";
import { EventBusHub } from "./event-bus-visualization/EventBusHub";
import { EventBusPersonaNodes, EventBusSourceNodes } from "./event-bus-visualization/EventBusNodes";
import { EventBusParticles } from "./event-bus-visualization/EventBusParticles";
import { EventBusStaticRings } from "./event-bus-visualization/EventBusStaticRings";
import { CX, PERSONA_RADIUS, SOURCE_RADIUS, nodePosition } from "./event-bus-visualization/eventBusGeometry";
import { useEventBusParticles } from "./event-bus-visualization/useEventBusParticles";

export interface EventBusVisualizationProps {
  className?: string;
  onNodeClick?: (node: SwarmNode) => void;
}

export default function EventBusVisualization({ className = "", onNodeClick }: EventBusVisualizationProps) {
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const personaPositions = useMemo(() => SWARM_PERSONAS.map((_, index) => nodePosition(index, SWARM_PERSONAS.length, PERSONA_RADIUS)), []);
  // The ring is a projection of the event log: one node per source type seen.
  const events = useEventStore((s) => s.events);
  const now = useNow(30_000);
  const sources = useMemo(() => busTopology(events, now), [events, now]);
  const sourcePositions = useMemo(() => sources.map((_, index) => nodePosition(index, sources.length, SOURCE_RADIUS)), [sources]);
  const sourceNodes = useMemo<SwarmNode[]>(
    () => sources.map((source) => ({ id: source.id, label: source.label, type: "source", color: source.color, volume: source.volume })),
    [sources],
  );
  const { particles, bursts, tick, inViewRef, rafRef, lastTimeRef } = useEventBusParticles({
    prefersReduced,
    events,
    sources,
    sourcePositions,
    personaPositions,
  });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const io = new IntersectionObserver(([entry]) => {
      const wasInView = inViewRef.current;
      inViewRef.current = entry.isIntersecting;
      if (entry.isIntersecting && !wasInView && !prefersReduced && !document.hidden) {
        // The hook owns the visibility half of the guard; scrolling into view
        // while the tab is hidden must not start a loop that would immediately
        // stop itself, and any existing handle is released before re-arming.
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        lastTimeRef.current = 0;
        rafRef.current = requestAnimationFrame(tick);
      }
    }, { threshold: 0.05 });
    io.observe(svg);
    return () => io.disconnect();
  }, [prefersReduced, tick, inViewRef, lastTimeRef, rafRef]);

  return (
    <svg ref={svgRef} viewBox="0 0 500 500" className={`w-full max-w-[560px] mx-auto select-none ${className}`} style={{ filter: "drop-shadow(0 0 60px rgba(6,182,212,0.06))" }}>
      <EventBusDefs />
      <EventBusStaticRings sourcePositions={sourcePositions} personaPositions={personaPositions} />
      <EventBusHub prefersReduced={prefersReduced} />
      <EventBusSourceNodes sources={sourceNodes} sourcePositions={sourcePositions} onNodeClick={onNodeClick} />
      <EventBusPersonaNodes personaPositions={personaPositions} prefersReduced={prefersReduced} onNodeClick={onNodeClick} />
      <EventBusParticles particles={particles} bursts={bursts} prefersReduced={prefersReduced} />
      {sources.length === 0 && (
        <text x={CX} y={CX + 55} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="system-ui, sans-serif">
          {t.eventsPage.noEvents}
        </text>
      )}
      {prefersReduced && sources.length > 0 && (
        <text x={CX} y={CX + 55} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="system-ui, sans-serif">
          {t.dashboardUi.eventAnimationPaused}
        </text>
      )}
    </svg>
  );
}
