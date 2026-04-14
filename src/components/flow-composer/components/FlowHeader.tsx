"use client";

import { Link2, Plus, X } from "lucide-react";
import GradientText from "@/components/GradientText";

export default function FlowHeader({
  onToggleSidebar,
  onShare,
  onClose,
}: {
  onToggleSidebar: () => void;
  onShare: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-bold text-foreground sm:text-xl">
          <GradientText>Flow Composer</GradientText>
        </h3>
        <p className="text-base text-muted mt-1 font-mono">
          Drag nodes, click producer then consumer to wire, share your flow
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="flex items-center gap-1.5 rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-3 py-1.5 text-base font-mono text-brand-cyan/80 hover:bg-brand-cyan/20 transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan/60 focus-visible:outline-none"
        >
          <Plus className="w-3 h-3" />
          Add Node
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-base font-mono text-foreground/80 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan/60 focus-visible:outline-none"
        >
          <Link2 className="w-3 h-3" />
          Share
        </button>
        <button
          onClick={onClose}
          aria-label="Close Flow Composer"
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-base font-mono text-foreground/80 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan/60 focus-visible:outline-none"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
