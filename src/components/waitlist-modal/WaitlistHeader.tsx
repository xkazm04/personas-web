import { Users, X } from "lucide-react";

export function WaitlistHeader({
  platformLabel,
  PlatformIcon,
  count,
  comingSoon,
  peopleWaiting,
  closeLabel,
  onClose,
}: {
  platformLabel: string;
  PlatformIcon: React.ComponentType<{ className?: string }>;
  count: number | null;
  comingSoon: string;
  peopleWaiting: string;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <>
      <button onClick={onClose} aria-label={closeLabel} className="absolute right-4 top-4 rounded-lg p-2 text-muted-dark transition-colors hover:text-muted focus-ring outline-none">
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/15 ring-1 ring-brand-purple/20">
          <PlatformIcon className="h-5 w-5 text-brand-purple" />
        </div>
        <div>
          <h3 id="waitlist-modal-title" className="text-base font-semibold text-foreground">
            Personas for {platformLabel}
          </h3>
          <p className="text-sm text-muted-dark">{comingSoon}</p>
        </div>
      </div>
      {count !== null && count > 0 && (
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-glass bg-white/[0.02] px-3 py-2">
          <Users className="h-3.5 w-3.5 text-brand-cyan/60" />
          <span className="text-sm text-muted-dark">
            Join <span className="font-medium text-brand-cyan">{count}</span> {peopleWaiting} {platformLabel}
          </span>
        </div>
      )}
      <div className="mt-5 h-px bg-white/[0.04]" />
    </>
  );
}
