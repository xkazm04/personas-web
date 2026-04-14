"use client";

import { tint } from "@/lib/brand-theme";
import type { Competitor, ComparisonRow } from "@/data/comparison";
import CellValue from "./CellValue";

export default function FeatureRow({
  row,
  activeCompetitors,
  colCount,
}: {
  row: ComparisonRow;
  activeCompetitors: Competitor[];
  colCount: number;
}) {
  return (
    <div
      className="grid items-center gap-2 px-4 sm:px-6 py-3 transition-colors hover:bg-white/[0.015]"
      style={{
        gridTemplateColumns: `minmax(140px, 1.5fr) repeat(${colCount - 1}, minmax(80px, 1fr))`,
        backgroundColor: row.highlight ? tint("cyan", 3) : undefined,
      }}
    >
      <span className={`text-base ${row.highlight ? "text-foreground font-medium" : "text-muted"}`}>{row.label}</span>
      {activeCompetitors.map((comp) => (
        <div
          key={comp.id}
          className={
            comp.id === "personas"
              ? "relative before:absolute before:inset-y-[-12px] before:inset-x-[-8px] before:rounded-md before:pointer-events-none"
              : ""
          }
          style={
            comp.id === "personas"
              ? ({ ["--before-bg" as string]: tint("cyan", 3) } as React.CSSProperties)
              : undefined
          }
        >
          <CellValue value={row.values[comp.id]} />
        </div>
      ))}
    </div>
  );
}
