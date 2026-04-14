"use client";

import type { ReactNode } from "react";
import {
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

/**
 * Callout block — :::tip / :::warning / :::info / :::success in guide markdown.
 */

const CALLOUT_STYLES: Record<
  string,
  { icon: LucideIcon; border: string; bg: string; iconColor: string; label: string }
> = {
  tip: {
    icon: Lightbulb,
    border: "border-brand-cyan/30",
    bg: "bg-brand-cyan/[0.04]",
    iconColor: "text-brand-cyan",
    label: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-400/30",
    bg: "bg-amber-400/[0.04]",
    iconColor: "text-amber-400",
    label: "Warning",
  },
  info: {
    icon: Info,
    border: "border-blue-400/30",
    bg: "bg-blue-400/[0.04]",
    iconColor: "text-blue-400",
    label: "Note",
  },
  success: {
    icon: CheckCircle2,
    border: "border-emerald-400/30",
    bg: "bg-emerald-400/[0.04]",
    iconColor: "text-emerald-400",
    label: "Done",
  },
};

interface CalloutProps {
  type: string;
  children: ReactNode;
}

export function Callout({ type, children }: CalloutProps) {
  const style = CALLOUT_STYLES[type] ?? CALLOUT_STYLES.info;
  const Icon = style.icon;
  return (
    <div
      className={`my-5 rounded-xl border ${style.border} ${style.bg} px-4 py-3.5 backdrop-blur-sm`}
    >
      <div className="flex gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconColor}`}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p
            className={`text-base font-semibold uppercase tracking-wider ${style.iconColor} mb-1.5`}
          >
            {style.label}
          </p>
          <div className="text-base leading-relaxed text-muted-dark [&>p]:mb-1.5 [&>p:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
