import { motion } from "framer-motion";
import type { KnowledgePattern } from "@/lib/mock-dashboard-data";
import { KNOWLEDGE_CLUSTER_TYPE_CONFIG, type NodePosition } from "./knowledgeClusterConfig";

export function KnowledgeGraphNode({
  pattern,
  position,
  isSelected,
  isHighlighted,
  isDimmed,
  onSelect,
  onHover,
  onLeave,
}: {
  pattern: KnowledgePattern;
  position: NodePosition;
  isSelected: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  onSelect: (pattern: KnowledgePattern) => void;
  onHover: (pattern: KnowledgePattern) => void;
  onLeave: () => void;
}) {
  const config = KNOWLEDGE_CLUSTER_TYPE_CONFIG[pattern.knowledgeType];
  const Icon = config.icon;
  const size = 16 + pattern.confidence * 20;

  return (
    <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: isDimmed ? 0.25 : 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} style={{ cursor: "pointer" }} onClick={() => onSelect(pattern)} onMouseEnter={() => onHover(pattern)} onMouseLeave={onLeave}>
      {(isSelected || isHighlighted) && <circle cx={position.x} cy={position.y} r={size / 2 + 6} fill="none" stroke={config.color} strokeWidth={1.5} opacity={0.4} />}
      <circle cx={position.x} cy={position.y} r={size / 2} fill={`${config.color}20`} stroke={isSelected ? config.color : `${config.color}40`} strokeWidth={isSelected ? 2 : 1} />
      <foreignObject x={position.x - 6} y={position.y - 6} width={12} height={12} style={{ overflow: "visible" }}>
        <div className="flex items-center justify-center w-3 h-3">
          <Icon className={`w-3 h-3 ${config.textColor}`} />
        </div>
      </foreignObject>
      <text x={position.x} y={position.y + size / 2 + 12} textAnchor="middle" className="text-sm fill-current text-foreground/60" style={{ fontSize: "8px" }}>
        {pattern.patternKey.length > 18 ? `${pattern.patternKey.slice(0, 16)}...` : pattern.patternKey}
      </text>
    </motion.g>
  );
}
