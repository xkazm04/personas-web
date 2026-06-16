import { motion } from "framer-motion";
import { SVGFocusRingCircle } from "@/components/SVGFocusRing";
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
  // Larger, more legible nodes — diameter scales 28→58px with confidence.
  const size = 28 + pattern.confidence * 30;
  const iconPx = Math.round(size * 0.42);
  const label =
    pattern.patternKey.length > 16
      ? `${pattern.patternKey.slice(0, 14)}…`
      : pattern.patternKey;

  return (
    <motion.g
      role="button"
      tabIndex={0}
      aria-label={pattern.patternKey}
      aria-pressed={isSelected}
      className="svg-focus-parent focus-visible:outline-none"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: isDimmed ? 0.25 : 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ cursor: "pointer" }}
      onClick={() => onSelect(pattern)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(pattern);
        }
      }}
      onMouseEnter={() => onHover(pattern)}
      onMouseLeave={onLeave}
    >
      <SVGFocusRingCircle cx={position.x} cy={position.y} r={size / 2 + 4} strokeWidth={2} />
      {(isSelected || isHighlighted) && <circle cx={position.x} cy={position.y} r={size / 2 + 7} fill="none" stroke={config.color} strokeWidth={2} opacity={0.45} />}
      <circle cx={position.x} cy={position.y} r={size / 2} fill={`${config.color}33`} stroke={isSelected ? config.color : `${config.color}66`} strokeWidth={isSelected ? 2.5 : 1.5} />
      <foreignObject x={position.x - iconPx / 2} y={position.y - iconPx / 2} width={iconPx} height={iconPx} style={{ overflow: "visible" }}>
        <div className="flex items-center justify-center" style={{ width: iconPx, height: iconPx }}>
          <Icon size={Math.round(iconPx * 0.72)} className={config.textColor} />
        </div>
      </foreignObject>
      <text
        x={position.x}
        y={position.y + size / 2 + 18}
        textAnchor="middle"
        className="fill-current text-base font-medium text-foreground/80"
        style={{ paintOrder: "stroke", stroke: "var(--background)", strokeWidth: "3px", strokeLinejoin: "round" }}
      >
        {label}
      </text>
    </motion.g>
  );
}
