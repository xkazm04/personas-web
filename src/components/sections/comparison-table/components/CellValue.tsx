"use client";

import { Check, X } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";

export default function CellValue({
  value,
  featureLabel,
  competitorName,
}: {
  value: string | boolean;
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
  return <span className="text-base text-muted text-center block leading-snug">{value}</span>;
}
