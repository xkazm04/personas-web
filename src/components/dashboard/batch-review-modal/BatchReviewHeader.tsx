import { AlertTriangle, X } from "lucide-react";

export function BatchReviewHeader({
  title,
  subtitle,
  cancelLabel,
  onClose,
}: {
  title: string;
  subtitle: string;
  cancelLabel: string;
  onClose: () => void;
}) {
  return (
    <header className="flex items-start gap-3 border-b border-glass px-5 py-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10">
        <AlertTriangle className="h-4 w-4 text-rose-400" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 id="batch-review-title" className="text-base font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-muted-dark">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={cancelLabel}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-dark transition-colors hover:bg-white/[0.04] hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </header>
  );
}
