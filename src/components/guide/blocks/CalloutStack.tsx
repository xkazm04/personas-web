"use client";

import { type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

interface StackItem {
  type: string;
  node: ReactNode;
}

interface CalloutStackProps {
  items: StackItem[];
}

const STACK_STYLES: Record<
  string,
  { icon: LucideIcon; iconColor: string; railColor: string; label: string }
> = {
  tip: {
    icon: Lightbulb,
    iconColor: "text-brand-cyan",
    railColor: "bg-brand-cyan/60",
    label: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    railColor: "bg-amber-400/60",
    label: "Warning",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-400",
    railColor: "bg-blue-400/60",
    label: "Note",
  },
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    railColor: "bg-emerald-400/60",
    label: "Done",
  },
};

export function CalloutStack({ items }: CalloutStackProps) {
  if (items.length === 0) return null;
  return (
    <div className="my-5 overflow-hidden rounded-xl border border-glass bg-white/[0.02] backdrop-blur-sm">
      {items.map((item, index) => {
        const style = STACK_STYLES[item.type] ?? STACK_STYLES.info;
        const Icon = style.icon;
        return (
          <div
            key={index}
            className={`flex gap-3 px-4 py-3 ${index > 0 ? "border-t border-glass" : ""}`}
          >
            <div className="flex flex-col items-center pt-0.5">
              <Icon
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 ${style.iconColor}`}
              />
              {index < items.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mt-1 w-px flex-1 ${style.railColor}`}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`mb-0.5 text-xs font-semibold uppercase tracking-wider ${style.iconColor}`}
              >
                {style.label}
              </p>
              <div className="text-base leading-relaxed text-muted-dark">
                {item.node}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
