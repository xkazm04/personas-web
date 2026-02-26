"use client";

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; borderColor: string; pulse?: boolean }
> = {
  queued: {
    label: "Queued",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/20",
  },
  running: {
    label: "Running",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    pulse: true,
  },
  completed: {
    label: "Completed",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  processed: {
    label: "Processed",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  failed: {
    label: "Failed",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  pending: {
    label: "Pending",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  approved: {
    label: "Approved",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
};

const fallback = {
  label: "Unknown",
  color: "text-slate-400",
  bgColor: "bg-slate-500/10",
  borderColor: "border-slate-500/20",
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? fallback;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${cfg.color} ${cfg.bgColor} ${cfg.borderColor}`}
    >
      {cfg.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
        </span>
      )}
      {cfg.label}
    </span>
  );
}
