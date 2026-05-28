import { X } from "lucide-react";

import type { SwarmNode } from "@/lib/mock-dashboard-data";

export function EventDrawerHeader({
  node,
  nodeLabel,
  closeLabel,
  titleId,
  onClose,
}: {
  node: SwarmNode;
  nodeLabel: string;
  closeLabel: string;
  titleId: string;
  onClose: () => void;
}) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-glass bg-background/80 px-5 py-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {node.icon && <span className="text-lg">{node.icon}</span>}
        <div>
          <h3 id={titleId} className="text-base font-semibold text-foreground">
            {node.label}
          </h3>
          <p className="text-sm text-muted-dark capitalize">
            {node.type} {nodeLabel}
          </p>
        </div>
      </div>
      <button
        data-drawer-close
        onClick={onClose}
        aria-label={closeLabel}
        className="rounded-lg p-1.5 text-muted-dark transition-colors hover:bg-white/[0.06] hover:text-foreground focus-ring focus-visible:ring-offset-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
