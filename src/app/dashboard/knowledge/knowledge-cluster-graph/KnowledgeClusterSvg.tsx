import { motion } from "framer-motion";
import type { KnowledgePattern } from "@/lib/mock-dashboard-data";
import { PERSONA_COLORS, type NodePosition } from "./knowledgeClusterConfig";
import { KnowledgeGraphNode } from "./KnowledgeGraphNode";

export function KnowledgeClusterSvg({
  width,
  height,
  edges,
  nodePositions,
  patterns,
  selectedPattern,
  hoveredPattern,
  highlightedIds,
  onSelect,
  onHover,
  onLeave,
}: {
  width: number;
  height: number;
  edges: { from: string; to: string; persona: string }[];
  nodePositions: Map<string, NodePosition>;
  patterns: KnowledgePattern[];
  selectedPattern: KnowledgePattern | null;
  hoveredPattern: KnowledgePattern | null;
  highlightedIds: Set<string>;
  onSelect: (pattern: KnowledgePattern) => void;
  onHover: (pattern: KnowledgePattern) => void;
  onLeave: () => void;
}) {
  return (
    <svg width={width} height={height} className="absolute inset-0">
      {edges.map((edge) => {
        const from = nodePositions.get(edge.from);
        const to = nodePositions.get(edge.to);
        if (!from || !to) return null;
        const personaColor = PERSONA_COLORS[edge.persona] ?? "#64748b";
        const isHovered = hoveredPattern && (hoveredPattern.id === edge.from || hoveredPattern.id === edge.to);

        return (
          <motion.line
            key={`${edge.from}-${edge.to}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={personaColor}
            strokeWidth={isHovered ? 1.5 : 0.5}
            opacity={hoveredPattern ? (isHovered ? 0.6 : 0.05) : 0.15}
            strokeDasharray={isHovered ? "none" : "4 4"}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
          />
        );
      })}
      {patterns.map((pattern) => {
        const position = nodePositions.get(pattern.id);
        if (!position) return null;
        const isDimmed = hoveredPattern !== null && !highlightedIds.has(pattern.id);

        return (
          <KnowledgeGraphNode
            key={pattern.id}
            pattern={pattern}
            position={position}
            isSelected={selectedPattern?.id === pattern.id}
            isHighlighted={highlightedIds.has(pattern.id)}
            isDimmed={isDimmed}
            onSelect={onSelect}
            onHover={onHover}
            onLeave={onLeave}
          />
        );
      })}
    </svg>
  );
}
