"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { MOCK_KNOWLEDGE_PATTERNS, type KnowledgePattern } from "@/lib/mock-dashboard-data";
import { KnowledgeClusterDetailPanel } from "./knowledge-cluster-graph/KnowledgeClusterDetailPanel";
import { KnowledgeClusterLabels } from "./knowledge-cluster-graph/KnowledgeClusterLabels";
import { KnowledgeClusterLegends } from "./knowledge-cluster-graph/KnowledgeClusterLegends";
import { KnowledgeClusterSvg } from "./knowledge-cluster-graph/KnowledgeClusterSvg";
import { KnowledgeClusterTopBar } from "./knowledge-cluster-graph/KnowledgeClusterTopBar";
import type { KnowledgeType } from "./knowledge-cluster-graph/knowledgeClusterConfig";
import { computeKnowledgeEdges, computeKnowledgeNodePositions } from "./knowledge-cluster-graph/knowledgeClusterLayout";

export default function KnowledgeClusterGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [selectedPattern, setSelectedPattern] = useState<KnowledgePattern | null>(null);
  const [hoveredPattern, setHoveredPattern] = useState<KnowledgePattern | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | KnowledgeType>("all");

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

  const filteredPatterns = useMemo(() => {
    if (activeFilter === "all") return MOCK_KNOWLEDGE_PATTERNS;
    return MOCK_KNOWLEDGE_PATTERNS.filter((pattern) => pattern.knowledgeType === activeFilter);
  }, [activeFilter]);

  const nodePositions = useMemo(
    () => computeKnowledgeNodePositions(filteredPatterns, dimensions.width, dimensions.height),
    [filteredPatterns, dimensions],
  );
  const edges = useMemo(() => computeKnowledgeEdges(filteredPatterns), [filteredPatterns]);
  const highlightedIds = useMemo(() => {
    if (!hoveredPattern) return new Set<string>();
    return new Set(filteredPatterns.filter((pattern) => pattern.personaName === hoveredPattern.personaName).map((pattern) => pattern.id));
  }, [hoveredPattern, filteredPatterns]);
  const stats = useMemo(() => {
    const total = MOCK_KNOWLEDGE_PATTERNS.length;
    const avgConfidence = MOCK_KNOWLEDGE_PATTERNS.reduce((sum, pattern) => sum + pattern.confidence, 0) / total;
    const personas = new Set(MOCK_KNOWLEDGE_PATTERNS.map((pattern) => pattern.personaName)).size;
    const types = new Set(MOCK_KNOWLEDGE_PATTERNS.map((pattern) => pattern.knowledgeType)).size;
    return { total, avgConfidence, personas, types };
  }, []);

  const handleSelect = useCallback((pattern: KnowledgePattern) => {
    setSelectedPattern((prev) => (prev?.id === pattern.id ? null : pattern));
  }, []);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col h-[calc(100vh-10rem)]">
      <motion.div variants={fadeUp}>
        <KnowledgeClusterTopBar stats={stats} activeFilter={activeFilter} setActiveFilter={setActiveFilter} clearSelection={() => setSelectedPattern(null)} />
      </motion.div>
      <motion.div variants={fadeUp} className="relative flex-1 min-h-0 rounded-xl border border-glass bg-white/[0.01] overflow-hidden grid-texture" ref={containerRef}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in srgb, var(--brand-purple) 5%, transparent), transparent 80%)" }} />
        <KnowledgeClusterLabels activeFilter={activeFilter} width={dimensions.width} height={dimensions.height} />
        <KnowledgeClusterSvg
          width={dimensions.width}
          height={dimensions.height}
          edges={edges}
          nodePositions={nodePositions}
          patterns={filteredPatterns}
          selectedPattern={selectedPattern}
          hoveredPattern={hoveredPattern}
          highlightedIds={highlightedIds}
          onSelect={handleSelect}
          onHover={setHoveredPattern}
          onLeave={() => setHoveredPattern(null)}
        />
        <KnowledgeClusterLegends />
        <AnimatePresence>
          {selectedPattern && <KnowledgeClusterDetailPanel key={selectedPattern.id} pattern={selectedPattern} onClose={() => setSelectedPattern(null)} />}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
