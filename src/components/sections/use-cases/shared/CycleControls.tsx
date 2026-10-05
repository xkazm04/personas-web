"use client";

import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import type { CaseCycle } from "./useCaseCycle";

const STEP =
  "flex h-9 w-9 items-center justify-center rounded-full text-muted-dark transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60";

/**
 * Playback the visitor owns: Previous, Pause/Play (labelled with what a press
 * will do), Next, Replay, and the position. Every press is the visitor taking
 * control; the loop never re-arms itself after one.
 */
export default function CycleControls({ pb, count, className = "" }: { pb: CaseCycle; count: number; className?: string }) {
  const { t } = useTranslation();
  const copy = t.landingSections.useCases;
  const Toggle = pb.playing ? Pause : Play;

  return (
    <div
      role="group"
      aria-label={copy.controls}
      className={`flex w-fit items-center gap-1 rounded-full border border-glass-hover p-1 backdrop-blur-sm ${className}`}
      style={{ backgroundColor: "rgba(var(--surface-overlay), 0.04)" }}
    >
      <button type="button" onClick={pb.prev} aria-label={copy.prevCase} className={STEP}>
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={pb.toggle}
        className="flex h-9 items-center gap-1.5 rounded-full border border-brand-cyan/30 px-3.5 text-sm font-semibold text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60"
        style={{ backgroundColor: tint("cyan", pb.playing ? 10 : 18) }}
      >
        <Toggle className="h-4 w-4" style={{ color: BRAND_VAR.cyan }} aria-hidden="true" />
        <span>{pb.playing ? t.useCasesPersona.pause : t.useCasesPersona.play}</span>
      </button>
      <button type="button" onClick={pb.next} aria-label={copy.nextCase} className={STEP}>
        <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
      </button>
      <button type="button" onClick={pb.replay} aria-label={t.useCasesPersona.replay} className={STEP}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="min-w-[3.5rem] px-2 text-center text-sm tabular-nums text-muted-dark" aria-hidden="true">
        {pb.active + 1} / {count}
      </span>
    </div>
  );
}
