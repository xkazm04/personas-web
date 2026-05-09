"use client";

import type { LucideIcon } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import type { TourStep } from "@/data/tour";

interface StepChipProps {
  step: TourStep;
  brand: BrandKey;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export default function StepChip({
  step,
  brand,
  icon: Icon,
  isActive,
  onClick,
}: StepChipProps) {
  const bv = BRAND_VAR[brand];
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-base font-medium transition-all ${
        isActive
          ? "border-white/20 bg-white/[0.06] text-foreground"
          : "border-glass-hover text-muted-dark hover:border-glass-strong hover:text-foreground hover:bg-white/[0.03]"
      }`}
      style={
        isActive
          ? { borderColor: tint(brand, 45), backgroundColor: tint(brand, 14) }
          : undefined
      }
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full text-base font-bold"
        style={{
          backgroundColor: isActive ? tint(brand, 28) : "rgba(var(--surface-overlay), 0.04)",
          color: isActive ? bv : "inherit",
        }}
      >
        {step.number}
      </span>
      <Icon className="h-4 w-4" style={{ color: isActive ? bv : undefined }} />
      <span className="hidden sm:inline">{step.title}</span>
    </button>
  );
}
