"use client";

import { ChevronRight, ShieldCheck, Zap } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";
import { relativeTime } from "@/lib/format";
import type { AuditIncident } from "@/lib/mock-dashboard-data";
import { severityStyle, sourceIcon, statusStyle } from "./incidentFormat";

/**
 * One incident row: severity rail + icon, title (with circuit-breaker /
 * auto-fixed badges), source · agent · age meta line, and a status badge.
 * Whole row is a button that opens the detail modal.
 */
export function IncidentRow({
  incident,
  onSelect,
}: {
  incident: AuditIncident;
  onSelect: (incident: AuditIncident) => void;
}) {
  const { t } = useTranslation();
  const labels = t.incidentsPage;
  const sev = severityStyle[incident.severity];
  const SevIcon = sev.icon;
  const st = statusStyle[incident.status];
  const StatusIcon = st.icon;
  const SourceIcon = sourceIcon[incident.source];

  return (
    <button
      type="button"
      onClick={() => onSelect(incident)}
      className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-white/[0.03] focus-ring focus-visible:ring-offset-0"
    >
      <span className={`h-9 w-1 flex-shrink-0 rounded-full ${sev.rail}`} aria-hidden />
      <SevIcon className={`h-4 w-4 flex-shrink-0 ${sev.text}`} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{incident.title}</span>
          {incident.isCircuitBreaker && (
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-xs font-medium text-red-300">
              <Zap className="h-2.5 w-2.5" />
              {labels.badges.circuitBreaker}
            </span>
          )}
          {incident.autoFixApplied && (
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/8 px-1.5 py-0.5 text-xs font-medium text-emerald-300">
              <ShieldCheck className="h-2.5 w-2.5" />
              {labels.badges.autoFixed}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-dark">
          <span className="inline-flex items-center gap-1">
            <SourceIcon className="h-3 w-3" />
            {labels.source[incident.source]}
          </span>
          <span aria-hidden>·</span>
          <span className="truncate">{incident.persona}</span>
          <span aria-hidden>·</span>
          <span className="flex-shrink-0 tabular-nums">{relativeTime(incident.detectedAt)}</span>
        </div>
      </div>

      <span className={`hidden flex-shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium sm:inline-flex ${st.chip}`}>
        <StatusIcon className="h-3 w-3" />
        {labels.status[incident.status]}
      </span>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-dark" />
    </button>
  );
}
