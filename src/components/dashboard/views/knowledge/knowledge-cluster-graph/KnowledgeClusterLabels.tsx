import { useTranslation } from "@/i18n/useTranslation";
import { KNOWLEDGE_CLUSTER_TYPE_CONFIG, type KnowledgeType } from "./knowledgeClusterConfig";

export function KnowledgeClusterLabels({
  activeFilter,
  width,
  height,
}: {
  activeFilter: "all" | KnowledgeType;
  width: number;
  height: number;
}) {
  const { t } = useTranslation();
  if (activeFilter !== "all") return null;

  return (
    <>
      {(Object.entries(KNOWLEDGE_CLUSTER_TYPE_CONFIG) as [KnowledgeType, (typeof KNOWLEDGE_CLUSTER_TYPE_CONFIG)[KnowledgeType]][]).map(([type, config]) => {
        const angle = (config.clusterAngle * Math.PI) / 180;
        const labelRadius = Math.min(width, height) * 0.32 + 60;
        const lx = width / 2 + Math.cos(angle) * labelRadius;
        const ly = height / 2 + Math.sin(angle) * labelRadius;

        return (
          <div key={type} className="absolute pointer-events-none" style={{ left: lx, top: ly, transform: "translate(-50%, -50%)" }}>
            <span className={`text-sm font-semibold uppercase tracking-wider ${config.textColor} opacity-40`}>
              {t.knowledgePage.types[config.labelKey]}
            </span>
          </div>
        );
      })}
    </>
  );
}
