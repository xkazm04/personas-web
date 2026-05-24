import { Play } from "lucide-react";

import EventBusStats from "@/components/dashboard/EventBusStats";
import EventBusVisualization from "@/components/dashboard/EventBusVisualization";
import EventDetailDrawer from "@/components/dashboard/EventDetailDrawer";
import { EVENT_TYPES, SWARM_PERSONAS, type SwarmNode } from "@/lib/mock-dashboard-data";

const EVENT_TYPE_COLORS: Record<string, string> = {
  "pull_request.opened": "#06b6d4",
  "message.received": "#a855f7",
  "cron.triggered": "#fbbf24",
  "webhook.incoming": "#34d399",
  "api.request": "#60a5fa",
  "email.received": "#f43f5e",
  "review.requested": "#06b6d4",
  "build.completed": "#34d399",
  "deploy.success": "#a855f7",
  "alert.fired": "#fbbf24",
};

export function EventsVisualizationView({
  selectedNode,
  burstTrigger,
  labels,
  onBurst,
  onSelectNode,
}: {
  selectedNode: SwarmNode | null;
  burstTrigger: number;
  labels: { testFlow: string; eventTypes: string };
  onBurst: () => void;
  onSelectNode: (node: SwarmNode | null) => void;
}) {
  return (
    <div className="space-y-4">
      <EventBusStats />

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onBurst}
          className="flex items-center gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 text-sm font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20 active:scale-95"
        >
          <Play className="h-3.5 w-3.5" />
          {labels.testFlow}
        </button>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 ml-auto">
          <span className="text-sm uppercase tracking-wider text-muted-dark font-medium">
            {labels.eventTypes}
          </span>
          {EVENT_TYPES.slice(0, 6).map((type) => (
            <span key={type} className="flex items-center gap-1.5 text-sm text-muted-dark">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: EVENT_TYPE_COLORS[type] ?? "#666",
                  boxShadow: `0 0 4px ${EVENT_TYPE_COLORS[type] ?? "#666"}40`,
                }}
              />
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="relative rounded-2xl border border-glass bg-white/[0.01] backdrop-blur-sm overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(6,182,212,0.03) 0%, transparent 70%)",
          }}
        />
        <EventBusVisualization
          className="relative z-10"
          onNodeClick={onSelectNode}
          triggerBurst={burstTrigger}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {SWARM_PERSONAS.map((persona) => (
          <button
            key={persona.id}
            onClick={() => onSelectNode(persona)}
            className="group flex items-center gap-2 rounded-xl border border-glass bg-white/[0.02] p-2.5 text-left transition-all hover:border-glass-strong hover:bg-white/[0.04]"
          >
            <span className="text-base">{persona.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {persona.label}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${persona.volume * 100}%`,
                      backgroundColor: persona.color,
                    }}
                  />
                </div>
                <span className="text-sm tabular-nums text-muted-dark">
                  {Math.round(persona.volume * 100)}%
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <EventDetailDrawer node={selectedNode} onClose={() => onSelectNode(null)} />
    </div>
  );
}
