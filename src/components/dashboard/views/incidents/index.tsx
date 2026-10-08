"use client";

import { useMemo, useState } from "react";
import { CloudOff, SearchX, ShieldCheck, Siren } from "lucide-react";

import GradientText from "@/components/GradientText";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import EmptyState from "@/components/dashboard/EmptyState";
import { ARRIVE, arrive, arriveAt } from "@/components/dashboard/arrival/arrive";
import { useTranslation } from "@/i18n/useTranslation";
import type { AuditIncident } from "@/lib/mock-dashboard-data";
import { applyIncidentFilters } from "@/lib/incidentFormat";
import { IncidentDetailModal } from "./incidents-page/IncidentDetailModal";
import { IncidentList, IncidentListGhost } from "./incidents-page/IncidentList";
import { IncidentsFilters } from "./incidents-page/IncidentsFilters";
import { IncidentsGroupByTabs } from "./incidents-page/IncidentsGroupByTabs";
import { IncidentsKpiHeader } from "./incidents-page/IncidentsKpiHeader";
import { useAuditIncidents } from "./incidents-page/useAuditIncidents";
import { useIncidentsFilterStore } from "@/stores/incidentsFilterStore";

/**
 * Incidents Inbox — audit-log incidents across the fleet. KPI header, status /
 * severity / source / persona filters (persisted), a group-by control with
 * collapsible sections, and a row→detail modal. Mirrors the desktop overview's
 * Incidents Inbox; demo-only (sourced from the mock layer) — a real (non-demo)
 * session sees an empty state instead.
 */
export default function IncidentsPage() {
  const { t } = useTranslation();
  const labels = t.incidentsPage;
  const { incidents, isLoading, error, retry, liveUnavailable } = useAuditIncidents();

  const status = useIncidentsFilterStore((s) => s.status);
  const severity = useIncidentsFilterStore((s) => s.severity);
  const source = useIncidentsFilterStore((s) => s.source);
  const persona = useIncidentsFilterStore((s) => s.persona);
  const groupBy = useIncidentsFilterStore((s) => s.groupBy);

  const [selected, setSelected] = useState<AuditIncident | null>(null);

  const filtered = useMemo(
    () => applyIncidentFilters(incidents, { status, severity, source, persona }),
    [incidents, status, severity, source, persona],
  );

  // T2 placeholders appear only on a first load with nothing held (SWR keeps
  // the last data on revalidate). `coldStart` lets content that lands after
  // such a load take the T2 entrance; data present on the first frame (a warm
  // SWR cache) does not double up with the section cascade.
  const [coldStart] = useState(isLoading);
  const pending = isLoading && incidents.length === 0;
  const settle = coldStart && !pending ? ARRIVE : "";

  return (
    <div>
      {/* T0 frame: header paints with the view and never animates. */}
      <div data-tour-diagram="dashboard-incidents" className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
          <Siren className="h-5 w-5" />
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
      ) : error && incidents.length === 0 && !isLoading ? null : (
        <>
          {/* T1 chrome (cascade 0-3) paints with the view, loading or not;
              each section holds its own T2 placeholder while pending. */}
          <div className={`${ARRIVE} mb-6`} style={arriveAt(0)}>
            <IncidentsKpiHeader incidents={incidents} pending={pending} settle={settle} />
          </div>

          <div className={`${ARRIVE} mb-5`} style={arriveAt(1)}>
            <IncidentsFilters incidents={incidents} pending={pending} />
          </div>

          <div className={`${ARRIVE} mb-4`} style={arriveAt(2)}>
            <IncidentsGroupByTabs />
          </div>

          <div className={ARRIVE} style={arriveAt(3)} aria-busy={pending || undefined}>
            {/* Persistent T2 body: takes the entrance on the cold
                loading -> settled edge, keeps `data-arrived` afterwards. */}
            <div className={settle || undefined}>
              {pending ? (
                <IncidentListGhost grouped={groupBy !== "none"} />
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={incidents.length === 0 ? ShieldCheck : SearchX}
                  title={incidents.length === 0 ? labels.empty.title : labels.empty.filteredTitle}
                  description={
                    incidents.length === 0 ? labels.empty.description : labels.empty.filteredDescription
                  }
                />
              ) : (
                <IncidentList incidents={filtered} groupBy={groupBy} onSelect={setSelected} />
              )}
            </div>
          </div>
        </>
      )}

      <IncidentDetailModal incident={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
