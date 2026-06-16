"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SearchX, ShieldCheck, Siren } from "lucide-react";

import GradientText from "@/components/GradientText";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import EmptyState from "@/components/dashboard/EmptyState";
import SkeletonCard from "@/components/dashboard/SkeletonCard";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import type { AuditIncident } from "@/lib/mock-dashboard-data";
import { applyIncidentFilters } from "./incidents-page/incidentFormat";
import { IncidentDetailModal } from "./incidents-page/IncidentDetailModal";
import { IncidentList } from "./incidents-page/IncidentList";
import { IncidentsFilters } from "./incidents-page/IncidentsFilters";
import { IncidentsGroupByTabs } from "./incidents-page/IncidentsGroupByTabs";
import { IncidentsKpiHeader } from "./incidents-page/IncidentsKpiHeader";
import { useAuditIncidents } from "./incidents-page/useAuditIncidents";
import { useIncidentsFilterStore } from "./incidents-page/useIncidentsFilterStore";

/**
 * Incidents Inbox — audit-log incidents across the fleet. KPI header, status /
 * severity / source / persona filters (persisted), a group-by control with
 * collapsible sections, and a row→detail modal. Mirrors the desktop overview's
 * Incidents Inbox; demo-only (sourced from the mock layer).
 */
export default function IncidentsPage() {
  const { t } = useTranslation();
  const labels = t.incidentsPage;
  const { incidents, isLoading, error, retry } = useAuditIncidents();

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

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div
        variants={fadeUp}
        data-tour-diagram="dashboard-incidents"
        className="mb-6 flex items-center gap-3"
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
          <Siren className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">{labels.title}</GradientText>
          </h1>
          <p className="text-sm text-muted-dark">{labels.subtitle}</p>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={fadeUp}>
          <DashboardErrorBanner message={error} onRetry={retry} />
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={6} />
        </div>
      ) : error && incidents.length === 0 ? null : (
        <>
          <motion.div variants={fadeUp} className="mb-6">
            <IncidentsKpiHeader incidents={incidents} />
          </motion.div>

          <motion.div variants={fadeUp} className="mb-5">
            <IncidentsFilters incidents={incidents} />
          </motion.div>

          <motion.div variants={fadeUp} className="mb-4">
            <IncidentsGroupByTabs />
          </motion.div>

          <motion.div variants={fadeUp}>
            {filtered.length === 0 ? (
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
          </motion.div>
        </>
      )}

      <IncidentDetailModal incident={selected} onClose={() => setSelected(null)} />
    </motion.div>
  );
}
