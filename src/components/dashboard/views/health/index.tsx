"use client";

import { useMemo, useState } from "react";
import { CloudOff, HeartPulse } from "lucide-react";

import GradientText from "@/components/GradientText";
import ExecuteToast from "@/components/dashboard/ExecuteToast";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import EmptyState from "@/components/dashboard/EmptyState";
import { ARRIVE, arrive, arriveAt } from "@/components/dashboard/arrival/arrive";
import { useTranslation } from "@/i18n/useTranslation";
import { HEALTH_SECTION_ORDER, type HealthCheckItem, type HealthCheckSection } from "@/lib/mock-dashboard-data";
import { DiskUsageBar } from "./health-page/DiskUsageBar";
import { applyHealthResolutions, resolveHealthAction, type HealthResolutions } from "./health-page/healthActions";
import { HealthSectionCard } from "./health-page/HealthSectionCard";
import { useSystemHealth } from "./health-page/useSystemHealth";

/**
 * System Health Panel — runtime / services / resources / integrations status
 * cards with status dots, a disk-usage gauge, and illustrative install/
 * configure actions (the row settles to ok in-session, plus a toast - see
 * health-page/healthActions.ts). Mirrors the desktop overview's System Health
 * Panel; demo-only — a real (non-demo) session sees an empty state instead.
 */
export default function HealthPage() {
  const { t } = useTranslation();
  const labels = t.healthPage;
  const { sections: fetched, diskUsage, isLoading, error, retry, liveUnavailable } = useSystemHealth();
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [resolutions, setResolutions] = useState<HealthResolutions>({});
  const sections = useMemo(
    () =>
      applyHealthResolutions(fetched, resolutions, {
        configure: labels.toast.configured,
        install: labels.toast.installed,
      }),
    [fetched, resolutions, labels.toast.configured, labels.toast.installed],
  );

  // A cold load with nothing held paints the four card chromes (T1) from the
  // fixed section order, with ghost rows as the T2 placeholder. The cards are
  // keyed by section key in both states, so the same elements carry on when
  // the data lands (no chrome replay). `coldStart` gives rows that land after
  // such a load the T2 entrance; a warm SWR cache paints settled.
  const [coldStart] = useState(isLoading);
  const pending = isLoading && sections.length === 0;
  const shown: HealthCheckSection[] = pending
    ? HEALTH_SECTION_ORDER.map((key) => ({ key, items: [] }))
    : sections;

  const handleAction = (item: HealthCheckItem) => {
    setResolutions((prev) => resolveHealthAction(prev, item));
    const verb = item.action === "install" ? labels.toast.installed : labels.toast.configured;
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message: `${item.name} ${verb}` }));
  };

  return (
    <div>
      {/* T0 frame: header paints with the view and never animates. */}
      <div data-tour-diagram="dashboard-health" className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">{labels.title}</GradientText>
          </h1>
          <p className="text-sm text-muted-dark">{labels.subtitle}</p>
        </div>
      </div>

      {error && <DashboardErrorBanner message={error} onRetry={retry} />}

      {liveUnavailable ? (
        <div {...arrive(0)}>
          <EmptyState
            icon={CloudOff}
            title={t.dashboardUi.liveUnavailableTitle}
            description={t.dashboardUi.liveUnavailableDescription}
          />
        </div>
      ) : error && sections.length === 0 && !isLoading ? null : (
        <div className="grid gap-6 lg:grid-cols-2" aria-busy={pending || undefined}>
          {shown.map((section, index) => (
            // T1 card chrome, cascaded by fixed visual order (0-3).
            <div key={section.key} className={ARRIVE} style={arriveAt(index)}>
              <HealthSectionCard
                section={section}
                pending={pending}
                settle={coldStart && !pending}
                onAction={handleAction}
                footer={
                  section.key === "resources" ? (
                    pending ? (
                      // Held reservation at the gauge's own height (no ghost).
                      <div aria-hidden className="h-[54px]" />
                    ) : (
                      <DiskUsageBar usedGb={diskUsage.usedGb} totalGb={diskUsage.totalGb} />
                    )
                  ) : undefined
                }
              />
            </div>
          ))}
        </div>
      )}

      {toast && (
        <ExecuteToast
          key={toast.id}
          status="success"
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
