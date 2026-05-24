import { Bell, Clock, Hand, Radio, Webhook } from "lucide-react";
import type { ElementType } from "react";

const eventTypeConfig: Record<string, { icon: ElementType; bg: string; border: string; text: string }> = {
  webhook_received: { icon: Webhook, bg: "bg-cyan-500/10", border: "border-cyan-500/25", text: "text-cyan-400" },
  alert_triggered: { icon: Bell, bg: "bg-amber-500/10", border: "border-amber-500/25", text: "text-amber-400" },
  scheduled_trigger: { icon: Clock, bg: "bg-purple-500/10", border: "border-purple-500/25", text: "text-purple-400" },
  manual_review: { icon: Hand, bg: "bg-rose-500/10", border: "border-rose-500/25", text: "text-rose-400" },
};

const defaultEventType = { icon: Radio, bg: "bg-white/[0.04]", border: "border-glass-hover", text: "text-muted" };

export function EventTypeBadge({ eventType }: { eventType: string }) {
  const config = eventTypeConfig[eventType] ?? defaultEventType;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${config.border} ${config.bg} px-2 py-0.5 text-sm font-mono ${config.text}`}>
      <Icon className="h-3 w-3" />
      {eventType}
    </span>
  );
}
