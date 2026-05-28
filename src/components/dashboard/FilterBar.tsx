"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface FilterOption {
  key: string;
  label: string;
  count?: number;
  pulse?: boolean;
}

export default function FilterBar({
  options,
  active,
  onChange,
  compact = false,
}: {
  options: FilterOption[];
  active: string;
  onChange: (key: string) => void;
  compact?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  // Namespace the shared layoutId per instance so the sliding pill never
  // jumps between two FilterBars that happen to mount on the same page.
  const pillId = `filter-pill-${useId()}`;
  const pillRadius = compact ? "rounded-md" : "rounded-lg";

  return (
    <div className={`flex items-center gap-1 overflow-x-auto rounded-xl border border-glass bg-white/[0.03] backdrop-blur-sm scrollbar-hide ${compact ? "p-0.5" : "p-1"}`}>
      {options.map((opt) => {
        const isActive = opt.key === active;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`relative flex items-center transition-colors duration-200 ${
              compact
                ? `px-2 py-1 text-sm font-medium ${pillRadius} ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-dark hover:text-muted hover:bg-white/[0.04]"
                  }`
                : `px-3 py-1.5 text-sm font-medium ${pillRadius} ${
                    isActive
                      ? "text-foreground"
                      : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                  }`
            }`}
          >
            {isActive &&
              (reducedMotion ? (
                <span
                  aria-hidden
                  className={`absolute inset-0 ${pillRadius} bg-white/[0.08] shadow-sm`}
                />
              ) : (
                <motion.span
                  layoutId={pillId}
                  aria-hidden
                  className={`absolute inset-0 ${pillRadius} bg-white/[0.08] shadow-sm`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              ))}
            <span className="relative z-10 flex items-center gap-1.5">
              {opt.pulse && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
              {opt.label}
              {opt.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-px text-sm tabular-nums ${
                    isActive
                      ? "bg-brand-cyan/15 text-brand-cyan"
                      : "bg-white/[0.06] text-muted-dark"
                  }`}
                >
                  {opt.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
