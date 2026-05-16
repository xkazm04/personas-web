import { motion } from "framer-motion";
import type { KnowledgePattern } from "@/lib/mock-dashboard-data";
import { KNOWLEDGE_TYPE_CONFIG } from "./knowledgeDenseConfig";
import { formatKnowledgeCost, formatKnowledgeDuration, knowledgeConfidenceColor, knowledgeSuccessRate, relativeKnowledgeTime } from "./knowledgeDenseFormat";

export function KnowledgePatternRow({
  pattern,
  index,
  isSelected,
  onSelect,
}: {
  pattern: KnowledgePattern;
  index: number;
  isSelected: boolean;
  onSelect: (pattern: KnowledgePattern) => void;
}) {
  const config = KNOWLEDGE_TYPE_CONFIG[pattern.knowledgeType];
  const Icon = config.icon;
  const rate = knowledgeSuccessRate(pattern);
  const confPercent = Math.round(pattern.confidence * 100);
  const confColor = knowledgeConfidenceColor(pattern.confidence);

  return (
    <motion.button
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={() => onSelect(pattern)}
      className={`group flex items-center w-full text-left transition-all duration-150 ${index % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]"} ${isSelected ? "bg-white/[0.05] ring-1 ring-cyan-500/20" : "hover:bg-white/[0.04]"} border-b border-glass`}
    >
      <div className="w-16 flex justify-center px-2 py-2.5">
        <div className={`flex h-6 w-6 items-center justify-center rounded-md ${config.bgClass}`}>
          <Icon className={`h-3 w-3 ${config.textColor}`} />
        </div>
      </div>
      <div className="flex-1 min-w-[140px] px-2 py-2.5">
        <p className="text-sm font-medium text-foreground truncate">{pattern.patternKey}</p>
      </div>
      <div className="w-28 px-2 py-2.5">
        <p className="text-sm text-foreground/70 truncate">{pattern.personaName}</p>
      </div>
      <MetricCell width="w-18" tone="text-emerald-400" value={pattern.successCount} />
      <MetricCell width="w-16" tone="text-rose-400" value={pattern.failureCount} />
      <MetricCell width="w-16" tone="text-foreground" value={`${(rate * 100).toFixed(0)}%`} />
      <MetricCell width="w-18" tone="text-foreground/70" value={formatKnowledgeCost(pattern.avgCostUsd)} />
      <MetricCell width="w-20" tone="text-foreground/70" value={formatKnowledgeDuration(pattern.avgDurationMs)} />
      <div className="w-28 px-2 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[5px] rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${confPercent}%`, backgroundColor: confColor }} />
          </div>
          <span className="text-sm font-mono font-medium tabular-nums text-foreground/60 w-7 text-right">{confPercent}%</span>
        </div>
      </div>
      <div className="w-20 px-2 py-2.5 text-right">
        <span className="text-sm font-mono tabular-nums text-muted-dark">{relativeKnowledgeTime(pattern.lastSeen)}</span>
      </div>
    </motion.button>
  );
}

function MetricCell({ width, tone, value }: { width: string; tone: string; value: number | string }) {
  return (
    <div className={`${width} px-2 py-2.5 text-right`}>
      <span className={`text-sm font-mono font-medium tabular-nums ${tone}`}>{value}</span>
    </div>
  );
}
