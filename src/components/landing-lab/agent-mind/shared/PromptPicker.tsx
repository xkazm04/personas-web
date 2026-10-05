"use client";

import { RotateCcw } from "lucide-react";
import { ThemedChip } from "@/components/primitives";
import { BRAND_VAR } from "@/lib/brand-theme";
import { EXAMPLE_BRAND } from "./beats";
import type { MindRun } from "./useMindRun";

/**
 * The visitor-owned controls of the live section: one chip per sample prompt
 * (disabled while a run is in flight) and Reset once a run has finished. The
 * chip text is the prompt label verbatim - the guided tour clicks
 * "Triage my Gmail" by its text.
 */
export default function PromptPicker({ run, className = "" }: { run: MindRun; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      {run.examples.map((ex, i) => {
        const brand = EXAMPLE_BRAND[i % EXAMPLE_BRAND.length];
        return (
          <ThemedChip
            key={ex.label}
            brand={brand}
            active={run.activeExample === i}
            onClick={() => run.start(i)}
            disabled={run.isRunning}
            size="sm"
            className="disabled:cursor-default"
            icon={<ex.icon className="h-4 w-4" style={{ color: BRAND_VAR[brand] }} aria-hidden />}
          >
            {ex.label}
          </ThemedChip>
        );
      })}
      {run.phase === "done" && (
        <button
          type="button"
          onClick={run.reset}
          className="flex items-center gap-1.5 rounded-full border border-glass-hover px-3.5 py-1 text-base font-medium text-muted-dark transition-colors hover:border-glass-strong hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          {run.copy.reset}
        </button>
      )}
    </div>
  );
}
