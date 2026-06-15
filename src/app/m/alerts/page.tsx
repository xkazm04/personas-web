"use client";

import { motion } from "framer-motion";

import MobileAppBar from "@/components/mobile/MobileAppBar";
import HealthIssueRow from "@/components/dashboard/HealthIssueRow";
import {
  severityPill,
  metricKey,
} from "@/app/dashboard/sla/sla-page/slaFormat";
import {
  severityStyle as incidentSeverity,
  statusStyle as incidentStatus,
  sourceIcon,
} from "@/app/dashboard/incidents/incidents-page/incidentFormat";
import {
  sectionIcon,
  statusStyle as healthStatus,
  worstStatus,
} from "@/app/dashboard/health/health-page/healthFormat";
import {
  MOCK_AUDIT_INCIDENTS,
  MOCK_HEALTH_CHECKS,
  MOCK_HEALTH_ISSUES,
  MOCK_SLA_BREACHES,
} from "@/lib/mock-dashboard-data";
import { relativeTime } from "@/lib/format";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";

// Open/escalated incidents, worst-first — the mobile triage slice (static).
const SEV_RANK: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const OPEN_INCIDENTS = MOCK_AUDIT_INCIDENTS.filter(
  (i) => i.status === "open" || i.status === "escalated",
)
  .slice()
  .sort((a, b) => SEV_RANK[b.severity] - SEV_RANK[a.severity] || b.detectedAt.localeCompare(a.detectedAt))
  .slice(0, 6);

export default function MobileAlertsPage() {
  const { t } = useTranslation();
  const ip = t.incidentsPage;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-5"
    >
      <MobileAppBar
        title={t.dashboard.home.vitals.alerts}
        backHref="/m/overview"
        backLabel={t.common.back}
      />

      {/* Incidents (D-A2 surface, compact) */}
      <motion.section variants={fadeUp} className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">{ip.title}</h2>
        {OPEN_INCIDENTS.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-dark">{ip.empty.title}</p>
        ) : (
          <ul className="space-y-2">
            {OPEN_INCIDENTS.map((incident) => {
              const SourceIcon = sourceIcon[incident.source];
              return (
                <li
                  key={incident.id}
                  className="rounded-2xl border border-glass bg-white/[0.02] p-3 [contain-intrinsic-size:auto_88px] [content-visibility:auto]"
                >
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${incidentSeverity[incident.severity].chip}`}>
                      {ip.severity[incident.severity]}
                    </span>
                    <span className={`ml-auto rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${incidentStatus[incident.status].chip}`}>
                      {ip.status[incident.status]}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-foreground">{incident.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-dark">
                    <SourceIcon className="h-3 w-3 flex-shrink-0" />
                    {ip.source[incident.source]} · {incident.persona} · {relativeTime(incident.detectedAt)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </motion.section>

      {/* System health (D-A3 surface, compact section status) */}
      <motion.section variants={fadeUp} className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">{t.healthPage.title}</h2>
        <ul className="grid grid-cols-2 gap-2">
          {MOCK_HEALTH_CHECKS.map((section) => {
            const worst = worstStatus(section.items);
            const Icon = sectionIcon[section.key];
            return (
              <li
                key={section.key}
                className="flex items-center gap-2.5 rounded-2xl border border-glass bg-white/[0.02] p-3"
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${healthStatus[worst].text}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{t.healthPage.sections[section.key]}</p>
                  <p className={`text-[13px] ${worst === "ok" ? "text-muted-dark" : healthStatus[worst].text}`}>
                    {t.healthPage.status[worst]}
                  </p>
                </div>
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${healthStatus[worst].dot}`} />
              </li>
            );
          })}
        </ul>
      </motion.section>

      <motion.section variants={fadeUp} className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">
          {t.observabilityPage.healthIssues}
        </h2>
        {MOCK_HEALTH_ISSUES.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-dark">
            {t.observabilityPage.allSystemsHealthy}
          </p>
        ) : (
          <ul className="space-y-2">
            {MOCK_HEALTH_ISSUES.map((issue) => (
              <li
                key={issue.id}
                className="[contain-intrinsic-size:auto_96px] [content-visibility:auto]"
              >
                <HealthIssueRow issue={{ ...issue, personaId: null }} />
              </li>
            ))}
          </ul>
        )}
      </motion.section>

      <motion.section variants={fadeUp} className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">
          {t.slaPage.breachLog.title}
        </h2>
        {MOCK_SLA_BREACHES.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-dark">
            {t.slaPage.breachLog.empty}
          </p>
        ) : (
          <ul className="space-y-2">
            {MOCK_SLA_BREACHES.map((breach) => {
              const ongoing = breach.resolvedAt === null;
              return (
                <li
                  key={breach.id}
                  className="[contain-intrinsic-size:auto_88px] [content-visibility:auto] rounded-2xl border border-glass bg-white/[0.02] p-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${severityPill[breach.severity]}`}
                    >
                      {t.slaPage.severity[breach.severity]}
                    </span>
                    <span className="ml-auto text-[11px] tabular-nums text-muted-dark">
                      {t.slaPage.breachLog.duration.replace(
                        "{n}",
                        String(breach.durationMinutes),
                      )}
                    </span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
                        ongoing
                          ? "border border-rose-500/25 bg-rose-500/10 text-rose-300"
                          : "text-muted-dark"
                      }`}
                    >
                      {ongoing
                        ? t.slaPage.breachLog.ongoing
                        : relativeTime(breach.resolvedAt ?? breach.startedAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-foreground">
                    {breach.summary}
                  </p>
                  <p className="mt-0.5 text-[13px] text-muted-dark">
                    {breach.persona} · {t.slaPage.metricType[metricKey(breach.metric)]}{" "}
                    · {relativeTime(breach.startedAt)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </motion.section>
    </motion.div>
  );
}
