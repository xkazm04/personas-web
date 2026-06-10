import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, Clock, DollarSign, X, XCircle, Zap } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { KnowledgePattern } from "@/lib/mock-dashboard-data";
import { KNOWLEDGE_TYPE_CONFIG } from "./knowledgeDenseConfig";
import { formatKnowledgeCost, formatKnowledgeDuration, knowledgeSuccessRate, relativeKnowledgeTime } from "./knowledgeDenseFormat";

export function KnowledgePatternDetailPanel({
  pattern,
  onClose,
}: {
  pattern: KnowledgePattern;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const config = KNOWLEDGE_TYPE_CONFIG[pattern.knowledgeType];
  const Icon = config.icon;
  const rate = knowledgeSuccessRate(pattern);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden border-t border-glass bg-white/[0.02] shrink-0"
    >
      <div className="p-3 flex items-start gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgClass}`}>
            <Icon className={`h-4 w-4 ${config.textColor}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{pattern.patternKey}</p>
            <p className="text-sm text-muted-dark">
              {pattern.personaName} / {t.knowledgePage.types[config.labelKey]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-sm flex-1">
          <DetailMetric icon={<CheckCircle2 className="h-3 w-3 text-emerald-400" />} value={pattern.successCount} label={t.knowledgePage.successLower} />
          <DetailMetric icon={<XCircle className="h-3 w-3 text-rose-400" />} value={pattern.failureCount} label={t.knowledgePage.failuresLower} />
          <DetailMetric icon={<BarChart3 className="h-3 w-3 text-cyan-400" />} value={`${(rate * 100).toFixed(1)}%`} label={t.knowledgePage.rateLower} />
          <DetailMetric icon={<DollarSign className="h-3 w-3 text-amber-400" />} value={formatKnowledgeCost(pattern.avgCostUsd)} />
          <DetailMetric icon={<Zap className="h-3 w-3 text-purple-400" />} value={formatKnowledgeDuration(pattern.avgDurationMs)} />
          <DetailMetric icon={<Clock className="h-3 w-3 text-muted-dark" />} value={relativeKnowledgeTime(pattern.lastSeen)} muted />
        </div>
        <div className="flex items-start gap-3 max-w-sm shrink-0">
          <p className="text-sm leading-relaxed text-foreground/60 line-clamp-2">{pattern.description}</p>
          <button
            onClick={onClose}
            aria-label={t.common.close}
            className="p-1 rounded-md hover:bg-white/[0.06] transition-colors shrink-0 focus-ring focus-visible:ring-offset-0"
          >
            <X className="h-3.5 w-3.5 text-muted-dark" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DetailMetric({ icon, value, label, muted = false }: { icon: React.ReactNode; value: number | string; label?: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className={`font-mono tabular-nums ${muted ? "text-muted-dark" : "text-foreground"}`}>{value}</span>
      {label && <span className="text-muted-dark">{label}</span>}
    </div>
  );
}
