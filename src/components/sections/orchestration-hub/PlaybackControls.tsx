"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { BRAND_VAR, tint } from "@/lib/brand-theme";

interface PlaybackControlsProps {
  /** The hub is advancing on its own (or only transiently held). */
  playing: boolean;
  active: number;
  count: number;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const STEP =
  "flex h-9 w-9 items-center justify-center rounded-full text-muted-dark transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none";

/**
 * The hub's visible playback control: Previous, a Pause/Play toggle whose
 * label says what pressing it will do, Next, and the position as "n / N".
 * Every press here is the visitor taking control (see playback.ts).
 */
export default function PlaybackControls({ playing, active, count, onToggle, onPrev, onNext }: PlaybackControlsProps) {
  const { t } = useTranslation();
  const ToggleIcon = playing ? Pause : Play;

  return (
    <div
      className="mx-auto mt-4 flex w-fit items-center gap-1 rounded-full border border-glass-hover p-1"
      style={{ backgroundColor: "rgba(var(--surface-overlay), 0.03)" }}
    >
      <button type="button" onClick={onPrev} aria-label={t.orchestrationHub.previousTrigger} className={STEP}>
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:outline-none"
        style={{ backgroundColor: tint("cyan", playing ? 10 : 18), border: `1px solid ${tint("cyan", 30)}` }}
      >
        <ToggleIcon className="h-4 w-4" style={{ color: BRAND_VAR.cyan }} aria-hidden="true" />
        <span>{playing ? t.tour.pause : t.tour.play}</span>
      </button>
      <button type="button" onClick={onNext} aria-label={t.orchestrationHub.nextTrigger} className={STEP}>
        <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
      </button>
      <span className="min-w-[3.5rem] px-2 text-center text-sm tabular-nums text-muted-dark">
        {active + 1} / {count}
      </span>
    </div>
  );
}
