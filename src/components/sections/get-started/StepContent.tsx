"use client";

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import type { TourStep } from "@/data/tour";

const STEP_BG_BY_NUMBER: Record<number, { dark: string; light: string }> = {
  1: { dark: "/imgs/get-started/step1-dark.png", light: "/imgs/get-started/step1-light.png" },
  2: { dark: "/imgs/get-started/step2-dark.png", light: "/imgs/get-started/step2-light.png" },
  3: { dark: "/imgs/get-started/step3-dark.png", light: "/imgs/get-started/step3-light.png" },
  4: { dark: "/imgs/get-started/step4-dark.png", light: "/imgs/get-started/step4-light.png" },
  5: { dark: "/imgs/get-started/step5-dark.png", light: "/imgs/get-started/step5-light.png" },
};

interface StepContentProps {
  step: TourStep;
  brand: BrandKey;
  icon: LucideIcon;
  visual: ComponentType<{ brand: BrandKey }>;
}

export default function StepContent({
  step,
  brand,
  icon: StepIcon,
  visual: Visual,
}: StepContentProps) {
  const bv = BRAND_VAR[brand];
  const bg = STEP_BG_BY_NUMBER[step.number];

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] min-h-[440px]"
    >
      {/* Left: text content */}
      <div
        className="relative flex flex-col justify-center gap-5 border-b lg:border-b-0 lg:border-r p-8 sm:p-10 overflow-hidden"
        style={{ borderColor: "var(--border-glass)" }}
      >
        {bg && (
          <div className="pointer-events-none absolute inset-0">
            <img
              src={bg.dark}
              alt=""
              aria-hidden="true"
              className="hidden dark:block absolute inset-0 h-full w-full object-cover opacity-20"
            />
            <img
              src={bg.light}
              alt=""
              aria-hidden="true"
              className="block dark:hidden absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(var(--surface-overlay), 0.0) 0%, rgba(var(--surface-overlay), 0.0) 40%, var(--background) 100%)",
              }}
            />
          </div>
        )}
        <div className="relative flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: tint(brand, 18) }}
          >
            <StepIcon className="h-5 w-5" style={{ color: bv }} />
          </div>
          <div>
            <div
              className="text-base font-mono uppercase tracking-wider"
              style={{ color: bv }}
            >
              Step {step.number}{step.timeEstimate ? ` · ${step.timeEstimate}` : ""}
            </div>
            <h3 className="text-2xl font-bold text-foreground leading-tight mt-1">
              {step.title}
            </h3>
          </div>
        </div>

        <p className="relative text-base text-muted leading-relaxed italic">
          {step.subtitle}
        </p>

        <p className="relative text-base text-foreground/80 leading-relaxed">
          {step.description}
        </p>

        <ul className="relative space-y-2.5">
          {step.details.map((d) => (
            <li
              key={d}
              className="flex items-start gap-2.5 text-base text-foreground/75"
            >
              <Check className="h-4 w-4 mt-1 shrink-0" style={{ color: bv }} />
              <span className="leading-relaxed">{d}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right: animated visual */}
      <div className="p-8 sm:p-10">
        <Visual brand={brand} />
      </div>
    </motion.div>
  );
}
