"use client";

import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { LAYERS } from "./shared/layers";

/**
 * The time scrubber at phone size: play/pause, a draggable, keyboard-steppable
 * range over the four stops, and each stop's name as a button under its dot.
 */
export default function PhoneScrubber({
  stage,
  playing,
  still,
  onStage,
  onToggle,
}: {
  stage: number;
  playing: boolean;
  still: boolean;
  onStage: (s: number) => void;
  onToggle: () => void;
}) {
  const v = useTranslation().t.howSections.layers.v2;
  const at = (s: number) => `${(s / 3) * 100}%`;
  const ease = still ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="flex items-start gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-label={playing ? v.pause : v.play}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-glass bg-background/70 text-foreground transition-colors hover:border-glass-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan"
      >
        {playing ? <Pause aria-hidden className="h-5 w-5" /> : <Play aria-hidden className="h-5 w-5" />}
      </button>
      <div className="relative min-w-0 flex-1 px-8">
        <div className="relative h-11">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-foreground/10" />
          <motion.div
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full"
            style={{ background: `linear-gradient(90deg, ${BRAND_VAR.emerald}, ${BRAND_VAR.cyan}, ${BRAND_VAR.purple}, ${BRAND_VAR.amber})` }}
            initial={false}
            animate={{ width: at(stage) }}
            transition={ease}
          />
          {LAYERS.map((layer, s) => (
            <span
              key={layer.id}
              aria-hidden
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{ left: at(s), borderColor: BRAND_VAR[layer.brand], background: s <= stage ? BRAND_VAR[layer.brand] : "var(--background)" }}
            />
          ))}
          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={stage}
            onChange={(e) => onStage(Number(e.target.value))}
            aria-label={v.scrubLabel}
            aria-valuetext={`${v.stops[stage].when}: ${v.stops[stage].what}`}
            className="peer absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground bg-background peer-focus-visible:ring-2 peer-focus-visible:ring-brand-cyan"
            style={{ boxShadow: `0 0 14px ${tint(LAYERS[stage].brand, 70)}` }}
            initial={false}
            animate={{ left: at(stage) }}
            transition={ease}
          />
        </div>
        <div className="relative h-8">
          {v.stops.map((stop, s) => (
            <button
              key={stop.when}
              type="button"
              onClick={() => onStage(s)}
              aria-pressed={s === stage}
              className={`absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-1 font-mono text-xs uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan ${
                s === stage ? "" : "text-muted hover:text-foreground"
              }`}
              style={{ left: at(s), color: s === stage ? BRAND_VAR[LAYERS[s].brand] : undefined }}
            >
              {stop.when}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
