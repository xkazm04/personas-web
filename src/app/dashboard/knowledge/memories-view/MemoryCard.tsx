import { AlertTriangle } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";
import { relativeTime } from "@/lib/format";
import type { MemoryItem } from "@/lib/mock-dashboard-data";

import { ScoreDots } from "./ScoreDots";
import { statusConfig, typeConfig } from "./memoryViewConfig";

export function MemoryCard({ item }: { item: MemoryItem }) {
  const { t } = useTranslation();
  const { Icon, tone } = typeConfig[item.type];
  const status = statusConfig[item.status];
  const usesLabel = t.memoriesPage.uses.replace("{n}", String(item.usageCount));

  return (
    <div
      className="rounded-xl border border-glass bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]"
      style={{ contentVisibility: "auto", containIntrinsicSize: "120px" }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${tone}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {item.title}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-sm font-medium ${status.pill}`}
            >
              {t.memoriesPage.status[status.label]}
            </span>
            {item.hasConflict && (
              <span className="flex items-center gap-1 rounded-full border border-rose-500/25 bg-rose-500/8 px-2 py-0.5 text-sm font-medium text-rose-400">
                <AlertTriangle className="h-3 w-3" />
                {t.dashboardUi.conflict}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm leading-relaxed text-muted-dark line-clamp-2">
            {item.description}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-dark">
            <span className="rounded-md border border-glass bg-white/[0.03] px-1.5 py-0.5 font-medium">
              {item.persona}
            </span>
            <ScoreDots score={item.score} type={item.type} />
            <span className="tabular-nums">{usesLabel}</span>
            <span aria-hidden>-</span>
            <span>{relativeTime(item.lastUsed)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
