"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { type KnowledgePattern } from "@/lib/mock-dashboard-data";
import { KnowledgeClusterDetailPanel } from "./KnowledgeClusterDetailPanel";
import { KnowledgeClusterLabels } from "./KnowledgeClusterLabels";
import { KnowledgeClusterLegends } from "./KnowledgeClusterLegends";
import { KnowledgeClusterSvg } from "./KnowledgeClusterSvg";
import type { KnowledgeType } from "./knowledgeClusterConfig";
import { computeKnowledgeEdges, computeKnowledgeNodePositions } from "./knowledgeClusterLayout";

/**
 * The cluster graph's T3 body: layout math, the SVG, cluster labels, legends
 * and the node detail panel. It is the code-split part of the Graph tab (the
 * top bar and the bordered frame around it paint with the tab, see
 * KnowledgeClusterGraph) and is mounted by the view's arrival queue. It fills
 * the frame (`absolute inset-0`) and measures itself, so the frame is the
 * height reservation.
 */
export default function KnowledgeClusterCanvas({
  patterns,
  activeFilter,
  selectedPattern,
  onSelect,
  onClose,
}: {
  /** Already narrowed by the active type filter. */
  patterns: KnowledgePattern[];
  activeFilter: "all" | KnowledgeType;
  selectedPattern: KnowledgePattern | null;
  onSelect: (pattern: KnowledgePattern) => void;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [hoveredPattern, setHoveredPattern] = useState<KnowledgePattern | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nodePositions = useMemo(
    () => computeKnowledgeNodePositions(patterns, dimensions.width, dimensions.height),
    [patterns, dimensions],
  );
  const edges = useMemo(() => computeKnowledgeEdges(patterns), [patterns]);
  const highlightedIds = useMemo(() => {
    if (!hoveredPattern) return new Set<string>();
    return new Set(patterns.filter((pattern) => pattern.personaName === hoveredPattern.personaName).map((pattern) => pattern.id));
  }, [hoveredPattern, patterns]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <KnowledgeClusterLabels activeFilter={activeFilter} width={dimensions.width} height={dimensions.height} />
      <KnowledgeClusterSvg
        width={dimensions.width}
        height={dimensions.height}
        edges={edges}
        nodePositions={nodePositions}
        patterns={patterns}
        selectedPattern={selectedPattern}
        hoveredPattern={hoveredPattern}
        highlightedIds={highlightedIds}
        onSelect={onSelect}
        onHover={setHoveredPattern}
        onLeave={() => setHoveredPattern(null)}
      />
      <KnowledgeClusterLegends />
      <AnimatePresence>
        {selectedPattern && <KnowledgeClusterDetailPanel key={selectedPattern.id} pattern={selectedPattern} onClose={onClose} />}
      </AnimatePresence>
    </div>
  );
}
