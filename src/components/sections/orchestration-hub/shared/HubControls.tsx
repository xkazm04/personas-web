"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { AUTO_CYCLE_MS } from "@/components/sections/orchestration-hub/data";
import type { HubPlayback } from "./useHubPlayback";

interface HubControlsProps {
  hub: HubPlayback;
  /** The active trigger's colour: the countdown ring and the toggle tint. */
  tone: string;
  className?: string;
}

const STEP =
  "flex h-10 w-10 items-center justify-center rounded-full text-muted-dark transition-colors hover:bg-[rgba(var(--surface-overlay),0.06)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60";

/**
 * The visitor-owned playback pill, upgraded from the live PlaybackControls with
 * a countdown ring around the toggle icon that drains toward the next advance
 * (CSS animation, paused while the hub is held, absent when stopped or under
 * reduced motion). The e2e contract carries over unchanged: Previous / Next
 * by aria-label, a Pause|Play toggle named by its visible text, and an
 * "n / N" indicator in its own element.
 */
export default function HubControls({ hub, tone, className = "" }: HubControlsProps) {
  const { t } = useTranslation();
  const playing = !hub.stopped;
  const ToggleIcon = playing ? Pause : Play;
  const showRing = playing && !hub.still;

  return (
    <div
      className={`flex w-fit items-center gap-1 rounded-full border border-glass-hover p-1 backdrop-blur-md ${className}`}
      style={{
        backgroundColor: "color-mix(in srgb, var(--background) 72%, transparent)",
        boxShadow: "0 10px 30px -12px rgba(var(--surface-overlay), 0.18), inset 0 1px 0 rgba(var(--surface-overlay), 0.06)",
      }}
    >
      <style href="hub-countdown" precedence="default">
        {"@keyframes hub-countdown{from{stroke-dashoffset:0}to{stroke-dashoffset:1}}"}
      </style>
      <button type="button" onClick={hub.prev} aria-label={t.orchestrationHub.previousTrigger} className={STEP}>
        <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={hub.toggle}
        className="flex h-10 items-center gap-2 rounded-full px-4 text-base font-semibold text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60"
        style={{
          backgroundColor: `color-mix(in srgb, ${tone} ${playing ? 12 : 22}%, transparent)`,
          border: `1px solid color-mix(in srgb, ${tone} 38%, transparent)`,
          transition: "background-color 400ms, border-color 400ms",
        }}
      >
        <span className="relative flex h-6 w-6 items-center justify-center" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="12" cy="12" r="10.5" fill="none" stroke={`color-mix(in srgb, ${tone} 22%, transparent)`} strokeWidth="1.5" />
            <circle
              key={`${hub.state.active}-${playing}`}
              cx="12"
              cy="12"
              r="10.5"
              fill="none"
              stroke={tone}
              strokeWidth="1.5"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              style={{
                opacity: showRing ? 1 : 0,
                animation: showRing ? `hub-countdown ${AUTO_CYCLE_MS}ms linear forwards` : "none",
                animationPlayState: hub.held ? "paused" : "running",
              }}
            />
          </svg>
          <ToggleIcon className="h-3.5 w-3.5" style={{ color: tone }} />
        </span>
        <span>{playing ? t.tour.pause : t.tour.play}</span>
      </button>
      <button type="button" onClick={hub.next} aria-label={t.orchestrationHub.nextTrigger} className={STEP}>
        <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
      </button>
      <span className="min-w-[4rem] px-2 text-center font-mono text-sm tabular-nums text-muted-dark">
        {hub.state.active + 1} / {hub.state.count}
      </span>
    </div>
  );
}
