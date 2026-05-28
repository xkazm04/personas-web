"use client";

import { motion } from "framer-motion";

import MobileAppBar from "@/components/mobile/MobileAppBar";
import HealthIssueRow from "@/components/dashboard/HealthIssueRow";
import { SLABreachLog } from "@/app/dashboard/sla/sla-page/SLABreachLog";
import { MOCK_HEALTH_ISSUES, MOCK_SLA_BREACHES } from "@/lib/mock-dashboard-data";
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
          <div className="space-y-2">
            {MOCK_HEALTH_ISSUES.map((issue) => (
              <HealthIssueRow key={issue.id} issue={{ ...issue, personaId: null }} />
            ))}
          </div>
        )}
      </motion.section>

      <SLABreachLog
        breaches={MOCK_SLA_BREACHES}
        labels={{
          title: t.slaPage.breachLog.title,
          empty: t.slaPage.breachLog.empty,
          duration: t.slaPage.breachLog.duration,
          ongoing: t.slaPage.breachLog.ongoing,
          metricType: t.slaPage.metricType,
          severity: t.slaPage.severity,
        }}
      />
    </motion.div>
  );
}
