"use client";

import { motion } from "framer-motion";

import { fadeUp } from "@/lib/animations";
import { useAuthStore } from "@/stores/authStore";
import { ExecutionHeatmapCard } from "./ExecutionHeatmapCard";
import { TopPerformersCard } from "./TopPerformersCard";
import { UpcomingRoutinesCard } from "./UpcomingRoutinesCard";
import { VaultChangesCard } from "./VaultChangesCard";

/**
 * Lower "instruments" region: the execution-activity heatmap above a row of
 * telemetry cards — top performers, upcoming routines, and (demo only) vault
 * changes. The vault card has no synced source, so in real mode the row drops
 * to two columns rather than leaving an empty grid cell.
 */
export function DashboardInstruments() {
  const isDemo = useAuthStore((s) => s.isDemo);

  return (
    <>
      <motion.div variants={fadeUp} data-tour-diagram="dashboard-heatmap" className="mt-6">
        <ExecutionHeatmapCard />
      </motion.div>
      <div
        data-tour-diagram="dashboard-instruments"
        className={`mt-6 grid gap-6 ${isDemo ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}
      >
        <motion.div variants={fadeUp}>
          <TopPerformersCard />
        </motion.div>
        <motion.div variants={fadeUp}>
          <UpcomingRoutinesCard />
        </motion.div>
        {isDemo && (
          <motion.div variants={fadeUp}>
            <VaultChangesCard />
          </motion.div>
        )}
      </div>
    </>
  );
}
