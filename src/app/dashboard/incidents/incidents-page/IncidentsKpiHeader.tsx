"use client";

import { useMemo } from "react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import {
  INCIDENT_SEVERITIES,
  INCIDENT_SOURCES,
  type AuditIncident,
} from "@/lib/mock-dashboard-data";
import { severityStyle, sourceIcon } from "./incidentFormat";

/**
 * Incidents KPI header: the open/total headline plus severity and source
 * breakdowns, computed from the full (unfiltered) incident set so the totals
 * stay stable as filters change. The web counterpart to the desktop Incidents
 * Inbox KPI header.
 */
export function IncidentsKpiHeader({ incidents }: { incidents: AuditIncident[] }) {
  const { t } = useTranslation();
  const labels = t.incidentsPage;

  const { open, total, bySeverity, bySource } = useMemo(() => {
    const sev = Object.fromEntries(INCIDENT_SEVERITIES.map((s) => [s, 0])) as Record<string, number>;
    const src = Object.fromEntries(INCIDENT_SOURCES.map((s) => [s, 0])) as Record<string, number>;
    let openCount = 0;
    for (const incident of incidents) {
      if (incident.status === "open" || incident.status === "escalated") openCount += 1;
      sev[incident.severity] += 1;
      src[incident.source] += 1;
    }
    return { open: openCount, total: incidents.length, bySeverity: sev, bySource: src };
  }, [incidents]);

  return (
    <GlowCard accent="amber" className="p-5">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr_1fr] lg:gap-10">
        {/* Open headline */}
        <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-1">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-dark">{labels.open}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold tabular-nums ${open > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {open}
            </span>
            <span className="text-sm text-muted-dark">/ {total}</span>
          </div>
        </div>

        {/* By severity */}
        <div className="min-w-0">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-dark">{labels.bySeverity}</p>
          <div className="flex flex-wrap gap-2">
            {INCIDENT_SEVERITIES.map((sev) => (
              <span
                key={sev}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-medium ${severityStyle[sev].chip}`}
              >
                <span className="tabular-nums">{bySeverity[sev]}</span>
                <span className="opacity-80">{labels.severity[sev]}</span>
              </span>
            ))}
          </div>
        </div>

        {/* By source */}
        <div className="min-w-0">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-dark">{labels.bySource}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {INCIDENT_SOURCES.map((src) => {
              const Icon = sourceIcon[src];
              return (
                <span key={src} className="inline-flex items-center gap-1.5 text-sm text-muted-dark" title={labels.source[src]}>
                  <Icon className="h-3.5 w-3.5 text-muted-dark" />
                  <span className="font-semibold tabular-nums text-foreground">{bySource[src]}</span>
                  <span className="hidden sm:inline">{labels.source[src]}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </GlowCard>
  );
}
