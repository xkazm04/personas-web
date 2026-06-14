"use client";

import { Lightbulb, ShieldCheck, Zap } from "lucide-react";

import { Modal } from "@/components/dashboard/Modal";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { useTranslation } from "@/i18n/useTranslation";
import type { AuditIncident } from "@/lib/mock-dashboard-data";
import { severityStyle, sourceIcon, statusStyle } from "./incidentFormat";

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-dark">{label}</p>
      <div className="mt-0.5 truncate text-sm text-foreground">{value}</div>
    </div>
  );
}

/**
 * Incident detail modal: severity-led header, status/severity badges, full
 * description, a metadata grid (source / category / agent / detected /
 * resolved), and the recommended remediation. Built on the shared Modal.
 */
export function IncidentDetailModal({
  incident,
  onClose,
}: {
  incident: AuditIncident | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const labels = t.incidentsPage;

  const sev = incident ? severityStyle[incident.severity] : null;
  const SevIcon = sev?.icon ?? null;
  const SourceIcon = incident ? sourceIcon[incident.source] : null;

  return (
    <Modal
      open={incident !== null}
      onClose={onClose}
      ariaLabel={incident?.title}
      maxWidth="max-w-2xl"
      title={
        incident && SevIcon ? (
          <span className="flex items-center gap-2">
            <SevIcon className={`h-4 w-4 ${sev?.text}`} />
            <span className="truncate">{incident.title}</span>
          </span>
        ) : undefined
      }
    >
      {incident && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm font-medium ${severityStyle[incident.severity].chip}`}>
              {labels.severity[incident.severity]}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm font-medium ${statusStyle[incident.status].chip}`}>
              {labels.status[incident.status]}
            </span>
            {incident.isCircuitBreaker && (
              <span className="inline-flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-sm font-medium text-red-300">
                <Zap className="h-3 w-3" />
                {labels.badges.circuitBreaker}
              </span>
            )}
            {incident.autoFixApplied && (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-sm font-medium text-emerald-300">
                <ShieldCheck className="h-3 w-3" />
                {labels.badges.autoFixed}
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed text-muted">{incident.description}</p>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-glass bg-white/[0.02] p-4 sm:grid-cols-3">
            <MetaItem
              label={labels.detail.source}
              value={
                <span className="inline-flex items-center gap-1.5">
                  {SourceIcon && <SourceIcon className="h-3.5 w-3.5 text-muted-dark" />}
                  {labels.source[incident.source]}
                </span>
              }
            />
            <MetaItem label={labels.detail.category} value={incident.category} />
            <MetaItem
              label={labels.detail.persona}
              value={
                <span className="inline-flex items-center gap-1.5">
                  <PersonaAvatar color={incident.personaColor} name={incident.persona} size="sm" />
                  {incident.persona}
                </span>
              }
            />
            <MetaItem label={labels.detail.detected} value={new Date(incident.detectedAt).toLocaleString()} />
            <MetaItem
              label={labels.detail.resolved}
              value={incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : labels.detail.ongoing}
            />
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-cyan-400" />
              <p className="text-sm font-semibold text-foreground">{labels.detail.recommendation}</p>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{incident.recommendation}</p>
            {incident.autoFixApplied && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                {incident.autoFixApplied}
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
