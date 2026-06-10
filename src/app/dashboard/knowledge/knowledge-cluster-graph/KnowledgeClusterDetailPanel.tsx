import { motion } from "framer-motion";
import { Clock, X } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { KnowledgePattern } from "@/lib/mock-dashboard-data";
import { formatCost, formatDuration, relativeTime } from "@/lib/format";
import { KNOWLEDGE_CLUSTER_TYPE_CONFIG } from "./knowledgeClusterConfig";
import { knowledgeClusterSuccessRate } from "./knowledgeClusterLayout";

export function KnowledgeClusterDetailPanel({
  pattern,
  onClose,
}: {
  pattern: KnowledgePattern;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const config = KNOWLEDGE_CLUSTER_TYPE_CONFIG[pattern.knowledgeType];
  const Icon = config.icon;
  const rate = knowledgeClusterSuccessRate(pattern);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} className="absolute right-3 top-3 z-50 w-72 rounded-xl border border-glass-hover bg-background/95 backdrop-blur-xl p-4 shadow-2xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${config.bgClass}`}>
            <Icon className={`h-3.5 w-3.5 ${config.textColor}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{pattern.patternKey}</p>
            <p className="text-sm text-muted-dark">{pattern.personaName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label={t.common.close}
          className="p-1 rounded-md hover:bg-white/[0.06] transition-colors focus-ring focus-visible:ring-offset-0"
        >
          <X className="h-3.5 w-3.5 text-muted-dark" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <DetailStat label={t.knowledgePage.success} value={pattern.successCount} tone="text-emerald-400" />
        <DetailStat label={t.knowledgePage.failures} value={pattern.failureCount} tone="text-rose-400" />
        <DetailStat label={t.knowledgePage.rate} value={`${(rate * 100).toFixed(1)}%`} />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <DetailStat label={t.knowledgePage.cost} value={formatCost(pattern.avgCostUsd)} small />
        <DetailStat label={t.knowledgePage.duration} value={formatDuration(pattern.avgDurationMs)} small />
        <DetailStat label={t.knowledgePage.confidence} value={`${Math.round(pattern.confidence * 100)}%`} tone={config.textColor} small />
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden mb-3">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: config.color }} initial={{ width: 0 }} animate={{ width: `${pattern.confidence * 100}%` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
      </div>
      <p className="text-sm leading-relaxed text-foreground/60">{pattern.description}</p>
      <div className="mt-2 flex items-center gap-1 text-sm text-muted-dark">
        <Clock className="h-2.5 w-2.5" />
        {t.knowledgePage.lastSeen} {relativeTime(pattern.lastSeen)}
      </div>
    </motion.div>
  );
}

function DetailStat({ label, value, tone = "text-foreground", small = false }: { label: string; value: string | number; tone?: string; small?: boolean }) {
  return (
    <div className="rounded-lg bg-white/[0.03] px-2 py-1.5 text-center">
      <p className="text-sm text-muted-dark uppercase tracking-wider">{label}</p>
      <p className={`${small ? "text-sm font-semibold" : "text-base font-bold"} tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
