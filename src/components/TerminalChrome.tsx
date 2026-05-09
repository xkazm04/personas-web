"use client";

import { Pause, Play } from "lucide-react";
import { useSectionPauseState } from "@/hooks/useSectionPause";

interface TerminalChromeProps {
  title: string;
  status?: string;
  info?: React.ReactNode;
  className?: string;
  /**
   * When true, the pause toggle is hidden even if a SectionPauseProvider
   * is in scope. Default: false (toggle shown when context is present).
   */
  hidePauseToggle?: boolean;
}

export default function TerminalChrome({
  title,
  status = "connected",
  info,
  className = "",
  hidePauseToggle = false,
}: TerminalChromeProps) {
  const pauseState = useSectionPauseState();
  const showToggle = !hidePauseToggle && pauseState !== null;
  const isManuallyPaused = pauseState?.manualPaused ?? false;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 border-b border-glass ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <div className="h-2 w-2 rounded-full bg-brand-rose/40" />
          <div className="h-2 w-2 rounded-full bg-brand-amber/40" />
          <div className="h-2 w-2 rounded-full bg-brand-emerald/40" />
        </div>
        <span className="text-base font-mono text-foreground/70 ml-1">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {info && (
          <span className="text-base font-mono text-foreground/70">{info}</span>
        )}
        {showToggle && (
          <button
            type="button"
            onClick={pauseState!.toggleManual}
            aria-label={
              isManuallyPaused ? "Resume animation" : "Pause animation"
            }
            aria-pressed={isManuallyPaused}
            title={isManuallyPaused ? "Resume animation" : "Pause animation"}
            className={`flex h-6 items-center gap-1 rounded-md border px-1.5 text-sm font-mono transition-colors ${
              isManuallyPaused
                ? "border-brand-amber/30 bg-brand-amber/10 text-brand-amber/90 hover:bg-brand-amber/15"
                : "border-white/8 bg-white/[0.03] text-muted-dark hover:border-white/15 hover:text-muted"
            }`}
          >
            {isManuallyPaused ? (
              <Play className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Pause className="h-3 w-3" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {isManuallyPaused ? "play" : "pause"}
            </span>
          </button>
        )}
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-brand-emerald shadow-[0_0_6px_color-mix(in_srgb,var(--brand-emerald)_50%,transparent)] animate-glow-border" />
          <span className="text-base font-mono text-brand-emerald">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
