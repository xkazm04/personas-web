"use client";

import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { SWARM_PERSONAS, SWARM_SOURCES, type SwarmNode } from "@/lib/mock-dashboard-data";
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
  triggerBurst?: number;
}

export default function EventBusVisualization({ className = "", onNodeClick, triggerBurst }: EventBusVisualizationProps) {
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const personaPositions = useMemo(() => SWARM_PERSONAS.map((_, index) => nodePosition(index, SWARM_PERSONAS.length, PERSONA_RADIUS)), []);
  const sourcePositions = useMemo(() => SWARM_SOURCES.map((_, index) => nodePosition(index, SWARM_SOURCES.length, SOURCE_RADIUS)), []);
  const { particles, bursts, tick, inViewRef, rafRef, lastTimeRef } = useEventBusParticles({
    prefersReduced,
    sourcePositions,
    personaPositions,
    triggerBurst,
  });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const io = new IntersectionObserver(([entry]) => {
      const wasInView = inViewRef.current;
      inViewRef.current = entry.isIntersecting;
      if (entry.isIntersecting && !wasInView && !prefersReduced) {
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
      <EventBusSourceNodes sourcePositions={sourcePositions} onNodeClick={onNodeClick} />
      <EventBusPersonaNodes personaPositions={personaPositions} prefersReduced={prefersReduced} onNodeClick={onNodeClick} />
      <EventBusParticles particles={particles} bursts={bursts} prefersReduced={prefersReduced} />
      {prefersReduced && (
        <text x={CX} y={CX + 55} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="system-ui, sans-serif">
          {t.dashboardUi.eventAnimationPaused}
        </text>
      )}
    </svg>
  );
}
