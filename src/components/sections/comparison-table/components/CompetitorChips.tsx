"use client";

import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { CompetitorId } from "@/data/comparison";
import { COMPETITORS } from "@/data/comparison";

export default function CompetitorChips({
  activeIds,
  onToggle,
}: {
  activeIds: Set<CompetitorId>;
  onToggle: (id: CompetitorId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {COMPETITORS.map((comp) => {
        const active = activeIds.has(comp.id);
        const isPersonas = comp.id === "personas";

        return (
          <button
            key={comp.id}
            onClick={() => !isPersonas && onToggle(comp.id)}
            disabled={isPersonas}
            aria-pressed={isPersonas ? undefined : active}
            aria-label={isPersonas ? `${comp.name} (always shown)` : `Toggle ${comp.name} in comparison`}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-base font-medium transition-all duration-200"
            style={
              isPersonas
                ? { borderColor: tint("cyan", 30), backgroundColor: tint("cyan", 10), color: BRAND_VAR.cyan, cursor: "default" }
                : active
                  ? { borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.08)", color: "var(--foreground)" }
                  : { borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)", color: "var(--muted)" }
            }
          >
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: active || isPersonas ? comp.color : "rgba(255,255,255,0.15)" }}
            />
            {comp.name}
            {!isPersonas && <span className="text-base text-muted">{active ? "\u2713" : "+"}</span>}
          </button>
        );
      })}
    </div>
  );
}
