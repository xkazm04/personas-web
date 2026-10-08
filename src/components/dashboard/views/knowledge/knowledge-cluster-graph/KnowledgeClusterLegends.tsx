import { useTranslation } from "@/i18n/useTranslation";
import { PERSONA_COLORS } from "./knowledgeClusterConfig";

export function KnowledgeClusterLegends() {
  const { t } = useTranslation();

  return (
    <>
      <div className="absolute left-3 bottom-3 flex items-center gap-3 bg-background/80 backdrop-blur-sm rounded-lg border border-glass px-3 py-2">
        <span className="text-sm text-muted-dark uppercase tracking-wider font-semibold">{t.knowledgePage.agentLinks}</span>
        {Object.entries(PERSONA_COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-sm text-foreground/60">{name}</span>
          </div>
        ))}
      </div>
      <div className="absolute left-3 top-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg border border-glass px-3 py-2">
        <span className="text-sm text-muted-dark uppercase tracking-wider font-semibold">{t.knowledgePage.nodeSize}</span>
        <span className="text-sm text-foreground/60">{t.knowledgePage.confidenceLegend}</span>
        <SizeLegend radius={3} label={t.knowledgePage.low} />
        <SizeLegend radius={6} label={t.knowledgePage.high} />
      </div>
    </>
  );
}

function SizeLegend({ radius, label }: { radius: number; label: string }) {
  const size = radius * 2 + 2;
  return (
    <div className="flex items-center gap-1 ml-2">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="white" opacity={0.15} />
      </svg>
      <span className="text-sm text-foreground/60">{label}</span>
    </div>
  );
}
