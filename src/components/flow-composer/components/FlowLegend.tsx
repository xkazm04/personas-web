"use client";

import { Trash2 } from "lucide-react";

export default function FlowLegend() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-base text-muted">
      <div className="flex items-center gap-2">
        <Trash2 className="w-3 h-3 text-muted" />
        <span>Hover node to delete</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_4px_rgba(6,182,212,0.4)]" />
        <span>Click producer → consumer to wire</span>
      </div>
      <div className="flex items-center gap-2">
        <svg width="16" height="8" className="text-muted" aria-hidden="true">
          <line
            x1="0"
            y1="4"
            x2="16"
            y2="4"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
        </svg>
        <span>Drag nodes to reposition</span>
      </div>
    </div>
  );
}
