import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import { useEventStore } from "@/stores/eventStore";
import { usePersonaStore } from "@/stores/personaStore";

const knownEventTypes = [
  "webhook_received",
  "alert_triggered",
  "scheduled_trigger",
  "manual_review",
  "gitlab_merge_request",
  "dependency_update",
];

export function CreateSubscriptionForm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const personas = usePersonaStore((state) => state.personas);
  const createSubscription = useEventStore((state) => state.createSubscription);
  const [personaId, setPersonaId] = useState("");
  const [eventType, setEventType] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <GlowCard accent="cyan" className="p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">{t.eventsPage.createSubscription}</h3>
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
          <div>
            <label className="text-sm font-medium uppercase tracking-wider text-muted-dark">
              {t.eventsPage.persona}
            </label>
            <select
              value={personaId}
              onChange={(event) => setPersonaId(event.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-glass-hover bg-white/[0.03] px-3 py-2 text-base text-foreground focus:border-brand-cyan/30 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">{t.eventsPage.selectPersona}</option>
              {personas.map((persona) => (
                <option key={persona.id} value={persona.id}>{persona.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium uppercase tracking-wider text-muted-dark">
              {t.eventsPage.eventType}
            </label>
            <select
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-glass-hover bg-white/[0.03] px-3 py-2 text-base text-foreground focus:border-brand-cyan/30 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">{t.eventsPage.selectEventType}</option>
              {knownEventTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium uppercase tracking-wider text-muted-dark">
              {t.eventsPage.sourceFilter} <span className="normal-case text-muted-dark/60">({t.eventsPage.optional})</span>
            </label>
            <input
              type="text"
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              placeholder={t.eventsPage.sourceFilterPlaceholder}
              className="mt-1 w-full rounded-xl border border-glass-hover bg-white/[0.03] px-3 py-2 text-base text-foreground placeholder:text-muted-dark/60 focus:border-brand-cyan/30 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={creating || !personaId || !eventType}
              className="flex items-center gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-2 text-sm font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20 disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              {t.eventsPage.create}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-muted-dark hover:text-foreground transition-colors"
            >
              {t.common.cancel}
            </button>
          </div>
        </form>
      </GlowCard>
    </motion.div>
  );
}
