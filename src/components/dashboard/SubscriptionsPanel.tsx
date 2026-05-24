"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

import EmptyState from "@/components/dashboard/EmptyState";
import { useTranslation } from "@/i18n/useTranslation";
import { useEventStore } from "@/stores/eventStore";
import { usePersonaStore } from "@/stores/personaStore";

import { CreateSubscriptionForm } from "./subscriptions-panel/CreateSubscriptionForm";
import { SubscriptionCard } from "./subscriptions-panel/SubscriptionCard";
import { SubscriptionsToolbar } from "./subscriptions-panel/SubscriptionsToolbar";
import type { SubscriptionFilter } from "./subscriptions-panel/subscriptionTypes";

export default function SubscriptionsPanel() {
  const { t } = useTranslation();
  const subscriptions = useEventStore((state) => state.subscriptions);
  const subscriptionsLoading = useEventStore((state) => state.subscriptionsLoading);
  const fetchSubscriptions = useEventStore((state) => state.fetchSubscriptions);
  const events = useEventStore((state) => state.events);
  const fetchPersonas = usePersonaStore((state) => state.fetchPersonas);
  const personas = usePersonaStore((state) => state.personas);
  const [showCreate, setShowCreate] = useState(false);
  const [filterEnabled, setFilterEnabled] = useState<SubscriptionFilter>("all");

  useEffect(() => {
    void fetchSubscriptions();
    if (personas.length === 0) void fetchPersonas();
  }, [fetchSubscriptions, fetchPersonas, personas.length]);

  const eventIndex = useMemo(() => {
    const index = new Map<string, { total: number; bySource: Map<string, number> }>();
    for (const event of events) {
      let bucket = index.get(event.eventType);
      if (!bucket) {
        bucket = { total: 0, bySource: new Map() };
        index.set(event.eventType, bucket);
      }
      bucket.total++;
      bucket.bySource.set(event.sourceType, (bucket.bySource.get(event.sourceType) ?? 0) + 1);
    }
    return index;
  }, [events]);

  const matchCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const subscription of subscriptions) {
      const bucket = eventIndex.get(subscription.eventType);
      if (!bucket) {
        counts.set(subscription.id, 0);
        continue;
      }
      const count = subscription.sourceFilter
        ? bucket.bySource.get(subscription.sourceFilter) ?? 0
        : bucket.total;
      counts.set(subscription.id, count);
    }
    return counts;
  }, [subscriptions, eventIndex]);

  const enriched = useMemo(() => {
    const personaMap = new Map(personas.map((persona) => [persona.id, persona]));
    return subscriptions.map((subscription) => {
      const persona = personaMap.get(subscription.personaId);
      return {
        ...subscription,
        personaName: persona?.name,
        personaIcon: persona?.icon ?? undefined,
        personaColor: persona?.color ?? undefined,
      };
    });
  }, [subscriptions, personas]);

  const filtered = useMemo(() => {
    if (filterEnabled === "all") return enriched;
    return enriched.filter((subscription) =>
      filterEnabled === "active" ? subscription.enabled : !subscription.enabled,
    );
  }, [enriched, filterEnabled]);

  const activeCount = useMemo(
    () => subscriptions.filter((subscription) => subscription.enabled).length,
    [subscriptions],
  );

  return (
    <div className="space-y-4">
      <SubscriptionsToolbar
        filterEnabled={filterEnabled}
        subscriptionCount={subscriptions.length}
        activeCount={activeCount}
        loading={subscriptionsLoading}
        labels={{
          all: t.executionsPage.all,
          active: t.eventsPage.active,
          disabled: t.eventsPage.disabled,
          newSubscription: t.eventsPage.newSubscription,
        }}
        onFilterChange={setFilterEnabled}
        onCreate={() => setShowCreate(true)}
      />

      <AnimatePresence>
        {showCreate && (
          <CreateSubscriptionForm onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Zap}
          title={filterEnabled !== "all" ? t.eventsPage.noMatchingSubscriptions : t.eventsPage.noSubscriptions}
          description={t.eventsPage.noSubscriptionsDescription}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              sub={subscription}
              eventMatchCount={matchCounts.get(subscription.id) ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
