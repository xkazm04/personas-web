"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Filter,
  Zap,
} from "lucide-react";
import { fadeUp } from "@/lib/animations";
import GlowCard from "@/components/GlowCard";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import EmptyState from "@/components/dashboard/EmptyState";
import { useEventStore } from "@/stores/eventStore";
import { usePersonaStore } from "@/stores/personaStore";
import type { PersonaEventSubscription } from "@/lib/types";
import { relativeTime } from "@/lib/format";

function SubscriptionCard({
  sub,
  eventMatchCount,
}: {
  sub: PersonaEventSubscription & { personaName?: string; personaIcon?: string; personaColor?: string };
  eventMatchCount: number;
}) {
  const updateSubscription = useEventStore((s) => s.updateSubscription);
  const deleteSubscription = useEventStore((s) => s.deleteSubscription);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await updateSubscription(sub.personaId, sub.id, { enabled: !sub.enabled });
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSubscription(sub.personaId, sub.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <GlowCard accent={sub.enabled ? "cyan" : undefined} variants={fadeUp} className="p-4">
      <div className="flex items-start gap-3">
        <PersonaAvatar
          icon={sub.personaIcon}
          color={sub.personaColor}
          name={sub.personaName}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-foreground truncate">
              {sub.personaName ?? "Unknown agent"}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium ${
              sub.enabled
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-white/[0.04] text-muted-dark border border-white/[0.08]"
            }`}>
              {sub.enabled ? "Active" : "Disabled"}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-sm font-mono text-cyan-400">
              <Zap className="h-3 w-3" />
              {sub.eventType}
            </span>
            {sub.sourceFilter && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-sm font-mono text-amber-400">
                <Filter className="h-3 w-3" />
                {sub.sourceFilter}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-3 text-sm text-muted-dark">
            <span>Created {relativeTime(sub.createdAt)}</span>
            <span className="flex items-center gap-1">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${eventMatchCount > 0 ? "bg-emerald-400" : "bg-white/20"}`} />
              {eventMatchCount} match{eventMatchCount !== 1 ? "es" : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => void handleToggle()}
            disabled={toggling}
            className="rounded-md p-1.5 text-muted-dark transition-colors hover:text-foreground hover:bg-white/[0.05] disabled:opacity-50"
            title={sub.enabled ? "Disable subscription" : "Enable subscription"}
          >
            {toggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : sub.enabled ? (
              <ToggleRight className="h-4 w-4 text-emerald-400" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-md px-2 py-1 text-sm text-muted-dark hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-md p-1.5 text-muted-dark transition-colors hover:text-red-400 hover:bg-red-500/10"
              title="Delete subscription"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </GlowCard>
  );
}

function CreateSubscriptionForm({ onClose }: { onClose: () => void }) {
  const personas = usePersonaStore((s) => s.personas);
  const createSubscription = useEventStore((s) => s.createSubscription);
  const [personaId, setPersonaId] = useState("");
  const [eventType, setEventType] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [creating, setCreating] = useState(false);

  const knownEventTypes = [
    "webhook_received",
    "alert_triggered",
    "scheduled_trigger",
    "manual_review",
    "gitlab_merge_request",
    "dependency_update",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personaId || !eventType) return;
    setCreating(true);
    try {
      await createSubscription({
        personaId,
        eventType,
        sourceFilter: sourceFilter || undefined,
      });
      onClose();
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <GlowCard accent="cyan" className="p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">Create Subscription</h3>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          <div>
            <label className="text-sm font-medium uppercase tracking-wider text-muted-dark">
              Persona
            </label>
            <select
              value={personaId}
              onChange={(e) => setPersonaId(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-base text-foreground focus:border-brand-cyan/30 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">Select a persona...</option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium uppercase tracking-wider text-muted-dark">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-base text-foreground focus:border-brand-cyan/30 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">Select event type...</option>
              {knownEventTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium uppercase tracking-wider text-muted-dark">
              Source Filter <span className="normal-case text-muted-dark/50">(optional)</span>
            </label>
            <input
              type="text"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              placeholder="e.g. github, pagerduty..."
              className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-base text-foreground placeholder:text-muted-dark/50 focus:border-brand-cyan/30 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={creating || !personaId || !eventType}
              className="flex items-center gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-2 text-sm font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20 disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-muted-dark hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </GlowCard>
    </motion.div>
  );
}

export default function SubscriptionsPanel() {
  const subscriptions = useEventStore((s) => s.subscriptions);
  const subscriptionsLoading = useEventStore((s) => s.subscriptionsLoading);
  const fetchSubscriptions = useEventStore((s) => s.fetchSubscriptions);
  const fetchPersonas = usePersonaStore((s) => s.fetchPersonas);
  const personas = usePersonaStore((s) => s.personas);
  const events = useEventStore((s) => s.events);
  const [showCreate, setShowCreate] = useState(false);
  const [filterEnabled, setFilterEnabled] = useState<"all" | "active" | "disabled">("all");

  useEffect(() => {
    void fetchSubscriptions();
    if (personas.length === 0) void fetchPersonas();
  }, [fetchSubscriptions, fetchPersonas, personas.length]);

  // Count matching events per subscription
  const matchCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const sub of subscriptions) {
      let count = 0;
      for (const ev of events) {
        if (ev.eventType !== sub.eventType) continue;
        if (sub.sourceFilter && ev.sourceType !== sub.sourceFilter) continue;
        count++;
      }
      counts.set(sub.id, count);
    }
    return counts;
  }, [subscriptions, events]);

  // Enrich subscriptions with persona info
  const enriched = useMemo(() => {
    const personaMap = new Map(personas.map((p) => [p.id, p]));
    return subscriptions.map((sub) => {
      const p = personaMap.get(sub.personaId);
      return {
        ...sub,
        personaName: p?.name,
        personaIcon: p?.icon ?? undefined,
        personaColor: p?.color ?? undefined,
      };
    });
  }, [subscriptions, personas]);

  const filtered = useMemo(() => {
    if (filterEnabled === "all") return enriched;
    return enriched.filter((s) =>
      filterEnabled === "active" ? s.enabled : !s.enabled,
    );
  }, [enriched, filterEnabled]);

  const activeCount = useMemo(
    () => subscriptions.filter((s) => s.enabled).length,
    [subscriptions],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
            {(["all", "active", "disabled"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setFilterEnabled(key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  filterEnabled === key
                    ? "bg-white/[0.08] text-foreground shadow-sm"
                    : "text-muted-dark hover:text-muted"
                }`}
              >
                {key === "all" ? `All (${subscriptions.length})` : key === "active" ? `Active (${activeCount})` : `Disabled (${subscriptions.length - activeCount})`}
              </button>
            ))}
          </div>
          {subscriptionsLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-dark" />
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 text-sm font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20"
        >
          <Plus className="h-3.5 w-3.5" />
          New Subscription
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateSubscriptionForm onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Zap}
          title={filterEnabled !== "all" ? "No matching subscriptions" : "No subscriptions"}
          description="Create subscriptions to route events to your agents"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              eventMatchCount={matchCounts.get(sub.id) ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
