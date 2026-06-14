"use client";

import { useMemo } from "react";
import { X } from "lucide-react";

import FilterBar from "@/components/dashboard/FilterBar";
import { useTranslation } from "@/i18n/useTranslation";
import {
  INCIDENT_SEVERITIES,
  INCIDENT_SOURCES,
  INCIDENT_STATUSES,
  type AuditIncident,
} from "@/lib/mock-dashboard-data";
import type { SeverityFilter, SourceFilter, StatusFilter } from "./incidentFormat";
import { useIncidentsFilterStore } from "./useIncidentsFilterStore";

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-dark">{label}</span>
      {children}
    </div>
  );
}

/**
 * Incidents filter controls: status / severity / source / persona pill bars.
 * Pill counts reflect the full incident set (stable as other filters change).
 * Selections live in the persisted incidents filter store.
 */
export function IncidentsFilters({ incidents }: { incidents: AuditIncident[] }) {
  const { t } = useTranslation();
  const labels = t.incidentsPage;
  const status = useIncidentsFilterStore((s) => s.status);
  const severity = useIncidentsFilterStore((s) => s.severity);
  const source = useIncidentsFilterStore((s) => s.source);
  const persona = useIncidentsFilterStore((s) => s.persona);
  const setStatus = useIncidentsFilterStore((s) => s.setStatus);
  const setSeverity = useIncidentsFilterStore((s) => s.setSeverity);
  const setSource = useIncidentsFilterStore((s) => s.setSource);
  const setPersona = useIncidentsFilterStore((s) => s.setPersona);
  const reset = useIncidentsFilterStore((s) => s.reset);

  const { statusCounts, severityCounts, personas } = useMemo(() => {
    const sc: Record<string, number> = { all: incidents.length };
    const vc: Record<string, number> = { all: incidents.length };
    const names = new Set<string>();
    for (const i of incidents) {
      sc[i.status] = (sc[i.status] ?? 0) + 1;
      vc[i.severity] = (vc[i.severity] ?? 0) + 1;
      names.add(i.persona);
    }
    return { statusCounts: sc, severityCounts: vc, personas: [...names].sort() };
  }, [incidents]);

  const hasActiveFilter =
    status !== "all" || severity !== "all" || source !== "all" || persona !== "all";

  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
      <FilterGroup label={labels.statusLabel}>
        <FilterBar
          compact
          active={status}
          onChange={(k) => setStatus(k as StatusFilter)}
          options={[
            { key: "all", label: labels.status.all, count: statusCounts.all ?? 0 },
            ...INCIDENT_STATUSES.map((s) => ({ key: s, label: labels.status[s], count: statusCounts[s] ?? 0 })),
          ]}
        />
      </FilterGroup>

      <FilterGroup label={labels.groupBy.severity}>
        <FilterBar
          compact
          active={severity}
          onChange={(k) => setSeverity(k as SeverityFilter)}
          options={[
            { key: "all", label: labels.status.all, count: severityCounts.all ?? 0 },
            ...INCIDENT_SEVERITIES.map((s) => ({ key: s, label: labels.severity[s], count: severityCounts[s] ?? 0 })),
          ]}
        />
      </FilterGroup>

      <FilterGroup label={labels.groupBy.source}>
        <FilterBar
          compact
          active={source}
          onChange={(k) => setSource(k as SourceFilter)}
          options={[
            { key: "all", label: labels.source.all },
            ...INCIDENT_SOURCES.map((s) => ({ key: s, label: labels.source[s] })),
          ]}
        />
      </FilterGroup>

      <FilterGroup label={labels.groupBy.agent}>
        <FilterBar
          compact
          active={persona}
          onChange={(k) => setPersona(k)}
          options={[
            { key: "all", label: labels.allPersonas },
            ...personas.map((p) => ({ key: p, label: p })),
          ]}
        />
      </FilterGroup>

      {hasActiveFilter && (
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1 rounded-lg border border-glass-hover bg-white/[0.03] px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground focus-ring focus-visible:ring-offset-0"
        >
          <X className="h-3 w-3" />
          {labels.clearFilters}
        </button>
      )}
    </div>
  );
}
