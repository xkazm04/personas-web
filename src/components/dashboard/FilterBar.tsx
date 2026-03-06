"use client";

interface FilterOption {
  key: string;
  label: string;
  count?: number;
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
  return (
    <div className={`flex items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm scrollbar-hide ${compact ? "p-0.5" : "p-1"}`}>
      {options.map((opt) => {
        const isActive = opt.key === active;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`relative flex items-center gap-1.5 transition-all duration-200 ${
              compact
                ? `rounded-md px-2 py-1 text-[11px] font-medium ${
                    isActive
                      ? "bg-white/[0.08] text-foreground shadow-sm"
                      : "text-muted-dark hover:text-muted hover:bg-white/[0.04]"
                  }`
                : `rounded-lg px-3 py-1.5 text-xs font-medium ${
                    isActive
                      ? "bg-white/[0.08] text-foreground shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                  }`
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-px tabular-nums ${
                  compact ? "text-[9px]" : "text-[10px]"
                } ${
                  isActive
                    ? "bg-brand-cyan/15 text-brand-cyan"
                    : "bg-white/[0.06] text-muted-dark"
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
