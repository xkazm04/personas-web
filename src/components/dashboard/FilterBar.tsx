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
}: {
  options: FilterOption[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1 backdrop-blur-sm">
      {options.map((opt) => {
        const isActive = opt.key === active;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              isActive
                ? "bg-white/[0.08] text-foreground shadow-sm"
                : "text-muted hover:text-foreground hover:bg-white/[0.04]"
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-px text-[10px] tabular-nums ${
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
