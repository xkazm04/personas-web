import { ArrowRight, Check } from "lucide-react";

export function FocusEmptyState({
  emptyLabel,
  exitLabel,
  onExit,
}: {
  emptyLabel: string;
  exitLabel: string;
  onExit: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-glass bg-white/[0.02] p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10">
        <Check className="h-6 w-6 text-emerald-400" />
      </div>
      <p className="mt-4 text-base font-semibold text-foreground">
        {emptyLabel}
      </p>
      <button
        type="button"
        onClick={onExit}
        className="mt-4 inline-flex items-center gap-1 rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
      >
        {exitLabel}
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
