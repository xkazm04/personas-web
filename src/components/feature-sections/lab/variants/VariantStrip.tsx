"use client";

// TODO(prototype, 2026-10-18): consolidate the Lab tab variants — throwaway A/B strip.
export type LabVariantKey = "baseline" | "instrument" | "specimen" | "broadcast";

const VARIANTS: { key: LabVariantKey; label: string; sub: string }[] = [
  { key: "baseline", label: "Baseline", sub: "current tabs" },
  { key: "instrument", label: "Instrument", sub: "bench scope + readouts" },
  { key: "specimen", label: "Specimen", sub: "organic culture / lineage" },
  { key: "broadcast", label: "Broadcast", sub: "live match coverage" },
];

export default function VariantStrip({
  active,
  onSelect,
}: {
  active: LabVariantKey;
  onSelect: (key: LabVariantKey) => void;
}) {
  return (
    <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2 stage:mt-0 stage:mb-3">
      {VARIANTS.map((v) => (
        <button
          key={v.key}
          onClick={() => onSelect(v.key)}
          aria-pressed={active === v.key}
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            active === v.key
              ? "border-brand-cyan/60 text-foreground bg-brand-cyan/10"
              : "border-glass text-muted-dark hover:border-glass-hover"
          }`}
        >
          {v.label} <span className="text-muted-dark">· {v.sub}</span>
        </button>
      ))}
    </div>
  );
}
