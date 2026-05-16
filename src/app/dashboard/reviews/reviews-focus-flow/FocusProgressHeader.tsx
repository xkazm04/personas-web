import { X } from "lucide-react";

export function FocusProgressHeader({
  progressLabel,
  progressPct,
  exitLabel,
  onExit,
}: {
  progressLabel: string;
  progressPct: number;
  exitLabel: string;
  onExit: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-full border border-glass-hover bg-white/[0.03] px-3 py-1 text-sm font-medium text-muted tabular-nums">
        {progressLabel}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full bg-brand-cyan/60 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <button
        type="button"
        onClick={onExit}
        className="flex items-center gap-1 rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
      >
        <X className="h-3 w-3" />
        {exitLabel}
      </button>
    </div>
  );
}
