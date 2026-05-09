"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import FilterBar from "@/components/dashboard/FilterBar";
import PerformanceView from "./PerformanceView";
import UsageView from "./UsageView";
import { useTranslation } from "@/i18n/useTranslation";

type Tab = "performance" | "usage";

export default function ObservabilityPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("performance");

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText variant="silver">
            {t.observabilityPage.title}
          </GradientText>
        </h1>
        <p className="mt-1 text-base text-muted-dark">
          {t.observabilityPage.subtitle}
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="mb-6">
        <FilterBar
          options={[
            { key: "performance", label: t.observabilityPage.tabPerformance },
            { key: "usage", label: t.observabilityPage.tabUsage },
          ]}
          active={tab}
          onChange={(k) => setTab(k as Tab)}
        />
      </motion.div>

      {tab === "performance" ? <PerformanceView /> : <UsageView />}
    </motion.div>
  );
}
