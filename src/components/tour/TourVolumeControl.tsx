"use client";

import { Volume1, Volume2, VolumeX } from "lucide-react";

import { useTour } from "@/contexts/TourContext";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Compact narration-volume slider for the tour overlay. Reads / writes the
 * volume state on the TourContext, which `useTourAudio` applies to the live
 * audio element in real time. Default 50%, persists via localStorage.
 */
export default function TourVolumeControl({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  const { volume, setVolume } = useTour();
  const Icon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon className="h-4 w-4 flex-shrink-0 text-muted-dark" aria-hidden="true" />
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        aria-label={t.tour.volume}
        className="h-1 w-20 cursor-pointer accent-brand-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40"
      />
    </div>
  );
}
