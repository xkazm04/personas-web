"use client";

import { motion } from "framer-motion";

import { fadeUp } from "@/lib/animations";
import { ExecutionHeatmapCard } from "./ExecutionHeatmapCard";
import { TopPerformersCard } from "./TopPerformersCard";
import { UpcomingRoutinesCard } from "./UpcomingRoutinesCard";
import { VaultChangesCard } from "./VaultChangesCard";

/**
 * Lower "instruments" region: the execution-activity heatmap above a row of
 * three telemetry cards — top performers, upcoming routines, vault changes.
 */
export function DashboardInstruments() {
  return (
    <>
      <motion.div variants={fadeUp} data-tour-diagram="dashboard-heatmap" className="mt-6">
        <ExecutionHeatmapCard />
      </motion.div>
      <div data-tour-diagram="dashboard-instruments" className="mt-6 grid gap-6 lg:grid-cols-3">
        <motion.div variants={fadeUp}>
          <TopPerformersCard />
        </motion.div>
        <motion.div variants={fadeUp}>
          <UpcomingRoutinesCard />
        </motion.div>
        <motion.div variants={fadeUp}>
          <VaultChangesCard />
        </motion.div>
      </div>
    </>
  );
}
