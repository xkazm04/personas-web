"use client";

import { useState } from "react";
import GradientText from "@/components/GradientText";
import FilterBar from "@/components/dashboard/FilterBar";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import PerformanceView from "./PerformanceView";
import UsageView from "./UsageView";
import ActivityMetricsView from "./ActivityMetricsView";
import { useTranslation } from "@/i18n/useTranslation";

type Tab = "performance" | "usage" | "activity";

export default function ObservabilityPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("performance");

  return (
    <div>
      {/* T0: the view header paints with the frame and never animates. */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText variant="silver">
            {t.observabilityPage.title}
          </GradientText>
        </h1>
        <p className="mt-1 text-base text-muted-dark">
          {t.observabilityPage.subtitle}
        </p>
      </div>

      {/* T1: the tab strip (cascade index 0); each tab continues the cascade
          from 1 for its own sections. */}
      <div className={`${ARRIVE} mb-6`} style={arriveAt(0)}>
        <FilterBar
          options={[
            { key: "performance", label: t.observabilityPage.tabPerformance },
            { key: "usage", label: t.observabilityPage.tabUsage },
            { key: "activity", label: t.observabilityPage.tabActivity },
          ]}
          active={tab}
          onChange={(k) => setTab(k as Tab)}
        />
      </div>

      {tab === "performance" ? (
        <PerformanceView />
      ) : tab === "usage" ? (
        <UsageView />
      ) : (
        <ActivityMetricsView />
      )}
    </div>
  );
}
