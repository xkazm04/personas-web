"use client";

import { useState } from "react";
import Image from "next/image";

import GradientText from "@/components/GradientText";
import ConnectionStatusIndicator from "@/components/dashboard/ConnectionStatusIndicator";
import EventsListPanel from "@/components/dashboard/EventsListPanel";
import EventSwimlane from "@/components/dashboard/EventSwimlane";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import SubscriptionsPanel from "@/components/dashboard/SubscriptionsPanel";
import { useTranslation } from "@/i18n/useTranslation";
import type { SwarmNode } from "@/lib/mock-dashboard-data";
import { useEventStore } from "@/stores/eventStore";

import { EventsPageTabs, type PageTab } from "./events-page/EventsPageTabs";
import { EventsVisualizationView } from "./events-page/EventsVisualizationView";
import { tabCounts } from "./events-page/tabCounts";

export default function EventsPage() {
  const { t } = useTranslation();
  const events = useEventStore((state) => state.events);
  const listNotServed = useEventStore((state) => state.listNotServed);
  const subscriptions = useEventStore((state) => state.subscriptions);
  const subscriptionsRead = useEventStore((state) => state.subscriptionsRead);
  const [pageTab, setPageTab] = useState<PageTab>("events");
  const [selectedNode, setSelectedNode] = useState<SwarmNode | null>(null);
  const [burstTrigger, setBurstTrigger] = useState(0);

  return (
    <div className="relative">
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

      <div className="mb-6">
        {/* T0: title, live-connection pill and subtitle paint with the frame. */}
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <GradientText variant="silver">{t.eventsPage.title}</GradientText>
          <ConnectionStatusIndicator />
        </h1>
        <p className="mt-1 text-base text-muted-dark">
          {t.eventsPage.subtitle}
        </p>
        {/* T1: the tab strip. */}
        <div className={ARRIVE} style={arriveAt(0)}>
          <EventsPageTabs
            activeTab={pageTab}
            {...tabCounts({ events, listNotServed, subscriptions, subscriptionsRead })}
            listLabel={t.eventsPage.title}
            labels={{
              events: t.eventsPage.tabEvents,
              subscriptions: t.eventsPage.tabSubscriptions,
              visualization: t.eventsPage.tabVisualization,
              swimlane: t.eventsPage.tabSwimlane,
            }}
            onTabChange={setPageTab}
          />
        </div>
      </div>

      {/* T2: the active tab's panel. One wrapper for every tab, so the
          entrance plays once with the view and a tab switch swaps content in
          place (no replay, no re-key). */}
      <div className={ARRIVE} style={arriveAt(1)}>
        {pageTab === "subscriptions" ? (
          <SubscriptionsPanel />
        ) : pageTab === "swimlane" ? (
          <EventSwimlane />
        ) : pageTab === "visualization" ? (
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
        ) : (
          <div data-tour-diagram="dashboard-events">
            <EventsListPanel />
          </div>
        )}
      </div>
    </div>
  );
}
