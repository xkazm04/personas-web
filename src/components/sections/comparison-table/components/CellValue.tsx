"use client";

import { Check, X } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { captureExceptionScrubbed } from "@/lib/sentry-pii";

const reportedMissingCells = new Set<string>();

export default function CellValue({
  value,
  featureLabel,
  competitorName,
}: {
  value: string | boolean | undefined;
  featureLabel: string;
  competitorName: string;
}) {
  if (value === true) {
    return (
      <div className="flex items-center justify-center">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: tint("emerald", 15) }}
          role="img"
          aria-label={`${competitorName}: ${featureLabel} — Included`}
        >
          <Check className="h-3.5 w-3.5" style={{ color: BRAND_VAR.emerald }} aria-hidden="true" />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex items-center justify-center">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5"
          role="img"
          aria-label={`${competitorName}: ${featureLabel} — Not included`}
        >
          <X className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
        </div>
      </div>
    );
  }
  if (typeof value === "string") {
    return <span className="text-base text-muted text-center block leading-snug">{value}</span>;
  }

  // Fallback: missing/unknown value. Render an em-dash with an a11y label so
  // the cell never collapses to a silent blank, and surface to Sentry once
  // per (competitor, feature) so the data gap is observable in production.
  const cellKey = `${competitorName}::${featureLabel}`;
  if (typeof window !== "undefined" && !reportedMissingCells.has(cellKey)) {
    reportedMissingCells.add(cellKey);
    captureExceptionScrubbed(
      new Error(`ComparisonTable: missing value for ${cellKey}`),
      { tags: { scope: "ComparisonTable", reason: "missing-cell-value" } },
    );
  }
  return (
    <span
      className="text-base text-muted text-center block leading-snug"
      role="img"
      aria-label={`${competitorName}: ${featureLabel} — No data`}
    >
      —
    </span>
  );
}
