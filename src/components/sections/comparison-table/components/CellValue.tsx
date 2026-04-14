"use client";

import { Check, X } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";

export default function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <div className="flex items-center justify-center">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: tint("emerald", 15) }}
        >
          <Check className="h-3.5 w-3.5" style={{ color: BRAND_VAR.emerald }} />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
          <X className="h-3.5 w-3.5 text-muted" />
        </div>
      </div>
    );
  }
  return <span className="text-base text-muted text-center block leading-snug">{value}</span>;
}
