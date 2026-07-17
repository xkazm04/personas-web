"use client";

import { useReducedMotion } from "framer-motion";
import type { BadgeStatus } from "@/lib/types";
import { useTranslation } from "@/i18n/useTranslation";

// Colour/pulse only — the label is resolved from i18n (t.dashboardUi.status)
// so status chips localize like every other dashboard string.
const statusConfig: Record<
  BadgeStatus,
  { color: string; bgColor: string; borderColor: string; pulse?: boolean }
> = {
  queued: {
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/20",
  },
  running: {
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    pulse: true,
  },
  completed: {
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  processed: {
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  failed: {
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
  cancelled: {
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  pending: {
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  approved: {
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  rejected: {
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
};

export default function StatusBadge({ status }: { status: BadgeStatus }) {
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation();
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-medium tracking-wide ${cfg.color} ${cfg.bgColor} ${cfg.borderColor}`}
    >
      {cfg.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          {!reducedMotion && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
          )}
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </span>
      )}
      {t.dashboardUi.status[status]}
    </span>
  );
}
