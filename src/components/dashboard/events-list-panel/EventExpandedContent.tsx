import { Loader2, RotateCcw } from "lucide-react";
import JsonViewer from "@/components/dashboard/JsonViewer";
import { useTranslation } from "@/i18n/useTranslation";
import { relativeTime } from "@/lib/format";
import type { PersonaEvent } from "@/lib/types";
import { useEventStore } from "@/stores/eventStore";

export function EventExpandedContent({ event }: { event: PersonaEvent }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-dark">
        <span>ID: <code className="text-muted">{event.id.slice(0, 12)}...</code></span>
        {event.sourceId && <span>{t.eventsPage.sourceLabel}: <code className="text-muted">{event.sourceId.slice(0, 12)}</code></span>}
        {event.processedAt && <span>{t.eventsPage.processed}: {relativeTime(event.processedAt)}</span>}
      </div>
      <JsonViewer payload={event.payload} />
      {event.errorMessage && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-red-400">{event.errorMessage}</p>
            {event.status === "failed" && <RetryButton event={event} />}
          </div>
        </div>
      )}
    </div>
  );
}

function RetryButton({ event }: { event: PersonaEvent }) {
  const { t } = useTranslation();
  const replayEvent = useEventStore((s) => s.replayEvent);
  const replayingIds = useEventStore((s) => s.replayingIds);
  const isReplaying = replayingIds.has(event.id);

  return (
    <button onClick={() => void replayEvent(event)} disabled={isReplaying} className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-400 transition-all hover:bg-amber-500/20 disabled:opacity-50 flex-shrink-0">
      {isReplaying ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
      {t.eventsPage.retry}
    </button>
  );
}
