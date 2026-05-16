import { highlightJson } from "@/components/dashboard/JsonViewer";
import type { SwarmNode } from "@/lib/mock-dashboard-data";

import { mockPayloadForNode } from "./mockPayloadForNode";

export function EventDrawerPayload({
  node,
  label,
}: {
  node: SwarmNode;
  label: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium uppercase tracking-wider text-muted-dark">
        {label}
      </label>
      <div className="relative max-h-64 overflow-auto rounded-xl bg-background p-4 border border-glass-hover shadow-inner">
        <pre className="font-mono text-sm leading-relaxed text-white/60 whitespace-pre-wrap break-all">
          {highlightJson(mockPayloadForNode(node))}
        </pre>
      </div>
    </div>
  );
}
