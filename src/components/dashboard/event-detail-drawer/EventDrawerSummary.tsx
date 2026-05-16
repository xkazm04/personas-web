import { ArrowRight, Tag } from "lucide-react";

import type { SwarmNode } from "@/lib/mock-dashboard-data";

export function EventDrawerSummary({
  node,
  eventType,
  labels,
}: {
  node: SwarmNode;
  eventType: string;
  labels: { eventBus: string; eventType: string };
}) {
  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border border-glass bg-white/[0.02] p-3">
        <div className="flex items-center gap-2 text-sm">
          <span
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-sm"
            style={{
              backgroundColor: `${node.color}15`,
              border: `1px solid ${node.color}30`,
            }}
          >
            {node.icon || (node.type === "source" ? "S" : "P")}
          </span>
          <span className="font-medium text-foreground">{node.label}</span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-dark" />
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 border border-cyan-500/25 text-sm font-mono text-cyan-400">
            BUS
          </span>
          <span className="text-muted">{labels.eventBus}</span>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium uppercase tracking-wider text-muted-dark">
          {labels.eventType}
        </label>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 text-sm font-mono text-cyan-400">
          <Tag className="h-3 w-3" />
          {eventType}
        </span>
      </div>
    </>
  );
}
