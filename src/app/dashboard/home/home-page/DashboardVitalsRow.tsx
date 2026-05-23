"use client";

import { motion } from "framer-motion";

import { fadeUp } from "@/lib/animations";
import { MOCK_HEALTH_ISSUES } from "@/lib/mock-dashboard-data";
import { TriageQueue } from "./TriageQueue";
import { VitalsConsole } from "./VitalsConsole";

/**
 * Top-of-overview row: the mission-vitals console above the triage queue.
 * `alerts` (count of open health issues) is derived here so the page stays
 * lean; the live run/agent/review figures are passed in from the page.
 */
export function DashboardVitalsRow({
  successRate,
  runs,
  agents,
  reviews,
}: {
  successRate: number;
  runs: number;
  agents: number;
  reviews: number;
}) {
  const openAlerts = MOCK_HEALTH_ISSUES.filter((issue) => issue.status === "open").length;
  return (
    <>
      <motion.div variants={fadeUp} className="mb-6">
        <VitalsConsole
          successRate={successRate}
          runs={runs}
          agents={agents}
          alerts={openAlerts}
          reviews={reviews}
        />
      </motion.div>
      <motion.div variants={fadeUp} className="mb-6">
        <TriageQueue />
      </motion.div>
    </>
  );
}
