"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Competitor, ComparisonCategory } from "@/data/comparison";
import { CATEGORY_ACCENTS } from "@/data/comparison";
import FeatureRow from "./FeatureRow";

export default function CategoryBlock({
  category,
  activeCompetitors,
  defaultOpen,
}: {
  category: ComparisonCategory;
  activeCompetitors: Competitor[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const colCount = activeCompetitors.length + 1;
  const accent = CATEGORY_ACCENTS[category.name] ?? "#ffffff";

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 sm:px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
        style={{ backgroundImage: `linear-gradient(90deg, ${accent}0f 0%, transparent 60%)` }}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full" style={{ backgroundColor: accent }} />
          <span className="text-lg font-bold tracking-tight" style={{ color: accent }}>
            {category.name}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="pb-2">
          {category.features.map((row) => (
            <FeatureRow key={row.label} row={row} activeCompetitors={activeCompetitors} colCount={colCount} />
          ))}
        </div>
      )}
    </div>
  );
}
