import type { KnowledgePattern } from "@/lib/mock-dashboard-data";
import { useTranslation } from "@/i18n/useTranslation";
import { KNOWLEDGE_TYPE_CONFIG } from "./knowledgeDenseConfig";
import type { KnowledgeType } from "./knowledgeDenseTypes";

export function KnowledgeDenseTopBar({
  stats,
  typeFilters,
  toggleTypeFilter,
  clearTypeFilters,
}: {
  stats: {
    total: number;
    avgConfidence: number;
    totalSuccess: number;
    totalFailure: number;
    avgCost: number;
  };
  typeFilters: Set<KnowledgeType>;
  toggleTypeFilter: (type: KnowledgeType) => void;
  clearTypeFilters: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4 flex-wrap mb-2 shrink-0">
      <div className="flex items-center gap-4 text-sm mr-auto">
        <TopMetric label={t.knowledgePage.patterns} value={stats.total} />
        <Divider />
        <TopMetric label={t.knowledgePage.avgConfidence} value={`${Math.round(stats.avgConfidence * 100)}%`} tone="text-cyan-400" />
        <Divider />
        <TopMetric label={t.knowledgePage.success} value={stats.totalSuccess.toLocaleString()} tone="text-emerald-400" />
        <Divider />
        <TopMetric label={t.knowledgePage.fails} value={stats.totalFailure.toLocaleString()} tone="text-rose-400" />
        <Divider />
        <TopMetric label={t.knowledgePage.avgCost} value={`$${stats.avgCost.toFixed(3)}`} />
      </div>
      <div className="flex items-center gap-1.5">
        {(Object.keys(KNOWLEDGE_TYPE_CONFIG) as KnowledgeType[]).map((type) => {
          const cfg = KNOWLEDGE_TYPE_CONFIG[type];
          const Icon = cfg.icon;
          const active = typeFilters.has(type);
          const label = t.knowledgePage.types[cfg.labelKey];
          return (
            <button
              key={type}
              onClick={() => toggleTypeFilter(type)}
              title={label}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium transition-all duration-200 ${active ? `${cfg.bgClass} ${cfg.textColor} ring-1 ring-white/[0.1]` : "text-muted-dark hover:text-foreground/70 hover:bg-white/[0.04]"}`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          );
        })}
        {typeFilters.size > 0 && (
          <button onClick={clearTypeFilters} className="text-sm text-muted-dark hover:text-foreground/70 px-2 py-1 transition-colors">
            {t.knowledgePage.clear}
          </button>
        )}
      </div>
    </div>
  );
}

function TopMetric({ label, value, tone = "text-foreground" }: { label: string; value: string | number; tone?: string }) {
  return (
    <span className="text-muted-dark">
      {label} <span className={`${tone} font-bold tabular-nums`}>{value}</span>
    </span>
  );
}

function Divider() {
  return <span className="text-white/[0.1]">|</span>;
}

export type KnowledgeStatsSource = KnowledgePattern[];
