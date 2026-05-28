"use client";

import { motion } from "framer-motion";

import MobileAppBar from "@/components/mobile/MobileAppBar";
import HealthIssueRow from "@/components/dashboard/HealthIssueRow";
import {
  severityPill,
  metricKey,
} from "@/app/dashboard/sla/sla-page/slaFormat";
import { MOCK_HEALTH_ISSUES, MOCK_SLA_BREACHES } from "@/lib/mock-dashboard-data";
import { relativeTime } from "@/lib/format";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function MobileAlertsPage() {
  const { t } = useTranslation();

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
