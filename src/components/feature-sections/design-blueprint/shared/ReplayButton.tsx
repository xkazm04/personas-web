"use client";

import { RotateCcw } from "lucide-react";

/** The visitor's way to watch the build again (a real button). */
export default function ReplayButton({ label, onClick, className = "" }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border border-glass-hover px-4 py-1.5 text-sm font-medium text-foreground/85 transition-colors hover:border-brand-cyan/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 ${className}`}
      style={{ backgroundColor: "rgba(var(--surface-overlay), 0.04)" }}
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}
