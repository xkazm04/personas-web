import { useTranslation } from "@/i18n/useTranslation";
import { KNOWLEDGE_CLUSTER_TYPE_CONFIG, type KnowledgeType } from "./knowledgeClusterConfig";

export function KnowledgeClusterTopBar({
  stats,
  activeFilter,
  setActiveFilter,
  clearSelection,
}: {
  stats: { total: number; avgConfidence: number; personas: number; types: number };
  activeFilter: "all" | KnowledgeType;
  setActiveFilter: (filter: "all" | KnowledgeType) => void;
  clearSelection: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4 flex-wrap mb-3 shrink-0">
      <div className="flex items-center gap-4 text-sm mr-auto">
        <TopMetric label={t.knowledgePage.nodes} value={stats.total} />
        <Divider />
        <TopMetric label={t.knowledgePage.agents} value={stats.personas} tone="text-cyan-400" />
        <Divider />
        <TopMetric label={t.knowledgePage.clusters} value={stats.types} tone="text-purple-400" />
        <Divider />
        <TopMetric label={t.knowledgePage.avgConfidence} value={`${Math.round(stats.avgConfidence * 100)}%`} tone="text-emerald-400" />
      </div>
      <div className="flex items-center gap-1.5">
        <FilterButton active={activeFilter === "all"} onClick={() => { setActiveFilter("all"); clearSelection(); }}>
          {t.knowledgePage.all}
        </FilterButton>
        {(Object.keys(KNOWLEDGE_CLUSTER_TYPE_CONFIG) as KnowledgeType[]).map((type) => {
          const cfg = KNOWLEDGE_CLUSTER_TYPE_CONFIG[type];
          const Icon = cfg.icon;
          const label = t.knowledgePage.types[cfg.labelKey];
          return (
            <button
              key={type}
              onClick={() => {
                setActiveFilter(type);
                clearSelection();
              }}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium transition-all duration-200 ${activeFilter === type ? `${cfg.bgClass} ${cfg.textColor} ring-1 ring-white/[0.1]` : "text-muted-dark hover:text-foreground/70 hover:bg-white/[0.04]"}`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 ${active ? "bg-white/[0.1] text-foreground" : "text-muted-dark hover:text-foreground/70 hover:bg-white/[0.04]"}`}>
      {children}
    </button>
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
