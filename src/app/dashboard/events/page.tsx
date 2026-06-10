"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import GradientText from "@/components/GradientText";
import ConnectionStatusIndicator from "@/components/dashboard/ConnectionStatusIndicator";
import EventsListPanel from "@/components/dashboard/EventsListPanel";
import EventSwimlane from "@/components/dashboard/EventSwimlane";
import SubscriptionsPanel from "@/components/dashboard/SubscriptionsPanel";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import type { SwarmNode } from "@/lib/mock-dashboard-data";
import { useEventStore } from "@/stores/eventStore";

import { EventsPageTabs, type PageTab } from "./events-page/EventsPageTabs";
import { EventsVisualizationView } from "./events-page/EventsVisualizationView";

export default function EventsPage() {
  const { t } = useTranslation();
  const events = useEventStore((state) => state.events);
  const subscriptions = useEventStore((state) => state.subscriptions);
  const [pageTab, setPageTab] = useState<PageTab>("events");
  const [selectedNode, setSelectedNode] = useState<SwarmNode | null>(null);
  const [burstTrigger, setBurstTrigger] = useState(0);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden">
        <Image
          src="/gen/backgrounds/bg-events.avif"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover opacity-[0.12]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" />
      </div>

      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <GradientText variant="silver">{t.eventsPage.title}</GradientText>
          <ConnectionStatusIndicator />
        </h1>
        <p className="mt-1 text-base text-muted-dark">
          {t.eventsPage.subtitle}
        </p>
        <EventsPageTabs
          activeTab={pageTab}
          eventCount={events.length}
          subscriptionCount={subscriptions.length}
          listLabel={t.eventsPage.title}
          labels={{
            events: t.eventsPage.tabEvents,
            subscriptions: t.eventsPage.tabSubscriptions,
            visualization: t.eventsPage.tabVisualization,
            swimlane: t.eventsPage.tabSwimlane,
          }}
          onTabChange={setPageTab}
        />
      </motion.div>

      {pageTab === "subscriptions" ? (
        <motion.div variants={fadeUp}>
          <SubscriptionsPanel />
        </motion.div>
      ) : pageTab === "swimlane" ? (
        <motion.div variants={fadeUp}>
          <EventSwimlane />
        </motion.div>
      ) : pageTab === "visualization" ? (
        <motion.div variants={fadeUp}>
          <EventsVisualizationView
            selectedNode={selectedNode}
            burstTrigger={burstTrigger}
            labels={{
              testFlow: t.dashboardUi.testFlow,
              eventTypes: t.dashboardUi.eventTypes,
            }}
            onBurst={() => setBurstTrigger((value) => value + 1)}
            onSelectNode={setSelectedNode}
          />
        </motion.div>
      ) : (
        <div data-tour-diagram="dashboard-events">
          <EventsListPanel />
        </div>
      )}
    </motion.div>
  );
}
