import { useState } from "react";
import { Filter, Loader2, ToggleLeft, ToggleRight, Trash2, Zap } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp } from "@/lib/animations";
import { relativeTime } from "@/lib/format";
import { useEventStore } from "@/stores/eventStore";

import type { EnrichedSubscription } from "./subscriptionTypes";

export function SubscriptionCard({
  sub,
  eventMatchCount,
}: {
  sub: EnrichedSubscription;
  eventMatchCount: number;
}) {
  const { t } = useTranslation();
  const updateSubscription = useEventStore((state) => state.updateSubscription);
  const deleteSubscription = useEventStore((state) => state.deleteSubscription);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleToggle() {
    setToggling(true);
    try {
      await updateSubscription(sub.personaId, sub.id, { enabled: !sub.enabled });
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteSubscription(sub.personaId, sub.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <GlowCard accent={sub.enabled ? "cyan" : undefined} variants={fadeUp} className="p-4">
      <div className="flex items-start gap-3">
        <PersonaAvatar icon={sub.personaIcon} color={sub.personaColor} name={sub.personaName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-foreground truncate">
              {sub.personaName ?? "Unknown agent"}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium ${
              sub.enabled
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-white/[0.04] text-muted-dark border border-glass-hover"
            }`}>
              {sub.enabled ? t.eventsPage.active : t.eventsPage.disabled}
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
            <span>{t.eventsPage.created} {relativeTime(sub.createdAt)}</span>
            <span className="flex items-center gap-1">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${eventMatchCount > 0 ? "bg-emerald-400" : "bg-white/20"}`} />
              {eventMatchCount} {eventMatchCount === 1 ? t.eventsPage.match : t.eventsPage.matches}
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
                {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : t.common.delete}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-md px-2 py-1 text-sm text-muted-dark hover:text-foreground transition-colors"
              >
                {t.common.cancel}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-md p-1.5 text-muted-dark transition-colors hover:text-red-400 hover:bg-red-500/10"
              title={t.eventsPage.deleteSubscription}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </GlowCard>
  );
}
